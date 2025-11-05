/**
 * Document Service Types and Contracts
 * Defines interfaces for document service providers (mock and real)
 */

import type { UUID } from '../auth/types';

// Re-export UUID for convenience
export type { UUID };

/**
 * Document interface representing a full document with content
 */
export interface Document {
	id: UUID;
	owner_id: UUID;
	name: string;
	content: string;
	content_size_bytes: number;
	created_at: string; // ISO 8601 timestamp
	updated_at: string; // ISO 8601 timestamp
}

/**
 * Document metadata (without content field for performance)
 */
export interface DocumentMetadata {
	id: UUID;
	owner_id: UUID;
	name: string;
	content_size_bytes: number;
	created_at: string;
	updated_at: string;
}

/**
 * Document list result with pagination
 */
export interface DocumentListResult {
	documents: DocumentMetadata[];
	total: number;
	limit: number;
	offset: number;
}

/**
 * Document error codes
 */
export type DocumentErrorCode =
	| 'not_found'
	| 'unauthorized'
	| 'invalid_name'
	| 'content_too_large'
	| 'validation_error'
	| 'unknown_error';

/**
 * Document error class
 */
export class DocumentError extends Error {
	code: DocumentErrorCode;
	statusCode: number;

	constructor(code: DocumentErrorCode, message: string, statusCode: number = 400) {
		super(message);
		this.name = 'DocumentError';
		this.code = code;
		this.statusCode = statusCode;
	}
}

/**
 * Create document parameters
 */
export interface CreateDocumentParams {
	owner_id: UUID;
	name: string;
	content: string;
}

/**
 * Update content parameters
 */
export interface UpdateContentParams {
	user_id: UUID;
	document_id: UUID;
	content: string;
}

/**
 * Update name parameters
 */
export interface UpdateNameParams {
	user_id: UUID;
	document_id: UUID;
	name: string;
}

/**
 * List documents parameters
 */
export interface ListDocumentsParams {
	user_id: UUID;
	limit?: number;
	offset?: number;
}

/**
 * Document identity parameters
 */
export interface DocumentReferenceParams {
	user_id: UUID;
	document_id: UUID;
}

/**
 * Document service contract interface
 * All document service providers (mock and real) must implement this interface
 */
export interface DocumentServiceContract {
	/**
	 * Create a new document
	 */
	createDocument(params: CreateDocumentParams): Promise<Document>;

	/**
	 * Get document metadata only (no content)
	 */
	getDocumentMetadata(params: DocumentReferenceParams): Promise<DocumentMetadata>;

	/**
	 * Get full document with content
	 */
	getDocumentContent(params: DocumentReferenceParams): Promise<Document>;

	/**
	 * Update document content
	 */
	updateDocumentContent(params: UpdateContentParams): Promise<Document>;

	/**
	 * Update document name
	 */
	updateDocumentName(params: UpdateNameParams): Promise<DocumentMetadata>;

	/**
	 * Delete a document
	 */
	deleteDocument(params: DocumentReferenceParams): Promise<void>;

	/**
	 * List user's documents with pagination
	 */
	listUserDocuments(params: ListDocumentsParams): Promise<DocumentListResult>;
}
