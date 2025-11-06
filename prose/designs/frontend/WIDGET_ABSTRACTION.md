# Widget Abstraction Design

**Status**: In Progress
**Last Updated**: 2025-11-05
**Design Type**: Component System Architecture
**Related**: [WIDGET_THEME_UNIFICATION.md](./WIDGET_THEME_UNIFICATION.md), [COMPONENT_ORGANIZATION.md](./COMPONENT_ORGANIZATION.md)

## Overview

This design establishes a unified widget abstraction system that eliminates code duplication, standardizes dismissal behavior, and improves maintainability of overlay components (dialogs, modals, popovers, toasts, sheets). All widgets will be built as custom Svelte components without external UI library dependencies, providing full control over behavior, accessibility, and theming while eliminating redundant dependencies (bits-ui, svelte-sonner).

## Design Principles

### 1. Two-Layer Architecture

Widgets follow a simplified two-layer architecture:

**Layer 1: Base Widget Components** (NEW - Custom Implementation)

- Pure Svelte components built from scratch
- Handle all widget behavior: dismissal, focus management, keyboard navigation, ARIA
- Standardized structure (header, content, footer)
- Include close button, proper styling, theme integration
- Located in `src/lib/components/ui/`
- Provide consistent developer experience
- No external UI library dependencies
- Use design system tokens for styling (see WIDGET_THEME_UNIFICATION.md)

**Layer 2: Feature Components**

- Compose base widgets with domain-specific content
- Focus on business logic, not widget mechanics
- Remain simple and declarative

**Benefits of Custom Implementation**:

- Full control over behavior and styling
- No dependency on external UI libraries
- Reduced bundle size
- Easier to debug and maintain
- Direct Svelte patterns without abstraction layers
- Tailored specifically to project needs

### 2. Composition Over Configuration

Base widgets use Svelte 5 snippets for flexible composition:

```typescript
// Declarative composition pattern
<BaseDialog>
  {#snippet header()}
    <h2>Custom Title</h2>
  {/snippet}

  {#snippet content()}
    <p>Dialog content here</p>
  {/snippet}

  {#snippet footer()}
    <Button>Action</Button>
  {/snippet}
</BaseDialog>
```

Benefits:

- Maximum flexibility without prop explosion
- Type-safe content slots
- Easy to customize structure when needed
- Falls back to sensible defaults

### 3. Dismissal by Default

All widgets support dismissal through multiple methods, implemented natively:

**ESC Key Dismissal**:

- Implemented via `onkeydown` event handler on widget container
- Listens for `key === 'Escape'`
- Calls onOpenChange(false) callback
- Can be disabled via `closeOnEscape={false}` prop
- Default: enabled

**Backdrop/Outside Click Dismissal**:

- Implemented via click handler on backdrop element
- Uses event target comparison (`event.target === event.currentTarget`)
- Content container stops propagation (`event.stopPropagation()`)
- Calls onOpenChange(false) callback
- Can be disabled via `closeOnOutsideClick={false}` prop
- Default: enabled for dialogs/popovers, disabled for modals

**Close Button Dismissal**:

- X icon button in top-right of header
- Uses Button component with variant="ghost" size="icon"
- Always keyboard accessible (focusable, responds to Enter/Space)
- Can be hidden via `hideCloseButton={true}` prop
- Proper ARIA label: "Close dialog" / "Close popover"
- Default: visible

**onOpenChange Callback**:

- Required prop for all widgets
- Called with `false` when widget should close
- Parent component controls actual open/closed state
- Enables consistent state management pattern

### 4. Scoped vs Global Positioning

Widgets support two positioning modes:

**Global Positioning** (default):

- Uses `position: fixed` and portal rendering
- Overlays entire viewport
- For primary user actions (confirmation dialogs, settings)
- Z-index from centralized layer system

**Scoped Positioning** (opt-in):

- Uses `position: absolute` within parent container
- Overlays specific region (e.g., preview pane only)
- For contextual widgets (document info within preview)
- Inherited z-index or specified z-index

