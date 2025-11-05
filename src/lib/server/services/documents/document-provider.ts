/**
 * Document Service Provider Factory
 * Creates document service instances based on environment configuration
 */

import type { DocumentServiceContract } from '$lib/services/documents/types';
import { MockDocumentService } from './document-mock-service';
import { SupabaseDocumentService } from './document-supabase-service';
import { env } from '$env/dynamic/private';

let cachedService: DocumentServiceContract | null = null;

/**
 * Create document service based on environment
 */
export async function createDocumentService(): Promise<DocumentServiceContract> {
	const useMocks = env.USE_DB_MOCKS === 'true';

	if (useMocks) {
		return new MockDocumentService();
	}

	// Real Supabase implementation
	return new SupabaseDocumentService();
}

/**
 * Get document service instance (lazy-loaded singleton)
 */
export async function getDocumentService(): Promise<DocumentServiceContract> {
	if (!cachedService) {
		cachedService = await createDocumentService();
	}
	return cachedService;
}

// Export as documentService for backwards compatibility
export const documentService = {
	async createDocument(params: { user_id: string; name: string; content: string }) {
		const service = await getDocumentService();
		return service.createDocument({
			owner_id: params.user_id,
			name: params.name,
			content: params.content
		});
	},
	async getDocumentMetadata(params: { user_id: string; document_id: string }) {
		const service = await getDocumentService();
		return service.getDocumentMetadata(params);
	},
	async getDocumentContent(params: { user_id: string; document_id: string }) {
		const service = await getDocumentService();
		return service.getDocumentContent(params);
	},
	async updateDocumentContent(params: { user_id: string; document_id: string; content: string }) {
		const service = await getDocumentService();
		return service.updateDocumentContent(params);
	},
	async updateDocumentName(params: { user_id: string; document_id: string; name: string }) {
		const service = await getDocumentService();
		return service.updateDocumentName(params);
	},
	async deleteDocument(params: { user_id: string; document_id: string }) {
		const service = await getDocumentService();
		return service.deleteDocument(params);
	},
	async listUserDocuments(params: { user_id: string; limit?: number; offset?: number }) {
		const service = await getDocumentService();
		return service.listUserDocuments(params);
	}
};
