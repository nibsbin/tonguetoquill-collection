# State Patterns

**Purpose**: Unified state management patterns that eliminate store boilerplate through composable factory functions.

**Status**: Canonical design for Cascade 4 implementation

**Cross-references**:

- Implementation: See `prose/plans/CASCADE_4_IMPLEMENTATION.md`
- Current state: See `frontend/STATE_MANAGEMENT.md`
- Error handling: See `patterns/ERROR_HANDLING.md`

---

## Problem Statement

Current stores duplicate patterns across 5+ implementations:

**Collection Stores** (documents):

- Loading/error state management
- CRUD operations (add, update, remove)
- Active item selection logic
- Derived state calculations (activeItem from activeId)

**Registry Stores** (overlay):

- Map-based storage with unique IDs
- Register/unregister lifecycle
- Query methods (has, count, getAll)
- Priority-based operations

**Simple State Stores** (ruler, responsive):

- Boolean or primitive state values
- Simple getters/setters
- Toggle operations

**Legacy Stores** (toast):

- Using deprecated writable() API instead of $state
- Manual update functions instead of direct state mutation

**Duplication Impact**:

- ~200 lines of repeated boilerplate across stores
- Inconsistent patterns (some use $state, some use writable)
- Every new store requires 50+ lines vs 2-5 lines
- Error-prone manual state management

---

## Unifying Insight

**"All stores follow one of three patterns: collections, registries, or simple state"**

Common characteristics across all stores:

1. Singleton instances exported from module
2. Reactive state using Svelte 5 runes
3. Encapsulated mutations through methods
4. Type-safe interfaces

Pattern-specific characteristics:

- **Collections**: Array-based with CRUD, optional loading/error states, optional active selection
- **Registries**: Map-based with register/unregister, query methods
- **Simple State**: Single or few related values with direct getters/setters

---

## Desired State

### Store Factory Functions

Three factory functions that encapsulate common patterns:

**Collection Store Factory**:

- Creates stores for managing arrays of items
- Provides: items array, loading state, error state, active item selection
- Auto-generates: CRUD methods, derived activeItem getter
- Optional: async fetcher integration, optimistic updates

**Registry Store Factory**:

- Creates stores for managing Map-based collections
- Provides: Map storage, register/unregister methods
- Auto-generates: has(), count(), getAll() queries
- Optional: priority-based operations, automatic cleanup

**Simple State Factory**:

- Creates stores for primitive or simple object state
- Provides: reactive state with getters
- Auto-generates: setters, toggle methods for booleans
- Optional: localStorage persistence, initialization hooks

### Migration Strategy

**documents.svelte.ts**: Use collection factory

- Eliminates: loading/error/active selection boilerplate (~50 lines)
- Preserves: DocumentClient integration, optimistic updates, auth state
- Custom logic: dual-mode routing, updateDocument merge logic

**overlay.svelte.ts**: Use registry factory

- Eliminates: Map management, register/unregister boilerplate (~30 lines)
- Preserves: Priority system, auto-close lower priority overlays
- Custom logic: closeTopMost, priority-based closing

**toast.svelte.ts**: Migrate to $state + simple factory

- Eliminates: writable() API, manual update functions (~20 lines)
- Upgrade: writable → $state rune
- Preserves: Auto-dismiss timer, type-specific methods (success/error/info/warning)

**responsive.svelte.ts**: Use simple factory with lifecycle

- Eliminates: Manual state management (~15 lines)
- Preserves: Window event listener setup/teardown
- Custom logic: resize handler, breakpoint checking

**ruler.svelte.ts**: Use simple factory

- Eliminates: Manual getter/setter boilerplate (~10 lines)
- Preserves: isActive state, toggle method
- Trivial migration: already minimal

---

## Pattern Specifications

### Collection Store Pattern

**State Structure**:

- items: T[] - Array of items
- activeId: string | null - Selected item ID (optional)
- isLoading: boolean - Async operation state (optional)
- error: string | null - Error message (optional)

**Generated Methods**:

- add(item: T) - Add item to collection
- update(id: string, updates: Partial<T>) - Update item by ID
- remove(id: string) - Remove item by ID
- setActiveId(id: string | null) - Set active selection

**Generated Getters**:

- get items() - Array of items
- get activeItem() - Derived from activeId + items lookup
- get isLoading() - Loading state
- get error() - Error message

**Extension Points**:

- Custom fetcher function for async loading
- Custom update logic (merge strategies, optimistic updates)
- Custom validation on mutations

### Registry Store Pattern

**State Structure**:

- registry: Map<string, T> - Map of items by ID

**Generated Methods**:

- register(id: string, item: T) - Add item to registry
- unregister(id: string) - Remove item from registry
- has(id: string) - Check if item exists
- get(id: string) - Get item by ID
- getAll() - Get all items as array
- clear() - Remove all items

**Generated Getters**:

- get count() - Number of items in registry
- get isEmpty() - Whether registry is empty

