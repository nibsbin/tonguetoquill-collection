# NewDocumentDialog Component

A modal dialog for creating new documents with optional template selection.

## Overview

The NewDocumentDialog component provides a form-based interface for creating documents. It prompts users for a document name and allows optional template selection from the Template Service. This component follows the intentional document creation pattern, replacing instant document creation with a more deliberate workflow.

## Features

- **Document Name Input**: Required text field with validation
- **Template Selection**: Optional dropdown with production templates
- **Form Validation**: Client-side validation prevents invalid submissions
- **Error Handling**: Displays inline errors for validation and creation failures
- **Loading States**: Shows creating state while document is being created
- **Graceful Degradation**: Works even if Template Service unavailable
- **Keyboard Support**: Enter to submit, ESC to cancel

## Props

```typescript
interface NewDocumentDialogProps {
	/** Whether dialog is open */
	open: boolean;

	/** Callback when dialog should close */
	onOpenChange: (open: boolean) => void;

	/** Callback when document should be created */
	onCreate: (name: string, templateFilename?: string) => Promise<void>;
}
```

## Usage

```svelte
<script lang="ts">
	import NewDocumentDialog from '$lib/components/NewDocumentDialog';
	import { templateService } from '$lib/services/templates';
	import { documentStore } from '$lib/stores/documents.svelte';

	let dialogOpen = $state(false);

	function openDialog() {
		dialogOpen = true;
	}

	async function handleCreateDocument(name: string, templateFilename?: string) {
		let content = '';

		// Load template content if template selected
		if (templateFilename) {
			try {
				const template = await templateService.getTemplate(templateFilename);
				content = template.content;
			} catch (error) {
				console.error('Failed to load template:', error);
				// Fallback to blank document
			}
		}

		// Create document with name and content
		await documentStore.createDocument(name, content);
	}
</script>

<button onclick={openDialog}>New Document</button>

<NewDocumentDialog
	open={dialogOpen}
	onOpenChange={(open) => (dialogOpen = open)}
	onCreate={handleCreateDocument}
/>
```

## Behavior

### Form Validation

**Document Name**:

- Required field
- Cannot be empty or whitespace-only
- Validation triggered on blur and input (if error exists)
- Error message shown inline below input

**Template**:

- Optional field
- Defaults to "Blank Document" (null value)
- Populated from Template Service (production templates only)
- Disabled if Template Service not ready

### Creation Flow

1. User opens dialog
2. User enters document name (required)
3. User selects template (optional)
4. User clicks "Create"
5. Validation runs
6. If valid:
   - onCreate callback called with name and optional templateFilename
   - Parent component loads template content and creates document
   - On success: form resets and dialog closes
   - On error: error displayed, dialog stays open for retry

### Dismissal Methods

- **Cancel button**: Resets form and closes dialog
- **ESC key**: Handled by BaseDialog, closes dialog
- **Backdrop click**: Handled by BaseDialog, closes dialog
- **Close button (X)**: Handled by BaseDialog, closes dialog

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

- If service not ready: "Templates unavailable" helper text shown
- Template dropdown disabled
- Can still create blank documents
- No blocking error - graceful degradation

## Accessibility

- **Focus Management**: Document name input auto-focused when dialog opens
- **Keyboard Navigation**: Tab cycles through inputs and buttons, Enter submits
- **ARIA Labels**: Proper labels for all form fields
- **Error Announcements**: Validation errors associated with inputs
- **Screen Reader Support**: Error messages announced, loading states communicated

## Styling

- Uses design system tokens for colors and spacing
- Matches application theme (light/dark mode support)
- Native select element for template dropdown (simple and accessible)
- Consistent with other dialog components

## Dependencies

- **BaseDialog**: Widget abstraction for modal dialogs
- **Button**: Standard button component
- **Input**: Standard text input component
- **Label**: Standard label component
- **Template Service**: For loading template list and content

## Integration Points

- **Template Service**: Must be initialized before dialog opens (done in root layout)
- **Document Store**: Parent component delegates to document store for creation
- **Sidebar**: Primary integration point, triggers dialog from "New Document" button

## Testing

### Unit Tests

- Component renders with correct props
- Form validation works (empty name, whitespace-only)
- Template dropdown populated from service
- Create button disabled when invalid
- Cancel button closes dialog
- onCreate callback called with correct arguments

### Integration Tests

- End-to-end document creation flow
- Template loading and document population
- Error handling for creation failures
- Dialog dismissal methods

## Design Reference

See [prose/designs/frontend/NEW_DOCUMENT_DIALOG.md](../../../prose/designs/frontend/NEW_DOCUMENT_DIALOG.md) for detailed design documentation.

## Implementation Reference

See [prose/plans/new-document-dialog-implementation.md](../../../prose/plans/new-document-dialog-implementation.md) for implementation plan.
