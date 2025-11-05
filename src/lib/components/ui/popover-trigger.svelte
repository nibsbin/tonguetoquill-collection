<script lang="ts">
	import { Popover as PopoverPrimitive } from 'bits-ui';

	type PopoverTriggerProps = {
		children?: import('svelte').Snippet;
		class?: string;
		asChild?: boolean;
	};

	let { children, class: className, asChild, ...restProps }: PopoverTriggerProps = $props();
</script>

<PopoverPrimitive.Trigger class={className} {asChild} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</PopoverPrimitive.Trigger>
