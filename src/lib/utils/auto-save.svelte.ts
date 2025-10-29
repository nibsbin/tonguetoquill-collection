/**
 * Auto-Save Utility
 * Provides debounced auto-save functionality with status tracking
 */

import { documentStore } from '$lib/stores/documents.svelte';
import { localStorageDocumentService } from '$lib/services/documents/localstorage-service';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SaveState {
	status: SaveStatus;
	errorMessage?: string;
}

/**
 * AutoSave class to manage document saving with debounce
 */
export class AutoSave {
	private debounceTimer: number | undefined;
	private saveDebounceMs: number;
	private state = $state<SaveState>({
		status: 'idle'
	});

	constructor(debounceMs: number = 7000) {
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
			if (documentStore.isGuest) {
				// Guest mode: save to LocalStorage
				await localStorageDocumentService.updateDocumentContent(documentId, content);
				
				// Update document store metadata
				const contentSizeBytes = new Blob([content]).size;
				documentStore.updateDocument(documentId, {
					content_size_bytes: contentSizeBytes,
					updated_at: new Date().toISOString()
				});
			} else {
				// Authenticated mode: save to API
				const response = await fetch(`/api/documents/${documentId}/content`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ content })
				});

				if (!response.ok) {
					throw new Error('Failed to save document');
				}

				const data = await response.json();
				
				// Update document store metadata
				documentStore.updateDocument(documentId, {
					content_size_bytes: data.document.content_size_bytes,
					updated_at: data.document.updated_at
				});
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
