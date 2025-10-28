# Design System

## Color Palette

### Primary Colors
```css
Primary Blue: #355e93
```
This is the main brand color specified by the client but currently not actively used in the dark theme implementation. It's reserved for future theming enhancements.

### Dark Theme Colors (Current Implementation)

#### Background Colors
```css
--background: oklch(0.145 0 0)        /* Main app background - zinc-900 equivalent */
--card: oklch(0.145 0 0)              /* Card backgrounds */
--popover: oklch(0.145 0 0)           /* Popover backgrounds */

Sidebar: zinc-900 (#18181b)
TopMenu: zinc-800 (#27272a)
Editor Toolbar: zinc-800 (#27272a)
Editor Background: zinc-900 (#18181b)
Preview Background: white (#ffffff)
```

#### Foreground/Text Colors
```css
--foreground: oklch(0.985 0 0)        /* Primary text - zinc-100 equivalent */
--muted-foreground: oklch(0.708 0 0)  /* Secondary text - zinc-400 equivalent */

Primary Text: zinc-100 (#f4f4f5)
Secondary Text: zinc-300 (#d4d4d8)
Tertiary Text: zinc-400 (#a1a1aa)
```

#### Interactive Elements
```css
Hover Background: zinc-800 (#27272a)
Hover Background (Alt): zinc-700 (#3f3f46)
Active/Selected: zinc-700 (#3f3f46)
```

#### Borders & Separators
```css
--border: oklch(0.269 0 0)
--sidebar-border: oklch(0.269 0 0)

Border Color: zinc-700 (#3f3f46)
```

#### Semantic Colors
```css
--destructive: oklch(0.396 0.141 25.723)           /* Error/delete actions */
--destructive-foreground: oklch(0.637 0.237 25.331)

Destructive Hover: red-400 (for delete icons)
Success: (Managed via toast notifications)
```

### Light Theme Colors (Future Implementation)
The design system includes support for light mode through CSS variables, though it's not currently active:

```css
--background: #ffffff
--foreground: oklch(0.145 0 0)
Primary Blue: #355e93 (for accents)
Secondary Blue: (variations of primary)
Grays: Various shades for backgrounds and text
```

## Typography

### Font Families

#### UI Font: Lato
```css
font-family: 'Lato', Arial, sans-serif;
```
**Usage**: All UI elements, buttons, labels, menu items
**Weights Available**:
- 100 (Thin)
- 300 (Light)
- 400 (Regular) - Default for body text
- 700 (Bold) - Used for brand name "Tonguetoquill"
- 900 (Black)

**Special Application**:
- Sidebar brand title: Lato 700 (Bold), 1.2rem

#### Editor Font: Monospace
```css
font-family: monospace;
```
**Usage**: Markdown editor textarea
**Purpose**: Code-friendly editing experience

#### Preview Font: Crimson Text
```css
font-family: 'Crimson Text', serif;
```
**Usage**: Rendered markdown content in preview pane
**Weights Available**: 400, 600, 700 (regular and italic variants)

### Font Sizes

Base font size is set to 16px via CSS variable:
```css
--font-size: 16px;
```

**Typography Scale** (via Tailwind defaults):
- Base (1rem / 16px) - Default for most UI elements
- Large (1.125rem / 18px) - Headings level 3
- XL (1.25rem / 20px) - Headings level 2
- 2XL (1.5rem / 24px) - Headings level 1
- Small (0.875rem / 14px) - Secondary labels
- XS (0.75rem / 12px) - Used in tabs (Markdown/Wizard toggle)

**Special Cases**:
- Sidebar brand title: 1.2rem (19.2px)
- Editor toolbar buttons: Icons at 16px (h-4 w-4)
- Top menu logo: 24px height (h-6)

### Font Weights
```css
--font-weight-normal: 400
--font-weight-medium: 500
```

**Usage**:
- Buttons: 500 (medium)
- Labels: 500 (medium)
- Body text: 400 (normal)
- Headings: 500 (medium)
- Brand title: 700 (bold, explicit)

### Line Heights
```css
line-height: 1.5
```
Applied consistently across all typography elements for optimal readability.

## Spacing System

### Layout Spacing

#### Vertical Spacing
```
Top Menu Height: 3rem (48px) - h-12
Sidebar (Expanded): 14rem (224px) - w-56
Sidebar (Collapsed): 3rem (48px) - w-12
Editor Toolbar Height: 2.5rem (40px) - h-10
```

