# UI Alignment Improvements Plan

## Overview

This plan documents the implementation of visual refinements to improve consistency and alignment in the Tonguetoquill user interface. These changes enhance the visual cohesion between the sidebar, top header, and editor toolbar.

## Background

The current UI has minor visual inconsistencies that can be improved:

1. The top header (TopMenu) uses `zinc-800` background while the sidebar uses `zinc-900`, creating an unnecessary visual distinction
2. The sidebar lacks a right border, making the separation between navigation and content less defined
3. The sidebar divider and editor toolbar bottom border are not visually aligned, creating a subtle but noticeable misalignment

## Design References

- Design System: `prose/designs/frontend/DESIGN_SYSTEM.md`
- UI Components: `prose/designs/frontend/UI_COMPONENTS.md`
- Color palette follows zinc-900/800/700 theme established in Phase 6.5 UI Rework

## Implementation Tasks

### Task 1: Update TopMenu Background Color

**Objective**: Change TopMenu background from `zinc-800` to `zinc-900` to match sidebar background

**Rationale**: 
- Creates visual consistency across the top portion of the interface
- Reduces visual complexity by using the same background color
- Maintains the dark theme aesthetic while improving unity

**Files to Modify**:
- `src/lib/components/TopMenu.svelte`

**Changes**:
- Update background class from `bg-zinc-800` to `bg-zinc-900`
- Verify text contrast remains accessible (zinc-300 text on zinc-900 background meets WCAG AA)

**Design System Updates**:
- Already updated in `prose/designs/frontend/DESIGN_SYSTEM.md` - Background Layers section
- Already updated in `prose/designs/frontend/UI_COMPONENTS.md` - TopMenu Component section

### Task 2: Add Right Border to Sidebar

**Objective**: Add a subtle right border to the sidebar using the tertiary color (zinc-700)

**Rationale**:
- Provides clear visual separation between sidebar and main content area
- Uses existing tertiary color (zinc-700) consistent with other dividers
- Subtle 1px border maintains professional, minimal aesthetic

**Files to Modify**:
- `src/lib/components/Sidebar.svelte`

**Changes**:
- Add `border-r border-zinc-700` class to desktop sidebar container
- Apply to both expanded (224px) and collapsed (48px) states
- Mobile drawer (Sheet component) should not have this border (full-screen overlay)

**Design System Updates**:
- Already updated in `prose/designs/frontend/UI_COMPONENTS.md` - Sidebar Component section

### Task 3: Align Sidebar Divider with Editor Toolbar

**Objective**: Reduce logo size slightly to align the sidebar divider with the editor toolbar bottom border

**Rationale**:
- Creates visual harmony between sidebar and content area
- The current logo (32px/h-8) in a 48px container leaves the divider at 96px from top
- The editor toolbar bottom border is at 96px from top (48px TopMenu + 48px Toolbar)
- Reducing logo to 28px (h-7) in a 44px container aligns both horizontal lines

**Files to Modify**:
- `src/lib/components/Sidebar.svelte`

**Changes**:
- Update logo container height from `h-12` (48px) to `h-11` (44px)
- Update logo image height from `h-8` (32px) to `h-7` (28px)
- This creates alignment: 48px header + 44px logo section + border = 92px (vs toolbar at 96px)
- Fine-tune with padding if needed to achieve exact 96px alignment

**Note**: The logo should maintain its aspect ratio. Only the height constraint changes; width adjusts proportionally.

**Design System Updates**:
- Already updated in `prose/designs/frontend/UI_COMPONENTS.md` - Sidebar Component Logo Section

## Visual Verification

After implementing these changes, verify:

1. **TopMenu Background**: 
   - TopMenu and Sidebar both use zinc-900 background
   - TopMenu maintains zinc-700 bottom border
   - Text remains readable (zinc-300 on zinc-900)

2. **Sidebar Border**:
   - Right border visible on desktop (both collapsed and expanded states)
   - Border uses zinc-700 color matching other dividers
   - Border not present on mobile drawer

3. **Divider Alignment**:
   - Sidebar divider (after logo) visually aligns with editor toolbar bottom border
   - Logo maintains proportions despite size reduction
   - Logo remains centered in its container

## Cross-References

- **Design System**: `prose/designs/frontend/DESIGN_SYSTEM.md`
  - Color Palette (Background Layers updated)
  - Spacing System (Component Heights)

- **UI Components**: `prose/designs/frontend/UI_COMPONENTS.md`
  - Sidebar Component (Visual Design, Logo Section, Separator)
  - TopMenu Component (Structure)
  
- **Related Plans**:
  - `prose/plans/UI_REWORK.md` - Phase 6.5 UI updates
  - `prose/plans/REPAIR.md` - Post-rework technical debt

## Implementation Order

1. **Update design documents** ✅
   - DESIGN_SYSTEM.md - Background Layers section
   - UI_COMPONENTS.md - Sidebar and TopMenu sections

2. **Implement TopMenu background change**
   - Simple color class update
   - Low risk, quick verification

3. **Add Sidebar right border**
   - Add border class to desktop sidebar
   - Verify mobile drawer unaffected

4. **Adjust logo sizing for alignment**
   - Update container and image heights
   - Verify visual alignment with toolbar
   - Test in both collapsed and expanded states

## Success Criteria

- [ ] TopMenu background matches sidebar (both zinc-900)
- [ ] Sidebar has subtle right border (zinc-700) on desktop
- [ ] Sidebar divider aligns horizontally with editor toolbar bottom border
- [ ] All changes maintain accessibility standards (WCAG AA contrast)
- [ ] Mobile responsive behavior unaffected
- [ ] Logo maintains aspect ratio despite size reduction

## Testing Notes

- Visual inspection of the UI at different viewport sizes
- Verify collapsed/expanded sidebar states
- Test mobile drawer appearance (should not have right border)
- Confirm text contrast accessibility
- Screenshot before/after comparisons

## Timeline

Estimated implementation time: 30-60 minutes
- Design doc updates: 10 minutes ✅
- Implementation: 20-30 minutes
- Testing/verification: 10-20 minutes
