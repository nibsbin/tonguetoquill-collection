<script lang="ts">
	import { X } from 'lucide-svelte';
	import { focusTrap } from '$lib/utils/focus-trap';
	import Button from '$lib/components/ui/button.svelte';
	import Portal from '$lib/components/ui/portal.svelte';
	import { cn } from '$lib/utils/cn';
	import { overlayStore } from '$lib/stores/overlay.svelte';

	interface SheetProps {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		title: string;
		description?: string;
		closeOnEscape?: boolean;
		closeOnOutsideClick?: boolean;
		hideCloseButton?: boolean;
		side?: 'top' | 'right' | 'bottom' | 'left';
		class?: string;
		content: import('svelte').Snippet;
		header?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
	}

	let {
		open,
		onOpenChange,
		title,
		description,
		closeOnEscape = true,
		closeOnOutsideClick = true,
		hideCloseButton = false,
		side = 'right',
		class: className,
		content,
		header,
		footer
	}: SheetProps = $props();

	// Generate unique ID for overlay coordination
	const overlayId = `sheet-${Math.random().toString(36).substring(7)}`;

	// Register/unregister with overlay store for coordination
	$effect(() => {
		if (open) {
			overlayStore.register(overlayId, 'sheet', () => onOpenChange(false));
			return () => overlayStore.unregister(overlayId);
		}
	});

	// Detect if mobile (<768px) and override side to bottom
	let isMobile = $state(false);
	let effectiveSide = $derived(isMobile ? 'bottom' : side);

	$effect(() => {
		if (typeof window !== 'undefined') {
			const checkMobile = () => {
				isMobile = window.innerWidth < 768;
			};
			checkMobile();
			window.addEventListener('resize', checkMobile);
			return () => window.removeEventListener('resize', checkMobile);
		}
	});

	function handleEscapeKey(event: KeyboardEvent) {
		if (event.key === 'Escape' && closeOnEscape) {
			event.preventDefault();
			onOpenChange(false);
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget && closeOnOutsideClick) {
			onOpenChange(false);
		}
	}

	function handleClose() {
		onOpenChange(false);
	}

	// Side-specific classes for positioning and animation
	const sideClasses = {
		top: 'top-0 left-0 right-0 h-auto max-h-[80vh]',
		right: 'top-0 right-0 bottom-0 w-full max-w-md',
		bottom: 'bottom-0 left-0 right-0 h-auto max-h-[80vh]',
		left: 'top-0 left-0 bottom-0 w-full max-w-md'
	};

	const transformClasses = {
		top: open ? 'translate-y-0' : '-translate-y-full',
		right: open ? 'translate-x-0' : 'translate-x-full',
		bottom: open ? 'translate-y-0' : 'translate-y-full',
		left: open ? 'translate-x-0' : '-translate-x-full'
	};

	// Generate unique IDs for ARIA
	const titleId = `sheet-title-${Math.random().toString(36).substring(7)}`;
	const descId = description ? `sheet-desc-${Math.random().toString(36).substring(7)}` : undefined;
</script>

{#if open}
	<Portal>
		<!-- Backdrop -->
		<div
			class="z-modal-backdrop fixed inset-0 bg-black/40 transition-opacity duration-300"
			class:opacity-100={open}
			class:opacity-0={!open}
			onclick={handleBackdropClick}
			role="presentation"
		></div>

		<!-- Sheet Container -->
		<div
			class={cn(
				'z-modal-content fixed bg-surface-elevated shadow-lg transition-transform duration-300 ease-in-out',
				'flex flex-col overflow-hidden',
				sideClasses[effectiveSide],
				transformClasses[effectiveSide],
				className
			)}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			aria-describedby={descId}
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={handleEscapeKey}
			use:focusTrap
		>
			<!-- Header -->
			<div class="flex-shrink-0 border-b border-border p-6">
				<div class="flex items-center justify-between">
					{#if header}
						{@render header()}
					{:else}
						<div>
							<h2 id={titleId} class="text-lg font-semibold text-foreground">{title}</h2>
							{#if description}
								<p id={descId} class="mt-1 text-sm text-muted-foreground">{description}</p>
							{/if}
						</div>
					{/if}

					{#if !hideCloseButton}
						<Button
							variant="ghost"
							size="icon"
							class="h-8 w-8"
							onclick={handleClose}
							aria-label="Close sheet"
						>
							<X class="h-4 w-4 text-foreground" />
						</Button>
					{/if}
				</div>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto p-6">
				{@render content()}
			</div>

			<!-- Footer (optional) -->
			{#if footer}
				<div class="flex-shrink-0 border-t border-border p-6">
					<div class="flex justify-end gap-2">
						{@render footer()}
					</div>
				</div>
			{/if}
		</div>
	</Portal>
{/if}
