<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface TooltipProps {
		/** Tooltip content */
		content: string;

		/** Position of tooltip */
		position?: 'top' | 'bottom' | 'left' | 'right';

		/** Delay before showing (ms) */
		delay?: number;

		/** Max width of tooltip */
		maxWidth?: string;

		/** Additional CSS classes */
		class?: string;

		/** Trigger element snippet */
		children?: Snippet;
	}

	let {
		content,
		position = 'right',
		delay = 300,
		maxWidth = '280px',
		class: className,
		children
	}: TooltipProps = $props();

	// State
	let visible = $state(false);
	let showTimeout: ReturnType<typeof setTimeout> | null = null;
	let triggerRef = $state<HTMLElement | null>(null);
	let tooltipRef = $state<HTMLDivElement | null>(null);
	let tooltipPosition = $state({ top: 0, left: 0 });

	// Show tooltip with delay
	function handleMouseEnter() {
		showTimeout = setTimeout(() => {
			visible = true;
			updatePosition();
		}, delay);
	}

	// Hide tooltip immediately
	function handleMouseLeave() {
		if (showTimeout) {
			clearTimeout(showTimeout);
			showTimeout = null;
		}
		visible = false;
	}

	// Calculate tooltip position
	function updatePosition() {
		if (!triggerRef || !tooltipRef) return;

		const triggerRect = triggerRef.getBoundingClientRect();
		const tooltipRect = tooltipRef.getBoundingClientRect();
		const offset = 8;

		let top = 0;
		let left = 0;
		let finalPosition = position;

		// Calculate position based on preferred side
		switch (position) {
			case 'top':
				top = triggerRect.top - tooltipRect.height - offset;
				left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
				// Flip if not enough space
				if (top < 0) {
					finalPosition = 'bottom';
					top = triggerRect.bottom + offset;
				}
				break;
			case 'bottom':
				top = triggerRect.bottom + offset;
				left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
				// Flip if not enough space
				if (top + tooltipRect.height > window.innerHeight) {
					finalPosition = 'top';
					top = triggerRect.top - tooltipRect.height - offset;
				}
				break;
			case 'left':
				top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
				left = triggerRect.left - tooltipRect.width - offset;
				// Flip if not enough space
				if (left < 0) {
					finalPosition = 'right';
					left = triggerRect.right + offset;
				}
				break;
			case 'right':
				top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
				left = triggerRect.right + offset;
				// Flip if not enough space
				if (left + tooltipRect.width > window.innerWidth) {
					finalPosition = 'left';
					left = triggerRect.left - tooltipRect.width - offset;
				}
				break;
		}

		// Ensure tooltip stays within viewport horizontally
		if (left < offset) {
			left = offset;
		} else if (left + tooltipRect.width > window.innerWidth - offset) {
			left = window.innerWidth - tooltipRect.width - offset;
		}

		// Ensure tooltip stays within viewport vertically
		if (top < offset) {
			top = offset;
		} else if (top + tooltipRect.height > window.innerHeight - offset) {
			top = window.innerHeight - tooltipRect.height - offset;
		}

		tooltipPosition = { top, left };
	}

	// Update position when visible changes
	$effect(() => {
		if (visible) {
			updatePosition();
		}
	});
</script>

<div class="relative inline-block">
	<div
		bind:this={triggerRef}
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
		class="inline-block"
		role="presentation"
	>
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if visible}
		<div
			bind:this={tooltipRef}
			role="tooltip"
			class={cn(
				'z-popover fixed rounded-md border border-border bg-surface-elevated p-2 text-sm text-foreground shadow-md',
				'animate-in fade-in-0 zoom-in-95',
				className
			)}
			style="top: {tooltipPosition.top}px; left: {tooltipPosition.left}px; max-width: {maxWidth};"
		>
			{content}
		</div>
	{/if}
</div>
