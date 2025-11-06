# New Document Popover Design

**Status**: In Progress
**Last Updated**: 2025-11-06
**Design Type**: Feature Enhancement
**Related**: [NEW_DOCUMENT_DIALOG.md](./NEW_DOCUMENT_DIALOG.md), [WIDGET_ABSTRACTION.md](./WIDGET_ABSTRACTION.md), [SIDEBAR.md](./SIDEBAR.md)

## Overview

Convert the New Document Dialog from a modal dialog (BaseDialog) to a lightweight popover (BasePopover) with in-line field labels. This provides a more streamlined, less interruptive UX for document creation while maintaining all existing functionality.

## Motivation

### Current State

The New Document Dialog uses `BaseDialog`:
- Full-screen modal overlay with backdrop
- Vertical form layout with labels above inputs
- Blocks all interaction with the page
- Appropriate for complex multi-step workflows

**Location**: `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte`

### Problems with Current Approach

1. **Over-engineered for Simple Task**: Creating a document is a 2-field form that doesn't need modal prominence
2. **Interrupts Flow**: Full backdrop blocks sidebar interaction unnecessarily
3. **Inefficient Use of Space**: Vertical label layout wastes horizontal space
4. **Inconsistent Pattern**: Other quick actions (login, settings) use popovers, not modals

### Design Goals

1. **Lightweight UX**: Use popover instead of modal for less interruption
2. **Compact Layout**: In-line labels maximize space efficiency
3. **Consistent Pattern**: Align with other quick-action popovers in sidebar
4. **Maintain Functionality**: Preserve all existing features (template selection, auto-naming, validation)
5. **Design System Compliance**: Derive all theming from base-popover and design tokens

## User Flow

### Current Flow (Modal)

1. User clicks "New Document" → Full-screen modal opens with backdrop
2. User sees large dialog in center of screen
3. User fills template (dropdown) → auto-populates name
4. User fills document name (editable)
5. User clicks Create → Modal closes, document created

### New Flow (Popover)

1. User clicks "New Document" → Lightweight popover appears below button
2. Popover anchored to button, no backdrop, sidebar remains visible
3. User sees compact form with in-line labels
4. User selects template → auto-populates name (same logic)
5. User edits name if desired
6. User clicks Create → Popover closes, document created

### Dismissal Behavior

Follows BasePopover standard patterns:
- ESC key closes popover
- Click outside popover closes popover
- Cancel button closes popover
- Create button closes popover on success
- Close button (X) optional, likely hidden for lightweight feel

## Component Design

### Component Hierarchy

```
NewDocumentPopover
├─ BasePopover (from WIDGET_ABSTRACTION.md)
│  ├─ Trigger: Passed from parent (Sidebar's New Document button)
│  ├─ Content
│  │  ├─ Title: "New Document"
│  │  ├─ Form Fields (in-line layout)
│  │  │  ├─ Template: Label + Select (same row)
│  │  │  └─ Name: Label + Input (same row)
│  │  └─ Error Messages (if any)
│  └─ Footer
│     ├─ Cancel Button
│     └─ Create Button (primary)
└─ (integrates with templateService and documentStore)
```

### Props Interface

```typescript
interface NewDocumentPopoverProps {
	/** Whether popover is open */
	open: boolean;

	/** Callback when popover should close */
	onOpenChange: (open: boolean) => void;

	/** Callback when document should be created */
	onCreate: (name: string, templateFilename: string) => Promise<void>;

	/** List of existing document names for collision detection */
	existingDocumentNames?: string[];
}
```

**Note**: Same interface as dialog version for easy migration.

### In-Line Field Layout

**Key Design Change**: Labels and inputs on same row instead of stacked vertically.

**Pattern**:
```
┌─────────────────────────────────────┐
│ New Document                      × │ (title + close button)
├─────────────────────────────────────┤
│ Template:    [Dropdown ▼        ]  │ (label + input, same row)
│ Name:        [Text Input        ]  │ (label + input, same row)
├─────────────────────────────────────┤
│              [Cancel]  [Create]     │ (footer buttons)
└─────────────────────────────────────┘
```

