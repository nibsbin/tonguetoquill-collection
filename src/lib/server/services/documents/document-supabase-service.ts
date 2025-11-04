/**
 * Supabase Document Service
 * Implements DocumentServiceContract using Supabase PostgreSQL database
 */

import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
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

/**
 * Supabase Document Service
 * Uses Supabase PostgreSQL database for document storage
 */
export class SupabaseDocumentService implements DocumentServiceContract {
	private supabase: SupabaseClient;

	// Constants
	private readonly MAX_CONTENT_SIZE = 524288; // 0.5 MB in bytes
	private readonly MAX_NAME_LENGTH = 255;
	private readonly MIN_NAME_LENGTH = 1;
	private readonly PGRST_NO_ROWS_ERROR = 'PGRST116'; // PostgREST error code for no rows

	constructor() {
		const supabaseUrl = env.SUPABASE_URL || publicEnv.PUBLIC_SUPABASE_URL || '';
		// Prefer service role key for server-side operations (bypasses RLS)
		// Fall back to publishable key for development/testing environments
		// Production deployments should always set SUPABASE_SECRET_KEY
		const supabaseKey = env.SUPABASE_SECRET_KEY || publicEnv.PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

		if (!supabaseUrl || !supabaseKey) {
			throw new Error('Supabase configuration missing. Check environment variables.');
		}

		this.supabase = createClient(supabaseUrl, supabaseKey);
	}

	/**
	 * Validate document name
	 */
	private validateName(name: string): void {
		const trimmedName = name.trim();

		if (trimmedName.length < this.MIN_NAME_LENGTH) {
			throw new DocumentError('invalid_name', 'Document name cannot be empty', 400);
		}

		if (trimmedName.length > this.MAX_NAME_LENGTH) {
			throw new DocumentError(
				'invalid_name',
				`Document name must be ${this.MAX_NAME_LENGTH} characters or less`,
				400
			);
		}

		if (trimmedName !== name) {
			throw new DocumentError(
				'invalid_name',
				'Document name cannot have leading or trailing whitespace',
				400
			);
		}
	}

	/**
	 * Validate content size
	 */
	private validateContent(content: string): void {
		const byteLength = this.calculateContentSize(content);

		if (byteLength > this.MAX_CONTENT_SIZE) {
			throw new DocumentError(
				'content_too_large',
				`Content size (${byteLength} bytes) exceeds maximum of ${this.MAX_CONTENT_SIZE} bytes`,
				413
			);
		}
	}

	/**
	 * Calculate byte length of string (UTF-8)
	 */
	private calculateContentSize(content: string): number {
		return Buffer.from(content, 'utf-8').length;
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
		this.validateName(name);
		this.validateContent(content);

		// Calculate size
		const content_size_bytes = this.calculateContentSize(content);

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
	async getDocumentMetadata(userId: UUID, documentId: UUID): Promise<DocumentMetadata> {
		try {
			const { data, error } = await this.supabase
				.from('documents')
				.select('id, owner_id, name, content_size_bytes, created_at, updated_at')
				.eq('id', documentId)
				.eq('owner_id', userId)
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
	async getDocumentContent(userId: UUID, documentId: UUID): Promise<Document> {
		try {
			const { data, error } = await this.supabase
				.from('documents')
				.select('*')
				.eq('id', documentId)
				.eq('owner_id', userId)
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
		this.validateContent(content);

		// Calculate new size
		const content_size_bytes = this.calculateContentSize(content);

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
		this.validateName(name);

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
	async deleteDocument(userId: UUID, documentId: UUID): Promise<void> {
		try {
			const { error, count } = await this.supabase
				.from('documents')
				.delete({ count: 'exact' })
				.eq('id', documentId)
				.eq('owner_id', userId);

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
