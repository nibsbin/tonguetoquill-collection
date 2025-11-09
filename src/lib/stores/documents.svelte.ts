/**
 * Document store for managing document list and active document
 * Uses DocumentClient for all I/O operations
 * Uses CollectionStore factory for base state management
 */

import type { DocumentMetadata } from '$lib/services/documents/types';
import { createDocumentClient } from '$lib/services/documents/document-client';
import { getErrorMessage } from '$lib/errors';
import { createCollectionStore } from './factories.svelte';

class DocumentStore {
	// Use collection store factory for basic state management
	private collection = createCollectionStore<DocumentMetadata>({
		idKey: 'id',
		withLoading: true,
		withError: true,
		withActiveSelection: true
	});

	// Authentication state - separate from document state
	// Used by DocumentClient to route between localStorage (guest) and API (authenticated)
	private _isGuest = $state<boolean>(true);
	private _userId = $state<string>('guest');

	// Create document client - recreated when auth state changes
	private documentClient = createDocumentClient(this._isGuest, this._userId);

	// Delegate getters to collection store
	get documents() {
		return this.collection.items;
	}

	get activeDocumentId() {
		return this.collection.activeId;
	}

	get isLoading() {
		return this.collection.isLoading;
	}

	get error() {
		return this.collection.error;
	}

	get activeDocument() {
		return this.collection.activeItem;
	}

	get isGuest() {
		return this._isGuest;
	}

	// Provide access to document client for AutoSave
	getDocumentClient() {
		return this.documentClient;
	}

	// Delegate basic actions to collection store
	setDocuments(documents: DocumentMetadata[]) {
		this.collection.setItems(documents);
	}

	setActiveDocumentId(id: string | null) {
		this.collection.setActiveId(id);
	}

	setLoading(isLoading: boolean) {
		this.collection.setLoading(isLoading);
	}

	setError(error: string | null) {
		this.collection.setError(error);
	}

	/**
	 * Set authentication mode
	 * Internal method used to configure DocumentClient routing
	 */
	setGuestMode(isGuest: boolean) {
		this._isGuest = isGuest;
		this.documentClient = createDocumentClient(this._isGuest, this._userId);
	}

	/**
	 * Set user ID
	 * Internal method used to configure DocumentClient with authenticated user ID
	 */
	setUserId(userId: string) {
		this._userId = userId;
		this.documentClient = createDocumentClient(this._isGuest, this._userId);
	}

	addDocument(document: DocumentMetadata) {
		this.collection.add(document);
	}

	async updateDocument(id: string, updates: Partial<DocumentMetadata>) {
		// Find the document to update
		const documentToUpdate = this.documents.find((doc) => doc.id === id);
		if (!documentToUpdate) {
			throw new Error('Document not found');
		}

		// Determine if this update requires persistence (i.e., has `name` update)
		const requiresPersistence = updates.name !== undefined;

		if (!requiresPersistence) {
			// For metadata-only updates (e.g., content_size_bytes, updated_at from auto-save),
			// just update local state without calling DocumentClient
			this.collection.update(id, updates);
			return;
		}

		// Extract name from updates for DocumentClient
		const clientUpdates: { name?: string } = {};
		if (updates.name !== undefined) {
			clientUpdates.name = updates.name;
		}

		// Helper function to merge server response with updates
		const mergeWithServerResponse = (
			doc: DocumentMetadata,
			result: { content_size_bytes?: number; updated_at?: string }
		) => ({
			...doc,
			...updates,
			...(result.content_size_bytes !== undefined && {
				content_size_bytes: result.content_size_bytes
			}),
			...(result.updated_at !== undefined && { updated_at: result.updated_at })
		});

		// Use optimistic update for immediate UI responsiveness
		// DocumentClient handles routing to localStorage (guest) or API (authenticated)
		const previousDocument = { ...documentToUpdate };

		// Optimistically update local state using collection store
		this.collection.update(id, updates);

		try {
			// Call DocumentClient to persist
			const result = await this.documentClient.updateDocument(id, clientUpdates);

			// Merge server response with current state
			const currentDoc = this.documents.find((doc) => doc.id === id);
			if (currentDoc) {
				const merged = mergeWithServerResponse(currentDoc, result);
				// Update with merged result
				this.collection.update(id, {
					content_size_bytes: merged.content_size_bytes,
					updated_at: merged.updated_at
				});
			}
		} catch (err) {
			// Rollback on error
			this.collection.update(id, previousDocument);
			this.setError(getErrorMessage(err, 'Failed to update document'));
			throw err;
		}
	}

	removeDocument(id: string) {
		this.collection.remove(id);

		// Custom logic: auto-select next document after removal
		if (this.activeDocumentId === null && this.documents.length > 0) {
			this.setActiveDocumentId(this.documents[0].id);
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
			if (!this.activeDocumentId && this.documents.length > 0) {
				this.setActiveDocumentId(this.documents[0].id);
			}
		} catch (err) {
			this.setError(getErrorMessage(err, 'Failed to fetch documents'));
			throw err;
		} finally {
			this.setLoading(false);
		}
	}

	async fetchDocument(id: string): Promise<{ id: string; content: string; name: string }> {
		try {
			return await this.documentClient.getDocument(id);
		} catch (err) {
			this.setError(getErrorMessage(err, 'Failed to fetch document'));
			throw err;
		}
	}

	async createDocument(name: string = 'Untitled Document', content: string = '') {
		// Use optimistic update for immediate UI responsiveness
		// DocumentClient handles routing to localStorage (guest) or API (authenticated)
		const tempId = `temp-${Date.now()}`;
		const tempDoc: DocumentMetadata = {
			id: tempId,
			owner_id: 'temp', // Temporary value, will be replaced when actual document is created
			name,
			content_size_bytes: 0,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};

		this.addDocument(tempDoc);
		const previousActiveId = this.activeDocumentId;
		this.setActiveDocumentId(tempId);

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
			this.setError(getErrorMessage(err, 'Failed to create document'));
			throw err;
		}
	}

	async deleteDocument(id: string) {
		// Use optimistic update for immediate UI responsiveness
		// DocumentClient handles routing to localStorage (guest) or API (authenticated)
		const documentToDelete = this.documents.find((doc) => doc.id === id);
		if (!documentToDelete) {
			throw new Error('Document not found');
		}

		this.removeDocument(id);

		try {
			await this.documentClient.deleteDocument(id);
		} catch (err) {
			// Rollback on error
			this.addDocument(documentToDelete);
			this.setError(getErrorMessage(err, 'Failed to delete document'));
			throw err;
		}
	}
}

// Export singleton instance
export const documentStore = new DocumentStore();