**Extension Points**:

- Custom registration logic (validation, side effects)
- Custom unregistration cleanup
- Priority-based operations

### Simple State Pattern

**State Structure**:

- Primitive value (boolean, string, number) or simple object

**Generated Methods** (based on type):

- For boolean: toggle(), setActive(value: boolean)
- For any type: set(value: T)
- For objects: update(partial: Partial<T>)

**Generated Getters**:

- get value() or named getter for state

**Extension Points**:

- LocalStorage persistence (auto-sync on change)
- Initialization hooks (load from storage, setup listeners)
- Cleanup hooks (remove listeners, persist final state)

---

## Benefits

### Code Reduction

**Before Cascade 4**:

- documents.svelte.ts: 267 lines
- overlay.svelte.ts: 116 lines
- toast.svelte.ts: 61 lines
- responsive.svelte.ts: 59 lines
- ruler.svelte.ts: 21 lines
- **Total**: 524 lines

**After Cascade 4**:

- factories.svelte.ts: 150 lines (new, reusable)
- documents.svelte.ts: ~180 lines (87 lines removed)
- overlay.svelte.ts: ~70 lines (46 lines removed)
- toast.svelte.ts: ~35 lines (26 lines removed)
- responsive.svelte.ts: ~30 lines (29 lines removed)
- ruler.svelte.ts: ~10 lines (11 lines removed)
- **Total**: 475 lines (-49 lines net)
- **Future stores**: 2-10 lines instead of 50-100 lines

### Consistency

**Standardized APIs**:

- All collection stores use same method names (add, update, remove)
- All registry stores use same lifecycle (register, unregister)
- All stores use $state (no legacy writable)

**Predictable Patterns**:

- New developers learn one pattern, apply everywhere
- Code reviews focus on business logic, not boilerplate
- Easier to spot deviations and anti-patterns

### Maintainability

**Fix Once, Benefit Everywhere**:

- Loading state bug? Fix in factory, all stores benefit
- Performance optimization? Centralized in factory
- New feature (e.g., undo/redo)? Add to factory

**Reduced Cognitive Load**:

- Read factory implementation once, understand all stores
- Focus on custom business logic, not plumbing
- Less code to test and maintain

---

## Non-Goals

**Not Replacing All State Management**:

- Component-local $state remains preferred for UI state
- Factory pattern only for global stores with common patterns
- Complex stores with unique logic may not benefit from factories

**Not Creating God Objects**:

- Each factory serves one specific pattern
- Stores can extend factories with custom logic
- No forced abstraction where patterns don't fit

**Not Breaking Existing APIs**:

- Store public interfaces remain unchanged
- Components using stores require no modifications
- Migration is internal refactor only

---

## Success Criteria

**Quantitative**:

- 30-40% reduction in store boilerplate code
- New stores implemented in <10 lines (vs 50+ lines)
- All stores use $state API (0 writable() usage)

**Qualitative**:

- Store patterns documented in single source of truth
- Developers can add new stores without consulting examples
- Consistent error handling and loading patterns across all stores

---

## Design Decisions

### Factory Functions vs Base Classes

**Decision**: Use factory functions that return store instances

**Rationale**:

- Svelte 5 $state works naturally with class instances
- Factories provide reusable initialization logic
- Stores can still extend custom classes if needed
- Composition over inheritance (factories compose behavior)

### Generic Type Safety

**Decision**: Factories use TypeScript generics for full type safety

**Rationale**:

- Type inference for item types (CollectionStore<DocumentMetadata>)
- Compile-time checking of CRUD operations
- No type casting or any types
- Better IDE autocomplete and refactoring support

### Extension Pattern

**Decision**: Factories provide base functionality, stores add custom logic through methods

**Rationale**:

- Factory handles common boilerplate (state, basic CRUD)
- Store instance adds domain-specific logic
- Clear separation: generic (factory) vs specific (store)
- Easy to understand what's standard vs custom

---

## Implementation Patterns

### Auto-Save Pattern

**Implementation**: `src/lib/utils/auto-save.svelte.ts`

**Pattern**:

```typescript
class AutoSave {
	// Configurable debounce timer (4 seconds default)
	// Save status tracking (idle, saving, saved, error)
	// Support for guest (localStorage) and authenticated (API) modes
	// Proper cleanup of timers
	// Manual save support (Ctrl/Cmd+S bypasses debounce)
}
```

**Integration**: Used in DocumentEditor component

**Features**:

- Tracks dirty state (unsaved changes)
- Triggers auto-save on content changes (4 second debounce)
- Respects user's auto-save preference
- Updates initialContent after successful save
- Save status indicator shows current state

**See Also**: See SERVICE_FRAMEWORK.md for API integration patterns

### Dual Storage Strategy (Guest Mode)

**Document Store Pattern**: Routes between localStorage (guest) and API (authenticated)

**Guest Mode** (localStorage):

