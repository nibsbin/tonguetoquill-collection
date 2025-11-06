# New Document Dialog Implementation Plan

This plan outlines the steps to implement the New Document Dialog feature described in [../designs/frontend/NEW_DOCUMENT_DIALOG.md](../designs/frontend/NEW_DOCUMENT_DIALOG.md).

## Overview

Replace the sidebar's instant document creation with a dialog-based workflow that:

1. Prompts users for document name
2. Allows template selection from Template Service
3. Creates document with specified name and template content

**Key Goals:**

- Integrate Template Service with document creation flow
- Provide intentional document creation UX
- Follow KISS and DRY principles
- Reuse existing BaseDialog and service abstractions

## Prerequisites

### Existing Components (Already Implemented)

- ✅ BaseDialog component (`src/lib/components/ui/base-dialog.svelte`)
- ✅ Button component (`src/lib/components/ui/button.svelte`)
- ✅ Input component (`src/lib/components/ui/input.svelte`)
- ✅ Label component (`src/lib/components/ui/label.svelte`)
- ✅ Template Service (`src/lib/services/templates/`)
- ✅ Document Store (`src/lib/stores/documents.svelte.ts`)

### Components to Create

- ❌ NewDocumentDialog component (new)

### Components to Modify

- 🔄 Sidebar component (update New Document button handler)
- 🔄 Root layout (initialize Template Service)

## Phase 1: Initialize Template Service in App

**Goal**: Ensure Template Service is ready before dialog opens

### Step 1.1: Update Root Layout

- [ ] Open `src/routes/+layout.svelte`
- [ ] Import `templateService` from `$lib/services/templates`
- [ ] Add `onMount` handler to initialize template service
- [ ] Add error handling for initialization failures
- [ ] Log initialization status to console

**File**: `src/routes/+layout.svelte`

**Changes**:

```typescript
import { templateService } from '$lib/services/templates';

onMount(async () => {
	try {
		await templateService.initialize();
		console.log('Template service initialized');
	} catch (error) {
		console.error('Failed to initialize template service:', error);
		// Service will gracefully degrade - blank documents still work
	}
});
```

### Verification

- [ ] Run dev server, check console for "Template service initialized"
- [ ] Verify no errors in console
- [ ] Service should initialize once per app load

## Phase 2: Create NewDocumentDialog Component

**Goal**: Build reusable dialog component for document creation

### Step 2.1: Create Component Directory

- [ ] Create directory `src/lib/components/NewDocumentDialog/`
- [ ] Create file `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte`
- [ ] Create file `src/lib/components/NewDocumentDialog/index.ts` (re-export)

### Step 2.2: Define Component Props

- [ ] Define `NewDocumentDialogProps` interface with TypeScript
- [ ] Props: `open`, `onOpenChange`, `onCreate`
- [ ] `onCreate` signature: `(name: string, templateFilename?: string) => Promise<void>`

### Step 2.3: Implement Component State

- [ ] Create reactive state for `documentName` (string, default empty)
- [ ] Create reactive state for `selectedTemplate` (string | null, default null)
- [ ] Create reactive state for `isCreating` (boolean, default false)
- [ ] Create reactive state for `nameError` (string | null, default null)
- [ ] Create reactive state for `creationError` (string | null, default null)

### Step 2.4: Load Templates from Service

- [ ] Check if `templateService.isReady()` on component mount
- [ ] Call `templateService.listTemplates(true)` to get production templates
- [ ] Store templates in local state
- [ ] Handle case where service not ready (show message, disable dropdown)

### Step 2.5: Implement Validation Logic

- [ ] Create `validateDocumentName()` function
- [ ] Check for empty string or whitespace-only
- [ ] Set `nameError` state with appropriate message
- [ ] Return boolean indicating validity
- [ ] Create derived `isValid` state: `!nameError && documentName.trim().length > 0`

### Step 2.6: Implement Form Handlers

- [ ] Create `handleCancel()` function → calls `onOpenChange(false)`, resets form
- [ ] Create `handleCreate()` async function:
  - Validate document name
  - If invalid, set error and return
  - Set `isCreating = true`
  - Load template content if template selected
  - Call `onCreate(name, templateFilename)`
  - Handle errors (set `creationError`, keep dialog open)
  - On success, reset form and close dialog
  - Finally, set `isCreating = false`

### Step 2.7: Implement Dialog Markup

