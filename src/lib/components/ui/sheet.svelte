<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';

	type SheetProps = {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		children?: import('svelte').Snippet;
	};

	let { open = $bindable(false), onOpenChange, children }: SheetProps = $props();
</script>

<DialogPrimitive.Root bind:open {onOpenChange}>
	{#if children}
		{@render children()}
	{/if}
</DialogPrimitive.Root>