Pattern:

```typescript
// Global (default)
<BaseDialog>...</BaseDialog>

// Scoped to parent container
<BaseDialog scoped>...</BaseDialog>
```

## Widget Component Specifications

### BaseDialog Component

Fully-featured dialog with header, content, footer structure.

**Location**: `src/lib/components/ui/dialog.svelte`

**Structure**:

```
{#if open}
  <Teleport> (conditional, if not scoped)
    <div class="backdrop"> (handles outside clicks)
      <div class="dialog-container"> (handles ESC key)
        <div class="dialog-header">
          <h2>{title}</h2>
          <Button close> (X icon)
        </div>
        <div class="dialog-content">
          {@render content()}
        </div>
        {#if footer}
          <div class="dialog-footer">
            {@render footer()}
          </div>
        {/if}
      </div>
    </div>
  </Teleport>
{/if}
```

**Props Interface**:

```typescript
interface BaseDialogProps {
	// State management
	open: boolean;
	onOpenChange: (open: boolean) => void;

	// Dismissal behavior
	closeOnEscape?: boolean; // default: true
	closeOnOutsideClick?: boolean; // default: true
	hideCloseButton?: boolean; // default: false

	// Positioning
	scoped?: boolean; // default: false (uses portal)

	// Styling
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; // default: 'md'
	class?: string; // additional classes for container

	// Accessibility
	title: string; // required for aria-labelledby
	description?: string; // optional aria-describedby

	// Content slots (Svelte 5 snippets)
	header?: Snippet; // custom header content
	content?: Snippet; // main content (required)
	footer?: Snippet; // optional footer actions
}
```

**Size Definitions**:

- `sm`: max-w-sm (24rem / 384px)
- `md`: max-w-md (28rem / 448px) - default
- `lg`: max-w-lg (32rem / 512px)
- `xl`: max-w-xl (36rem / 576px)
- `full`: max-w-4xl (56rem / 896px)

**Default Behavior**:

- Renders close button in top-right of header
- ESC key closes dialog
- Backdrop click closes dialog
- Focus trapped within dialog
- Returns focus to trigger on close
- ARIA attributes automatically applied

**Implementation Details**:

- Portal rendering via Svelte's `<Teleport>` or manual document.body append (if not scoped)
- Backdrop: fixed inset-0 with semi-transparent bg-black/40
- Dialog container: fixed positioning, centered via transform
- ESC handler: `onkeydown={(e) => e.key === 'Escape' && closeOnEscape && onOpenChange(false)}`
- Outside click: backdrop onclick checks `e.target === e.currentTarget`
- Focus trap: Save activeElement on mount, restore on unmount, trap Tab key
- Close button: Button component with variant="ghost" size="icon", X icon from lucide-svelte
- Header layout: flex justify-between items-center
- Footer layout: flex justify-end gap-2
- All colors from design system tokens (see Theming section)
- ARIA: role="dialog", aria-modal="true", aria-labelledby, aria-describedby

### BasePopover Component

Lightweight popover attached to trigger element.

**Location**: `src/lib/components/ui/popover.svelte`

**Structure**:

```
{@render trigger()}
{#if open}
  <div class="popover-content"> (positioned via JS)
    {#if title}
      <div class="popover-header">
        <h3>{title}</h3>
        {#if showCloseButton}
          <Button close> (X icon)
        {/if}
      </div>
    {/if}
    <div class="popover-body">
      {@render content()}
    </div>
    {#if footer}
      <div class="popover-footer">
        {@render footer()}
      </div>
    {/if}
  </div>
{/if}
```

**Props Interface**:

```typescript
interface BasePopoverProps {
	// State management
	open?: boolean; // bindable
	onOpenChange?: (open: boolean) => void;

	// Dismissal behavior
	closeOnEscape?: boolean; // default: true
	closeOnOutsideClick?: boolean; // default: true
	showCloseButton?: boolean; // default: false (lightweight)

	// Positioning
	side?: 'top' | 'right' | 'bottom' | 'left'; // default: 'bottom'
	align?: 'start' | 'center' | 'end'; // default: 'center'
	sideOffset?: number; // default: 8

	// Styling
	width?: 'trigger' | 'content' | string; // default: 'content'
	class?: string;

	// Accessibility
	title?: string; // optional header title

	// Content slots
	trigger?: Snippet; // trigger element (required)
	header?: Snippet; // optional header
	content?: Snippet; // main content (required)
	footer?: Snippet; // optional footer
}
```

**Default Behavior**:

- No close button by default (lightweight feel)
- ESC key closes popover
- Clicking outside closes popover
- Positioned relative to trigger element
- No focus trap (allows interaction with page)

**Implementation Details**:

- Uses `position: absolute` with dynamic positioning
- Calculate position based on trigger element getBoundingClientRect()
- Respect side and align props for placement
- Use fixed positioning if trigger near viewport edge
- Click outside detection via document click listener
- ESC handler on popover container
- ARIA: role="dialog" or role="menu", aria-haspopup on trigger

**Use Cases**:

- LoginPopover: user authentication form
- Settings menus
- Contextual help
- Quick actions

### BaseModal Component

Modal dialog for important user decisions (alias for BaseDialog with specific defaults).

**Location**: `src/lib/components/ui/modal.svelte`

**Relationship**:

- Uses same implementation as BaseDialog
- Different semantic meaning (blocks interaction until resolved)
- Stricter default dismissal (no backdrop close)

**Props Interface**:

```typescript
interface BaseModalProps extends BaseDialogProps {
	// Overridden defaults
	closeOnOutsideClick?: boolean; // default: false (requires explicit action)
	variant?: 'default' | 'destructive' | 'warning'; // default: 'default'
}
```

**Variants**:

- `default`: Standard border and background
- `destructive`: Error/danger colors for header (delete confirmations)
- `warning`: Warning colors for header (caution actions)

**Use Cases**:

- Confirmation dialogs (destructive actions)
- Critical decisions requiring explicit choice
- Multi-step forms or wizards
- Login/authentication flows

### BaseSheet Component

Mobile-friendly slide-in panel (drawer).

**Location**: `src/lib/components/ui/sheet.svelte`

**Structure**:

```
{#if open}
  <div class="backdrop">
    <div class="sheet-container" class:left class:right class:top class:bottom>
      <div class="sheet-header">
        <h2>{title}</h2>
        <Button close> (X icon)
      </div>
      <div class="sheet-content">
        {@render content()}
      </div>
      {#if footer}
        <div class="sheet-footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
```

**Old Structure (removed)**:

```
Sheet.Root
├─ Sheet.Trigger (slot)
└─ Sheet.Content
   ├─ Header
   │  ├─ Title (slot)
   │  └─ Close Button
   ├─ Content (slot)
   └─ Footer (optional, slot)
```

**Props Interface**:

```typescript
interface BaseSheetProps {
	// State management
	open: boolean;
	onOpenChange: (open: boolean) => void;

	// Dismissal behavior
	closeOnEscape?: boolean; // default: true
	closeOnOutsideClick?: boolean; // default: true
	hideCloseButton?: boolean; // default: false

	// Positioning
	side?: 'top' | 'right' | 'bottom' | 'left'; // default: 'right'

	// Styling
	class?: string;

	// Accessibility
	title: string;
	description?: string;

	// Content slots
	trigger?: Snippet;
	header?: Snippet;
	content?: Snippet;
	footer?: Snippet;
}
```

**Implementation Details**:

- Fixed positioning with slide-in animations
- Different positioning classes based on side prop
- Transition: `transition-transform duration-300 ease-in-out`
- Initial transform based on side (translateX/Y -100%)
- ESC and backdrop click handling like dialog
- ARIA: role="dialog", aria-modal="true"

**Mobile Considerations**:

- Responsive side prop: change to "bottom" below 768px breakpoint
- Touch events for swipe dismissal (optional enhancement)
- Safe area insets for mobile devices (env(safe-area-inset-\*))

