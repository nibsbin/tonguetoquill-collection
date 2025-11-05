/**
 * API Document Service
 * Implements DocumentServiceContract by making HTTP requests to the document API
 * Used for authenticated users to interact with server-side storage
 */

import type {
	CreateDocumentParams,
	Document,
	DocumentListResult,
	DocumentMetadata,
	DocumentReferenceParams,
	DocumentServiceContract,
	ListDocumentsParams,
	UpdateContentParams,
	UpdateNameParams
} from './types';

/**
 * API Document Service
 * Wraps fetch calls to /api/documents endpoints
 */
export class APIDocumentService implements DocumentServiceContract {
	/**
	 * Create a new document
	 */
	async createDocument(params: CreateDocumentParams): Promise<Document> {
		const { name, content } = params;

		const response = await fetch('/api/documents', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, content })
		});

		if (!response.ok) {
			throw new Error('Failed to create document');
		}

		const data = await response.json();

		// API returns {metadata: Document} or just Document
		const document = data.metadata ?? data;

		// Ensure it has content field (createDocument should return full Document)
		return {
			id: document.id,
			owner_id: document.owner_id,
			name: document.name,
			content: document.content ?? content, // Use provided content if not in response
			content_size_bytes: document.content_size_bytes,
			created_at: document.created_at,
			updated_at: document.updated_at
		};
	}

	/**
	 * Get document metadata only (no content)
	 */
	async getDocumentMetadata(params: DocumentReferenceParams): Promise<DocumentMetadata> {
		const { document_id } = params;

		// Fetch full document and strip content
		// TODO: In future, could add ?select=metadata query param to API
		const document = await this.getDocumentContent(params);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { content: _, ...metadata } = document;
		return metadata;
	}

	/**
	 * Get full document with content
	 */
	async getDocumentContent(params: DocumentReferenceParams): Promise<Document> {
		const { document_id } = params;

		const response = await fetch(`/api/documents/${document_id}`);

		if (!response.ok) {
			throw new Error('Failed to fetch document');
		}

		const data = await response.json();

		// API returns {document: Document} or just Document
		const document = data.document ?? data;

		return {
			id: document.id,
			owner_id: document.owner_id,
			name: document.name,
			content: document.content,
			content_size_bytes: document.content_size_bytes,
			created_at: document.created_at,
			updated_at: document.updated_at
		};
	}

	/**
	 * Update document content
	 */
	async updateDocumentContent(params: UpdateContentParams): Promise<Document> {
		const { document_id, content } = params;

		const response = await fetch(`/api/documents/${document_id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content })
		});

		if (!response.ok) {
			throw new Error('Failed to update document');
		}

		const data = await response.json();

		// API returns {document: Document} or partial update info
		const document = data.document ?? data;

		// Construct complete Document
		// If API doesn't return full document, we need to fetch it
		if (!document.content) {
			// API returned metadata only, fetch full document
			return await this.getDocumentContent({ document_id, user_id: params.user_id });
		}

		return {
			id: document.id,
			owner_id: document.owner_id,
			name: document.name,
			content: document.content,
			content_size_bytes: document.content_size_bytes ?? document.content_size_bytes,
			created_at: document.created_at,
			updated_at: document.updated_at ?? document.updated_at
		};
	}

	/**
	 * Update document name
	 */
	async updateDocumentName(params: UpdateNameParams): Promise<DocumentMetadata> {
		const { document_id, name } = params;

		const response = await fetch(`/api/documents/${document_id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name })
		});

		if (!response.ok) {
			throw new Error('Failed to update document');
		}

		const data = await response.json();

		// API returns {document: Document} or partial update info
		const document = data.document ?? data;

		return {
			id: document.id,
			owner_id: document.owner_id,
			name: document.name ?? name,
			content_size_bytes: document.content_size_bytes,
			created_at: document.created_at,
			updated_at: document.updated_at
		};
	}

	/**
	 * Delete a document
	 */
	async deleteDocument(params: DocumentReferenceParams): Promise<void> {
		const { document_id } = params;

		const response = await fetch(`/api/documents/${document_id}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			throw new Error('Failed to delete document');
		}
	}

	/**
	 * List user's documents with pagination
	 */
	async listUserDocuments(params: ListDocumentsParams): Promise<DocumentListResult> {
		const { limit, offset } = params;

		// Build query params
		const queryParams = new URLSearchParams();
		if (limit !== undefined) queryParams.set('limit', limit.toString());
		if (offset !== undefined) queryParams.set('offset', offset.toString());

		const url = `/api/documents${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error('Failed to fetch documents');
		}

		const data = await response.json();

		// API returns {documents: DocumentMetadata[], total?, limit?, offset?} or just documents array
		const documents = data.documents || data;
		const total = data.total ?? documents.length;
		const returnedLimit = data.limit ?? limit ?? 50;
		const returnedOffset = data.offset ?? offset ?? 0;

		return {
			documents,
			total,
			limit: returnedLimit,
			offset: returnedOffset
		};
	}
}
