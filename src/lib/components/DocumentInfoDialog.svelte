<script lang="ts">
	import Dialog from '$lib/components/ui/base-dialog.svelte';

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
</script>

<Dialog {open} {onOpenChange} title="Document Info" scoped size="md">
	{#snippet content()}
		<div class="space-y-6">
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
	{/snippet}
</Dialog>
