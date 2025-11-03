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

	async updateDocument(id: string, updates: Partial<DocumentMetadata>) {
		// Find the document to update
		const documentToUpdate = this.state.documents.find((doc) => doc.id === id);
		if (!documentToUpdate) {
			throw new Error('Document not found');
		}

		// Determine if this update requires persistence (i.e., has `name` update)
		const requiresPersistence = updates.name !== undefined;

		if (!requiresPersistence) {
			// For metadata-only updates (e.g., content_size_bytes, updated_at from auto-save),
			// just update local state without calling DocumentClient
			this.state.documents = this.state.documents.map((doc) =>
				doc.id === id ? { ...doc, ...updates } : doc
			);
			return;
		}

		// For guest mode, update directly without optimistic update
		if (this.state.isGuest) {
			try {
				// Extract name from updates for DocumentClient
				const clientUpdates: { name?: string } = {};
				if (updates.name !== undefined) {
					clientUpdates.name = updates.name;
				}

				// Call DocumentClient to persist
				const result = await this.documentClient.updateDocument(id, clientUpdates);

				// Update local state with both user updates and server response
				this.state.documents = this.state.documents.map((doc) =>
					doc.id === id
						? {
								...doc,
								...updates,
								...(result.content_size_bytes !== undefined && {
									content_size_bytes: result.content_size_bytes
								}),
								...(result.updated_at !== undefined && { updated_at: result.updated_at })
							}
						: doc
				);
			} catch (err) {
				this.setError(err instanceof Error ? err.message : 'Failed to update document');
				throw err;
			}
			return;
		}

		// Authenticated mode: use optimistic update
		const previousDocument = { ...documentToUpdate };

		// Optimistically update local state
		this.state.documents = this.state.documents.map((doc) =>
			doc.id === id ? { ...doc, ...updates } : doc
		);

		try {
			// Extract name from updates for DocumentClient
			const clientUpdates: { name?: string } = {};
			if (updates.name !== undefined) {
				clientUpdates.name = updates.name;
			}

			// Call DocumentClient to persist
			const result = await this.documentClient.updateDocument(id, clientUpdates);

			// Update local state with server response metadata
			this.state.documents = this.state.documents.map((doc) =>
				doc.id === id
					? {
							...doc,
							...(result.content_size_bytes !== undefined && {
								content_size_bytes: result.content_size_bytes
							}),
							...(result.updated_at !== undefined && { updated_at: result.updated_at })
						}
					: doc
			);
		} catch (err) {
			// Rollback on error
			this.state.documents = this.state.documents.map((doc) =>
				doc.id === id ? previousDocument : doc
			);
			this.setError(err instanceof Error ? err.message : 'Failed to update document');
			throw err;
		}
	}

	removeDocument(id: string) {
		this.state.documents = this.state.documents.filter((doc) => doc.id !== id);
		if (this.state.activeDocumentId === id) {
			// If there are remaining documents, select the topmost recent so the
			// editor remains populated. Otherwise clear the active document.
			if (this.state.documents.length > 0) {
				this.state.activeDocumentId = this.state.documents[0].id;
			} else {
				this.state.activeDocumentId = null;
			}
		}
	}

	// API methods - delegated to document client
	async fetchDocuments() {
		this.setLoading(true);
		this.setError(null);

		try {
			const documents = await this.documentClient.listDocuments();
			this.setDocuments(documents);

			// If there's no active document selected yet, auto-select the first recent
			// document so the editor loads with content on page load.
			if (!this.state.activeDocumentId && this.state.documents.length > 0) {
				this.setActiveDocumentId(this.state.documents[0].id);
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
