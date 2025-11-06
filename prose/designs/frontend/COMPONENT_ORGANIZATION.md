# Component Organization

## Overview

Tonguetoquill uses a feature-based component organization structure that groups related components by their functional domain. This approach improves maintainability, testability, and developer experience by co-locating related files.

## Organization Strategy

### Feature-Based Folders

Components are organized by feature/domain rather than by file type:

- **Sidebar**: Document list navigation and user controls
- **TopMenu**: Header with document actions and settings
- **Editor**: Markdown editing functionality (toolbar, editor, preview)
- **Preview**: Rendered markdown output (may be merged with Editor)
- **ui**: Reusable UI primitives from shadcn-svelte

### UI Library Architecture

Tonguetoquill uses **custom Svelte components** for all UI widgets (dialogs, popovers, sheets, toasts). This provides full control over behavior, accessibility, and theming while reducing external dependencies.

**Widget Components** (src/lib/components/ui/):

- **base-dialog.svelte**: Modal dialog component with focus trapping, ESC key, and backdrop click handling
- **base-popover.svelte**: Popover component with dynamic positioning, click outside, and ESC key dismissal
- **base-sheet.svelte**: Slide-in drawer component with responsive behavior (mobile-friendly)
- **toast.svelte**: Toast notification container with position control
- **switch.svelte**: Toggle switch component with keyboard accessibility
- All components built from scratch using Svelte 5 primitives
- No external UI library dependencies (bits-ui and svelte-sonner removed)

**Supporting Utilities**:

- **portal.svelte**: Teleport component for rendering outside parent DOM
- **focus-trap.ts**: Focus management for modal dialogs
- **use-click-outside.ts**: Click outside detection action
- **toast.svelte.ts**: Toast state management store

**Shared UI Components**:

- **button.svelte**: Button component with variants
- **input.svelte**: Text input component
- **label.svelte**: Form label component

**Third-Party Integration**:

- **lucide-svelte**: Icon library
- **Tailwind CSS**: Styling framework
- No other UI dependencies

**Import Rules:**

- ✓ Feature components → `$lib/components/ui/*`
- ✓ UI utilities → `$lib/utils/*`
- ✗ Feature components → External UI libraries (no longer applicable)
- ✗ Direct DOM manipulation (use Svelte actions and stores instead)

### File Structure Per Component

Each feature folder contains:

```
ComponentName/
├── ComponentName.svelte            # Component implementation
├── style.css                       # Component-specific styles (optional)
└── ComponentName.svelte.test.ts    # Component tests
```

**Notes**:

- `style.css` is optional - only create if component needs styles beyond Tailwind classes
- Tests use `.svelte.test.ts` extension and are co-located with components
- Follow vitest and vitest-browser-svelte testing patterns

## Directory Structure

```
src/lib/components/
├── DocumentInfoDialog.svelte
├── Sidebar/
│   ├── Sidebar.svelte
│   ├── Sidebar.svelte.test.ts
│   ├── SidebarButtonSlot.svelte
│   ├── SidebarButtonSlot.svelte.test.ts
│   └── index.ts
├── TopMenu/
│   ├── TopMenu.svelte
│   └── TopMenu.svelte.test.ts
├── Editor/
│   ├── EditorToolbar.svelte
│   ├── EditorToolbar.svelte.test.ts
│   ├── MarkdownEditor.svelte
│   ├── MarkdownEditor.svelte.test.ts
│   ├── DocumentEditor.svelte
│   └── DocumentEditor.svelte.test.ts
├── Preview/
│   ├── Preview.svelte
│   ├── Preview.svelte.test.ts
│   └── index.ts
├── DocumentList/
│   ├── DocumentList.svelte
│   ├── DocumentList.svelte.test.ts
│   ├── DocumentListItem.svelte
│   ├── DocumentListItem.svelte.test.ts
│   └── index.ts
└── ui/
    ├── base-dialog.svelte
    ├── base-popover.svelte
    ├── base-sheet.svelte
    ├── button.svelte
    ├── input.svelte
    ├── label.svelte
    ├── portal.svelte
    ├── switch.svelte
    └── toast.svelte
```

**Note**: `DocumentInfoDialog.svelte` is at the root level as a standalone dialog component (see [UX_IMPROVEMENTS_2025.md](./UX_IMPROVEMENTS_2025.md) for specification).

## Testing Strategy

### Test Location

Tests are co-located with components using the `.svelte.test.ts` extension:

- Component: `ComponentName.svelte`
- Tests: `ComponentName.svelte.test.ts`

### Testing Framework

- **vitest**: Test runner and assertion library
- **vitest-browser-svelte**: Svelte component testing utilities
- **@vitest/browser**: Browser-based testing context

### Test Pattern

```typescript
import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComponentName from './ComponentName.svelte';

describe('ComponentName', () => {
	it('should render correctly', async () => {
		render(ComponentName);

		const element = page.getByRole('button', { name: 'Click me' });
		await expect.element(element).toBeInTheDocument();
	});
});
```

### Test Coverage

Each component should have tests for:

- Rendering (basic structure and accessibility)
- Props (different prop combinations)
- User interactions (clicks, inputs, keyboard navigation)
- States (loading, error, success)
- Accessibility (ARIA labels, keyboard navigation, screen reader support)

## Import Patterns

Components can be imported using index files for convenience:

```typescript
// Feature folder exports (via index.ts)
import { Sidebar, SidebarButtonSlot } from '$lib/components/Sidebar';
import { DocumentList, DocumentListItem } from '$lib/components/DocumentList';
import { Preview } from '$lib/components/Preview';

// Or direct import
import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
```

Each feature folder includes an `index.ts` that exports its components:

```typescript
// Example: src/lib/components/Sidebar/index.ts
export { default as Sidebar } from './Sidebar.svelte';
export { default as SidebarButtonSlot } from './SidebarButtonSlot.svelte';
```

## Benefits

### Maintainability

- Related files grouped together
- Easier to find component code and tests
- Clear component boundaries

### Testability

- Tests co-located with implementation
- Easy to run tests for specific features
- Clear test coverage per component

### Scalability

- New features get their own folders
- Shared UI components remain separate
- Easy to extract features to separate packages

### Developer Experience

- Intuitive file organization
- Less scrolling through flat lists
- Clear component ownership

## Considerations

### When to Create a New Feature Folder

Create a new feature folder when:

- Component represents a distinct UI feature
- Component has multiple sub-components
- Component has significant business logic
- Component will have multiple test files

Keep in `ui/` when:

- Component is a pure UI primitive (button, input, label)
- Component is a reusable widget (dialog, popover, sheet, toast)
- Component provides utility functionality (portal, focus-trap)

### Style Files

Only create `style.css` files when:

- Component needs CSS animations not possible in Tailwind
- Component has complex pseudo-selectors
- Component needs global CSS variables
- Component requires `@media` queries beyond Tailwind breakpoints

Most components should use Tailwind utility classes inline.

## References

- [UI_COMPONENTS.md](./UI_COMPONENTS.md) - Component specifications
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Visual design system
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Application architecture
