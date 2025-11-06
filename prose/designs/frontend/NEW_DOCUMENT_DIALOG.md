# New Document Dialog Design

**Status**: In Progress
**Last Updated**: 2025-11-06
**Design Type**: Feature Component Design
**Related**: [SIDEBAR.md](./SIDEBAR.md), [WIDGET_ABSTRACTION.md](./WIDGET_ABSTRACTION.md), [TEMPLATE_SERVICE.md](../backend/TEMPLATE_SERVICE.md)

## Overview

The New Document Dialog is a modal dialog that collects user input before creating a new document. It replaces the instant document creation pattern with a more intentional workflow that allows users to:

1. Name their document before creation
2. Select a template to start with
3. Start with a blank document if desired

This design follows KISS and DRY principles by leveraging existing abstractions and services.

## Motivation

### Current Behavior

The sidebar's "New Document" button currently:

- Instantly creates a new document with name "Untitled Document"
- Opens the empty document in the editor
- Requires users to manually rename the document later
- Provides no template selection

**Location**: `src/lib/components/Sidebar/Sidebar.svelte:190-196`

### Problems

1. **Poor UX**: Users must immediately rename "Untitled Document"
2. **No Template Support**: Cannot leverage existing template system
3. **Cluttered Document List**: Creates many unnamed documents quickly
4. **Missed Opportunity**: Template Service exists but is unused in creation flow

### Design Goals

1. **Intentional Creation**: Users explicitly name and configure documents before creation
2. **Template Integration**: Leverage Template Service for starting content
3. **Maintain Speed**: Keep creation fast and lightweight (no multi-step wizard)
4. **Consistent UX**: Use established dialog patterns from WIDGET_ABSTRACTION.md
5. **DRY**: Reuse BaseDialog component and existing services

## User Flow

### Triggered Action

User clicks "New Document" button in sidebar → Dialog opens

### Dialog Interaction

1. Dialog displays with two input fields in the following order:
   - **Template** (dropdown/select, required, defaults to "USAF Memo")
   - **Document Name** (text input, auto-populated from template)

2. Template dropdown shows:
   - List of production templates from Template Service
   - No "Blank Document" option (template selection is required)
   - Defaults to "USAF Memo" on open

3. Document name auto-populates reactively based on selected template:
   - Format: "{Template Name}"
   - If name collision exists, appends " ({number})" to resolve
   - User can manually modify the auto-populated name
   - Manual edits prevent further auto-population

4. User fills form and clicks "Create" → Dialog closes, document created and opened

5. User can dismiss dialog via:
   - Cancel button
   - ESC key
   - Close button (X)
   - Backdrop click (optional, see Design Decisions)

### Post-Creation Behavior

- Document created with specified name and template content
- Document becomes active (opens in editor)
- Document appears in sidebar list
- Dialog closes automatically

## Component Design

### Component Hierarchy

```
NewDocumentDialog
├─ BaseDialog (from WIDGET_ABSTRACTION.md)
│  ├─ Dialog Header ("New Document")
│  ├─ Dialog Content
│  │  ├─ Label + Select (Template) - First, required
│  │  └─ Label + Input (Document Name) - Second, auto-populated
│  └─ Dialog Footer
│     ├─ Cancel Button
│     └─ Create Button (primary)
└─ (integrates with templateService and documentStore)
```

### Props Interface

```typescript
interface NewDocumentDialogProps {
	/** Whether dialog is open */
	open: boolean;

	/** Callback when dialog should close */
	onOpenChange: (open: boolean) => void;

	/** Callback when document should be created */
	onCreate: (name: string, templateFilename: string) => Promise<void>;

	/** List of existing document names for collision detection */
	existingDocumentNames?: string[];
}
```

### State Management

Dialog manages internal form state:

- `documentName: string` - User-entered or auto-populated document name
- `selectedTemplate: string` - Selected template filename (required, defaults to USAF Memo)
- `isCreating: boolean` - Loading state during document creation
- `error: string | null` - Validation or creation error message
- `hasUserEditedName: boolean` - Tracks if user has manually edited the name

Parent component (Sidebar) manages:

- `dialogOpen: boolean` - Whether dialog is visible
- Document creation logic (delegates to documentStore)
- List of existing document names for collision detection

### Form Validation

**Document Name**:

