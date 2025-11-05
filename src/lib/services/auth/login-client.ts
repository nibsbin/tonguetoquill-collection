/**
 * Login Client
 * Client-side service for authentication operations
 * Communicates with API routes via fetch()
 */

import type { User, Session, AuthProvider, AuthProviderConfig } from './types';

/**
 * Error response from API
 */
interface ErrorResponse {
	error: string;
	message: string;
}

/**
 * Login Client
 * Provides methods for login/logout/session management
 */
export class LoginClient {
	/**
	 * Get available authentication providers for UI display
	 * Returns hard-coded provider configurations based on enabled auth methods
	 *
	 * Note: With the simplified contract, only OAuth providers (GitHub) are supported.
	 * Email auth requires OTP/magic link flow which is not yet implemented.
	 */
	getAvailableProviders(): AuthProviderConfig[] {
		// Only return OAuth providers that work with the simplified getLoginUrl() contract
		return [
			{
				id: 'github',
				type: 'oauth',
				name: 'Continue with GitHub',
				oauthProvider: 'github',
				icon: 'github',
				requiresInput: false
			}
			// Email auth is disabled for now - requires OTP flow implementation
			// {
			// 	id: 'email',
			// 	type: 'oauth',
			// 	name: 'Continue with Email',
			// 	icon: 'mail',
			// 	requiresInput: false
			// }
		];
	}

	/**
	 * Initiate login by redirecting to auth provider
	 * In mock mode, this redirects to a callback with a mock code
	 * In production, this redirects to the provider's hosted login page
	 *
	 * The OAuth callback is handled server-side via GET /api/auth/callback
	 * which exchanges the code for tokens and sets HTTP-only cookies
	 *
	 * @param provider - Auth provider to use ('email' | 'github')
	 */
	async initiateLogin(provider: AuthProvider): Promise<void> {
		// Build the login URL with provider parameter
		const url = `/api/auth/login?provider=${provider}`;

		// Redirect to login endpoint which will handle the OAuth flow
		window.location.href = url;
	}

	/**
	 * Sign out the current user
	 */
	async signOut(): Promise<void> {
		const response = await fetch('/api/auth/logout', {
			method: 'POST'
		});

		if (!response.ok) {
			const error: ErrorResponse = await response.json();
			throw new Error(error.message || 'Failed to sign out');
		}
	}

	/**
	 * Get the current authenticated user
	 */
	async getCurrentUser(): Promise<User | null> {
		const response = await fetch('/api/auth/me', {
			method: 'GET'
		});

		if (response.status === 401) {
			// Not authenticated
			return null;
		}

		if (!response.ok) {
			const error: ErrorResponse = await response.json();
			throw new Error(error.message || 'Failed to get current user');
		}

		const data = await response.json();
		return data.user;
	}

	/**
	 * Check if user is authenticated
	 */
	async isAuthenticated(): Promise<boolean> {
		const user = await this.getCurrentUser();
		return user !== null;
	}

	/**
	 * Get current session (if authenticated)
	 */
	async getSession(): Promise<Session | null> {
		const response = await fetch('/api/auth/me', {
			method: 'GET'
		});

		if (response.status === 401) {
			// Not authenticated
			return null;
		}

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		// Note: API returns partial session info (no tokens in response for security)
		// Full session is in HTTP-only cookies
		return {
			access_token: '', // Not exposed to client
			refresh_token: '', // Not exposed to client
			expires_at: data.session?.expires_at || 0,
			user: data.user
		};
	}
}

/**
 * Singleton instance for login client
 */
export const loginClient = new LoginClient();
