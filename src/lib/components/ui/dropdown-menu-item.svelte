<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	type DropdownMenuItemProps = {
		onclick?: (e: Event) => void;
		disabled?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
	};

	let {
		onclick,
		disabled = false,
		class: className,
		children,
		...restProps
	}: DropdownMenuItemProps = $props();
</script>

<DropdownMenuPrimitive.Item
	{onclick}
	{disabled}
	class={cn(
		'relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</DropdownMenuPrimitive.Item>