#### Padding
```
Container Padding:
- Sidebar: 0.5rem (8px) - p-2
- Top Menu: 1rem (16px) - px-4
- Editor Toolbar: 0.5rem (8px) - px-2
- Editor Content: 1rem (16px) - p-4
- Preview Content: 1.5rem (24px) - p-6
- Popover Content: 1rem (16px) - p-4
```

#### Gaps
```
Button Groups: 0.25rem (4px) - gap-1
Toolbar Items: 0.25rem (4px) - gap-1
Top Menu Items: 0.5rem (8px) - gap-2
File List Items: 0.25rem (4px) - space-y-1
Settings Toggles: 1rem (16px) - space-y-4
Icon + Text: 0.5rem (8px) - mr-2
```

### Border Radius
```css
--radius: 0.625rem (10px)
```

**Derived Values**:
- Small: calc(var(--radius) - 4px) = 6px
- Medium: calc(var(--radius) - 2px) = 8px
- Large: var(--radius) = 10px
- XL: calc(var(--radius) + 4px) = 14px

**Component Applications**:
- Buttons: Medium radius (via shadcn defaults)
- Inputs: Medium radius
- Popovers/Dropdowns: Medium radius
- Cards: Large radius

## Transitions & Animations

### Duration
```css
Sidebar expand/collapse: 300ms
Fade-in animations: 300ms (via Motion)
Opacity transitions: 300ms
```

### Easing
- Default: CSS ease-in-out
- Custom animations: Motion default spring physics

### Animation Types
1. **Sidebar Toggle**
   - Width transition: 300ms
   - Content fade-in: opacity + animate-in
   
2. **File List**
   - Fade in when sidebar expands
   - Fade out when sidebar collapses

3. **Delete Button**
   - Opacity on hover: 0 → 100%
   - Group hover interaction

4. **Toolbar Icons**
   - Color transition on hover
   - Background color transition

## Shadows & Effects

### Elevation
Currently minimal elevation is used in the design:
- Popovers/Dropdowns: No explicit shadow (relying on border contrast)
- Buttons: No shadows (flat design)
- Sidebar: No shadow (integrated into layout)

### Focus States
```css
--ring: oklch(0.708 0 0)           /* Light theme */
--ring: oklch(0.439 0 0)           /* Dark theme */
```
Applied via Tailwind's outline-ring utilities.

## Icons

### Icon Library
**Lucide React** - Consistent, minimal icon set

### Icon Sizes
```
Small Icons: 16px (h-4 w-4)
- Toolbar format buttons
- Menu item icons
- File icons
- Delete icons

Medium Icons: 20px (h-5 w-5)
- Hamburger menu
- Settings gear
- User profile

Small Accent Icons: 12px (h-3 w-3)
- External link indicators in dropdown menu
```

### Icon Colors
- Default: zinc-400
- Hover: zinc-100
- Active: zinc-100
- Destructive hover: red-400

## Interactive States

### Buttons
```
Default: text-zinc-400, transparent background
Hover: text-zinc-100, bg-zinc-700/800
Active: (same as hover)
Disabled: (not currently implemented)
```

### File List Items
```
Inactive: text-zinc-400, transparent background
Inactive Hover: text-zinc-100, bg-zinc-800
Active: text-zinc-100, bg-zinc-700
```

### Toggle Switches
```
Off: bg-switch-background (zinc-400 equivalent)
On: bg-primary (zinc-100 in dark mode)
```

### Tabs (Markdown/Wizard Toggle)
```
Inactive: text-zinc-400, transparent background
Active: text-zinc-100, bg-zinc-700
Container: bg-zinc-900
```

## Accessibility Considerations

### Color Contrast
- Text on dark backgrounds meets WCAG AA standards
- Preview uses black text on white for maximum readability
- Interactive elements have clear hover states

### Focus Indicators
- Outline ring applied via Tailwind utilities
- Visible focus states on all interactive elements

### Typography
- Base font size: 16px (meets accessibility standards)
- Line height: 1.5 (comfortable reading)
- Font weights provide clear hierarchy

## Design Tokens Reference

All design tokens are defined in `/styles/globals.css` using CSS custom properties:
- Light mode: `:root` selector
- Dark mode: `.dark` class
- Applied via `@theme inline` for Tailwind v4.0 integration
