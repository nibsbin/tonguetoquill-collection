# Cascade 2: Overlay System Implementation Plan

**Status**: In Progress
**Design**: [OVERLAY_SYSTEM.md](../designs/frontend/OVERLAY_SYSTEM.md)
**Related**: [SIMPLIFICATION_CASCADES_ANALYSIS.md](SIMPLIFICATION_CASCADES_ANALYSIS.md)

## Objective

Extract shared overlay behaviors into composable hooks to eliminate 400-500 lines of duplication across 13+ overlay implementations while preserving semantic components and accessibility.

## Current State

### Duplicated Behaviors

**Dismissal Logic** (repeated 5×):

- `base-dialog.svelte`: handleEscapeKey, handleBackdropClick
- `base-popover.svelte`: handleEscapeKey, clickOutside action
- `base-sheet.svelte`: handleEscapeKey, handleBackdropClick
- `base-select.svelte`: (likely has similar patterns)
- Feature components: copy dismissal patterns

**Focus Management** (repeated 3×):

- `base-dialog.svelte`: focusTrap action
- `base-sheet.svelte`: focusTrap action
- `base-select.svelte`: (likely has focus management)

**Portal Rendering** (repeated 5×):

- All base components wrap with Portal or implement teleporting

**Overlay Coordination** (repeated 5×):

- All components manually register/unregister with overlayStore
- All components generate unique IDs
- All components use $effect for lifecycle

**Positioning** (repeated 3× with variations):

- `base-dialog.svelte`: center positioning (translate-x/y-1/2)
- `base-popover.svelte`: complex calculatePosition (111 lines!)
- `base-sheet.svelte`: side-based positioning with transforms
- `toast.svelte`: corner positioning

### Supporting Infrastructure

**Utilities**:

- `$lib/utils/focus-trap.ts`: focusTrap action (90 lines)
- `$lib/utils/use-click-outside.ts`: clickOutside action (26 lines)
- `$lib/components/ui/portal.svelte`: Portal component

**Stores**:

- `$lib/stores/overlay.svelte.ts`: Overlay coordination (116 lines)

**Components**:

- `$lib/components/ui/base-dialog.svelte` (170 lines)
- `$lib/components/ui/base-popover.svelte` (278 lines)
- `$lib/components/ui/base-sheet.svelte` (175 lines)
- `$lib/components/ui/base-select.svelte` (unknown)
- `$lib/components/ui/toast.svelte` (116 lines)

## Desired State

### New Hook Utilities

**Location**: `$lib/utils/overlay/`

Five composable hooks:

1. `use-dismissible.ts`: ESC, backdrop, outside click handlers
2. `use-focus-trap.ts`: Focus containment and restoration wrapper
3. `use-portal.ts`: Portal rendering wrapper
4. `use-zindex.ts`: Overlay store coordination wrapper
5. `use-positioning.ts`: Position calculation and updates

### Refactored Components

**Same public APIs** (no breaking changes):

- Components use hooks internally
- Props remain unchanged
- ARIA and accessibility preserved
- Visual appearance unchanged

**Reduced code**:

- Remove duplicated dismissal handlers
- Remove duplicated focus management
- Remove duplicated positioning logic
- Remove manual overlay registration
- Keep semantic structure and ARIA

## Implementation Steps

### Step 1: Create Hook Utilities

**1.1 Create use-dismissible.ts**

Extract dismissal behavior from:

- `base-dialog.svelte` (handleEscapeKey, handleBackdropClick)
- `base-popover.svelte` (handleEscapeKey, clickOutside)
- `base-sheet.svelte` (handleEscapeKey, handleBackdropClick)

Hook interface:

- Accept: `{ onEscape?, onBackdrop?, onOutside? }`
- Return: Svelte action or effect-based hook
- Use: existing `clickOutside` utility internally

**1.2 Create use-focus-trap.ts**

Wrap existing focus-trap.ts functionality:

- Accept: `{ enabled: boolean, container: HTMLElement }`
- Return: Svelte action wrapper
- Delegate to: `$lib/utils/focus-trap.ts`

**1.3 Create use-portal.ts**

Wrap Portal component as a hook:

- Accept: `{ target?: HTMLElement, disabled?: boolean }`
- Return: Hook that handles portal rendering
- Use: existing Portal component

**1.4 Create use-zindex.ts**

Extract overlay registration from all components:

- Accept: `{ layer: 'modal' | 'popover' | 'toast', onClose: () => void }`
- Return: Effect-based registration
- Use: existing overlayStore
- Handle: unique ID generation, register/unregister lifecycle

**1.5 Create use-positioning.ts**

Extract positioning from all components:

- Accept: `{ strategy, anchor?, side?, align?, offset? }`
- Return: Reactive position state and update handlers
- Strategies: 'center', 'relative', 'side', 'corner'
- Handle: resize/scroll listeners, viewport collision

### Step 2: Refactor base-dialog.svelte

**Changes**:

- Import and use: useDismissible, useFocusTrap, usePortal, useZIndex, usePositioning
- Remove: handleEscapeKey, handleBackdropClick, manual overlay registration
- Remove: manual focusTrap action usage
- Keep: ARIA attributes, props, snippets, styling

**Validation**:

- Visual regression test (appearance unchanged)
- Interaction test (dismissal, focus, keyboard)
- Existing tests pass

### Step 3: Refactor base-popover.svelte

**Changes**:

- Import and use: useDismissible, usePortal, useZIndex, usePositioning
- Remove: handleEscapeKey, calculatePosition (111 lines!), resize/scroll listeners
- Remove: manual overlay registration, position state management
- Keep: ARIA attributes, props, snippets, trigger handling

**Validation**:

- Positioning accuracy (compare before/after)
- Collision detection works
- Existing tests pass

### Step 4: Refactor base-sheet.svelte

**Changes**:

- Import and use: useDismissible, useFocusTrap, usePortal, useZIndex, usePositioning
- Remove: handleEscapeKey, handleBackdropClick, manual overlay registration
- Remove: manual focusTrap action usage
- Keep: side-based transforms, mobile detection, ARIA

**Validation**:

- Side positioning works (top/right/bottom/left)
- Mobile auto-convert to bottom sheet
- Existing tests pass

### Step 5: Refactor base-select.svelte

**Changes**:

- Import and use: useDismissible, usePortal, useZIndex, usePositioning
- Remove: duplicated dismissal/positioning logic (if any)
- Keep: Listbox ARIA, keyboard navigation, selection logic

**Validation**:

- Dropdown positioning
- Keyboard navigation (arrows, enter, space)
- Existing tests pass

### Step 6: Refactor toast.svelte

**Changes**:

- Import and use: usePortal, useZIndex, usePositioning
- Remove: manual z-index classes, position classes
- Keep: Toast animations, auto-dismiss logic, ARIA

**Validation**:

- Toast positioning (corners)
- Multiple toasts stack correctly
- Auto-dismiss timing unchanged

### Step 7: Remove Old Code

**Components**:

- Delete unused dismissal handlers from components
- Delete unused positioning logic from components
- Delete unused overlay registration from components

**Keep utilities** (used by hooks):

- `$lib/utils/focus-trap.ts`
- `$lib/utils/use-click-outside.ts`
- `$lib/components/ui/portal.svelte`
- `$lib/stores/overlay.svelte.ts`

### Step 8: Run Full Test Suite

**Test Coverage**:

- All overlay component tests pass
- All feature component tests pass (NewDocumentDialog, ShareModal, etc.)
- Visual regression tests (unchanged appearance)
- Accessibility tests (ARIA, keyboard, screen reader)
- Integration tests (multiple overlays, nested overlays)

### Step 9: Documentation Consolidation

**Archive old docs**:

- Move `prose/designs/frontend/WIDGET_ABSTRACTION.md` → `prose/plans/completed/`
- Move `prose/designs/frontend/WIDGET_THEME_UNIFICATION.md` → merge theming into DESIGN_SYSTEM.md
- Move `prose/designs/frontend/POPOVER_SIDEBAR_ALIGNMENT.md` → `prose/plans/completed/`

**Update INDEX.md**:

- Remove references to archived docs
- Add reference to OVERLAY_SYSTEM.md as canonical overlay doc

**Keep**:

- ZINDEX_STRATEGY.md (reference for z-index values)
- ACCESSIBILITY.md (general a11y guidelines)

### Step 10: Commit and Push

**Commit Message**:

```
Implement overlay system with composable hooks (CASCADE_2)

Extract 5 shared behaviors into composable hooks:
- useDismissible: ESC, backdrop, outside click
- useFocusTrap: Focus containment and restoration
- usePortal: Portal rendering
- useZIndex: Overlay coordination
- usePositioning: Position calculation

Refactored components (no breaking changes):
- base-dialog.svelte
- base-popover.svelte
- base-sheet.svelte
- base-select.svelte
- toast.svelte

Eliminates: ~400-500 lines of duplicated behavior code
Consolidates: 4 design docs → 1 OVERLAY_SYSTEM.md
Preserves: Public APIs, accessibility, semantic components

Closes Cascade 2 from SIMPLIFICATION_CASCADES_ANALYSIS.md
```

## Migration Notes

### No Breaking Changes

**Public APIs unchanged**:

- All component props remain the same
- All component behaviors remain the same
- All ARIA attributes remain the same
- All keyboard interactions remain the same

**Internal refactoring only**:

- Components use hooks internally
- Behavior logic extracted to hooks
- Components become thinner wrappers

### Backwards Compatibility

Not applicable (no public API changes).

**Fuck backwards compatibility** means:

- We're not supporting old internal implementations
- We're refactoring aggressively
- We're not maintaining deprecated code paths

But:

- Public component APIs remain stable
- Feature components work without changes
- Tests pass without modification

## Success Metrics

### Quantitative

- [x] 5 hook utilities created
- [ ] 5 components refactored
- [ ] ~400-500 lines of overlay code removed
- [ ] 4 design docs consolidated to 1
- [ ] 100% existing tests pass
- [ ] 0 breaking changes to public APIs

### Qualitative

- [ ] Consistent behavior across all overlays
- [ ] Easier to add new overlay types (just use hooks)
- [ ] Reduced cognitive load (one way to do things)
- [ ] Maintained accessibility (ARIA, keyboard, focus)
- [ ] No z-index conflicts (centralized coordination)

## Deviations from Original Plan

None expected. Implementation follows design exactly.

Any deviations will be documented here during implementation.

## Next Steps After Completion

1. Move this plan to `prose/plans/completed/CASCADE_2_OVERLAY_SYSTEM.md`
2. Update SIMPLIFICATION_CASCADES_ANALYSIS.md to mark Cascade 2 as complete
3. Consider implementing Cascade 1 (Client Service Framework) or Cascade 3 (Error System) next
