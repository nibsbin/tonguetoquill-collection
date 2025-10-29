# Theme System Design

## Overview

This design document outlines the centralized theme architecture for tonguetoquill-web that enables consistent theming across both Tailwind CSS-based UI components and the CodeMirror editor, with support for light/dark mode switching.

## Design Goals

1. **Centralized Token Management**: Single source of truth for all color and spacing values
2. **Framework Agnostic**: Works with both Tailwind CSS and vanilla JavaScript (CodeMirror)
3. **Theme Switching**: Support for light/dark mode with seamless transitions
4. **Maintainability**: Easy to update and iterate on themes
5. **Accessibility**: Maintain WCAG 2.1 AA compliance for all color combinations
6. **Type Safety**: Leverage TypeScript for theme token access

## Architecture

### 1. CSS Custom Properties Foundation

All theme tokens will be defined as CSS custom properties in `src/app.css`, following the Tailwind CSS 4.0 `@theme inline` pattern already demonstrated in the legacy mock project.

**Rationale**: CSS custom properties provide:
- Runtime theme switching without rebuilding
- Access from both CSS (Tailwind) and JavaScript (CodeMirror)
- Browser-native support with excellent performance
- Standard CSS cascade and inheritance behavior

### 2. Theme Token Structure

#### 2.1 Color Tokens

Organize colors into semantic categories rather than by palette names:

```css
:root {
  /* Surface colors */
  --color-background: <value>;
  --color-foreground: <value>;
  --color-surface: <value>;
  --color-surface-elevated: <value>;
  
  /* Interactive states */
  --color-primary: <value>;
  --color-primary-foreground: <value>;
  --color-secondary: <value>;
  --color-secondary-foreground: <value>;
  
  /* Semantic colors */
  --color-muted: <value>;
  --color-muted-foreground: <value>;
  --color-accent: <value>;
  --color-accent-foreground: <value>;
  --color-destructive: <value>;
  --color-destructive-foreground: <value>;
  
  /* UI elements */
  --color-border: <value>;
  --color-border-hover: <value>;
  --color-input: <value>;
  --color-ring: <value>;
  
  /* Editor-specific colors */
  --color-editor-background: <value>;
  --color-editor-foreground: <value>;
  --color-editor-line-active: <value>;
  --color-editor-selection: <value>;
  --color-editor-cursor: <value>;
  --color-editor-gutter-background: <value>;
  --color-editor-gutter-foreground: <value>;
}
```

#### 2.2 Spacing & Layout Tokens

```css
:root {
  /* Radius */
  --radius: 0.625rem;
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  
  /* Spacing scale (if needed beyond Tailwind defaults) */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

### 3. Theme Variants (Light/Dark)

Define both light and dark themes using the same token structure:

```css
/* Light theme (default) */
:root {
  --color-background: #ffffff;
  --color-foreground: #09090b;
  /* ... */
}

/* Dark theme */
.dark {
  --color-background: #09090b;
  --color-foreground: #fafafa;
  /* ... */
}
```

**Migration from Zinc**: Map current zinc palette to semantic tokens:
- `zinc-900` (#18181b) → `--color-background` (dark mode)
- `zinc-800` (#27272a) → `--color-surface-elevated` (dark mode)
- `zinc-700` (#3f3f46) → `--color-border` (dark mode)
- `zinc-500` (#71717a) → `--color-muted-foreground` (dark mode)
- `zinc-400` (#a1a1aa) → Secondary text (dark mode)
- `zinc-300` (#d4d4d8) → `--color-foreground` secondary (dark mode)
- `zinc-100` (#f4f4f5) → `--color-foreground` primary (dark mode)
- `zinc-50` (#fafafa) → Highlights (dark mode)

### 4. Tailwind CSS Integration

Extend Tailwind's theme with custom properties using the `@theme inline` directive:

```css
@theme inline {
  --color-background: var(--color-background);
  --color-foreground: var(--color-foreground);
  --color-surface: var(--color-surface);
  --color-surface-elevated: var(--color-surface-elevated);
  
  --color-primary: var(--color-primary);
  --color-primary-foreground: var(--color-primary-foreground);
  
  --color-border: var(--color-border);
  --color-border-hover: var(--color-border-hover);
  
  /* ... map all tokens */
}
```

This allows using tokens in Tailwind classes:
```html
<div class="bg-background text-foreground border-border">
```

### 5. CodeMirror Theme Integration

Create a utility function to generate CodeMirror themes from CSS custom properties:

**File**: `src/lib/utils/editor-theme.ts`

```typescript
import { EditorView } from '@codemirror/view';

/**
 * Creates a CodeMirror theme using CSS custom properties
 * from the document's computed styles
 */
export function createEditorTheme(): Extension {
  // Get computed CSS custom properties at runtime
  const styles = getComputedStyle(document.documentElement);
  
  return EditorView.theme({
    '&': {
      height: '100%',
      fontSize: '14px',
      backgroundColor: styles.getPropertyValue('--color-editor-background').trim()
    },
    '.cm-content': {
      padding: '16px 0',
      color: styles.getPropertyValue('--color-editor-foreground').trim()
    },
    '.cm-cursor': {
      borderLeftColor: styles.getPropertyValue('--color-editor-cursor').trim()
    },
    '.cm-activeLine': {
      backgroundColor: styles.getPropertyValue('--color-editor-line-active').trim()
    },
    '.cm-selectionBackground, .cm-focused .cm-selectionBackground': {
      backgroundColor: styles.getPropertyValue('--color-editor-selection').trim()
    },
    '.cm-gutters': {
      backgroundColor: styles.getPropertyValue('--color-editor-gutter-background').trim(),
      color: styles.getPropertyValue('--color-editor-gutter-foreground').trim(),
      border: 'none'
    },
    // ... other editor elements
  });
}

