/**
 * Authentication Service Provider Factory
 * Creates auth service instances based on environment configuration
 */

import type { AuthContract } from '$lib/services/auth/types';
import { MockAuthProvider } from './auth-mock-provider';

let cachedProvider: AuthContract | null = null;

/**
 * Create authentication service based on environment
 */
export function createAuthService(): AuthContract {
	const useMocks = process.env.USE_AUTH_MOCKS === 'true';

	if (useMocks) {
		return new MockAuthProvider(process.env.MOCK_JWT_SECRET);
	}

	// TODO: Phase 10 - Implement SupabaseAuthProvider
	throw new Error('Real Supabase auth provider not yet implemented. Set USE_AUTH_MOCKS=true');
}

/**
 * Get authentication service instance (lazy-loaded singleton)
 */
export function getAuthService(): AuthContract {
	if (!cachedProvider) {
		cachedProvider = createAuthService();
	}
	return cachedProvider;
}
