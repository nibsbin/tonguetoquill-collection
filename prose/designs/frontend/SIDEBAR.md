# Sidebar Design

## Overview

This document describes the redesigned sidebar component for Tonguetoquill, inspired by the Claude AI sidebar design patterns while maintaining our existing functionality, color palette, and transition timings.

## Design Inspiration

The new sidebar design is inspired by `prose/claude-theme/claude-sidebar.html`, incorporating:

- Modern proportions and spacing
- Smooth interactive behaviors
- Icon hover effects and transitions
- Hierarchical information architecture
- Better visual feedback on interactions

## Core Principles

1. **Maintain Existing Functionality**: All current features (document management, settings, user profile) remain intact
2. **Keep Color Palette**: Continue using our zinc-based dark theme colors
3. **Preserve Transition Timings**: Maintain our 300ms transition duration
4. **Enhance Proportions**: Adopt Claude's spacing and sizing patterns
5. **Improve Behaviors**: Add subtle hover effects and visual feedback

## Layout & Proportions

### Positioning Strategy

**Responsive Hybrid Architecture**:

The sidebar uses a **responsive positioning strategy** that adapts behavior based on viewport size:

**Desktop Mode (≥ 768px)**:

- **Positioning**: `position: relative` - Sidebar is part of normal document flow
- **Layout behavior**: Sidebar pushes content (traditional sidebar pattern)
- **Collapsed State (48px)**: Content area has full remaining width
- **Expanded State (288px)**: Content area shrinks by 240px to accommodate sidebar
- **No backdrop**: Content remains fully interactive

**Mobile Mode (< 768px)**:

- **Positioning**: `position: fixed` - Sidebar overlays content
- **Layout behavior**: Sidebar does not affect content width
- **Collapsed State (48px)**: Content has 48px left margin to avoid sidebar overlap
- **Expanded State (288px)**: Content still has 48px margin; additional 240px overlays content
- **Backdrop**: Semi-transparent overlay dims content and provides click-to-dismiss

### Dimensions

**Width Values**:

- **Expanded width**: 18rem (288px / w-72)
- **Collapsed width**: 3rem (48px / w-12)
- **Transition**: 300ms duration with cubic-bezier(0.165, 0.85, 0.45, 1) easing

**Layout Footprint by Mode**:

- **Desktop (≥ 768px)**:
  - Collapsed: 48px layout space
  - Expanded: 288px layout space
  - Main content has no left margin (flows next to sidebar)

- **Mobile (< 768px)**:
  - Collapsed: 48px layout space (fixed positioning, content has 48px margin)
  - Expanded: 48px layout space (overlay mode, additional 240px overlays content)
  - Main content maintains constant 48px left margin

**Implementation Status**: ✅ Responsive hybrid pattern (November 2025)

**Note**: The sidebar uses responsive CSS to adapt positioning strategy based on viewport width (768px breakpoint).

### Z-Index Layering

**Mobile Mode (< 768px) - Overlay Pattern**:

Layer stack (from bottom to top):

1. **Main Content**: `z-index: 0` (base layer)
2. **Backdrop Overlay**: `z-index: 40` (appears when sidebar is expanded)
3. **Sidebar**: `z-index: 50` (always above backdrop and content)

**Desktop Mode (≥ 768px) - Flow Pattern**:

- **Sidebar**: `z-index: 10` (canvas-ui layer, for internal UI elements only)
- **Main Content**: No z-index (normal document flow)
- **No backdrop**: Not used in desktop mode

### Backdrop Overlay

**Mobile Only (< 768px)**:

**Purpose**: When the sidebar is expanded in mobile mode, a semi-transparent backdrop overlays the main content to:

1. Visually indicate the sidebar is in an "active" overlay state
2. Provide a click target to collapse the sidebar
3. Improve sidebar content readability by dimming background content

**Backdrop Behavior**:

- **Desktop Mode**: Backdrop never renders (not applicable)
- **Mobile Collapsed**: Backdrop not rendered (display: none or removed from DOM)
- **Mobile Expanded**: Backdrop fades in over content area
- **Interaction**: Clicking backdrop collapses sidebar (mobile only)
- **Animation**: Fade in/out over 200ms (faster than sidebar width transition)

**Backdrop Styling**:

```css
.sidebar-backdrop {
	position: fixed;
	top: 0;
	left: 48px; /* Start after collapsed sidebar width */
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.4); /* Semi-transparent black */
	z-index: var(--z-sidebar-backdrop, 40);
	transition: opacity 200ms cubic-bezier(0.165, 0.85, 0.45, 1);
}

/* Fade in when expanded */
.sidebar-backdrop.visible {
	opacity: 1;
}

/* Hidden state */
.sidebar-backdrop.hidden {
	opacity: 0;
	pointer-events: none;
}
```

**Alternative Backdrop Colors**:

- **Dark theme**: `rgba(0, 0, 0, 0.4)` - Black with 40% opacity
- **Light theme**: `rgba(0, 0, 0, 0.2)` - Black with 20% opacity (less aggressive)
- **Themed**: `rgba(var(--color-background-rgb), 0.8)` - Uses theme background color

**Accessibility Considerations**:

- Backdrop should not trap focus (sidebar itself handles focus management)
- Escape key should also collapse sidebar (in addition to backdrop click)
- ARIA attributes on sidebar: `aria-expanded="true/false"`

### Structure

```
┌─────────────────────────────┐
│  Toggle Button              │  h-12 (48px) - Header
│  + App Branding             │
├─────────────────────────────┤
│  Primary Actions            │
│  (New Document button)      │  h-9 (36px) per action
├─────────────────────────────┤
│  "Recents" Section Header   │  text-xs - Visual hierarchy
├─────────────────────────────┤
│                             │
│  Recent Items List          │  h-8 (32px) per item
│  (Scrollable with gradient) │
│                             │
│  ↓ Scrollable Area ↓        │
├─────────────────────────────┤
│  User Profile               │  h-9 (36px) + padding
│  Settings                   │
└─────────────────────────────┘
```

## Visual Hierarchy

### Spacing

**Padding & Margins** (based on Claude patterns):

- Container padding: `px-2` (8px horizontal)
- Item gaps: `gap-px` or `gap-1` (1px or 4px between items)
- Section padding: `p-2` (8px all around)
- Inner content padding: `px-4 py-2` for buttons

**Item Heights**:

- Primary actions (New File): `h-9` (36px)
- Navigation items: `h-9` (36px)
- Recent items: `h-8` (32px)
- User/Settings: `h-9` (36px)

### Typography

**Text Sizes**:

- App title: `text-sm` font-medium (14px)
- Navigation items: `text-sm` (14px)
- Recent items: `text-xs` (12px)
- Section headers: `text-xs` text-text-300 (muted)

**Font Weights**:

- Headings/Primary: font-medium (500)
- Regular items: font-normal (400)
- Active items: font-medium (500)

## Color Scheme

Uses semantic CSS custom properties defined in the theme system (see DESIGN_SYSTEM.md):

### Background Colors

- **Sidebar background**: `bg-background` → CSS var(--color-background)
- **Hover state**: `hover:bg-accent` → CSS var(--color-accent)
- **Active/Selected**: `bg-accent` → CSS var(--color-accent)
- **Border**: `border-border` → CSS var(--color-border)

### Text Colors

- **Primary text**: `text-foreground` → CSS var(--color-foreground)
- **Secondary text**: `text-muted-foreground` → CSS var(--color-muted-foreground)
- **Hover text**: `hover:text-foreground` → CSS var(--color-foreground)

### Accent Colors

- **Destructive actions**: `text-destructive` → CSS var(--color-destructive)
- **Destructive hover**: `hover:bg-destructive` → CSS var(--color-destructive)

**Note**: All color references use semantic tokens from the theme system, enabling both light and dark mode support.

## Interactive Behaviors

### Button States

**Ghost Buttons** (most sidebar items):

- **Default**: Transparent background, muted text color
- **Hover**: Semi-transparent background (bg-400), brighter text
- **Press**: Subtle scale-down effect (98.5% scale)
- **Active/Selected**: Persistent background color, no scale on press
- **Transition**: 300ms with custom easing curve

**Primary Action Button** (New File/Chat):

- **Default**: Branded accent background, white text, rounded icon container with shadow
- **Hover**: Icon rotates slightly and scales up with enhanced shadow
- **Press**: Playful bounce effect with rotation
- **Visual**: Distinctive from other buttons through color and iconography

