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

### Dimensions

**Desktop (≥1024px)**:
- **Expanded width**: 18rem (288px) - increased from current 14rem (224px)
- **Collapsed width**: 3rem (48px) - same as current
- **Transition**: 300ms duration with cubic-bezier(0.165, 0.85, 0.45, 1) easing

**Mobile (<1024px)**:
- Full-screen drawer overlay
- Width: 18rem (288px) when open
- Slides in from left with shadow

### Structure

```
┌─────────────────────────────┐
│  Toggle Button              │  h-12 (48px) - Header
│  + App Branding             │
├─────────────────────────────┤
│  Primary Actions            │  
│  (New chat/file button)     │  h-9 (36px) per action
├─────────────────────────────┤
│  Navigation Items           │
│  (Chats, Projects, etc.)    │  h-9 (36px) per item
├─────────────────────────────┤
│                             │
│  Recent Items List          │  h-8 (32px) per item
│  (Scrollable)               │
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

Maintain our existing zinc-based palette with semantic tokens:

### Background Colors
- **Sidebar background**: `bg-bg-200` → zinc-900 (#18181b)
- **Hover state**: `hover:bg-bg-400` → zinc-800/50 (rgba(39, 39, 42, 0.5))
- **Active/Selected**: `bg-bg-400` → zinc-800 (#27272a)
- **Border**: `border-border-300` → zinc-700 (#3f3f46)

### Text Colors
- **Primary text**: `text-text-100` → zinc-100 (#f4f4f5)
- **Secondary text**: `text-text-200` → zinc-300 (#d4d4d8)
- **Muted text**: `text-text-300` → zinc-400 (#a1a1aa)
- **Hover text**: `hover:text-text-100` → zinc-100 (#f4f4f5)

### Accent Colors
- **Primary action background**: `bg-accent-main-000` → USAF Blue or branded color
- **Primary action text**: `text-always-white` → #ffffff
- **Accent hover**: `hover:bg-accent-main-000/[0.08]` → USAF Blue with 8% opacity

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
- ARIA label for accessibility

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

**User Profile Display**:
- Avatar/initials display (circular)
- User name and secondary info (email or plan type)
- Chevron/dropdown indicator for menu access
- Layout: horizontal flex with proper alignment

**Settings**:
- Accessible via icon button or user menu
- Popover/menu pattern for settings options
- Maintains consistency with other interactive elements

## Responsive Behavior

### Desktop (≥1024px)
- Sidebar persistent and fixed/sticky
- Width transitions smoothly between collapsed (48px) and expanded (288px)
- Border on right edge: `border-r-0.5` or `border-r`
- Shadow: `shadow-lg` on desktop (optional)

### Tablet/Mobile (<1024px)
- Sidebar becomes full-screen drawer overlay
- Activated by hamburger menu button (top-left)
- Width: 18rem (288px) when open
- Overlay background with opacity
- Slides in from left with transition
- Shadow: `shadow-lg` for depth
- Z-index: `z-sidebar` (high value)

## Accessibility

### Keyboard Navigation
- All interactive elements focusable
- Visible focus indicators (ring)
- Logical tab order
- Escape key closes mobile drawer

### ARIA Attributes
- `aria-label` on icon-only buttons
- `aria-expanded` on toggle button
- `aria-current` on active navigation item
- `role="navigation"` on sidebar
- `aria-hidden` on decorative elements

### Screen Reader Support
- Meaningful button labels
- Status announcements for state changes
- Skip to main content link
- Proper heading hierarchy

## Animation Details

### Transition Timing
- **Standard duration**: 300ms for most transitions
- **Fast micro-interactions**: 100-150ms for immediate feedback
- **Slower deliberate actions**: 500ms for emphasis
- **Easing curve**: Custom cubic-bezier(0.165, 0.85, 0.45, 1) for natural movement

### Scale Effects
- **Button press**: Subtle shrink to 98.5% on active state
- **Hover grow**: Slight scale increase (105-110%) for emphasis
- **No scale on active items**: Prevent double-animation when item is already selected

### Transform Patterns
- **Rotation**: Micro rotations (-3° to 6°) for playfulness
- **Translation**: Pixel-level movements (0.5-2.8px) for subtle shifts
- **Combined transforms**: Rotation + translation + scale for rich interactions
- **Performance**: Use CSS transforms for GPU acceleration

## Implementation Notes

### Collapse/Expand Logic

**Collapsed State (48px width)**:
- Display icons only, hide text labels
- Maintain consistent icon button sizes
- Show user avatar only (hide name/plan)
- Hide recent items section entirely
- Consider tooltips on hover for context

**Expanded State (288px width)**:
- Display icons with text labels
- Show full user profile information
- Display recent items with scrolling
- Show all section headers and dividers

### Mobile Considerations

**Drawer Pattern**:
- Hamburger menu trigger: fixed position, high z-index
- Drawer slides in from left edge
- Full height, 288px width
- Semi-transparent backdrop overlay
- Close triggers: backdrop click, escape key, navigation

**Touch Optimization**:
- Minimum 44x44px touch targets
- Adequate spacing between interactive elements
- Prevent accidental activation
- Body scroll lock when drawer is open

### Performance

**Optimization Strategies**:
- Use CSS transforms for GPU acceleration
- Avoid animating layout-triggering properties
- Debounce resize event handlers
- Consider virtual scrolling for very long lists
- Lazy load non-critical assets

## Button Slot Architecture

### Concept

The sidebar button slot is a three-layer nested structure designed to maintain consistent sizing and centering across collapsed and expanded states:

**Layer 1: Button Slot Container**
- Size: Square of `--sidebar-collapsed-width` (56px) in collapsed state
- Expands: Horizontally to full sidebar width when expanded
- Purpose: Provides consistent vertical rhythm and horizontal padding
- Centering: Uses flexbox to center child elements

**Layer 2: Button Element**
- Size: Square of `--sidebar-button-size` (40px)
- Behavior: Remains fixed size in both collapsed and expanded states
- Purpose: Interactive click target with consistent touch area
- Centering: Centered within the slot container

**Layer 3: Icon Element**
- Size: Square of `--sidebar-icon-size` (24px)
- Behavior: Fixed size, centered within button
- Purpose: Visual indicator
- Spacing: When text is present (expanded state), icon has right margin

### Component Implementation

**SidebarButtonSlot Component**:
- Reusable component for all sidebar buttons
- Handles centering logic automatically
- Supports both icon-only (collapsed) and icon+label (expanded) states
- Maintains consistent padding in both states
- Props:
  - `icon`: Icon component to display
  - `label`: Text label (shown only when expanded)
  - `variant`: Button style variant ('ghost', 'primary', etc.)
  - `onclick`: Click handler
  - `ariaLabel`: Accessibility label
  - Other button props as needed

### Semantic Tokens

**Size Tokens** (already defined):
- `--sidebar-collapsed-width`: 3.5rem (56px) - Full slot width when collapsed
- `--sidebar-button-size`: 2.5rem (40px) - Button element size
- `--sidebar-icon-size`: 1.5rem (24px) - Icon size
- `--sidebar-padding`: 0.5rem (8px) - Consistent padding

**Derived Tokens** (for clarity and DRY):
- `--sidebar-slot-width-collapsed`: var(--sidebar-collapsed-width)
- `--sidebar-slot-height`: var(--sidebar-collapsed-width) - Maintains square aspect ratio
- `--sidebar-button-spacing`: calc((var(--sidebar-collapsed-width) - var(--sidebar-button-size)) / 2) - Auto-calculates centering offset (8px)

### Centering Strategy

**Horizontal Centering**:
- Collapsed state: Button centered in slot using flexbox (`justify-center`)
- Expanded state: Button aligned to start with consistent left padding (`--sidebar-padding`)

**Vertical Centering**:
- Always centered using flexbox (`items-center`)
- Slot height equals `--sidebar-collapsed-width` for perfect square in collapsed state

**Nested Centering**:
- Icon centered within button using flexbox
- Text aligned with icon baseline when present

## Design Tokens Reference

**Background Tokens**:
- bg-200: Main sidebar background (zinc-900, #18181b)
- bg-300: Intermediate level (between 900 and 800)
- bg-400: Elevated surfaces and hover states (zinc-800, #27272a)

**Text Tokens**:
- text-100: Primary text (zinc-100, #f4f4f5)
- text-200: Secondary text (zinc-300, #d4d4d8)
- text-300: Muted/tertiary text (zinc-400, #a1a1aa)

**Border Tokens**:
- border-300: Standard borders (zinc-700, #3f3f46)

**Accent Tokens**:
- accent-main-000: Primary brand color (USAF Blue #355e93)
- accent-main-100: Lighter variant for text on dark backgrounds
- accent-brand: Alias for main accent color

**Special Tokens**:
- always-white: Pure white (#ffffff) for high contrast
- always-black: Pure black (#000000) for masks and overlays

## Migration Path

1. **Phase 1**: Update dimensions and spacing
   - Change expanded width to 18rem
   - Adjust item heights (h-9 for nav, h-8 for recents)
   - Update padding/margin values

2. **Phase 2**: Enhance button styles
   - Add hover scale effects
   - Implement icon animations
   - Add gradient text masks

3. **Phase 3**: Improve visual hierarchy
   - Add section headers with sticky positioning
   - Implement gradient fades
   - Update typography weights

4. **Phase 4**: Polish interactions
   - Smooth transitions
   - Hover state improvements
   - Focus indicators

5. **Phase 5**: Mobile refinements
   - Adjust drawer behavior
   - Optimize touch targets
   - Test gestures

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
- Design system: `prose/designs/frontend/DESIGN_SYSTEM.md`
- Component library: shadcn-svelte
- Icon library: lucide-svelte
