<script lang="ts">
	import { cn } from '$lib/utils';

	type InputProps = {
		id?: string;
		type?: string;
		placeholder?: string;
		value?: string;
		disabled?: boolean;
		class?: string;
		onkeydown?: (e: KeyboardEvent) => void;
	};

	let {
		id,
		type = 'text',
		placeholder,
		value = $bindable(''),
		disabled = false,
		class: className,
		onkeydown,
		...restProps
	}: InputProps = $props();
</script>

<input
	{id}
	{type}
	{placeholder}
	bind:value
	{disabled}
	{onkeydown}
	class={cn(
		'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...restProps}
/>
