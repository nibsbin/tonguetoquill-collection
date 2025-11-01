/**
 * Document store for managing document list and active document
 * Uses DocumentClient for all I/O operations
 */

import type { DocumentMetadata } from '$lib/services/documents/types';
import { createDocumentClient } from '$lib/services/documents/document-client';

interface DocumentsState {
	documents: DocumentMetadata[];
	activeDocumentId: string | null;
	isLoading: boolean;
	error: string | null;
	isGuest: boolean;
}

class DocumentStore {
	private state = $state<DocumentsState>({
		documents: [],
		activeDocumentId: null,
		isLoading: false,
		error: null,
		isGuest: true // Default to guest mode
	});

	// Create document client with guest mode accessor
	private documentClient = createDocumentClient(() => this.state.isGuest);

	// Getters
	get documents() {
		return this.state.documents;
	}

	get activeDocumentId() {
		return this.state.activeDocumentId;
	}

	get isLoading() {
		return this.state.isLoading;
	}

	get error() {
		return this.state.error;
	}

	get isGuest() {
		return this.state.isGuest;
	}

	get activeDocument() {
		return this.state.documents.find((doc) => doc.id === this.state.activeDocumentId) || null;
	}

	// Actions
	setDocuments(documents: DocumentMetadata[]) {
		this.state.documents = documents;
	}

	setActiveDocumentId(id: string | null) {
		this.state.activeDocumentId = id;
	}

	setLoading(isLoading: boolean) {
		this.state.isLoading = isLoading;
	}

	setError(error: string | null) {
		this.state.error = error;
	}

	setGuestMode(isGuest: boolean) {
		this.state.isGuest = isGuest;
	}

	addDocument(document: DocumentMetadata) {
		this.state.documents = [document, ...this.state.documents];
	}

	updateDocument(id: string, updates: Partial<DocumentMetadata>) {
		this.state.documents = this.state.documents.map((doc) =>
			doc.id === id ? { ...doc, ...updates } : doc
		);
	}

	removeDocument(id: string) {
		this.state.documents = this.state.documents.filter((doc) => doc.id !== id);
		if (this.state.activeDocumentId === id) {
			this.state.activeDocumentId = null;
		}
	}

	// API methods - delegated to document client
	async fetchDocuments() {
		this.setLoading(true);
		this.setError(null);

		try {
			const documents = await this.documentClient.listDocuments();
			this.setDocuments(documents);
		} catch (err) {
			this.setError(err instanceof Error ? err.message : 'Failed to fetch documents');
			throw err;
		} finally {
			this.setLoading(false);
		}
	}

	async fetchDocument(id: string): Promise<{ id: string; content: string; name: string }> {
		try {
			return await this.documentClient.getDocument(id);
		} catch (err) {
			this.setError(err instanceof Error ? err.message : 'Failed to fetch document');
			throw err;
		}
	}

	async createDocument(name: string = 'Untitled Document', content: string = '') {
		// For guest mode, create directly without optimistic update
		if (this.state.isGuest) {
			try {
				const metadata = await this.documentClient.createDocument(name, content);
				this.addDocument(metadata);
				this.setActiveDocumentId(metadata.id);
				return metadata;
			} catch (err) {
				this.setError(err instanceof Error ? err.message : 'Failed to create document');
				throw err;
			}
		}

		// Authenticated mode: use optimistic update
		const tempId = `temp-${Date.now()}`;
		const tempDoc: DocumentMetadata = {
			id: tempId,
			owner_id: 'temp',
			name,
			content_size_bytes: 0,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};

		this.addDocument(tempDoc);
		const previousActiveId = this.state.activeDocumentId;

		try {
			const metadata = await this.documentClient.createDocument(name, content);
			this.removeDocument(tempId);
			this.addDocument(metadata);
			this.setActiveDocumentId(metadata.id);

			return metadata;
		} catch (err) {
			// Rollback on error
			this.removeDocument(tempId);
			this.setActiveDocumentId(previousActiveId);
			this.setError(err instanceof Error ? err.message : 'Failed to create document');
			throw err;
		}
	}

	async deleteDocument(id: string) {
		// For guest mode, delete directly without optimistic update
		if (this.state.isGuest) {
			try {
				await this.documentClient.deleteDocument(id);
				this.removeDocument(id);
			} catch (err) {
				this.setError(err instanceof Error ? err.message : 'Failed to delete document');
				throw err;
			}
			return;
		}

		// Authenticated mode: use optimistic update
		const documentToDelete = this.state.documents.find((doc) => doc.id === id);
		if (!documentToDelete) {
			throw new Error('Document not found');
		}

		this.removeDocument(id);

		try {
			await this.documentClient.deleteDocument(id);
		} catch (err) {
			// Rollback on error
			this.addDocument(documentToDelete);
			this.setError(err instanceof Error ? err.message : 'Failed to delete document');
			throw err;
		}
	}
}

// Export singleton instance
export const documentStore = new DocumentStore();
