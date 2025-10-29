<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type LabelProps = {
		for?: string;
		class?: string;
		children?: import('svelte').Snippet;
	};

	let { for: htmlFor, class: className, children, ...restProps }: LabelProps = $props();
</script>

<label
	for={htmlFor}
	class={cn(
		'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</label>