- Key: `tonguetoquill_guest_documents`
- Format: JSON array with metadata + content
- Limit: 5MB (configurable)
- Quota checking before each save
- Error handling for quota exceeded

**Authenticated Mode** (API):

- Full CRUD through REST endpoints
- Server persistence
- No localStorage usage (except offline cache)

**Migration on Login**:

- Offer to import localStorage documents on first login
- User chooses which documents to import
- Clear localStorage after successful migration
- Handle conflicts if document names exist

**Implementation**: `src/lib/services/documents/document-browser-storage.ts`

```typescript
interface LocalStorageDocumentService {
	createDocument(name, content): Promise<DocumentMetadata>;
	getDocumentContent(id): Promise<{ id; content; name }>;
	updateDocumentContent(id, content): Promise<void>;
	deleteDocument(id): Promise<void>;
	listUserDocuments(): Promise<DocumentMetadata[]>;

	// Helper methods
	getAllDocumentsWithContent(): StoredDocument[];
	clear(): void;
	getStorageInfo(): { used; max; percentUsed };
}
```

### Authentication State Pattern

**Authentication Store Structure**:

```typescript
{
  user: User | null,           // null = guest mode
  isAuthenticated: boolean,     // false for guests
  isGuest: boolean,             // computed from user === null
  loading: boolean,
  login: (credentials) => Promise<void>,
  logout: () => Promise<void>,
  checkAuth: () => Promise<void>
}
```

**Guest Mode Handling**:

- `isGuest` computed from `user === null`
- Guest mode is default on app load
- Auth check runs in background without blocking
- Components conditionally render based on `isGuest`

### Document Store Pattern

**Store Structure**:

```typescript
{
  documents: DocumentMetadata[],
  activeDocumentId: string | null,
  loading: boolean,
  error: string | null,

  // Operations
  createDocument: (name, content) => Promise<Document>,
  getDocument: (id) => Promise<Document>,
  updateDocument: (id, updates) => Promise<Document>,
  deleteDocument: (id) => Promise<void>,
  listDocuments: () => Promise<DocumentMetadata[]>,

  // Guest mode specific
  isLocalStorageMode: boolean,
  migrateLocalDocuments: () => Promise<void>
}
```

**Usage**: Collection factory pattern with custom CRUD implementation

### Preferences Store Pattern

**Preferences Persisted to localStorage**:

- Auto-save setting (enabled/disabled)
- Font size (optional)
- Editor settings
- UI state (sidebar expanded/collapsed)

**Strategy**:

- Load on mount
- Save on change
- Handle storage events for cross-tab sync

### State Selection Guidelines

**Component-Local State** (use `$state` rune):

- UI state (expanded, selected, focused)
- Form inputs
- Temporary calculations
- Data that doesn't need sharing

**Global Stores** (use factory patterns):

- Application-wide state (auth, preferences, documents)
- Cross-component communication
- Persistent state
- Shared derived state

**Form Actions** (server-side):

- Server-validated data
- Database operations
- File uploads
- Authentication flows

**Context API** (Svelte contexts):

- Dependency injection
- Feature-specific state
- Avoiding prop drilling
- Component tree configuration

**Page Data** (SSR):

- Initial page data loaded on server
- Route-specific data
- URL-based state
- SEO-critical data

### State Best Practices

**Keep State Close**: Component-local when possible, elevate only when needed

**Avoid Over-Storing**: Don't duplicate data across stores

**Normalize Data**: Use IDs and lookups for related data

**Derive Don't Duplicate**: Compute values from source data

**Clean Up**: Always clean up effects, subscriptions, listeners

**Minimize Reactivity**: Only make reactive what needs reactivity

**Batch Updates**: Group related state changes

**Debounce Expensive Operations**: Delay updates for rapid changes (auto-save)

**Type Safety**: TypeScript interfaces for all state, validate runtime data

### Testing Strategies

**Component State Testing**:

- Test initial state
- Test state updates
- Test derived values
- Test effect cleanup

**Store Testing**:

- Test store mutations
- Test derived stores
- Test subscriptions
- Test persistence

**Form Testing**:

- Test submission without JS
- Test enhanced submission
- Test validation
- Test error handling

---

## Related Patterns

**Service Layer**: See `SERVICE_FRAMEWORK.md` for singleton service pattern and API integration

**Error Handling**: See `ERROR_SYSTEM.md` for error state management in stores

**Architecture**: See `ARCHITECTURE.md` for component-local state patterns

---

## Maintenance

**When to Update This Doc**:

- New store pattern identified across 3+ stores
- Factory API changes (new options, breaking changes)
- Migration of additional stores to factories

**When to Create New Factory**:

- Pattern repeated across 3+ stores
- Pattern is clearly generic and reusable
- Abstraction is simpler than duplication

**When NOT to Use Factories**:

- Store has unique requirements not fitting patterns
- Custom state structure with complex relationships
- Legacy writable() stores that work fine (if no active development)
