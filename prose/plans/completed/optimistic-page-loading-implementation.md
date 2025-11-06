# Optimistic Page Loading Implementation Plan

## Objective

Eliminate loading screens by implementing optimistic UI patterns that render immediately and hydrate progressively.

**Related Design**: [OPTIMISTIC_PAGE_LOADING.md](../designs/frontend/OPTIMISTIC_PAGE_LOADING.md)

## Current State Analysis

**Loading screens exist in**:

1. `src/routes/+page.svelte` (lines 109-112)
   - Full-page "Loading..." blocks entire UI
   - Gates rendering of `<MainLayout>`
   - Waits for auth check and document fetch

2. `src/lib/components/DocumentList/DocumentList.svelte` (line 65)
   - Shows "Loading..." in sidebar
   - Blocks document list rendering

3. Other loading states (Preview, DocumentEditor)
   - Already use overlay pattern (acceptable)
   - Not blocking, show dimmed content

**Focus**: Remove blocking loading screens (1 and 2), keep overlay patterns (3).

## Implementation Steps

### Step 1: Remove Page-Level Loading Gate

**File**: `src/routes/+page.svelte`

**Changes**:

- Remove `{#if loading}...{:else}` conditional wrapper
- Remove `loading` state variable
- Render `<MainLayout>` immediately, unconditionally
- Make auth check and document fetch non-blocking

**Before**:

```svelte
{#if loading}
	<div class="flex min-h-screen items-center justify-center bg-background">
		<p class="text-muted-foreground">Loading...</p>
	</div>
{:else}
	<MainLayout ... />
{/if}
```

**After**:

```svelte
<MainLayout ... />
```

**Implementation details**:

- Move `onMount` logic to run in background (no longer sets `loading = false`)
- Remove `let loading = $state(true)` declaration
- Keep auth check and document fetch, but don't gate on them

### Step 2: Optimize Async Initialization

**File**: `src/routes/+page.svelte`

**Changes**:

- Keep auth check (`/api/auth/me`)
- Keep document fetch (`documentStore.fetchDocuments()`)
- Remove `finally { loading = false }` blocks
- Both operations run in background, don't block UI

**Pattern**:

```typescript
onMount(async () => {
	// Auth check (background)
	fetch('/api/auth/me')
		.then(async (response) => {
			if (response.ok) {
				const data = await response.json();
				user = data.user;
				documentStore.setGuestMode(false);
			} else {
				documentStore.setGuestMode(true);
			}
			await documentStore.fetchDocuments();
		})
		.catch(() => {
			documentStore.setGuestMode(true);
			documentStore.fetchDocuments();
		});
});
```

**Key**: No await at top level, UI renders immediately.

### Step 3: Enhance Sidebar Empty State

**File**: `src/lib/components/DocumentList/DocumentList.svelte`

**Changes**:

- Replace "Loading..." text with proper empty state
- Remove loading check that blocks rendering
- Show empty state when `documents.length === 0`
- Keep list rendering logic for when documents exist

**Empty state design**:

```svelte
{#if documents.length === 0}
	<div class="flex flex-col items-center justify-center p-6 text-center">
		<FileText class="mb-3 h-12 w-12 text-muted-foreground/50" />
		<p class="text-sm font-medium text-muted-foreground">No documents yet</p>
		<p class="mt-1 text-xs text-muted-foreground/70">Create your first document to get started</p>
	</div>
{/if}
```

**Imports needed**:

- `import { FileText } from 'lucide-svelte';`

### Step 4: Add Fade Transitions

**File**: `src/lib/components/DocumentList/DocumentList.svelte`

**Changes**:

- Import Svelte transition: `import { fade } from 'svelte/transition';`
- Apply fade to document list items as they appear
- Duration: 200ms for subtle, elegant transition

**Pattern**:

```svelte
{#each documents as doc (doc.id)}
	<div transition:fade={{ duration: 200 }}>
		<DocumentListItem ... />
	</div>
{/each}
```

### Step 5: Optimize Document Store Loading State

**File**: `src/lib/stores/documents.svelte.ts`

**Changes** (if needed):

- Review `isLoading` state usage
- Ensure it doesn't block rendering
- Used only for aria-busy, not for hiding content

**Behavior**:

- `isLoading = true` during fetch
- `isLoading = false` after fetch completes
- Components render regardless of `isLoading` value

