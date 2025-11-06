# Popover Padding Standardization Plan

## Objective

Standardize padding and spacing across all popover instances to ensure consistent visual presentation and alignment with design system specifications as defined in [WIDGET_ABSTRACTION.md](../designs/frontend/WIDGET_ABSTRACTION.md).

## Current State

### Issue Summary

Popovers currently exhibit inconsistent padding patterns:

1. **BasePopover Component**: Applies `p-1` (4px) default padding to the container
2. **TopMenu Kebab Popover**: Content div has `p-1`, creating double padding (8px total from base + content)
3. **Settings Popover**: Content div has `p-0`, overriding base padding, resulting in inconsistent spacing
4. **User Profile Popover**: Content div has `p-1`, similar double padding issue

### Design System Standard

Per [WIDGET_ABSTRACTION.md § Popover Padding Standard](../designs/frontend/WIDGET_ABSTRACTION.md#theming-integration):

- **Container Padding**: `p-4` (1rem / 16px) applied to content snippet root
- **Title Spacing**: `mb-4` below titles
- **Section Spacing**: `space-y-4` for vertical rhythm
- **Button Padding**: `px-2 py-1.5` for interactive items within the `p-4` container
- **BasePopover**: Should NOT apply default padding - content authors control spacing

### Affected Components

1. ✅ **BasePopover** (`src/lib/components/ui/base-popover.svelte`) - Line 198: Remove `p-1` from container classes
2. ⚠️ **Sidebar Settings Popover** (`src/lib/components/Sidebar/Sidebar.svelte`) - Line 308: Change `p-0` to `p-4`
3. ⚠️ **Sidebar User Profile Popover** (`src/lib/components/Sidebar/Sidebar.svelte`) - Line 270: Remove redundant `p-1`, add `p-4`
4. ⚠️ **TopMenu Kebab Popover** (`src/lib/components/TopMenu/TopMenu.svelte`) - Line 213: Remove redundant `p-1`, add `p-4`
5. ⚠️ **Login Popover** (`src/lib/components/Sidebar/LoginPopover.svelte`) - Verify and standardize padding

## Implementation Steps

### Step 1: Update BasePopover Component

**File:** `src/lib/components/ui/base-popover.svelte`

**Changes:**
1. Line 198: Remove `p-1` from container classes
   - Before: `'fixed w-max rounded-lg border border-border bg-surface-elevated p-1 shadow-md'`
   - After: `'fixed w-max rounded-lg border border-border bg-surface-elevated shadow-md'`

**Rationale:**
- Removes default padding to give content authors full control
- Aligns with design system principle: base components provide structure, not spacing

### Step 2: Update Sidebar Settings Popover

**File:** `src/lib/components/Sidebar/Sidebar.svelte`

**Changes:**
1. Line 308: Update content container padding
   - Before: `<div class="w-64 p-0">`
   - After: `<div class="w-64 p-4">`

2. Review section spacing within content:
   - Verify title has `mb-4` (line 309: currently present)
   - Verify switch group has `space-y-4` (line 311: currently present)
   - Verify border separator on last switch (line 330: currently has `border-b border-border pb-3`)
   - Verify button section has `space-y-1` (line 340: currently present)

**Expected Visual Result:**
- Settings title, Dark Mode, Auto-save, and Line Numbers will have consistent 16px padding from edges
- Utility pages buttons (About Us, Terms, Privacy) maintain comfortable spacing within container

### Step 3: Update Sidebar User Profile Popover

**File:** `src/lib/components/Sidebar/Sidebar.svelte`

**Changes:**
1. Line 270: Update content container padding
   - Before: `<div class="w-72 p-1">`
   - After: `<div class="w-72 p-4">`

2. Review internal spacing:
   - Verify title has `mb-4` (line 271: currently present)
   - Verify definition list spacing (line 273: currently `space-y-4`)
   - Verify button margin (line 284: currently part of button classes)

**Expected Visual Result:**
- Account Information title and content have consistent 16px padding
- Definition list items maintain comfortable vertical rhythm

### Step 4: Update TopMenu Kebab Popover

**File:** `src/lib/components/TopMenu/TopMenu.svelte`

**Changes:**
1. Line 213: Update content container padding
   - Before: `<div class="min-w-[14rem] p-1">`
   - After: `<div class="min-w-[14rem] p-4">`

2. Review button spacing:
   - Buttons currently have `px-2 py-1.5` (lines 216, 224, 233, 240)
   - These are correct and should remain
   - Border separator on first tool button (line 233: `border-t border-border`)

**Expected Visual Result:**
- Menu items (Import, Share, Ruler Tool, Document Info) have consistent padding from popover edges
- Maintains comfortable spacing while keeping compact menu feel

### Step 5: Verify Login Popover

**File:** `src/lib/components/Sidebar/LoginPopover.svelte`

**Changes:**
1. Review root container (if applicable) - verify it follows `p-4` standard
2. Check internal spacing for consistency with other popovers

**Note:** LoginPopover is a specialized component. Verify its padding follows the standard but allow exceptions if needed for OAuth button layout.

## Testing Checklist

### Visual Testing
- [ ] Settings popover title, switches, and buttons have consistent comfortable padding
- [ ] User Profile popover shows even padding around all content
- [ ] TopMenu kebab popover items are well-spaced and aligned
- [ ] Login popover maintains functional layout with standard padding
- [ ] All popovers maintain visual consistency with each other
- [ ] No content appears cramped or touching edges
- [ ] Section separators (borders) appear in correct positions

### Spacing Verification
- [ ] Measure padding with browser DevTools: expect 16px (1rem) on all sides of content
- [ ] Verify title spacing below is consistent (16px / 1rem)
- [ ] Verify section spacing is consistent (16px / 1rem between sections)
- [ ] Verify button items maintain `px-2 py-1.5` internal padding

### Responsive Testing
- [ ] Popovers display correctly on desktop (1024px+)
- [ ] Popovers display correctly on tablet (768px-1023px)
- [ ] Popovers display correctly on mobile (<768px)
- [ ] Content doesn't overflow or clip at any breakpoint

### Functional Testing
- [ ] All popovers open and close correctly
- [ ] Click outside closes popovers (if applicable)
- [ ] ESC key closes popovers
- [ ] Settings persist when changed
- [ ] No regressions in popover behavior

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

## Success Criteria

1. ✅ BasePopover component removes default padding
2. ✅ All popover content containers apply `p-4` standard padding
3. ✅ Titles consistently use `mb-4` spacing
4. ✅ Sections consistently use `space-y-4` for vertical rhythm
5. ✅ Interactive buttons maintain `px-2 py-1.5` item padding
6. ✅ Visual consistency across all popovers
7. ✅ No functional regressions
8. ✅ Design system standard documented and followed

## Rollback Plan

If issues arise:
1. Revert BasePopover changes
2. Revert individual popover content changes
3. Test on branch before merging
4. Each component change is isolated and can be reverted independently

## Post-Implementation

1. ✅ Update WIDGET_ABSTRACTION.md with clear popover padding standard (completed)
2. Document pattern in code comments for future reference
3. Create reusable example/template for new popovers
4. Monitor for any reported spacing issues
5. Consider creating lint rule to enforce `p-4` on popover content containers

## References

- [WIDGET_ABSTRACTION.md](../designs/frontend/WIDGET_ABSTRACTION.md) - Widget specifications and spacing standards
- [WIDGET_THEME_UNIFICATION.md](../designs/frontend/WIDGET_THEME_UNIFICATION.md) - Theming standards
- [DESIGN_SYSTEM.md](../designs/frontend/DESIGN_SYSTEM.md) - Design tokens and spacing scale
