# New Document Creation

## Overview

The New Document feature provides a lightweight, streamlined interface for creating new documents with template selection and custom naming. Implemented as a popover attached to the "New Document" button in the sidebar.

## User Experience

### Creation Flow

1. User clicks "New Document" button → Popover appears below button
2. User selects template from dropdown → Name auto-populates from template
3. User optionally edits document name
4. User clicks "Create" → Document created and opened in editor

### Dismissal

- Click outside popover
- ESC key
- Cancel button
- Create button (on success)

## Component Design

### Layout

Compact popover with in-line field labels for space efficiency:

```
┌─────────────────────────────────────┐
│ New Document                        │
├─────────────────────────────────────┤
│ Template:    [Dropdown ▼        ]  │
│ Name:        [Text Input        ]  │
├─────────────────────────────────────┤
│              [Cancel]  [Create]     │
└─────────────────────────────────────┘
```

### Fields

**Template** (required, first field):

- Dropdown of available templates
- Defaults to "USAF Memo"
- Auto-populates document name when changed

**Document Name** (required, second field):

- Text input, auto-populated from template
- User can edit to customize
- Manual edits prevent further auto-population
- Collision detection appends "(n)" for duplicate names

### Positioning

- Anchored below "New Document" button
- Left-aligned with button
- No backdrop (standard popover behavior)
- ~384px width for optimal layout

## Template Integration

### Template Selection

- Templates loaded from Template Service (see [TEMPLATE_SERVICE.md](../backend/TEMPLATE_SERVICE.md))
- Only production-ready templates shown
- Template content loaded on creation

### Auto-Naming

When template changes (and user hasn't manually edited name):

1. Set document name to template name
2. Check for collisions with existing documents
3. Append " (n)" if duplicate found

## Validation

**Document Name**:

- Required, cannot be empty or whitespace-only
- Inline error display below field
- Create button disabled when invalid

**Template**:

- Required, must select a template
- Defaults to first production template

## Error Handling

**Validation Errors**:

- Display inline below respective field
- Disable Create button until resolved
- Keep popover open for correction

**Service Errors**:

- Template load failure: Show error, fallback to blank document
- Document creation failure: Display error, keep popover open for retry

**Network Errors**:

- Template fetch failure: Disable dropdown, log error
- Creation failure: Show error message, allow retry

## Accessibility

### Keyboard Navigation

- Tab order: Template → Name → Cancel → Create
- Enter key submits form
- ESC key closes popover
- Focus returns to trigger button on close

### ARIA

- Inherited from BasePopover: `role="dialog"`, `aria-labelledby`
- Labels associated with inputs via `for` attributes
- Error messages linked via `aria-describedby`
- Error announcements via `aria-live="polite"`

### Focus Management

- Focus template dropdown on open
- Return focus to "New Document" button on close
- Visible focus indicators on all interactive elements

## Integration Points

**Template Service** ([TEMPLATE_SERVICE.md](../backend/TEMPLATE_SERVICE.md)):

- Load template list via `listTemplates(true)` for production templates
- Load template content via `getTemplate(filename)`
- Initialize at app startup, not on popover open

**Document Store** ([STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)):

- Create document via `createDocument(name, content)`
- Optimistic UI updates handled by store
- Error handling delegated to store

**Sidebar** ([SIDEBAR.md](./SIDEBAR.md)):

- Popover triggered by "New Document" button
- Provides list of existing document names for collision detection
- Handles document creation callback

## Theme

Follows design system standards:

**Popover**:

- Background: `bg-surface-elevated`
- Border: `border-border`
- Shadow: `shadow-md`
- Padding: `p-4`

**Form Fields**:

- Labels: Fixed width (`w-20`), right-aligned, `text-sm`
- Inputs: Flexible width (`flex-1`), standard input styling
- Height: Compact `h-9` for popover efficiency
- Gap: `gap-3` between label and input

**Buttons**:

- Cancel: `variant="ghost" size="sm"`
- Create: `variant="default" size="sm"` (primary)

**Error Display**:

- Text: `text-destructive text-xs`
- Border: `border-destructive` on invalid input

## Design Rationale

### Why Popover Over Modal?

**Lightweight Action**: Two-field form doesn't require modal prominence
**Less Interruption**: No backdrop allows viewing document list
**Pattern Consistency**: Matches login and settings popovers in sidebar
**Faster Workflow**: Popover feels more responsive for quick actions

### Why In-Line Labels?

**Space Efficiency**: Maximizes horizontal space in compact popover
**Reduced Height**: Two rows instead of four stacked elements
**Visual Balance**: Clean, professional appearance
**Scan Efficiency**: Easier to scan horizontally aligned fields

### Why Template Required?

**Guided Creation**: Templates ensure consistency and provide structure
**Default Workflow**: USAF Memo is the most common use case
**Simplification**: Reduces cognitive load by removing blank option
**Flexibility**: Users can clear template content after creation if needed

## Cross-References

- [SIDEBAR.md](./SIDEBAR.md) - Integration point and trigger button
- [WIDGET_ABSTRACTION.md](./WIDGET_ABSTRACTION.md) - BasePopover component
- [TEMPLATE_SERVICE.md](../backend/TEMPLATE_SERVICE.md) - Template loading
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - Document store
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design tokens and spacing
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Accessibility standards
