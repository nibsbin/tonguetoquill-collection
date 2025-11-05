/**
 * Mock Document Service
 * Implements DocumentServiceContract using in-memory storage for development
 */

import { webcrypto as crypto } from 'node:crypto';
import type {
	CreateDocumentParams,
	Document,
	DocumentListResult,
	DocumentMetadata,
	DocumentServiceContract,
	ListDocumentsParams,
	UpdateContentParams,
	UpdateNameParams,
	UUID
} from '$lib/services/documents/types';
import { DocumentError } from '$lib/services/documents/types';
import { DocumentValidator } from '$lib/services/documents/document-validator';

/**
 * Mock Document Service
 * Uses in-memory Map storage for documents
 */
export class MockDocumentService implements DocumentServiceContract {
	private documents: Map<UUID, Document> = new Map();

	/**
	 * Simulate network delay for realistic testing
	 */
	private async simulateDelay(): Promise<void> {
		const delay = Math.random() * 150 + 50; // 50-200ms
		await new Promise((resolve) => setTimeout(resolve, delay));
	}

	/**
	 * Verify document ownership
	 */
	private verifyOwnership(document: Document, userId: UUID): void {
		if (document.owner_id !== userId) {
			throw new DocumentError(
				'unauthorized',
				'You do not have permission to access this document',
				403
			);
		}
	}

	/**
	 * Create a new document
	 */
	async createDocument(params: CreateDocumentParams): Promise<Document> {
		await this.simulateDelay();

		DocumentValidator.validateName(params.name);
		DocumentValidator.validateContent(params.content);

		const documentId = crypto.randomUUID();
		const now = new Date().toISOString();
		const contentSizeBytes = DocumentValidator.getByteLength(params.content);

		const document: Document = {
			id: documentId,
			owner_id: params.owner_id,
			name: params.name,
			content: params.content,
			content_size_bytes: contentSizeBytes,
			created_at: now,
			updated_at: now
		};

		this.documents.set(documentId, document);

		return document;
	}

	/**
	 * Get document metadata only (no content)
	 */
	async getDocumentMetadata(params: {
		user_id: UUID;
		document_id: UUID;
	}): Promise<DocumentMetadata> {
		await this.simulateDelay();

		const document = this.documents.get(params.document_id);

		if (!document) {
			throw new DocumentError('not_found', 'Document not found', 404);
		}

		this.verifyOwnership(document, params.user_id);

		return {
			id: document.id,
			owner_id: document.owner_id,
			name: document.name,
			content_size_bytes: document.content_size_bytes,
			created_at: document.created_at,
			updated_at: document.updated_at
		};
	}

	/**
	 * Get full document with content
	 */
	async getDocumentContent(params: { user_id: UUID; document_id: UUID }): Promise<Document> {
		await this.simulateDelay();

		const document = this.documents.get(params.document_id);

		if (!document) {
			throw new DocumentError('not_found', 'Document not found', 404);
		}

		this.verifyOwnership(document, params.user_id);

		return document;
	}

	/**
	 * Update document content
	 */
	async updateDocumentContent(params: UpdateContentParams): Promise<Document> {
		await this.simulateDelay();

		const document = this.documents.get(params.document_id);

		if (!document) {
			throw new DocumentError('not_found', 'Document not found', 404);
		}

		this.verifyOwnership(document, params.user_id);
		DocumentValidator.validateContent(params.content);

		const contentSizeBytes = DocumentValidator.getByteLength(params.content);

		document.content = params.content;
		document.content_size_bytes = contentSizeBytes;
		document.updated_at = new Date().toISOString();

		return document;
	}

	/**
	 * Update document name
	 */
	async updateDocumentName(params: UpdateNameParams): Promise<DocumentMetadata> {
		await this.simulateDelay();

		const document = this.documents.get(params.document_id);

		if (!document) {
			throw new DocumentError('not_found', 'Document not found', 404);
		}

		this.verifyOwnership(document, params.user_id);
		DocumentValidator.validateName(params.name);

		document.name = params.name;
		document.updated_at = new Date().toISOString();

		return {
			id: document.id,
			owner_id: document.owner_id,
			name: document.name,
			content_size_bytes: document.content_size_bytes,
			created_at: document.created_at,
			updated_at: document.updated_at
		};
	}

	/**
	 * Delete a document
	 */
	async deleteDocument({
		user_id: userId,
		document_id: documentId
	}: {
		user_id: UUID;
		document_id: UUID;
	}): Promise<void> {
		await this.simulateDelay();

		const document = this.documents.get(documentId);

		if (!document) {
			throw new DocumentError('not_found', 'Document not found', 404);
		}

		this.verifyOwnership(document, userId);

		this.documents.delete(documentId);
	}

	/**
	 * List user's documents with pagination
	 */
	async listUserDocuments(params: ListDocumentsParams): Promise<DocumentListResult> {
		await this.simulateDelay();

		const limit = params.limit || 50;
		const offset = params.offset || 0;

		// Filter documents by owner
		const userDocuments = Array.from(this.documents.values())
			.filter((doc) => doc.owner_id === params.user_id)
			.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

		const total = userDocuments.length;
		const paginatedDocuments = userDocuments.slice(offset, offset + limit);

		// Convert to metadata (exclude content)
		const metadata: DocumentMetadata[] = paginatedDocuments.map((doc) => ({
			id: doc.id,
			owner_id: doc.owner_id,
			name: doc.name,
			content_size_bytes: doc.content_size_bytes,
			created_at: doc.created_at,
			updated_at: doc.updated_at
		}));

		return {
			documents: metadata,
			total,
			limit,
			offset
		};
	}

	/**
	 * Helper method for testing: get all documents
	 */
	getAllDocuments(): Document[] {
		return Array.from(this.documents.values());
	}

	/**
	 * Helper method for testing: clear all data
	 */
	clearAllData(): void {
		this.documents.clear();
	}
}
