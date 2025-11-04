/**
 * Auto-Save Utility
 * Provides debounced auto-save functionality with status tracking
 */

import { documentStore } from '$lib/stores/documents.svelte';
import type { DocumentClient } from '$lib/services/documents/document-client';
import type { DocumentMetadata } from '$lib/services/documents/types';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SaveState {
	status: SaveStatus;
	errorMessage?: string;
}

/**
 * AutoSave class to manage document saving with debounce
 *
 * @param debounceMs - Debounce delay in milliseconds (default: 4000ms)
 *                     See DESIGN_SYSTEM.md Auto-Save Behavior for rationale
 */
export class AutoSave {
	private debounceTimer: number | undefined;
	private saveDebounceMs: number;
	private state = $state<SaveState>({
		status: 'idle'
	});

	// Use the document store's client to avoid duplicate client instances
	private get documentClient(): DocumentClient {
		return documentStore.getDocumentClient();
	}

	constructor(debounceMs: number = 4000) {
		this.saveDebounceMs = debounceMs;
	}

	/**
	 * Get current save state
	 */
	get saveState(): SaveState {
		return this.state;
	}

	/**
	 * Schedule a save with debounce
	 * @param documentId - Document ID to save
	 * @param content - Content to save
	 * @param autoSaveEnabled - Whether auto-save is enabled (respects user preference)
	 */
	scheduleSave(documentId: string, content: string, autoSaveEnabled: boolean = true): void {
		if (!autoSaveEnabled) {
			return;
		}

		// Clear existing timer
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
		}

		// Schedule new save
		this.debounceTimer = window.setTimeout(() => {
			this.saveNow(documentId, content);
		}, this.saveDebounceMs);
	}

	/**
	 * Save immediately (bypasses debounce)
	 * Used for manual save (Ctrl+S)
	 */
	async saveNow(documentId: string, content: string): Promise<void> {
		// Clear any pending debounced save
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = undefined;
		}

		this.state.status = 'saving';
		this.state.errorMessage = undefined;

		try {
			const result = await this.documentClient.updateDocument(documentId, { content });

			// Update document store metadata
			const updates: Partial<DocumentMetadata> = {};
			if (result.content_size_bytes !== undefined) {
				updates.content_size_bytes = result.content_size_bytes;
			}
			if (result.updated_at !== undefined) {
				updates.updated_at = result.updated_at;
			}
			if (Object.keys(updates).length > 0) {
				documentStore.updateDocument(documentId, updates);
			}

			this.state.status = 'saved';

			// Auto-hide saved status after 3 seconds
			setTimeout(() => {
				if (this.state.status === 'saved') {
					this.state.status = 'idle';
				}
			}, 3000);
		} catch (err) {
			this.state.status = 'error';
			this.state.errorMessage = err instanceof Error ? err.message : 'Failed to save document';
			throw err;
		}
	}

	/**
	 * Cancel any pending save
	 */
	cancelPendingSave(): void {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = undefined;
		}
	}

	/**
	 * Check if there's a pending save
	 */
	hasPendingSave(): boolean {
		return this.debounceTimer !== undefined;
	}

	/**
	 * Reset save state
	 */
	reset(): void {
		this.cancelPendingSave();
		this.state.status = 'idle';
		this.state.errorMessage = undefined;
	}
}
