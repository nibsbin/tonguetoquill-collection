# Dead Code Cleanup Plan

**Problem**: Dead and obsolete functions exist in the codebase, creating maintenance burden and confusion.

**Unifying Insight**: Utility functions should be defined once, exported from a single canonical location, and internal-only functions should not be exported.

**Solution**: Remove duplicate functions, delete unused exports, and consolidate utility modules.

---

## Identified Dead/Obsolete Code

### 1. Duplicate `cn()` Function (3 Definitions)

**Problem**: The same utility function exists in three files with identical implementation.

**Locations**:

- `src/lib/utils/cn.ts` (6 lines) - Currently imported by 11 files
- `src/lib/utils/index.ts` (lines 6-8) - Currently imported by 1 file
- `src/lib/utils.ts` (9 lines, includes JSDoc comment) - Best documented version

**Current usage**:

- 11 files import from `$lib/utils/cn`
- 1 file imports from `$lib/utils`
- 0 files import from `$lib/utils.ts` directly

**Decision**: Keep `src/lib/utils/cn.ts` as the canonical source since it's the most widely used import path.

**Actions**:

- Remove `cn()` function from `src/lib/utils/index.ts`
- Remove `src/lib/utils.ts` file entirely (after verifying no other exports)
- Migrate JSDoc comment from `src/lib/utils.ts` to `src/lib/utils/cn.ts`
- Update the single file importing from `$lib/utils` to use `$lib/utils/cn`

**Impact**: Removes ~15 lines of duplicate code

---

### 2. Unused `flyAndScale()` Function

**Problem**: Transition helper function is exported but never imported anywhere in the codebase.

**Location**: `src/lib/utils/index.ts` (lines 17-56, ~40 lines)

**Current usage**: None - zero imports found

**Decision**: Remove completely as it serves no purpose.

**Context**: This appears to be scaffolding code from a UI library that was never utilized. The application may have been using this transition at some point or it was included as a template but never actually used.

**Actions**:

- Remove `flyAndScale()` function and all related helper functions (`scaleConversion`, `styleToString`)
- Remove associated imports (`cubicOut` from `svelte/easing`, `TransitionConfig` type)
- Remove `FlyAndScaleParams` type definition

**Impact**: Removes ~40 lines of unused code

---

### 3. Unnecessary Exports in `focus-trap.ts`

**Problem**: Internal helper functions are exported but never imported directly by other modules.

**Location**: `src/lib/utils/focus-trap.ts`

**Exports**:

- `getFocusableElements()` - Only used internally within the file
- `createFocusTrap()` - Only used internally by `focusTrap()` action
- `focusTrap()` - The only function actually imported (by `use-focus-trap.ts`)

**Current usage**: Only `focusTrap()` is imported; the other two are internal implementations.

**Decision**: Make `getFocusableElements()` and `createFocusTrap()` non-exported (remove `export` keyword).

**Rationale**: These are implementation details of the `focusTrap()` action and should not be part of the public API. Keeping them non-exported:

- Reduces API surface area
- Prevents accidental coupling to internal implementation
- Makes it clear what the intended public interface is

**Actions**:

- Remove `export` keyword from `getFocusableElements()`
- Remove `export` keyword from `createFocusTrap()`
- Keep `focusTrap()` as the only exported function

**Impact**: Reduces exported API surface, improves encapsulation

---

### 4. Empty Barrel Export File

**Problem**: `src/lib/index.ts` contains only a comment and no exports.

**Location**: `src/lib/index.ts`

**Current content**:

```
// place files you want to import through the `$lib` alias in this folder.
```

**Current usage**: This file enables the `$lib` alias but exports nothing.

**Decision**: Keep file but clarify its purpose.

**Rationale**: This file is required by SvelteKit to enable the `$lib` path alias. While it exports nothing, it serves as a marker file for the build system.

**Actions**:

- Update comment to clarify this is a required marker file for SvelteKit
- Add note that exports should use specific paths like `$lib/utils/cn` rather than re-exporting through this file

**Impact**: Improves developer understanding, prevents confusion

---

## Cleanup Strategy

### Phase 1: Remove Dead Code (Zero Risk)

Remove code that is provably unused:

1. Remove `flyAndScale()` and related code from `src/lib/utils/index.ts`
2. Remove unused imports in same file

### Phase 2: Consolidate Duplicates (Low Risk)

Merge duplicate implementations:

1. Enhance `src/lib/utils/cn.ts` with JSDoc from `src/lib/utils.ts`
2. Remove `cn()` from `src/lib/utils/index.ts`
3. Remove `src/lib/utils.ts` file
4. Update single import from `$lib/utils` to `$lib/utils/cn`

### Phase 3: Improve Encapsulation (Zero Risk)

Hide internal implementation details:

1. Remove `export` from `getFocusableElements()` in focus-trap.ts
2. Remove `export` from `createFocusTrap()` in focus-trap.ts

### Phase 4: Documentation Improvements (Zero Risk)

Clarify purpose of remaining files:

1. Update `src/lib/index.ts` comment to explain its role
2. Add JSDoc to `src/lib/utils/cn.ts` if not already present

---

## Testing Strategy

After each phase:

1. Run type checking: `npm run check`
2. Run linter: `npm run lint`
3. Run unit tests: `npm run test:unit`
4. Run build: `npm run build`

If any phase causes failures, investigate and fix before proceeding.

---

## Success Criteria

- [ ] All duplicate code removed
- [ ] All unused exports deleted
- [ ] All tests passing
- [ ] Type checking passes
- [ ] Linter passes
- [ ] Build succeeds
- [ ] Zero reduction in functionality
- [ ] Improved code maintainability

---

## Benefits

**Maintainability**:

- Single source of truth for each utility
- Clearer API boundaries
- Less code to maintain

**Developer Experience**:

- Less confusion about which import to use
- Clearer intent through proper encapsulation
- Better IDE autocomplete (fewer duplicate suggestions)

**Codebase Health**:

- ~55 lines of code removed
- Reduced duplication
- Improved cohesion

---

## Cross-References

- **Designs**: See `prose/designs/ARCHITECTURE.md` for component organization patterns
- **Completed Plans**: Similar consolidation work in `prose/plans/completed/CONSOLIDATE_DESIGNS.md`

---

_Created: 2025-11-10_  
_Status: Planned_  
_Category: Code Quality / Maintainability_
