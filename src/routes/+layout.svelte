<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import Toast from '$lib/components/ui/toast.svelte';
	import { templateService } from '$lib/services/templates';

	let { children } = $props();

	onMount(async () => {
		try {
			await templateService.initialize();
			console.log('Template service initialized');
		} catch (error) {
			console.error('Failed to initialize template service:', error);
			// Service will gracefully degrade - blank documents still work
		}
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

{@render children?.()}

<!-- Toast notifications -->
<Toast position="bottom-right" />
