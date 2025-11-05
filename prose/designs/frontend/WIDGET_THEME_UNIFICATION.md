# Widget Theme Unification

## Overview

This design document describes the unified theming approach for all widget components in Tonguetoquill, ensuring consistent visual appearance, spacing, and behavior across the application.

## Problem Statement

The following widgets currently have inconsistent theming:

1. **Document Info Dialog** - Partially uses semantic tokens
2. **Import File Dialog** - Uses hardcoded neutral colors instead of semantic tokens
3. **Ruler Tool Overlay** - Mixed approach with one hardcoded green color
4. **Settings Popover** - Good use of semantic tokens but inconsistent spacing
5. **Account Information Modal** - Good use of semantic tokens but inconsistent spacing
6. **Login Popover** - Hardcoded success/error colors instead of semantic tokens

### Specific Issues

- **Hardcoded colors**: `bg-white`, `dark:bg-neutral-800`, `text-neutral-900`, `dark:text-neutral-100`, etc.
- **Inconsistent success/error colors**: `bg-green-50`, `dark:bg-green-900/20`, `bg-red-50`, `dark:bg-red-900/20`
- **Mixed color approaches**: Some widgets use semantic tokens, others use hardcoded values
- **Inconsistent spacing**: Padding, margins, and gaps vary across widgets
- **Inconsistent layouts**: Dialog headers, footers, and content areas have different structures

## Design Goals

1. **Complete semantic token usage**: All widgets use CSS custom properties from `src/app.css`
2. **Consistent spacing**: Use standardized padding, margins, and gaps across all widgets
3. **Consistent layouts**: Standardize dialog/popover/modal structure and hierarchy
4. **Theme-agnostic**: Widgets work seamlessly in both light and dark modes
5. **Accessibility**: Maintain WCAG AA contrast ratios and focus indicators
6. **Maintainability**: Single source of truth for all design tokens

## Design Principles

### 1. Semantic Color Tokens

All widgets must use semantic tokens from `src/app.css`:

**Surface Colors:**
- `bg-background` - Main background
- `bg-surface` - Secondary background for cards/panels
- `bg-surface-elevated` - Elevated surfaces (dialogs, popovers)
- `text-foreground` - Main text
- `text-muted-foreground` - Secondary/muted text

**Interactive States:**
- `bg-primary` / `text-primary-foreground` - Primary actions
- `bg-secondary` / `text-secondary-foreground` - Secondary actions
- `bg-accent` / `text-accent-foreground` - Hover states
- `bg-destructive` / `text-destructive-foreground` - Delete/destructive actions

**UI Elements:**
- `border-border` - Default borders
- `border-border-hover` - Hover state borders

**Status/Feedback Colors (NEW):**
- `bg-success` / `text-success-foreground` / `border-success` - Success states
- `bg-info` / `text-info-foreground` / `border-info` - Info states

### 2. Missing Semantic Tokens

The following semantic tokens need to be added to `src/app.css`:

**Success Colors:**
```css
/* Light Theme */
--color-success: #16a34a; /* green-600 */
--color-success-foreground: #14532d; /* green-900 */
--color-success-background: #f0fdf4; /* green-50 */
--color-success-border: #bbf7d0; /* green-200 */

/* Dark Theme */
--color-success: #22c55e; /* green-500 */
--color-success-foreground: #bbf7d0; /* green-200 */
--color-success-background: #14532d; /* green-900 */
--color-success-border: #166534; /* green-800 */
```

**Info Colors:**
```css
/* Light Theme */
--color-info: #2563eb; /* blue-600 */
--color-info-foreground: #1e3a8a; /* blue-900 */
--color-info-background: #eff6ff; /* blue-50 */
--color-info-border: #bfdbfe; /* blue-200 */

/* Dark Theme */
--color-info: #3b82f6; /* blue-500 */
--color-info-foreground: #bfdbfe; /* blue-200 */
--color-info-background: #1e3a8a; /* blue-900 */
--color-info-border: #1e40af; /* blue-800 */
```

