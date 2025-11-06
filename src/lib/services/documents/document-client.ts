/**
 * Document Client Service
 * Centralizes all document-related communication for client-side code
 * Uses dependency injection to work with any DocumentServiceContract implementation
 */

import type { DocumentMetadata, DocumentServiceContract } from './types';
import { DocumentBrowserStorage } from './document-browser-storage';
import { APIDocumentService } from './api-document-service';

/**
 * Document Client
 * Provides a unified interface for document operations via dependency injection
 * Delegates all operations to an injected DocumentServiceContract implementation
 */
export class DocumentClient {
	constructor(
		private service: DocumentServiceContract,
		private userId: string
	) {}

	/**
	 * List all documents for the current user
	 */
	async listDocuments(): Promise<DocumentMetadata[]> {
		const result = await this.service.listUserDocuments({
			user_id: this.userId
		});
		return result.documents;
	}

	/**
	 * Get a document with its content
	 */
	async getDocument(id: string): Promise<{ id: string; content: string; name: string }> {
		const doc = await this.service.getDocumentContent({
			user_id: this.userId,
			document_id: id
		});

		return {
			id: doc.id,
			name: doc.name,
			content: doc.content
		};
	}

	/**
	 * Create a new document
	 */
	async createDocument(name: string, content: string = ''): Promise<DocumentMetadata> {
		const doc = await this.service.createDocument({
			owner_id: this.userId,
			name,
			content
		});

		// Return metadata (exclude content)
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { content: _, ...metadata } = doc;
		return metadata;
	}

	/**
	 * Update document content and/or name
	 */
	async updateDocument(
		id: string,
		updates: { content?: string; name?: string }
	): Promise<{ content_size_bytes?: number; updated_at?: string }> {
		let result: { content_size_bytes?: number; updated_at?: string } = {};

		// Update content if provided
		if (updates.content !== undefined) {
			const doc = await this.service.updateDocumentContent({
				user_id: this.userId,
				document_id: id,
				content: updates.content
			});
			result = {
				content_size_bytes: doc.content_size_bytes,
				updated_at: doc.updated_at
			};
		}

		// Update name if provided
		if (updates.name !== undefined) {
			const metadata = await this.service.updateDocumentName({
				user_id: this.userId,
				document_id: id,
				name: updates.name
			});
			result = {
				...result,
				content_size_bytes: metadata.content_size_bytes,
				updated_at: metadata.updated_at
			};
		}

		return result;
	}

	/**
	 * Delete a document
	 */
	async deleteDocument(id: string): Promise<void> {
		await this.service.deleteDocument({
			user_id: this.userId,
			document_id: id
		});
	}
}

/**
 * Create a document client instance
 * Factory function that selects the appropriate service based on guest mode
 */
export function createDocumentClient(isGuest: boolean, userId: string = 'guest'): DocumentClient {
	const service = isGuest ? new DocumentBrowserStorage() : new APIDocumentService();

	return new DocumentClient(service, userId);
}
