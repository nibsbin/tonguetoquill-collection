/**
 * Authentication Provider Factory
 * Creates auth provider instances based on environment configuration
 */

import type { AuthContract } from './types';
import { MockAuthProvider } from './mock-provider';

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

// Export singleton instance
export const authProvider = createAuthProvider();
