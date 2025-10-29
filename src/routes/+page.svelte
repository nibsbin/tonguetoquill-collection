<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect to login page
		goto('/auth/login');
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-zinc-50">
	<div class="text-center">
		<h1 class="text-4xl font-bold text-zinc-900">Welcome to Tonguetoquill</h1>
		<p class="mt-4 text-zinc-600">Redirecting to login...</p>
	</div>
</div>
