# UI Library Consolidation Plan

**Status**: In Progress
**Created**: 2025-11-05
**Related Design**: [COMPONENT_ORGANIZATION.md](../designs/frontend/COMPONENT_ORGANIZATION.md#ui-library-architecture)

## Overview

Consolidate UI library usage to ensure shadcn-svelte is the sole authoritative UI foundation. Currently, svelte-sonner is imported directly in feature components, bypassing the shadcn-svelte wrapper pattern.

## Current State

### Correct Usage ✓

- **bits-ui**: Only imported within `src/lib/components/ui/` components (shadcn-svelte layer)
- All 15 bits-ui imports are in ui/ folder as intended
- No direct bits-ui usage in feature components

### Issues Identified ✗

- **svelte-sonner**: Imported directly in 3 files outside ui/ folder:
  - `src/routes/+page.svelte` (Toaster component)
  - `src/lib/stores/toast.svelte.ts` (toast wrapper)
  - `src/lib/components/Editor/DocumentEditor.svelte` (direct toast call)

## Goals

1. **Maintain Layered Architecture**: Preserve bits-ui → shadcn-svelte → feature components
2. **Wrap External Libraries**: Create shadcn-svelte wrapper for svelte-sonner
3. **Enforce Import Rules**: All feature code imports from `$lib/components/ui/*`
4. **Simplify Dependencies**: Keep bits-ui and svelte-sonner as peer dependencies only

## Implementation Steps

### Phase 1: Create Sonner Wrapper Component

Create `src/lib/components/ui/sonner.svelte` following shadcn-svelte patterns:

- Export `Toaster` component (wrapper around svelte-sonner's Toaster)
- Export `toast` function (re-export from svelte-sonner)
- Apply theme integration (dark mode support via mode-watcher)
- Match existing shadcn-svelte component patterns

### Phase 2: Update Feature Components

Replace direct svelte-sonner imports with ui/sonner wrapper:

**File: `src/routes/+page.svelte`**

- Change: `import { Toaster, toast } from 'svelte-sonner'`
- To: `import { Toaster, toast } from '$lib/components/ui/sonner'`

**File: `src/lib/stores/toast.svelte.ts`**

- Change: `import { toast as sonner } from 'svelte-sonner'`
- To: `import { toast as sonner } from '$lib/components/ui/sonner'`

**File: `src/lib/components/Editor/DocumentEditor.svelte`**

- Change: `import { toast } from 'svelte-sonner'`
- To: `import { toast } from '$lib/components/ui/sonner'`

### Phase 3: Update Index Exports

Add sonner to `src/lib/components/ui/index.ts`:

- Export both `Toaster` component and `toast` function
- Maintain consistent barrel export pattern

### Phase 4: Verification

1. **Grep Verification**: Ensure no direct imports remain

   ```bash
   grep -r "from 'svelte-sonner'" src/
   grep -r "from 'bits-ui'" src/ --exclude-dir="src/lib/components/ui"
   ```

2. **Functional Testing**:
   - Test toast notifications in all contexts
   - Verify dark mode integration
   - Check toast positioning and styling
   - Validate accessibility (screen reader announcements)

3. **Build Verification**:
   ```bash
   npm run check
   npm run build
   ```

### Phase 5: Documentation Updates

Update design docs to reflect the implementation:

- Mark COMPONENT_ORGANIZATION.md UI Library Architecture section as implemented
- Update ARCHITECTURE.md to reference ui/sonner instead of svelte-sonner directly
- Document import patterns in developer guidelines

## Dependencies

**Keep as peer dependencies** (used by shadcn-svelte components):

- `bits-ui`: Required by shadcn-svelte dialog, dropdown, popover, sheet, switch
- `svelte-sonner`: Required by shadcn-svelte sonner wrapper

**No changes needed** to package.json dependencies.

## Testing Checklist

- [ ] Toast notifications appear correctly
- [ ] Dark mode theme applies to toasts
- [ ] Multiple toasts stack properly
- [ ] Toast dismiss actions work
- [ ] Success/error/info toast variants display correctly
- [ ] Toast duration and position settings work
- [ ] Screen readers announce toast content
- [ ] No runtime errors in console
- [ ] Build succeeds without warnings

## Success Criteria

1. ✓ No direct imports of svelte-sonner outside ui/ folder
2. ✓ No direct imports of bits-ui outside ui/ folder
3. ✓ All feature components import from $lib/components/ui/\*
4. ✓ Toast functionality preserved across all use cases
5. ✓ Build and type checking pass
6. ✓ Design documentation updated

## KISS Principles Applied

- **Keep wrapper thin**: Re-export svelte-sonner with minimal customization
- **No abstractions**: Don't create custom toast API, use svelte-sonner's directly
- **Single responsibility**: Wrapper only handles theme integration and re-exports

## DRY Principles Applied

- **Single import source**: All toast usage goes through one wrapper
- **Centralized theme config**: Theme settings in one location (ui/sonner.svelte)
- **Shared types**: Use svelte-sonner types, don't duplicate

## Rollback Plan

If issues arise:

1. Revert wrapper component changes
2. Restore direct svelte-sonner imports
3. Document specific issue for future resolution

## Notes

- bits-ui is NOT being removed (it's required by shadcn-svelte)
- svelte-sonner is NOT being removed (it's used by shadcn-svelte wrapper)
- This change only affects import paths, not functionality
- Zero breaking changes to toast API or behavior
