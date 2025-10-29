<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';

	const iconMap = {
		success: '✓',
		error: '✗',
		info: 'ℹ',
		warning: '⚠'
	};

	const colorMap = {
		success: 'bg-green-600 text-white',
		error: 'bg-red-600 text-white',
		info: 'bg-blue-600 text-white',
		warning: 'bg-yellow-600 text-black'
	};
</script>

<div class="fixed right-4 bottom-4 z-50 flex flex-col gap-2" role="region" aria-live="polite">
	{#each toastStore.toasts as toast (toast.id)}
		<div
			class="flex min-w-64 items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all {colorMap[
				toast.type
			]}"
			role="alert"
		>
			<span class="text-xl font-bold" aria-hidden="true">
				{iconMap[toast.type]}
			</span>
			<p class="flex-1 text-sm">{toast.message}</p>
			<button
				onclick={() => toastStore.dismiss(toast.id)}
				class="rounded p-1 hover:bg-black/10 focus:ring-2 focus:ring-white focus:outline-none"
				aria-label="Dismiss"
			>
				<span class="text-lg" aria-hidden="true">×</span>
			</button>
		</div>
	{/each}
</div>
