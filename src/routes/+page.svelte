<script lang="ts">
	import { onMount } from 'svelte';
	import { Toaster, toast } from 'svelte-sonner';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { AutoSave } from '$lib/utils/auto-save.svelte';
	import { Sidebar } from '$lib/components/Sidebar';
	import { TopMenu } from '$lib/components/TopMenu';
	import { DocumentEditor } from '$lib/components/Editor';
	import DocumentInfoDialog from '$lib/components/DocumentInfoDialog.svelte';

	let user = $state<{ email: string; id: string } | null>(null);
	let loading = $state(true);
	let autoSave = new AutoSave();
	let showDocumentInfo = $state(false);
	let documentContent = $state('');
	let documentName = $state('');

	onMount(async () => {
		// Show classification message
		toast.info('This system is not authorized for controlled information.', {
			duration: 10000,
			position: 'top-center'
		});

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
		} finally {
			loading = false;
		}
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
		showDocumentInfo = true;
	}
</script>

{#if loading}
	<div class="flex min-h-screen items-center justify-center bg-background">
		<p class="text-muted-foreground">Loading...</p>
	</div>
{:else}
	<!-- Skip to main content link (for accessibility) -->
	<a
		href="#main-content"
		class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
	>
		Skip to main content
	</a>

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
			/>

			<!-- Editor and Preview Area -->
			<div
				id="main-content"
				class="flex flex-1 overflow-hidden"
				role="main"
				aria-label="Document editor"
			>
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
					/>
				{/if}
			</div>
		</div>
	</div>

	<!-- Document Info Dialog -->
	<DocumentInfoDialog
		open={showDocumentInfo}
		document={documentStore.activeDocument}
		content={documentContent}
		onOpenChange={(open) => (showDocumentInfo = open)}
	/>

	<!-- Toast Notifications using Sonner -->
	<Toaster theme="dark" />
{/if}