- Required field
- Must not be empty or only whitespace
- Auto-populated from template name when template changes
- Manual edits prevent auto-population
- Show inline error if validation fails
- Disable "Create" button when invalid

**Template**:

- Required field
- Defaults to "USAF Memo" (first production template)
- No "Blank Document" option
- Dropdown populated with production templates only

### Template Integration

**Initialization**:

- Template Service must be initialized before dialog opens
- Check `templateService.isReady()` before rendering dropdown
- Show loading state if templates not loaded

**Template Loading**:

- Call `templateService.listTemplates(true)` to get production templates
- Display only production-ready templates
- Default to "USAF Memo" (usaf_template.md)

**Auto-Naming**:

- When template changes and user hasn't manually edited name:
  - Set document name to template name (e.g., "USAF Memo")
  - Check for name collisions with existing documents
  - If collision exists, append " (n)" where n is the first available number

**Content Population**:

- Load template content via `templateService.getTemplate(filename)`
- Pass template filename and name to `onCreate` callback
- Parent loads content and creates document

## Dialog Specifications

### Visual Design

**Dialog Size**: Medium (`md` - 28rem / 448px)

**Header**:

- Title: "New Document"
- Close button (X) in top-right

**Content**:

- Two-field form with vertical stacking
- Template field appears first
- Document Name field appears second
- Consistent spacing between fields (16px / 1rem)
- Clear labels above inputs
- Helper text for fields as needed

**Footer**:

- Right-aligned button group
- Cancel button (ghost variant)
- Create button (default variant, primary action)

### Accessibility

**ARIA Attributes**:

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby="dialog-title"`
- `aria-describedby="dialog-description"` (if description provided)

**Keyboard Navigation**:

- Tab order: Template → Document Name → Cancel → Create → Close (X)
- Enter key submits form (creates document)
- ESC key closes dialog
- Focus trapped within dialog

**Focus Management**:

- Focus Template dropdown when dialog opens
- Return focus to "New Document" button when dialog closes
- Proper focus indicators on all interactive elements

**Screen Reader Support**:

- Label associations for inputs
- Error messages announced via `aria-live="polite"`
- Form validation messages associated with inputs via `aria-describedby`

### Theme Integration

Follows design system tokens from WIDGET_THEME_UNIFICATION.md:

**Surfaces**:

- Dialog background: `bg-surface-elevated`
- Dialog border: `border-border`

**Form Elements**:

- Input background: `bg-input`
- Input border: `border-input`
- Input text: `text-foreground`
- Label text: `text-foreground font-medium`
- Helper text: `text-muted-foreground text-sm`

**Buttons**:

- Cancel: `Button variant="ghost"`
- Create: `Button variant="default"` (primary)

**Error State**:

- Error text: `text-destructive text-sm`
- Error border: `border-destructive`

## Integration Points

### Template Service Integration

**Service Reference**: `prose/designs/backend/TEMPLATE_SERVICE.md`

**Usage Pattern**:

```typescript
// Check if service is ready
if (!templateService.isReady()) {
	await templateService.initialize();
}

// Get template list for dropdown
const templates = templateService.listTemplates(true); // production only

// Load selected template content
if (selectedTemplateFilename) {
	const template = await templateService.getTemplate(selectedTemplateFilename);
	content = template.content;
}
```

**Error Handling**:

- Template service initialization failure: Show error, disable template dropdown
- Template load failure: Show error, fallback to blank document
- Network failures: Graceful degradation to blank document option

### Document Store Integration

**Service Reference**: `prose/designs/frontend/STATE_MANAGEMENT.md`

**Creation Pattern**:

```typescript
await documentStore.createDocument(documentName, templateContent);
```

**Optimistic Updates**:

- Document store handles optimistic UI updates
- Dialog shows loading state during creation
- Dialog closes on successful creation
- Dialog shows error if creation fails (stays open for retry)

### Sidebar Integration

**Component Reference**: `prose/designs/frontend/SIDEBAR.md`

**Updated Button Behavior**:

Current (Sidebar.svelte:63-65):

```typescript
const handleNewFile = () => {
	documentStore.createDocument();
};
```

New behavior:

```typescript
let newDocDialogOpen = $state(false);

const handleNewFile = () => {
	newDocDialogOpen = true;
};

