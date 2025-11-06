# Optimistic Page Loading

## Overview

This document defines the strategy for eliminating loading screens through optimistic UI patterns, providing instant responsiveness and elegant UX during page initialization.

> **Related**:
>
> - [DOCUMENT_LOADING_UX.md](./DOCUMENT_LOADING_UX.md) for document switching patterns
> - [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) for store patterns
> - [ARCHITECTURE.md](./ARCHITECTURE.md) for application structure

## Problem Statement

The current implementation shows a full-page "Loading..." message during initial page load while:

1. Checking authentication status (`/api/auth/me`)
2. Fetching document list (`documentStore.fetchDocuments()`)

This creates a poor first impression:

- **Blank screen**: User sees nothing but "Loading..." text
- **Perceived slowness**: Page feels unresponsive even if load is fast
- **Jarring transition**: Abrupt switch from loading to full UI
- **No progressive disclosure**: Everything appears at once

## Design Goals

1. **Instant responsiveness**: Show UI immediately, no loading screens
2. **Progressive hydration**: Load data in background, update UI as it arrives
3. **Graceful degradation**: UI works before data loads
4. **Perceived performance**: Users perceive the app as faster
5. **Elegant transitions**: Smooth fade-ins as content becomes available

## Core Principle: Optimistic Rendering

**Definition**: Render the UI immediately with placeholder/empty states, then progressively populate with real data as it loads.

**Philosophy**:

- UI structure is available immediately
- Data is secondary to structure
- Show empty states instead of loading states
- Transition smoothly from empty to populated

## Optimistic Loading Strategy

### 1. Initial Render

**On page mount, immediately show**:

- Full application layout (sidebar + editor + preview)
- Sidebar in collapsed state or empty state
- Empty document editor (or last viewed document from localStorage)
- Preview pane ready but empty

**Do NOT show**:

- Loading spinners
- "Loading..." text
- Blocking overlays
- Disabled/greyed out UI

### 2. Background Initialization

**While UI is visible, asynchronously**:

1. **Auth check** (`/api/auth/me`)
   - Start fetch in background
   - Don't block UI rendering
   - Default to guest mode until confirmed

2. **Document list fetch** (`documentStore.fetchDocuments()`)
   - Start fetch in parallel with auth
   - Sidebar shows empty state initially
   - Populate list as documents arrive

3. **Document load** (if activeDocumentId exists)
   - Load document content in background
   - Editor shows placeholder/empty until loaded
   - Smooth transition to content

### 3. Progressive Hydration

**As data arrives**:

- **Auth response**: Silently update user state, no UI change unless error
- **Document list**: Fade in documents to sidebar, maintain scroll position
- **Document content**: Fade in content to editor, initialize preview
- **Errors**: Show toast notifications, gracefully handle failures

## Implementation Strategy

### Remove Loading Gate

**Current pattern in `+page.svelte`**:

```svelte
{#if loading}
	<div class="loading screen">Loading...</div>
{:else}
	<MainLayout />
{/if}
```

**New pattern**:

```svelte
<MainLayout />
<!-- No loading gate -->
```

### Optimistic Auth State

**Default assumption**: Guest mode

- Render as guest initially
- Show guest UI (limited features, localStorage)
- When auth resolves to authenticated:
  - Silently switch to authenticated mode
  - Re-fetch documents with API
  - Update UI to show login state

**Benefits**:

- No blocking on auth check
- Guest users see instant UI
- Authenticated users see smooth transition

### Optimistic Document List

**Sidebar document list behavior**:

1. **Initial state**: Empty (not loading)
   - Show "No documents yet" message
   - "New Document" button available

2. **As documents load**:
   - Fade in each document item
   - Maintain alphabetical/chronological order
   - Preserve user scroll position

3. **On error**:
   - Show error message in sidebar
   - Retry button available
   - UI remains interactive

### Optimistic Document Content

**Editor behavior**:

1. **Initial state**: Empty editor or placeholder
   - Show title: "Untitled Document" or last document title from localStorage
   - Editor accepts input immediately
   - Preview pane shows placeholder

