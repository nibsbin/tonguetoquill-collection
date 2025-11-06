<script lang="ts">
	import { X } from 'lucide-svelte';
	import { focusTrap } from '$lib/utils/focus-trap';
	import Button from '$lib/components/ui/button.svelte';
	import Portal from '$lib/components/ui/portal.svelte';
	import { cn } from '$lib/utils/cn';

	interface DialogProps {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		title: string;
		description?: string;
		closeOnEscape?: boolean;
		closeOnOutsideClick?: boolean;
		hideCloseButton?: boolean;
		scoped?: boolean;
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
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
		full: 'max-w-4xl'
	};

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

	// Generate unique IDs for ARIA attributes
	const titleId = `dialog-title-${Math.random().toString(36).substring(7)}`;
	const descId = description ? `dialog-desc-${Math.random().toString(36).substring(7)}` : undefined;
</script>

{#if open}
	<Portal disabled={scoped}>
		<!-- Backdrop -->
		<div
			class={cn('inset-0 z-[1300] bg-black/40', scoped ? 'absolute' : 'fixed')}
			onclick={handleBackdropClick}
			role="presentation"
		></div>

		<!-- Dialog Container -->
		<div
			class={cn(
				'z-[1400] w-full rounded-lg border border-border bg-surface-elevated p-6 shadow-lg',
				scoped
					? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
					: 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
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
			<div class="mb-4 flex items-center justify-between">
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
						<X class="h-4 w-4" />
					</Button>
				{/if}
			</div>

			<!-- Description (optional) -->
			{#if description}
				<p id={descId} class="mb-4 text-sm text-muted-foreground">{description}</p>
			{/if}

			<!-- Content -->
			<div class="dialog-content">
				{@render content()}
			</div>

			<!-- Footer (optional) -->
			{#if footer}
				<div class="mt-6 flex justify-end gap-2">
					{@render footer()}
				</div>
			{/if}
		</div>
	</Portal>
{/if}
