/**
 * Supabase Authentication Provider
 * Implements AuthContract using Supabase Auth
 * Handles OAuth token validation and exchange with Supabase
 */

import type {
	AuthContract,
	AuthProvider,
	AuthProviderConfig,
	AuthResult,
	Session,
	TokenPayload,
	User,
	UUID
} from '$lib/services/auth/types';
import { AuthError } from '$lib/services/auth/types';
import { loadSupabaseConfig, getAdminClient } from '$lib/server/utils/supabase';
import {
	createClient,
	type SupabaseClient,
	type AuthError as SupabaseAuthError,
	type User as SupabaseUser,
	type Session as SupabaseSession
} from '@supabase/supabase-js';

/**
 * Supabase Authentication Provider
 * Delegates authentication to Supabase-hosted pages and APIs
 * Supports both email and GitHub authentication methods simultaneously
 */
export class SupabaseAuthProvider implements AuthContract {
	private authClient: SupabaseClient; // For auth operations
	private adminClient: SupabaseClient; // For database operations (shared)
	private enableEmail: boolean;
	private enableGithub: boolean;

	constructor() {
		// Load Supabase configuration
		const config = loadSupabaseConfig();

		// Store enabled auth methods
		this.enableEmail = config.ENABLE_EMAIL;
		this.enableGithub = config.ENABLE_GITHUB;

		// Validate that at least one auth method is enabled
		if (!this.enableEmail && !this.enableGithub) {
			throw new Error(
				'No auth method enabled. Set SUPABASE_ENABLE_EMAIL or SUPABASE_ENABLE_GITHUB to true.'
			);
		}

		// Create auth-specific client for authentication operations
		this.authClient = createClient(config.POSTGRES_URL, config.SECRET_KEY, {
			auth: {
				autoRefreshToken: false, // We handle refresh manually
				persistSession: false, // Server-side, no persistence needed
				detectSessionInUrl: false, // Server-side, no URL detection
				flowType: 'pkce' // Use PKCE flow for server-side OAuth
			}
		});

		// Use shared admin client for database operations
		this.adminClient = getAdminClient();
	}

	/**
	 * Get the available authentication providers
	 */
	async getAvailableProviders(): Promise<AuthProviderConfig[]> {
		return [
			{
				id: 'github',
				type: 'oauth',
				name: 'Continue with GitHub',
				icon: 'github',
				requiresInput: false
			},
			{
				id: 'email',
				type: 'magic_link',
				name: 'Continue with Email',
				icon: 'mail',
				requiresInput: true,
				inputConfig: {
					type: 'email',
					placeholder: 'your@email.com',
					label: 'Email'
				}
			}
		];
	}

	/**
	 * Get the OAuth login URL for Supabase provider
	 * Returns the Supabase hosted UI URL for authentication
	 * Supports both email magic link and GitHub OAuth
	 * @param redirectUri - The callback URL to return to after authentication
	 * @param provider - Optional provider to use. If not specified and multiple providers are enabled, an error is thrown
	 */
	async getLoginUrl(redirectUri: string, provider?: AuthProvider): Promise<string> {
		// Determine which provider to use
		const targetProvider = this.determineProvider(provider);

		if (targetProvider === 'github') {
			// Use GitHub OAuth
			const { data, error } = await this.authClient.auth.signInWithOAuth({
				provider: 'github',
				options: {
					redirectTo: redirectUri,
					skipBrowserRedirect: true // We want the URL, not to redirect immediately
				}
			});

			if (error || !data.url) {
				throw new AuthError('network_error', 'Failed to generate GitHub login URL', 500);
			}

			return data.url;
		} else {
			// For email-based auth, we need to redirect to a login page
			// that collects the email and sends a magic link
			// Since we're using server-side flow, we'll use Supabase's built-in email OTP
			// The client will need to handle this differently
			throw new AuthError(
				'unknown_error',
				'Email-based auth requires client-side implementation with OTP',
				500
			);
		}
	}

	/**
	 * Ensure user exists in public.users table
	 * Creates the user if they don't exist (idempotent)
	 * This provides defense-in-depth against trigger failures or race conditions
	 */
	private async ensureUserExists(userId: UUID, email: string): Promise<void> {
		try {
			// Upsert user into public.users table
			// This is idempotent - if user exists, nothing happens
			const { error } = await this.adminClient.from('users').upsert(
				{
					id: userId,
					email: email,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				},
				{
					onConflict: 'id',
					ignoreDuplicates: true
				}
			);

			if (error) {
				// Log warning but don't throw if user already exists
				// Only throw for unexpected errors
				if (error.code !== '23505') {
					// Not a duplicate key error
					console.error('Failed to ensure user exists:', error);
					throw new AuthError('unknown_error', 'Failed to create user record', 500);
				}
			}
		} catch (error) {
			if (error instanceof AuthError) {
				throw error;
			}
			throw new AuthError('unknown_error', 'Failed to verify user', 500);
		}
	}