**Use Cases**:

- Mobile navigation (Sidebar component)
- Mobile settings panels
- Contextual actions on mobile

### Toast Component

**Complete Replacement**: Remove svelte-sonner, build custom toast system

**Location**: `src/lib/components/ui/toast.svelte`

**Structure**:

```
<div class="toast-container" class:top-right class:bottom-right etc>
  {#each $toasts as toast (toast.id)}
    <div class="toast" class:success class:error class:info class:warning
         transition:fly={{ y: -20, duration: 200 }}>
      <div class="toast-icon">{getIcon(toast.type)}</div>
      <div class="toast-content">
        {#if toast.title}
          <div class="toast-title">{toast.title}</div>
        {/if}
        <div class="toast-message">{toast.message}</div>
      </div>
      {#if toast.dismissible}
        <Button close onclick={() => dismissToast(toast.id)}>
          <X size={16} />
        </Button>
      {/if}
    </div>
  {/each}
</div>
```

**Props Interface**:

```typescript
interface ToastProps {
	position?:
		| 'top-left'
		| 'top-center'
		| 'top-right'
		| 'bottom-left'
		| 'bottom-center'
		| 'bottom-right';
	duration?: number; // default: 4000ms
	dismissible?: boolean; // default: true
	maxToasts?: number; // default: 3
}
```

**Toast Store**:

```typescript
// src/lib/stores/toast.ts
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  duration?: number;
  dismissible?: boolean;
}

export const toasts = writable<Toast[]>([]);

export const toast = {
  success: (message: string, options?) => {...},
  error: (message: string, options?) => {...},
  info: (message: string, options?) => {...},
  warning: (message: string, options?) => {...},
  dismiss: (id: string) => {...},
};
```

**Implementation Details**:

- Fixed positioning based on position prop
- Stack toasts vertically with consistent spacing
- Auto-dismiss with configurable duration
- Animate in/out using Svelte transitions (fly)
- Icons from lucide-svelte (CheckCircle, XCircle, Info, AlertTriangle)
- Theme-aware colors from design system tokens
- Z-index from layer system (z-toast: 1600)
- ARIA: role="status" for non-dismissible, role="alert" for errors
- Limit maximum visible toasts (queue additional)

**Use Cases**:

- Success notifications (save, delete, etc.)
- Error messages (network failures, validation)
- Info messages (tips, updates)
- Warning messages (unsaved changes, deprecations)

## Dismissal Behavior System

### Unified Dismissal Patterns

All widgets implement three dismissal methods with custom Svelte code:

**1. ESC Key Dismissal**

- Implemented via onkeydown event handler
- Handler on dialog/modal/sheet container element
- Logic: `if (e.key === 'Escape' && closeOnEscape) onOpenChange(false)`
- Can be disabled via `closeOnEscape={false}` prop
- Always enabled by default for consistency

**2. Backdrop/Outside Click Dismissal**

- Implemented via click handler on backdrop div
- Logic: `if (e.target === e.currentTarget) onOpenChange(false)`
- Container calls `e.stopPropagation()` to prevent backdrop click
- Can be disabled via `closeOnOutsideClick={false}` prop
- Modal variant disables by default (requires explicit action)
- Dialog and Popover variants enable by default

**3. Close Button Dismissal**

- X icon button rendered in top-right of header
- Uses Button component: `<Button variant="ghost" size="icon" onclick={handleClose}>`
- Can be hidden via `hideCloseButton={true}` prop
- Always accessible via keyboard (Button is focusable)
- Consistent positioning across all widget types
- ARIA label: "Close dialog" / "Close modal" / etc.

### Focus Management

**Custom Implementation**:

- Save document.activeElement on mount (`let previousFocus = $state<HTMLElement>()`)
- Restore focus on unmount (`$effect(() => { return () => previousFocus?.focus() })`)
- Focus trap using Tab key interception
- Query focusable elements: `querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')`
- Tab cycles through focusable elements within widget
- Shift+Tab cycles backward
- Focus returned to trigger element on close
- First focusable element focused on open

