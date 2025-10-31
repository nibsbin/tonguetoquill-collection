<script lang="ts">
	import { Root, Portal } from '$lib/components/ui/dialog.svelte';
	import DialogContent from '$lib/components/ui/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog-title.svelte';
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
</script>

<Root {open} {onOpenChange}>
	{#snippet children()}
		<Portal>
			{#snippet children()}
				<DialogContent
					class="max-w-md border border-border bg-background p-6 shadow-lg lg:top-1/2 lg:right-8 lg:left-auto lg:translate-x-0 lg:-translate-y-1/2"
				>
					{#snippet children()}
						<DialogHeader>
							{#snippet children()}
								<div class="flex items-center justify-between">
									<DialogTitle class="text text-lg font-semibold">Document Info</DialogTitle>
									<Button
										variant="ghost"
										size="sm"
										class="h-6 w-6 p-0"
										onclick={() => onOpenChange(false)}
										aria-label="Close dialog"
									>
										{#snippet children()}
											<X class="h-4 w-4" />
										{/snippet}
									</Button>
								</div>
							{/snippet}
						</DialogHeader>

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
					{/snippet}
				</DialogContent>
			{/snippet}
		</Portal>
	{/snippet}
</Root>

<style>
	.text {
		color: var(--color-foreground);
	}
</style>
