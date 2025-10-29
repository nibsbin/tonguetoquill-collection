/**
 * Document Service Provider Factory
 * Creates document service instances based on environment configuration
 */

import type { DocumentServiceContract } from './types';
import { MockDocumentService } from './mock-service';

/**
 * Create document service based on environment
 */
export function createDocumentService(): DocumentServiceContract {
	const useMocks = process.env.USE_DB_MOCKS === 'true';

	if (useMocks) {
		return new MockDocumentService();
	}

	// TODO: Phase 10 - Implement SupabaseDocumentService
	throw new Error('Real Supabase document service not yet implemented. Set USE_DB_MOCKS=true');
}

// Export singleton instance
export const documentService = createDocumentService();
