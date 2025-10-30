<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	type DialogContentProps = {
		class?: string;
		children?: import('svelte').Snippet;
	};

	let { class: className, children, ...restProps }: DialogContentProps = $props();
</script>

<DialogPrimitive.Portal>
	<DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-black/50" />
	<DialogPrimitive.Content
		class={cn(
			'fixed top-[50%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border border-border bg-background p-6 shadow-lg',
			className
		)}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{/if}
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
