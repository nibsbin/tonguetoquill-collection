<script lang="ts">
	import Dialog from '$lib/components/ui/base-dialog.svelte';
	import Button from '$lib/components/ui/button.svelte';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}

	let { open, onOpenChange }: Props = $props();
</script>

<Dialog {open} {onOpenChange} title="Share Document" scoped closeOnOutsideClick={false}>
	{#snippet content()}
		<p class="text-sm text-muted-foreground">
			Document sharing functionality is coming soon. You'll be able to share your documents with
			others via link or email.
		</p>
	{/snippet}

	{#snippet footer()}
		<Button variant="default" onclick={() => onOpenChange(false)}>Close</Button>
	{/snippet}
</Dialog>