**Base Component Additions**:

- Close button always keyboard accessible
- Footer action buttons in logical tab order (left to right)
- Header title focusable if needed for screen readers
- Proper ARIA relationships (labelledby, describedby)

### Keyboard Navigation

**Standard Keys**:

- `ESC`: Close widget
- `Tab`: Next focusable element
- `Shift+Tab`: Previous focusable element
- `Enter`: Activate focused button/link
- `Space`: Activate focused button/link

**Widget-Specific**:

- Popovers: Arrow keys may navigate list items if applicable
- Sheets: Swipe gestures on mobile (touch devices)

## Z-Index Management System

### Centralized Layer Definitions

**Location**: Design system tokens in `src/app.css`

```css
/* Widget Layer System */
:root {
	--z-base: 0;
	--z-ui-element: 10; /* UI elements requiring local stacking */
	--z-canvas-overlay: 30; /* Tool overlays scoped to canvas areas */
	--z-canvas-ui: 40; /* UI elements within canvas overlays */
	--z-dropdown: 1000;
	--z-sticky: 1100;
	--z-banner: 1200;
	--z-popover: 1300; /* Lightweight contextual UI */
	--z-overlay: 1400; /* Dialog/modal backdrops */
	--z-modal: 1500; /* Dialog/modal/sheet content */
	--z-toast: 1600;
	--z-tooltip: 1700;
}
```

**Layer Hierarchy** (lowest to highest):

1. **base** (0): Normal document flow
2. **ui-element** (10): UI elements requiring local stacking within components
3. **canvas-overlay** (30): Tool overlays scoped to canvas/preview areas
4. **canvas-ui** (40): UI elements within canvas overlays (banners, instructions)
5. **dropdown** (1000): Dropdown menus, select options
6. **sticky** (1100): Sticky headers, pinned elements
7. **banner** (1200): Notification banners
8. **popover** (1300): Popover content - lightweight contextual UI
9. **overlay** (1400): Dialog/modal backdrops - demand user attention
10. **modal** (1500): Dialog/modal/sheet content - primary user actions
11. **toast** (1600): Toast notifications
12. **tooltip** (1700): Tooltips (highest priority)

**Usage in Base Components**:

```typescript
// BaseDialog backdrop
class="z-overlay"  // 1400

// BaseDialog content
class="z-modal"    // 1500

// BasePopover content
class="z-popover"  // 1300

// BaseSheet
class="z-overlay"  // backdrop: 1400
class="z-modal"    // content: 1500
```

### Overlay Coordination System

**Centralized Management** (`src/lib/stores/overlay.svelte.ts`):

All overlay components (dialogs, popovers, sheets) register with a centralized overlay store that:
- Tracks all open overlays by type and priority
- Automatically closes lower-priority overlays when higher-priority ones open
- Prevents occlusion issues (e.g., popover blocking dialog)
- Provides consistent ESC key handling across all overlays

**Priority-Based Auto-Close**:

When a dialog/modal opens (priority 1500), all popovers (priority 1300) automatically close. This ensures:
- Primary user actions always have user's attention
- No visual occlusion between overlay types
- Clean, predictable UX

**Example Scenarios**:

```
Scenario 1: Dialog opens while popover is open
1. User opens login popover from sidebar (z-popover: 1300)
2. User clicks "New Document" button
3. Overlay store detects dialog opening (priority 1500)
4. Login popover auto-closes (priority 1300 < 1500)
5. Dialog displays without occlusion

Scenario 2: Multiple dialogs
- First dialog: z-overlay (1400), z-modal (1500)
- Second dialog: z-overlay (1400), z-modal (1500)
- Both backdrops stack (darker), dialogs stack by DOM order

Scenario 3: Toast during dialog
- Dialog backdrop: z-overlay (1400)
- Dialog content: z-modal (1500)
- Toast: z-toast (1600) - appears above, never auto-closed
```

### Scoped Positioning and Z-Index

**Global Widgets** (default):