- [ ] Use BaseDialog component with `{open}` and `{onOpenChange}` props
- [ ] Set dialog `title="New Document"`
- [ ] Set dialog `size="md"`
- [ ] Use `content` snippet for form fields
- [ ] Use `footer` snippet for buttons

### Step 2.8: Implement Form Fields in Content Snippet

- [ ] Add form element with `onsubmit` handler (prevent default, call handleCreate)
- [ ] Add document name field:
  - Label: "Document Name"
  - Input: type="text", bind to `documentName`, required, autofocus
  - Error message: show `nameError` if present (red text)
- [ ] Add template selection field:
  - Label: "Template"
  - Native select element: bind to `selectedTemplate`
  - First option: value={null}, text="Blank Document" (default)
  - Map templates to option elements: value={template.file}, text={template.name}
  - Helper text: "Choose a template to start with" (muted text)
- [ ] Add creation error message if `creationError` present (red text)

### Step 2.9: Implement Footer Buttons

- [ ] Cancel button: variant="ghost", onclick={handleCancel}, text="Cancel"
- [ ] Create button: variant="default", onclick={handleCreate}
  - Disabled when `!isValid || isCreating`
  - Text: "Creating..." when `isCreating`, else "Create"

### Step 2.10: Add Form Reset Logic

- [ ] Create `resetForm()` function
- [ ] Reset all state: documentName='', selectedTemplate=null, errors=null, isCreating=false
- [ ] Call `resetForm()` in `handleCancel()` and after successful creation

### Step 2.11: Create Index Export

- [ ] In `index.ts`, export default from NewDocumentDialog.svelte

**Files Created**:

- `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte`
- `src/lib/components/NewDocumentDialog/index.ts`

### Verification

- [ ] Component compiles without TypeScript errors
- [ ] Renders dialog when `open={true}`
- [ ] Form fields are accessible and functional
- [ ] Validation works (empty name shows error)

## Phase 3: Integrate Dialog with Sidebar

**Goal**: Update sidebar to use dialog instead of instant creation

### Step 3.1: Update Sidebar Component

- [ ] Open `src/lib/components/Sidebar/Sidebar.svelte`
- [ ] Import NewDocumentDialog component
- [ ] Import templateService
- [ ] Add reactive state `newDocDialogOpen` (boolean, default false)

### Step 3.2: Update handleNewFile Function

- [ ] Replace direct `documentStore.createDocument()` call
- [ ] New implementation: `newDocDialogOpen = true`

**Current code** (line 63-65):

```typescript
const handleNewFile = () => {
	documentStore.createDocument();
};
```

**New code**:

```typescript
let newDocDialogOpen = $state(false);

const handleNewFile = () => {
	newDocDialogOpen = true;
};
```

### Step 3.3: Create handleCreateDocument Function

- [ ] Create new async function `handleCreateDocument(name: string, templateFilename?: string)`
- [ ] Initialize `content` variable as empty string
- [ ] If `templateFilename` provided:
  - Try to load template via `templateService.getTemplate(templateFilename)`
  - Set `content = template.content`
  - Catch errors: log error, fallback to empty content
- [ ] Call `documentStore.createDocument(name, content)`
- [ ] Document store will handle optimistic updates and navigation

**Implementation**:

```typescript
const handleCreateDocument = async (name: string, templateFilename?: string) => {
	let content = '';

	if (templateFilename) {
		try {
			const template = await templateService.getTemplate(templateFilename);
			content = template.content;
		} catch (error) {
			console.error('Failed to load template:', error);
			// Fallback to blank document
		}
	}

	await documentStore.createDocument(name, content);
};
```

### Step 3.4: Add Dialog to Sidebar Template

- [ ] Add NewDocumentDialog component before closing tag
- [ ] Bind `open={newDocDialogOpen}`
- [ ] Bind `onOpenChange={(open) => newDocDialogOpen = open}`
- [ ] Bind `onCreate={handleCreateDocument}`

**Markup**:

```svelte
<NewDocumentDialog
	open={newDocDialogOpen}
	onOpenChange={(open) => (newDocDialogOpen = open)}
	onCreate={handleCreateDocument}
/>
```

**File Modified**: `src/lib/components/Sidebar/Sidebar.svelte`

### Verification

