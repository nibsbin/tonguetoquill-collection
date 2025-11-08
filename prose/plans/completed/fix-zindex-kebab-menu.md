# Implementation Plan: Fix Z-Index for Kebab Menu Above Utility Modals

## Overview

**Objective**: Fix z-index layering so the kebab menu dropdown renders above scoped utility modals (About, Terms, Privacy).

**Design Reference**: `prose/designs/frontend/ZINDEX_STRATEGY.md`

**Current State**:

- Kebab menu: `z-popover` (1100)
- Utility modals: `z-modal-backdrop` (1400), `z-modal-content` (1500)
- Problem: Utility modals block kebab menu access

**Target State**:

- Kebab menu: `z-popover` (1100) - unchanged
- Utility modals: `z-scoped-backdrop` (1050), `z-scoped-content` (1075) - NEW
- Result: Kebab menu accessible above utility modals

## Implementation Steps

### Step 1: Update CSS Z-Index Variables

**File**: `src/app.css`

**Action**: Add new z-index layers for scoped content between dropdowns and popovers.

**Changes**:

1. Locate the z-index variable definitions (around line 29-47)
2. Add new scoped content layers in Group 4 position
3. Update comments to reflect new layer structure

**Before**:

```css
:root {
	/* Group 3: Minor Widgets */
	--z-dropdown: 1000;
	--z-popover: 1100;
	--z-toast: 1200;
	--z-banner: 1300;

	/* Group 4: Modals */
	--z-modal-backdrop: 1400;
	--z-modal-content: 1500;
}
```

**After**:

```css
:root {
	/* Group 3: Minor Widgets */
	--z-dropdown: 1000;

	/* Group 4: Scoped Content - Informational overlays within containers */
	--z-scoped-backdrop: 1050; /* Scoped modal backdrops (utility pages) */
	--z-scoped-content: 1075; /* Scoped modal content (utility pages) */

	/* Group 5: Navigation Overlays - Must be above scoped content */
	--z-popover: 1100;
	--z-toast: 1200;
	--z-banner: 1300;

	/* Group 6: Modals - Full attention overlays */
	--z-modal-backdrop: 1400;
	--z-modal-content: 1500;
}
```

### Step 2: Register Tailwind Utility Classes

**File**: `src/app.css`

**Action**: Add Tailwind utility classes for new z-index layers.

**Changes**:

1. Locate the Tailwind theme extension section (around line 170-182)
2. Add new z-index theme tokens

**Find this section**:

```css
@layer base {
	@theme {
		--z-content: 0;
		--z-canvas-ui: 10;
		--z-canvas-overlay: 20;
		--z-sidebar-backdrop: 40;
		--z-sidebar: 50;
		--z-dropdown: 1000;
		--z-popover: 1100;
		--z-toast: 1200;
		--z-banner: 1300;
		--z-modal-backdrop: 1400;
		--z-modal-content: 1500;
	}
}
```

**Add new entries**:

```css
@layer base {
	@theme {
		--z-content: 0;
		--z-canvas-ui: 10;
		--z-canvas-overlay: 20;
		--z-sidebar-backdrop: 40;
		--z-sidebar: 50;
		--z-dropdown: 1000;
		--z-scoped-backdrop: 1050; /* NEW */
		--z-scoped-content: 1075; /* NEW */
		--z-popover: 1100;
		--z-toast: 1200;
		--z-banner: 1300;
		--z-modal-backdrop: 1400;
		--z-modal-content: 1500;
	}
}
```

### Step 3: Update Base Dialog Component

**File**: `src/lib/components/ui/base-dialog.svelte`

**Action**: Conditionally apply scoped z-index classes when `scoped=true`.

**Changes**:

1. Update backdrop `class` attribute (line ~85)
2. Update dialog container `class` attribute (line ~93)

**Find backdrop div (line ~84-88)**:

```svelte
<div
	class={cn('z-modal-backdrop inset-0 bg-black/40', scoped ? 'absolute' : 'fixed')}
	onclick={handleBackdropClick}
	role="presentation"
></div>
```

**Replace with**:

