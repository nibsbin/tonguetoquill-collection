/**
 * Login Client
 * Client-side service for authentication operations
 * Communicates with API routes via fetch()
 */

import type { User, Session } from './types';

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
	 * @deprecated Use initiateGitHubLogin or initiateEmailLogin instead
	 */
	async initiateLogin(): Promise<void> {
		// Default to GitHub login for backwards compatibility
		await this.initiateGitHubLogin();
	}

	/**
	 * Initiate GitHub OAuth login
	 * Redirects to GitHub for authentication
	 */
	async initiateGitHubLogin(): Promise<void> {
		window.location.href = '/api/auth/login/github';
	}

	/**
	 * Initiate email magic link login
	 * Sends a magic link to the user's email
	 */
	async initiateEmailLogin(email: string): Promise<{ success: boolean; message: string }> {
		const response = await fetch('/api/auth/login/email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email })
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || 'Failed to send magic link');
		}

		return data;
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
