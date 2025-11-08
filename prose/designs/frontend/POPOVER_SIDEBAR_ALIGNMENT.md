# Popover Sidebar Alignment

## Overview

This design addresses the alignment of popovers (Settings, Login, Profile) with the sidebar's right border. Currently, popovers have a gap between their left edge and the sidebar's right border, creating visual misalignment.

## Problem Statement

**Current Behavior**:
- Sidebar has a right border (`border-r border-border`) at its right edge
- Popovers use `BasePopover` with `side="right"` and default `sideOffset={8}`
- This creates an 8px gap between the sidebar border and the popover's left edge
- Visual misalignment: popovers appear disconnected from the sidebar
- Affected popovers: Settings, Login, Profile, and New Document dialog

**Desired Behavior**:
- Popovers should align flush with the sidebar's right border
- No gap between sidebar border and popover
- Visual continuity between sidebar and popover

## Current Implementation

### Sidebar Border
- **Component**: `Sidebar.svelte:161`
- **Styling**: `border-r border-border`
- **Border width**: 1px (standard Tailwind border)
- **Position**: Right edge of sidebar element

### Popover Positioning
- **Component**: `base-popover.svelte:109-181`
- **Side**: `"right"` - positions popover to the right of trigger
- **Alignment**: `"start"` or `"end"` - vertical alignment
- **Side offset**: `8px` (default) - horizontal gap from trigger

**Positioning Logic** (base-popover.svelte:132-136):
```javascript
case 'right':
    left = triggerRect.right + sideOffset;
    top = triggerRect.top;
    break;
```

### Trigger Elements
- **Component**: `SidebarButtonSlot.svelte`
- **Width**: `100%` of sidebar width
- **Sidebar widths**:
  - Collapsed: 48px (`--sidebar-collapsed-width`)
  - Expanded: 256px (`--sidebar-expanded-width`)

## Analysis

### Positioning Calculation

**Coordinates**:
1. Sidebar right edge: position `X`
2. Sidebar border: occupies `X` to `X + 1px` (1px border-right)
3. Trigger element right edge: position `X` (inside border, full width of sidebar)
4. Popover left edge (current): `X + sideOffset` = `X + 8px`

**Gap**: 8px between sidebar border and popover left edge

### Alignment Goal

To align popover with sidebar border:
- Popover left edge should be at position `X` (flush with border exterior)
- This requires `sideOffset = 0`

Alternative (account for border):
- Popover left edge at `X + 1px` (just outside 1px border)
- This requires `sideOffset = 1`

**Recommendation**: Use `sideOffset={0}` for flush alignment

## Solution Design

### Approach 1: Override sideOffset on Sidebar Popovers (Recommended)

**Strategy**:
- Set `sideOffset={0}` on all `BasePopover` instances in `Sidebar.svelte` and `NewDocumentDialog.svelte`
- Maintains flexibility of `BasePopover` component
- Scoped change to sidebar-specific popovers

**Implementation**:
```svelte
<!-- Settings Popover -->
<BasePopover bind:open={popoverOpen} side="right" align="end" sideOffset={0} title="Settings">
  ...
</BasePopover>

<!-- Login Popover -->
<BasePopover bind:open={loginPopoverOpen} side="right" align="start" sideOffset={0} title="Sign in">
  ...
</BasePopover>

<!-- Profile Popover -->
<BasePopover bind:open={profilePopoverOpen} side="right" align="start" sideOffset={0} title="Account Information">
  ...
</BasePopover>

<!-- New Document Dialog -->
<BasePopover open={open} title="New Document" side="right" align="end" sideOffset={0}>
  ...
</BasePopover>
```

**Affected Files**:
- `src/lib/components/Sidebar/Sidebar.svelte`
- `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte`

**Changes**:
- Sidebar.svelte Line 247: Add `sideOffset={0}` to login popover
- Sidebar.svelte Line 264-268: Add `sideOffset={0}` to profile popover
- Sidebar.svelte Line 306: Add `sideOffset={0}` to settings popover
- NewDocumentDialog.svelte Line 201-210: Add `sideOffset={0}` to dialog popover

### Approach 2: Change BasePopover Default

**Strategy**:
- Change default `sideOffset` from `8` to `0` in `base-popover.svelte`
- Affects all popovers globally

**Not Recommended**:
- May affect other popovers in the application
- Less flexibility for non-sidebar popovers
- Requires testing all popover usages

### Approach 3: Create Sidebar-Specific Popover Component

**Strategy**:
- Create `SidebarPopover.svelte` wrapper around `BasePopover`
- Sets sidebar-specific defaults (`side="right"`, `sideOffset={0}`)

**Not Recommended**:
- Adds complexity without significant benefit
- Current popovers already use `BasePopover` successfully
- Simpler to just override `sideOffset` parameter

## Implementation Plan

### Changes Required

**File**: `src/lib/components/Sidebar/Sidebar.svelte`

1. **Settings Popover** (line 306):
   ```svelte
   <BasePopover bind:open={popoverOpen} side="right" align="end" sideOffset={0} title="Settings">
   ```

2. **Login Popover** (line 247):
   ```svelte
   <BasePopover bind:open={loginPopoverOpen} side="right" align="start" sideOffset={0} title="Sign in">
   ```

3. **Profile Popover** (line 264):
   ```svelte
   <BasePopover bind:open={profilePopoverOpen} side="right" align="start" sideOffset={0} title="Account Information">
   ```

**File**: `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte`

4. **New Document Dialog Popover** (line 201):
   ```svelte
   <BasePopover {open} {onOpenChange} title="New Document" side="right" align="end" sideOffset={0}>
   ```

### Visual Result

**Before**:
```
┌─────────┐       ┌─────────────┐
│ Sidebar │ 8px   │   Popover   │
│         ├─┐     │             │
└─────────┘ │gap  └─────────────┘
          border
```

**After**:
```
┌─────────┬─────────────┐
│ Sidebar ││   Popover   │
│         │││            │
└─────────┴─┴────────────┘
          border (flush)
```

## Testing Considerations

### Visual Verification
- [ ] Settings popover aligns flush with sidebar border
- [ ] Login popover aligns flush with sidebar border
- [ ] Profile popover aligns flush with sidebar border
- [ ] New Document dialog popover aligns flush with sidebar border
- [ ] Alignment works in both collapsed (48px) and expanded (256px) sidebar states
- [ ] Alignment works in both desktop and mobile modes
- [ ] No visual gaps between sidebar and popovers

### Functional Verification
- [ ] Popovers open/close correctly
- [ ] Popover positioning adapts to viewport bounds
- [ ] Vertical alignment ("start" vs "end") works correctly
- [ ] Popovers don't overlap sidebar content

### Edge Cases
- [ ] Very narrow viewports (mobile)
- [ ] Popover content wider than viewport
- [ ] Rapid sidebar expand/collapse during popover display

## Future Enhancements

1. **Responsive offset**: Could vary `sideOffset` based on sidebar state (collapsed vs expanded)
2. **Animation**: Smooth transition when popover position updates during sidebar expansion
3. **Smart positioning**: Auto-adjust if popover would overflow viewport

## References

- **Base Popover**: `src/lib/components/ui/base-popover.svelte`
- **Sidebar**: `src/lib/components/Sidebar/Sidebar.svelte`
- **Sidebar Design**: `prose/designs/frontend/SIDEBAR.md`
- **Design System**: `prose/designs/frontend/DESIGN_SYSTEM.md`
