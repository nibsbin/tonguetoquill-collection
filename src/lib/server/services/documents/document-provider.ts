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
	async createDocument(userId: string, name: string, content: string) {
		const service = await getDocumentService();
		return service.createDocument(userId, name, content);
	},
	async getDocumentMetadata(userId: string, documentId: string) {
		const service = await getDocumentService();
		return service.getDocumentMetadata(userId, documentId);
	},
	async getDocumentContent(userId: string, documentId: string) {
		const service = await getDocumentService();
		return service.getDocumentContent(userId, documentId);
	},
	async updateDocumentContent(userId: string, documentId: string, content: string) {
		const service = await getDocumentService();
		return service.updateDocumentContent(userId, documentId, content);
	},
	async updateDocumentName(userId: string, documentId: string, name: string) {
		const service = await getDocumentService();
		return service.updateDocumentName(userId, documentId, name);
	},
	async deleteDocument(userId: string, documentId: string) {
		const service = await getDocumentService();
		return service.deleteDocument(userId, documentId);
	},
	async listUserDocuments(userId: string) {
		const service = await getDocumentService();
		return service.listUserDocuments(userId);
	}
};
