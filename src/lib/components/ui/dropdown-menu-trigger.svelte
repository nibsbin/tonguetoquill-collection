<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	type DropdownMenuTriggerProps = {
		children?: import('svelte').Snippet;
		class?: string;
	};

	let { children, class: className, ...restProps }: DropdownMenuTriggerProps = $props();
</script>

<DropdownMenuPrimitive.Trigger class={className} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</DropdownMenuPrimitive.Trigger>