### Icon Animations

**Toggle/Navigation Icons**:

- **Dual-icon pattern**: Two icon states overlay each other
- **Default state**: Primary icon visible at full scale and opacity
- **Hover state**: Primary icon shrinks and fades out, secondary icon scales up and fades in
- **Transition**: Smooth crossfade between states

**Action Icons**:

- **Hover effects**: Subtle transforms specific to each icon's semantic meaning
  - Chat icons: Horizontal translation suggesting conversation flow
  - Project/stack icons: Vertical layering effect with rotation
  - Settings/gear icons: Rotation suggesting mechanical action
- **Principles**: Animations should be subtle, meaningful, and complete within 200ms

### List Item Behaviors

**Recent Items**:

- **Default**: Compact height (32px), truncated text with ellipsis
- **Hover**: Background color change, options button fades in, text applies gradient mask for smooth fade effect
- **Selected**: Persistent background highlighting, full text visibility
- **Options button**: Hidden by default, revealed on hover positioned at right edge
- **Delete action**: Integrated into options or separate button, requires confirmation dialog

### Scroll Behavior

**Recents List**:

- **Scrolling**: Vertical scroll enabled, horizontal scroll hidden
- **Visual feedback**: Gradient fade overlay at bottom edge to indicate more content
- **Performance**: Smooth scrolling with momentum on touch devices
- **Accessibility**: Keyboard navigation support (arrow keys, page up/down)

## Component Structure

### Overview

**Overlay Drawer Components**:

The sidebar overlay drawer architecture requires three coordinated components:

1. **`Sidebar.svelte`**: Main sidebar component with fixed positioning
2. **`SidebarBackdrop.svelte`**: Overlay backdrop (new component)
3. **`+layout.svelte`**: Root layout that coordinates sidebar, backdrop, and main content

**File Structure**:

```
src/lib/components/
├── Sidebar.svelte              # Main sidebar (update positioning)
├── SidebarBackdrop.svelte      # New backdrop component
├── SidebarButtonSlot.svelte    # Existing button component (no changes)
└── ...

src/routes/
└── +layout.svelte              # Root layout (update structure)
```

### Header Section

**Layout**:

- Toggle button with dual-icon animation on left
- App branding/logo centered or right-aligned
- Height: 48px with appropriate padding
- Horizontal gap between elements for breathing room

**Toggle Button**:

- Icon-only design (no text label)
- Dual-icon pattern: sidebar-open and sidebar-collapsed icons
- Smooth crossfade animation on hover
- `aria-expanded` attribute reflects sidebar state
- `aria-label` for accessibility ("Expand sidebar" / "Collapse sidebar")

### Primary Actions

**New File/Chat Button**:

- Prominent visual treatment to encourage action
- Rounded pill style with sufficient padding
- Animated icon container (circular background)
- Icon scales and rotates on hover
- Positioned at top of main navigation area

### Navigation Items

**Structure**:

- Standard list item format
- Icon + label layout (label hidden when collapsed)
- Options menu appears on hover/focus
- Proper spacing between items (minimal gaps)

**Interaction Pattern**:

- Group hover state reveals additional actions
- Click navigates to corresponding view
- Visual indication of current/active item
- Keyboard focusable with visible focus indicator

### Recent Items List

**Layout**:

- Section header with sticky positioning
- Scrollable container for list items
- Gradient background on header for depth
- Bottom gradient fade to indicate scrollability

**List Items**:

- Compact design (32px height)
- File/document icon + truncated name
- Options button revealed on hover
- Selected state with persistent background

### Footer Section

**Authentication UI**:

See [LOGIN_PROFILE_UI.md](./LOGIN_PROFILE_UI.md) for detailed authentication UI integration:

- **Guest Mode**: Sign-in button with `log-in` icon
- **Logged-in Mode**: User profile button with user icon and user email
- Position: Above settings button, under same divider
- Clicking triggers authentication modals (sign-in or profile)

**Settings**:

- Accessible via icon button or user menu
- Popover/menu pattern for settings options
- Maintains consistency with other interactive elements

## Responsive Behavior

### Breakpoint-Based Architecture

