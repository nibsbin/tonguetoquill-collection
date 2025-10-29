<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type ButtonProps = {
		variant?: 'default' | 'ghost' | 'outline';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		class?: string;
		children?: import('svelte').Snippet;
		onclick?: (e: MouseEvent) => void;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		title?: string;
	};

	let {
		variant = 'default',
		size = 'default',
		class: className,
		children,
		onclick,
		disabled = false,
		type = 'button',
		title,
		...restProps
	}: ButtonProps = $props();

	const variants = {
		default: 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800',
		ghost: 'hover:bg-zinc-700 hover:text-zinc-100',
		outline: 'border border-zinc-700 hover:bg-zinc-800'
	};

	const sizes = {
		default: 'h-10 px-4 py-2',
		sm: 'h-8 rounded-md px-3 text-sm',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-8 w-8 p-0'
	};
</script>

<button
	{type}
	{disabled}
	{onclick}
	{title}
	class={cn(
		'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		variants[variant],
		sizes[size],
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</button>
