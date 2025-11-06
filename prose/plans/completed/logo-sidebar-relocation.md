# Logo Sidebar Relocation Plan

## Overview

This plan describes the steps to move the Tonguetoquill logo from the TopMenu component to the sidebar, positioning it between the hamburger menu button and the new document button.

## Design Reference

See [LOGO_SIDEBAR.md](../designs/frontend/LOGO_SIDEBAR.md) for the complete design specification.

## Current State

### TopMenu Component

- Logo displayed at line 144-150 of `src/lib/components/TopMenu/TopMenu.svelte`
- Current markup:
  ```svelte
  <img
  	src="/logo.svg"
  	alt="Tonguetoquill logo"
  	aria-hidden="true"
  	class="mr-3 h-8 w-auto shrink-0"
  />
  ```
- Positioned to the left of document title

### Sidebar Component

- Header section contains only hamburger menu button (lines 167-182)
- New document button immediately follows header (lines 187-195)
- Uses SidebarButtonSlot components with 48px slots and 40px button areas

## Implementation Steps

### Step 1: Remove Logo from TopMenu

**File**: `src/lib/components/TopMenu/TopMenu.svelte`

**Action**: Remove the logo `<img>` element (lines 144-150)

**Impact**:

- TopMenu will show only document title and actions
- More horizontal space for document title

### Step 2: Create Logo Slot in Sidebar

**File**: `src/lib/components/Sidebar/Sidebar.svelte`

**Location**: Between hamburger menu section (ends line 182) and menu items section (starts line 184)

**Implementation Approach**:

Create a custom logo slot that:

1. Uses the same 48px height as other SidebarButtonSlot components
2. Contains 40x40px logo image with 4px padding
3. Implements horizontal centering when sidebar expands
4. Adds bottom border to separate from new document button

**CSS Strategy**:

Use flexbox with conditional justify-content:

- Collapsed: `justify-content: flex-start` with 4px padding (consistent with buttons)
- Expanded: `justify-content: center` for horizontal centering
- Transition: Apply CSS transition on all layout properties

Alternative if flexbox transition doesn't work smoothly:

- Use `transform: translateX()` to shift logo horizontally
- Calculate offset: `(sidebar-expanded-width / 2) - (logo-width / 2)`
- Apply transition on transform property

### Step 3: Add Border Styling

**Border Placement**: Bottom border on logo slot

**CSS Class**: `border-b border-border`

**Visual Effect**: Creates separation between logo (header area) and action buttons

### Step 4: Implement Centering Animation

**Timing**: 300ms duration with `cubic-bezier(0.165, 0.85, 0.45, 1)` easing

**Synchronization**: Must match sidebar expansion animation timing

**Properties to Transition**:

- If using flexbox: `justify-content`
- If using transform: `transform`

### Step 5: Test All States

**Test Cases**:

1. Logo appears correctly in collapsed sidebar (40x40px, centered in slot)
2. Logo slides to horizontal center when sidebar expands
3. Logo slides back when sidebar collapses
4. Border appears correctly below logo
5. No border appears between hamburger and logo
6. Transitions are smooth and synchronized with sidebar expansion
7. Logo is hidden from screen readers (aria-hidden="true")

## Code Structure

### Sidebar.svelte Changes

Insert logo slot after hamburger menu section:

```
<!-- Hamburger Menu and Title -->
<div class="relative flex items-center border-b border-border">
  <SidebarButtonSlot ... />  <!-- Existing hamburger -->
  <span ...>Tonguetoquill</span>  <!-- Existing title -->
</div>

<!-- NEW: Logo Signature Slot -->
<div class="sidebar-logo-slot border-b border-border" class:expanded={isExpanded}>
  <img
    src="/logo.svg"
    alt="Tonguetoquill logo"
    aria-hidden="true"
    class="sidebar-logo"
  />
</div>

<!-- Menu Items -->
<div class="flex-1 overflow-hidden">
  ...
```

### Styling Approach (Inline or Style Block)

```css
.sidebar-logo-slot {
	height: 48px;
	min-height: 48px;
	max-height: 48px;
	display: flex;
	align-items: center;
	padding: 4px;
	transition: all 300ms cubic-bezier(0.165, 0.85, 0.45, 1);
}

.sidebar-logo-slot:not(.expanded) {
	justify-content: flex-start;
}

.sidebar-logo-slot.expanded {
	justify-content: center;
}

.sidebar-logo {
	width: 40px;
	height: 40px;
	flex-shrink: 0;
}
```

## KISS and DRY Principles

### KISS (Keep It Simple)

1. **Reuse Existing Patterns**: Follow SidebarButtonSlot architecture
2. **Minimal Custom Code**: Only add what's necessary for centering behavior
3. **CSS-Only Animation**: No JavaScript animation logic
4. **Standard Border Utilities**: Use existing Tailwind border classes

### DRY (Don't Repeat Yourself)

1. **Design Tokens**: Reuse `--sidebar-collapsed-width`, `--color-border`
2. **Transition Timing**: Match existing sidebar transition (300ms, cubic-bezier)
3. **Padding Strategy**: Use same 4px padding as SidebarButtonSlot
4. **Border Styling**: Consistent with existing sidebar borders

## Files Modified

1. `src/lib/components/TopMenu/TopMenu.svelte` - Remove logo
2. `src/lib/components/Sidebar/Sidebar.svelte` - Add logo slot with centering logic

## Files Created

None (avoiding unnecessary file creation per KISS principle)

## Rollback Plan

If issues arise:

1. Revert changes to both files
2. Logo returns to TopMenu position
3. Sidebar structure unchanged

## Success Criteria

- [ ] Logo removed from TopMenu
- [ ] Logo appears in sidebar between hamburger and new document button
- [ ] Logo is 40x40px in both collapsed and expanded states
- [ ] Logo centers horizontally when sidebar expands
- [ ] Bottom border separates logo from new document button
- [ ] No border between hamburger menu and logo
- [ ] Transition is smooth (300ms, matches sidebar expansion)
- [ ] Logo is marked aria-hidden="true"
- [ ] No visual glitches or layout shifts
- [ ] Works in both light and dark modes

## Estimated Complexity

**Low Complexity**

- Straightforward DOM reorganization
- Leverages existing sidebar architecture
- Minimal CSS for centering behavior
- No new components or complex logic

## Dependencies

None - uses existing sidebar infrastructure and design tokens.

## Testing Notes

**Manual Testing**:

1. Load application
2. Verify logo appears in sidebar (collapsed state)
3. Click hamburger to expand sidebar
4. Observe logo sliding to center
5. Click hamburger to collapse
6. Observe logo returning to standard position
7. Verify borders appear correctly
8. Check that no layout issues occur

**Accessibility Testing**:

1. Use screen reader to navigate sidebar
2. Verify logo is skipped (aria-hidden)
3. Confirm keyboard navigation flows correctly

## Implementation Order

1. Remove logo from TopMenu (simple deletion)
2. Add logo slot markup to Sidebar
3. Add CSS styling for centering behavior
4. Test collapsed state
5. Test expanded state and transition
6. Verify borders
7. Final accessibility and visual checks
