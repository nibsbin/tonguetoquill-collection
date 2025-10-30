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

### File Structure Per Component

Each feature folder contains:

```
ComponentName/
├── ComponentName.svelte       # Component implementation
├── style.css                  # Component-specific styles (optional)
└── ComponentName.svelte.ts    # Component tests
```

**Notes**:
- `style.css` is optional - only create if component needs styles beyond Tailwind classes
- Tests use `.svelte.ts` extension and are co-located with components
- Follow vitest and vitest-browser-svelte testing patterns

## Directory Structure

```
src/lib/components/
├── Sidebar/
│   ├── Sidebar.svelte
│   ├── Sidebar.svelte.ts
│   ├── SidebarButtonSlot.svelte
│   └── SidebarButtonSlot.svelte.ts
├── TopMenu/
│   ├── TopMenu.svelte
│   └── TopMenu.svelte.ts
├── Editor/
│   ├── EditorToolbar.svelte
│   ├── EditorToolbar.svelte.ts
│   ├── MarkdownEditor.svelte
│   ├── MarkdownEditor.svelte.ts
│   ├── DocumentEditor.svelte
│   └── DocumentEditor.svelte.ts
├── Preview/
│   ├── MarkdownPreview.svelte
│   └── MarkdownPreview.svelte.ts
├── DocumentList/
│   ├── DocumentList.svelte
│   ├── DocumentList.svelte.ts
│   ├── DocumentListItem.svelte
│   └── DocumentListItem.svelte.ts
└── ui/
    ├── button.svelte
    ├── dialog.svelte
    ├── dropdown-menu.svelte
    └── ... (shadcn-svelte components)
```

## Testing Strategy

### Test Location

Tests are co-located with components using the `.svelte.ts` extension:
- Component: `ComponentName.svelte`
- Tests: `ComponentName.svelte.ts`

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

## Migration from Current Structure

The current flat structure in `src/lib/components/` will be reorganized into feature folders:

**Current** → **New**:
- `Sidebar.svelte` → `Sidebar/Sidebar.svelte`
- `SidebarButtonSlot.svelte` → `Sidebar/SidebarButtonSlot.svelte`
- `TopMenu.svelte` → `TopMenu/TopMenu.svelte`
- `EditorToolbar.svelte` → `Editor/EditorToolbar.svelte`
- `MarkdownEditor.svelte` → `Editor/MarkdownEditor.svelte`
- `DocumentEditor.svelte` → `Editor/DocumentEditor.svelte`
- `MarkdownPreview.svelte` → `Preview/MarkdownPreview.svelte`
- `DocumentList.svelte` → `DocumentList/DocumentList.svelte`
- `DocumentListItem.svelte` → `DocumentList/DocumentListItem.svelte`
- `Toast.svelte` → (replaced by shadcn-svelte Sonner, can be removed)
- `ui/*` → `ui/*` (unchanged)

## Import Path Updates

After reorganization, imports will change:

```typescript
// Before
import Sidebar from '$lib/components/Sidebar.svelte';

// After
import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
```

Consider creating index files for convenience:

```typescript
// src/lib/components/Sidebar/index.ts
export { default as Sidebar } from './Sidebar.svelte';
export { default as SidebarButtonSlot } from './SidebarButtonSlot.svelte';
```

Then imports become:

```typescript
import { Sidebar, SidebarButtonSlot } from '$lib/components/Sidebar';
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
- Component is a pure UI primitive
- Component is reusable across features
- Component comes from shadcn-svelte

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
