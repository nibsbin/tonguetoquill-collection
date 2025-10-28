# Design System

## Overview

The TongueToQuill design system provides a consistent visual language across desktop and mobile platforms, maintaining the professional VSCode-inspired aesthetic while ensuring accessibility and mobile-friendliness.

## Color Palette

### Theme Philosophy
- **Default**: Dark theme (professional, reduced eye strain)
- **Alternative**: Light theme (accessibility, user preference)
- **Support**: High contrast mode for Section 508 compliance

### Dark Theme Colors

#### Background Layers
```css
--bg-primary: oklch(0.145 0 0)        /* zinc-900: Main background */
--bg-secondary: oklch(0.188 0 0)      /* zinc-800: Elevated surfaces */
--bg-tertiary: oklch(0.269 0 0)       /* zinc-700: Active/hover states */
--bg-overlay: oklch(0.145 0 / 0.95)   /* Modal/drawer backgrounds */
```

#### Text Colors
```css
--text-primary: oklch(0.985 0 0)      /* zinc-100: Primary text */
--text-secondary: oklch(0.849 0 0)    /* zinc-300: Secondary text */
--text-tertiary: oklch(0.708 0 0)     /* zinc-400: Muted text */
--text-disabled: oklch(0.536 0 0)     /* zinc-500: Disabled state */
```

#### Interactive Colors
```css
--interactive-default: oklch(0.708 0 0)    /* zinc-400: Default buttons */
--interactive-hover: oklch(0.985 0 0)      /* zinc-100: Hover state */
--interactive-active: oklch(0.269 0 0)     /* zinc-700: Active background */
```

#### Semantic Colors
```css
--success: oklch(0.65 0.16 145)       /* Green: Success messages */
--error: oklch(0.55 0.22 27)          /* Red: Errors, destructive */
--warning: oklch(0.75 0.15 85)        /* Yellow: Warnings */
--info: oklch(0.60 0.15 250)          /* Blue: Information */
```

#### Brand Color
```css
--brand-primary: #355e93               /* USAF Blue: Accents */
--brand-hover: #2a4b75                 /* Darker shade for hover */
```

### Light Theme Colors

#### Background Layers
```css
--bg-primary: oklch(1.0 0 0)           /* White: Main background */
--bg-secondary: oklch(0.97 0 0)        /* Light gray: Surfaces */
--bg-tertiary: oklch(0.93 0 0)         /* Medium gray: Hover */
--bg-overlay: oklch(1.0 0 / 0.95)      /* Modal backgrounds */
```

#### Text Colors
```css
--text-primary: oklch(0.20 0 0)        /* Near black: Primary text */
--text-secondary: oklch(0.35 0 0)      /* Dark gray: Secondary */
--text-tertiary: oklch(0.50 0 0)       /* Medium gray: Muted */
--text-disabled: oklch(0.65 0 0)       /* Light gray: Disabled */
```

### High Contrast Mode

Activated via user preference or system setting:

```css
@media (prefers-contrast: high) {
  --text-primary: #000000 or #FFFFFF
  --bg-primary: #FFFFFF or #000000
  /* Ensure 7:1 contrast ratio minimum */
}
```

### Color Usage Guidelines

**Do**:
- Use semantic colors for status messages
- Maintain 4.5:1 contrast for normal text
- Maintain 7:1 contrast for small text in high contrast mode
- Test with color blindness simulators

**Don't**:
- Use color as the only indicator
- Mix theme colors (stay within theme)
- Override semantic color meanings

## Typography

### Font Stack

#### UI Font: System Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 
             "Segoe UI", Roboto, Oxygen, Ubuntu, 
             "Helvetica Neue", Arial, sans-serif;
```

**Benefits**:
- Native appearance on each platform
- Optimal rendering
- No font loading delay
- Better performance

#### Editor Font: Monospace Stack
```css
font-family: "SF Mono", Monaco, "Cascadia Code",
             "Roboto Mono", Consolas, monospace;
```

#### Preview Font: Serif Stack
```css
font-family: "Crimson Text", Georgia, 
             "Times New Roman", serif;
```

### Type Scale

#### Desktop Scale
```css
--text-xs: 0.75rem      /* 12px - Small labels */
--text-sm: 0.875rem     /* 14px - Secondary text */
--text-base: 1rem       /* 16px - Body text */
--text-lg: 1.125rem     /* 18px - Emphasized text */
--text-xl: 1.25rem      /* 20px - H3 */
--text-2xl: 1.5rem      /* 24px - H2 */
--text-3xl: 1.875rem    /* 30px - H1 */
--text-4xl: 2.25rem     /* 36px - Page titles */
```

#### Mobile Scale (Fluid)
```css
/* Base size increases slightly on mobile */
html {
  font-size: 16px;      /* Mobile base */
  
  @media (min-width: 768px) {
    font-size: 16px;    /* Tablet base */
  }
  
  @media (min-width: 1024px) {
    font-size: 16px;    /* Desktop base */
  }
}

/* Editor specific: prevent zoom on focus */
textarea, input {
  font-size: max(16px, 1rem);
}
```

### Font Weights
```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Line Heights
```css
--leading-tight: 1.25      /* Headings */
--leading-normal: 1.5      /* Body text */
--leading-relaxed: 1.75    /* Long-form content */
```

### Typography Guidelines

**Accessibility**:
- Minimum 16px for body text
- 1.5 line height for readability
- Adequate spacing between paragraphs
- Support text resize up to 200%

**Mobile Optimization**:
- Larger minimum font sizes (prevent zoom)
- Generous line height (easier reading)
- Shorter line lengths (60-80 characters)

## Spacing System

### Base Unit: 4px (0.25rem)

#### Spacing Scale
```css
--space-0: 0           /* 0px */
--space-1: 0.25rem     /* 4px */
--space-2: 0.5rem      /* 8px */
--space-3: 0.75rem     /* 12px */
--space-4: 1rem        /* 16px */
--space-5: 1.25rem     /* 20px */
--space-6: 1.5rem      /* 24px */
--space-8: 2rem        /* 32px */
--space-10: 2.5rem     /* 40px */
--space-12: 3rem       /* 48px */
--space-16: 4rem       /* 64px */
```

### Layout Spacing

#### Component Heights
```css
--height-topbar: 3rem         /* 48px */
--height-toolbar: 2.5rem      /* 40px */
--width-sidebar-expanded: 14rem   /* 224px */
--width-sidebar-collapsed: 3rem   /* 48px */
```

#### Padding Standards
```css
--padding-xs: var(--space-1)      /* Tight spacing */
--padding-sm: var(--space-2)      /* Compact components */
--padding-md: var(--space-4)      /* Standard spacing */
--padding-lg: var(--space-6)      /* Generous spacing */
--padding-xl: var(--space-8)      /* Spacious layouts */
```

#### Mobile Touch Targets
```css
--touch-target-min: 44px      /* Minimum for mobile */
--touch-spacing-min: 8px      /* Minimum gap between targets */
```

### Responsive Spacing

```css
/* Mobile first */
.container {
  padding: var(--space-4);
  
  @media (min-width: 768px) {
    padding: var(--space-6);
  }
  
  @media (min-width: 1024px) {
    padding: var(--space-8);
  }
}
```

## Border Radius

### Border Scale
```css
--radius-sm: 0.25rem    /* 4px - Small elements */
--radius-md: 0.5rem     /* 8px - Buttons, inputs */
--radius-lg: 0.75rem    /* 12px - Cards, modals */
--radius-xl: 1rem       /* 16px - Large containers */
--radius-full: 9999px   /* Circular/pill shapes */
```

### Usage
- Buttons: `--radius-md`
- Cards: `--radius-lg`
- Modals: `--radius-lg`
- Images: `--radius-md`
- Pills/badges: `--radius-full`

## Shadows & Elevation

### Shadow Scale
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

### Elevation Layers
```
z-index: 0     /* Base content */
z-index: 10    /* Dropdowns, tooltips */
z-index: 20    /* Sticky headers */
z-index: 30    /* Modals, dialogs */
z-index: 40    /* Toasts, notifications */
z-index: 50    /* Maximum (debug/dev tools) */
```

### Mobile Shadows
Reduced shadows on mobile for performance:

```css
@media (max-width: 767px) {
  --shadow-md: var(--shadow-sm);
  --shadow-lg: var(--shadow-md);
}
```

## Icons

### Icon System: Lucide Svelte

**Benefits**:
- Consistent stroke width
- Optimized SVGs
- Tree-shakeable
- Accessible by default

### Icon Sizes
```css
--icon-xs: 0.75rem    /* 12px */
--icon-sm: 1rem       /* 16px - Default */
--icon-md: 1.25rem    /* 20px - Emphasized */
--icon-lg: 1.5rem     /* 24px - Headers */
--icon-xl: 2rem       /* 32px - Features */
```

### Icon Usage
```svelte
<script>
  import { FileText, Save, Share } from 'lucide-svelte'
</script>

<!-- Standard size -->
<FileText size={16} />

<!-- Responsive size -->
<Save class="w-4 h-4 md:w-5 md:h-5" />

<!-- With accessibility -->
<Share size={16} aria-label="Share document" />
```

### Icon Color
Icons inherit text color by default:

```css
.icon {
  color: currentColor;
  /* Inherits from parent text color */
}
```

## Transitions & Animations

### Duration Scale
```css
--duration-fast: 150ms      /* Micro-interactions */
--duration-base: 300ms      /* Standard transitions */
--duration-slow: 500ms      /* Complex animations */
```

### Easing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Patterns

#### Fade In
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### Slide In
```css
@keyframes slide-in {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

#### Mobile-Specific
Bottom sheet slide-up:
```css
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

## Responsive Design

### Breakpoint System

#### Standard Breakpoints
```css
/* Mobile first approach */
$breakpoint-sm: 640px;   /* Mobile landscape */
$breakpoint-md: 768px;   /* Tablet portrait */
$breakpoint-lg: 1024px;  /* Desktop */
$breakpoint-xl: 1280px;  /* Large desktop */
$breakpoint-2xl: 1536px; /* Extra large */
```

#### Container Widths
```css
/* Max widths at breakpoints */
.container {
  width: 100%;
  padding: 0 1rem;
  
  @media (min-width: 640px) {
    max-width: 640px;
  }
  
  @media (min-width: 768px) {
    max-width: 768px;
  }
  
  @media (min-width: 1024px) {
    max-width: 1024px;
  }
  
  @media (min-width: 1280px) {
    max-width: 1280px;
  }
}
```

### Mobile-First Utilities

```css
/* Base styles for mobile */
.text-responsive {
  font-size: 1rem;
  
  /* Tablet */
  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
  
  /* Desktop */
  @media (min-width: 1024px) {
    font-size: 1.25rem;
  }
}
```

## Accessibility Features

### Focus Indicators

#### Visible Focus Ring
```css
:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :focus-visible {
    outline-width: 3px;
    outline-color: currentColor;
  }
}
```

### Text Contrast

Ensure WCAG AA compliance:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Skip Links
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--bg-primary);
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

## Dark Mode Toggle

### Implementation
```svelte
<script>
  import { browser } from '$app/environment'
  
  let theme = $state(
    browser 
      ? localStorage.getItem('theme') || 'dark'
      : 'dark'
  )
  
  $effect(() => {
    if (browser) {
      document.documentElement.classList.toggle('dark', theme === 'dark')
      localStorage.setItem('theme', theme)
    }
  })
</script>
```

### System Preference
```css
@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    /* Dark theme variables */
  }
}

@media (prefers-color-scheme: light) {
  :root:not(.dark) {
    /* Light theme variables */
  }
}
```

## Design Tokens

All design values should be defined as CSS custom properties for consistency and themability:

```css
:root {
  /* Colors */
  --color-*: ...;
  
  /* Spacing */
  --space-*: ...;
  
  /* Typography */
  --font-*: ...;
  --text-*: ...;
  
  /* Borders */
  --radius-*: ...;
  
  /* Shadows */
  --shadow-*: ...;
  
  /* Transitions */
  --duration-*: ...;
  --ease-*: ...;
}
```

Use Tailwind's theme extension to sync with design tokens:

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        // etc.
      },
      spacing: {
        // Reference CSS variables
      }
    }
  }
}
```
