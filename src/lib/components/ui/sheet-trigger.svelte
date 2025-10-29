<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';

	type SheetTriggerProps = {
		children?: import('svelte').Snippet;
		class?: string;
	};

	let { children, class: className, ...restProps }: SheetTriggerProps = $props();
</script>

<DialogPrimitive.Trigger class={className} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</DialogPrimitive.Trigger>
