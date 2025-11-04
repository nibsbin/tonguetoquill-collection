/**
 * Supabase Authentication Provider
 * Implements AuthContract using Supabase Auth
 * Handles OAuth token validation and exchange with Supabase
 */

import type {
	AuthContract,
	AuthResult,
	Session,
	TokenPayload,
	User,
	UUID
} from '$lib/services/auth/types';
import { AuthError } from '$lib/services/auth/types';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
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
 */
export class SupabaseAuthProvider implements AuthContract {
	private supabase: SupabaseClient;
	private authMethod: 'email' | 'github' = 'github';

	constructor() {
		const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL || '';
		const supabasePublishableKey = publicEnv.PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

		if (!supabaseUrl || !supabasePublishableKey) {
			throw new Error('Supabase configuration missing. Check environment variables.');
		}

		// Create Supabase client
		this.supabase = createClient(supabaseUrl, supabasePublishableKey, {
			auth: {
				autoRefreshToken: false, // We handle refresh manually
				persistSession: false, // Server-side, no persistence needed
				detectSessionInUrl: false, // Server-side, no URL detection
				flowType: 'pkce' // Use PKCE flow for server-side OAuth
			}
		});
	}

	/**
	 * Get the OAuth login URL for Supabase provider
	 * Returns the Supabase hosted UI URL for authentication
	 * Supports both email magic link and GitHub OAuth
	 */
	async getLoginUrl(redirectUri: string): Promise<string> {
		if (this.authMethod === 'github') {
			// Use GitHub OAuth
			const { data, error } = await this.supabase.auth.signInWithOAuth({
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
	 * Exchange OAuth authorization code for tokens
	 * Calls Supabase API to exchange the code for access and refresh tokens
	 */
	async exchangeCodeForTokens(code: string): Promise<AuthResult> {
		try {
			const { data, error } = await this.supabase.auth.exchangeCodeForSession(code);

			if (error) {
				throw this.mapSupabaseError(error);
			}

			if (!data.session || !data.user) {
				throw new AuthError('invalid_token', 'Failed to get session from code', 401);
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
	 * Validate JWT token and return payload
	 * Verifies the token signature using Supabase's JWT secret
	 */
	async validateToken(token: string): Promise<TokenPayload> {
		try {
			// Supabase automatically validates JWT signature using JWKS
			const { data, error } = await this.supabase.auth.getUser(token);

			if (error) {
				throw this.mapSupabaseError(error);
			}

			if (!data.user) {
				throw new AuthError('invalid_token', 'Token validation failed', 401);
			}

			// Extract payload information
			// Note: Supabase has already verified the signature
			const payload: TokenPayload = {
				sub: data.user.id,
				email: data.user.email || '',
				exp: Math.floor(Date.now() / 1000) + 900, // Estimated, library handles actual validation
				iat: Math.floor(Date.now() / 1000),
				role: 'authenticated',
				aud: 'authenticated'
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
			const { error } = await this.supabase.auth.signOut();

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
			const { data, error } = await this.supabase.auth.refreshSession({
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
			const { data, error } = await this.supabase.auth.getUser(accessToken);

			if (error || !data.user) {
				return null;
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
}
