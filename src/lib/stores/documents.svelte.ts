/**
 * Document store for managing document list and active document
 * Uses DocumentClient for all I/O operations
 */

import type { DocumentMetadata } from '$lib/services/documents/types';
import { createDocumentClient } from '$lib/services/documents/document-client';
import { getErrorMessage } from '$lib/errors';

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

	// Authentication state - separate from document state
	// Used by DocumentClient to route between localStorage (guest) and API (authenticated)
	private _isGuest = $state<boolean>(true);
	private _userId = $state<string>('guest');

	// Create document client - recreated when auth state changes
	private documentClient = createDocumentClient(this._isGuest, this._userId);

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

	get isGuest() {
		return this._isGuest;
	}

	// Provide access to document client for AutoSave
	getDocumentClient() {
		return this.documentClient;
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

		// Optimistically update local state
		this.state.documents = this.state.documents.map((doc) =>
			doc.id === id ? { ...doc, ...updates } : doc
		);

		try {
			// Call DocumentClient to persist
			const result = await this.documentClient.updateDocument(id, clientUpdates);

			// Update local state with server response metadata
			this.state.documents = this.state.documents.map((doc) =>
				doc.id === id ? mergeWithServerResponse(doc, result) : doc
			);
		} catch (err) {
			// Rollback on error
			this.state.documents = this.state.documents.map((doc) =>
				doc.id === id ? previousDocument : doc
			);
			this.setError(getErrorMessage(err, 'Failed to update document'));
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
		const previousActiveId = this.state.activeDocumentId;
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
			this.setError(getErrorMessage(err, 'Failed to delete document'));
			throw err;
		}
	}
}

// Export singleton instance
export const documentStore = new DocumentStore();
