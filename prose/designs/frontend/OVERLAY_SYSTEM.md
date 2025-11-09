# Overlay System Design

**Status**: Approved for Implementation
**Related**: [ZINDEX_STRATEGY.md](ZINDEX_STRATEGY.md), [ACCESSIBILITY.md](ACCESSIBILITY.md)
**Supersedes**: WIDGET_ABSTRACTION.md, WIDGET_THEME_UNIFICATION.md, POPOVER_SIDEBAR_ALIGNMENT.md

## Overview

Unified overlay system using **composable behavior hooks** to eliminate duplication while preserving semantic clarity and accessibility. Extracts 5 shared behaviors from 13+ overlay implementations into reusable hooks.

## Design Principles

### Composition Over Configuration

Extract shared behaviors into **composable hooks** that components use internally. Maintain distinct semantic component types (Dialog, Popover, Sheet, Toast, Select) for accessibility and clarity.

**Why Not a Unified Component?**

A single `<Overlay>` component would require complex configuration for different ARIA roles, keyboard behaviors, and focus strategies. This leads to "god component" anti-pattern. Compositional approach:

- ✅ Eliminates behavior duplication via hooks
- ✅ Maintains semantic clarity (Dialog vs Popover)
- ✅ Preserves accessibility (appropriate ARIA per type)
- ✅ Easier to test (hooks independently testable)
- ✅ Better DX (clear intent vs configuration)

### Behavior Hooks (Internal)

Five shared behavior hooks eliminate 400-500 lines of duplication:

#### 1. useDismissible

Handles all dismissal methods with configurable callbacks.

**Behaviors**:

- ESC key dismissal
- Backdrop click dismissal
- Outside click dismissal
- Calls appropriate close callback

**Configuration**:

- `onEscape`: callback for ESC key
- `onBackdrop`: callback for backdrop click
- `onOutside`: callback for outside click
- Enable/disable each method independently

**Eliminates**: Repeated `handleEscapeKey`, `handleBackdropClick`, `clickOutside` logic across 5 components

#### 2. useFocusTrap

Manages focus containment and restoration.

**Behaviors**:

- Trap focus within container (Tab/Shift+Tab cycling)
- Auto-focus first focusable element on mount
- Restore focus to previous element on unmount
- Can be disabled for non-modal overlays

**Configuration**:

- `enabled`: boolean to enable/disable trap
- `container`: element to trap focus within

**Eliminates**: Repeated focus-trap action usage and focus management logic

#### 3. usePortal

Handles teleporting overlay content to appropriate container.

**Behaviors**:

- Render to document body by default
- Support scoped rendering for nested contexts
- Automatic cleanup on unmount

**Configuration**:

- `target`: optional custom portal target
- `disabled`: render in place (for scoped overlays)

**Eliminates**: Repeated Portal component wrapper logic

#### 4. useZIndex

Manages z-index layering and overlay coordination.

**Behaviors**:

- Auto-register with overlay store
- Priority-based stacking
- Auto-close lower-priority overlays
- Auto-unregister on unmount

**Configuration**:

- `layer`: 'modal' | 'popover' | 'toast'
- `onClose`: callback when overlay should close

**Eliminates**: Repeated overlay store registration/unregister logic across all components

#### 5. usePositioning

Calculates and maintains overlay position.

**Behaviors**:

- Centered positioning (dialogs)
- Relative positioning with collision detection (popovers)
- Side-based positioning (sheets)
- Corner positioning (toasts)
- Auto-update on window resize/scroll
- Viewport boundary detection

**Configuration**:

- `strategy`: 'center' | 'relative' | 'side' | 'corner'
- `anchor`: reference element for relative positioning
- `side`: 'top' | 'right' | 'bottom' | 'left'
- `align`: 'start' | 'center' | 'end'
- `offset`: distance from anchor

**Eliminates**: Repeated `calculatePosition` logic, resize/scroll listeners, viewport calculations

### Semantic Components (Public API)

Components maintain distinct types with appropriate ARIA and keyboard behavior:

#### Dialog

**Purpose**: Modal dialogs requiring user attention and action

**ARIA**: `role="dialog"`, `aria-modal="true"`

**Keyboard**:

- ESC closes
- Focus trapped
- Tab cycles within dialog

**Uses**:

- `useDismissible({ onEscape: close, onBackdrop: close })`
- `useFocusTrap(true)`
- `usePortal()`
- `useZIndex('modal')`
- `usePositioning({ strategy: 'center' })`

**Props**: Same as current (no breaking changes)

#### Popover

**Purpose**: Lightweight contextual UI anchored to trigger

**ARIA**: `role="dialog"` (or `role="menu"` for menu popovers)

**Keyboard**:

- ESC closes
- Outside click closes
- No focus trap (can interact with page)

**Uses**:

- `useDismissible({ onEscape: close, onOutside: close })`
- `usePortal()`
- `useZIndex('popover')`
- `usePositioning({ strategy: 'relative', anchor: trigger, side, align })`

**Props**: Same as current (no breaking changes)

#### Sheet

**Purpose**: Side panels for complex content or workflows

**ARIA**: `role="dialog"`, `aria-modal="true"`

**Keyboard**:

- ESC closes
- Focus trapped
- Tab cycles within sheet

**Uses**:

- `useDismissible({ onEscape: close, onBackdrop: close })`
- `useFocusTrap(true)`
- `usePortal()`
- `useZIndex('modal')`
- `usePositioning({ strategy: 'side', side })`

**Props**: Same as current (no breaking changes)

**Mobile Behavior**: Auto-converts to bottom sheet on mobile (<768px)

#### Toast

**Purpose**: Temporary notifications

**ARIA**: `role="status"` (or `role="alert"` for errors)

**Keyboard**:

- Optional dismiss button
- No focus management
- No dismissal on ESC/outside click

**Uses**:

- `usePortal()`
- `useZIndex('toast')`
- `usePositioning({ strategy: 'corner', side, align })`

**Props**: Same as current (no breaking changes)

**Auto-dismiss**: Via toast store (not overlay behavior)

#### Select Dropdown

**Purpose**: Custom select dropdowns

**ARIA**: `role="listbox"`, `aria-expanded`

**Keyboard**:

- ESC closes
- Arrow keys navigate
- Enter/Space select
- Outside click closes

**Uses**:

- `useDismissible({ onEscape: close, onOutside: close })`
- `usePortal()`
- `useZIndex('popover')`
- `usePositioning({ strategy: 'relative', anchor: trigger, side: 'bottom' })`

**Props**: Same as current (no breaking changes)

## What Gets Preserved

### Semantic Components

- ✅ Dialog, Popover, Sheet, Toast, Select (distinct types)
- ✅ Appropriate ARIA roles per type
- ✅ Type-specific keyboard interactions
- ✅ Public API contracts (no breaking changes)

### Accessibility

- ✅ Focus management per a11y guidelines
- ✅ ARIA attributes per component semantics
- ✅ Keyboard navigation patterns
- ✅ Screen reader announcements

### Flexibility

- ✅ Each component can configure behavior hooks
- ✅ Hooks can be disabled per component needs
- ✅ Custom positioning/styling still supported
- ✅ Easy to add new overlay types

## Testing Strategy

### Hook Testing

- Unit test each hook independently
- Test with different configurations
- Test cleanup/unmount behavior
- Test edge cases (nested overlays, rapid open/close)

### Component Testing

- Visual regression tests (unchanged appearance)
- Interaction tests (dismissal, focus, keyboard)
- Accessibility tests (ARIA, screen reader)
- Integration tests (multiple overlays, priority)

### No Breaking Changes

- All existing component tests must pass unchanged
- Feature components using base overlays work without modification

## Cross-References

- **Z-Index Values**: See [ZINDEX_STRATEGY.md](ZINDEX_STRATEGY.md) for layer priorities
- **Accessibility**: See [ACCESSIBILITY.md](ACCESSIBILITY.md) for WCAG 2.1 guidelines
- **Design Tokens**: See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for colors, spacing, shadows
- **Focus Management**: focusTrap action remains in `$lib/utils/focus-trap.ts`
- **Overlay Store**: See `$lib/stores/overlay.svelte.ts` for coordination logic

## Success Criteria

### Quantitative

- 400-500 lines of overlay code eliminated
- 4 design docs consolidated to 1
- 0 breaking changes to public APIs
- 100% existing tests pass

### Qualitative

- Consistent behavior across all overlays
- Easier to add new overlay types
- Reduced cognitive load for developers
- Maintained accessibility standards
- No z-index conflicts
