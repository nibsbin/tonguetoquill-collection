# Document Loading UX Improvement Plan

## Overview

This plan outlines the implementation steps for improving the document loading user experience by:

1. Replacing the full-screen "Loading Document..." text with a greyed-out editor overlay
2. Auto-saving the current document before switching to a new one when dirty

## Context

**Current Behavior:**

- When user clicks a document in sidebar, the entire editor is replaced with "Loading Document..." text
- No auto-save occurs when switching documents
- Visual disruption is jarring and loses user context

**Desired Behavior:**

- Editor remains visible but dimmed/greyed-out during loading
- Loading spinner overlay provides feedback
- Current document is auto-saved before switching if dirty and auto-save is enabled
- Smoother, less disruptive transition

## Related Documents

- Design: [DOCUMENT_LOADING_UX.md](../designs/frontend/DOCUMENT_LOADING_UX.md)
- Backend: [DOCUMENT_SERVICE.md](../designs/backend/DOCUMENT_SERVICE.md)
- Frontend: [STATE_MANAGEMENT.md](../designs/frontend/STATE_MANAGEMENT.md)
- Component: `src/lib/components/Editor/DocumentEditor.svelte`

## Implementation Tasks

### Task 1: Update DocumentEditor Loading UI

**File:** `src/lib/components/Editor/DocumentEditor.svelte`

**Changes:**

1. **Replace loading block structure**
   - Current: Replaces entire editor with loading text
   - New: Overlay on top of existing editor

2. **Add overlay component structure**
   - Semi-transparent background
   - Centered loading spinner
   - "Loading document..." text
   - Absolute positioning over editor

3. **Dim editor during loading**
   - Apply `opacity-50` to editor content
   - Add `pointer-events-none` to prevent interaction
   - Maintain visual structure

4. **Styling**
   - Use semantic color tokens (from DESIGN_SYSTEM.md)
   - Ensure compatibility with light/dark modes
   - Match existing visual language

**Specific Changes:**

Replace:

```svelte
{#if loading}
	<div class="flex h-full items-center justify-center bg-background">
		<p class="text-muted-foreground">Loading document...</p>
	</div>
{:else}
	<!-- Editor content -->
{/if}
```

With:

```svelte
<div class="relative flex h-full flex-1 flex-col">
	<!-- Editor content (dimmed when loading) -->
	<div class={loading ? 'pointer-events-none opacity-50' : ''}>
		<!-- Existing editor structure -->
	</div>

	<!-- Loading overlay (shown when loading) -->
	{#if loading}
		<div class="absolute inset-0 flex items-center justify-center bg-background/50">
			<div class="flex flex-col items-center gap-3">
				<Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
				<p class="text-sm text-muted-foreground">Loading document...</p>
			</div>
		</div>
	{/if}
</div>
```

**Import Required:**

- Add `Loader2` from `lucide-svelte`

### Task 2: Verify Auto-Save on Document Switch

**File:** `src/lib/components/Editor/DocumentEditor.svelte`

**Existing Code Review:**

The component already has an `$effect` block (lines 33-48) that:

1. Detects when `documentId` changes
2. Checks if previous document is dirty
3. Calls `autoSave.saveNow()` if auto-save is enabled

**Verification Steps:**

1. **Review existing logic**
   - Ensure `previousDocumentId` tracking works correctly
   - Verify `isDirty` state is accurate
   - Confirm auto-save respects user preference

2. **Test edge cases**
   - Rapid document switching
   - Save failures
   - Auto-save disabled
   - Guest mode vs authenticated mode

3. **Error handling**
   - Ensure save errors don't block document switching
   - Verify error is caught and ignored (silent save)

**Potential Refinements:**

Current code (lines 34-41):

```svelte
if (previousDocumentId !== null && previousDocumentId !== documentId && isDirty) {
  // Document is switching with unsaved changes
  // Auto-save the current document before switching
  if (autoSaveEnabled) {
    autoSave.saveNow(previousDocumentId, content).catch(() => {
      // Ignore errors during auto-save on switch
    });
  }
}
```

This looks correct - no changes needed! The logic already:

- Checks for document switch
- Verifies document is dirty
- Respects auto-save preference
- Handles errors silently

### Task 3: Accessibility Improvements

