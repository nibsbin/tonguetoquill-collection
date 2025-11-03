# Document Loading UX

## Overview

This document defines the user experience for loading documents in the editor, with a focus on minimizing jarring UI changes and providing clear feedback about the current state.

> **Related**:
>
> - [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) for document store patterns
> - [DOCUMENT_SERVICE.md](../backend/DOCUMENT_SERVICE.md) for document API
> - [SIDEBAR.md](./SIDEBAR.md) for document list interaction

## Problem Statement

The current implementation replaces the entire editor with "Loading Document..." text when a user selects a new document. This creates a jarring experience:

1. **Visual disruption**: The entire editor content disappears and is replaced with loading text
2. **Loss of context**: Users lose sight of what they were editing
3. **No auto-save**: Unsaved changes may be lost if the user switches documents without manually saving

## Design Goals

1. **Minimize visual disruption**: Keep the editor visible but indicate it's in a read-only/loading state
2. **Auto-save on switch**: Automatically save dirty documents before switching
3. **Clear loading feedback**: Provide visible indication that a new document is loading
4. **Maintain editor state**: Preserve the editor's visual structure during transitions

## UX Patterns

### Loading State Indicator

Instead of replacing the editor content, the loading state should:

**Visual Treatment:**

- Overlay a semi-transparent layer on the editor to indicate read-only state
- Display a subtle loading spinner or indicator
- Optionally show a "Loading..." message in a non-intrusive position
- Keep the current content visible but dimmed

**Implementation Approach:**

- Use CSS opacity and pointer-events to create the "greyed out" effect
- Position an overlay div with loading indicator
- Maintain the editor component structure

**Example Structure:**

```svelte
{#if loading}
	<!-- Greyed out editor with overlay -->
	<div class="relative">
		<!-- Existing editor (dimmed) -->
		<div class="pointer-events-none opacity-50">
			<MarkdownEditor ... />
		</div>

		<!-- Loading overlay -->
		<div class="absolute inset-0 flex items-center justify-center">
			<LoadingSpinner />
			<span>Loading document...</span>
		</div>
	</div>
{:else}
	<!-- Normal editor -->
	<MarkdownEditor ... />
{/if}
```

### Auto-Save Before Switch

When a user selects a different document while the current document has unsaved changes:

**Behavior:**

