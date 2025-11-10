/**
 * Login Client
 * Client-side service for authentication operations
 * Communicates with API routes via fetch()
 */

import { browser } from '$app/environment';
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
	// Stores the promise of the fetch operation
	private providersPromise: Promise<AuthProviderConfig[]>;

	// TODO: Use SSR to pre-fetch providers and pass to singleton client
	// to avoid initial fetch delay
	constructor() {
		// Only fetch providers on client-side to avoid SSR issues
		if (browser) {
			this.providersPromise = fetch('/api/auth/providers')
				.then((response) => {
					if (!response.ok) {
						// Throw an error to be caught in the next .catch()
						throw new Error('Failed to fetch providers');
					}
					return response.json();
				})
				.then((data) => {
					// Assume the API returns { providers: AuthProviderConfig[] }
					return data.providers;
				})
				.catch((error) => {
					console.error('Error fetching auth providers:', error);
					// Crucially, return an empty array on failure so the promise resolves
					return [];
				});
		} else {
			// On server, resolve to empty array immediately
			this.providersPromise = Promise.resolve([]);
		}
	}

	/**
	 * Get available authentication providers for UI display
	 */
	async getProviders(): Promise<AuthProviderConfig[]> {
		// Now, this method awaits the initial, pre-started fetch operation
		return this.providersPromise;
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
	 * Check if the is_authenticated cookie is present
	 * This is a lightweight check that avoids making API calls in guest mode
	 * @private
	 */
	private hasAuthCookie(): boolean {
		if (!browser) return false;
		return document.cookie.includes('is_authenticated=true');
	}

	/**
	 * Get the current authenticated user
	 * This method checks the is_authenticated cookie first to avoid
	 * unnecessary 401 errors when in guest mode
	 */
	async getCurrentUser(): Promise<User | null> {
		// Fast-path: if no auth cookie, user is definitely not authenticated
		if (!this.hasAuthCookie()) {
			return null;
		}

		// Auth cookie present, verify with server
		const response = await fetch('/api/auth/me', {
			method: 'GET'
		});

		if (response.status === 401) {
			// Not authenticated (token expired or invalid)
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
	 * Send authentication email with OTP code
	 * @param email - User's email address
	 * @returns Success message to display
	 */
	async sendEmailAuth(email: string): Promise<{ message: string }> {
		const response = await fetch('/api/auth/email/send', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email })
		});

		if (!response.ok) {
			const error: ErrorResponse = await response.json();
			throw new Error(error.message || 'Failed to send authentication email');
		}

		return response.json();
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
