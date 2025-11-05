/**
 * Login Client
 * Client-side service for authentication operations
 * Communicates with API routes via fetch()
 */

import type { User, Session, AuthProviderConfig } from './types';

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
	 * Get available authentication providers
	 * Fetches the list of auth methods from the server
	 */
	async getAvailableProviders(): Promise<AuthProviderConfig[]> {
		const response = await fetch('/api/auth/providers');

		if (!response.ok) {
			throw new Error('Failed to fetch authentication providers');
		}

		const data = await response.json();
		return data.providers;
	}

	/**
	 * Initiate authentication with a specific provider
	 * @param providerId - The provider ID (e.g., 'github', 'email', 'mock')
	 * @param data - Optional data (e.g., { email: 'user@example.com' } for email auth)
	 */
	async initiateAuth(
		providerId: string,
		data?: Record<string, string>
	): Promise<{ url?: string; message?: string }> {
		const response = await fetch('/api/auth/initiate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ providerId, data })
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.message || 'Failed to initiate authentication');
		}

		// If URL is returned (OAuth), redirect to it
		if (result.url) {
			window.location.href = result.url;
		}

		return result;
	}

	/**
	 * Initiate login by redirecting to auth provider
	 * @deprecated Use initiateAuth() with a specific provider ID instead
	 */
	async initiateLogin(): Promise<void> {
		// Fetch providers and use the first one for backwards compatibility
		const providers = await this.getAvailableProviders();
		if (providers.length > 0) {
			await this.initiateAuth(providers[0].id);
		}
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
