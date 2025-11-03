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