- [ ] Clicking "New Document" button opens dialog
- [ ] Dialog displays with empty form
- [ ] Can type document name
- [ ] Can select template from dropdown
- [ ] Cancel button closes dialog without creating document
- [ ] Create button disabled when name empty
- [ ] Create button enabled when name provided

## Phase 4: End-to-End Testing

**Goal**: Verify complete workflow from button click to document creation

### Test Case 4.1: Create Blank Document

- [ ] Start dev server
- [ ] Click "New Document" button in sidebar
- [ ] Enter document name: "Test Document"
- [ ] Leave template as "Blank Document"
- [ ] Click "Create"
- [ ] Verify document appears in sidebar with correct name
- [ ] Verify document opens in editor
- [ ] Verify editor is empty (no template content)

### Test Case 4.2: Create Document with Template

- [ ] Click "New Document" button
- [ ] Enter document name: "USAF Memo Test"
- [ ] Select template: "U.S. Air Force Memo" (or any production template)
- [ ] Click "Create"
- [ ] Verify document appears in sidebar
- [ ] Verify document opens in editor
- [ ] Verify editor contains template content (not empty)

### Test Case 4.3: Validation Errors

- [ ] Click "New Document" button
- [ ] Leave document name empty
- [ ] Verify "Create" button is disabled
- [ ] Enter only spaces in document name
- [ ] Verify validation error appears
- [ ] Enter valid name
- [ ] Verify error clears and button enables

### Test Case 4.4: Dialog Dismissal

- [ ] Open dialog
- [ ] Click "Cancel" button → dialog closes
- [ ] Open dialog again
- [ ] Click backdrop outside dialog → dialog closes
- [ ] Open dialog again
- [ ] Press ESC key → dialog closes
- [ ] Open dialog again
- [ ] Click X button in header → dialog closes

### Test Case 4.5: Template Service Error Handling

- [ ] Simulate template service not ready (comment out initialization)
- [ ] Open dialog
- [ ] Verify template dropdown shows appropriate message or is disabled
- [ ] Verify can still create blank document

### Test Case 4.6: Document Creation Error Handling

- [ ] Simulate document creation failure (disconnect network for API mode)
- [ ] Open dialog, enter name, click Create
- [ ] Verify error message appears in dialog
- [ ] Verify dialog stays open
- [ ] Verify can retry creation

## Phase 5: Type Checking and Build

**Goal**: Ensure code quality and production readiness

### Step 5.1: Type Checking

- [ ] Run `npm run check` to verify TypeScript types
- [ ] Fix any type errors in NewDocumentDialog component
- [ ] Fix any type errors in Sidebar component
- [ ] Verify all props interfaces are correct

### Step 5.2: Linting

- [ ] Run linter if configured (`npm run lint`)
- [ ] Fix any linting issues
- [ ] Ensure consistent code style

### Step 5.3: Production Build

- [ ] Run `npm run build` to verify production build
- [ ] Verify no build errors
- [ ] Check build output for any warnings
- [ ] Verify bundle size is reasonable (no large increases)

## Phase 6: Documentation

**Goal**: Document the feature for future maintainers

### Step 6.1: Add Component README

- [ ] Create `src/lib/components/NewDocumentDialog/README.md`
- [ ] Document component purpose
- [ ] Document props interface
- [ ] Include usage example
- [ ] Document error handling behavior
- [ ] Add cross-reference to design document

### Step 6.2: Update Related Documentation

- [ ] Verify `prose/designs/frontend/NEW_DOCUMENT_DIALOG.md` is accurate
- [ ] Update if implementation differs from design (document deviations)
- [ ] Add implementation notes if helpful

## Implementation Notes

### Critical Details

1. **Template Service Must Be Ready**: Initialize in root layout, not in dialog
2. **Graceful Degradation**: If templates unavailable, blank document creation still works
3. **Form Validation**: Client-side validation prevents invalid document names
4. **Error Handling**: Template load errors fallback to blank document
5. **Optimistic Updates**: Document store handles optimistic UI updates
6. **Focus Management**: BaseDialog handles focus trap and restoration automatically

### Design Decisions

**Use Native Select**:

- KISS principle: Native select is simple and accessible
- No need for custom dropdown component
- Works well on all devices (mobile gets native picker)
- Sufficient for initial implementation
- Can be enhanced later with custom component if needed

**Template in Document Creation**:

- Template loading happens in Sidebar's onCreate handler, not in dialog
- Dialog is reusable - doesn't know about document store
- Separation of concerns: dialog collects input, parent handles creation

