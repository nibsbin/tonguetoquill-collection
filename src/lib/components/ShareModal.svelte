<script lang="ts">
	import { X } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}

	let { open, onOpenChange }: Props = $props();

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onOpenChange(false);
		}
	}

	function handleClose() {
		onOpenChange(false);
	}
</script>

{#if open}
	<!-- Backdrop - only covers the preview pane -->
	<div class="absolute inset-0 z-40 bg-black/40" onclick={handleBackdropClick} role="presentation">
		<!-- Dialog Content - centered in preview pane -->
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="share-dialog-title"
			tabindex="-1"
			class="absolute top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface-elevated p-6 shadow-lg"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.key === 'Escape' && handleClose()}
		>
			<!-- Header -->
			<div class="mb-4 flex items-center justify-between">
				<h2 id="share-dialog-title" class="text-lg font-semibold text-foreground">
					Share Document
				</h2>
				<Button
					variant="ghost"
					size="icon"
					onclick={handleClose}
					aria-label="Close dialog"
					class="h-8 w-8"
				>
					<X class="h-4 w-4" />
				</Button>
			</div>

			<!-- Content -->
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Document sharing functionality is coming soon. You'll be able to share your documents with
					others via link or email.
				</p>
			</div>

			<!-- Footer -->
			<div class="mt-6 flex justify-end">
				<Button variant="default" onclick={handleClose}>Close</Button>
			</div>
		</div>
	</div>
{/if}
