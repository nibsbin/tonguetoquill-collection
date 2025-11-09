<script lang="ts">
	import { templateService } from '$lib/services/templates';
	import type { TemplateMetadata } from '$lib/services/templates';
	import BasePopover from '$lib/components/ui/base-popover.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import TemplateSelector from '$lib/components/NewDocumentDialog/TemplateSelector.svelte';

	interface NewDocumentDialogProps {
		/** Whether dialog is open */
		open: boolean;

		/** Callback when dialog should close */
		onOpenChange: (open: boolean) => void;

		/** Callback when document should be created */
		onCreate: (name: string, templateFilename: string) => Promise<void>;

		/** List of existing document names for collision detection */
		existingDocumentNames?: string[];

		/** Trigger snippet (button or element that opens the popover) */
		triggerContent?: import('svelte').Snippet;
	}

	let {
		open,
		onOpenChange,
		onCreate,
		existingDocumentNames = [],
		triggerContent
	}: NewDocumentDialogProps = $props();

	// Form state
	let documentName = $state('');
	let selectedTemplate = $state<string>('');
	let isCreating = $state(false);
	let nameError = $state<string | null>(null);
	let creationError = $state<string | null>(null);
	let hasUserEditedName = $state(false);

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

	// Initialize with default template (USAF Memo) when dialog opens
	$effect(() => {
		if (open && templatesReady && templates.length > 0 && !selectedTemplate) {
			// Find USAF Memo or use first template
			const usafMemo = templates.find((t) => t.file === 'usaf_template.md');
			selectedTemplate = usafMemo ? usafMemo.file : templates[0].file;
		}
	});

	// Auto-populate document name when template changes (if user hasn't edited)
	$effect(() => {
		if (!hasUserEditedName && selectedTemplate && templatesReady) {
			const template = templates.find((t) => t.file === selectedTemplate);
			if (template) {
				documentName = generateUniqueNameFromTemplate(template.name);
			}
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

	/**
	 * Generate unique document name from template
	 * Format: "{Template Name}" or "{Template Name} (n)"
	 */
	function generateUniqueNameFromTemplate(templateName: string): string {
		const baseName = templateName;
		let highestCounter = 0;

		// Regex: Matches names like "BaseName (N)" and captures the number (N).
		const counterRegex = new RegExp(
			`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s\\((\\d+)\\)$`
		);

		// 1. Determine the maximum existing counter
		for (const existingName of existingDocumentNames) {
			const match = existingName.match(counterRegex);

			if (match) {
				// Update highestCounter if current match is higher.
				const currentCounter = parseInt(match[1], 10);
				if (currentCounter > highestCounter) {
					highestCounter = currentCounter;
				}
			}
		}

		// If the base name is available and no numbered versions exist, return it immediately.
		if (!existingDocumentNames.includes(baseName) && highestCounter === 0) {
			return baseName;
		}

		// 2. Start the counter from the next number and construct the first candidate name.
		let counter = highestCounter + 1;
		let candidateName: string;

		// Check if the unnumbered base name is taken.
		if (existingDocumentNames.includes(baseName) && highestCounter === 0) {
			// If 'BaseName' exists, but no 'BaseName (N)' exists, start checking at (1).
			candidateName = `${baseName} (${counter})`;
		} else {
			// Otherwise, start checking from the number immediately after the highest found number.
			candidateName = `${baseName} (${counter})`;
		}

		// 3. Increment until a unique name is found (only runs if the *first* candidate is somehow taken).
		while (existingDocumentNames.includes(candidateName)) {
			counter++;
			candidateName = `${baseName} (${counter})`;
		}

		return candidateName;
	}

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
		selectedTemplate = '';
		isCreating = false;
		nameError = null;
		creationError = null;
		hasUserEditedName = false;
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
			const templateFilename = selectedTemplate;

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

<BasePopover
	{open}
	{onOpenChange}
	side="right"
	align="end"
	sideOffset={0}
	closeOnEscape={true}
	closeOnOutsideClick={true}
	showCloseButton={false}
>
	{#snippet trigger()}
		{#if triggerContent}
			{@render triggerContent()}
		{/if}
	{/snippet}

	{#snippet content()}
		<div class="px-4">
			<form onsubmit={handleSubmit} class="space-y-3">
				<!-- Template Selection Field -->
				<div class="space-y-2">
					<Label class="text-sm text-foreground">Template</Label>
					<TemplateSelector
						{templates}
						bind:selectedTemplate
						onTemplateChange={(file) => {
							selectedTemplate = file;
						}}
						disabled={isCreating || !templatesReady}
					/>
				</div>

				<!-- Document Name Field (In-line layout) -->
				<div>
					<div class="flex items-center gap-3">
						<Label for="doc-name" class="shrink-0 text-left text-sm text-foreground">Name</Label>
						<Input
							id="doc-name"
							type="text"
							bind:value={documentName}
							onkeydown={() => {
								hasUserEditedName = true;
							}}
							placeholder="Enter document name"
							disabled={isCreating}
							class="h-9 flex-1 text-sm"
						/>
					</div>
					{#if nameError}
						<p class="mt-1 ml-[4.5rem] text-xs text-destructive">{nameError}</p>
					{/if}
				</div>

				<!-- Creation Error -->
				{#if creationError}
					<div class="rounded-md border border-destructive bg-destructive/10 p-2">
						<p class="text-xs text-destructive">{creationError}</p>
					</div>
				{/if}
			</form>
		</div>
	{/snippet}

	{#snippet footer()}
		<Button variant="ghost" size="sm" onclick={handleCancel} disabled={isCreating}>Cancel</Button>
		<Button variant="default" size="sm" onclick={handleCreate} disabled={!isValid || isCreating}>
			{isCreating ? 'Creating...' : 'Create'}
		</Button>
	{/snippet}
</BasePopover>
