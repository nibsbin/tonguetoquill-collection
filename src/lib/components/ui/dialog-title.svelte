<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	type DialogTitleProps = {
		class?: string;
		children?: import('svelte').Snippet;
	};

	let { class: className, children, ...restProps }: DialogTitleProps = $props();
</script>

<DialogPrimitive.Title
	class={cn('text-lg leading-none font-semibold tracking-tight', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</DialogPrimitive.Title>
