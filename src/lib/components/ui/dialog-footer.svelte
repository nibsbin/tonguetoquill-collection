<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type DialogFooterProps = {
		class?: string;
		children?: import('svelte').Snippet;
	};

	let { class: className, children, ...restProps }: DialogFooterProps = $props();
</script>

<div
	class={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
