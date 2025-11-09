# Cascade 4 Implementation Plan: State Store Fragmentation

**Status**: In Progress
**Started**: 2025-11-09
**Priority**: High
**Cascade**: 4 of 5 from SIMPLIFICATION_CASCADES_ANALYSIS.md

---

## Overview

Eliminate state store fragmentation by creating reusable factory functions that encapsulate common store patterns. This reduces boilerplate by 30-40% and standardizes store APIs across the application.

**Design Document**: See `prose/designs/patterns/STATE_PATTERNS.md`
**Analysis**: See `prose/plans/SIMPLIFICATION_CASCADES_ANALYSIS.md` § Cascade 4

---

## Current State Assessment

### Existing Stores

**documents.svelte.ts** (267 lines):
- Pattern: Collection store with loading/error states
- Boilerplate: ~87 lines (state management, getters, basic CRUD)
- Custom logic: DocumentClient integration, optimistic updates, dual-mode routing
- API: Modern $state

**overlay.svelte.ts** (116 lines):
- Pattern: Registry store with Map-based storage
- Boilerplate: ~46 lines (Map management, register/unregister, query methods)
- Custom logic: Priority-based closing, automatic cleanup
- API: Modern $state

**toast.svelte.ts** (61 lines):
- Pattern: Simple collection with auto-dismiss
- Boilerplate: ~26 lines (writable API, manual updates)
- Custom logic: Type-specific methods (success/error/info/warning), auto-dismiss timers
- API: Legacy writable() - needs upgrade

**responsive.svelte.ts** (59 lines):
- Pattern: Simple state with lifecycle hooks
- Boilerplate: ~29 lines (state management, initialization)
- Custom logic: Window resize listener, breakpoint checking
- API: Modern $state

**ruler.svelte.ts** (21 lines):
- Pattern: Simple boolean state
- Boilerplate: ~11 lines (state, getters, setters)
- Custom logic: None (already minimal)
- API: Modern $state

### Identified Patterns

Three distinct patterns across all stores:

1. **Collection Pattern** (documents, toast): Array of items with CRUD operations
2. **Registry Pattern** (overlay): Map-based storage with register/unregister lifecycle
3. **Simple State Pattern** (ruler, responsive): Primitive or simple object state

---

## Desired State

### New Factory Module

**src/lib/stores/factories.svelte.ts**:
- CollectionStoreFactory: Creates collection stores with loading/error/active states
- RegistryStoreFactory: Creates Map-based registry stores
- SimpleStateFactory: Creates simple reactive state stores
- All factories use Svelte 5 $state runes
- Full TypeScript generic support for type safety

### Migrated Stores

All stores refactored to use factories while preserving:
- Public APIs (no breaking changes for components)
- Custom business logic (DocumentClient integration, priority system, etc.)
- Type safety (full TypeScript generics)
- Test compatibility (existing tests pass without modification)

---

## Implementation Steps

### Step 1: Create Factory Module

Create `src/lib/stores/factories.svelte.ts` with three factory functions:

**CollectionStoreFactory**:
- State: items[], activeId, isLoading, error
- Methods: add, update, remove, setActiveId, setLoading, setError
- Getters: items, activeItem, isLoading, error
- Options: fetcher function, id key, optimistic updates

**RegistryStoreFactory**:
- State: Map<string, T>
- Methods: register, unregister, has, get, getAll, clear
- Getters: count, isEmpty
- Options: custom registration logic, cleanup hooks

**SimpleStateFactory**:
- State: T (generic type)
- Methods: Based on type (toggle for boolean, set for any, update for objects)
- Getters: value or named getter
- Options: localStorage persistence, initialization hooks

### Step 2: Migrate documents.svelte.ts

**Approach**: Use CollectionStoreFactory as base, extend with custom logic

**Changes**:
- Replace manual state management with factory-generated state
- Remove boilerplate: setDocuments, setLoading, setError, basic CRUD
- Keep custom: DocumentClient integration, updateDocument merge logic, optimistic updates
- Preserve: auth state (_isGuest, _userId), getDocumentClient()

**Breaking Changes**: None (internal refactor only)

### Step 3: Migrate overlay.svelte.ts

**Approach**: Use RegistryStoreFactory as base, add priority system

**Changes**:
- Replace Map management with factory-generated registry
- Remove boilerplate: register, unregister, has, count, getAll
- Keep custom: closeTopMost, closeOverlaysWithPriorityBelow, priority logic
- Preserve: OverlayType, OverlayRegistration interfaces

**Breaking Changes**: None (internal refactor only)

### Step 4: Migrate toast.svelte.ts

**Approach**: Upgrade writable → $state, use SimpleStateFactory for array

**Changes**:
- Replace writable([])<Toast[]> with $state<Toast[]>([])
- Use factory for basic array management if beneficial
- Keep custom: type-specific methods (success/error/info/warning), auto-dismiss logic
- Simplify: update() calls → direct state mutation

**Breaking Changes**: None (toastStore API unchanged)

### Step 5: Migrate responsive.svelte.ts

**Approach**: Use SimpleStateFactory with lifecycle hooks

**Changes**:
- Replace manual state with factory-generated state
- Use factory initialization hooks for window.addEventListener
- Keep custom: checkMobile breakpoint logic
- Preserve: initialize(), destroy() public API

**Breaking Changes**: None (public API unchanged)

### Step 6: Migrate ruler.svelte.ts

**Approach**: Use SimpleStateFactory for boolean state

**Changes**:
- Replace manual state with factory-generated boolean state
- Use factory toggle() method
- Remove manual: get isActive(), setActive(), toggle()

