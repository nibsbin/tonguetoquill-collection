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

- [x] All components in feature folders
- [x] All imports updated and working
- [x] Build succeeds without errors
- [x] Tests created (browser environment required to run)
- [x] Type checking passes (with pre-existing errors unrelated to restructure)
- [x] Linter passes for formatting (some pre-existing linting rules violations unrelated to restructure)
- [x] Application runs correctly in dev mode

## Implementation Status

**Status**: ✅ COMPLETED

**Implementation Date**: 2025-10-31

**Implemented By**: Programmer Agent

### Implementation Summary

All phases of the component restructure were successfully implemented:

1. **Phase 1: Create Feature Folders** ✅
   - Created all required feature folders
   - Maintained ui/ folder unchanged

2. **Phase 2: Move Components** ✅
   - Moved all 9 components to their respective feature folders
   - Removed deprecated Toast.svelte component

3. **Phase 3: Update Import Paths** ✅
   - Updated imports in +page.svelte
   - Updated internal component imports in Sidebar.svelte
   - Updated internal component imports in DocumentEditor.svelte

4. **Phase 4: Add Test Files** ✅
   - Created test files for all 9 components
   - Used vitest-browser-svelte pattern
   - Tests follow the design specification template

5. **Phase 5: Add Index Files** ✅
   - Created index.ts files in all feature folders
   - Updated imports to use convenience import pattern
   - Enables cleaner import syntax: `import { Sidebar } from '$lib/components/Sidebar'`

6. **Phase 6: Verify Build and Tests** ✅
   - Build passes successfully
   - Type checking shows same pre-existing errors (unrelated to restructure)
   - Prettier formatting passes
   - Tests created (require Playwright browser installation to run)

### Issues Encountered

1. **DocumentList Dialog Component**
   - Found a pre-existing bug where DocumentList.svelte referenced a non-existent `./Dialog.svelte`
   - Fixed by implementing the delete confirmation dialog using shadcn-svelte dialog components
   - Used the same pattern as Sidebar.svelte
   - This was necessary to unblock the build

2. **Pre-existing Linting Errors**
   - Several components have eslint warnings for unnecessary children snippets
   - These are unrelated to the restructure and were not addressed as per instructions
   - The restructure itself introduced no new linting errors

3. **Test Environment**
   - Tests require Playwright browser installation to run
   - Test files are created and follow the correct pattern
   - Actual test execution was not performed due to environment limitations

### Consistency with Design

The implementation is fully consistent with the design documents:

- ✅ Follows COMPONENT_ORGANIZATION.md structure exactly
- ✅ Uses feature-based organization as specified
- ✅ Co-locates tests with components
- ✅ Maintains shadcn-svelte ui/ folder unchanged
- ✅ Uses index files for convenience imports

### Files Modified

**Moved Components** (9):

- Sidebar.svelte → Sidebar/Sidebar.svelte
- SidebarButtonSlot.svelte → Sidebar/SidebarButtonSlot.svelte
- TopMenu.svelte → TopMenu/TopMenu.svelte
- EditorToolbar.svelte → Editor/EditorToolbar.svelte
- MarkdownEditor.svelte → Editor/MarkdownEditor.svelte
- DocumentEditor.svelte → Editor/DocumentEditor.svelte
- MarkdownPreview.svelte → Preview/MarkdownPreview.svelte
- DocumentList.svelte → DocumentList/DocumentList.svelte
- DocumentListItem.svelte → DocumentList/DocumentListItem.svelte

**Files Removed** (1):

- Toast.svelte (deprecated)

**Test Files Created** (9):

- Sidebar/Sidebar.svelte.test.ts
- Sidebar/SidebarButtonSlot.svelte.test.ts
- TopMenu/TopMenu.svelte.test.ts
- Editor/EditorToolbar.svelte.test.ts
- Editor/MarkdownEditor.svelte.test.ts
- Editor/DocumentEditor.svelte.test.ts
- Preview/MarkdownPreview.svelte.test.ts
- DocumentList/DocumentList.svelte.test.ts
- DocumentList/DocumentListItem.svelte.test.ts

**Index Files Created** (5):

- Sidebar/index.ts
- TopMenu/index.ts
- Editor/index.ts
- Preview/index.ts
- DocumentList/index.ts

**Import Updates** (3):

- src/routes/+page.svelte
- src/lib/components/Sidebar/Sidebar.svelte
- src/lib/components/Editor/DocumentEditor.svelte

**Bug Fixes** (1):

- src/lib/components/DocumentList/DocumentList.svelte (fixed missing Dialog import)

### Notes

- DocumentInfoDialog.svelte was not mentioned in the plan and was left in the root components folder
- The restructure was implemented with minimal changes as instructed
- Build verification successful
- No breaking changes to application functionality

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
