/**
 * Login Client
 * Client-side service for authentication operations
 * Communicates with API routes via fetch()
 */

import type { User, Session, AuthProvider } from './types';

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
	 * Initiate login by redirecting to auth provider
	 * In mock mode, this redirects to a callback with a mock code
	 * In production, this redirects to the provider's hosted login page
	 *
	 * The OAuth callback is handled server-side via GET /api/auth/callback
	 * which exchanges the code for tokens and sets HTTP-only cookies
	 *
	 * @param provider - Optional auth provider to use ('email' | 'github')
	 *                   Required only when multiple providers are enabled
	 *                   If not specified and only one provider is enabled, auto-selects it
	 */
	async initiateLogin(provider?: AuthProvider): Promise<void> {
		// Build the login URL with optional provider parameter
		const url = provider ? `/api/auth/login?provider=${provider}` : '/api/auth/login';

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
