<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { toast } from 'svelte-sonner';
	import { AutoSave } from '$lib/utils/auto-save.svelte';
	import { EditorToolbar, MarkdownEditor } from '$lib/components/Editor';
	import { Preview } from '$lib/components/Preview';

	interface Props {
		documentId: string;
		autoSave: AutoSave;
		onContentChange?: (content: string) => void;
		onDocumentLoad?: (doc: { name: string; content: string }) => void;
	}

	let { documentId, autoSave, onContentChange, onDocumentLoad }: Props = $props();

	let content = $state('');
	let initialContent = $state('');
	let loading = $state(true);
	let debouncedContent = $state('');
	let debounceTimer: number | undefined;
	let editorRef = $state<MarkdownEditor | null>(null);
	let autoSaveEnabled = $state(true);
	let showLineNumbers = $state(true);
	let previousDocumentId = $state<string | null>(null);
	let mobileView = $state<'editor' | 'preview'>('editor');
	let isMobile = $state(false);

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

		// Notify parent of content change
		if (onContentChange) {
			onContentChange(newContent);
		}
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
			// Notify parent of document load (name + content)
			if (onDocumentLoad) {
				onDocumentLoad({ name: doc.name, content: doc.content });
			}
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

		// Check if mobile
		const checkMobile = () => {
			isMobile = window.innerWidth < 768;
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);

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
			window.removeEventListener('resize', checkMobile);
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

<div class="relative flex h-full flex-1 flex-col" aria-busy={loading}>
	<!-- Editor content (dimmed when loading) -->
	<div class="flex h-full flex-1 flex-col {loading ? 'pointer-events-none opacity-50' : ''}">
		<!-- Mobile Tab Switcher (< 768px) -->
		{#if isMobile}
			<div class="flex border-b border-border bg-surface-elevated">
				<button
					class="flex-1 px-4 py-2 text-sm font-medium transition-colors {mobileView === 'editor'
						? 'bg-accent text-foreground'
						: 'text-muted-foreground hover:text-foreground/80'}"
					onclick={() => (mobileView = 'editor')}
				>
					Editor
				</button>
				<button
					class="flex-1 px-4 py-2 text-sm font-medium transition-colors {mobileView === 'preview'
						? 'bg-accent text-foreground'
						: 'text-muted-foreground hover:text-foreground/80'}"
					onclick={() => (mobileView = 'preview')}
				>
					Preview
				</button>
			</div>
		{/if}

		<!-- Content Area -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Editor Section -->
			<div
				class="flex flex-1 flex-col border-r border-border {isMobile && mobileView !== 'editor'
					? 'hidden'
					: ''}"
			>
				<EditorToolbar onFormat={handleFormat} {isDirty} onManualSave={handleManualSave} />
				<MarkdownEditor
					bind:this={editorRef}
					value={content}
					onChange={updateDebouncedContent}
					onSave={handleManualSave}
					{showLineNumbers}
				/>
			</div>

			<!-- Preview Section (Desktop: always visible, Mobile: toggled) -->
			<div
				class="flex-1 overflow-auto {isMobile
					? mobileView === 'preview'
						? ''
						: 'hidden'
					: 'hidden lg:block'}"
			>
				<Preview markdown={debouncedContent} />
			</div>
		</div>
	</div>
</div>
