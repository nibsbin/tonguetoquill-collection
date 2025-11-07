<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { responsiveStore } from '$lib/stores/responsive.svelte';
	import { AutoSave } from '$lib/utils/auto-save.svelte';
	import { EditorToolbar, MarkdownEditor } from '$lib/components/Editor';
	import { Preview } from '$lib/components/Preview';
	import DocumentInfoDialog from '$lib/components/DocumentInfoDialog.svelte';
	import ImportFileDialog from '$lib/components/ImportFileDialog.svelte';
	import ShareModal from '$lib/components/ShareModal.svelte';
	import AboutModal from '$lib/components/AboutModal.svelte';
	import TermsModal from '$lib/components/TermsModal.svelte';
	import PrivacyModal from '$lib/components/PrivacyModal.svelte';

	interface Props {
		documentId: string | null;
		hasActiveDocument: boolean;
		autoSave: AutoSave;
		onContentChange?: (content: string) => void;
		onDocumentLoad?: (doc: { name: string; content: string }) => void;
		showDocumentInfo?: boolean;
		onDocumentInfoChange?: (open: boolean) => void;
		showImportDialog?: boolean;
		onImportDialogChange?: (open: boolean) => void;
		showShareModal?: boolean;
		onShareModalChange?: (open: boolean) => void;
		showAboutModal?: boolean;
		onAboutModalChange?: (open: boolean) => void;
		showTermsModal?: boolean;
		onTermsModalChange?: (open: boolean) => void;
		showPrivacyModal?: boolean;
		onPrivacyModalChange?: (open: boolean) => void;
		onPreviewStatusChange?: (hasSuccessfulPreview: boolean) => void;
		onCreateNewDocument?: () => void;
	}

	let {
		documentId,
		hasActiveDocument,
		autoSave,
		onContentChange,
		onDocumentLoad,
		showDocumentInfo = false,
		onDocumentInfoChange,
		showImportDialog = false,
		onImportDialogChange,
		showShareModal = false,
		onShareModalChange,
		showAboutModal = false,
		onAboutModalChange,
		showTermsModal = false,
		onTermsModalChange,
		showPrivacyModal = false,
		onPrivacyModalChange,
		onPreviewStatusChange,
		onCreateNewDocument
	}: Props = $props();

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
	let hasSuccessfulPreview = $state(false);

	// Use centralized responsive store
	const isMobile = $derived(responsiveStore.isMobile);

	// Handler for preview status changes
	function handlePreviewStatusChange(status: boolean) {
		hasSuccessfulPreview = status;
		if (onPreviewStatusChange) {
			onPreviewStatusChange(status);
		}
	}

	// Track dirty state (unsaved changes)
	let isDirty = $derived(content !== initialContent);

	// Watch for document changes and handle unsaved changes
	$effect(() => {
		// Skip if no document is active
		if (!hasActiveDocument || documentId === null) {
			// Clear content for empty state
			if (previousDocumentId !== null) {
				content = '';
				initialContent = '';
				debouncedContent = '';
				autoSave.reset();
			}
			previousDocumentId = null;
			loading = false;
			return;
		}

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

		// Trigger auto-save (only if document is active)
		if (hasActiveDocument && documentId !== null) {
			autoSave.scheduleSave(documentId, newContent, autoSaveEnabled);
		}

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
		if (!isDirty || !documentId) return;

		try {
			await autoSave.saveNow(documentId, content);
			initialContent = content;
		} catch {
			toastStore.error('Failed to save document');
		}
	}

	// Handle file import
	function handleImport(importedContent: string, filename: string) {
		// Check for unsaved changes
		if (isDirty) {
			const confirmed = confirm(
				'You have unsaved changes. Importing will replace your current content. Continue?'
			);
			if (!confirmed) {
				return;
			}
		}

		// Update content
		content = importedContent;
		initialContent = importedContent;
		debouncedContent = importedContent;

		// Trigger auto-save
		if (documentId) {
			autoSave.scheduleSave(documentId, importedContent, autoSaveEnabled);
		}

		// Notify parent of content change
		if (onContentChange) {
			onContentChange(importedContent);
		}

		toastStore.success(`Imported ${filename}`);
	}

	// Load document content
	async function loadDocument() {
		// Guard: Don't load if no document active
		if (!hasActiveDocument || documentId === null) {
			loading = false;
			return;
		}

		loading = true;
		try {
			// Skip loading for temporary documents (they don't exist yet)
			if (documentId.startsWith('temp-')) {
				// Get document metadata from store
				const metadata = documentStore.activeDocument;
				content = '';
				initialContent = '';
				debouncedContent = '';
				autoSave.reset();
				if (onDocumentLoad && metadata) {
					onDocumentLoad({ name: metadata.name, content: '' });
				}
				loading = false;
				return;
			}

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
			toastStore.error('Failed to load document');
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

		// Initialize responsive store (safe to call multiple times)
		responsiveStore.initialize();

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

		// Load the initial document content
		// This ensures the first document loads properly on mount
		previousDocumentId = documentId;
		loadDocument();

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

<div
	class="relative flex h-full flex-1 flex-col"
	aria-busy={loading}
	aria-disabled={!hasActiveDocument}
>
	<!-- Editor content (dimmed when loading or no document) -->
	<div
		class="flex h-full flex-1 flex-col transition-opacity duration-300 ease-in-out {loading ||
		!hasActiveDocument
			? 'pointer-events-none opacity-50'
			: ''}"
	>
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
				class="relative flex flex-1 flex-col border-r border-border {isMobile &&
				mobileView !== 'editor'
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

				<!-- Empty State Overlay (shown when no document) -->
				{#if !hasActiveDocument}
					<div
						class="pointer-events-auto absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[1px] transition-opacity duration-300 ease-in-out"
						role="status"
						aria-live="polite"
					>
						<div class="px-4 text-center">
							<p class="mt-2 text-sm text-muted-foreground">
								Select a document from the sidebar or
								{#if onCreateNewDocument}
									<button
										type="button"
										class="text-primary underline hover:text-primary/80 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
										onclick={onCreateNewDocument}
										aria-label="Create a new document"
									>
										create a new one
									</button>
								{:else}
									create a new one
								{/if}
							</p>
						</div>
					</div>
				{/if}
			</div>

			<!-- Preview Section (Desktop: always visible, Mobile: toggled) -->
			<div
				class="relative flex-1 overflow-auto {isMobile
					? mobileView === 'preview'
						? ''
						: 'hidden'
					: ''}"
			>
				<Preview markdown={debouncedContent} onPreviewStatusChange={handlePreviewStatusChange} />

				<!-- Document Info Dialog (scoped to preview pane) -->
				{#if showDocumentInfo !== undefined && onDocumentInfoChange}
					<DocumentInfoDialog
						open={showDocumentInfo}
						document={documentStore.activeDocument}
						{content}
						onOpenChange={onDocumentInfoChange}
					/>
				{/if}

				<!-- Import File Dialog (scoped to preview pane) -->
				{#if showImportDialog !== undefined && onImportDialogChange}
					<ImportFileDialog
						open={showImportDialog}
						onOpenChange={onImportDialogChange}
						onImport={handleImport}
					/>
				{/if}

				<!-- Share Modal (scoped to preview pane) -->
				{#if showShareModal !== undefined && onShareModalChange}
					<ShareModal open={showShareModal} onOpenChange={onShareModalChange} />
				{/if}

				<!-- About Modal (scoped to preview pane) -->
				{#if showAboutModal !== undefined && onAboutModalChange}
					<AboutModal open={showAboutModal} onOpenChange={onAboutModalChange} />
				{/if}

				<!-- Terms Modal (scoped to preview pane) -->
				{#if showTermsModal !== undefined && onTermsModalChange}
					<TermsModal open={showTermsModal} onOpenChange={onTermsModalChange} />
				{/if}

				<!-- Privacy Modal (scoped to preview pane) -->
				{#if showPrivacyModal !== undefined && onPrivacyModalChange}
					<PrivacyModal open={showPrivacyModal} onOpenChange={onPrivacyModalChange} />
				{/if}
			</div>
		</div>
	</div>
</div>