	/**
	 * Determine which provider to use based on what's enabled and what was requested
	 */
	private determineProvider(requestedProvider?: AuthProvider): AuthProvider {
		// If a specific provider was requested, validate it's enabled
		if (requestedProvider) {
			if (requestedProvider === 'email' && !this.enableEmail) {
				throw new AuthError('unknown_error', 'Email authentication is not enabled', 400);
			}
			if (requestedProvider === 'github' && !this.enableGithub) {
				throw new AuthError('unknown_error', 'GitHub authentication is not enabled', 400);
			}
			return requestedProvider;
		}

		// If both are enabled and no provider specified, require explicit choice
		if (this.enableEmail && this.enableGithub) {
			throw new AuthError(
				'unknown_error',
				'Multiple authentication providers are enabled. Please specify which provider to use.',
				400
			);
		}

		// Return the single enabled provider
		return this.enableGithub ? 'github' : 'email';
	}

	/**
	 * Exchange OAuth authorization code for tokens
	 * Calls Supabase API to exchange the code for access and refresh tokens
	 */
	async exchangeCodeForTokens(code: string): Promise<AuthResult> {
		try {
			const { data, error } = await this.authClient.auth.exchangeCodeForSession(code);

			if (error) {
				throw this.mapSupabaseError(error);
			}

			if (!data.session || !data.user) {
				throw new AuthError('invalid_token', 'Failed to get session from code', 401);
			}

			// Ensure user exists in public.users table
			// This provides defense-in-depth against trigger failures or race conditions
			const email = data.user.email;
			if (email) {
				await this.ensureUserExists(data.user.id, email);
			}

			return {
				user: this.mapSupabaseUserToUser(data.user),
				session: this.mapSupabaseSessionToSession(data.session)
			};
		} catch (error) {
			if (error instanceof AuthError) {
				throw error;
			}
			throw new AuthError('network_error', 'Failed to exchange code for tokens', 500);
		}
	}

