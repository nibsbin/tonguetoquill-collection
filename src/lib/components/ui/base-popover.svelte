<script lang="ts">
	import { X } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { cn } from '$lib/utils/cn';
	import { useDismissible } from '$lib/utils/overlay/use-dismissible';
	import { useZIndex } from '$lib/utils/overlay/use-zindex';
	import { usePositioning } from '$lib/utils/overlay/use-positioning';

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

	// Generate unique ID for ARIA
	const titleId = title ? `popover-title-${Math.random().toString(36).substring(7)}` : undefined;

	// Close handler
	function handleClose() {
		open = false;
		onOpenChange?.(false);
	}

	// Composable hooks
	const dismissible = useDismissible({
		onEscape: closeOnEscape
			? () => {
					open = false;
					onOpenChange?.(false);
				}
			: undefined,
		onOutside: closeOnOutsideClick
			? () => {
					open = false;
					onOpenChange?.(false);
				}
			: undefined
	});

	const zIndex = useZIndex({
		layer: 'popover',
		onClose: () => {
			open = false;
			onOpenChange?.(false);
		}
	});

	// Register/unregister with overlay store for coordination
	$effect(() => {
		if (open) {
			return zIndex.registerEffect();
		}
	});

	// Position tracking when open
	$effect(() => {
		if (open && popoverElement && triggerElement) {
			const positioning = usePositioning({
				strategy: 'relative',
				anchor: triggerElement,
				side,
				align,
				offset: sideOffset
			});

			return positioning.setupPositionTracking(popoverElement, (newPosition) => {
				position = newPosition;
			});
		}
	});
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
		onkeydown={dismissible.handleKeyDown}
		use:dismissible.outsideClickAction
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
