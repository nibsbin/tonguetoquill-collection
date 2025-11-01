/**
 * Document Client Service
 * Centralizes all document-related communication for client-side code
 * Handles branching between guest mode (localStorage) and authenticated mode (API)
 */

import type { DocumentMetadata } from './types';
import { documentBrowserStorage } from './document-browser-storage';

/**
 * Document Client
 * Provides a unified interface for document operations that automatically
 * routes to either browser storage (guest mode) or API (authenticated mode)
 */
export class DocumentClient {
	constructor(private isGuest: () => boolean) {}

	/**
	 * List all documents for the current user
	 */
	async listDocuments(): Promise<DocumentMetadata[]> {
		if (this.isGuest()) {
			return await documentBrowserStorage.listUserDocuments();
		}

		const response = await fetch('/api/documents');
		if (!response.ok) {
			throw new Error('Failed to fetch documents');
		}

		const data = await response.json();
		return data.documents || [];
	}

	/**
	 * Get a document with its content
	 */
	async getDocument(id: string): Promise<{ id: string; content: string; name: string }> {
		if (this.isGuest()) {
			const doc = await documentBrowserStorage.getDocumentContent(id);
			if (!doc) {
				throw new Error('Document not found');
			}
			return doc;
		}

		const response = await fetch(`/api/documents/${id}`);
		if (!response.ok) {
			throw new Error('Failed to fetch document');
		}

		const data = await response.json();
		return data.document ?? data;
	}

	/**
	 * Create a new document
	 */
	async createDocument(name: string, content: string = ''): Promise<DocumentMetadata> {
		if (this.isGuest()) {
			return await documentBrowserStorage.createDocument(name, content);
		}

		const response = await fetch('/api/documents', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, content })
		});

		if (!response.ok) {
			throw new Error('Failed to create document');
		}

		const data = await response.json();
		return data.metadata ?? data;
	}

	/**
	 * Update document content
	 */
	async updateDocument(
		id: string,
		updates: { content?: string; name?: string }
	): Promise<{ content_size_bytes?: number; updated_at?: string }> {
		if (this.isGuest()) {
			if (updates.content !== undefined) {
				await documentBrowserStorage.updateDocumentContent(id, updates.content);
			}
			if (updates.name !== undefined) {
				await documentBrowserStorage.updateDocumentName(id, updates.name);
			}

			// Return metadata for store update
			const metadata = await documentBrowserStorage.getDocumentMetadata(id);
			return {
				content_size_bytes: metadata?.content_size_bytes,
				updated_at: metadata?.updated_at
			};
		}

		const response = await fetch(`/api/documents/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updates)
		});

		if (!response.ok) {
			throw new Error('Failed to update document');
		}

		const data = await response.json();
		return {
			content_size_bytes: data.document?.content_size_bytes ?? data.content_size_bytes,
			updated_at: data.document?.updated_at ?? data.updated_at
		};
	}

	/**
	 * Delete a document
	 */
	async deleteDocument(id: string): Promise<void> {
		if (this.isGuest()) {
			await documentBrowserStorage.deleteDocument(id);
			return;
		}

		const response = await fetch(`/api/documents/${id}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			throw new Error('Failed to delete document');
		}
	}
}

/**
 * Create a document client instance
 * The isGuest function should return the current guest mode state
 */
export function createDocumentClient(isGuest: () => boolean): DocumentClient {
	return new DocumentClient(isGuest);
}
