/**
 * Authentication Service Provider Factory
 * Creates auth service instances based on environment configuration
 */

import type { AuthContract } from '$lib/services/auth/types';
import { MockAuthProvider } from './auth-mock-provider';
import { SupabaseAuthProvider } from './auth-supabase-provider';
import { env } from '$env/dynamic/private';

let cachedProvider: AuthContract | null = null;

/**
 * Create authentication service based on environment
 */
export async function createAuthService(): Promise<AuthContract> {
	const useMocks = env.USE_AUTH_MOCKS === 'true';

	if (useMocks) {
		return await MockAuthProvider.create();
	}

	// Phase 10+: Use Supabase provider
	return new SupabaseAuthProvider();
}

/**
 * Get authentication service instance (lazy-loaded singleton)
 */
export async function getAuthService(): Promise<AuthContract> {
	if (!cachedProvider) {
		cachedProvider = await createAuthService();
	}
	return cachedProvider;
}