### Step 6: Test Across Network Conditions

**Manual testing required**:

1. **Fast network**: Verify smooth fade-in, no flicker
2. **Slow network**: Throttle to Slow 3G in DevTools
   - UI should appear instantly
   - Empty states visible
   - Documents fade in when loaded
3. **Offline**: Disable network
   - App works in guest mode
   - Empty state shows
   - Can create new documents
4. **Auth scenarios**:
   - Logged out: Guest mode immediately
   - Logged in: Smooth transition to authenticated state

## Detailed File Changes

### Change 1: `src/routes/+page.svelte`

**Modifications**:

1. Remove `loading` state variable (line ~107)
2. Remove conditional wrapper (lines 109-112 and closing tag)
3. Simplify `onMount` to not use `finally` block
4. Keep `<MainLayout>` rendering unconditional

**Lines to modify**: 107-145 (approximately)

### Change 2: `src/lib/components/DocumentList/DocumentList.svelte`

**Modifications**:

1. Add import: `import { FileText } from 'lucide-svelte';`
2. Add import: `import { fade } from 'svelte/transition';`
3. Replace loading check (line 65) with empty state
4. Add fade transition to document list rendering
5. Update conditional logic to show empty vs. populated

**Lines to modify**: ~1-4 (imports), ~65-70 (empty state)

### Change 3: Consider `src/lib/stores/documents.svelte.ts` (Optional)

**Review only**:

- Check if `isLoading` is used to block rendering anywhere
- If so, refactor to use for aria-busy only
- Likely no changes needed based on current implementation

## Testing Checklist

- [ ] Page loads instantly (no loading screen)
- [ ] Sidebar shows empty state initially (no documents)
- [ ] Documents fade in when loaded
- [ ] Auth check works in background
- [ ] Guest mode works correctly
- [ ] Authenticated mode transitions smoothly
- [ ] Slow network: UI still instant, progressive load works
- [ ] Offline: Guest mode functions, no crashes
- [ ] No console errors
- [ ] Accessibility: Screen readers announce loading states
- [ ] Keyboard navigation works immediately

## Rollback Strategy

**If issues arise**:

1. Revert `+page.svelte` changes (restore loading gate)
2. Revert `DocumentList.svelte` changes (restore loading text)
3. Test and fix issues
4. Re-apply changes incrementally

**Git safety**:

- Commit each file change separately for granular rollback
- Test after each commit

## Success Criteria

1. No loading screens visible on page load
2. UI renders in < 100ms (perceived instant)
3. Empty states show before data loads
4. Smooth fade-in transitions when data arrives
5. Works on slow networks and offline
6. No accessibility regressions
7. No layout shift during load

## DRY & KISS Principles

**DRY** (Don't Repeat Yourself):

- Reuse empty state pattern from design system
- Use consistent fade duration (200ms) across components
- Leverage existing `documentStore` without duplication

**KISS** (Keep It Simple, Stupid):

- Remove code (loading gates) rather than add complexity
- Use native Svelte transitions (no custom libraries)
- Minimal changes to achieve maximum impact
- No skeletons, no complex loading orchestration

## Time Estimate

**Note**: As per architect skill guidelines, no time estimates provided.

## Dependencies

**External**: None (uses built-in Svelte features)

**Internal**:

- `documentStore` (existing)
- `lucide-svelte` (already installed)
- Svelte transitions (built-in)

## Risks

**Low risk**:

- Changes are primarily removal of blocking logic
- Empty states are simple additions
- Transitions are optional enhancements

**Mitigation**:

- Thorough testing across network conditions
- Incremental commits for easy rollback
- Keep existing error handling intact

## Post-Implementation

**Documentation**:

- Update implementation summary in this file
- Mark plan as completed
- Cross-reference from OPTIMISTIC_PAGE_LOADING.md

**Future work**:

- Consider service worker caching (future enhancement)
- Evaluate predictive preloading (future enhancement)
- Monitor performance metrics in production

## Cross-References

- [OPTIMISTIC_PAGE_LOADING.md](../designs/frontend/OPTIMISTIC_PAGE_LOADING.md) - Design document
- [DOCUMENT_LOADING_UX.md](../designs/frontend/DOCUMENT_LOADING_UX.md) - Document switching patterns
- [STATE_MANAGEMENT.md](../designs/frontend/STATE_MANAGEMENT.md) - Store patterns
