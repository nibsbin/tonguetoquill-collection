<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { toast } from 'svelte-sonner';
	import { AutoSave } from '$lib/utils/auto-save.svelte';
	import EditorToolbar from './EditorToolbar.svelte';
	import MarkdownEditor from './MarkdownEditor.svelte';
	import MarkdownPreview from './MarkdownPreview.svelte';

	interface Props {
		documentId: string;
		autoSave: AutoSave;
	}

	let { documentId, autoSave }: Props = $props();

	let content = $state('');
	let initialContent = $state('');
	let loading = $state(true);
	let debouncedContent = $state('');
	let debounceTimer: number | undefined;
	let editorRef = $state<MarkdownEditor | null>(null);
	let autoSaveEnabled = $state(true);
	let showLineNumbers = $state(true);
	let previousDocumentId = $state<string | null>(null);

	// Track dirty state (unsaved changes)
	let isDirty = $derived(content !== initialContent);

	// Watch for document changes and handle unsaved changes
	$effect(() => {
		if (previousDocumentId !== null && previousDocumentId !== documentId && isDirty) {
			// Document is switching with unsaved changes
			// Auto-save the current document before switching
			if (autoSaveEnabled) {
				autoSave.saveNow(previousDocumentId, content).catch(() => {
					// Ignore errors during auto-save on switch
				});
			}
		}
		
		// Update previous document ID
		if (documentId !== previousDocumentId) {
			previousDocumentId = documentId;
			loadDocument();
		}
	});

	// Debounce preview updates
	function updateDebouncedContent(newContent: string) {
		content = newContent;

		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = window.setTimeout(() => {
			debouncedContent = newContent;
		}, 50);

		// Trigger auto-save
		autoSave.scheduleSave(documentId, newContent, autoSaveEnabled);
	}

	// Watch for successful auto-save to update initialContent
	$effect(() => {
		if (autoSave.saveState.status === 'saved' && isDirty) {
			// Update initialContent to mark as saved
			initialContent = content;
		}
	});

	function handleFormat(type: string) {
		// Forward formatting command to editor
		if (editorRef && typeof editorRef.handleFormat === 'function') {
			editorRef.handleFormat(type);
		}
	}

	// Manual save handler (Ctrl+S)
	async function handleManualSave() {
		if (!isDirty) return;

		try {
			await autoSave.saveNow(documentId, content);
			initialContent = content;
			toast.success('Document saved');
		} catch {
			toast.error('Failed to save document');
		}
	}

	// Load document content
	async function loadDocument() {
		loading = true;
		try {
			const doc = await documentStore.fetchDocument(documentId);
			content = doc.content;
			initialContent = doc.content;
			debouncedContent = doc.content;
			// Reset auto-save state when loading new document
			autoSave.reset();
		} catch {
			toast.error('Failed to load document');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		// Load auto-save setting from localStorage
		const savedAutoSave = localStorage.getItem('auto-save');
		if (savedAutoSave !== null) {
			autoSaveEnabled = savedAutoSave === 'true';
		}

		// Load line numbers setting from localStorage
		const savedLineNumbers = localStorage.getItem('line-numbers');
		if (savedLineNumbers !== null) {
			showLineNumbers = savedLineNumbers === 'true';
		}

		// Listen for storage events (when settings change)
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'auto-save' && e.newValue !== null) {
				autoSaveEnabled = e.newValue === 'true';
			}
			if (e.key === 'line-numbers' && e.newValue !== null) {
				showLineNumbers = e.newValue === 'true';
			}
		};
		window.addEventListener('storage', handleStorageChange);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	});

	// Cleanup debounce timer and auto-save
	onDestroy(() => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		autoSave.cancelPendingSave();
	});
</script>

{#if loading}
	<div class="flex h-full items-center justify-center bg-zinc-900">
		<p class="text-zinc-400">Loading document...</p>
	</div>
{:else}
	<div class="flex h-full flex-1">
		<!-- Editor Section -->
		<div class="flex flex-1 flex-col border-r border-zinc-700">
			<EditorToolbar onFormat={handleFormat} isDirty={isDirty} onManualSave={handleManualSave} />
			<MarkdownEditor 
				bind:this={editorRef} 
				value={content} 
				onChange={updateDebouncedContent} 
				onSave={handleManualSave}
				{showLineNumbers}
			/>
		</div>

		<!-- Preview Section (Desktop) -->
		<div class="hidden flex-1 overflow-auto lg:block">
			<MarkdownPreview markdown={debouncedContent} />
		</div>

		<!-- TODO: Mobile tabs for editor/preview toggle -->
	</div>
{/if}