- Use z-index from layer system
- Position fixed, full viewport coverage

**Scoped Widgets**:

- Use `position: absolute` within parent
- Inherit z-index from parent stacking context
- Or use explicit z-index if provided via prop
- Example: DocumentInfoDialog scoped to preview pane

## Theming Integration

### Design Token Usage

All base components follow WIDGET_THEME_UNIFICATION.md standards:

**Surfaces**:

- Dialog/Modal background: `bg-surface-elevated`
- Dialog/Modal border: `border-border`
- Backdrop: `bg-black/40` (semi-transparent overlay)
- Popover background: `bg-surface-elevated`

**Text Hierarchy**:

- Header title: `text-foreground font-semibold text-lg`
- Body text: `text-foreground text-base`
- Helper text: `text-muted-foreground text-sm`
- Footer buttons: Standard button variants

**Interactive Elements**:

- Close button: `Button variant="ghost" size="icon"`
- Footer buttons: Standard button variants (default, outline, destructive)
- Focus rings: Automatic from button component

**Spacing**:

- Dialog padding: `p-6` (1.5rem)
- Header spacing: `mb-4` (1rem below header)
- Content sections: `space-y-4` (1rem between sections)
- Footer margin: `mt-6` (1.5rem above footer)
- Popover padding: `p-4` (1rem, more compact)

**Shadows**:

- Dialog/Modal: `shadow-lg`
- Popover: `shadow-md`
- Toast: `shadow-md`

### Dark Mode Support

**Automatic via Design System**:

- All tokens have light/dark variants in `src/app.css`
- Component uses tokens exclusively
- Dark mode detected via `.dark` class on `<html>`
- Theme switching propagates instantly

**No Component Logic Needed**:

- Base components never check theme
- No conditional styling based on theme
- Toast component detects theme via `.dark` class on html element

## Migration Approach

This design requires a complete replacement of current widget system to eliminate external dependencies. See `prose/plans/widget-abstraction-implementation.md` for detailed phased implementation plan.

### High-Level Migration Steps

**Phase 1: Build Custom Widget Primitives**

- Implement Dialog component (replaces bits-ui Dialog)
- Implement Popover component (replaces bits-ui Popover)
- Implement Sheet component (replaces bits-ui Dialog for sheets)
- Implement Toast system (replaces svelte-sonner)
- Add z-index tokens to design system

**Phase 2: Migrate Existing Widgets**

- Update DocumentInfoDialog to use new Dialog
- Update ShareModal to use new Dialog
- Update ImportFileDialog to use new Dialog
- Update LoginPopover to use new Popover
- Update Sidebar to use new Sheet
- Replace toast usage with new toast store

**Phase 3: Remove Old Dependencies**

- Remove all bits-ui imports from ui/ components
- Remove svelte-sonner imports
- Uninstall bits-ui from package.json
- Uninstall svelte-sonner from package.json
- Update COMPONENT_ORGANIZATION.md documentation

**Phase 4: Testing and Refinement**

- Test all widgets for accessibility (keyboard nav, ARIA, focus management)
- Test dismissal behavior (ESC, outside click, close button)
- Verify theme compatibility (light/dark modes)
- Check mobile responsiveness
- Performance testing (bundle size reduction)

## Benefits

### For Developers

**Reduced Boilerplate**:

- No manual backdrop click handling
- No manual ESC key handling
- No manual close button implementation
- No manual ARIA attributes
- No manual focus management

**Faster Development**:

- New dialogs created in minutes, not hours
- Copy existing pattern, customize content
- Automatic accessibility compliance
- Consistent behavior without thinking

**Easier Maintenance**:

- Fix bugs once in base component, all widgets benefit
- Add features once, propagate everywhere
- No searching across files for dialog patterns

### For Users

**Consistent Experience**:

- All dialogs behave identically
- Same close patterns everywhere
- Predictable keyboard navigation
- Familiar interaction patterns

**Better Accessibility**:

- Focus management always correct
- ARIA attributes always present
- Keyboard navigation always works
- Screen reader support guaranteed

