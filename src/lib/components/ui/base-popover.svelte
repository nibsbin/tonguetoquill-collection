<script lang="ts">
	import { X } from 'lucide-svelte';
	import { clickOutside } from '$lib/utils/use-click-outside';
	import Button from '$lib/components/ui/button.svelte';
	import { cn } from '$lib/utils/cn';
	import { onMount } from 'svelte';
	import { overlayStore } from '$lib/stores/overlay.svelte';

	interface PopoverProps {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		/**
		 * Popover title for accessibility (optional)
		 * @default undefined
		 */
		title?: string;
		/**
		 * A base popover component.
		 * @default true
		/** Whether popover should close on Escape key press*/
		closeOnEscape?: boolean;
		/**
		 * Whether popover should close on outside click
		 * @default true
		 */
		closeOnOutsideClick?: boolean;
		/**
		 * Whether to show a close button in the top-right corner
		 * @default false
		 */
		showCloseButton?: boolean;
		/**
		 * Popover side relative to trigger element
		 * @default 'bottom'
		 */
		side?: 'top' | 'right' | 'bottom' | 'left';
		/**
		 * Popover alignment relative to trigger element
		 * @default 'center'
		 */
		align?: 'start' | 'center' | 'end';
		/**
		 * Offset in pixels from the trigger element
		 * @default 8
		 */
		sideOffset?: number;
		class?: string;
		style?: string;
		trigger: import('svelte').Snippet;
		content: import('svelte').Snippet;
		header?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		title,
		closeOnEscape = true,
		closeOnOutsideClick = true,
		showCloseButton = false,
		side = 'bottom',
		align = 'center',
		sideOffset = 8,
		class: className,
		style,
		trigger,
		content,
		header,
		footer
	}: PopoverProps = $props();

	let triggerElement: HTMLElement | undefined = $state();
	let popoverElement: HTMLElement | undefined = $state();
	let position = $state({ top: 0, left: 0 });

	// Generate unique ID for overlay coordination
	const overlayId = `popover-${Math.random().toString(36).substring(7)}`;

	// Register/unregister with overlay store for coordination
	$effect(() => {
		if (open) {
			overlayStore.register(overlayId, 'popover', () => {
				open = false;
				onOpenChange?.(false);
			});
			return () => overlayStore.unregister(overlayId);
		}
	});

	function handleEscapeKey(event: KeyboardEvent) {
		if (event.key === 'Escape' && closeOnEscape) {
			event.preventDefault();
			open = false;
			onOpenChange?.(false);
		}
	}

	function handleClickOutside() {
		if (closeOnOutsideClick) {
			open = false;
			onOpenChange?.(false);
		}
	}

	function handleClose() {
		open = false;
		onOpenChange?.(false);
	}

	function calculatePosition() {
		if (!triggerElement || !popoverElement) return;

		const triggerRect = triggerElement.getBoundingClientRect();
		const popoverRect = popoverElement.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		let top = 0;
		let left = 0;

		// Calculate position based on side
		switch (side) {
			case 'top':
				top = triggerRect.top - popoverRect.height - sideOffset;
				break;
			case 'bottom':
				top = triggerRect.bottom + sideOffset;
				break;
			case 'left':
				left = triggerRect.left - popoverRect.width - sideOffset;
				top = triggerRect.top;
				break;
			case 'right':
				left = triggerRect.right + sideOffset;
				top = triggerRect.top;
				break;
		}

		// Calculate alignment
		if (side === 'top' || side === 'bottom') {
			switch (align) {
				case 'start':
					left = triggerRect.left;
					break;
				case 'center':
					left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
					break;
				case 'end':
					left = triggerRect.right - popoverRect.width;
					break;
			}
		} else {
			// For left/right sides
			switch (align) {
				case 'start':
					top = triggerRect.top;
					break;
				case 'center':
					top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
					break;
				case 'end':
					top = triggerRect.bottom - popoverRect.height;
					break;
			}
		}

		// Check viewport bounds and adjust if needed
		if (left + popoverRect.width > viewportWidth) {
			left = viewportWidth - popoverRect.width - 8;
		}
		if (left < 8) {
			left = 8;
		}
		if (top + popoverRect.height > viewportHeight) {
			top = viewportHeight - popoverRect.height - 8;
		}
		if (top < 8) {
			top = 8;
		}

		position = { top, left };
	}

	// Recalculate position when popover opens or window resizes
	$effect(() => {
		if (open) {
			// Use requestAnimationFrame to ensure elements are rendered
			requestAnimationFrame(() => {
				calculatePosition();
			});

			const handleResize = () => calculatePosition();
			const handleScroll = () => calculatePosition();

			window.addEventListener('resize', handleResize);
			window.addEventListener('scroll', handleScroll, true);

			return () => {
				window.removeEventListener('resize', handleResize);
				window.removeEventListener('scroll', handleScroll, true);
			};
		}
	});

	// Generate unique ID for ARIA
	const titleId = title ? `popover-title-${Math.random().toString(36).substring(7)}` : undefined;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- The onclick handler is intentionally placed on the wrapper div to capture clicks
     from the trigger content (which typically contains buttons with proper keyboard handling) -->
<div
	bind:this={triggerElement}
	onclick={() => {
		open = !open;
		onOpenChange?.(open);
	}}
>
	{@render trigger()}
</div>

{#if open}
	<div
		bind:this={popoverElement}
		class={cn(
			'fixed w-max rounded-lg border border-border bg-surface-elevated shadow-md',
			className
		)}
		style="top: {position.top}px; left: {position.left}px; z-index: var(--z-popover); {style || ''}"
		role="dialog"
		aria-labelledby={titleId}
		tabindex="-1"
		onkeydown={handleEscapeKey}
		use:clickOutside={handleClickOutside}
	>
		<!-- Header (optional) -->
		{#if title || showCloseButton || header}
			<div class="flex items-center justify-between px-4 pt-4 pb-3">
				{#if header}
					{@render header()}
				{:else if title}
					<h3 id={titleId} class="text-lg font-semibold text-foreground">{title}</h3>
				{/if}

				{#if showCloseButton}
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6"
						onclick={handleClose}
						aria-label="Close popover"
					>
						<X class="h-3 w-3 text-foreground" />
					</Button>
				{/if}
			</div>
		{/if}

		<!-- Content -->
		<div
			class="popover-content {title || showCloseButton || header ? '' : 'pt-4'} {footer
				? ''
				: 'pb-4'}"
		>
			{@render content()}
		</div>

		<!-- Footer (optional) -->
		{#if footer}
			<div class="flex justify-end gap-2 px-4 pt-3 pb-4">
				{@render footer()}
			</div>
		{/if}
	</div>
{/if}