1. Detect document ID change
2. Check if current document is dirty (has unsaved changes)
3. If dirty AND auto-save is enabled:
   - Trigger immediate save of current document
   - Don't wait for debounce timer
   - Handle save silently (don't show success toast)
4. Proceed to load new document

**Error Handling:**

- If auto-save fails, still proceed to load new document
- Log error but don't block the transition
- User's unsaved changes remain in the editor until they explicitly save or navigate away

**Implementation Location:**

- DocumentEditor component's `$effect` block
- Already partially implemented (see line 33-48 in DocumentEditor.svelte)
- Needs refinement to ensure proper sequencing

### Loading Sequence

**Step-by-step flow:**

1. **User clicks document in sidebar**
   - Sidebar updates `documentStore.activeDocumentId`
2. **DocumentEditor detects change** (via `$effect`)
   - Check if previous document is dirty
   - If dirty: trigger `autoSave.saveNow(previousDocumentId, content)`
   - Set `loading = true`
3. **Editor enters loading state**
   - Current content remains visible but dimmed
   - Loading overlay appears
   - Editor is read-only (pointer-events-none)
4. **Fetch new document**
   - Call `documentStore.fetchDocument(documentId)`
   - Load document content
5. **Update editor**
   - Set new content
   - Reset initial content (clear dirty state)
   - Set `loading = false`
6. **Editor exits loading state**
   - Overlay removed
   - Editor becomes interactive again
   - New content fully visible

## Visual Specifications

### Loading Overlay

**Styling:**

- Background: Semi-transparent dark overlay (`bg-background/50`)
- Position: Absolute, covering entire editor area
- Z-index: Above editor content but below modals
- Centered loading indicator

**Loading Indicator:**

- Spinner icon (from lucide-svelte: `Loader2` with rotation animation)
- Size: 24px (matching other icons)
- Color: Muted foreground color
- Text: "Loading document..." below spinner

**Editor Dimming:**

- Opacity: 50% (`opacity-50`)
- Pointer events: None (`pointer-events-none`)
- Preserve layout and structure

### Accessibility

**Screen Reader Support:**

- Announce when loading starts: "Loading document"
- Announce when loading completes: "Document loaded"
- Use `aria-busy="true"` on editor container during loading
- Maintain focus management (don't steal focus)

**Keyboard Navigation:**

- Disable editor keyboard shortcuts during loading
- Prevent typing in editor while loading
- Allow Escape to cancel navigation (optional enhancement)

## State Management

### Document Store Integration

**Current State (from STATE_MANAGEMENT.md):**

```typescript
{
  documents: DocumentMetadata[],
  activeDocumentId: string | null,
  isLoading: boolean,  // Global loading state
  error: string | null
}
```

**Document Editor Local State:**

```typescript
{
  content: string,           // Current editor content
  initialContent: string,    // Content when last saved/loaded
  loading: boolean,          // Document-specific loading state
  isDirty: boolean          // Derived: content !== initialContent
}
```

### Auto-Save Integration

**Existing Auto-Save Behavior (from STATE_MANAGEMENT.md):**

- 7-second debounce after last keystroke
- Respects user's auto-save preference
- Tracks save status (idle, saving, saved, error)

**New Integration Point:**

- On document switch, call `autoSave.saveNow()` to bypass debounce
- Only save if document is dirty AND auto-save enabled
- Don't block document switch on save completion
- Silent save (no success toast)

## Implementation Checklist

### Phase 1: Update DocumentEditor Component

- [ ] Modify loading state to use overlay pattern
- [ ] Keep editor visible with dimmed opacity during load
- [ ] Add loading spinner overlay
- [ ] Test visual appearance in both light/dark modes

### Phase 2: Auto-Save on Switch

- [ ] Verify existing `$effect` block handles document switching
- [ ] Ensure `autoSave.saveNow()` is called for dirty documents
- [ ] Test with auto-save enabled and disabled
- [ ] Handle save errors gracefully

### Phase 3: Accessibility

- [ ] Add ARIA attributes for loading state
- [ ] Test with screen readers
- [ ] Verify keyboard navigation
- [ ] Add focus management

### Phase 4: Polish

- [ ] Smooth transitions (fade in/out)
- [ ] Loading indicator animation
- [ ] Test on mobile devices
- [ ] Performance optimization

## Edge Cases

### Multiple Rapid Switches

**Scenario:** User rapidly clicks through multiple documents

**Behavior:**

- Each switch triggers auto-save of previous document
- Only the final document is loaded and displayed
- Previous fetch requests are abandoned (not awaited)
- Auto-save runs for each dirty document in sequence

**Implementation:**

- Track `previousDocumentId` to know what to save
- Don't block UI on save completion
- Cancel pending fetch if new document selected

### Save Failures

**Scenario:** Auto-save fails when switching documents

**Behavior:**

- Log error silently (don't show toast)
- Still proceed to load new document
- User's changes remain in memory until page reload
- Next manual save will retry

**Rationale:**

- Don't block document navigation
- User expects navigation to work
- Manual save option still available

### Network Delays

**Scenario:** Slow network causes long document load time

**Behavior:**

- Loading overlay remains visible
- User sees dimmed previous content
- Can still navigate sidebar (select different document)
- Timeout after 10 seconds shows error

**Implementation:**

- Add timeout to fetch operation
- Show error message if timeout exceeded
- Allow retry or cancel

## Design Rationale

### Why Overlay Instead of Replacement?

**Advantages:**

1. **Context preservation**: User can still see what they were working on
2. **Reduced motion**: Less jarring visual change
3. **Familiar pattern**: Common UX pattern in modern apps
4. **Better perceived performance**: Feels faster even if timing is same

**Disadvantages:**

1. Slightly more complex implementation
2. May be confusing if overlay persists too long

**Decision:** Benefits outweigh drawbacks for this use case

### Why Auto-Save Before Switch?

**Advantages:**

1. **Data safety**: Prevents accidental loss of changes
2. **User expectation**: Matches behavior of modern apps
3. **Reduced cognitive load**: Users don't need to remember to save

**Disadvantages:**

1. May save unwanted changes
2. Could slow down navigation if save is slow

**Decision:** Auto-save is opt-in (user preference), mitigating concerns

## Future Enhancements

1. **Optimistic UI**: Show new document immediately, load content in background
2. **Cancel navigation**: Allow user to cancel document load and stay on current
3. **Preview on hover**: Show document preview when hovering sidebar item
4. **Smooth content transition**: Fade between old and new content
5. **Progress indicator**: Show percentage for very large documents

## Cross-References

- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - Store patterns and auto-save behavior
- [DOCUMENT_SERVICE.md](../backend/DOCUMENT_SERVICE.md) - Document API and data model
- [SIDEBAR.md](./SIDEBAR.md) - Document list interaction patterns
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Color palette and visual tokens
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Accessibility requirements
