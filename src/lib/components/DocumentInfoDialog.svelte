<script lang="ts">
	import { X } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';

	interface DocumentInfoDialogProps {
		open: boolean;
		document: {
			name: string;
			created_at: string;
			updated_at: string;
		} | null;
		content: string;
		onOpenChange: (open: boolean) => void;
	}

	let { open, document, content, onOpenChange }: DocumentInfoDialogProps = $props();

	// Calculate statistics
	let stats = $derived({
		characters: content.length,
		words:
			content.trim().length === 0
				? 0
				: content
						.trim()
						.split(/\s+/)
						.filter((w) => w.length > 0).length,
		lines: content.split('\n').length
	});

	// Format dates
	function formatDate(isoDate: string): string {
		return new Date(isoDate).toLocaleString(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}

	// Handle backdrop click
	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onOpenChange(false);
		}
	}
</script>

{#if open}
	<!-- Backdrop - only covers the preview pane -->
	<div class="absolute inset-0 z-40 bg-black/40" onclick={handleBackdropClick} role="presentation">
		<!-- Dialog Content - centered in preview pane -->
		<div
			class="absolute top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg"
			role="dialog"
			aria-modal="true"
			aria-labelledby="document-info-title"
		>
			<div class="flex items-center justify-between">
				<h2 id="document-info-title" class="text text-lg font-semibold">Document Info</h2>
				<Button
					variant="ghost"
					size="sm"
					class="h-6 w-6 p-0"
					onclick={() => onOpenChange(false)}
					aria-label="Close dialog"
				>
					<X class="h-4 w-4" />
				</Button>
			</div>

			<div class="mt-6 space-y-6">
				<!-- Document Name -->
				<div class="space-y-1">
					<div class="text-sm font-medium text-muted-foreground">Document Name</div>
					<div class="text-base text-foreground">{document?.name || 'Untitled'}</div>
				</div>

				<!-- Statistics (Emphasized) -->
				<div class="space-y-3">
					<div class="text-sm font-medium text-muted-foreground">Statistics</div>
					<div class="grid grid-cols-3 gap-4">
						<div class="text-center">
							<div class="text-2xl font-semibold text-foreground">
								{stats.characters.toLocaleString()}
							</div>
							<div class="mt-1 text-xs text-muted-foreground">Chars</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-semibold text-foreground">
								{stats.words.toLocaleString()}
							</div>
							<div class="mt-1 text-xs text-muted-foreground">Words</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-semibold text-foreground">
								{stats.lines.toLocaleString()}
							</div>
							<div class="mt-1 text-xs text-muted-foreground">Lines</div>
						</div>
					</div>
				</div>

				<!-- Dates (De-emphasized, grouped) -->
				<div class="border-t border-border pt-2">
					<div class="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
						<div>
							<span class="font-medium">Created:</span>
							<span class="ml-1">
								{document?.created_at ? formatDate(document.created_at) : 'Unknown'}
							</span>
						</div>
						<div>
							<span class="font-medium">Modified:</span>
							<span class="ml-1">
								{document?.updated_at ? formatDate(document.updated_at) : 'Unknown'}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.text {
		color: var(--color-foreground);
	}
</style>
