/**
 * Browser Storage Document Service for Guest Users
 * Provides document storage using browser LocalStorage for guest mode
 * Implements DocumentServiceContract for compatibility with other storage services
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
import { DocumentValidator } from './document-validator';

const STORAGE_KEY = 'tonguetoquill_guest_documents';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

interface StoredDocument {
	id: string;
	name: string;
	content: string;
	content_size_bytes: number;
	created_at: string;
	updated_at: string;
}

class DocumentBrowserStorage implements DocumentServiceContract {
	private getDocuments(): StoredDocument[] {
		try {
			const data = localStorage.getItem(STORAGE_KEY);
			return data ? JSON.parse(data) : [];
		} catch {
			return [];
		}
	}

	private saveDocuments(documents: StoredDocument[]): void {
		try {
			const data = JSON.stringify(documents);
			// Check storage size
			if (data.length > MAX_STORAGE_SIZE) {
				throw new Error('Storage quota exceeded (5MB limit)');
			}
			localStorage.setItem(STORAGE_KEY, data);
		} catch (err) {
			if (err instanceof Error) {
				throw new Error(`Failed to save to LocalStorage: ${err.message}`);
			}
			throw err;
		}
	}

	async createDocument(params: CreateDocumentParams): Promise<Document> {
		// Extract params (owner_id ignored, always 'guest' for browser storage)
		const { name, content } = params;

		// Validate inputs
		const trimmedName = name.trim() || 'Untitled Document';
		DocumentValidator.validateName(trimmedName);
		DocumentValidator.validateContent(content);

		const documents = this.getDocuments();

		const newDoc: StoredDocument = {
			id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
			name: trimmedName,
			content,
			content_size_bytes: DocumentValidator.getByteLength(content),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};

		documents.unshift(newDoc);
		this.saveDocuments(documents);

		// Return complete Document with owner_id
		return { ...newDoc, owner_id: 'guest' };
	}

	async getDocumentMetadata(params: DocumentReferenceParams): Promise<DocumentMetadata> {
		// Extract params (user_id ignored for browser storage)
		const { document_id } = params;

		const documents = this.getDocuments();
		const doc = documents.find((d) => d.id === document_id);

		if (!doc) {
			throw new Error('Document not found');
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { content: _, ...metadata } = doc;
		return { ...metadata, owner_id: 'guest' };
	}

	async getDocumentContent(params: DocumentReferenceParams): Promise<Document> {
		// Extract params (user_id ignored for browser storage)
		const { document_id } = params;

		const documents = this.getDocuments();
		const doc = documents.find((d) => d.id === document_id);

		if (!doc) {
			throw new Error('Document not found');
		}

		// Return complete Document with owner_id
		return { ...doc, owner_id: 'guest' };
	}

	async updateDocumentContent(params: UpdateContentParams): Promise<Document> {
		// Extract params (user_id ignored for browser storage)
		const { document_id, content } = params;

		// Validate content
		DocumentValidator.validateContent(content);

		const documents = this.getDocuments();
		const index = documents.findIndex((d) => d.id === document_id);

		if (index === -1) {
			throw new Error('Document not found');
		}

		documents[index].content = content;
		documents[index].content_size_bytes = DocumentValidator.getByteLength(content);
		documents[index].updated_at = new Date().toISOString();

		this.saveDocuments(documents);

		// Return updated document
		return { ...documents[index], owner_id: 'guest' };
	}

	async updateDocumentName(params: UpdateNameParams): Promise<DocumentMetadata> {
		// Extract params (user_id ignored for browser storage)
		const { document_id, name } = params;

		// Validate name
		const trimmedName = name.trim() || 'Untitled Document';
		DocumentValidator.validateName(trimmedName);

		const documents = this.getDocuments();
		const index = documents.findIndex((d) => d.id === document_id);

		if (index === -1) {
			throw new Error('Document not found');
		}

		documents[index].name = trimmedName;
		documents[index].updated_at = new Date().toISOString();

		this.saveDocuments(documents);

		// Return metadata (without content)
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { content: _, ...metadata } = documents[index];
		return { ...metadata, owner_id: 'guest' };
	}

	async deleteDocument(params: DocumentReferenceParams): Promise<void> {
		// Extract params (user_id ignored for browser storage)
		const { document_id } = params;

		const documents = this.getDocuments();
		const filtered = documents.filter((d) => d.id !== document_id);

		if (filtered.length === documents.length) {
			throw new Error('Document not found');
		}

		this.saveDocuments(filtered);
	}

	async listUserDocuments(params: ListDocumentsParams): Promise<DocumentListResult> {
		// Extract params (user_id ignored for browser storage)
		const { limit = 50, offset = 0 } = params;

		const documents = this.getDocuments();

		// Apply pagination
		const total = documents.length;
		const paginatedDocuments = documents.slice(offset, offset + limit);

		// Convert to metadata
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const metadata = paginatedDocuments.map(({ content: _, ...meta }) => ({
			...meta,
			owner_id: 'guest'
		}));

		return {
			documents: metadata,
			total,
			limit,
			offset
		};
	}

	// Helper method to get all documents for migration
	getAllDocumentsWithContent(): StoredDocument[] {
		return this.getDocuments();
	}

	// Clear all guest documents
	clear(): void {
		localStorage.removeItem(STORAGE_KEY);
	}

	// Get storage usage
	getStorageInfo(): { used: number; max: number; percentUsed: number } {
		const data = localStorage.getItem(STORAGE_KEY) || '';
		const used = data.length;
		const percentUsed = (used / MAX_STORAGE_SIZE) * 100;

		return {
			used,
			max: MAX_STORAGE_SIZE,
			percentUsed: Math.round(percentUsed)
		};
	}
}

// Export class for factory instantiation
export { DocumentBrowserStorage };

// Export singleton for backward compatibility
export const documentBrowserStorage = new DocumentBrowserStorage();
