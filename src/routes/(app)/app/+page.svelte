<script lang="ts">
	import { onMount } from 'svelte';
	import { documentStore } from '$lib/stores/documents.svelte';
	import DocumentList from '$lib/components/DocumentList.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let user = $state<{ email: string; id: string } | null>(null);
	let loading = $state(true);

	onMount(async () => {
		try {
			const response = await fetch('/api/auth/me');
			if (response.ok) {
				const data = await response.json();
				user = data.user;

				// Fetch documents on load
				await documentStore.fetchDocuments();
			} else {
				// Redirect to login if not authenticated
				window.location.href = '/login';
			}
		} catch {
			window.location.href = '/login';
		} finally {
			loading = false;
		}
	});

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		window.location.href = '/login';
	}
</script>

{#if loading}
	<div class="flex min-h-screen items-center justify-center bg-zinc-50">
		<p class="text-zinc-600">Loading...</p>
	</div>
{:else if user}
	<div class="flex h-screen flex-col">
		<!-- Top Menu Bar -->
		<header class="flex h-12 items-center justify-between border-b border-zinc-200 bg-white px-4">
			<div class="flex items-center gap-3">
				<h1 class="text-lg font-semibold text-zinc-900">Tonguetoquill</h1>
				{#if documentStore.activeDocument}
					<span class="text-sm text-zinc-500">•</span>
					<span class="text-sm text-zinc-700">{documentStore.activeDocument.name}</span>
				{/if}
			</div>
			<div class="flex items-center gap-3">
				<span class="text-sm text-zinc-600">{user.email}</span>
				<button
					onclick={handleLogout}
					class="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				>
					Logout
				</button>
			</div>
		</header>

		<!-- Main Layout: Sidebar + Content -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Document List Sidebar -->
			<DocumentList />

			<!-- Main Content Area -->
			<main class="flex-1 overflow-auto bg-zinc-50 p-8">
				{#if !documentStore.activeDocumentId}
					<div class="flex h-full items-center justify-center">
						<div class="text-center">
							<h2 class="text-xl font-semibold text-zinc-700">No Document Selected</h2>
							<p class="mt-2 text-sm text-zinc-500">
								Select a document from the sidebar or create a new one
							</p>
						</div>
					</div>
				{:else}
					<div class="mx-auto max-w-4xl">
						<h2 class="text-2xl font-bold text-zinc-900">Document Editor</h2>
						<p class="mt-2 text-sm text-zinc-600">
							Editor and preview will be implemented in Phase 6
						</p>
						<div class="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
							<p class="text-sm text-zinc-600">Document ID: {documentStore.activeDocumentId}</p>
							<p class="text-sm text-zinc-600">
								Document Name: {documentStore.activeDocument?.name || 'Unknown'}
							</p>
						</div>
					</div>
				{/if}
			</main>
		</div>
	</div>

	<!-- Toast Notifications -->
	<Toast />
{/if}
