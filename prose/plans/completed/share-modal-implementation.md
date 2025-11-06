# Share Modal Implementation Plan

**Status**: In Progress
**Created**: 2025-11-05
**Design Reference**: [SHARE_MODAL.md](../designs/frontend/SHARE_MODAL.md)

## Current State

The Top Menu kebab menu has a "Share" button that currently only logs to console:

```
File: src/lib/components/TopMenu/TopMenu.svelte
Lines: 113-116, 231-237

function handleShare() {
    // TODO: Open share dialog
    console.log('Share document');
}
```

Users click the Share button but receive no visual feedback.

## Desired State

The Share button opens a placeholder modal that:

- Displays a "Share Document" dialog
- Shows a message that sharing functionality is coming soon
- Provides Close button and standard close mechanisms
- Follows all widget theme unification standards
- Works seamlessly in light and dark themes

## Implementation Steps

### Step 1: Create ShareModal Component

**File to create:** `src/lib/components/ShareModal.svelte`

**Component structure:**

- Import Dialog primitives from `ui/dialog*.svelte`
- Import X icon from `lucide-svelte`
- Define props: `open: boolean`, `onOpenChange: (open: boolean) => void`
- Follow three-part structure: Header, Content, Footer

**Content approach:**

- Simple placeholder message
- Centered text layout
- Minimal complexity (KISS principle)

**Design token usage:**

- `bg-surface-elevated` for modal background
- `border-border` for borders
- `text-foreground` for primary text
- `text-muted-foreground` for secondary text
- `rounded-lg` for corners
- `shadow-lg` for elevation

### Step 2: Update TopMenu Component

**File to modify:** `src/lib/components/TopMenu/TopMenu.svelte`

**Changes needed:**

1. Import the new ShareModal component
2. Add state variable for modal open/closed
3. Replace `handleShare()` console.log with state update
4. Add ShareModal component instance with bindings

**Code location:**

- State variable: Add near other component state (around line 50-80 area)
- Handler update: Modify lines 113-116
- Modal instance: Add after main menu content (around line 280+)

### Step 3: Verify Theme Compliance

**Manual verification:**

- Test modal in light theme
- Test modal in dark theme
- Verify all text is readable (contrast check)
- Check close button visibility and hover states
- Test backdrop opacity

**Keyboard navigation:**

- Tab through focusable elements
- Escape key closes modal
- Focus returns to trigger button on close

### Step 4: Code Review Against Checklist

Using WIDGET_THEME_UNIFICATION.md checklist:

**Color Usage:**

- [ ] All colors reference semantic tokens
- [ ] No hardcoded color values
- [ ] No theme-specific conditional logic
- [ ] Border colors use semantic tokens

**Spacing and Layout:**

- [ ] Container padding follows dialog guidelines
- [ ] Section spacing uses standardized rhythm
- [ ] Typography hierarchy follows design system

**Structural Patterns:**

- [ ] Follows dialog structural pattern
- [ ] Close button positioned top-right
- [ ] Header includes title
- [ ] Footer buttons right-aligned
- [ ] Keyboard focus follows visual hierarchy

**Theme and Accessibility:**

- [ ] Verified in both light and dark themes
- [ ] Text meets WCAG AA contrast
- [ ] Visible focus indicators
- [ ] Keyboard-only navigation tested

## File Changes Summary

**New files:**

- `src/lib/components/ShareModal.svelte`

**Modified files:**

- `src/lib/components/TopMenu/TopMenu.svelte`

**No changes needed to:**

- Design system tokens (already complete)
- Dialog primitives (already exist)
- Any backend files

## DRY Principles Applied

**Reusing existing code:**

- Dialog primitives from `ui/dialog*.svelte` (no reinvention)
- Design system tokens from `app.css` (no new colors)
- Icon system from `lucide-svelte` (consistent icons)
- Modal patterns from DocumentInfoDialog and ImportFileDialog

**Not duplicating:**

- No new theme handling logic
- No custom backdrop implementation
- No new close button styling
- No duplicate spacing values

## KISS Principles Applied

**Simplicity choices:**

- Placeholder modal (not full feature)
- Static content (no forms or inputs)
- No state management beyond open/closed
- Single action button (just Close)
- No API calls or async operations
- No validation or error handling needed

## Implementation Order

1. Create ShareModal component
2. Wire to TopMenu
3. Manual theme testing
4. Checklist verification
5. Commit with clear message

## Success Criteria

The implementation is complete when:

- Clicking Share in kebab menu opens modal
- Modal displays placeholder content
- Modal can be closed via button, backdrop, or Escape key
- Modal looks correct in both light and dark themes
- No console errors
- Code passes WIDGET_THEME_UNIFICATION.md checklist

## Future Considerations

This implementation establishes the foundation. Future work will:

- Add sharing functionality (copy link, email invite)
- Integrate with backend sharing APIs
- Add permission controls
- Add user/group selection

The modal structure is designed to accommodate these additions without refactoring.
