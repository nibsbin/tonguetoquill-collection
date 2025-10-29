/**
 * Document store for managing document list and active document
 * Supports both authenticated (API) and guest (LocalStorage) modes
 */

import type { DocumentMetadata } from '$lib/services/documents/types';
import { localStorageDocumentService } from '$lib/services/documents/localstorage-service';

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

	// API methods - support both guest (LocalStorage) and authenticated (API) modes
	async fetchDocuments() {
		this.setLoading(true);
		this.setError(null);

		try {
			if (this.state.isGuest) {
				// Guest mode: use LocalStorage
				const documents = await localStorageDocumentService.listUserDocuments();
				this.setDocuments(documents);
			} else {
				// Authenticated mode: use API
				const response = await fetch('/api/documents');

				if (!response.ok) {
					throw new Error('Failed to fetch documents');
				}

				const data = await response.json();
				this.setDocuments(data.documents || []);
			}
		} catch (err) {
			this.setError(err instanceof Error ? err.message : 'Failed to fetch documents');
			throw err;
		} finally {
			this.setLoading(false);
		}
	}

	async fetchDocument(id: string): Promise<{ id: string; content: string; name: string }> {
		try {
			if (this.state.isGuest) {
				// Guest mode: use LocalStorage
				const doc = await localStorageDocumentService.getDocumentContent(id);
				if (!doc) {
					throw new Error('Document not found');
				}
				return doc;
			} else {
				// Authenticated mode: use API
				const response = await fetch(`/api/documents/${id}`);

				if (!response.ok) {
					throw new Error('Failed to fetch document');
				}

				const data = await response.json();
				return data.document;
			}
		} catch (err) {
			this.setError(err instanceof Error ? err.message : 'Failed to fetch document');
			throw err;
		}
	}

	async createDocument(name: string = 'Untitled Document', content: string = '') {
		if (this.state.isGuest) {
			// Guest mode: use LocalStorage
			try {
				const metadata = await localStorageDocumentService.createDocument(name, content);
				this.addDocument(metadata);
				this.setActiveDocumentId(metadata.id);
				return metadata;
			} catch (err) {
				this.setError(err instanceof Error ? err.message : 'Failed to create document');
				throw err;
			}
		}

		// Authenticated mode: use API with optimistic update
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
			const response = await fetch('/api/documents', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, content })
			});

			if (!response.ok) {
				throw new Error('Failed to create document');
			}

			const data = await response.json();
			this.removeDocument(tempId);
			this.addDocument(data.metadata);
			this.setActiveDocumentId(data.metadata.id);

			return data.metadata;
		} catch (err) {
			// Rollback on error
			this.removeDocument(tempId);
			this.setActiveDocumentId(previousActiveId);
			this.setError(err instanceof Error ? err.message : 'Failed to create document');
			throw err;
		}
	}

	async deleteDocument(id: string) {
		if (this.state.isGuest) {
			// Guest mode: use LocalStorage
			try {
				await localStorageDocumentService.deleteDocument(id);
				this.removeDocument(id);
			} catch (err) {
				this.setError(err instanceof Error ? err.message : 'Failed to delete document');
				throw err;
			}
			return;
		}

		// Authenticated mode: optimistic update
		const documentToDelete = this.state.documents.find((doc) => doc.id === id);
		if (!documentToDelete) {
			throw new Error('Document not found');
		}

		this.removeDocument(id);

		try {
			const response = await fetch(`/api/documents/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete document');
			}
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
