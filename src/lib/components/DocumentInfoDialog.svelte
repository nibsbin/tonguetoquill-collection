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
	<div
		class="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm"
		onclick={handleBackdropClick}
		role="presentation"
	>
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

			<div class="mt-4 space-y-4">
				<!-- Document Name -->
				<div class="space-y-1">
					<div class="text-sm font-medium text-muted-foreground">Document Name</div>
					<div class="text-base text-foreground">{document?.name || 'Untitled'}</div>
				</div>

				<!-- Created -->
				<div class="space-y-1">
					<div class="text-sm font-medium text-muted-foreground">Created</div>
					<div class="text-base text-foreground">
						{document?.created_at ? formatDate(document.created_at) : 'Unknown'}
					</div>
				</div>

				<!-- Modified -->
				<div class="space-y-1">
					<div class="text-sm font-medium text-muted-foreground">Modified</div>
					<div class="text-base text-foreground">
						{document?.updated_at ? formatDate(document.updated_at) : 'Unknown'}
					</div>
				</div>

				<!-- Statistics -->
				<div class="space-y-1">
					<div class="text-sm font-medium text-muted-foreground">Statistics</div>
					<ul class="text-sm text-foreground" role="list">
						<li>• Characters: {stats.characters}</li>
						<li>• Words: {stats.words}</li>
						<li>• Lines: {stats.lines}</li>
					</ul>
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