**Improved Performance**:

- Proper focus trapping (no accidental background interaction)
- Reduced bundle size (no external UI libraries)
- No layout thrashing from manual positioning
- Smaller dependency tree

### For Project

**Reduced Dependencies**:

- Remove bits-ui (~50KB)
- Remove svelte-sonner (~20KB)
- Smaller bundle size overall
- Fewer security vulnerabilities to monitor
- Less dependency churn and breaking changes

**Maintainability**:

- Single source of truth for widget behavior
- Easy to update all widgets at once
- Clear patterns for future development
- Self-documenting via base components

**Quality**:

- Accessibility guaranteed by bits-ui + base components
- Consistent theming via design tokens
- Battle-tested interaction patterns
- Reduced bug surface area

**Scalability**:

- Add new widget types easily
- Extend base components without modification
- Compose complex interactions from simple pieces
- Clear upgrade path for future improvements

## Testing Strategy

### Base Component Tests

Each base component requires comprehensive tests:

**Rendering Tests**:

- Renders with required props
- Renders content snippets correctly
- Applies size classes correctly
- Applies custom classes correctly

**Dismissal Tests**:

- ESC key closes widget
- Backdrop click closes widget
- Close button closes widget
- onOpenChange called with false
- Dismissal can be disabled via props

**Accessibility Tests**:

- ARIA attributes present and correct
- Title properly linked via aria-labelledby
- Description linked via aria-describedby (if provided)
- Focus trapped within widget when open
- Focus returned to trigger on close
- Close button keyboard accessible

**Positioning Tests**:

- Global positioning uses portal (default)
- Scoped positioning stays in container
- Z-index applied correctly
- Size variants render correctly

**Theme Tests**:

- Uses design system tokens (no hardcoded colors)
- Renders correctly in light theme
- Renders correctly in dark theme

### Migration Tests

For each migrated component:

**Behavior Parity**:

- New implementation behaves identically to old
- All interaction patterns preserved
- Props interface compatible or migration documented

**Accessibility Improvement**:

- ESC works if previously missing
- Focus trap works (test tab key)
- ARIA attributes present

**Visual Parity**:

- Styling matches original (colors, spacing, typography)
- Layout identical
- Responsive behavior maintained

## Future Enhancements

### Potential Additions

**Animation System**:

- Standardized enter/exit animations
- Configurable animation duration
- Respects prefers-reduced-motion
- Smooth transitions for open/close

**Nested Dialog Support**:

- Explicit support for dialogs within dialogs
- Proper z-index stacking
- Focus management across layers
- ESC closes only top dialog

**Advanced Positioning**:

- Collision detection for popovers
- Flip positioning if overflow
- Automatic repositioning on scroll
- Smart placement for small viewports

**Confirmation Dialog Helper**:

- High-level API for common patterns
- `confirm()` function returns promise
- Pre-styled for common scenarios (delete, save, cancel)

**Toast Action Buttons**:

- Action buttons within toast
- Undo pattern for destructive actions
- Link to details or help

### Non-Goals

These are explicitly out of scope for this design:

**Custom Positioning Logic**:

- Complex tooltip positioning
- Advanced collision detection
- Custom placement algorithms
- These can be added later if needed

**Complex Animation Choreography**:

- Multi-stage animations
- Coordinated transitions
- Staggered reveals
- Keep animations simple and fast

**Global State Management**:

- Centralized dialog manager
- Imperative dialog API (`showDialog()`)
- Queue management for multiple dialogs
- Keep declarative for simplicity

**Form Integration**:

- Built-in form validation
- Form state management
- Submit handling
- Forms compose with base components, not integrated

## References

- [WIDGET_THEME_UNIFICATION.md](./WIDGET_THEME_UNIFICATION.md) - Theming standards
- [COMPONENT_ORGANIZATION.md](./COMPONENT_ORGANIZATION.md) - Component structure
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Application architecture
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design tokens and system
- [bits-ui Documentation](https://bits-ui.com) - Headless UI primitives
- [WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards
