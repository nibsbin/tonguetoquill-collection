# Plan: Align Popovers with Sidebar Border

**Design Reference**: `prose/designs/frontend/POPOVER_SIDEBAR_ALIGNMENT.md`

## Objective

Align all sidebar popovers (Settings, Login, Profile, New Document) flush with the sidebar's right border by setting `sideOffset={0}` on each `BasePopover` instance.

## Background

Currently, popovers in the sidebar use the default `sideOffset` of 8px, creating a visual gap between the sidebar border and the popover. This plan implements the design to remove that gap.

## Implementation Steps

### 1. Update Settings Popover

**File**: `src/lib/components/Sidebar/Sidebar.svelte`
**Line**: ~306

**Change**:
```svelte
<!-- Before -->
<BasePopover bind:open={popoverOpen} side="right" align="end" title="Settings">

<!-- After -->
<BasePopover bind:open={popoverOpen} side="right" align="end" sideOffset={0} title="Settings">
```

### 2. Update Login Popover

**File**: `src/lib/components/Sidebar/Sidebar.svelte`
**Line**: ~247

**Change**:
```svelte
<!-- Before -->
<BasePopover bind:open={loginPopoverOpen} side="right" align="start" title="Sign in">

<!-- After -->
<BasePopover bind:open={loginPopoverOpen} side="right" align="start" sideOffset={0} title="Sign in">
```

### 3. Update Profile Popover

**File**: `src/lib/components/Sidebar/Sidebar.svelte`
**Line**: ~264-268

**Change**:
```svelte
<!-- Before -->
<BasePopover
    bind:open={profilePopoverOpen}
    side="right"
    align="start"
    title="Account Information"
>

<!-- After -->
<BasePopover
    bind:open={profilePopoverOpen}
    side="right"
    align="start"
    sideOffset={0}
    title="Account Information"
>
```

### 4. Update New Document Dialog Popover

**File**: `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte`
**Line**: ~201-210

**Change**:
```svelte
<!-- Before -->
<BasePopover
    {open}
    {onOpenChange}
    title="New Document"
    side="right"
    align="end"
    closeOnEscape={true}
    closeOnOutsideClick={true}
    showCloseButton={false}
>

<!-- After -->
<BasePopover
    {open}
    {onOpenChange}
    title="New Document"
    side="right"
    align="end"
    sideOffset={0}
    closeOnEscape={true}
    closeOnOutsideClick={true}
    showCloseButton={false}
>
```

## Testing Steps

### Visual Testing
1. Open the application in browser
2. Test Settings popover:
   - Click Settings icon
   - Verify popover aligns flush with sidebar border
   - Close popover
3. Test Login popover (if not logged in):
   - Click "Sign in" button
   - Verify popover aligns flush with sidebar border
   - Close popover
4. Test Profile popover (if logged in):
   - Click user profile button
   - Verify popover aligns flush with sidebar border
   - Close popover
5. Test New Document dialog popover:
   - Click "New Document" button
   - Verify popover aligns flush with sidebar border
   - Close popover
6. Test in different sidebar states:
   - Collapsed (48px)
   - Expanded (256px)
7. Test responsive behavior:
   - Desktop mode (≥ 768px)
   - Mobile mode (< 768px)

### Functional Testing
- [ ] Popovers open and close correctly
- [ ] Clicking outside closes popover
- [ ] Escape key closes popover
- [ ] Popover content is fully visible
- [ ] No layout shift when opening/closing
- [ ] Vertical alignment works correctly
- [ ] Popover respects viewport boundaries

## Files Changed

- `src/lib/components/Sidebar/Sidebar.svelte` - Add `sideOffset={0}` to three popover instances
- `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte` - Add `sideOffset={0}` to dialog popover

## Success Criteria

- [ ] All four sidebar popovers align flush with sidebar border (Settings, Login, Profile, New Document)
- [ ] No visual gap between sidebar and popovers
- [ ] Alignment works in both collapsed and expanded sidebar states
- [ ] Alignment works in both desktop and mobile modes
- [ ] All popover functionality remains intact
- [ ] No regressions in other UI elements

## Rollback Plan

If issues arise:
1. Remove `sideOffset={0}` parameter from affected popovers
2. Popovers will revert to default 8px offset
3. No other changes required

## Notes

- This is a minimal, scoped change affecting only sidebar popovers
- `BasePopover` component unchanged - maintains flexibility
- Change is purely visual - no functional impact expected
- Can be tested immediately in browser without build step
- Total of 4 popovers updated: Settings, Login, Profile, and New Document dialog
