/**
 * Authentication Provider Factory
 * Creates auth provider instances based on environment configuration
 */

import type { AuthContract } from './types';
import { MockAuthProvider } from './mock-provider';

let cachedProvider: AuthContract | null = null;

/**
 * Create authentication provider based on environment
 */
export function createAuthProvider(): AuthContract {
	const useMocks = process.env.USE_AUTH_MOCKS === 'true';

	if (useMocks) {
		return new MockAuthProvider(process.env.MOCK_JWT_SECRET);
	}

	// TODO: Phase 10 - Implement SupabaseAuthProvider
	throw new Error('Real Supabase auth provider not yet implemented. Set USE_AUTH_MOCKS=true');
}

/**
 * Get authentication provider instance (lazy-loaded singleton)
 */
export function getAuthProvider(): AuthContract {
	if (!cachedProvider) {
		cachedProvider = createAuthProvider();
	}
	return cachedProvider;
}

// Export as authProvider for backwards compatibility
export const authProvider = {
	get signUp() {
		return getAuthProvider().signUp.bind(getAuthProvider());
	},
	get signIn() {
		return getAuthProvider().signIn.bind(getAuthProvider());
	},
	get signOut() {
		return getAuthProvider().signOut.bind(getAuthProvider());
	},
	get refreshSession() {
		return getAuthProvider().refreshSession.bind(getAuthProvider());
	},
	get getCurrentUser() {
		return getAuthProvider().getCurrentUser.bind(getAuthProvider());
	},
	get resetPassword() {
		return getAuthProvider().resetPassword.bind(getAuthProvider());
	},
	get verifyEmail() {
		return getAuthProvider().verifyEmail.bind(getAuthProvider());
	},
	get validateToken() {
		return getAuthProvider().validateToken.bind(getAuthProvider());
	}
};
