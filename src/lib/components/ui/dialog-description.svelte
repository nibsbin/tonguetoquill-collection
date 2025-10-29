<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	type DialogDescriptionProps = {
		class?: string;
		children?: import('svelte').Snippet;
	};

	let { class: className, children, ...restProps }: DialogDescriptionProps = $props();
</script>

<DialogPrimitive.Description class={cn('text-sm text-muted-foreground', className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</DialogPrimitive.Description>
