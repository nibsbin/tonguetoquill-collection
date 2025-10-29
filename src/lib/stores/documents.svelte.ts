/**
 * Document store for managing document list and active document
 * Uses Svelte 5 runes for reactive state management
 */

import type { DocumentMetadata } from '$lib/services/documents/types';

interface DocumentsState {
	documents: DocumentMetadata[];
	activeDocumentId: string | null;
	isLoading: boolean;
	error: string | null;
}

class DocumentStore {
	private state = $state<DocumentsState>({
		documents: [],
		activeDocumentId: null,
		isLoading: false,
		error: null
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

	// API methods
	async fetchDocuments() {
		this.setLoading(true);
		this.setError(null);

		try {
			const response = await fetch('/api/documents');

			if (!response.ok) {
				throw new Error('Failed to fetch documents');
			}

			const data = await response.json();
			this.setDocuments(data.documents || []);
		} catch (err) {
			this.setError(err instanceof Error ? err.message : 'Failed to fetch documents');
			throw err;
		} finally {
			this.setLoading(false);
		}
	}

	async createDocument(name: string = 'Untitled Document', content: string = '') {
		// Optimistic update
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
		// Optimistic update
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
