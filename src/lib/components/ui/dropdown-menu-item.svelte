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
		'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-zinc-700 focus:text-zinc-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</DropdownMenuPrimitive.Item>
