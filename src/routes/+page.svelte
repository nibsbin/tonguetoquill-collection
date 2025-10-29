<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { onMount } from 'svelte';

	let user = $state<{ email: string; id: string } | null>(null);
	let loading = $state(true);
	let showGuestBanner = $state(true);

	onMount(async () => {
		try {
			const response = await fetch('/api/auth/me');
			if (response.ok) {
				const data = await response.json();
				user = data.user;
			}
			// Don't redirect if not authenticated - allow guest mode
		} catch {
			// Guest mode - no authentication required
		} finally {
			loading = false;
		}

		// Check if user has dismissed the guest banner
		const dismissed = localStorage.getItem('guest-banner-dismissed');
		if (dismissed === 'true') {
			showGuestBanner = false;
		}
	});

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		user = null;
		// Stay on the same page, just switch to guest mode
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
	<div class="flex min-h-screen flex-col bg-zinc-50">
		<!-- Top Navigation -->
		<header class="border-b border-zinc-200 bg-white">
			<div class="flex h-16 items-center justify-between px-4">
				<h1 class="text-xl font-semibold text-zinc-900">Tonguetoquill</h1>
				<div class="flex items-center gap-4">
					{#if user}
						<span class="text-sm text-zinc-600">{user.email}</span>
						<button
							onclick={handleLogout}
							class="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
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
			</div>
		</header>

		<!-- Guest Mode Banner -->
		{#if !user && showGuestBanner}
			<div class="border-b border-blue-200 bg-blue-50 px-4 py-3">
				<div class="mx-auto flex max-w-4xl items-start gap-3">
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

		<!-- Main Content Area -->
		<main class="flex-1 p-8">
			<div class="mx-auto max-w-4xl">
				<h2 class="text-2xl font-bold text-zinc-900">
					{user ? 'Welcome to your workspace' : 'Welcome to Tonguetoquill'}
				</h2>
				<p class="mt-2 text-zinc-600">
					{user
						? 'Your documents are synced to your account.'
						: 'Create and edit documents right away. Sign in to sync across devices.'}
				</p>

				<div class="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
					<h3 class="font-semibold text-zinc-900">Implementation Status</h3>
					<ul class="mt-4 space-y-2 text-sm text-zinc-600">
						<li>✅ Authentication system with mock providers</li>
						<li>✅ Document service backend with API routes</li>
						<li>✅ Login and registration pages</li>
						<li>✅ Optional authentication with guest mode</li>
						<li>✅ Guest mode banner and auth state in header</li>
						<li>⏳ Document list sidebar (Phase 5)</li>
						<li>⏳ Markdown editor (Phase 6)</li>
						<li>⏳ Auto-save functionality (Phase 7)</li>
						<li>⏳ LocalStorage document support for guests (Phase 5)</li>
					</ul>
				</div>

				{#if !user}
					<div class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6">
						<h3 class="font-semibold text-amber-900">Guest Mode Features</h3>
						<p class="mt-2 text-sm text-amber-800">
							In guest mode, you can explore the app and create documents. However, your documents
							are only stored locally in your browser. To save your work across devices and access
							advanced features, please sign in or create an account.
						</p>
						<div class="mt-4">
							<a
								href="/register"
								class="inline-block rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
							>
								Create Free Account
							</a>
						</div>
					</div>
				{/if}
			</div>
		</main>
	</div>
{/if}
