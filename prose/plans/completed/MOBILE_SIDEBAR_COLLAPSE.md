# Mobile Sidebar Aggressive Collapse

**Status**: Ready for Implementation
**Related**: [OVERLAY_SYSTEM.md](../designs/OVERLAY_SYSTEM.md), [STATE_PATTERNS.md](../designs/STATE_PATTERNS.md)

## Problem Statement

Mobile users face poor UX when the sidebar remains expanded after common actions:

- After dismissing popovers, sidebar obscures editor
- After creating documents, sidebar blocks newly loaded content
- After switching documents, sidebar hides the document content
- Sidebar expansion state persists from localStorage, overriding mobile defaults

This blocks mobile workflows requiring frequent sidebar interaction.

## Design Principles

### Mobile-First Collapse Strategy

**Default Collapsed**: Mobile sidebar starts collapsed regardless of localStorage preference

**Aggressive Auto-Collapse**: Sidebar auto-collapses after user actions complete

**Selective Persistence**: Desktop state persists, mobile state resets to collapsed

### Integration Points

**Popover Dismissal**: Hook into BasePopover `onOpenChange` for all sidebar popovers

**Dialog Submission**: Hook into NewDocumentDialog success callback

**Document Loading**: Hook into DocumentStore active document change

**Exception Handling**: Skip collapse on delete actions to allow multi-delete workflows

## Current State Analysis

### Sidebar State Management

**State Location**: `+page.svelte` line 28

- `sidebarExpanded` $state(false) - controlled state
- Bound bidirectionally to Sidebar component

**LocalStorage Persistence**: `Sidebar.svelte` lines 52-55, 70-72

- Reads `sidebar-expanded` on mount
- Writes on toggle
- **Issue**: Overrides mobile default to false

**Mobile Detection**: `responsiveStore.isMobile` derived from responsive store

- Breakpoint: 768px
- Centralized detection

### Popover Integration

**BasePopover Hook**: `base-popover.svelte` lines 82-84

- `onOpenChange(open: boolean)` callback
- Called on ESC, outside click, backdrop click via useDismissible

**Sidebar Popovers** (all in `Sidebar.svelte`):

1. Login popover (line 247): `bind:open={loginPopoverOpen}`
2. Profile popover (line 264): `bind:open={profilePopoverOpen}`
3. Settings popover (line 301): `bind:open={popoverOpen}`

**NewDocumentDialog**: Wraps BasePopover

- Has own `onOpenChange` prop
- Success triggers `resetForm()` then `onOpenChange(false)` (line 194-195)

### Document Loading

**DocumentStore Pattern**: Collection store with activeDocumentId

- `setActiveDocumentId(id)` method triggers document load
- Called from `DocumentListItem.onSelect` handler
- Handler: `Sidebar.svelte` line 91: `handleFileSelect(fileId)`

**Delete Flow**:

- Handler: `Sidebar.svelte` line 95: `handleDeleteFile(fileId)`
- Calls `documentStore.deleteDocument(id)` directly
- No intermediate state change before deletion

## Desired State

### Mobile Default Behavior

**Initial State**:

- Desktop: Load from localStorage (current behavior)
- Mobile: Always start collapsed, ignore localStorage

**Implementation**: Override localStorage read in Sidebar.svelte mount

### Auto-Collapse Triggers

**Popover Dismissal** (Settings, Login, Profile):

- Detect popover close in mobile mode
- Collapse sidebar after transition

**Dialog Submission** (NewDocumentDialog):

- Detect successful document creation
- Collapse sidebar after dialog closes

**Document Selection**:

- Detect document load from sidebar list
- Collapse sidebar to reveal content

### Exception: Delete Actions

**No Collapse on Delete**:

- User may delete multiple documents sequentially
- Collapsing would force re-expansion for each deletion
- Maintain expanded state during delete operations

## Implementation Strategy

### Phase 1: Mobile Default Override

**Location**: `Sidebar.svelte` onMount (after line 55)

**Logic**:

- Check `isMobile` from responsive store
- If mobile AND `isExpanded === true`: override to false
- Clear localStorage mobile preference

### Phase 2: Popover Collapse Integration

**Location**: `+page.svelte` or `Sidebar.svelte`

**Approach**: Watch popover open states, collapse on close

**Popovers to Track**:

- Settings popover open state
- Login popover open state
- Profile popover open state

**Logic**: Effect watches popover transitions from true → false in mobile mode

### Phase 3: Document Selection Collapse

**Location**: `Sidebar.svelte` handleFileSelect (line 91)

**Logic**:

- Set active document (existing)
- If mobile: collapse sidebar

### Phase 4: NewDocumentDialog Collapse

**Location**: NewDocumentDialog success path OR +page.svelte

**Approach**: Extend dialog close callback to collapse sidebar on mobile

**Logic**: After successful create, if mobile AND dialog closing: collapse sidebar

### Phase 5: Delete Exception

**Location**: `Sidebar.svelte` handleDeleteFile (line 95)

**Logic**: Deletion does NOT trigger collapse (no changes needed)

## Cross-References

**Overlay System**: See [OVERLAY_SYSTEM.md](../designs/OVERLAY_SYSTEM.md) for BasePopover dismissal patterns

**State Management**: See [STATE_PATTERNS.md](../designs/STATE_PATTERNS.md) for component-local state patterns

**Responsive Store**: See `src/lib/stores/responsive.svelte.ts` for mobile detection

## Success Criteria

### Functional

- Mobile sidebar starts collapsed on every session
- Sidebar collapses after settings/login/profile popover dismissal
- Sidebar collapses after creating new document
- Sidebar collapses after selecting different document
- Sidebar stays expanded during document deletion

### User Experience

- No manual collapse needed after common actions
- Mobile editor visible immediately after actions
- Multi-delete workflow uninterrupted
- Desktop behavior unchanged

## Non-Goals

**Desktop Auto-Collapse**: Desktop sidebar maintains current persistence behavior

**Animation Changes**: Use existing sidebar transition timing

**New State**: No new state variables, use existing sidebarExpanded

## Open Questions

**Timing**: Should collapse happen immediately or after popover close animation?

- **Recommendation**: Immediate on close trigger for responsiveness

**LocalStorage Mobile**: Should we stop persisting mobile state entirely?

- **Recommendation**: Yes, always reset mobile to collapsed on mount

**Transition Edge Case**: What if user manually expands while popover closing?

- **Recommendation**: User intent (manual expand) takes precedence over auto-collapse
