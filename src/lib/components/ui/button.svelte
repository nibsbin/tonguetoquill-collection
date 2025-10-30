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
		'aria-label'?: string;
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
		'aria-label': ariaLabel,
		...restProps
	}: ButtonProps = $props();

	const variants = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		outline: 'border border-border hover:bg-accent hover:text-accent-foreground'
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
	aria-label={ariaLabel}
	class={cn(
		'inline-flex items-center cursor-pointer justify-center rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
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
