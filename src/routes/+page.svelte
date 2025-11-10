<script lang="ts">
	import { onMount } from 'svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { responsiveStore } from '$lib/stores/responsive.svelte';
	import { rulerStore } from '$lib/stores/ruler.svelte';
	import { AutoSave } from '$lib/utils/auto-save.svelte';
	import { Sidebar, SidebarBackdrop } from '$lib/components/Sidebar';
	import { TopMenu } from '$lib/components/TopMenu';
	import { DocumentEditor } from '$lib/components/Editor';
	import { quillmarkService, resultToBlob, resultToSVGPages } from '$lib/services/quillmark';
	import { runGuestFirstVisitActions } from '$lib/services/guest';
	import { loginClient } from '$lib/services/auth';

	let user = $state<{ email: string; id: string } | null>(null);
	let autoSave = new AutoSave();
	let showDocumentInfo = $state(false);
	let showImportDialog = $state(false);
	let showShareModal = $state(false);
	let showAboutModal = $state(false);
	let showTermsModal = $state(false);
	let showPrivacyModal = $state(false);
	let documentContent = $state('');
	let documentName = $state('');
	let hasSuccessfulPreview = $state(false);
	let newDocDialogOpen = $state(false);
	let sidebarExpanded = $state(false);

	// Use centralized responsive store
	const isMobile = $derived(responsiveStore.isMobile);

	// Clear document name when no active document
	$effect(() => {
		if (documentStore.activeDocumentId === null) {
			documentName = '';
		}
	});

	onMount(() => {
		// Initialize responsive store
		responsiveStore.initialize();
		// Show classification message
		toastStore.info('This system is not authorized for controlled information.', {
			duration: 10000
		});

		// Run auth check and document fetch in background (non-blocking)
		(async () => {
			try {
				// Check authentication status using centralized auth service
				// This automatically checks the is_authenticated cookie first to prevent
				// unnecessary 401 errors in guest mode
				const currentUser = await loginClient.getCurrentUser();

				if (currentUser) {
					// User is authenticated
					user = currentUser;
					documentStore.setGuestMode(false);
				} else {
					// Guest mode - no authentication
					documentStore.setGuestMode(true);
					await runGuestFirstVisitActions().catch((error) => {
						console.error('Failed to run guest first visit actions:', error);
					});
				}

				// Fetch documents (from API or LocalStorage depending on mode)
				await documentStore.fetchDocuments();
			} catch {
				// Guest mode on error
				documentStore.setGuestMode(true);

				// Run guest first visit actions (mirrors runFirstLoginActions for authenticated users)
				// Must await to ensure welcome document is created before fetching
				await runGuestFirstVisitActions().catch((error) => {
					console.error('Failed to run guest first visit actions:', error);
				});

				// Fetch from LocalStorage
				await documentStore.fetchDocuments();
			}
		})();
	});

	async function handleDownload() {
		if (!documentStore.activeDocumentId || !hasSuccessfulPreview) return;

		try {
			// Fetch full document with content
			const doc = await documentStore.fetchDocument(documentStore.activeDocumentId);

			// Render using Quillmark service (auto-detects backend and format)
			const result = await quillmarkService.render(doc.content, 'pdf');

			// Convert to blob based on format
			let blob: Blob;
			let extension: string;

			if (result.outputFormat === 'pdf') {
				blob = resultToBlob(result);
				extension = '.pdf';
			} else if (result.outputFormat === 'svg') {
				// For SVG, download the first page
				const svgPages = resultToSVGPages(result);
				blob = new Blob([svgPages[0]], { type: 'image/svg+xml' });
				extension = '.svg';
			} else {
				// Fallback to markdown
				blob = new Blob([doc.content], { type: 'text/markdown' });
				extension = '.md';
			}

			// Create filename with proper extension
			const baseName = doc.name.replace(/\.(md|markdown)$/i, '');
			const filename = baseName + extension;

			// Download
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Download failed:', error);
			toastStore.error('Failed to download document');
		}
	}

	function handleContentChange(content: string) {
		documentContent = content;
	}

	function handleDocumentLoad(doc: { name: string; content: string }) {
		// Document load: sync both name and initial content
		documentName = doc.name;
		documentContent = doc.content;
	}

	function handleTitleChange(newTitle: string) {
		// Title rename: update name immediately
		documentName = newTitle;
	}

	function handleDocumentInfo() {
		showImportDialog = false; // Dismiss any existing preview modal
		rulerStore.setActive(false); // Dismiss ruler overlay
		showDocumentInfo = true;
	}

	function handleImport() {
		showDocumentInfo = false; // Dismiss any existing preview modal
		rulerStore.setActive(false); // Dismiss ruler overlay
		showImportDialog = true;
	}

	function handleRulerToggle() {
		showDocumentInfo = false; // Dismiss any existing preview modal
		showImportDialog = false; // Dismiss any existing preview modal
		rulerStore.toggle();
	}

	function handleShare() {
		showDocumentInfo = false; // Dismiss any existing preview modal
		showImportDialog = false; // Dismiss any existing preview modal
		rulerStore.setActive(false); // Dismiss ruler overlay
		showShareModal = true;
	}

	function handleAbout() {
		showDocumentInfo = false; // Dismiss any existing preview modal
		showImportDialog = false; // Dismiss any existing preview modal
		showShareModal = false; // Dismiss any existing preview modal
		rulerStore.setActive(false); // Dismiss ruler overlay
		showAboutModal = true;
	}

	function handleTerms() {
		showDocumentInfo = false; // Dismiss any existing preview modal
		showImportDialog = false; // Dismiss any existing preview modal
		showShareModal = false; // Dismiss any existing preview modal
		rulerStore.setActive(false); // Dismiss ruler overlay
		showTermsModal = true;
	}

	function handlePrivacy() {
		showDocumentInfo = false; // Dismiss any existing preview modal
		showImportDialog = false; // Dismiss any existing preview modal
		showShareModal = false; // Dismiss any existing preview modal
		rulerStore.setActive(false); // Dismiss ruler overlay
		showPrivacyModal = true;
	}

	function handlePreviewStatusChange(status: boolean) {
		hasSuccessfulPreview = status;
	}

	function handleCreateNewDocument() {
		newDocDialogOpen = true;
	}

	function handleCollapseSidebar() {
		sidebarExpanded = false;
	}

	function handleGlobalKeyDown(event: KeyboardEvent) {
		// Only collapse sidebar with Escape if it's expanded and in mobile mode
		// Don't interfere with modals or other overlays
		if (event.key === 'Escape' && isMobile && sidebarExpanded) {
			// Check if any modals are open - if so, don't collapse sidebar
			const hasOpenModal =
				showDocumentInfo ||
				showImportDialog ||
				showShareModal ||
				showAboutModal ||
				showTermsModal ||
				showPrivacyModal;

			if (!hasOpenModal) {
				handleCollapseSidebar();
			}
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKeyDown} />

<div class="flex h-dvh bg-background">
	<!-- Sidebar -->
	<Sidebar {user} bind:newDocDialogOpen bind:isExpanded={sidebarExpanded} />

	<!-- Backdrop overlay (only on mobile when sidebar is expanded) -->
	<SidebarBackdrop visible={isMobile && sidebarExpanded} onClick={handleCollapseSidebar} />

	<!-- Main Content -->
	<main class="z-content flex flex-1 flex-col" style="margin-left: {isMobile ? '48px' : '0'};">
		<!-- Top Menu -->
		<TopMenu
			fileName={documentName}
			onDownload={handleDownload}
			saveStatus={autoSave.saveState.status}
			saveError={autoSave.saveState.errorMessage}
			onDocumentInfo={handleDocumentInfo}
			onTitleChange={handleTitleChange}
			onRulerToggle={handleRulerToggle}
			onShare={handleShare}
			onAbout={handleAbout}
			onTerms={handleTerms}
			onPrivacy={handlePrivacy}
			{hasSuccessfulPreview}
			hasActiveEditor={!!documentStore.activeDocumentId}
		/>

		<!-- Editor and Preview Area -->
		<div class="flex flex-1 overflow-hidden" role="main" aria-label="Document editor">
			<DocumentEditor
				documentId={documentStore.activeDocumentId ?? null}
				hasActiveDocument={!!documentStore.activeDocumentId}
				{autoSave}
				onContentChange={handleContentChange}
				onDocumentLoad={handleDocumentLoad}
				{showDocumentInfo}
				onDocumentInfoChange={(open) => (showDocumentInfo = open)}
				{showImportDialog}
				onImportDialogChange={(open) => (showImportDialog = open)}
				{showShareModal}
				onShareModalChange={(open) => (showShareModal = open)}
				{showAboutModal}
				onAboutModalChange={(open) => (showAboutModal = open)}
				{showTermsModal}
				onTermsModalChange={(open) => (showTermsModal = open)}
				{showPrivacyModal}
				onPrivacyModalChange={(open) => (showPrivacyModal = open)}
				onPreviewStatusChange={handlePreviewStatusChange}
				onCreateNewDocument={handleCreateNewDocument}
			/>
		</div>
	</main>
</div>