```svelte
<div
	class={cn(
		scoped ? 'z-scoped-backdrop' : 'z-modal-backdrop',
		'inset-0 bg-black/40',
		scoped ? 'absolute' : 'fixed'
	)}
	onclick={handleBackdropClick}
	role="presentation"
></div>
```

**Find dialog container div (line ~91-113)**:

```svelte
<div
  class={cn(
    'z-modal-content bg-surface-elevated shadow-lg',
    size === 'fullscreen'
      ? 'absolute inset-0 flex flex-col'
      : cn(
          'w-full rounded-lg border border-border p-6',
          scoped
            ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        ),
    sizeClasses[size],
    className
  )}
  role="dialog"
  aria-modal="true"
  ...
>
```

**Replace with**:

```svelte
<div
  class={cn(
    scoped ? 'z-scoped-content' : 'z-modal-content',
    'bg-surface-elevated shadow-lg',
    size === 'fullscreen'
      ? 'absolute inset-0 flex flex-col'
      : cn(
          'w-full rounded-lg border border-border p-6',
          scoped
            ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        ),
    sizeClasses[size],
    className
  )}
  role="dialog"
  aria-modal="true"
  ...
>
```

### Step 4: Verify Utility Modal Configuration

**Files to check**:

- `src/lib/components/AboutModal.svelte`
- `src/lib/components/TermsModal.svelte`
- `src/lib/components/PrivacyModal.svelte`

**Action**: Verify all utility modals use `scoped=true` prop.

**Expected configuration** (all three files):

```svelte
<Dialog {open} {onOpenChange} title="..." scoped size="fullscreen">
	{#snippet content()}
		<DialogContent prose fullscreen>
			<!-- Modal content -->
		</DialogContent>
	{/snippet}
</Dialog>
```

**Check**:

- ✓ `scoped` prop is present (line 13 in each file)
- ✓ `size="fullscreen"` is set
- ✓ No z-index inline styles override

### Step 5: Update Documentation

**File**: `prose/designs/frontend/WIDGET_ABSTRACTION.md`

**Action**: Update z-index section (lines 605-714) to reflect new scoped layers.

**Changes**:

1. Locate "Z-Index Management System" section (line ~605)
2. Update CSS code block with new layers (line ~613-629)
3. Update layer hierarchy table (line ~632-642)
4. Add note about scoped content in usage section (line ~651-674)

**Add to layer hierarchy description**:

```markdown
**Group 4: Scoped Content** (1050-1075)

- **scoped-backdrop** (1050): Scoped modal backdrops - informational overlays within containers
- **scoped-content** (1075): Scoped modal content - utility pages (About, Terms, Privacy)

**Group 5: Navigation Overlays** (1100-1300)

- **popover** (1100): Popovers - navigation and contextual UI (must be above scoped content)
```

**Add to usage examples**:

```typescript
// Scoped Utility Modals (NEW)
class="z-scoped-backdrop"  // 1050 (backdrop)
class="z-scoped-content"   // 1075 (modal content)
```

## Testing Plan

### Manual Testing

#### Test 1: Kebab Menu Above Utility Modals

**Steps**:

1. Open application
2. Click kebab menu (three dots icon) in top menu
3. Click "About Us" from dropdown
4. Verify About modal opens fullscreen
5. Click kebab menu button again while About is open
6. **Expected**: Dropdown menu appears ABOVE the About modal
7. **Verify**: Can click menu items (Terms, Privacy, etc.)
8. Repeat for Terms and Privacy modals

**Success Criteria**:

- Kebab menu dropdown is fully visible above modal backdrop
- Menu items are clickable
- Modal content is partially dimmed/obscured behind dropdown
- Clicking menu item closes current modal and opens new one

#### Test 2: Global Modals Above Kebab Menu

**Steps**:

1. Open Share modal (from kebab menu or toolbar)
2. Click kebab menu while Share modal is open
3. **Expected**: Share modal BLOCKS kebab menu (modal is above)
4. Close Share modal, then test Document Info modal

**Success Criteria**:

- Global modals (Share, Document Info) appear above kebab menu
- Kebab menu cannot be interacted with while global modal is open
- Only close button, ESC, or backdrop click dismisses modal

