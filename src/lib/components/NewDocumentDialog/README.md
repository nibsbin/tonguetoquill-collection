# NewDocumentDialog Component

A lightweight popover for creating new documents with template selection.

## Overview

The NewDocumentDialog component (now implemented as a popover) provides a compact form-based interface for creating documents. It prompts users for a document name and template selection from the Template Service. This component uses a popover pattern for a less intrusive UX compared to a modal dialog.

## Features

- **Popover UX**: Lightweight popover instead of modal dialog
- **In-Line Labels**: Labels and inputs on same row for compact layout
- **Document Name Input**: Required text field with validation
- **Template Selection**: Required dropdown with production templates (defaults to USAF Memo)
- **Auto-Naming**: Automatically populates name from selected template
- **Collision Detection**: Appends (1), (2), etc. for duplicate names
- **Form Validation**: Client-side validation prevents invalid submissions
- **Error Handling**: Displays inline errors for validation and creation failures
- **Loading States**: Shows creating state while document is being created
- **Keyboard Support**: Enter to submit, ESC to cancel

## Props

```typescript
interface NewDocumentDialogProps {
	/** Whether popover is open */
	open: boolean;

	/** Callback when popover should close */
	onOpenChange: (open: boolean) => void;

	/** Callback when document should be created */
	onCreate: (name: string, templateFilename: string) => Promise<void>;

	/** List of existing document names for collision detection */
	existingDocumentNames?: string[];

	/** Trigger snippet (button or element that opens the popover) */
	triggerContent?: import('svelte').Snippet;
}
```

## Usage

```svelte
<script lang="ts">
	import NewDocumentDialog from '$lib/components/NewDocumentDialog';
	import { templateService } from '$lib/services/templates';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { Plus } from 'lucide-svelte';

	let popoverOpen = $state(false);
	const existingNames = $derived(documentStore.documents.map((d) => d.name));

	async function handleCreateDocument(name: string, templateFilename: string) {
		let content = '';

		// Load template content
		try {
			const template = await templateService.getTemplate(templateFilename);
			content = template.content;
		} catch (error) {
			console.error('Failed to load template:', error);
			throw error;
		}

		// Create document with name and content
		await documentStore.createDocument(name, content);
	}
</script>

<NewDocumentDialog
	open={popoverOpen}
	onOpenChange={(open) => (popoverOpen = open)}
	onCreate={handleCreateDocument}
	existingDocumentNames={existingNames}
>
	{#snippet triggerContent()}
		<button>
			<Plus />
			New Document
		</button>
	{/snippet}
</NewDocumentDialog>
```

## Behavior

### In-Line Label Layout

**Template Field**:

- Label: "Template" (right-aligned, 80px fixed width)
- Input: Select dropdown (fills remaining space)
- Height: Compact 36px (h-9)

**Name Field**:

- Label: "Name" (right-aligned, 80px fixed width)
- Input: Text input (fills remaining space)
- Height: Compact 36px (h-9)
- Auto-populated from selected template
- Manual edits prevent further auto-population

### Auto-Naming

When template changes:

1. If user hasn't manually edited name, generate from template
2. Check for collisions with existing documents
3. If collision, append " (1)", " (2)", etc.
4. Stop auto-population once user edits name

Example: If "USAF Memo" exists, next one becomes "USAF Memo (1)"

### Form Validation

**Document Name**:

- Required field
- Cannot be empty or whitespace-only
- Validation triggered on input (if error exists)
- Error message shown inline below input (aligned with input, not label)

**Template**:

- Required field (no blank option)
- Defaults to "USAF Memo" when popover opens
- Populated from Template Service (production templates only)

### Creation Flow

1. User clicks trigger (e.g., "New Document" button in sidebar)
2. Popover opens below button
3. Template defaults to "USAF Memo", name auto-populated
4. User can change template (name updates automatically)
5. User can edit name (stops auto-population)
6. User clicks "Create"
7. Validation runs
8. If valid:
   - onCreate callback called with name and templateFilename
   - Parent component loads template content and creates document
   - On success: form resets and popover closes
   - On error: error displayed, popover stays open for retry

### Dismissal Methods

- **Cancel button**: Resets form and closes popover
- **ESC key**: Handled by BasePopover, closes popover
- **Click outside**: Handled by BasePopover, closes popover
- **No close button**: Cleaner appearance, other methods sufficient

### Error Handling

**Validation Errors**:

- Shown inline below the document name input
- Red text color (destructive)
- Create button disabled while error present

**Creation Errors**:

- Caught by try-catch in handleCreate
- Displayed in error banner above footer
- Dialog stays open to allow retry
- Error cleared on successful creation

**Template Service Errors**:

- If service not ready: Template dropdown shows "USAF Memo" as default
- Can still create documents with available templates
- Graceful degradation built into component

## Accessibility

- **Focus Management**: Template dropdown focused when popover opens
- **Keyboard Navigation**: Tab cycles through inputs and buttons, Enter submits
- **ARIA Labels**: Proper labels for all form fields
- **Error Announcements**: Validation errors associated with inputs
- **Screen Reader Support**: Error messages announced, loading states communicated
- **No Focus Trap**: Popover allows interaction with page (unlike modal dialog)

## Styling

- **Popover Width**: Fixed ~384px (w-96) for consistent layout
- **In-Line Labels**: 80px fixed width (w-20), right-aligned
- **Input Heights**: 36px (h-9) for compact feel
- **Spacing**: Tighter than dialog (space-y-3 instead of space-y-4)
- **Text Sizes**: Smaller (text-sm for labels, text-xs for errors)
- **Button Sizes**: Compact (size="sm")
- **Design Tokens**: Uses design system tokens for colors and spacing
- **Theme Support**: Automatic light/dark mode support

## Dependencies

- **BasePopover**: Widget abstraction for popover overlays
- **Button**: Standard button component (size="sm" for compact buttons)
- **Input**: Standard text input component
- **Label**: Standard label component
- **Template Service**: For loading template list and content

## Integration Points

- **Template Service**: Must be initialized before popover opens (done in root layout)
- **Document Store**: Parent component delegates to document store for creation
- **Sidebar**: Primary integration point, passes trigger content via snippet
- **Collision Detection**: Parent passes list of existing document names

## Design Reference

See [prose/designs/frontend/NEW_DOCUMENT_POPOVER.md](../../../prose/designs/frontend/NEW_DOCUMENT_POPOVER.md) for detailed design documentation.

## Implementation Reference

See [prose/plans/new-document-popover-implementation.md](../../../prose/plans/new-document-popover-implementation.md) for implementation plan.
