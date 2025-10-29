<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let user = $state<{ email: string; id: string } | null>(null);
	let loading = $state(true);

	onMount(async () => {
		try {
			const response = await fetch('/api/auth/me');
			if (response.ok) {
				const data = await response.json();
				user = data.user;
			} else {
				goto('/auth/login');
			}
		} catch {
			goto('/auth/login');
		} finally {
			loading = false;
		}
	});

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		goto('/auth/login');
	}
</script>

{#if loading}
	<div class="flex min-h-screen items-center justify-center bg-zinc-50">
		<p class="text-zinc-600">Loading...</p>
	</div>
{:else if user}
	<div class="flex min-h-screen flex-col bg-zinc-50">
		<!-- Top Navigation -->
		<header class="border-b border-zinc-200 bg-white">
			<div class="flex h-16 items-center justify-between px-4">
				<h1 class="text-xl font-semibold text-zinc-900">Tonguetoquill</h1>
				<div class="flex items-center gap-4">
					<span class="text-sm text-zinc-600">{user.email}</span>
					<button
						onclick={handleLogout}
						class="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
					>
						Logout
					</button>
				</div>
			</div>
		</header>

		<!-- Main Content Area -->
		<main class="flex-1 p-8">
			<div class="mx-auto max-w-4xl">
				<h2 class="text-2xl font-bold text-zinc-900">Welcome to your workspace</h2>
				<p class="mt-2 text-zinc-600">
					Phase 4 foundation complete! Document editor coming in Phase 5-6.
				</p>

				<div class="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
					<h3 class="font-semibold text-zinc-900">Implementation Status</h3>
					<ul class="mt-4 space-y-2 text-sm text-zinc-600">
						<li>✅ Authentication system with mock providers</li>
						<li>✅ Document service backend with API routes</li>
						<li>✅ Login and registration pages</li>
						<li>✅ Basic application layout</li>
						<li>⏳ Document list sidebar (Phase 5)</li>
						<li>⏳ Markdown editor (Phase 6)</li>
						<li>⏳ Auto-save functionality (Phase 7)</li>
					</ul>
				</div>
			</div>
		</main>
	</div>
{/if}
