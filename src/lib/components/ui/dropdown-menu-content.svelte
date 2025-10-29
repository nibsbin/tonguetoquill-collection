<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	type DropdownMenuContentProps = {
		align?: 'start' | 'center' | 'end';
		sideOffset?: number;
		class?: string;
		children?: import('svelte').Snippet;
	};

	let {
		align = 'center',
		sideOffset = 4,
		class: className,
		children,
		...restProps
	}: DropdownMenuContentProps = $props();
</script>

<DropdownMenuPrimitive.Content
	{align}
	{sideOffset}
	class={cn(
		'z-50 min-w-[8rem] overflow-hidden rounded-md border border-zinc-700 bg-zinc-800 p-1 text-zinc-100 shadow-md',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</DropdownMenuPrimitive.Content>
