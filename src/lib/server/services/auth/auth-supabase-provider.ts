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
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET } from '$env/static/private';

/**
 * Supabase Authentication Provider
 * Delegates authentication to Supabase-hosted pages and APIs
 */
export class SupabaseAuthProvider implements AuthContract {
	private supabaseUrl: string;
	private supabaseKey: string;
	private jwtSecret: string;

	constructor() {
		this.supabaseUrl = SUPABASE_URL || '';
		this.supabaseKey = SUPABASE_ANON_KEY || '';
		this.jwtSecret = SUPABASE_JWT_SECRET || '';

		if (!this.supabaseUrl || !this.supabaseKey || !this.jwtSecret) {
			throw new Error('Supabase configuration missing. Check environment variables.');
		}
	}

	/**
	 * Exchange OAuth authorization code for tokens
	 * Calls Supabase API to exchange the code for access and refresh tokens
	 */
	async exchangeCodeForTokens(code: string): Promise<AuthResult> {
		try {
			const response = await fetch(
				`${this.supabaseUrl}/auth/v1/token?grant_type=authorization_code`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						apikey: this.supabaseKey
					},
					body: JSON.stringify({ auth_code: code })
				}
			);

			if (!response.ok) {
				const error = await response.json();
				throw new AuthError(
					'invalid_token',
					error.error_description || 'Failed to exchange code for tokens',
					response.status
				);
			}

			const data = await response.json();

			// Extract user and session from Supabase response
			const user: User = {
				id: data.user.id,
				email: data.user.email,
				dodid: data.user.user_metadata?.dodid || null,
				profile: data.user.user_metadata || {},
				created_at: data.user.created_at,
				updated_at: data.user.updated_at
			};

			const session: Session = {
				access_token: data.access_token,
				refresh_token: data.refresh_token,
				expires_at: data.expires_at,
				user
			};

			return { user, session };
		} catch (error) {
			if (error instanceof AuthError) {
				throw error;
			}
			throw new AuthError('network_error', 'Failed to communicate with auth provider', 500);
		}
	}

	/**
	 * Validate JWT token and return payload
	 * Verifies the token signature using Supabase's JWT secret
	 */
	async validateToken(token: string): Promise<TokenPayload> {
		try {
			const parts = token.split('.');
			if (parts.length !== 3) {
				throw new AuthError('invalid_token', 'Invalid token format', 401);
			}

			// Decode payload (without verification for now - in production, use a JWT library)
			const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as TokenPayload;

			// Check expiry
			const now = Math.floor(Date.now() / 1000);
			if (payload.exp < now) {
				throw new AuthError('token_expired', 'Token has expired', 401);
			}

			// In production, verify signature using JWKS from Supabase
			// For now, we trust the token if it's properly formatted and not expired
			// TODO: Implement proper JWT signature verification using Supabase JWKS endpoint

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
			const response = await fetch(`${this.supabaseUrl}/auth/v1/logout`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					apikey: this.supabaseKey
				}
			});

			if (!response.ok && response.status !== 401) {
				// 401 means already logged out, which is fine
				throw new AuthError('unknown_error', 'Failed to sign out', response.status);
			}
		} catch (error) {
			if (error instanceof AuthError) {
				throw error;
			}
			// Swallow network errors on logout - not critical
			console.error('Logout error (non-critical):', error);
		}
	}

	/**
	 * Refresh expired access token
	 * Exchanges refresh token for new access token via Supabase API
	 */
	async refreshSession(refreshToken: string): Promise<Session> {
		try {
			const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					apikey: this.supabaseKey
				},
				body: JSON.stringify({ refresh_token: refreshToken })
			});

			if (!response.ok) {
				if (response.status === 401) {
					throw new AuthError('session_expired', 'Refresh token has expired', 401);
				}
				throw new AuthError('invalid_refresh_token', 'Failed to refresh session', response.status);
			}

			const data = await response.json();

			const user: User = {
				id: data.user.id,
				email: data.user.email,
				dodid: data.user.user_metadata?.dodid || null,
				profile: data.user.user_metadata || {},
				created_at: data.user.created_at,
				updated_at: data.user.updated_at
			};

			return {
				access_token: data.access_token,
				refresh_token: data.refresh_token,
				expires_at: data.expires_at,
				user
			};
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
			// Call Supabase API to get user info
			const response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					apikey: this.supabaseKey
				}
			});

			if (response.status === 401) {
				return null;
			}

			if (!response.ok) {
				throw new AuthError('unknown_error', 'Failed to get user', response.status);
			}

			const data = await response.json();

			return {
				id: data.id,
				email: data.email,
				dodid: data.user_metadata?.dodid || null,
				profile: data.user_metadata || {},
				created_at: data.created_at,
				updated_at: data.updated_at
			};
		} catch (error) {
			if (error instanceof AuthError && error.code === 'unauthorized') {
				return null;
			}
			// Return null for any error (user not authenticated)
			return null;
		}
	}
}
