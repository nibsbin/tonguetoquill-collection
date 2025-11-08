<script lang="ts">
	import { X } from 'lucide-svelte';
	import { focusTrap } from '$lib/utils/focus-trap';
	import Button from '$lib/components/ui/button.svelte';
	import Portal from '$lib/components/ui/portal.svelte';
	import { cn } from '$lib/utils/cn';
	import { overlayStore } from '$lib/stores/overlay.svelte';

	interface DialogProps {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		title: string;
		description?: string;
		closeOnEscape?: boolean;
		closeOnOutsideClick?: boolean;
		hideCloseButton?: boolean;
		scoped?: boolean;
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'fullscreen';
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
		scoped = false,
		size = 'md',
		class: className,
		content,
		header,
		footer
	}: DialogProps = $props();

	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		full: 'max-w-4xl',
		fullscreen: 'w-full h-full max-w-none'
	};

	// Generate unique IDs for overlay coordination and ARIA attributes
	const overlayId = `dialog-${Math.random().toString(36).substring(7)}`;
	const titleId = `dialog-title-${Math.random().toString(36).substring(7)}`;
	const descId = description ? `dialog-desc-${Math.random().toString(36).substring(7)}` : undefined;

	// Register/unregister with overlay store for coordination
	$effect(() => {
		if (open) {
			overlayStore.register(overlayId, 'dialog', () => onOpenChange(false));
			return () => overlayStore.unregister(overlayId);
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
</script>

{#if open}
	<Portal disabled={scoped}>
		<!-- Backdrop -->
		<div
			class={cn(
				scoped ? 'z-scoped-backdrop' : 'z-modal-backdrop',
				'inset-0 bg-black/40',
				scoped ? 'absolute' : 'fixed'
			)}
			onclick={handleBackdropClick}
			role="presentation"
		></div>

		<!-- Dialog Container -->
		<div
			class={cn(
				scoped ? 'z-scoped-content' : 'z-modal-content',
				'bg-surface-elevated shadow-lg',
				size === 'fullscreen'
					? 'absolute inset-0 flex flex-col'
					: cn(
							'w-full rounded-lg border border-border p-6',
							scoped
								? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
								: 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
						),
				sizeClasses[size],
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
			<div
				class={cn('flex items-center justify-between', size === 'fullscreen' ? 'p-6 pb-0' : 'mb-4')}
			>
				{#if header}
					{@render header()}
				{:else}
					<h2 id={titleId} class="text-lg font-semibold text-foreground">{title}</h2>
				{/if}

				{#if !hideCloseButton}
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8"
						onclick={handleClose}
						aria-label="Close dialog"
					>
						<X class="h-4 w-4 text-foreground" />
					</Button>
				{/if}
			</div>

			<!-- Description (optional) -->
			{#if description}
				<p
					id={descId}
					class={cn('text-sm text-muted-foreground', size === 'fullscreen' ? 'px-6 pb-2' : 'mb-4')}
				>
					{description}
				</p>
			{/if}

			<!-- Content -->
			<div
				class={cn('dialog-content', size === 'fullscreen' ? 'flex-1 overflow-auto px-6 pb-6' : '')}
			>
				{@render content()}
			</div>

			<!-- Footer (optional) -->
			{#if footer}
				<div
					class={cn('flex justify-end gap-2', size === 'fullscreen' ? 'px-6 pt-4 pb-6' : 'mt-6')}
				>
					{@render footer()}
				</div>
			{/if}
		</div>
	</Portal>
{/if}