**File:** `src/lib/components/Editor/DocumentEditor.svelte`

**Changes:**

1. **Add ARIA attributes**
   - `aria-busy="true"` on editor container during loading
   - Screen reader announcements for state changes

2. **Implementation**

   ```svelte
   <div
     class="flex h-full flex-1 flex-col"
     aria-busy={loading}
   >
   ```

3. **Screen reader announcements**
   - Consider adding live region for loading state
   - Optional: announce when document loads

### Task 4: Visual Polish

**File:** `src/lib/components/Editor/DocumentEditor.svelte`

**Enhancements:**

1. **Smooth transitions**
   - Add transition classes for opacity changes
   - Fade in/out overlay

2. **Loading animation**
   - Use Tailwind's `animate-spin` for spinner
   - Ensure smooth animation performance

3. **Color consistency**
   - Use theme tokens for all colors
   - Test in both light/dark modes

## Testing Strategy

### Manual Testing

**Test Cases:**

1. **Basic Loading Flow**
   - Click document in sidebar
   - Verify editor dims (opacity reduced)
   - Verify loading overlay appears
   - Verify document loads and overlay disappears

2. **Auto-Save on Switch**
   - Edit current document (make it dirty)
   - Click different document
   - Verify auto-save triggers
   - Verify new document loads

3. **Auto-Save Disabled**
   - Disable auto-save in settings
   - Make document dirty
   - Switch documents
   - Verify no auto-save occurs

4. **Dark/Light Mode**
   - Test loading overlay in both themes
   - Verify contrast and visibility
   - Ensure colors match design system

5. **Mobile**
   - Test on mobile viewport
   - Verify overlay positioning
   - Verify touch interactions

### Edge Case Testing

1. **Rapid Switching**
   - Quickly click through multiple documents
   - Verify only final document loads
   - Verify no UI glitches

2. **Network Delay**
   - Simulate slow network
   - Verify loading state persists
   - Verify timeout handling

3. **Save Failures**
   - Simulate save error
   - Verify document still switches
   - Verify no error toast appears

## Implementation Order

1. **Phase 1: Visual Changes** (highest priority)
   - Update DocumentEditor loading UI
   - Replace full-screen loading with overlay
   - Add loading spinner
   - Test visual appearance

2. **Phase 2: Verification** (ensure existing works)
   - Verify auto-save on switch works
   - Test with different scenarios
   - Fix any bugs found

3. **Phase 3: Accessibility**
   - Add ARIA attributes
   - Test with screen readers
   - Verify keyboard navigation

4. **Phase 4: Polish**
   - Add transitions
   - Refine animations
   - Final testing

## Success Criteria

### Must Have

- ✅ Editor remains visible during loading (not replaced)
- ✅ Loading overlay with spinner appears
- ✅ Editor is greyed out (dimmed) during loading
- ✅ Auto-save triggers when switching from dirty document
- ✅ Works in both light and dark modes

### Nice to Have

- Smooth fade transitions
- Screen reader announcements
- Loading timeout with error message

## Rollback Plan

If issues are discovered:

1. Revert to previous "Loading Document..." full-screen approach
2. Keep auto-save on switch (low risk)
3. Address issues in follow-up PR

## Deployment Notes

- No backend changes required
- No environment variable changes
- No database migrations
- Frontend-only changes
- No breaking changes to API

## Post-Implementation

### Documentation Updates

- Update DOCUMENT_LOADING_UX.md with actual implementation details
- Add screenshots to design docs
- Update component documentation

### Future Enhancements

- Optimistic UI (load in background)
- Progress indicator for large documents
- Cancel navigation option
- Smooth content transitions

## Estimated Impact

**User Experience:**

- Significantly reduced visual disruption
- Better data safety (auto-save)
- More professional feel
- Matches modern app expectations

**Technical:**

- Minimal code changes
- No performance impact
- Better separation of concerns
- More maintainable loading states

## Risk Assessment

**Low Risk:**

- Visual-only changes to existing component
- Auto-save already implemented (just verifying)
- No breaking changes
- Easy to revert if needed

**Medium Risk:**

- Edge cases with rapid switching
- Loading state timing issues

**Mitigation:**

- Thorough manual testing
- Test on multiple devices
- Monitor for user feedback
