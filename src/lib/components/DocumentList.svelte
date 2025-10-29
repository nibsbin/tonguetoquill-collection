<script lang="ts">
	import { documentStore } from '$lib/stores/documents.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import Dialog from './Dialog.svelte';

	let showDeleteDialog = $state(false);
	let documentToDelete = $state<string | null>(null);

	async function handleCreateDocument() {
		try {
			await documentStore.createDocument();
			toastStore.success('Document created');
		} catch {
			toastStore.error('Failed to create document');
		}
	}

	function confirmDelete(id: string) {
		documentToDelete = id;
		showDeleteDialog = true;
	}

	async function handleDelete() {
		if (!documentToDelete) return;

		try {
			await documentStore.deleteDocument(documentToDelete);
			toastStore.success('Document deleted');
		} catch {
			toastStore.error('Failed to delete document');
		} finally {
			showDeleteDialog = false;
			documentToDelete = null;
		}
	}

	function handleSelectDocument(id: string) {
		documentStore.setActiveDocumentId(id);
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<aside class="flex h-full w-56 flex-col border-r border-border bg-background">
	<div class="border-b border-border p-4">
		<button
			onclick={handleCreateDocument}
			class="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
		>
			+ New Document
		</button>
	</div>

	<div class="flex-1 overflow-y-auto">
		{#if documentStore.isLoading}
			<div class="p-4 text-center text-sm text-muted-foreground">Loading...</div>
		{:else if documentStore.error}
			<div class="p-4 text-center">
				<p class="mb-2 text-sm text-red-600">{documentStore.error}</p>
				<button
					onclick={() => documentStore.fetchDocuments()}
					class="text-sm text-blue-600 hover:underline"
				>
					Retry
				</button>
			</div>
		{:else if documentStore.documents.length === 0}
			<div class="p-4 text-center text-sm text-muted-foreground">
				<p class="mb-2">No documents yet</p>
				<p class="text-xs">Create your first document to get started</p>
			</div>
		{:else}
			<ul class="py-2">
				{#each documentStore.documents as document (document.id)}
					<li class="group relative">
						<button
							onclick={() => handleSelectDocument(document.id)}
							class="flex w-full flex-col gap-1 px-4 py-2 text-left transition-colors hover:bg-accent focus:bg-accent focus:outline-none {documentStore.activeDocumentId ===
							document.id
								? 'bg-blue-50 text-blue-900'
								: 'text-foreground'}"
						>
							<div class="flex items-start justify-between gap-2">
								<span class="flex-1 truncate text-sm font-medium">{document.name}</span>
							</div>
							<span class="text-xs text-muted-foreground">{formatDate(document.created_at)}</span>
						</button>
						<button
							onclick={(e) => {
								e.stopPropagation();
								confirmDelete(document.id);
							}}
							class="absolute top-2 right-4 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600 focus:opacity-100 focus:outline-none"
							aria-label="Delete document"
						>
							<span class="text-lg leading-none" aria-hidden="true">×</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</aside>

<Dialog
	open={showDeleteDialog}
	title="Delete Document"
	description="Are you sure you want to delete this document? This action cannot be undone."
	onClose={() => {
		showDeleteDialog = false;
		documentToDelete = null;
	}}
>
	<div class="flex justify-end gap-2">
		<button
			onclick={() => {
				showDeleteDialog = false;
				documentToDelete = null;
			}}
			class="rounded-lg border border-input px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-surface focus:ring-2 focus:ring-blue-500 focus:outline-none"
		>
			Cancel
		</button>
		<button
			onclick={handleDelete}
			class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
		>
			Delete
		</button>
	</div>
</Dialog>
