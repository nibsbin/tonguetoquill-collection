/**
 * Document Service Provider Factory
 * Creates document service instances based on environment configuration
 */

import type { DocumentServiceContract } from '$lib/services/documents/types';
import { MockDocumentService } from './document-mock-service';

let cachedService: DocumentServiceContract | null = null;

import { USE_DB_MOCKS } from '$env/static/private';
/**
 * Create document service based on environment
 */
export function createDocumentService(): DocumentServiceContract {
	const useMocks = USE_DB_MOCKS === 'true';

	if (useMocks) {
		return new MockDocumentService();
	}

	// TODO: Phase 10 - Implement SupabaseDocumentService
	throw new Error('Real Supabase document service not yet implemented. Set USE_DB_MOCKS=true');
}

/**
 * Get document service instance (lazy-loaded singleton)
 */
export function getDocumentService(): DocumentServiceContract {
	if (!cachedService) {
		cachedService = createDocumentService();
	}
	return cachedService;
}

// Export as documentService for backwards compatibility
export const documentService = {
	get createDocument() {
		return getDocumentService().createDocument.bind(getDocumentService());
	},
	get getDocumentMetadata() {
		return getDocumentService().getDocumentMetadata.bind(getDocumentService());
	},
	get getDocumentContent() {
		return getDocumentService().getDocumentContent.bind(getDocumentService());
	},
	get updateDocumentContent() {
		return getDocumentService().updateDocumentContent.bind(getDocumentService());
	},
	get updateDocumentName() {
		return getDocumentService().updateDocumentName.bind(getDocumentService());
	},
	get deleteDocument() {
		return getDocumentService().deleteDocument.bind(getDocumentService());
	},
	get listUserDocuments() {
		return getDocumentService().listUserDocuments.bind(getDocumentService());
	}
};
