/**
 * Authentication Service Provider Factory
 * Creates auth service instances based on environment configuration
 */

import type { AuthContract } from '$lib/services/auth/types';
import { MockAuthProvider } from './auth-mock-provider';
import { SupabaseAuthProvider } from './auth-supabase-provider';

let cachedProvider: AuthContract | null = null;

/**
 * Create authentication service based on environment
 */
export function createAuthService(): AuthContract {
	// Use process.env directly to avoid SvelteKit type errors for optional variables
	const useMocks = process.env.USE_AUTH_MOCKS === 'true';
	const mockSecret = process.env.MOCK_JWT_SECRET || 'dev-secret-key';

	if (useMocks) {
		return new MockAuthProvider(mockSecret);
	}

	// Phase 10+: Use Supabase provider
	return new SupabaseAuthProvider();
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
