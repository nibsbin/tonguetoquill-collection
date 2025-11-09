/**
 * Supabase Document Service
 * Implements DocumentServiceContract using Supabase PostgreSQL database
 */

import { getAdminClient } from '$lib/server/utils/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	CreateDocumentParams,
	DocumentReferenceParams,
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
 * Supabase Document Service
 * Uses Supabase PostgreSQL database for document storage
 */
export class SupabaseDocumentService implements DocumentServiceContract {
	private supabase: SupabaseClient;

	// Constants
	private readonly PGRST_NO_ROWS_ERROR = 'PGRST116'; // PostgREST error code for no rows

	constructor() {
		// Use shared admin client for all database operations
		// This client uses service role key to bypass RLS
		this.supabase = getAdminClient();
	}

	/**
	 * Map database error to DocumentError
	 */
	private mapDatabaseError(error: any): DocumentError {
		const message = error?.message || 'Database error';

		// Check for specific error patterns
		if (message.includes('check_content_size')) {
			return new DocumentError('content_too_large', 'Content exceeds size limit', 413);
		}

		if (error?.code === '23505') {
			// Unique constraint violation
			return new DocumentError('validation_error', 'Duplicate entry', 400);
		}

		if (error?.code === this.PGRST_NO_ROWS_ERROR || message.includes('no rows')) {
			// PostgREST error for no rows returned
			return new DocumentError('not_found', 'Document not found', 404);
		}

		// Default to unknown error
		return new DocumentError('unknown_error', message, 500);
	}

	/**
	 * Create a new document
	 */
	async createDocument(params: CreateDocumentParams): Promise<Document> {
		const { owner_id, name, content } = params;

		// Validate inputs
		DocumentValidator.validateName(name);
		DocumentValidator.validateContent(content);

		// Calculate size
		const content_size_bytes = DocumentValidator.getByteLength(content);

		try {
			// Insert document
			const { data, error } = await this.supabase
				.from('documents')
				.insert({
					owner_id,
					name,
					content,
					content_size_bytes
				})
				.select()
				.single();

			if (error) throw error;
			if (!data) throw new Error('No data returned from insert');

			return data as Document;
		} catch (error) {
			throw this.mapDatabaseError(error);
		}
	}

	/**
	 * Get document metadata only (no content)
	 */
	async getDocumentMetadata({
		user_id,
		document_id
	}: {
		user_id: UUID;
		document_id: UUID;
	}): Promise<DocumentMetadata> {
		try {
			const { data, error } = await this.supabase
				.from('documents')
				.select('id, owner_id, name, content_size_bytes, created_at, updated_at')
				.eq('id', document_id)
				.eq('owner_id', user_id)
				.single();

			if (error) throw error;
			if (!data) {
				throw new DocumentError('not_found', 'Document not found', 404);
			}

			return data as DocumentMetadata;
		} catch (error) {
			if (error instanceof DocumentError) throw error;
			throw this.mapDatabaseError(error);
		}
	}

	/**
	 * Get full document with content
	 */
	async getDocumentContent({
		user_id,
		document_id
	}: {
		user_id: UUID;
		document_id: UUID;
	}): Promise<Document> {
		try {
			const { data, error } = await this.supabase
				.from('documents')
				.select('*')
				.eq('id', document_id)
				.eq('owner_id', user_id)
				.single();

			if (error) throw error;
			if (!data) {
				throw new DocumentError('not_found', 'Document not found', 404);
			}

			return data as Document;
		} catch (error) {
			if (error instanceof DocumentError) throw error;
			throw this.mapDatabaseError(error);
		}
	}

	/**
	 * Update document content
	 */
	async updateDocumentContent(params: UpdateContentParams): Promise<Document> {
		const { user_id, document_id, content } = params;

		// Validate content
		DocumentValidator.validateContent(content);

		// Calculate new size
		const content_size_bytes = DocumentValidator.getByteLength(content);

		try {
			// Note: We manually set updated_at for consistency with mock service
			// and to ensure timestamps are controlled by the application layer
			const { data, error } = await this.supabase
				.from('documents')
				.update({
					content,
					content_size_bytes,
					updated_at: new Date().toISOString()
				})
				.eq('id', document_id)
				.eq('owner_id', user_id)
				.select()
				.single();

			if (error) throw error;
			if (!data) {
				throw new DocumentError('not_found', 'Document not found', 404);
			}

			return data as Document;
		} catch (error) {
			if (error instanceof DocumentError) throw error;
			throw this.mapDatabaseError(error);
		}
	}

	/**
	 * Update document name
	 */
	async updateDocumentName(params: UpdateNameParams): Promise<DocumentMetadata> {
		const { user_id, document_id, name } = params;

		// Validate name
		DocumentValidator.validateName(name);

		try {
			// Note: We manually set updated_at for consistency with mock service
			// and to ensure timestamps are controlled by the application layer
			const { data, error } = await this.supabase
				.from('documents')
				.update({
					name,
					updated_at: new Date().toISOString()
				})
				.eq('id', document_id)
				.eq('owner_id', user_id)
				.select('id, owner_id, name, content_size_bytes, created_at, updated_at')
				.single();

			if (error) throw error;
			if (!data) {
				throw new DocumentError('not_found', 'Document not found', 404);
			}

			return data as DocumentMetadata;
		} catch (error) {
			if (error instanceof DocumentError) throw error;
			throw this.mapDatabaseError(error);
		}
	}

	/**
	 * Delete a document
	 */
	async deleteDocument(params: DocumentReferenceParams): Promise<void> {
		const { user_id, document_id } = params;

		try {
			const { error, count } = await this.supabase
				.from('documents')
				.delete({ count: 'exact' })
				.eq('id', document_id)
				.eq('owner_id', user_id);

			if (error) throw error;

			if (count === 0) {
				throw new DocumentError('not_found', 'Document not found', 404);
			}
		} catch (error) {
			if (error instanceof DocumentError) throw error;
			throw this.mapDatabaseError(error);
		}
	}

	/**
	 * List user's documents with pagination
	 */
	async listUserDocuments(params: ListDocumentsParams): Promise<DocumentListResult> {
		const { user_id, limit = 50, offset = 0 } = params;

		// Validate limit
		const validatedLimit = Math.min(limit, 100);

		try {
			// Get paginated documents
			const { data, error } = await this.supabase
				.from('documents')
				.select('id, owner_id, name, content_size_bytes, created_at, updated_at')
				.eq('owner_id', user_id)
				.order('created_at', { ascending: false })
				.range(offset, offset + validatedLimit - 1);

			if (error) throw error;

			// Get total count
			// Note: This is a separate query for simplicity and consistency with mock service
			// For large datasets, consider cursor-based pagination in future optimization
			const { count, error: countError } = await this.supabase
				.from('documents')
				.select('*', { count: 'exact', head: true })
				.eq('owner_id', user_id);

			if (countError) throw countError;

			return {
				documents: data as DocumentMetadata[],
				total: count || 0,
				limit: validatedLimit,
				offset
			};
		} catch (error) {
			throw this.mapDatabaseError(error);
		}
	}
}
