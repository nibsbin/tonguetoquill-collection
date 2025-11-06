# Logo in Sidebar Design

## Overview

This document describes the relocation of the Tonguetoquill logo from the TopMenu to the sidebar as a personal signature element, creating a stronger brand presence in the application's primary navigation area.

## Design Rationale

### Purpose

- **Personal Signature**: The logo serves as a personal branding element that represents the application identity
- **Improved Visual Hierarchy**: Moving the logo to the sidebar consolidates navigation elements in one place
- **Better Space Utilization**: The TopMenu gains more space for document-related information and actions
- **Enhanced User Experience**: The logo becomes part of the persistent navigation structure

### Current State

The logo currently appears in the TopMenu component (line 144-150 of TopMenu.svelte):

- Positioned to the left of the document title
- Size: h-8 (32px) with auto width
- Marked as aria-hidden decorative element

### Desired State

The logo will be repositioned in the sidebar:

- **Location**: Between the hamburger menu button and the new document button
- **Size (collapsed)**: 40x40 pixels matching other sidebar buttons
- **Border**: Bottom border separating logo from new document button, no border with hamburger menu
- **Animation**: Horizontal centering when sidebar expands
- **Integration**: Uses SidebarButtonSlot architecture for consistency

## Visual Design

### Layout Structure

```
┌─────────────────────────────┐
│  Hamburger Menu Button      │  48px slot
├─────────────────────────────┤  (no border)
│  Logo Icon (Signature)      │  48px slot
├─────────────────────────────┤  ← border-b
│  New Document Button        │  48px slot
├─────────────────────────────┤
│  ...                        │
```

### Dimensions

**Collapsed State (48px sidebar width)**:

- Logo slot: 48px × 48px (consistent with other button slots)
- Logo image: 40x40px (fits within the 4px padding of SidebarButtonSlot)
- Padding: 4px on all sides (standard SidebarButtonSlot padding)
- Position: Vertically and horizontally centered within slot

**Expanded State (288px sidebar width)**:

- Logo slot: 48px height, full width
- Logo image: Still 40x40px
- Position: Horizontally centered in the expanded sidebar width
- Animation: Smooth slide from left-aligned to center as sidebar expands

### Borders

- **Top**: No border (seamless connection with hamburger menu)
- **Bottom**: Border using `border-b border-border` (separates from new document button)
- **Semantic**: The logo is grouped with the hamburger menu as "header" elements

### Visual Behavior

**Collapsed State**:

- Logo appears as icon-only at 40x40px
- Centered within 48px slot
- No labels or text

**Expanded State**:

- Logo slides horizontally to center of expanded sidebar
- Maintains 40x40px size
- Smooth transition using sidebar's cubic-bezier(0.165, 0.85, 0.45, 1) easing
- 300ms duration matching sidebar expansion timing

**Interactive States**:

- The logo is non-interactive (decorative/branding element)
- No hover states, click handlers, or focus states
- Uses aria-hidden="true" for accessibility

## Component Architecture

### Logo Button Slot

The logo will use a custom implementation based on SidebarButtonSlot architecture:

**Responsibilities**:

- Maintain 48px slot height for vertical consistency
- Provide 4px padding creating 40x40px inner area
- Handle horizontal centering transition
- Apply bottom border styling

**Integration Points**:

- Positioned directly after hamburger menu slot
- Positioned directly before new document button slot
- Participates in sidebar's border hierarchy

### Centering Strategy

**CSS Approach**:

- Use flexbox for centering within slot
- In collapsed state: justify-content matches other buttons (flex-start with padding)
- In expanded state: justify-content: center
- Transition property on justify-content for smooth animation

**Alternative Approach** (if transition doesn't work smoothly):

- Use transform: translateX() for horizontal positioning
- Calculate offset based on sidebar width and logo width
- Smooth CSS transition on transform property

## Accessibility

### ARIA Attributes

- `aria-hidden="true"`: Logo is decorative, not interactive
- No role needed as it's not a navigation element
- No aria-label needed for non-interactive element

### Screen Reader Behavior

- Logo is hidden from screen readers as it provides no functional value
- Users navigate directly from hamburger button to new document button
- Semantic structure unchanged from accessibility perspective

## Implementation Notes

### File Changes

**Files to Modify**:

1. `src/lib/components/TopMenu/TopMenu.svelte`: Remove logo img element
2. `src/lib/components/Sidebar/Sidebar.svelte`: Add logo slot between hamburger and new document button

**Files to Create**:

- Potentially `src/lib/components/Sidebar/SidebarLogoSlot.svelte` if custom component needed

### CSS Custom Properties

Reuse existing design tokens:

- `--sidebar-collapsed-width`: 48px (slot size)
- `--sidebar-expanded-width`: 288px (for centering calculation)
- `--color-border`: Border color
- Transition timing: 300ms cubic-bezier(0.165, 0.85, 0.45, 1)

### Border Implementation

The bottom border should:

- Use standard border utility: `border-b border-border`
- Match sidebar's existing border styling
- Create visual separation between logo and action buttons

## Design Principles Applied

### KISS (Keep It Simple, Stupid)

- Reuse existing SidebarButtonSlot architecture
- Minimal custom CSS for centering behavior
- No complex JavaScript animations
- Leverage existing design tokens

### DRY (Don't Repeat Yourself)

- Use existing button slot padding and sizing
- Reuse sidebar transition timing and easing
- Apply existing border color tokens
- Follow established layout patterns

## Cross-References

- **Sidebar Architecture**: See [SIDEBAR.md](./SIDEBAR.md) for button slot system and button architecture
- **Design System**: See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for tokens and spacing
- **Logo Asset**: `/static/logo.svg`

## Testing Considerations

### Visual Testing

- Verify 40x40px size in collapsed state
- Confirm horizontal centering in expanded state
- Check border alignment with new document button
- Validate smooth transition animation
- Test in both light and dark modes (if applicable)

### Responsive Testing

- Test sidebar expansion/collapse behavior
- Verify logo positioning at different viewport sizes
- Check that logo doesn't overflow or clip

### Accessibility Testing

- Confirm logo is properly hidden from screen readers
- Verify keyboard navigation skips decorative logo
- Test that focus moves correctly from hamburger to new document button

## Future Enhancements

Potential future considerations (not in current scope):

- Logo click action (e.g., navigate to home/about page)
- Tooltip on hover with application name
- Alternative logo variant for expanded state
- Logo animation on application load
