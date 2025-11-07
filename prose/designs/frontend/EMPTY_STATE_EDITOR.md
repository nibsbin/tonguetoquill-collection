# Empty State Editor Design

## Overview

This document describes the desired user experience when no document is selected in Tonguetoquill. Instead of replacing the entire DocumentEditor layout with an empty state message, the application should continue displaying the editor and preview panels with the empty state message centered in the markdown editor area, dimmed to signal that it is un-interactable.

## Current Behavior

**When no document is selected** (`!documentStore.activeDocumentId`):

- The entire DocumentEditor component is replaced with a centered message
- User sees: "No Document Selected" with a link to create a new document
- The editor and preview panels are completely hidden
- Visual discontinuity when switching between no-document and document-selected states

**When a document is selected**:

- DocumentEditor component renders with full functionality
- Left panel: EditorToolbar and MarkdownEditor
- Right panel: Preview rendering
- Modal dialogs overlay the preview panel

## Desired Behavior

### Always Render DocumentEditor

The DocumentEditor component should **always be rendered**, regardless of whether a document is selected. This provides visual continuity and maintains spatial awareness for users.

### Empty State in Editor

When `!documentStore.activeDocumentId`:

- The markdown editor area shows an empty state message
- Message content: "Select a document from the sidebar or create a new one"
- Message styling: Centered, muted text, matches design system
- Message should include the same interactive link to create a new document

### Visual Dimming/Overlay

To signal that the editor is not interactive when no document is loaded:

- The editor panel should be dimmed (reduced opacity)
- Add a subtle overlay or reduced opacity to indicate disabled state
- Prevent pointer events on the editor area
- The toolbar should also be disabled/dimmed

### Preview Panel Behavior

- The preview panel remains visible but empty
- No content is rendered when no document is active
- Visual consistency maintained with split-pane layout

### Transition Behavior

- Smooth transition when switching from no-document to document-selected
- No jarring layout shifts or content replacement
- Editor content fades in/out naturally

## Design Principles

### Visual Continuity

**Maintain Spatial Layout**: The split-pane layout (editor left, preview right) should be constant, preventing users from losing their spatial orientation.

**Reduce Cognitive Load**: Users don't need to mentally reconstruct the interface when switching between states.

### Clear Affordances

**Disabled State Signaling**: The dimmed/overlaid editor clearly communicates that it's not interactive without requiring text labels.

**Actionable Guidance**: The empty state message provides clear next steps for the user.

### Progressive Disclosure

**Consistent Structure**: Users see the full application structure immediately, understanding where their content will appear when they select or create a document.

**Predictable Behavior**: The interface remains stable across different application states.

## Component Structure

### Main Layout (+page.svelte)

**Current Structure**:

```
{#if !documentStore.activeDocumentId}
  <CenteredEmptyStateMessage />
{:else}
  <DocumentEditor />
{/if}
```

**Desired Structure**:

```
<DocumentEditor hasActiveDocument={!!documentStore.activeDocumentId} />
```

The conditional rendering moves **inside** DocumentEditor component rather than at the page layout level.

### DocumentEditor Component

**Responsibilities**:

- Accept `hasActiveDocument` prop to determine empty state
- Render full editor/preview structure always
- Show empty state message in editor area when `!hasActiveDocument`
- Dim/overlay the editor when not interactive
- Disable toolbar when no document active

**Structure**:

```
- Editor Section (left)
  - EditorToolbar (dimmed when !hasActiveDocument)
  - MarkdownEditor (dimmed when !hasActiveDocument)
    - When !hasActiveDocument: Empty state message centered
    - When hasActiveDocument: Normal editor content
  - Dimming overlay (shown when !hasActiveDocument)

- Preview Section (right)
  - Preview component (empty when !hasActiveDocument)
  - Modal dialogs (DocumentInfo, Import, Share, About, Terms, Privacy)
```

## Visual Design

### Empty State Message

**Content**:

- Heading: "No Document Selected" or similar
- Body text: "Select a document from the sidebar or create a new one"
- Interactive link: Trigger new document dialog

**Styling**:

- Text color: `text-muted-foreground` (semantic token)
- Font size: `text-xl` for heading, `text-sm` for body
- Centered: Flexbox centering (horizontal and vertical)
- Spacing: Appropriate gap between heading and body text

### Dimming/Overlay Effect

**Visual Treatment**:

- Reduced opacity: `opacity-50` or similar on editor content
- Optional overlay: Semi-transparent layer over editor
- Pointer events disabled: `pointer-events-none`
- Smooth transition: `transition-opacity duration-300`

**Color Tokens**:

