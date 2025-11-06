# Widget Theme Unification Plan

## Objective

Transition all widget components from mixed/hardcoded theming approaches to a unified semantic token system as described in [WIDGET_THEME_UNIFICATION.md](../designs/frontend/WIDGET_THEME_UNIFICATION.md).

## Current State

### Widgets Analyzed

1. ✅ **DocumentInfoDialog.svelte** - Partially uses semantic tokens
2. ❌ **ImportFileDialog.svelte** - Uses hardcoded neutral colors
3. ⚠️ **RulerOverlay.svelte** - Mixed: semantic tokens + one hardcoded green
4. ⚠️ **LoginPopover.svelte** - Mixed: some semantic tokens, hardcoded success/error
5. ✅ **Settings Popover** (in Sidebar.svelte) - Good semantic token usage
6. ✅ **Account Information Modal** (in Sidebar.svelte) - Good semantic token usage

### Issues Identified

- Missing success/info semantic tokens in `app.css`
- Hardcoded `neutral-*` colors in ImportFileDialog
- Hardcoded success/error backgrounds in LoginPopover
- Hardcoded green color in RulerOverlay
- Inconsistent spacing across widgets

## Implementation Steps

### Step 1: Add Missing Semantic Tokens to app.css

**File:** `src/app.css`

**Changes:**

1. Add success color tokens (light theme in `:root`)
2. Add success color tokens (dark theme in `.dark`)
3. Add Tailwind mappings in `@theme inline`

**New Tokens:**

```css
/* Success colors */
--color-success: /* light: #16a34a, dark: #22c55e */ --color-success-foreground:
	/* light: #14532d, dark: #bbf7d0 */
	--color-success-background: /* light: #f0fdf4, dark: #14532d */
	--color-success-border: /* light: #bbf7d0, dark: #166534 */
	/* Info colors (optional, for future use) */ --color-info: /* light: #2563eb, dark: #3b82f6 */
	--color-info-foreground: /* light: #1e3a8a, dark: #bfdbfe */
	--color-info-background: /* light: #eff6ff, dark: #1e3a8a */
	--color-info-border: /* light: #bfdbfe, dark: #1e40af */;
```

### Step 2: Update ImportFileDialog.svelte

**File:** `src/lib/components/ImportFileDialog.svelte`

**Changes:**

1. Line 82: `bg-white dark:bg-neutral-800` → `bg-surface-elevated`
2. Line 90: `text-neutral-900 dark:text-neutral-100` → `text-foreground`
3. Line 107: `text-neutral-600 dark:text-neutral-400` → `text-muted-foreground`
4. Line 124: `border-neutral-300 dark:border-neutral-600` → `border-border`
5. Line 124: `hover:border-neutral-400 dark:hover:border-neutral-500` → `hover:border-border-hover`
6. Line 130: `text-neutral-400 dark:text-neutral-500` → `text-muted-foreground`
7. Line 131: `text-neutral-600 dark:text-neutral-400` → `text-muted-foreground`
8. Line 132: `text-neutral-500 dark:text-neutral-500` → `text-muted-foreground`
9. Line 137: `text-red-600 dark:text-red-400` → `text-error` (or use error token)

**Layout adjustments:**

- Keep current structure, just update colors
- Consider using `bg-surface-elevated` for elevated feel

### Step 3: Update RulerOverlay.svelte

**File:** `src/lib/components/RulerOverlay/RulerOverlay.svelte`

**Changes:**

1. Line 312: `fill: #22c55e;` → `fill: var(--color-success);`

**Notes:**

- All other colors already use semantic tokens
- Keep current spacing and layout

### Step 4: Update LoginPopover.svelte

**File:** `src/lib/components/Sidebar/LoginPopover.svelte`

**Changes:**

1. Line 146-147: Success message styling
   - `bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300`
   - → `bg-success-background text-success-foreground border border-success-border`

2. Line 154-155: Error message styling
   - `bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300`
   - → `bg-error-background text-error-foreground border border-error-border`

**Notes:**

- Add border for better definition
- Use new semantic success tokens

### Step 5: Review Settings Popover (Sidebar.svelte)

**File:** `src/lib/components/Sidebar/Sidebar.svelte`

**Changes:**

- Lines 294-341 (mobile), 447-494 (desktop): Settings PopoverContent
- Verify spacing consistency: `p-4`, `space-y-4`, `mb-4`
- Verify colors: Already using semantic tokens
- No changes needed if consistent

### Step 6: Review Account Information Modal (Sidebar.svelte)

**File:** `src/lib/components/Sidebar/Sidebar.svelte`

**Changes:**

- Lines 530-560: Profile Modal DialogContent
- Verify spacing consistency: `space-y-4`
- Verify colors: Already using semantic tokens
- No changes needed if consistent

### Step 7: Review DocumentInfoDialog.svelte

**File:** `src/lib/components/DocumentInfoDialog.svelte`

**Changes:**

- Line 52: Consider `bg-surface-elevated` instead of `bg-background` for elevated feel
- Verify all colors use semantic tokens (already good)
- Verify spacing consistency

## Testing Checklist

### Visual Testing

- [ ] All widgets render correctly in light mode
- [ ] All widgets render correctly in dark mode
- [ ] No color shifts or inconsistencies when toggling theme
- [ ] Consistent spacing and alignment across all widgets

### Accessibility Testing

- [ ] Contrast ratios meet WCAG AA (4.5:1 for normal text)
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen reader labels present and correct

### Functional Testing

- [ ] All widgets maintain existing functionality
- [ ] No regressions in user interactions
- [ ] Success/error messages display correctly
- [ ] Hover states work as expected

### Cross-Browser Testing

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

## Success Criteria

1. ✅ All hardcoded colors replaced with semantic tokens
2. ✅ Consistent spacing across all widgets
3. ✅ Seamless light/dark theme switching
4. ✅ WCAG AA contrast compliance
5. ✅ No functional regressions
6. ✅ Code passes existing tests

## Rollback Plan

If issues arise:

1. Revert `app.css` changes
2. Revert individual widget changes
3. Test on branch before merging to main

## Post-Implementation

1. Update any relevant documentation
2. Consider creating a widget theming guide for future components
3. Monitor for any reported issues
4. Consider applying same approach to other components

## References

- [WIDGET_THEME_UNIFICATION.md](../designs/frontend/WIDGET_THEME_UNIFICATION.md)
- [DESIGN_SYSTEM.md](../designs/frontend/DESIGN_SYSTEM.md)
- [COMPONENT_ORGANIZATION.md](../designs/frontend/COMPONENT_ORGANIZATION.md)
