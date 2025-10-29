<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	type DropdownMenuProps = {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		children?: import('svelte').Snippet;
	};

	let { open = $bindable(false), onOpenChange, children }: DropdownMenuProps = $props();
</script>

<DropdownMenuPrimitive.Root bind:open {onOpenChange}>
	{#if children}
		{@render children()}
	{/if}
</DropdownMenuPrimitive.Root>
