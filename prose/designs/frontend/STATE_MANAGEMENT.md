# State Management

## Overview

Tonguetoquill uses a hybrid state management approach with reactive local state, global stores for application-wide state, and server-side state management for data persistence. The implementation leverages SvelteKit 5's reactive system with `$state` runes.

**Status**: Current as of October 2025. Auto-save and document persistence implemented in Phase 6.6.

## Reactive State Patterns

### Component-Local State

**Purpose**: UI state, form inputs, temporary data within a component

**Characteristics**:

- Reactive updates when values change
- Deep reactivity for nested objects
- Can be organized in classes for related state

### Derived State

**Purpose**: Computed values that auto-update based on dependencies

**Characteristics**:

- Automatically recomputes when dependencies change
- Supports filtering, mapping, transformations
- Performance-optimized (only recalculates when needed)

### Side Effects

**Purpose**: React to state changes with side effects

**Use Cases**:

- Auto-save after content changes (see [DESIGN_SYSTEM.md - Auto-Save](../frontend/DESIGN_SYSTEM.md#auto-save-behavior))
- Change tracking for unsaved indicators
- External synchronization (localStorage, etc.)

**Best Practice**: Always provide cleanup to prevent memory leaks

## Global Stores

### Writable Stores

**Authentication Store**:

- User information (null for guest mode)
- Authentication status (guest vs authenticated)
- Loading state
- Login/logout methods

**Store Structure**:

```typescript
{
  user: User | null,           // null = guest mode
  isAuthenticated: boolean,     // false for guests
  isGuest: boolean,             // true when user is null
  loading: boolean,
  login: (credentials) => Promise<void>,
  logout: () => Promise<void>,
  checkAuth: () => Promise<void>
}
```

**Guest Mode Handling**:

- `isGuest` computed from `user === null`
- Guest mode is the default state on app load
- Authentication check runs in background but doesn't block app
- Components can conditionally render based on `isGuest`

**Preferences Store**:

- Auto-save setting (enabled/disabled)
- Font size (optional)
- Persisted to localStorage

See [DESIGN_SYSTEM.md - Auto-Save Behavior](../frontend/DESIGN_SYSTEM.md#auto-save-behavior) for auto-save specifications.

**Document Store**:

- Document list (from server for authenticated, localStorage for guests)
- Active document ID
- Loading/error states
- CRUD operations

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
  isLocalStorageMode: boolean,      // true for guests
  migrateLocalDocuments: () => Promise<void>  // after login
}
```

**LocalStorage Document Service**:

Implemented in `src/lib/services/documents/document-browser-storage.ts`, provides the same interface as the API-based service but stores documents in browser localStorage.

```typescript
interface LocalStorageDocumentService {
	createDocument(name, content): Promise<DocumentMetadata>;
	getDocumentContent(id): Promise<{ id; content; name }>;
	getDocumentMetadata(id): Promise<DocumentMetadata>;
	updateDocumentContent(id, content): Promise<void>;
	updateDocumentName(id, name): Promise<void>;
	deleteDocument(id): Promise<void>;
	listUserDocuments(): Promise<DocumentMetadata[]>;

	// Helper methods
	getAllDocumentsWithContent(): StoredDocument[]; // for migration
	clear(): void; // clear all guest docs
	getStorageInfo(): { used; max; percentUsed }; // storage quota
}
```

**Storage Details**:

- Key: `tonguetoquill_guest_documents`
- Format: JSON array of documents with metadata and content
- Size limit: 5MB (configurable)
- Quota checking before each save operation
- Error handling for quota exceeded

**Dual Storage Strategy**:

- **Guest Mode**: Documents stored in browser localStorage
  - Key: `tonguetoquill_docs_${documentId}`
  - Metadata list: `tonguetoquill_docs_list`
  - Limited to browser storage limits (~5-10MB)
- **Authenticated Mode**: Documents stored on server via API
  - Full CRUD through REST endpoints
  - No localStorage usage (except for offline cache)

**Migration on Login**:

- On first login, offer to import localStorage documents
- User can choose which documents to import
- Clear localStorage after successful migration
- Handle conflicts if document names already exist

### Derived Stores

**Computed from Multiple Stores**:

- User permissions (from auth + role)
- Active document (from document list + active ID)

### Readable Stores

**Time-Based Updates**: Current time, session duration, auto-refresh intervals

## Form State Management

### SvelteKit Form Actions

**Server-Side Handling**:

- Form validation on server
- Database operations
- Return success/failure responses
- Type-safe form data

**Progressive Enhancement**:

- Works without JavaScript (standard POST)
- Enhanced with JavaScript (optimistic updates, loading states)
- Client-side validation as enhancement
- Fallback to server validation

### Form Patterns

**Basic Forms**: Standard HTML submission to server actions (works without JavaScript)

**Enhanced Forms**: Progressive enhancement with JavaScript for better UX (optimistic updates, loading states, client validation)

**Optimistic Updates**: Update UI immediately, rollback on error

**Loading States**: Show progress indicators during submission

**Error Handling**: Display validation errors inline, preserve user input

## Document State Management

### Document Store Pattern

**State Structure**:

- Documents array
- Active document ID
- Loading/error states

**Operations**:

- Load documents from server
- Set active document
- Update document content
- Mark as saved/dirty
- Add/remove documents

**Derived Data**:

- Active document
- Unsaved changes indicator
- Document count

### Auto-Save Pattern

See [DESIGN_SYSTEM.md - Auto-Save Behavior](../frontend/DESIGN_SYSTEM.md#auto-save-behavior) for complete auto-save specifications.

See [DOCUMENT_LOADING_UX.md](./DOCUMENT_LOADING_UX.md) for auto-save behavior when switching documents.

**Implementation**:

- Debounced saves (7 seconds after last keystroke)
- Cancel pending saves on unmount
- Optimistic UI updates
- Error handling and rollback

**Current Status**: ✅ Implemented in Phase 6.6 (October 2025). See `prose/debriefs/phase-6-6-technical-debt-repair.md` for implementation details.

**Implementation Details**:

The AutoSave class is implemented in `src/lib/utils/auto-save.svelte.ts`:

```typescript
class AutoSave {
	// 7-second debounce timer
	// Save status tracking (idle, saving, saved, error)
	// Support for both guest (localStorage) and authenticated (API) modes
	// Configurable debounce interval
	// Proper cleanup of timers
}
```

Integrated into DocumentEditor component:

- Tracks dirty state (unsaved changes)
- Triggers auto-save on content changes
- Respects user's auto-save preference from settings
- Updates initialContent after successful save
- Save status indicator in TopMenu shows current state

## State Persistence

### LocalStorage Persistence

**User Preferences**:

- Auto-save setting (enabled/disabled)
- Editor settings (font size, etc.)
- UI state (sidebar expanded/collapsed)

**Strategy**:

- Load on mount
- Save on change
- Handle storage events for cross-tab sync

## Context API

### Provider Pattern

**Use For**:

- Dependency injection
- Avoiding prop drilling
- Component trees
- Feature-specific state

### Context Usage

**Providing Context**: Parent component provides values to descendant tree

**Consuming Context**: Child components access provided values

**Type Safety**: Define TypeScript interfaces for all context values

## State Patterns Summary

### When to Use Each Pattern

**Component-Local State**:

- UI state (expanded, selected, focused)
- Form inputs
- Temporary calculations
- Data that doesn't need to be shared

**Global Stores**:

- Application-wide state (auth, preferences, documents)
- Cross-component communication
- Persistent state
- Shared derived state

**Form Actions** (Server-side):

- Server-validated data
- Database operations
- File uploads
- Authentication flows

**Context API**:

- Dependency injection
- Feature-specific state
- Avoiding prop drilling through many levels
- Component tree configuration

**Page Data** (SSR):

- Initial page data loaded on server
- Route-specific data
- URL-based state
- SEO-critical data

## State Best Practices

### Guidelines

**Keep State Close**: Use component-local state when possible, only elevate when needed

**Avoid Over-Storing**: Don't duplicate data across multiple stores

**Normalize Data**: Use IDs and lookups for related data structures

**Derive Don't Duplicate**: Compute values from source data rather than storing separately

**Clean Up**: Always clean up effects, subscriptions, and listeners

### Performance

**Minimize Reactivity**: Only make reactive what actually needs reactivity

**Batch Updates**: Group related state changes together

**Debounce Expensive Operations**: Delay updates for rapid changes (e.g., auto-save)

**Memoize Derived State**: Prevent unnecessary recalculations of computed values

### Type Safety

**Define Interfaces**: TypeScript types for all state

**Type Stores**: Proper generic types for stores

**Validate Form Data**: Runtime validation of server responses

**Type Context**: Define types for context values

## State Flow Examples

### Authentication Flow

1. User submits login form
2. Form action validates credentials
3. Server sets HTTP-only cookie
4. Auth store updated with user data
5. Protected routes accessible
6. UI updates to show authenticated state

### Document Editing Flow

1. User types in editor
2. Local state updates immediately
3. Effect triggers auto-save after delay
4. Server persists changes
5. Document marked as saved
6. Error handling if save fails

### Preference Changes Flow

1. User toggles theme
2. Preference store updated
3. Effect persists to localStorage
4. CSS classes updated
5. Theme applied across app
6. State synced across tabs

## State Testing Strategies

### Component State Testing

- Test initial state
- Test state updates
- Test derived values
- Test effect cleanup

### Store Testing

- Test store mutations
- Test derived stores
- Test subscriptions
- Test persistence

### Form Testing

- Test submission without JS
- Test enhanced submission
- Test validation
- Test error handling
