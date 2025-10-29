<script lang="ts">
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	type PopoverContentProps = {
		side?: 'top' | 'right' | 'bottom' | 'left';
		align?: 'start' | 'center' | 'end';
		sideOffset?: number;
		class?: string;
		children?: import('svelte').Snippet;
	};

	let {
		side = 'bottom',
		align = 'center',
		sideOffset = 4,
		class: className,
		children,
		...restProps
	}: PopoverContentProps = $props();
</script>

<PopoverPrimitive.Content
	{side}
	{align}
	{sideOffset}
	class={cn(
		'z-50 w-72 rounded-md border border-border bg-surface-elevated p-4 text-foreground shadow-md outline-none',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</PopoverPrimitive.Content>