**Breaking Changes**: None (public API unchanged)

### Step 7: Update Documentation

**STATE_MANAGEMENT.md**:
- Add cross-reference to STATE_PATTERNS.md at top
- Update § Global Stores to reference factory patterns
- Keep existing content (high-level patterns remain valid)

**INDEX.md**:
- Add STATE_PATTERNS.md to § Cross-Cutting Patterns
- Update description to reference factory functions

**SIMPLIFICATION_CASCADES_ANALYSIS.md**:
- Mark Cascade 4 as implemented
- Add reference to STATE_PATTERNS.md

---

## Migration Validation

### For Each Store

**Before Migration**:
1. Run existing tests to establish baseline
2. Document current public API (methods, getters, properties)
3. Note component usage patterns

**After Migration**:
1. Run tests - must pass without modification
2. Verify public API unchanged (no component updates needed)
3. Check type safety (no TypeScript errors)
4. Confirm behavior identical (manual testing if no tests)

### Integration Testing

**Cross-Store Interactions**:
- Document store + overlay store (document dialogs)
- Overlay store + toast store (notifications in overlays)
- Responsive store + all stores (mobile behavior)

**Expected Result**: All interactions work identically to before migration

---

## Risk Assessment

### Low Risk

**Reason**:
- Internal refactors only (no public API changes)
- Incremental migration (one store at a time)
- Existing tests provide regression safety
- Factories add abstraction without removing flexibility

### Mitigation

**Testing Strategy**:
- Run test suite after each store migration
- Manual testing of UI flows using migrated stores
- Git commit per store migration (easy rollback)

**Rollback Plan**:
- Each store migration is independent
- Can revert individual commits without affecting others
- Factory module is additive (doesn't break existing stores)

---

## Success Metrics

### Quantitative

**Code Reduction**:
- documents.svelte.ts: 267 → ~180 lines (87 lines removed)
- overlay.svelte.ts: 116 → ~70 lines (46 lines removed)
- toast.svelte.ts: 61 → ~35 lines (26 lines removed)
- responsive.svelte.ts: 59 → ~30 lines (29 lines removed)
- ruler.svelte.ts: 21 → ~10 lines (11 lines removed)
- Total reduction: ~199 lines (38% reduction in boilerplate)

**New Store Cost**:
- Before: 50-100 lines for basic store
- After: 2-10 lines for basic store using factory
- 5-10x reduction for new stores

**API Consistency**:
- 5/5 stores use $state (currently 4/5 - toast uses writable)
- 3 documented patterns vs 5 unique implementations

### Qualitative

**Developer Experience**:
- New stores trivial to implement (use factory)
- Store patterns documented in single source (STATE_PATTERNS.md)
- Consistent APIs across all stores (predictable method names)

**Maintainability**:
- Bug fixes in factories benefit all stores
- Performance optimizations centralized
- Less code to review and maintain

---

## Out of Scope

**Not Included in Cascade 4**:

- Component-local state management (remains $state in components)
- Advanced features (undo/redo, time-travel debugging)
- Third-party store integrations (no Zustand, Redux, etc.)
- Store persistence beyond localStorage (no IndexedDB, etc.)
- Real-time synchronization (WebSocket stores, etc.)

**Future Considerations**:

- Undo/redo factory if pattern emerges across 3+ stores
- Persistence factory for advanced storage strategies
- Async state factory for complex loading patterns

---

## Timeline

**Total Effort**: ~1 day (no time pressure, focus on quality)

**Phase 1 - Architecture** (Completed):
- Create STATE_PATTERNS.md design
- Create this implementation plan

**Phase 2 - Foundation** (Next):
- Create factories.svelte.ts module
- Validate factory APIs with simple test cases

**Phase 3 - Migration** (Sequential):
1. Migrate ruler.svelte.ts (simplest, validates simple state factory)
2. Migrate responsive.svelte.ts (validates lifecycle hooks)
3. Migrate toast.svelte.ts (validates writable → $state upgrade)
4. Migrate overlay.svelte.ts (validates registry factory)
5. Migrate documents.svelte.ts (most complex, validates collection factory)

**Phase 4 - Documentation** (Final):
- Update STATE_MANAGEMENT.md cross-references
- Update INDEX.md with STATE_PATTERNS.md
- Mark plan as completed

**Phase 5 - Completion**:
- Move plan to prose/plans/completed/
- Commit and push to branch

---

## Dependencies

**Required Reading**:
- prose/designs/patterns/STATE_PATTERNS.md (desired state)
- prose/plans/SIMPLIFICATION_CASCADES_ANALYSIS.md (analysis)
- src/lib/stores/*.svelte.ts (current implementations)

**No External Dependencies**: Pure Svelte 5 runes, no new packages

---

## Notes

**Key Principle**: Preserve public APIs, refactor internals

**Migration Order**: Simple → Complex (builds confidence, validates factories incrementally)

**Testing**: Each store tested in isolation before moving to next

**Backwards Compatibility**: Not a concern per user directive ("fuck backwards compatibility")
- Still preserving component APIs to avoid unnecessary churn
- Breaking changes limited to internal store implementations
- Components using stores unaffected

---

## Completion Criteria

**Done When**:
- All 5 stores migrated to factory pattern
- All existing tests pass
- STATE_PATTERNS.md reflects implementation
- STATE_MANAGEMENT.md cross-references updated
- INDEX.md includes STATE_PATTERNS.md
- This plan moved to prose/plans/completed/
- Changes committed and pushed to branch
