# Z-Index Layout Strategy

## Overview

This design defines the complete z-index layering strategy for Tongue to Quill, ensuring proper visual stacking of all UI components. The strategy addresses a critical issue where scoped utility modals (About, Terms, Privacy) were incorrectly positioned above navigation popovers (kebab menu), preventing users from accessing navigation while viewing utility content.

## Problem Statement

**Current Issue:**

- Scoped utility modals use modal z-index layers (1400/1500)
- Kebab menu dropdown uses popover z-index (1100)
- Result: Utility modals render above kebab menu, blocking navigation
- User experience: Cannot access menu while viewing About/Terms/Privacy pages

**Desired Behavior:**

- Kebab menu should remain accessible above all content, including utility modals
- Navigation elements should never be blocked by informational content
- Scoped modals (within preview pane) should use lower z-index than global navigation

## Root Cause Analysis

The issue stems from **two conflicting positioning patterns**:

### Pattern 1: Global Fixed Positioning (Kebab Menu)

- Component: `BasePopover` (kebab menu dropdown)
- Positioning: `position: fixed`
- Z-index: `var(--z-popover)` = 1100
- Stacking context: Document root (body)
- Behavior: Positioned relative to viewport

### Pattern 2: Scoped Absolute Positioning (Utility Modals)

- Components: `AboutModal`, `TermsModal`, `PrivacyModal`
- Positioning: `position: absolute` (when `scoped=true`)
- Z-index: `var(--z-modal-backdrop)` = 1400, `var(--z-modal-content)` = 1500
- Stacking context: Preview pane container
- Behavior: Positioned relative to containing element

### Why Higher Z-Index Doesn't Work

Even though utility modals have higher z-index values (1400/1500) than the kebab menu (1100), they can still render below it due to:

1. **Stacking Context Isolation**: Absolute positioning creates a new stacking context within the preview pane
2. **DOM Order**: If the preview pane is before the kebab menu in DOM order, the stacking context comparison may favor the kebab menu
3. **Parent Container Z-Index**: The preview pane container's own z-index affects its children's effective stacking

**Solution**: Create a dedicated z-index layer for scoped utility content that sits intentionally BELOW navigation popovers.

## Design Solution

### Updated Z-Index Hierarchy

```css
:root {
	/* Group 1: Canvas - UI and overlays within canvas/preview area */
	--z-canvas-ui: 10; /* UI elements within canvas (sidebar) */
	--z-canvas-overlay: 20; /* Tool overlays scoped to canvas (ruler) */

	/* Group 2: Sidebar specific z-indices */
	--z-content: 0; /* Main content base layer */
	--z-sidebar-backdrop: 40; /* Backdrop overlay when sidebar is expanded */
	--z-sidebar: 50; /* Sidebar overlay */

	/* Group 3: Minor Widgets - Lightweight overlays */
	--z-dropdown: 1000; /* Dropdown menus and select options */

	/* Group 4: Scoped Content - Informational overlays within containers (NEW) */
	--z-scoped-backdrop: 1050; /* Scoped modal backdrops (utility pages) */
	--z-scoped-content: 1075; /* Scoped modal content (utility pages) */

	/* Group 5: Navigation Overlays - Must be above scoped content */
	--z-popover: 1100; /* Popovers - navigation and contextual UI */
	--z-toast: 1200; /* Toast notifications */
	--z-banner: 1300; /* Notification banners */

	/* Group 6: Modals - Full attention overlays */
	--z-modal-backdrop: 1400; /* Global modal backdrops */
	--z-modal-content: 1500; /* Global modal content */
}
```

### Layer Hierarchy (Lowest to Highest)