- Overlay background: `bg-background/30` or `bg-muted/20`
- Use semantic tokens from design system for theme compatibility

### Toolbar Dimming

**Disabled State**:

- All toolbar buttons should appear disabled
- Reduced opacity to match editor dimming
- Tooltips still functional (explaining why disabled)
- Consistent with standard disabled button styling

## Accessibility

### Keyboard Navigation

- Focus management: Empty state link should be focusable
- Skip link: Allow users to skip empty state area
- Tab order: Maintain logical flow through interface

### Screen Reader Support

**ARIA Attributes**:

- `aria-disabled="true"` on editor container when no document
- `role="status"` on empty state message for announcements
- `aria-label` describing the disabled state

**Announcements**:

- When no document active: Announce "No document selected, editor disabled"
- When document loads: Announce "Document loaded, editor active"

### Visual Indicators

- Don't rely solely on dimming/opacity for disabled state
- Ensure sufficient contrast for empty state message text
- Maintain WCAG AA compliance (4.5:1 contrast minimum)

## Interaction Patterns

### Empty State Actions

**Create New Document**:

- Link in empty state message triggers new document dialog
- Same dialog as "New Document" button in sidebar
- Consistent behavior across entry points

**Select Existing Document**:

- User clicks document in sidebar
- Editor transitions from disabled to active state
- Content loads with smooth fade-in

### State Transitions

**No Document → Document Selected**:

1. Document loads in background
2. Empty state message fades out
3. Dimming overlay fades out
4. Editor content fades in
5. Toolbar becomes enabled
6. Preview renders content

**Document Selected → No Document**:

1. Current document unloaded
2. Editor content fades out
3. Dimming overlay fades in
4. Empty state message fades in
5. Toolbar becomes disabled
6. Preview clears

## Responsive Behavior

### Desktop (≥768px)

- Split-pane layout maintained
- Editor and preview both visible
- Empty state centered in editor pane

### Mobile (<768px)

- Tabbed interface (Editor OR Preview)
- Empty state shown in editor tab when no document
- Tab switching remains functional
- Preview tab shows empty preview when no document

## Edge Cases

### Loading States

When a document is loading:

- Show loading overlay (existing pattern)
- Don't show empty state during load
- Maintain dimmed state until load completes

### Error States

When document fails to load:

- Show error message in toast
- Return to empty state in editor
- Provide retry or create new document options

### Guest Mode

- Empty state works identically in guest mode
- "Create new document" triggers guest-mode document creation
- No special handling needed

## Implementation Notes

### Props and State

**New Props for DocumentEditor**:

- `hasActiveDocument: boolean` - Whether a document is currently active
- Derived from `!!documentStore.activeDocumentId`

**Internal State**:

- No new state needed
- Use existing `loading` state for transitions

### Component Lifecycle

- DocumentEditor mounts once on page load
- Remains mounted throughout session
- Only content changes based on `hasActiveDocument` and `documentId`

### Performance

- No performance impact (component already renders conditionally)
- Reduced layout thrashing from conditional full-component rendering
- Smoother transitions with GPU-accelerated opacity changes

## Theme Integration

### Dark Mode

- Empty state text readable on dark background
- Dimming effect subtle but clear on dark surfaces
- Overlay color adapts to theme

### Light Mode

- Empty state text readable on light background
- Dimming effect clearly visible on light surfaces
- Overlay color adapts to theme

### Semantic Tokens

All colors use semantic tokens defined in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md):

- `--color-background`
- `--color-foreground`
- `--color-muted-foreground`
- `--color-muted`

## Related Documents

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Color tokens, spacing, typography
- [DOCUMENT_EDITOR.md](./MARKDOWN_EDITOR.md) - Markdown editor component
- [OPTIMISTIC_PAGE_LOADING.md](./OPTIMISTIC_PAGE_LOADING.md) - Document loading patterns
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - Document store and state
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall app structure

## Future Enhancements

### Rich Empty State

- Add visual illustration or icon
- Show recent documents list
- Display keyboard shortcuts hint
- Show getting started tips

### Onboarding

- First-time user detection
- Tutorial overlay for empty state
- Interactive walkthrough of features

### Customization

- User preference for empty state message
- Optional tips or quotes display
- Configurable default action

## Migration Path

This is a refinement of existing functionality, not a breaking change:

1. Update `+page.svelte` to always render DocumentEditor
2. Pass `hasActiveDocument` prop to DocumentEditor
3. Update DocumentEditor to handle empty state internally
4. Add dimming/overlay styling for disabled state
5. Add empty state message in editor area
6. Update accessibility attributes
7. Test transitions and edge cases

No database changes, no API changes, no breaking changes to user data or authentication.
