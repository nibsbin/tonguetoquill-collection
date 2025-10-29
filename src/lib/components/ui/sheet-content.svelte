<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	type SheetContentProps = {
		side?: 'left' | 'right' | 'top' | 'bottom';
		class?: string;
		children?: import('svelte').Snippet;
	};

	let { side = 'left', class: className, children, ...restProps }: SheetContentProps = $props();
</script>

<DialogPrimitive.Portal>
	<DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-black/50" />
	<DialogPrimitive.Content
		class={cn(
			'fixed z-50 bg-zinc-900 shadow-lg transition ease-in-out',
			side === 'left' && 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r border-zinc-700',
			side === 'right' && 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l border-zinc-700',
			side === 'top' && 'inset-x-0 top-0 border-b border-zinc-700',
			side === 'bottom' && 'inset-x-0 bottom-0 border-t border-zinc-700',
			className
		)}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{/if}
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
