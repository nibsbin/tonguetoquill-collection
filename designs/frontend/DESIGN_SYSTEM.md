# Design System

## Overview

The TongueToQuill design system provides a consistent visual language across desktop and mobile platforms, maintaining the professional VSCode-inspired aesthetic while ensuring accessibility and mobile-friendliness.

## Color Palette

### Theme Philosophy
- **Default**: Dark theme (professional, reduced eye strain)
- **Alternative**: Light theme (accessibility, user preference)
- **Support**: High contrast mode for Section 508 compliance

### Dark Theme

**Background Layers**:
- Primary: zinc-900 (main background)
- Secondary: zinc-800 (elevated surfaces)
- Tertiary: zinc-700 (active/hover states)
- Overlay: zinc-900 with transparency (modals/drawers)

**Text Colors**:
- Primary: zinc-100 (main text)
- Secondary: zinc-300 (secondary text)
- Tertiary: zinc-400 (muted text)
- Disabled: zinc-500 (disabled state)

**Interactive Colors**:
- Default: zinc-400 (default state)
- Hover: zinc-100 (hover state)
- Active: zinc-700 background (active state)

**Semantic Colors**:
- Success: Green tones
- Error: Red tones
- Warning: Yellow tones
- Info: Blue tones

**Brand**: USAF Blue (#355e93) for accents and primary actions

### Light Theme

**Background Layers**:
- Primary: White
- Secondary: Light gray
- Tertiary: Medium gray
- Overlay: White with transparency

**Text Colors**:
- Primary: Near black
- Secondary: Dark gray
- Tertiary: Medium gray
- Disabled: Light gray

### High Contrast Mode

Activated via user preference or system setting:
- Minimum 7:1 contrast ratio
- Pure black/white backgrounds
- Bold text and borders

### Color Usage Guidelines

- Use semantic colors for status messages
- Maintain 4.5:1 contrast minimum for normal text
- Never rely on color alone for information
- Test with color blindness simulators

## Typography

### Font Families

**UI Font**: System stack for native appearance and performance
**Editor Font**: Monospace stack for code editing
**Preview Font**: Serif stack for professional document rendering

### Type Scale

**Desktop**:
- Base: 16px
- Range: 12px (xs) to 36px (4xl)

**Mobile**:
- Base: 16px (prevents zoom on input focus)
- Fluid scaling for larger devices

### Font Weights
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Line Heights
- Tight: 1.25 (headings)
- Normal: 1.5 (body text)
- Relaxed: 1.75 (long-form content)

### Typography Guidelines

**Accessibility**:
- Minimum 16px for body text
- 1.5 line height for readability
- Support text resize up to 200%

**Mobile**:
- Larger minimum sizes
- Generous line heights
- Shorter line lengths (60-80 characters)

## Spacing System

### Base Unit
4px (0.25rem)

### Spacing Scale
0px, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

### Layout Spacing

**Component Heights**:
- Top bar: 48px
- Toolbar: 40px
- Sidebar expanded: 224px
- Sidebar collapsed: 48px

**Padding Standards**:
- Tight: 4px
- Compact: 8px
- Standard: 16px
- Generous: 24px
- Spacious: 32px

**Mobile Touch Targets**:
- Minimum: 44px
- Spacing: 8px minimum between targets

### Responsive Spacing

Use mobile-first approach with increasing spacing at larger breakpoints

## Border Radius

### Border Scale
- Small: 4px
- Medium: 8px
- Large: 12px
- XL: 16px
- Full: 9999px (circular/pill)

### Usage
- Buttons: Medium
- Cards: Large
- Modals: Large
- Images: Medium
- Pills/badges: Full

## Shadows & Elevation

### Shadow Scale
- Small: Subtle depth
- Medium: Standard elevation
- Large: Prominent elevation
- XL: Maximum elevation

### Elevation Layers
- Base: 0 (content)
- Dropdowns: 10
- Sticky: 20
- Modals: 30
- Toasts: 40

### Mobile Shadows
Reduced for performance, rely more on borders

## Icons

### Icon System
Lucide Svelte for consistent, optimized icons

### Icon Sizes
- XS: 12px
- SM: 16px (default)
- MD: 20px
- LG: 24px
- XL: 32px

### Icon Guidelines
- Inherit text color by default
- Consistent stroke width
- Accessible labels for icon-only buttons

## Transitions & Animations

### Duration Scale
- Fast: 150ms (micro-interactions)
- Base: 300ms (standard transitions)
- Slow: 500ms (complex animations)

### Easing Functions
- Ease-in: Entry animations
- Ease-out: Exit animations
- Ease-in-out: State changes
- Spring: Playful interactions

### Reduced Motion
Honor `prefers-reduced-motion` system setting, reduce or eliminate animations

### Animation Patterns
- Fade in/out for content
- Slide for panels and drawers
- Scale for modals
- Bottom sheet slide-up for mobile

## Responsive Design

### Breakpoint System
- **sm: 640px** - Mobile landscape
- **md: 768px** - Tablet portrait
- **lg: 1024px** - Desktop
- **xl: 1280px** - Large desktop
- **2xl: 1536px** - Extra large

### Container Widths
Full width with max-width constraints at each breakpoint

### Mobile-First Approach
Base styles for mobile, enhance at larger breakpoints

## Accessibility Features

### Focus Indicators
- Visible outline: 2px solid
- Offset: 2px
- High contrast: 3px solid
- Never remove focus styles

### Text Contrast
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum
- WCAG AA compliance

### Skip Links
Hidden by default, visible on focus for keyboard navigation

## Theme System

### Dark Mode Toggle
- Default: Dark theme
- Toggle: Light theme
- System: Follow OS preference
- Persisted to user preferences

### Theme Implementation
- CSS custom properties for all design tokens
- Class toggle on root element
- Smooth transitions between themes

## Design Tokens

All design values defined as CSS variables for consistency and themability:
- Colors
- Spacing
- Typography
- Borders
- Shadows
- Transitions

Synced with Tailwind configuration for unified system.