2. **As content loads**:
   - Fade in document content
   - Update title in top menu
   - Render preview

3. **On error**:
   - Keep editor interactive
   - Show error toast
   - Preserve any user edits made during load

## Empty State Design

### Sidebar Empty State

**Visual**:

- Centered text: "No documents yet"
- Subtext: "Create your first document to get started"
- Icon: Document outline icon (lucide-svelte: `FileText`)
- "New Document" button prominent

**No spinners, no loading text**

### Editor Empty State

**Visual**:

- Empty textarea ready for input
- Placeholder text: "Start writing..."
- Title: "Untitled Document"
- All menus/buttons functional

**Immediately interactive**

### Preview Empty State

**Visual**:

- Centered text: "Preview appears here"
- Icon: Eye icon (lucide-svelte: `Eye`)
- Background: Subtle grid or paper texture

**No loading spinner**

## Transition Patterns

### Fade-In Animation

**For content that loads after initial render**:

```css
/* Semantic token for optimistic load transitions */
--duration-optimistic-fade: 200ms;
```

**Apply to**:

- Document list items as they appear
- Document content when loaded
- Preview content when rendered
- User profile when auth resolves

**Implementation**:

- Use Svelte transitions: `transition:fade={{ duration: 200 }}`
- CSS transitions: `transition: opacity 200ms ease-in-out`

### No Layout Shift

**Critical rule**: Optimistic UI must maintain layout stability

- Reserve space for content that will load
- Use min-heights for dynamic content areas
- Don't change layout when data arrives
- Prevent Cumulative Layout Shift (CLS)

## Error Handling

### Auth Failure

**Scenario**: `/api/auth/me` fails or returns error

**Behavior**:

- Continue in guest mode (already showing)
- Log error silently
- No user-facing error (graceful degradation)

### Document Fetch Failure

**Scenario**: `documentStore.fetchDocuments()` fails

**Behavior**:

- Show error toast: "Failed to load documents"
- Display retry button in sidebar
- Keep UI interactive
- Allow creating new documents

### Document Load Failure

**Scenario**: `fetchDocument(id)` fails

**Behavior**:

- Show error toast: "Failed to load document"
- Keep editor interactive with empty state
- Allow user to type/create content
- Provide retry option

## Performance Benefits

### Perceived Performance

- **Time to Interactive (TTI)**: Near instant (UI renders immediately)
- **First Contentful Paint (FCP)**: Faster (no blocking wait)
- **Largest Contentful Paint (LCP)**: Improved (layout visible sooner)
- **Cumulative Layout Shift (CLS)**: Zero (layout stable throughout load)

### User Experience Metrics

- **Engagement**: Users start interacting immediately
- **Bounce rate**: Reduced (no blank screen to bounce from)
- **Satisfaction**: Higher perceived speed

## Accessibility

### Screen Reader Experience

**Announcements**:

- "Application loaded" (immediate)
- "Loading documents" (background, non-intrusive)
- "Documents loaded" (when complete)
- "Document title loaded" (when specific doc loads)

**ARIA attributes**:

- `aria-busy="true"` on sidebar while fetching documents
- `aria-live="polite"` for status announcements
- No focus traps or shifts during background loads

### Keyboard Navigation

- Full keyboard navigation available immediately
- No waiting for data to interact with UI
- Shortcuts work from first render

## Edge Cases

### Very Fast Connections

**Scenario**: Data loads faster than fade animation

**Behavior**:

- Still apply fade-in (consistent UX)
- Use short duration (200ms)
- User perceives instant load

### Very Slow Connections

**Scenario**: Data takes 10+ seconds to load

**Behavior**:

- UI remains interactive throughout
- User can create new document while waiting
- Timeout after 30 seconds shows persistent error state
- Retry available

### Offline Mode

**Scenario**: No network connection

**Behavior**:

- Auth fails silently → guest mode
- Document fetch fails → show retry button
- Guest mode uses localStorage exclusively
- User can still work with local documents

### Rapid Navigation

**Scenario**: User navigates away before load completes

