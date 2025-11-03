/**
 * Authentication Service Provider Factory
 * Creates auth service instances based on environment configuration
 */

import type { AuthContract } from '$lib/services/auth/types';
import { MockAuthProvider } from './auth-mock-provider';
import { SupabaseAuthProvider } from './auth-supabase-provider';
import { USE_AUTH_MOCKS, MOCK_JWT_SECRET } from '$env/static/private';

let cachedProvider: AuthContract | null = null;

/**
 * Create authentication service based on environment
 */
export function createAuthService(): AuthContract {
	const useMocks = USE_AUTH_MOCKS === 'true';
	const mockSecret = MOCK_JWT_SECRET || 'dev-secret-key';

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
