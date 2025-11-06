<script lang="ts">
	import '../app.css';
	import Toast from '$lib/components/ui/toast.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

{@render children?.()}

<!-- Toast notifications -->
<Toast position="bottom-right" />
