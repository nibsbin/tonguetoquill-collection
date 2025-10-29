<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { onMount } from 'svelte';
	import { documentStore } from '$lib/stores/documents.svelte';
	import DocumentList from '$lib/components/DocumentList.svelte';
	import DocumentEditor from '$lib/components/DocumentEditor.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let user = $state<{ email: string; id: string } | null>(null);
	let loading = $state(true);
	let showGuestBanner = $state(false);

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

				// Check if user has dismissed the guest banner
				const dismissed = localStorage.getItem('guest-banner-dismissed');
				if (dismissed !== 'true') {
					showGuestBanner = true;
				}
			}

			// Fetch documents (from API or LocalStorage depending on mode)
			await documentStore.fetchDocuments();
		} catch {
			// Guest mode on error
			documentStore.setGuestMode(true);

			// Check if user has dismissed the guest banner
			const dismissed = localStorage.getItem('guest-banner-dismissed');
			if (dismissed !== 'true') {
				showGuestBanner = true;
			}

			// Fetch from LocalStorage
			await documentStore.fetchDocuments();
		} finally {
			loading = false;
		}
	});

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		user = null;
		documentStore.setGuestMode(true);
		// Reload to show guest documents
		window.location.reload();
	}

	function dismissGuestBanner() {
		showGuestBanner = false;
	}

	function dismissGuestBannerPermanently() {
		showGuestBanner = false;
		localStorage.setItem('guest-banner-dismissed', 'true');
	}
</script>

{#if loading}
	<div class="flex min-h-screen items-center justify-center bg-zinc-50">
		<p class="text-zinc-600">Loading...</p>
	</div>
{:else}
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
				{#if user}
					<span class="text-sm text-zinc-600">{user.email}</span>
					<button
						onclick={handleLogout}
						class="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						Logout
					</button>
				{:else}
					<a
						href="/login"
						class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
					>
						Sign In
					</a>
					<a href="/register" class="text-sm font-medium text-blue-600 hover:text-blue-500">
						Register
					</a>
				{/if}
			</div>
		</header>

		<!-- Guest Mode Banner -->
		{#if !user && showGuestBanner}
			<div class="border-b border-blue-200 bg-blue-50 px-4 py-3">
				<div class="mx-auto flex max-w-full items-start gap-3">
					<svg
						class="h-5 w-5 flex-shrink-0 text-blue-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
					<div class="flex-1">
						<p class="text-sm text-blue-800">
							You're working in guest mode. Your documents are saved locally in this browser.
							<a href="/login" class="font-semibold underline hover:text-blue-900">
								Sign in to sync
							</a>
							your work across devices.
						</p>
					</div>
					<div class="flex gap-2">
						<button
							onclick={dismissGuestBanner}
							class="text-sm text-blue-600 hover:text-blue-800"
							aria-label="Dismiss banner"
						>
							Dismiss
						</button>
						<button
							onclick={dismissGuestBannerPermanently}
							class="text-sm text-blue-600 hover:text-blue-800"
							aria-label="Don't show again"
						>
							Don't show again
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Main Layout: Sidebar + Content -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Document List Sidebar -->
			<DocumentList />

			<!-- Main Content Area -->
			<main class="flex-1 overflow-hidden bg-zinc-50">
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
					<DocumentEditor documentId={documentStore.activeDocumentId} />
				{/if}
			</main>
		</div>
	</div>

	<!-- Toast Notifications -->
	<Toast />
{/if}