### 3. Standardized Spacing

All widgets use consistent spacing based on the design system:

**Dialog/Popover Structure:**
- **Padding**: `p-6` (24px) for dialog content, `p-4` (16px) for popovers
- **Header spacing**: `mb-4` (16px) or `mb-6` (24px) depending on context
- **Section spacing**: `space-y-4` (16px) for grouped content
- **Item spacing**: `space-y-2` (8px) or `space-y-3` (12px) for list items
- **Button spacing**: `gap-2` (8px) between buttons

**Typography:**
- **Dialog titles**: `text-lg font-semibold` (18px, 600 weight)
- **Section headers**: `text-sm font-medium text-muted-foreground` (14px, 500 weight)
- **Body text**: `text-base text-foreground` or `text-sm text-foreground`
- **Helper text**: `text-xs text-muted-foreground` (12px)

### 4. Consistent Layouts

**Dialog Structure:**
```
DialogContent
  ├── DialogHeader
  │   ├── DialogTitle (with close button if needed)
  │   └── DialogDescription (optional)
  ├── Content Section(s)
  └── DialogFooter (optional, for actions)
```

**Popover Structure:**
```
PopoverContent
  ├── Header (title + close button)
  ├── Content Section(s)
  └── Footer (optional)
```

**Common Patterns:**
- Close buttons: Always top-right, `h-6 w-6` icon buttons with `X` icon
- Headers: Always include title, optional description
- Content: Use `space-y-*` for vertical rhythm
- Footers: Right-aligned buttons with consistent spacing

### 5. Component-Specific Guidelines

#### Document Info Dialog
- Use `bg-surface-elevated` instead of `bg-background` for elevated feel
- Maintain centered stats grid with emphasized numbers
- Keep dates de-emphasized with `text-muted-foreground`

#### Import File Dialog
- Replace all hardcoded `neutral-*` colors with semantic tokens
- Use `bg-surface-elevated` for dialog background
- Use `border-border` and `border-border-hover` for dashed upload area
- Success/error messages use new success/error tokens

#### Ruler Tool Overlay
- Replace hardcoded `#22c55e` (green-500) with `--color-success` token
- Keep instruction banner with semantic tokens
- Maintain crosshair cursor and measurement functionality

#### Login Popover
- Replace hardcoded success/error backgrounds with semantic tokens
- Use `bg-success-background`, `text-success-foreground`, `border-success` for success
- Use `bg-error-background`, `text-error-foreground`, `border-error` for errors
- Maintain OAuth button prominence

#### Settings Popover
- Already good, ensure consistent spacing with `p-4` and `space-y-4`
- Ensure all labels use `text-foreground/80` or `text-muted-foreground`

#### Account Information Modal
- Already good, ensure consistent spacing
- Maintain definition list structure for user info
- Keep Sign Out button as secondary action

## Implementation Strategy

### Phase 1: Semantic Token Addition
1. Add success and info color tokens to `src/app.css`
2. Add Tailwind mappings for new tokens

### Phase 2: Widget Updates
1. Update each widget to use semantic tokens exclusively
2. Standardize spacing and layouts
3. Remove all hardcoded colors
4. Ensure light/dark theme compatibility

### Phase 3: Validation
1. Visual review in both light and dark modes
2. Accessibility audit (contrast ratios, focus indicators)
3. Responsive behavior check
4. Cross-browser testing

## Success Criteria

- ✅ Zero hardcoded colors in widget components
- ✅ All widgets use semantic tokens from `src/app.css`
- ✅ Consistent spacing and layouts across all widgets
- ✅ Seamless light/dark theme switching
- ✅ WCAG AA contrast compliance
- ✅ Maintainable single source of truth for design tokens

## References

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Complete design system specification
- [COMPONENT_ORGANIZATION.md](./COMPONENT_ORGANIZATION.md) - Component structure guidelines
- [Tailwind CSS Custom Properties](https://tailwindcss.com/docs/customizing-colors#using-css-variables)
- [WCAG 2.1 Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
