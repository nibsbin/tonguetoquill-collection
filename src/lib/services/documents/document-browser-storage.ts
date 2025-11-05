/**
 * Browser Storage Document Service for Guest Users
 * Provides document storage using browser LocalStorage for guest mode
 */

import type { DocumentMetadata } from './types';
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

class DocumentBrowserStorage {
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

	async createDocument(name: string, content: string = ''): Promise<DocumentMetadata> {
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

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { content: _, ...metadata } = newDoc;
		return { ...metadata, owner_id: 'guest' };
	}

	async getDocumentMetadata(id: string): Promise<DocumentMetadata | null> {
		const documents = this.getDocuments();
		const doc = documents.find((d) => d.id === id);

		if (!doc) return null;

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { content: _, ...metadata } = doc;
		return { ...metadata, owner_id: 'guest' };
	}

	async getDocumentContent(
		id: string
	): Promise<{ id: string; content: string; name: string } | null> {
		const documents = this.getDocuments();
		const doc = documents.find((d) => d.id === id);

		if (!doc) return null;

		return {
			id: doc.id,
			name: doc.name,
			content: doc.content
		};
	}

	async updateDocumentContent(id: string, content: string): Promise<void> {
		// Validate content
		DocumentValidator.validateContent(content);

		const documents = this.getDocuments();
		const index = documents.findIndex((d) => d.id === id);

		if (index === -1) {
			throw new Error('Document not found');
		}

		documents[index].content = content;
		documents[index].content_size_bytes = DocumentValidator.getByteLength(content);
		documents[index].updated_at = new Date().toISOString();

		this.saveDocuments(documents);
	}

	async updateDocumentName(id: string, name: string): Promise<void> {
		// Validate name
		const trimmedName = name.trim() || 'Untitled Document';
		DocumentValidator.validateName(trimmedName);

		const documents = this.getDocuments();
		const index = documents.findIndex((d) => d.id === id);

		if (index === -1) {
			throw new Error('Document not found');
		}

		documents[index].name = trimmedName;
		documents[index].updated_at = new Date().toISOString();

		this.saveDocuments(documents);
	}

	async deleteDocument(id: string): Promise<void> {
		const documents = this.getDocuments();
		const filtered = documents.filter((d) => d.id !== id);

		if (filtered.length === documents.length) {
			throw new Error('Document not found');
		}

		this.saveDocuments(filtered);
	}

	async listUserDocuments(): Promise<DocumentMetadata[]> {
		const documents = this.getDocuments();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		return documents.map(({ content: _, ...metadata }) => ({
			...metadata,
			owner_id: 'guest'
		}));
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

export const documentBrowserStorage = new DocumentBrowserStorage();
