<script lang="ts">
	import { templateService } from '$lib/services/templates';
	import type { TemplateMetadata } from '$lib/services/templates';
	import BaseDialog from '$lib/components/ui/base-dialog.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';

	interface NewDocumentDialogProps {
		/** Whether dialog is open */
		open: boolean;

		/** Callback when dialog should close */
		onOpenChange: (open: boolean) => void;

		/** Callback when document should be created */
		onCreate: (name: string, templateFilename?: string) => Promise<void>;
	}

	let { open, onOpenChange, onCreate }: NewDocumentDialogProps = $props();

	// Form state
	let documentName = $state('');
	let selectedTemplate = $state<string | null>(null);
	let isCreating = $state(false);
	let nameError = $state<string | null>(null);
	let creationError = $state<string | null>(null);

	// Template state
	let templates = $state<TemplateMetadata[]>([]);
	let templatesReady = $state(false);

	// Load templates when dialog opens
	$effect(() => {
		if (open && templateService.isReady()) {
			templates = templateService.listTemplates(true); // production only
			templatesReady = true;
		}
	});

	// Validate on document name change if there's an error
	$effect(() => {
		if (nameError && documentName.trim().length > 0) {
			validateDocumentName();
		}
	});

	// Derived state
	let isValid = $derived(documentName.trim().length > 0 && !nameError);

	function validateDocumentName(): boolean {
		const trimmed = documentName.trim();

		if (trimmed.length === 0) {
			nameError = 'Document name is required';
			return false;
		}

		nameError = null;
		return true;
	}

	function resetForm() {
		documentName = '';
		selectedTemplate = null;
		isCreating = false;
		nameError = null;
		creationError = null;
	}

	function handleCancel() {
		resetForm();
		onOpenChange(false);
	}

	async function handleCreate() {
		// Validate
		if (!validateDocumentName()) {
			return;
		}

		// Create document
		isCreating = true;
		creationError = null;

		try {
			const trimmedName = documentName.trim();
			const templateFilename = selectedTemplate || undefined;

			await onCreate(trimmedName, templateFilename);

			// Success - close and reset
			resetForm();
			onOpenChange(false);
		} catch (error) {
			// Error - show message and keep dialog open
			creationError =
				error instanceof Error ? error.message : 'Failed to create document. Please try again.';
			console.error('Failed to create document:', error);
		} finally {
			isCreating = false;
		}
	}

	// Handle form submission (Enter key)
	function handleSubmit(event: Event) {
		event.preventDefault();
		if (isValid && !isCreating) {
			handleCreate();
		}
	}
</script>

<BaseDialog {open} {onOpenChange} title="New Document" size="md">
	{#snippet content()}
		<form onsubmit={handleSubmit} class="space-y-4">
			<!-- Document Name Field -->
			<div>
				<Label for="doc-name" class="text-foreground">Document Name</Label>
				<Input
					id="doc-name"
					type="text"
					bind:value={documentName}
					placeholder="Enter document name"
					disabled={isCreating}
					class="mt-2 w-full"
				/>
				{#if nameError}
					<p class="mt-1 text-sm text-destructive">{nameError}</p>
				{/if}
			</div>

			<!-- Template Selection Field -->
			<div>
				<Label for="template" class="text-foreground">Template</Label>
				<select
					id="template"
					bind:value={selectedTemplate}
					disabled={isCreating || !templatesReady}
					class="mt-2 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value={null}>Blank Document</option>
					{#each templates as template}
						<option value={template.file}>{template.name}</option>
					{/each}
				</select>
				<p class="mt-1 text-sm text-muted-foreground">
					{#if !templatesReady}
						Templates unavailable
					{:else}
						Choose a template to start with
					{/if}
				</p>
			</div>

			<!-- Creation Error -->
			{#if creationError}
				<div class="rounded-md border border-destructive bg-destructive/10 p-3">
					<p class="text-sm text-destructive">{creationError}</p>
				</div>
			{/if}
		</form>
	{/snippet}

	{#snippet footer()}
		<Button variant="ghost" onclick={handleCancel} disabled={isCreating}>Cancel</Button>
		<Button variant="default" onclick={handleCreate} disabled={!isValid || isCreating}>
			{isCreating ? 'Creating...' : 'Create'}
		</Button>
	{/snippet}
</BaseDialog>
