# DocumentEditor Responsive Layout Design

## Problem Statement

The DocumentEditor component has a responsive layout gap where the Preview panel disappears without showing the mobile tab switcher. This creates a broken state where users can only see the Editor panel with no way to access the Preview.

**Current Behavior:**
- **Mobile mode (< 768px)**: Tab switcher visible, user can toggle between Editor and Preview
- **Broken interval (768px - 1023px)**: No tab switcher, Preview panel hidden, only Editor visible
- **Desktop mode (≥ 1024px)**: Split-screen with both panels visible

**Root Cause:**
The Preview panel uses Tailwind classes `hidden lg:block` in desktop mode, which hides the panel until the `lg:` breakpoint (1024px) is reached. However, mobile detection switches to desktop mode at 768px, creating a 256px gap where neither mobile tabs nor the Preview panel are shown.

## Desired State

The DocumentEditor should have exactly two responsive modes with a single breakpoint at 768px:

### Mobile Mode (< 768px)
- Tab switcher visible at top
- Editor panel visible when Editor tab active
- Preview panel visible when Preview tab active
- User can toggle between panels using tabs

### Desktop Split-Screen Mode (≥ 768px)
- No tab switcher
- Editor panel always visible on left
- Preview panel always visible on right
- Both panels take equal flex space side-by-side

## Design Principles

1. **Single Breakpoint**: Use 768px as the only breakpoint (Tailwind `md:` breakpoint)
2. **Binary States**: Component is either in mobile mode OR split-screen mode, never in a broken intermediate state
3. **Consistent Visibility**: In desktop mode, both panels must always be visible
4. **Progressive Enhancement**: Layout gracefully adapts as viewport width increases

## Technical Approach

### Breakpoint Alignment
- Mobile detection threshold: 768px (matches Tailwind `md:`)
- All responsive CSS classes align with this same breakpoint
- No use of `lg:` or other breakpoints that conflict with the mobile detection logic

### Preview Panel Visibility
- **Mobile mode**: Controlled by `mobileView` state (hidden unless active tab)
- **Desktop mode**: Always visible, no conditional hiding based on viewport width beyond the mobile breakpoint

### Layout Structure
```
┌─ Window < 768px ────────────────┐
│ [Editor Tab] [Preview Tab]      │
│ ┌────────────────────────────┐  │
│ │ Active Panel Only          │  │
│ └────────────────────────────┘  │
└──────────────────────────────────┘

┌─ Window ≥ 768px ────────────────┐
│ ┌──────────┬──────────────────┐ │
│ │ Editor   │ Preview          │ │
│ │ (flex-1) │ (flex-1)         │ │
│ └──────────┴──────────────────┘ │
└──────────────────────────────────┘
```

## Implementation Requirements

1. Remove conflicting Tailwind breakpoint classes from Preview panel
2. Ensure Preview visibility is controlled solely by `isMobile` state
3. Maintain existing mobile tab switching functionality
4. Preserve all other responsive behaviors (toolbar, sidebar, etc.)

## Non-Goals

- Changing the 768px breakpoint threshold
- Adding additional breakpoints or responsive modes
- Modifying mobile tab switcher behavior
- Changing panel layout or styling beyond visibility fixes

## Cross-References

- See [MARKDOWN_EDITOR.md](./MARKDOWN_EDITOR.md) for editor component design
- See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for responsive design tokens
- See [COMPONENT_ORGANIZATION.md](./COMPONENT_ORGANIZATION.md) for component structure