/**
 * Reactive theme that updates when CSS custom properties change
 * (useful for theme switching)
 */
export function createReactiveEditorTheme(): Extension {
  // Re-create theme on theme changes
  // Implementation will use MutationObserver or manual refresh
}
```

### 6. Theme Switching Mechanism

Use `mode-watcher` library (already in dependencies) for theme management:

**File**: `src/lib/stores/theme.svelte.ts`

```typescript
import { mode, setMode, toggleMode } from 'mode-watcher';

export const theme = {
  current: mode,
  toggle: toggleMode,
  setLight: () => setMode('light'),
  setDark: () => setMode('dark'),
  setSystem: () => setMode('system')
};
```

Initialize in root layout:

```svelte
<script>
  import { ModeWatcher } from 'mode-watcher';
</script>

<ModeWatcher />
```

### 7. Component Migration Strategy

#### Replace Hardcoded Colors

**Before:**
```html
<div class="bg-zinc-900 text-zinc-100">
```

**After:**
```html
<div class="bg-background text-foreground">
```

#### shadcn-svelte Component Alignment

Update existing shadcn-svelte components to use semantic tokens:

```typescript
// button.svelte
const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  outline: 'border border-border hover:bg-accent hover:text-accent-foreground'
};
```

### 8. Type Safety

Create TypeScript types for theme tokens:

**File**: `src/lib/types/theme.ts`

```typescript
export type ColorToken = 
  | 'background'
  | 'foreground'
  | 'surface'
  | 'surface-elevated'
  | 'primary'
  | 'primary-foreground'
  | 'secondary'
  | 'secondary-foreground'
  | 'muted'
  | 'muted-foreground'
  | 'accent'
  | 'accent-foreground'
  | 'destructive'
  | 'destructive-foreground'
  | 'border'
  | 'border-hover'
  | 'input'
  | 'ring'
  | 'editor-background'
  | 'editor-foreground'
  | 'editor-line-active'
  | 'editor-selection'
  | 'editor-cursor'
  | 'editor-gutter-background'
  | 'editor-gutter-foreground';

export type RadiusToken = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Get a CSS custom property value
 */
export function getThemeValue(token: ColorToken | RadiusToken, prefix: 'color' | 'radius' = 'color'): string {
  const propName = `--${prefix}-${token}`;
  return getComputedStyle(document.documentElement).getPropertyValue(propName).trim();
}
```

## Component Replacement Strategy

### Custom Components to Replace

1. **Dialog.svelte** → Replace with shadcn-svelte Dialog component
   - **Reasoning**: shadcn-svelte provides a more feature-rich, accessible dialog with better keyboard navigation, focus trapping, and animation support
   - **Components needed**: dialog, dialog-content, dialog-header, dialog-title, dialog-description
   
2. **Toast.svelte** → Keep as-is (svelte-sonner wrapper)
   - **Reasoning**: svelte-sonner is already well-integrated and provides excellent toast functionality. The wrapper is minimal and just configures the toaster.
   - **Action**: Update wrapper to use theme tokens for consistency

### shadcn-svelte Components to Add

1. **Dialog** - Replace custom Dialog.svelte
2. **Input** - For consistent form inputs (login/register pages)
3. **Card** - For structured content display (optional, for future use)
4. **Textarea** - For multi-line inputs (optional, for future use)

### Existing shadcn-svelte Components

Keep and update to use theme tokens:
- button.svelte
- dropdown-menu-*.svelte
- popover-*.svelte
- sheet-*.svelte
- switch.svelte
- separator.svelte
- label.svelte

## Accessibility Considerations

### Color Contrast

All color combinations must maintain WCAG 2.1 AA compliance:
- Normal text: minimum 4.5:1 contrast ratio
- Large text: minimum 3:1 contrast ratio
- UI components: minimum 3:1 contrast ratio

### Focus Indicators

Maintain visible focus indicators using `--color-ring`:
```css
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

### Theme Preference Respect

- Default to system theme preference
- Persist user's manual theme selection in localStorage (mode-watcher handles this)
- Avoid flash of unstyled content (FOUC) on initial load

## Implementation Phases

This design supports a phased implementation approach (detailed in the plan document):

1. **Phase 1**: Define CSS custom properties and theme variants
2. **Phase 2**: Integrate with Tailwind CSS
3. **Phase 3**: Create CodeMirror theme utilities
4. **Phase 4**: Migrate components to use semantic tokens
5. **Phase 5**: Replace custom components with shadcn-svelte
6. **Phase 6**: Add theme switching UI

## Future Enhancements

1. **Multiple Theme Support**: Beyond light/dark (e.g., high contrast, color blind modes)
2. **Custom Theme Builder**: Allow users to customize their theme
3. **Theme Presets**: Curated theme collections
4. **CSS-in-JS Integration**: If needed for dynamic theming
5. **Animation Tokens**: Centralize animation durations and easings

## References

- [Tailwind CSS 4.0 Theme Configuration](https://tailwindcss.com/docs/theme)
- [shadcn-svelte Theming](https://www.shadcn-svelte.com/docs/theming)
- [mode-watcher Documentation](https://mode-watcher.svecosystem.com/)
- [CodeMirror Theming Guide](https://codemirror.net/examples/styling/)
- [WCAG 2.1 Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
