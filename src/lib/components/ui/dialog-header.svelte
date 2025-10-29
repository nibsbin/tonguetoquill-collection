<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type DialogHeaderProps = {
		class?: string;
		children?: import('svelte').Snippet;
	};

	let { class: className, children, ...restProps }: DialogHeaderProps = $props();
</script>

<div class={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>
