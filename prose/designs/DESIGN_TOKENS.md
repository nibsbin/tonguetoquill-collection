# Design Tokens

**Centralized design value system for consistent theming across Tonguetoquill.**

## Overview

Design tokens are the atomic design values that define the visual language of Tonguetoquill. All tokens are defined as CSS custom properties in `src/app.css` and registered with Tailwind CSS v4 for utility class generation.

**Key Benefits**:

- Single source of truth for all design values
- Runtime theme switching (light/dark mode)
- Framework-agnostic (works with Tailwind and vanilla JS)
- Type-safe token access via TypeScript
- WCAG AA accessibility compliance

## Token Categories

### Color Tokens

**Surface Colors**:

- `--color-background` - Main background color
- `--color-foreground` - Main text color
- `--color-surface` - Secondary background (cards/panels)
- `--color-surface-elevated` - Elevated surfaces (menu, toolbar)

**Interactive States**:

- `--color-primary` - Primary action color (USAF blue #355e93)
- `--color-primary-foreground` - Text on primary
- `--color-secondary` - Secondary action color
- `--color-secondary-foreground` - Text on secondary

**Semantic Colors**:

- `--color-muted` - Muted backgrounds
- `--color-muted-foreground` - Muted text (#71717a in dark)
- `--color-accent` - Accent backgrounds (hover states)
- `--color-accent-foreground` - Text on accent
- `--color-destructive` - Error/destructive actions (#ef4444)
- `--color-destructive-foreground` - Text on destructive

**UI Elements**:

- `--color-border` - Default border color
- `--color-border-hover` - Border on hover
- `--color-input` - Input field borders
- `--color-ring` - Focus ring color

**Editor Colors**:

- `--color-editor-background` - Editor background
- `--color-editor-foreground` - Editor text
- `--color-editor-line-active` - Active line highlight
- `--color-editor-selection` - Selection background
- `--color-editor-cursor` - Cursor color
- `--color-editor-gutter-background` - Line number gutter
- `--color-editor-gutter-foreground` - Line number text

**Syntax Highlighting**:

- `--color-syntax-keyword` - Keywords (USAF blue #355e93)
- `--color-syntax-identifier` - Identifiers (cyan)
- `--color-syntax-string` - Strings (green)
- `--color-syntax-number` - Numbers (amber)
- `--color-syntax-boolean` - Booleans (purple)
- `--color-syntax-metadata-bg` - Metadata block tint
- `--color-syntax-metadata-border` - Metadata border

### Spacing Tokens

**Base Unit**: 4px (0.25rem)

**Spacing Scale**: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

**Component Heights**:

- Top bar: 48px (`h-12`)
- Sidebar header: 48px (`h-12`)
- Sidebar expanded: 288px (`w-72`)
- Sidebar collapsed: 48px (`w-12`)
- Standard buttons: 40px (`h-10`)
- Medium buttons: 32px (`h-8`)
- Small buttons: 28px (`h-7`)

**Padding Standards**:

- Tight: 4px
- Compact: 8px
- Standard: 16px
- Generous: 24px
- Spacious: 32px

**Mobile Touch Targets**:

- Minimum: 44px
- Spacing: 8px minimum between targets

### Typography Tokens

**Font Families**:

- UI: `'Lato', Arial, sans-serif`
- Editor: `ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, 'Courier New', monospace`
- Preview: `'Crimson Text', Georgia, 'Times New Roman', serif`

**Font Weights**:

- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Black: 900

**Type Scale**:

- XS: 12px
- SM: 14px
- Base: 16px
- LG: 18px
- XL: 20px
- 2XL: 24px
- 3XL: 30px
- 4XL: 36px

**Line Heights**:

- Tight: 1.25 (headings)
- Normal: 1.5 (body text)
- Relaxed: 1.75 (long-form content)

### Border Tokens

**Border Radius**:

- Small: 4px
- Medium: 8px
- Large: 10px (base: `--radius: 0.625rem`)
- XL: 14px
- Full: 9999px (circular/pill)

**Border Widths**:

- Default: 1px
- Heavy: 1.5px (`.top-menu-strong-border`)
- Thick: 2px

### Shadow Tokens

**Shadow Scale**:

- Small: Subtle depth
- Medium: Standard elevation
- Large: Prominent elevation
- XL: Maximum elevation

**Elevation Layers**: See Z-Index Tokens section

### Z-Index Tokens

**Canvas Layers** (0-50):

- `--z-content: 0` - Base content layer
- `--z-canvas-ui: 10` - Sidebar (desktop)
- `--z-canvas-overlay: 20` - Canvas tools (ruler)
- `--z-sidebar-backdrop: 40` - Mobile sidebar backdrop
- `--z-sidebar: 50` - Mobile sidebar

**Widget Layers** (1000-1300):

- `--z-dropdown: 1000` - Dropdowns and selects
- `--z-scoped-backdrop: 1050` - Scoped modal backdrops (utility pages)
- `--z-scoped-content: 1075` - Scoped modal content (About, Terms, Privacy)
- `--z-popover: 1100` - Navigation popovers (kebab menu)
- `--z-toast: 1200` - Toast notifications
- `--z-banner: 1300` - Notification banners

**Modal Layers** (1400-1500):

- `--z-modal-backdrop: 1400` - Global modal backdrops
- `--z-modal-content: 1500` - Global modal content

**Layer Hierarchy Rules**:

1. Scoped content (1050-1075) always below navigation (1100)
2. Navigation popovers (1100) accessible above utility pages
3. Global modals (1400-1500) block all interaction
4. Toasts (1200) above scoped content but below global modals

### Animation Tokens

**Duration Scale**:

- Fast: 150ms (micro-interactions)
- Base: 300ms (standard transitions)
- Slow: 500ms (complex animations)

**Easing Functions**:

- Ease-in: Entry animations
- Ease-out: Exit animations
- Ease-in-out: State changes
- Spring: Playful interactions

**Reduced Motion**: Honor `prefers-reduced-motion` system setting

## Theme System Architecture

### CSS Custom Properties Foundation

**Location**: `src/app.css`

**Pattern**:

```css
:root {
	--color-background: #ffffff;
	--color-foreground: #09090b;
	/* ... light theme tokens ... */
}

.dark {
	--color-background: #18181b;
	--color-foreground: #f4f4f5;
	/* ... dark theme overrides ... */
}
```

**Benefits**:

- Runtime theme switching (no rebuild needed)
- Access from CSS (Tailwind) and JavaScript (CodeMirror)
- Browser-native support with excellent performance
- Standard CSS cascade and inheritance

### Tailwind CSS Integration

**Mechanism**: Tailwind v4 `@theme inline` directive

**Pattern**:

```css
@theme inline {
	--color-background: var(--color-background);
	--color-foreground: var(--color-foreground);
	/* Maps CSS custom properties to Tailwind utilities */
}
```

**Result**:

- `bg-background` → `var(--color-background)`
- `text-foreground` → `var(--color-foreground)`
- Theme changes via `.dark` class instantly update utilities

**Benefits**:

- Single source of truth (CSS custom properties)
- Utilities reference live CSS variables
- Theme switching without CSS rebuild
- Consistency between custom properties and utilities

### CodeMirror Integration

**Utilities** (`src/lib/utils/editor-theme.ts`):

- `createEditorTheme()` - Reads CSS custom properties, generates CodeMirror theme
- `createReactiveEditorTheme()` - Reactive theme updates on mode change

**Pattern**: Generate CodeMirror themes from same CSS custom properties used by Tailwind

### Theme Variants

**Light Theme** (`:root`):

- Background: #ffffff (white)
- Surface Elevated: #fafafa
- Foreground: #09090b (near-black)
- Borders: #e4e4e7 (light gray)
- Syntax adjusted for light background contrast

**Dark Theme** (`.dark`):

- Background: #18181b (zinc-900)
- Surface Elevated: #27272a (zinc-800)
- Foreground: #f4f4f5 (zinc-100)
- Borders: #3f3f46 (zinc-700)
- Syntax adjusted for dark background contrast

**Shared Values**: Colors identical across themes defined once in `:root`

**Zinc Palette Mapping** (dark mode):

- zinc-900 → background
- zinc-800 → surface-elevated
- zinc-700 → borders
- zinc-500 → muted-foreground
- zinc-100 → foreground

### High Contrast Support

**Media Query**: `prefers-contrast: high`

**Enhancements**:

- Increased contrast ratios (7:1 minimum, WCAG AAA)
- Stronger border visibility
- Enhanced focus indicators (3px vs 2px)

## CSS Structure Best Practices

**Selector Organization** (`src/app.css`):

1. **`:root` Block** - CSS custom property definitions only
2. **`.dark` Class** - Dark theme property overrides only
3. **Global Selectors** - Style rules at root level (not nested in `:root`)
4. **Font Family** - Applied to `body`, not `:root`

**Invalid Patterns** (avoid):

- Nesting class/element selectors inside `:root` or `.dark`
- Applying non-custom-property styles to `:root`
- Forgetting to register properties in `@theme inline`

**Rationale**:

- Clear separation between tokens (variables) and styles (rules)
- Easier maintenance and refactoring
- Better compatibility with CSS tools
- Reduced specificity conflicts

## Token Usage Guidelines

### Color Usage

**Semantic Colors**: Use for status messages and feedback

**Contrast Minimums**:

- Normal text: 4.5:1 (WCAG AA)
- Large text (18px+): 3:1 (WCAG AA)
- UI components: 3:1
- High contrast mode: 7:1 (WCAG AAA)

**Guidelines**:

- Never rely on color alone for information
- Test with color blindness simulators
- Use semantic tokens, not hardcoded values

### Spacing Usage

**Responsive Spacing**: Mobile-first approach, increase at larger breakpoints

**Touch Targets**:

- Mobile: 44px minimum
- Desktop: 32px minimum
- Spacing: 8px minimum between targets

### Typography Usage

**Accessibility**:

- Minimum 16px for body text
- 1.5 line height for readability
- Support text resize up to 200%

**Mobile**:

- Larger minimum sizes
- Generous line heights
- Shorter line lengths (60-80 characters)

### Z-Index Usage

**Scoped Modals** (1050-1075):

- Use for informational overlays within containers
- Examples: About, Terms, Privacy pages
- Position: `absolute` within container

**Navigation Overlays** (1100):

- Must always be accessible
- Examples: Kebab menu, user profile menu
- Position: `fixed` at document root

**Global Modals** (1400-1500):

- Critical actions blocking all interaction
- Examples: Delete confirmations, share modal
- Position: `fixed` at document root

## Type Safety

**TypeScript Definitions** (`src/lib/types/theme.ts`):

```typescript
type ColorToken = 'background' | 'foreground' | 'primary' | /* ... */;
type RadiusToken = 'sm' | 'md' | 'lg' | 'xl';

function getThemeValue(token: string): string;
```

**Benefits**:

- Compile-time validation of token usage
- Prevents typos in token references
- IDE autocomplete for available tokens

## Breakpoint Tokens

**Breakpoint System**:

- `sm: 640px` - Mobile landscape
- `md: 768px` - Tablet portrait
- `lg: 1024px` - Desktop
- `xl: 1280px` - Large desktop
- `2xl: 1536px` - Extra large

**Mobile-First**: Base styles for mobile, enhance at larger breakpoints

**Implementation**: Use `min-width` media queries (at exact breakpoint, larger style applies)

## Focus Indicators

**Default**:

- Outline: 2px solid USAF blue
- Offset: 2px

**High Contrast**:

- Outline: 3px solid (via `prefers-contrast: high`)

**Rule**: Never remove focus styles

## Loading Thresholds

**Loading Delay**: 300ms

- Show loading indicator only if operation > 300ms
- Prevents loading flashes for fast operations

**Patterns**:

- **Skeleton Loaders**: Initial content load
- **Spinners**: User-initiated actions
- **Progress Bars**: File operations
- **Preserve State**: Keep previous render during updates

## Token Migration Strategy

### Component Migration

**Replace Hardcoded Colors**:

- `bg-zinc-900 text-zinc-100` → `bg-background text-foreground`

**shadcn-svelte Alignment**:

- Update component variants to use semantic tokens
- Button variants reference primary, accent, destructive
- Ensure hover states use token-based colors

### Adding New Tokens

**Process**:

1. Define CSS custom property in `:root`
2. Define dark variant in `.dark` (if different)
3. Register in `@theme inline` block
4. Add TypeScript type definition
5. Document usage guidelines

## Cross-References

- [ARCHITECTURE.md](ARCHITECTURE.md) - Overall app structure
- [ACCESSIBILITY.md](ACCESSIBILITY.md) - WCAG compliance details
- [SERVICE_FRAMEWORK.md](SERVICE_FRAMEWORK.md) - Service integration patterns

**Component READMEs**:

- `src/lib/components/*/README.md` - Component-specific token usage
- `src/lib/utils/editor-theme.ts` - CodeMirror theme utilities

---

_Pattern Document: Describes the design token system used across the application_