**Breakpoint**: 768px (matches Tailwind's `md` breakpoint)

### Desktop Mode (≥ 768px)

**Layout Behavior**:

- **Positioning**: `position: relative` - part of normal document flow
- **Collapsed (48px)**: Content flows next to sidebar with full remaining width
- **Expanded (288px)**: Content is pushed right, width reduced by 240px
- **No backdrop**: Content remains fully visible and interactive
- **Z-index**: Uses `--z-canvas-ui: 10` for internal sidebar UI only

**User Experience**:

- Traditional sidebar pattern familiar to desktop users
- Sidebar expansion does not obscure content
- Content naturally reflows when sidebar changes width
- Toggle button switches between collapsed/expanded states
- State can be persisted to localStorage for user preference

**Default State**: Consider expanded by default on desktop (more screen space available)

### Mobile Mode (< 768px)

**Layout Behavior**:

- **Positioning**: `position: fixed` - overlays content
- **Collapsed (48px)**: Content has 48px left margin to avoid overlap
- **Expanded (288px)**: Sidebar overlays content; backdrop dims background
- **Backdrop**: Semi-transparent `rgba(0, 0, 0, 0.4)` overlay
- **Z-index**: Uses `--z-sidebar: 50` and `--z-sidebar-backdrop: 40`

**User Experience**:

- Drawer pattern familiar to mobile users
- Content width remains constant (no reflow)
- Backdrop provides visual focus and click-to-dismiss
- Escape key collapses sidebar (in addition to backdrop click)
- Ideal for touch interfaces with limited screen width

**Default State**: Collapsed by default on mobile (maximize content space)

**Interaction Patterns**:

- Tap toggle button to expand/collapse
- Tap backdrop to collapse (when expanded)
- Press Escape to collapse (when expanded)
- Future: Swipe gestures (swipe right to expand, left to collapse)

### Responsive Width

**Implemented Approach** (Consistent Width):

- Collapsed: 48px across all screen sizes
- Expanded: 288px across all screen sizes
- Simple and predictable behavior
- No viewport-specific width calculations needed

## Accessibility

### Keyboard Navigation

- All interactive elements focusable
- Visible focus indicators (ring)
- Logical tab order
- **Escape key collapses sidebar when expanded** (critical for overlay drawer)
- Tab should not cycle through backdrop (backdrop is not focusable, only clickable)
- Focus remains on sidebar toggle button after collapse

### ARIA Attributes

- `aria-label` on icon-only buttons
- `aria-expanded="true|false"` on toggle button (reflects sidebar state)
- `aria-current` on active navigation item
- `role="navigation"` on sidebar
- `aria-hidden="true"` on decorative elements
- **`aria-modal="false"` on sidebar** - sidebar is not a modal, users can still interact with content
- `aria-hidden="true"` on backdrop (purely visual, not interactive for screen readers)

### Screen Reader Support

- Meaningful button labels
- **Status announcements for state changes**: "Sidebar expanded" / "Sidebar collapsed"
- Skip to main content link
- Proper heading hierarchy
- Backdrop should be ignored by screen readers (aria-hidden)

### Focus Management

**Overlay Drawer Specific**:

- When sidebar expands: Focus stays on toggle button (or moves to sidebar if triggered programmatically)
- When sidebar collapses: Focus returns to toggle button
- **Do not trap focus**: Unlike modals, sidebar overlay does not trap focus - users can tab to main content
- Backdrop is not focusable (only clickable with mouse/touch)

## Future Enhancements

1. **Contextual Actions**: Show relevant actions based on current view
2. **Quick Search**: Add search/filter for documents
3. **Drag & Drop**: Reorder documents in list
4. **Keyboard Shortcuts**: Display shortcut hints
5. **Customization**: User-configurable sidebar width
6. **Pinned Items**: Pin frequently used documents
7. **Groups/Folders**: Organize documents into categories

## References

- Source inspiration: `prose/claude-theme/claude-sidebar.html`
- Current implementation: `src/lib/components/Sidebar.svelte`
- Button slot component: `src/lib/components/SidebarButtonSlot.svelte`
- Design system: `prose/designs/frontend/DESIGN_SYSTEM.md`
- Login and profile UI: `prose/designs/frontend/LOGIN_PROFILE_UI.md`
- Document loading and switching: `prose/designs/frontend/OPTIMISTIC_PAGE_LOADING.md`
- Component library: shadcn-svelte
- Icon library: lucide-svelte
