<script lang="ts">
	import { Popover as PopoverPrimitive } from 'bits-ui';

	type PopoverTriggerProps = {
		children?: import('svelte').Snippet;
		class?: string;
	};

	let { children, class: className, ...restProps }: PopoverTriggerProps = $props();
</script>

<PopoverPrimitive.Trigger class={className} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</PopoverPrimitive.Trigger>