const handleCreateDocument = async (name: string, templateFilename?: string) => {
	let content = '';

	if (templateFilename) {
		const template = await templateService.getTemplate(templateFilename);
		content = template.content;
	}

	await documentStore.createDocument(name, content);
	newDocDialogOpen = false;
};
```

## Component Implementation

### File Location

```
src/lib/components/NewDocumentDialog/
├── NewDocumentDialog.svelte    # Main component
├── index.ts                     # Re-exports
└── README.md                    # Component documentation
```

### Dependencies

**External Dependencies**:

- BaseDialog component from `src/lib/components/ui/dialog.svelte`
- Button component from `src/lib/components/ui/button.svelte`
- Input component from `src/lib/components/ui/input.svelte`
- Label component from `src/lib/components/ui/label.svelte`
- Select component from `src/lib/components/ui/select.svelte` (or native select)

**Services**:

- Template Service from `src/lib/services/templates`
- Document Store from `src/lib/stores/documents.svelte.ts`

**Icons**:

- lucide-svelte (if icons needed for template dropdown)

### Component Structure

**High-level structure** (conceptual, not code):

```
<BaseDialog>
  {#snippet header()}
    <h2>New Document</h2>
  {/snippet}

  {#snippet content()}
    <form>
      <Label for="template">Template</Label>
      <Select id="template" bind:value={selectedTemplate}>
        {#each templates as template}
          <option value={template.file}>{template.name}</option>
        {/each}
      </Select>
      <HelperText>Choose a template to start with</HelperText>

      <Label for="doc-name">Document Name</Label>
      <Input id="doc-name" bind:value={documentName} required />
      {#if nameError}
        <ErrorMessage>{nameError}</ErrorMessage>
      {/if}
      <HelperText>Auto-populated from template, editable</HelperText>
    </form>
  {/snippet}

  {#snippet footer()}
    <Button variant="ghost" onclick={handleCancel}>Cancel</Button>
    <Button onclick={handleCreate} disabled={!isValid || isCreating}>
      {isCreating ? 'Creating...' : 'Create'}
    </Button>
  {/snippet}
</BaseDialog>
```

## Design Decisions

### Why Modal Instead of Popover?

**Decision**: Use modal dialog (BaseDialog) instead of popover

**Reasoning**:

- **Importance**: Creating a document is a primary action worthy of focused attention
- **Form Complexity**: Two-field form with validation requires more space than popover
- **Blocking Nature**: User must complete or cancel creation (intentional decision)
- **Mobile Support**: Modal provides better mobile UX than popover
- **Consistency**: Other important actions (Share, Import) use modal pattern

### Why Not Multi-Step Wizard?

**Decision**: Single-form dialog instead of multi-step wizard

**Reasoning**:

- **KISS Principle**: Two fields don't justify wizard complexity
- **Speed**: Single form faster to complete
- **Clarity**: All options visible at once (no hidden steps)
- **Low Cognitive Load**: Simple form requires minimal explanation

### Should Template Be Required?

**Decision**: Template is required, defaults to "USAF Memo"

**Reasoning**:

- **Template-First Workflow**: System designed around template usage
- **Guided Creation**: Templates provide structure and ensure consistency
- **Default Choice**: USAF Memo is the most common use case
- **Simplification**: Removing blank option reduces cognitive load
- **User Flexibility**: Users can still clear template content after creation if needed

### Should Dialog Close on Backdrop Click?

**Decision**: Allow backdrop click dismissal (default BaseDialog behavior)

**Reasoning**:

- **Low Friction**: No data loss (nothing created yet)
- **Expected Behavior**: Users expect modals to close on backdrop click
- **Escape Hatch**: Provides quick way to cancel without finding button
- **Consistency**: Matches other non-destructive dialogs in application

### When Should Template Service Initialize?

**Decision**: Initialize Template Service in root layout, not in dialog

**Reasoning**:

- **Performance**: Avoid initialization delay when opening dialog
- **Reliability**: Ensure templates available before dialog opens
- **Separation of Concerns**: Service lifecycle independent of component lifecycle
- **Error Handling**: Surface initialization errors at app startup, not on user action

### Should Template Preview Be Shown?

**Decision**: No preview in initial implementation

**Reasoning**:

- **KISS Principle**: Preview adds significant complexity
- **Description Suffices**: Template descriptions explain purpose
- **Speed**: Preview requires loading template content (slower UX)
- **Future Enhancement**: Can be added later if user research shows need

## Error Handling

### Validation Errors

**Document Name Empty**:

- Show inline error: "Document name is required"
- Disable Create button
- Do not close dialog

**Document Name Whitespace Only**:

- Show inline error: "Document name cannot be empty"
- Disable Create button
- Do not close dialog

### Service Errors

**Template Service Not Initialized**:

- Disable template dropdown
- Show helper text: "Templates unavailable"
- Allow blank document creation

**Template Load Failure**:

- Show error toast: "Failed to load template. Creating blank document."
- Fallback to blank document creation
- Dialog closes after creation

**Document Creation Failure**:

- Show inline error in dialog: "Failed to create document. Please try again."
- Keep dialog open for retry
- Enable Create button after error displayed

### Network Errors

**Template Service Fetch Failure**:

- Log error to console
- Disable template dropdown
- Allow blank document creation

**Document Creation Network Failure**:

- Display error message from document store
- Keep dialog open
- Allow retry

## Testing Strategy

### Component Tests

**Rendering**:

- Renders dialog when open=true
- Does not render when open=false
- Displays correct title and labels
- Renders template dropdown with correct options

**User Interaction**:

- Can type in document name input
- Can select template from dropdown
- Create button disabled when name empty
- Cancel button closes dialog
- Create button triggers onCreate callback

**Validation**:

- Shows error for empty document name
- Shows error for whitespace-only name
- Disables Create button for invalid input
- Enables Create button when valid

**Keyboard Navigation**:

- Tab key cycles through interactive elements
- Enter key submits form
- ESC key closes dialog
- Focus returns to trigger on close

**Template Integration**:

- Loads templates from Template Service
- Displays "Blank Document" option
- Shows template descriptions
- Passes correct template filename to onCreate

**Error Handling**:

- Displays creation errors inline
- Shows loading state during creation
- Handles template load failures gracefully

### Integration Tests

**End-to-End Flow**:

1. Click "New Document" button → Dialog opens
2. Enter document name → Input updates
3. Select template → Dropdown updates
4. Click Create → Document created with name and template content
5. Dialog closes → Document appears in sidebar and opens in editor

**Error Recovery**:

1. Open dialog with invalid template service → Blank document option available
2. Create document with network error → Error displayed, dialog stays open
3. Retry creation after error → Succeeds and closes dialog

## Future Enhancements

### Potential Additions

**Template Preview**:

- Show preview pane with template content/structure
- Render markdown preview or show first few lines
- Toggle preview on/off

**Recent Templates**:

- Track user's frequently used templates
- Show "Recent" section in dropdown
- Personalize template suggestions

**Template Search**:

- Add search/filter input for template dropdown
- Filter by name or description
- Useful when template count grows

**Template Categories**:

- Group templates by category (Military, Business, Academic)
- Nested dropdown or tabbed interface
- Improve discoverability for large template library

**Document Location**:

- Add folder/location picker (when folder system implemented)
- Default to root or current folder
- Organize documents from creation

**Template Customization**:

- Pre-fill template variables before creation
- Customize template metadata
- Personalize template content

### Non-Goals

**Custom Template Creation**:

- Template creation is separate feature
- Not part of new document workflow
- Requires admin/template management UI

**Collaborative Creation**:

- Multi-user document creation
- Real-time collaboration setup
- Out of scope for creation dialog

**Advanced Options**:

- Document permissions/sharing on creation
- Tags/categories on creation
- Export format selection
- Keep creation dialog simple and focused

## Cross-References

- [SIDEBAR.md](./SIDEBAR.md) - Sidebar integration point
- [WIDGET_ABSTRACTION.md](./WIDGET_ABSTRACTION.md) - BaseDialog component specification
- [TEMPLATE_SERVICE.md](../backend/TEMPLATE_SERVICE.md) - Template Service API
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - Document Store integration
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design tokens and theme
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Accessibility standards

## Implementation Notes

See `prose/plans/new-document-dialog-implementation.md` for detailed implementation plan with specific steps and file changes.

This design provides the high-level desired state. The implementation plan describes how to move from current state to desired state while maintaining existing functionality.
