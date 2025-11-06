<script lang="ts">
	import { onMount } from 'svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { rulerStore } from '$lib/stores/ruler.svelte';
	import { AutoSave } from '$lib/utils/auto-save.svelte';
	import { Sidebar } from '$lib/components/Sidebar';
	import { TopMenu } from '$lib/components/TopMenu';
	import { DocumentEditor } from '$lib/components/Editor';

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

	onMount(() => {
		// Show classification message
		toastStore.info('This system is not authorized for controlled information.', {
			duration: 10000
		});

		// Run auth check and document fetch in background (non-blocking)
		(async () => {
			try {
				const response = await fetch('/api/auth/me');
				if (response.ok) {
					const data = await response.json();
					user = data.user;
					documentStore.setGuestMode(false);
				} else {
					// Guest mode - no authentication
					documentStore.setGuestMode(true);
				}

				// Fetch documents (from API or LocalStorage depending on mode)
				await documentStore.fetchDocuments();
			} catch {
				// Guest mode on error
				documentStore.setGuestMode(true);

				// Fetch from LocalStorage
				await documentStore.fetchDocuments();
			}
		})();
	});

	async function handleDownload() {
		if (!documentStore.activeDocumentId) return;

		// Fetch full document with content
		const doc = await documentStore.fetchDocument(documentStore.activeDocumentId);

		const blob = new Blob([doc.content], {
			type: 'text/markdown'
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = doc.name;
		a.click();
		URL.revokeObjectURL(url);
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
</script>

<div class="flex h-screen bg-background">
	<!-- Sidebar -->
	<Sidebar {user} />

	<!-- Main Content -->
	<div class="flex flex-1 flex-col">
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
		/>

		<!-- Editor and Preview Area -->
		<div class="flex flex-1 overflow-hidden" role="main" aria-label="Document editor">
			{#if !documentStore.activeDocumentId}
				<div class="flex h-full flex-1 items-center justify-center">
					<div class="text-center">
						<h2 class="text-xl font-semibold text-foreground/80">No Document Selected</h2>
						<p class="mt-2 text-sm text-muted-foreground">
							Select a document from the sidebar or create a new one
						</p>
					</div>
				</div>
			{:else}
				<DocumentEditor
					documentId={documentStore.activeDocumentId}
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
				/>
			{/if}
		</div>
	</div>
</div>
