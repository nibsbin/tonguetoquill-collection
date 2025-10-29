<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { AutoSave } from '$lib/utils/auto-save.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import TopMenu from '$lib/components/TopMenu.svelte';
	import DocumentEditor from '$lib/components/DocumentEditor.svelte';

	let user = $state<{ email: string; id: string } | null>(null);
	let loading = $state(true);
	let autoSave = new AutoSave();

	onMount(async () => {
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
</script>

{#if loading}
	<div class="flex min-h-screen items-center justify-center bg-zinc-900">
		<p class="text-zinc-400">Loading...</p>
	</div>
{:else}
	<div class="flex h-screen bg-zinc-900">
		<!-- Sidebar -->
		<Sidebar {user} />

		<!-- Main Content -->
		<div class="flex flex-1 flex-col">
			<!-- Top Menu -->
			<TopMenu
				fileName={documentStore.activeDocument?.name || 'Untitled'}
				onDownload={handleDownload}
				saveStatus={autoSave.saveState.status}
				saveError={autoSave.saveState.errorMessage}
			/>

			<!-- Editor and Preview Area -->
			<div class="flex flex-1 overflow-hidden">
				{#if !documentStore.activeDocumentId}
					<div class="flex h-full flex-1 items-center justify-center">
						<div class="text-center">
							<h2 class="text-xl font-semibold text-zinc-300">No Document Selected</h2>
							<p class="mt-2 text-sm text-zinc-500">
								Select a document from the sidebar or create a new one
							</p>
						</div>
					</div>
				{:else}
					<DocumentEditor documentId={documentStore.activeDocumentId} {autoSave} />
				{/if}
			</div>
		</div>
	</div>

	<!-- Toast Notifications using Sonner -->
	<Toaster theme="dark" />
{/if}