**Behavior**:

- Cancel pending fetch requests (AbortController)
- Don't update state after unmount
- Clean up async operations

## Migration Strategy

### Phase 1: Remove Loading Gate

- Remove `{#if loading}` wrapper from `+page.svelte`
- Render `<MainLayout>` immediately
- Test that UI appears instantly

### Phase 2: Make Operations Non-Blocking

- Move auth check to background
- Move document fetch to background
- Remove `loading` state variable

### Phase 3: Add Empty States

- Implement sidebar empty state
- Implement editor empty state
- Implement preview empty state

### Phase 4: Add Fade Transitions

- Apply fade-in to document list
- Apply fade-in to document content
- Apply fade-in to preview

### Phase 5: Polish & Test

- Test on slow networks (throttle in DevTools)
- Test offline behavior
- Test with screen readers
- Performance metrics validation

## Design Rationale

### Why Optimistic Over Progressive Loading?

**Alternatives considered**:

1. **Skeleton screens**: Show loading skeletons
   - More complex to implement
   - Still feels like "waiting"
   - Requires additional components

2. **Progressive loading**: Load UI in stages
   - Still blocks on initial stage
   - Multi-stage transitions are jarring
   - Added complexity

3. **Optimistic rendering**: Show full UI immediately
   - Simplest implementation
   - Best perceived performance
   - Most elegant UX

**Decision**: Optimistic rendering aligns with KISS principle and provides best UX.

### Why Default to Guest Mode?

**Reasoning**:

- Most UI features work in guest mode
- No functionality blocked while checking auth
- Authenticated users see seamless transition
- Guest users see instant app

**Trade-off**: Slight flicker when transitioning from guest to authenticated state, but acceptable for the benefit of instant UI.

## Future Enhancements

1. **Service Worker caching**: Instant loads on repeat visits
2. **Predictive preloading**: Load likely next document in background
3. **Optimistic writes**: Save operations appear instant (rollback on error)
4. **Infinite scroll**: Load more documents as user scrolls sidebar
5. **Stale-while-revalidate**: Show cached data immediately, update in background

## Document Switching UX

### Overview

When switching between documents after initial load, use a loading overlay pattern instead of replacing the entire editor.

### Loading Overlay Pattern

**Visual Behavior**:

- Editor remains visible but dimmed (`opacity-50`)
- Semi-transparent overlay appears with loading spinner
- Prevents interaction with `pointer-events-none`
- Smooth fade transition (200ms)

**Implementation**:

```svelte
<div class="relative flex h-full flex-1 flex-col" aria-busy={loading}>
	<!-- Editor content (dimmed when loading) -->
	<div class={loading ? 'pointer-events-none opacity-50' : ''}>
		<!-- Existing editor structure -->
	</div>

	<!-- Loading overlay -->
	{#if loading}
		<div class="absolute inset-0 flex items-center justify-center bg-background/50">
			<div class="flex flex-col items-center gap-3">
				<Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
				<p class="text-sm text-muted-foreground">Loading document...</p>
			</div>
		</div>
	{/if}
</div>
```

### Auto-Save on Switch

**Behavior**:

- When switching documents with unsaved changes:
  1. Check if auto-save is enabled in settings
  2. If enabled, trigger immediate save before loading new document
  3. Handle save errors silently (don't block navigation)
  4. Proceed to load new document

**Implementation**:

```typescript
// In document switch effect
if (previousDocumentId !== null && previousDocumentId !== documentId && isDirty) {
	if (autoSaveEnabled) {
		autoSave.saveNow(previousDocumentId, content).catch(() => {
			// Ignore errors during auto-save on switch
		});
	}
}
```

**Rationale**:

- Prevents data loss when navigating between documents
- Silent save avoids interrupting user workflow
- Respects user's auto-save preference

### Accessibility

- `aria-busy="true"` on editor container during loading
- Loading state announced to screen readers
- Keyboard navigation remains available

---

## Cross-References

- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - Store and state patterns
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Application architecture
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Visual design tokens
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Accessibility requirements