| Layer                | Z-Index | Components              | Positioning | Use Case                               |
| -------------------- | ------- | ----------------------- | ----------- | -------------------------------------- |
| **Canvas UI**        | 10      | Sidebar (desktop)       | `relative`  | Internal canvas UI                     |
| **Canvas Overlay**   | 20      | Ruler tool              | `absolute`  | Canvas-scoped tools                    |
| **Content**          | 0       | Main content            | `relative`  | Base content layer                     |
| **Sidebar Backdrop** | 40      | Mobile backdrop         | `fixed`     | Mobile sidebar overlay                 |
| **Sidebar**          | 50      | Sidebar (mobile)        | `fixed`     | Mobile sidebar                         |
| **Dropdown**         | 1000    | Select dropdowns        | `absolute`  | Form dropdowns                         |
| **Scoped Backdrop**  | 1050    | Utility modal backdrops | `absolute`  | **NEW: Scoped informational overlays** |
| **Scoped Content**   | 1075    | Utility modal content   | `absolute`  | **NEW: Scoped informational content**  |
| **Popover**          | 1100    | Kebab menu, tooltips    | `fixed`     | **Navigation & contextual UI**         |
| **Toast**            | 1200    | Toast notifications     | `fixed`     | Non-blocking messages                  |
| **Banner**           | 1300    | Notification banners    | `fixed`     | Full-width notices                     |
| **Modal Backdrop**   | 1400    | Global modal backdrops  | `fixed`     | Critical blocking overlays             |
| **Modal Content**    | 1500    | Global modal content    | `fixed`     | Critical modal content                 |

### Key Design Decisions

**1. New Scoped Content Layer (1050-1075)**

- Purpose: Informational modals that should not block navigation
- Positioning: `absolute` within container (preview pane)
- Below popovers: Ensures kebab menu remains accessible
- Use cases: About, Terms, Privacy pages

**2. Popover Above Scoped Content (1100)**

- Purpose: Navigation must always be accessible
- Positioning: `fixed` at document root
- Rationale: Users need to navigate away from utility pages
- Use cases: Kebab menu, user profile menu, contextual menus

**3. Global Modals Highest (1400-1500)**

- Purpose: Critical actions that block all interaction
- Positioning: `fixed` at document root
- Use cases: Delete confirmations, share modal, document info

## Implementation Strategy

### 1. Update CSS Variables

**File:** `src/app.css`

Add new z-index layers between dropdowns and popovers:

```css
:root {
	/* ... existing layers ... */

	/* Group 3: Minor Widgets */
	--z-dropdown: 1000;

	/* NEW: Group 4: Scoped Content - Informational overlays within containers */
	--z-scoped-backdrop: 1050; /* Scoped modal backdrops (utility pages) */
	--z-scoped-content: 1075; /* Scoped modal content (utility pages) */

	/* Group 5: Navigation Overlays - Must be above scoped content */
	--z-popover: 1100;
	--z-toast: 1200;
	--z-banner: 1300;

	/* ... rest of layers ... */
}
```

### 2. Register Tailwind Utilities

**File:** `src/app.css` (Tailwind theme extension section)

Add Tailwind utility classes for new z-index layers:

```css
@layer base {
	@theme {
		/* ... existing z-index utilities ... */

		/* NEW: Scoped content layers */
		--z-scoped-backdrop: 1050;
		--z-scoped-content: 1075;
	}
}
```

### 3. Update Base Dialog Component

**File:** `src/lib/components/ui/base-dialog.svelte`

Modify the Dialog component to use scoped z-index when `scoped=true`:

```svelte
<!-- Backdrop -->
<div
  class={cn(
    scoped ? 'z-scoped-backdrop' : 'z-modal-backdrop',
    'inset-0 bg-black/40',
    scoped ? 'absolute' : 'fixed'
  )}
  onclick={handleBackdropClick}
  role="presentation"
></div>

<!-- Dialog Container -->
<div
  class={cn(
    scoped ? 'z-scoped-content' : 'z-modal-content',
    'bg-surface-elevated shadow-lg',
    // ... rest of classes
  )}
  role="dialog"
  aria-modal="true"
  // ... rest of props
>
  <!-- Dialog content -->
</div>
```

### 4. Verify Utility Modal Configuration

**Files to verify:**

- `src/lib/components/AboutModal.svelte`
- `src/lib/components/TermsModal.svelte`
- `src/lib/components/PrivacyModal.svelte`

Ensure all utility modals use `scoped=true`:

```svelte
<Dialog {open} {onOpenChange} title="About Us" scoped size="fullscreen">
	<!-- Modal content -->
</Dialog>
```

## Testing Strategy

### Visual Testing

1. **Open kebab menu dropdown**
   - Verify popover appears with z-index 1100

2. **Click "About Us" from kebab menu**
   - Utility modal should open with scoped z-index (1050/1075)
   - Kebab menu should remain visible and clickable above modal

3. **Click "Terms" or "Privacy" from kebab menu**
   - Same behavior as About Us
   - Menu always accessible

4. **Open global modal (e.g., Share)**
   - Modal should appear above kebab menu
   - Z-index: 1400/1500 (higher than popover 1100)

### Interactive Testing

1. **Navigation from utility page**
   - Open About page
   - Click kebab menu while About is open
   - Select different menu item (Terms, Privacy, etc.)
   - Previous modal should close, new one opens
   - Menu remains functional

2. **Close interactions**
   - Click backdrop → modal closes
   - Press ESC → modal closes
   - Click X button → modal closes
   - Click kebab menu → menu stays open

3. **Layering scenarios**
   - Utility modal + kebab menu = menu above
   - Global modal + kebab menu = modal above
   - Toast + utility modal = toast above all

### Browser Testing

Test across browsers and devices:

- Chrome (desktop & mobile)
- Firefox (desktop & mobile)
- Safari (desktop & mobile)
- Edge (desktop)

Verify z-index stacking in each browser's dev tools.

## Migration Checklist

- [ ] Update `src/app.css` with new z-index variables
- [ ] Register new Tailwind utilities for scoped layers
- [ ] Update `base-dialog.svelte` to conditionally apply scoped z-index
- [ ] Verify `AboutModal.svelte` uses `scoped=true`
- [ ] Verify `TermsModal.svelte` uses `scoped=true`
- [ ] Verify `PrivacyModal.svelte` uses `scoped=true`
- [ ] Test kebab menu above utility modals
- [ ] Test global modals above kebab menu
- [ ] Test all close interactions
- [ ] Update WIDGET_ABSTRACTION.md with new z-index layers
- [ ] Document new layer in design system

## Future Considerations

### Potential Enhancements

1. **Scoped Modal Variants**
   - Different scoped z-index levels for different content types
   - Example: `--z-scoped-info`, `--z-scoped-feature`

2. **Z-Index Debugging Tool**
   - Dev mode overlay showing current z-index stack
   - Highlight stacking contexts and layer boundaries

3. **Automated Testing**
   - Visual regression tests for z-index ordering
   - Playwright tests for layering scenarios

### Non-Goals

- **Dynamic z-index calculation**: Keep values static and predictable
- **Per-component z-index props**: Maintain centralized layer system
- **Z-index stacking context detection**: Components should not query z-index

## References

- **Design System**: `prose/designs/frontend/DESIGN_SYSTEM.md`
- **Widget Abstraction**: `prose/designs/frontend/WIDGET_ABSTRACTION.md`
- **Sidebar Design**: `prose/designs/frontend/SIDEBAR.md`
- **CSS Stacking Context**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)

## Appendix: Z-Index Decision Matrix

| Scenario           | Component A             | Component B        | Expected Behavior     |
| ------------------ | ----------------------- | ------------------ | --------------------- |
| Utility modal open | About Modal (1050/1075) | Kebab Menu (1100)  | Menu above modal ✓    |
| Global modal open  | Share Modal (1400/1500) | Kebab Menu (1100)  | Modal above menu ✓    |
| Dropdown open      | Select Dropdown (1000)  | Kebab Menu (1100)  | Menu above dropdown ✓ |
| Toast notification | Toast (1200)            | About Modal (1075) | Toast above modal ✓   |
| Ruler tool active  | Ruler (20)              | About Modal (1075) | Modal above ruler ✓   |
| Mobile sidebar     | Sidebar (50)            | Kebab Menu (1100)  | Menu above sidebar ✓  |

---

**Last Updated**: 2025-11-08
**Status**: Draft → Ready for Implementation
**Owner**: Frontend Team