	/**
	 * Send authentication email with magic link
	 * @param email - User's email address
	 * @param redirectUri - URL to redirect to after clicking link
	 * @returns Success message to show user
	 */
	async sendAuthEmail(email: string, redirectUri: string): Promise<{ message: string }> {
		try {
			const { error } = await this.authClient.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: redirectUri,
					shouldCreateUser: true
				}
			});

			if (error) {
				throw this.mapSupabaseError(error);
			}

			return { message: 'Check your email for a sign-in link' };
		} catch (error) {
			if (error instanceof AuthError) {
				throw error;
			}
			throw new AuthError('network_error', 'Failed to send authentication email', 500);
		}
	}

	/**
	 * Validate JWT token and return payload
	 * Verifies the token signature using Supabase's JWT secret
	 */
	async validateToken(token: string): Promise<TokenPayload> {
		try {
			// Supabase automatically validates JWT signature using JWKS
			const { data, error } = await this.authClient.auth.getUser(token);

			if (error) {
				throw this.mapSupabaseError(error);
			}

			if (!data.user) {
				throw new AuthError('invalid_token', 'Token validation failed', 401);
			}

			// Decode JWT to extract actual claims
			// Supabase has already verified the signature, so we can safely decode
			const jwtPayload = this.decodeJWT(token);

			// Extract payload information from verified token
			const payload: TokenPayload = {
				sub: data.user.id,
				email: data.user.email || '',
				exp: jwtPayload.exp,
				iat: jwtPayload.iat,
				role: jwtPayload.role || 'authenticated',
				aud: jwtPayload.aud || 'authenticated'
			};

			return payload;
		} catch (error) {
			if (error instanceof AuthError) {
				throw error;
			}
			throw new AuthError('invalid_token', 'Failed to validate token', 401);
		}
	}

	/**
	 * Invalidate session by calling Supabase logout endpoint
	 */
	async signOut(accessToken: string): Promise<void> {
		try {
			// Note: signOut doesn't require token parameter in client mode
			// For server-side, we can call the API directly or just let cookies clear
			const { error } = await this.authClient.auth.signOut();

			if (error && error.message !== 'not_authenticated') {
				// Don't throw on not_authenticated - already logged out
				console.error('Logout error (non-critical):', error);
			}
		} catch (error) {
			// Swallow errors on logout - not critical
			console.error('Logout error (non-critical):', error);
		}
	}

	/**
	 * Refresh expired access token
	 * Exchanges refresh token for new access token via Supabase API
	 */
	async refreshSession(refreshToken: string): Promise<Session> {
		try {
			const { data, error } = await this.authClient.auth.refreshSession({
				refresh_token: refreshToken
			});

			if (error) {
				if (error.message?.includes('expired')) {
					throw new AuthError('session_expired', 'Refresh token has expired', 401);
				}
				throw this.mapSupabaseError(error);
			}

			if (!data.session) {
				throw new AuthError('invalid_refresh_token', 'Failed to refresh session', 401);
			}

			return this.mapSupabaseSessionToSession(data.session);
		} catch (error) {
			if (error instanceof AuthError) {
				throw error;
			}
			throw new AuthError('network_error', 'Failed to refresh session', 500);
		}
	}

	/**
	 * Retrieve user from access token
	 * Validates token and extracts user information
	 */
	async getCurrentUser(accessToken: string): Promise<User | null> {
		try {
			const { data, error } = await this.authClient.auth.getUser(accessToken);

			if (error || !data.user) {
				return null;
			}

			// Ensure user exists in public.users table as a safety net
			// This handles cases where getCurrentUser is called directly
			const email = data.user.email;
			if (email) {
				await this.ensureUserExists(data.user.id, email);
			}

			return this.mapSupabaseUserToUser(data.user);
		} catch (error) {
			// Return null for any error (user not authenticated)
			return null;
		}
	}

	/**
	 * Map Supabase User to our User type
	 */
	private mapSupabaseUserToUser(supabaseUser: SupabaseUser): User {
		return {
			id: supabaseUser.id,
			email: supabaseUser.email || '',
			dodid: supabaseUser.user_metadata?.dodid || null,
			profile: supabaseUser.user_metadata || {},
			first_login_at: supabaseUser.user_metadata?.first_login_at || null,
			created_at: supabaseUser.created_at || new Date().toISOString(),
			updated_at: supabaseUser.updated_at || new Date().toISOString()
		};
	}

	/**
	 * Map Supabase Session to our Session type
	 */
	private mapSupabaseSessionToSession(supabaseSession: SupabaseSession): Session {
		return {
			access_token: supabaseSession.access_token,
			refresh_token: supabaseSession.refresh_token,
			expires_at: supabaseSession.expires_at || 0,
			user: this.mapSupabaseUserToUser(supabaseSession.user)
		};
	}

	/**
	 * Map Supabase errors to AuthError
	 */
	private mapSupabaseError(error: SupabaseAuthError): AuthError {
		const message = error.message || 'Unknown error';

		// Map common Supabase error codes
		if (message.includes('invalid_grant')) {
			return new AuthError('invalid_token', 'Invalid authorization code', 401);
		}
		if (message.includes('expired')) {
			return new AuthError('token_expired', 'Token has expired', 401);
		}
		if (message.includes('not_authenticated')) {
			return new AuthError('unauthorized', 'Not authenticated', 401);
		}

		return new AuthError('unknown_error', message, 500);
	}

	/**
	 * Decode JWT payload without verification
	 * Note: This is safe because Supabase has already verified the signature
	 */
	private decodeJWT(token: string): any {
		const parts = token.split('.');
		if (parts.length !== 3) {
			throw new AuthError('invalid_token', 'Invalid token format', 401);
		}

		try {
			// Decode the payload (second part) from base64url
			const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
			return payload;
		} catch (error) {
			throw new AuthError('invalid_token', 'Failed to decode token payload', 401);
		}
	}

	/**
	 * Mark user's first login as completed
	 * Used by the user service for first login actions
	 */
	async markFirstLoginCompleted(userId: UUID): Promise<void> {
		try {
			// Update user metadata with first_login_at timestamp
			const { error } = await this.authClient.auth.admin.updateUserById(userId, {
				user_metadata: {
					first_login_at: new Date().toISOString()
				}
			});

			if (error) {
				throw this.mapSupabaseError(error);
			}
		} catch (error) {
			if (error instanceof AuthError) {
				throw error;
			}
			throw new AuthError('network_error', 'Failed to mark first login completed', 500);
		}
	}
}
