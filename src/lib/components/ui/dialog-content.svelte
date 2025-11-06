<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface DialogContentProps {
		/** Content to render inside the scrollable area */
		children: import('svelte').Snippet;
		/** Additional CSS classes */
		class?: string;
		/** Whether to apply prose styling (for long-form content) */
		prose?: boolean;
	}

	let { children, class: className, prose = false }: DialogContentProps = $props();
</script>

<div
	class={cn(
		'widget-scrollbar max-h-[60vh] overflow-y-auto pr-2',
		prose && 'widget-prose space-y-6',
		className
	)}
>
	{@render children()}
</div>