**Error Handling Strategy**:

- Template service errors → log + fallback to blank
- Template load errors → log + fallback to blank
- Document creation errors → display in dialog, allow retry
- Validation errors → display inline, prevent submission

**Form Reset**:

- Reset form on cancel and successful creation
- Prevents stale data when reopening dialog
- Clean slate for each document creation

### Template Service Integration Pattern

```typescript
// 1. App initialization (root layout)
await templateService.initialize();

// 2. Load template list (in component)
const templates = templateService.listTemplates(true);

// 3. Load template content (in onCreate handler)
if (templateFilename) {
	const template = await templateService.getTemplate(templateFilename);
	content = template.content;
}

// 4. Create document with content
await documentStore.createDocument(name, content);
```

### User Flow Summary

```
User clicks "New Document"
  ↓
Dialog opens with empty form
  ↓
User enters name + selects template (optional)
  ↓
User clicks "Create"
  ↓
[If template selected] Load template content
  ↓
Create document with name + content
  ↓
Document appears in sidebar + opens in editor
  ↓
Dialog closes
```

## File Checklist

**Files to Create:**

- `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte`
- `src/lib/components/NewDocumentDialog/index.ts`
- `src/lib/components/NewDocumentDialog/README.md`

**Files to Modify:**

- `src/lib/components/Sidebar/Sidebar.svelte` (add dialog, update handlers)
- `src/routes/+layout.svelte` (initialize template service)

**No Files to Delete**

## Verification Checklist

Before considering this plan complete:

- [ ] Template Service initializes on app load
- [ ] NewDocumentDialog component renders correctly
- [ ] Form validation works (empty name, whitespace-only name)
- [ ] Template dropdown populated with production templates
- [ ] Can create blank document (no template selected)
- [ ] Can create document with template (template content loaded)
- [ ] Dialog closes after successful creation
- [ ] Document appears in sidebar with correct name
- [ ] Document opens in editor with correct content
- [ ] All dismissal methods work (Cancel, ESC, backdrop, X button)
- [ ] Error handling works (template load failure, creation failure)
- [ ] Type checking passes (`npm run check`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Follows KISS and DRY principles
- [ ] Reuses existing components (BaseDialog, Button, Input, Label)
- [ ] Integrates cleanly with existing services (Template Service, Document Store)

## Success Criteria

The implementation is complete when:

1. ✅ Clicking "New Document" opens dialog (not instant creation)
2. ✅ Dialog prompts for document name (required field)
3. ✅ Dialog offers template selection (optional dropdown)
4. ✅ Template dropdown loaded from Template Service (production only)
5. ✅ Can create blank documents (no template)
6. ✅ Can create documents with templates (content loaded)
7. ✅ Form validation prevents invalid submissions
8. ✅ Error handling gracefully degrades on failures
9. ✅ All dismissal methods work correctly
10. ✅ Documents created with correct name and content
11. ✅ Type checking and builds pass without errors
12. ✅ Code follows KISS and DRY principles
13. ✅ Feature is documented for maintainers

## Dependencies

### Runtime Dependencies

Already installed (no new dependencies needed):

- Svelte 5 (for reactive state and snippets)
- lucide-svelte (for icons, already used in BaseDialog)

### Component Dependencies

- BaseDialog (`src/lib/components/ui/base-dialog.svelte`)
- Button (`src/lib/components/ui/button.svelte`)
- Input (`src/lib/components/ui/input.svelte`)
- Label (`src/lib/components/ui/label.svelte`)

### Service Dependencies

- Template Service (`src/lib/services/templates`)
- Document Store (`src/lib/stores/documents.svelte.ts`)

## Future Enhancements (Out of Scope)

After basic implementation, potential enhancements:

- Template preview pane (show template content before selection)
- Template search/filter (useful when many templates)
- Recent templates list (show frequently used templates)
- Custom template creation from dialog
- Document location/folder selection
- Template categories/grouping
- Template descriptions in dropdown (tooltips or expanded view)

These enhancements should have their own design and implementation plans.

## Next Steps After Implementation

1. Gather user feedback on document creation UX
2. Monitor Template Service usage and errors
3. Consider custom dropdown component if native select insufficient
4. Plan template preview feature if users request it
5. Plan template categories if template library grows
6. Consider keyboard shortcuts (Cmd+N to open dialog)
