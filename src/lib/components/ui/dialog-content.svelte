<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface DialogContentProps {
		/** Content to render inside the scrollable area */
		children: import('svelte').Snippet;
		/** Additional CSS classes */
		class?: string;
		/** Whether to apply prose styling (for long-form content) */
		prose?: boolean;
		/** Whether the dialog is in fullscreen mode (removes max-height) */
		fullscreen?: boolean;
	}

	let {
		children,
		class: className,
		prose = false,
		fullscreen = false
	}: DialogContentProps = $props();
</script>

<div
	class={cn(
		'widget-scrollbar pr-2',
		!fullscreen && 'max-h-[60dvh] overflow-y-auto',
		fullscreen && 'h-full',
		prose && 'widget-prose space-y-6',
		className
	)}
>
	{@render children()}
</div>