**Layout Specifications**:
- Label width: Fixed width (e.g., `w-20` or `w-24`) for alignment
- Input width: Flexible to fill remaining space (`flex-1`)
- Row structure: `flex items-center gap-3` or similar
- Label alignment: Right-aligned text for clean visual flow
- Total popover width: ~320px-400px (narrower than dialog's 448px)

### State Management

Identical to dialog version - no changes needed:
- `documentName: string`
- `selectedTemplate: string`
- `isCreating: boolean`
- `error: string | null`
- `hasUserEditedName: boolean`
- Template loading state
- Validation state

### Form Validation

No changes from dialog version:
- Document name required
- Template selection required
- Auto-naming with collision detection
- Manual edit tracking

## Popover Specifications

### Visual Design

**Popover Configuration**:
- Position: `side="bottom"` (below trigger button)
- Alignment: `align="start"` (left-aligned with button)
- Width: `w-96` (~384px) - narrower than dialog
- No backdrop (standard popover behavior)
- Standard padding: `p-4` per design system

**Header**:
- Title: "New Document"
- Optional close button (likely hidden for cleaner look)
- Bottom border separator

**Content**:
- Two rows with in-line labels
- Consistent spacing between rows (12px / 0.75rem)
- Error messages below respective fields
- No helper text to keep compact

**Footer**:
- Right-aligned button group
- Cancel button (ghost variant)
- Create button (default variant, primary)
- Standard gap between buttons

### In-Line Field Implementation

**Template Field**:
```svelte
<div class="flex items-center gap-3">
  <Label for="template" class="w-20 text-right text-sm text-foreground">
    Template
  </Label>
  <select
    id="template"
    bind:value={selectedTemplate}
    class="flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm"
  >
    {#each templates as template}
      <option value={template.file}>{template.name}</option>
    {/each}
  </select>
</div>
```

**Name Field**:
```svelte
<div class="flex items-center gap-3">
  <Label for="doc-name" class="w-20 text-right text-sm text-foreground">
    Name
  </Label>
  <Input
    id="doc-name"
    type="text"
    bind:value={documentName}
    class="flex-1 h-9 text-sm"
  />
</div>
```

**Layout Details**:
- Labels: `w-20` (80px) fixed width, right-aligned
- Gap: `gap-3` (12px) between label and input
- Inputs: `flex-1` to fill remaining space
- Height: `h-9` (36px) for compact feel vs dialog's `h-10`
- Font size: `text-sm` for labels and inputs

### Accessibility

**ARIA Attributes**:
- Inherited from BasePopover: `role="dialog"`, `aria-labelledby`
- Label associations maintained via `for` attributes
- Error messages: `aria-describedby` on inputs when error present

**Keyboard Navigation**:
- Tab order: Template → Name → Cancel → Create
- Enter key submits form (same as dialog)
- ESC key closes popover
- No focus trap (popover standard - allows page interaction)

**Focus Management**:
- Focus template dropdown when popover opens
- Return focus to "New Document" button when popover closes
- Standard popover behavior (no focus trap)

**Screen Reader Support**:
- Label associations maintained
- Error messages announced
- Form validation messages associated with inputs

### Theme Integration

Follows design system standards from WIDGET_ABSTRACTION.md:

**Popover Base**:
- Background: `bg-surface-elevated`
- Border: `border-border`
- Shadow: `shadow-md`
- No default padding (applied by content)

**Content Container**:
- Padding: `p-4` (standard popover padding)
- Spacing: `space-y-3` between rows

**Form Elements**:
- Labels: `text-foreground text-sm` (compact size)
- Inputs: Standard input styling from design system
- Selects: Match input styling for consistency
- Reduced height (`h-9` vs `h-10`) for compact popover feel

**Buttons**:
- Cancel: `Button variant="ghost" size="sm"`
- Create: `Button variant="default" size="sm"`

**Error State**:
- Error text: `text-destructive text-xs` (smaller for compact layout)
- Error border: `border-destructive` on input

## Positioning

### Trigger Integration

**Current Dialog Trigger** (Sidebar):
```typescript
const handleNewFile = () => {
	newDocDialogOpen = true;
};
```

**New Popover Trigger**:
```svelte
<BasePopover bind:open={newDocPopoverOpen} {onOpenChange} side="bottom" align="start">
  {#snippet trigger()}
    <Button onclick={() => handleNewFile()} class="w-full">
      <FilePlus class="h-5 w-5" />
      New Document
    </Button>
  {/snippet}
  
  {#snippet content()}
    <!-- Popover content -->
  {/snippet}
</BasePopover>
```

### Positioning Behavior

- **Side**: `bottom` - Opens below the New Document button
- **Align**: `start` - Left edge aligns with button's left edge
- **Offset**: Default `sideOffset={8}` - 8px gap below button
- **Viewport Handling**: BasePopover auto-adjusts if near edge
- **Scroll Behavior**: Repositions on scroll (BasePopover handles)

## Integration Points

### Template Service Integration

No changes needed - same pattern as dialog:
- Check `templateService.isReady()`
- Load templates via `listTemplates(true)`
- Auto-populate name from template
- Load template content via `getTemplate()`

### Document Store Integration

No changes needed - same pattern as dialog:
- Call `documentStore.createDocument(name, content)`
- Handle optimistic updates
- Show loading state during creation
- Show error if creation fails

### Sidebar Integration

**Minimal Changes Required**:

1. Replace `BaseDialog` import with `BasePopover`
2. Update component structure to use popover snippets
3. Keep all handler logic identical
4. No prop changes (same interface)

**Migration Pattern**:
```svelte
<!-- OLD: Dialog -->
<NewDocumentDialog
  open={newDocDialogOpen}
  onOpenChange={(open) => (newDocDialogOpen = open)}
  onCreate={handleCreateDocument}
  existingDocumentNames={existingNames}
/>

<!-- NEW: Popover (internally using BasePopover) -->
<NewDocumentPopover
  open={newDocPopoverOpen}
  onOpenChange={(open) => (newDocPopoverOpen = open)}
  onCreate={handleCreateDocument}
  existingDocumentNames={existingNames}
/>
```

## Design Decisions

### Why Popover Instead of Modal?

**Decision**: Use BasePopover instead of BaseDialog

**Reasoning**:
1. **Lightweight Action**: 2-field form doesn't warrant modal prominence
2. **Less Interruption**: No backdrop allows viewing sidebar
3. **Faster Workflow**: Popover feels faster and more responsive
4. **Pattern Consistency**: Login uses popover, settings uses popover
5. **Space Efficiency**: Popover is more compact for simple forms

### Why In-Line Labels?

**Decision**: Labels on same row as inputs (horizontal layout)

**Reasoning**:
1. **Space Efficiency**: Maximizes use of horizontal space in popover
2. **Compact Feel**: Reduces vertical height, fits better in popover
3. **Visual Balance**: Two clean rows instead of four stacked elements
4. **Scan Efficiency**: Easier to scan horizontally aligned fields
5. **Professional Look**: Common pattern in compact UIs (settings panels, filters)

### Should Close Button Be Visible?

**Decision**: Hide close button for cleaner, more compact appearance

**Reasoning**:
1. **Popover Standard**: Most popovers don't show close button (login, settings)
2. **Redundant**: Cancel button + click outside + ESC all dismiss
3. **Cleaner Look**: More space for title without close button
4. **Consistent**: Matches other popovers in application

### Should Backdrop Be Used?

**Decision**: No backdrop (standard popover behavior)

**Reasoning**:
1. **Popover Pattern**: Popovers don't use backdrops (unlike modals)
2. **Less Intrusive**: User can still see and access sidebar
3. **Context Awareness**: User can see document list while creating
4. **Lightweight Feel**: Reinforces that this is a quick action

### Width Sizing

**Decision**: Fixed width `w-96` (~384px) instead of responsive

**Reasoning**:
1. **Predictable Layout**: In-line labels require consistent width
2. **Optimal Readability**: 384px balances label width and input space
3. **Mobile Consideration**: Will still work on tablets (768px+)
4. **Prevents Reflow**: Fixed width avoids layout shifts

## Migration Strategy

### Phase 1: Update Design Document

- [x] Create NEW_DOCUMENT_POPOVER.md with complete specifications
- [ ] Link from NEW_DOCUMENT_DIALOG.md as superseded design

### Phase 2: Create Implementation Plan

- [ ] Create detailed plan in `prose/plans/new-document-popover-implementation.md`
- [ ] Break down into small, testable steps
- [ ] Define success criteria and rollback plan

### Phase 3: Implement Changes

- [ ] Rename component file (optional, can keep name)
- [ ] Replace BaseDialog with BasePopover
- [ ] Update layout to in-line labels
- [ ] Adjust styling for popover sizing
- [ ] Update all imports and references
- [ ] Test functionality parity

### Phase 4: Validate

- [ ] Visual testing (appearance, spacing, alignment)
- [ ] Functional testing (all features work)
- [ ] Accessibility testing (keyboard nav, screen readers)
- [ ] Mobile/responsive testing
- [ ] Cross-browser testing

## Benefits

### For Users

1. **Faster Workflow**: No full-screen modal interruption
2. **Context Retention**: Can still see document list while creating
3. **Visual Efficiency**: Compact layout reduces eye movement
4. **Familiar Pattern**: Consistent with other sidebar popovers
5. **Less Intimidating**: Lightweight popover feels less formal

### For Developers

1. **Simpler Component**: Popover is lighter than dialog
2. **Consistent Pattern**: Matches login/settings popover patterns
3. **Less Code**: No backdrop handling needed
4. **Better Performance**: Lighter DOM footprint
5. **Easier Testing**: Simpler component structure

### For Design System

1. **Pattern Consistency**: All sidebar actions use popovers
2. **Modal Reserve**: Reserves modals for truly important actions
3. **Clear Hierarchy**: Popover = quick action, Modal = critical decision
4. **Reduced Complexity**: One less modal in the system

## Testing Strategy

### Visual Testing

- [ ] Popover appears below "New Document" button
- [ ] Width is consistent and appropriate (~384px)
- [ ] In-line labels aligned properly (right-aligned, same width)
- [ ] Inputs fill remaining space evenly
- [ ] Spacing between rows is consistent
- [ ] Footer buttons right-aligned with proper gap
- [ ] No layout shifts or reflows

### Functional Testing

- [ ] Template selection populates name automatically
- [ ] Name collision detection works
- [ ] Manual name edits prevent auto-population
- [ ] Validation shows errors inline
- [ ] Create button disabled when invalid
- [ ] Cancel closes popover without creating
- [ ] Create succeeds and closes popover
- [ ] Error states displayed correctly

### Accessibility Testing

- [ ] Tab order logical (Template → Name → Cancel → Create)
- [ ] Enter submits form
- [ ] ESC closes popover
- [ ] Labels associated with inputs
- [ ] Error messages associated with inputs
- [ ] Focus returns to trigger on close
- [ ] Screen reader announces fields correctly

### Responsive Testing

- [ ] Desktop (1024px+): Full popover visible
- [ ] Tablet (768px): Popover fits, no overflow
- [ ] Mobile (<768px): Consider alternative layout or fallback

### Comparison Testing

- [ ] All features from dialog version present
- [ ] No regressions in functionality
- [ ] UX feels faster/lighter
- [ ] Visual appearance cleaner

## Future Enhancements

### Potential Improvements

**Quick Template Buttons**:
- Add 1-2 quick template buttons above form
- "Blank" and "USAF Memo" as instant create
- Bypass form entirely for common cases

**Template Preview**:
- Small preview pane on template selection
- Show first few lines of template
- Helps users choose correct template

**Recent Templates**:
- Show most recently used template first
- Reduce clicks for frequent workflows

**Keyboard Shortcut**:
- Cmd+N / Ctrl+N to open popover
- Power user efficiency

### Non-Goals

**Complex Template Browser**:
- Template browsing is separate feature
- Keep creation popover simple

**Multi-Step Wizard**:
- Document creation should stay 1-step
- Additional options go in document settings

**Document Location**:
- Folder/location selection not in scope
- Future feature when folders implemented

## Cross-References

- [NEW_DOCUMENT_DIALOG.md](./NEW_DOCUMENT_DIALOG.md) - Previous dialog-based design (superseded)
- [WIDGET_ABSTRACTION.md](./WIDGET_ABSTRACTION.md) - BasePopover specifications
- [SIDEBAR.md](./SIDEBAR.md) - Sidebar integration context
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design tokens and spacing
- [TEMPLATE_SERVICE.md](../backend/TEMPLATE_SERVICE.md) - Template service API

## Implementation Notes

See `prose/plans/new-document-popover-implementation.md` for detailed step-by-step implementation plan.

This design provides the high-level desired state. The implementation plan will detail how to migrate from the current dialog implementation to this popover implementation while maintaining all existing functionality.