#### Test 3: Z-Index Inspector

**Steps**:

1. Open browser DevTools
2. Open About modal
3. Open kebab menu
4. Inspect both elements and check computed z-index values

**Expected Values**:

- About modal backdrop: `z-index: 1050`
- About modal content: `z-index: 1075`
- Kebab menu popover: `z-index: 1100`

#### Test 4: Close Interactions

**Steps**:

1. Open About modal
2. Open kebab menu (should appear above)
3. Click backdrop (outside both menu and modal)
4. **Expected**: Kebab menu closes, About modal remains open
5. Click backdrop again
6. **Expected**: About modal closes

**Success Criteria**:

- Clicking outside menu closes menu only
- Clicking outside modal closes modal only
- ESC key closes topmost overlay first
- X button in modal header closes modal

### Browser Testing

Test in all supported browsers:

- [ ] Chrome (Windows/Mac)
- [ ] Firefox (Windows/Mac)
- [ ] Safari (Mac)
- [ ] Edge (Windows)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Visual Regression Testing

**Screenshots needed**:

1. Kebab menu dropdown alone (baseline)
2. About modal alone (baseline)
3. **Kebab menu above About modal** (primary test case)
4. Share modal above kebab menu (secondary test case)

## Rollback Plan

If issues arise after deployment:

### Quick Rollback Steps

1. **Revert CSS changes**:

   ```bash
   git diff src/app.css
   git checkout HEAD -- src/app.css
   ```

2. **Revert Dialog component**:

   ```bash
   git checkout HEAD -- src/lib/components/ui/base-dialog.svelte
   ```

3. **Rebuild and test**:
   ```bash
   npm run build
   npm run preview
   ```

### Fallback Solution

If new z-index approach doesn't work, alternative solutions:

**Option A**: Move utility modals to global scope

- Remove `scoped` prop from utility modals
- Use portal rendering (fixed positioning)
- Close kebab menu when modal opens (via overlay store)

**Option B**: Increase popover z-index

- Change `--z-popover` from 1100 to 1600
- Ensure all popovers render above modals
- May break expected layering for other popovers

## Deployment Strategy

### Development

1. Implement changes on feature branch
2. Test locally with all scenarios
3. Create PR with screenshots

### Staging

1. Deploy to staging environment
2. Perform full manual testing
3. Get design team approval

### Production

1. Merge to main branch
2. Monitor for user feedback
3. Watch for error reports related to z-index or overlays

## Success Metrics

- [ ] Kebab menu visible above utility modals (verified visually)
- [ ] Kebab menu items clickable when modal is open (verified interactively)
- [ ] Global modals still block kebab menu (verified visually)
- [ ] No z-index-related bugs reported in first week
- [ ] No regression in modal or popover functionality

## Open Questions

1. **Should we add visual indicator when kebab menu is above modal?**
   - Could add subtle glow or border to indicate menu is "on top"
   - Design decision needed

2. **Should modal backdrop dim when menu is above it?**
   - Currently modal backdrop is always same opacity
   - Could reduce opacity when menu opens

3. **Should we auto-close utility modal when navigating to another utility page?**
   - Current: clicking Terms from kebab menu while About is open
   - Expected: Close About, open Terms
   - Implementation: handled by parent component state management

## Completion Checklist

- [ ] CSS z-index variables updated in `app.css`
- [ ] Tailwind utilities registered in `app.css`
- [ ] `base-dialog.svelte` updated with conditional z-index
- [ ] `AboutModal.svelte` verified with `scoped=true`
- [ ] `TermsModal.svelte` verified with `scoped=true`
- [ ] `PrivacyModal.svelte` verified with `scoped=true`
- [ ] Manual testing completed (all test cases pass)
- [ ] Browser testing completed (all browsers)
- [ ] Documentation updated (`WIDGET_ABSTRACTION.md`)
- [ ] Screenshots added to PR
- [ ] Design team approval obtained
- [ ] Code review completed
- [ ] Merged to main branch

---

**Created**: 2025-11-08
**Status**: Ready for Implementation
**Estimated Effort**: 2-3 hours
**Priority**: High (UX issue blocking navigation)
