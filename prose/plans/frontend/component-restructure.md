# Component Restructure Plan

## Objective

Transition from flat component organization to feature-based organization as defined in [COMPONENT_ORGANIZATION.md](../../designs/frontend/COMPONENT_ORGANIZATION.md).

## Current State

Components are in a flat structure under `src/lib/components/`:
- Sidebar.svelte
- SidebarButtonSlot.svelte
- TopMenu.svelte
- EditorToolbar.svelte
- MarkdownEditor.svelte
- DocumentEditor.svelte
- MarkdownPreview.svelte
- DocumentList.svelte
- DocumentListItem.svelte
- Toast.svelte
- ui/ (shadcn-svelte components)

## Desired State

Components organized by feature in folders:
- `Sidebar/` - Sidebar and SidebarButtonSlot
- `TopMenu/` - TopMenu component
- `Editor/` - EditorToolbar, MarkdownEditor, DocumentEditor
- `Preview/` - MarkdownPreview
- `DocumentList/` - DocumentList and DocumentListItem
- `ui/` - unchanged (shadcn-svelte components)

Each component has:
- `ComponentName.svelte` - implementation
- `ComponentName.svelte.ts` - tests
- `style.css` - optional component-specific styles

## Implementation Steps

### Phase 1: Create Feature Folders

1. Create new folder structure:
   - `src/lib/components/Sidebar/`
   - `src/lib/components/TopMenu/`
   - `src/lib/components/Editor/`
   - `src/lib/components/Preview/`
   - `src/lib/components/DocumentList/`

2. Keep `src/lib/components/ui/` unchanged

### Phase 2: Move Components

Move components to their feature folders:

**Sidebar feature**:
- `Sidebar.svelte` → `Sidebar/Sidebar.svelte`
- `SidebarButtonSlot.svelte` → `Sidebar/SidebarButtonSlot.svelte`

**TopMenu feature**:
- `TopMenu.svelte` → `TopMenu/TopMenu.svelte`

**Editor feature**:
- `EditorToolbar.svelte` → `Editor/EditorToolbar.svelte`
- `MarkdownEditor.svelte` → `Editor/MarkdownEditor.svelte`
- `DocumentEditor.svelte` → `Editor/DocumentEditor.svelte`

**Preview feature**:
- `MarkdownPreview.svelte` → `Preview/MarkdownPreview.svelte`

**DocumentList feature**:
- `DocumentList.svelte` → `DocumentList/DocumentList.svelte`
- `DocumentListItem.svelte` → `DocumentList/DocumentListItem.svelte`

**Deprecated**:
- `Toast.svelte` - Remove (replaced by shadcn-svelte Sonner)

### Phase 3: Update Import Paths

Update all imports throughout the codebase:

**Files to check**:
- `src/routes/+page.svelte`
- `src/routes/+layout.svelte`
- Any other files importing components

**Import pattern change**:
```typescript
// Before
import Sidebar from '$lib/components/Sidebar.svelte';

// After
import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
```

### Phase 4: Add Test Files

Create test files for each component:

1. `Sidebar/Sidebar.svelte.ts` - basic rendering tests
2. `Sidebar/SidebarButtonSlot.svelte.ts` - button slot tests
3. `TopMenu/TopMenu.svelte.ts` - top menu tests
4. `Editor/EditorToolbar.svelte.ts` - toolbar tests
5. `Editor/MarkdownEditor.svelte.ts` - editor tests
6. `Editor/DocumentEditor.svelte.ts` - document editor tests
7. `Preview/MarkdownPreview.svelte.ts` - preview tests
8. `DocumentList/DocumentList.svelte.ts` - list tests
9. `DocumentList/DocumentListItem.svelte.ts` - list item tests

**Test template**:
```typescript
import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComponentName from './ComponentName.svelte';

describe('ComponentName', () => {
  it('should render', async () => {
    render(ComponentName);
    // Add assertions
  });
});
```

### Phase 5: Add Index Files (Optional)

Create index files for convenience imports:

**Example** (`Sidebar/index.ts`):
```typescript
export { default as Sidebar } from './Sidebar.svelte';
export { default as SidebarButtonSlot } from './SidebarButtonSlot.svelte';
```

This allows:
```typescript
import { Sidebar } from '$lib/components/Sidebar';
```

### Phase 6: Verify Build and Tests

1. Run build: `npm run build`
2. Run tests: `npm run test:unit`
3. Run type check: `npm run check`
4. Run linter: `npm run lint`

## Validation

After completion, verify:
- [ ] All components in feature folders
- [ ] All imports updated and working
- [ ] Build succeeds without errors
- [ ] Tests run successfully
- [ ] Type checking passes
- [ ] Linter passes
- [ ] Application runs correctly in dev mode

## Rollback Plan

If issues occur:
1. Revert git commits
2. Keep changes in a feature branch
3. Fix issues incrementally
4. Re-attempt migration

## Dependencies

None - this is a file organization change only.

## References

- [COMPONENT_ORGANIZATION.md](../../designs/frontend/COMPONENT_ORGANIZATION.md) - Design specification
- [UI_COMPONENTS.md](../../designs/frontend/UI_COMPONENTS.md) - Component specifications
- [ARCHITECTURE.md](../../designs/frontend/ARCHITECTURE.md) - Application architecture

## Notes

This is a design and planning document created by the Architect agent. The Programmer agent will implement the actual file moves, import updates, and test creation based on this plan.
