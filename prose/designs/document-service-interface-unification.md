# Document Service Interface Unification Design

## Problem Statement

The codebase currently has **three different interfaces** for document operations:

1. **Server-side services** (Mock/Supabase) - Implement `DocumentServiceContract`
   - Methods take structured params: `{user_id, document_id, name, content}`
   - Return complete typed objects with all metadata
   - Use UUID for IDs
   - Support pagination with `DocumentListResult`

2. **Browser storage** - Custom interface incompatible with contract
   - Methods take simple parameters: `(id: string, content: string)`
   - Return partial objects or void
   - Use string IDs with `local-` prefix
   - No pagination support

3. **DocumentClient** - Conditional router between the two
   - Every method has `if (this.isGuest())` branching
   - Manually translates between interfaces
   - **5 methods × 2 code paths = 10 maintenance points**
   - Cannot leverage polymorphism

This creates:
- Duplicate routing logic in every DocumentClient method
- Risk of guest/authenticated behavior diverging
- Manual interface translation overhead
- Complex conditional logic throughout the codebase
- Difficult to test (must test both paths separately)

## Core Principle

**"All document storage is DocumentService"**

Whether documents are stored in localStorage, in-memory Map, or PostgreSQL database is an implementation detail. From the client's perspective, they all provide the same document storage capability and should expose the same interface.

## Desired State

### Single Unified Interface

All document storage implementations conform to `DocumentServiceContract`:
- `MockDocumentService` ✅ (already conformant)
- `SupabaseDocumentService` ✅ (already conformant)
- `DocumentBrowserStorage` 🔄 (needs update to conform)
- `APIDocumentService` ⭐ (new: wraps API calls)

### Polymorphic DocumentClient

DocumentClient becomes a simple wrapper around any `DocumentServiceContract`:
- No conditional routing (`if/else` eliminated)
- No interface translation
- Works with any conformant service via dependency injection
- Pure delegation pattern

### Factory Pattern for Service Selection

A factory function determines which service to instantiate:
- Guest mode → `DocumentBrowserStorage` (implements contract)
- Authenticated mode → `APIDocumentService` (implements contract)
- Server-side → `MockDocumentService` or `SupabaseDocumentService`

## Architecture

### Current Architecture (Problematic)

```
┌──────────────────────────────┐
│      DocumentClient          │
│  ──────────────────────────  │
│  listDocuments() {           │
│    if (isGuest()) {          │ ← Conditional routing
│      browserStorage...       │ ← Different interface
│    } else {                  │
│      fetch('/api/...')       │ ← Different interface
│    }                         │
│  }                           │
│  ... 4 more methods          │ ← All duplicated
└──────────────────────────────┘
```

### Desired Architecture (Clean)

```
┌─────────────────────────────────────────────┐
│       DocumentServiceContract               │
│  ─────────────────────────────────────────  │
│  + createDocument(params)                   │
│  + getDocumentMetadata(params)              │
│  + getDocumentContent(params)               │
│  + updateDocumentContent(params)            │
│  + updateDocumentName(params)               │
│  + deleteDocument(params)                   │
│  + listUserDocuments(params)                │
└───────────┬─────────────────────────────────┘
            │ implements
            │
    ┌───────┴────────┬────────────┬──────────────┐
    │                │            │              │
┌───▼───┐    ┌──────▼─────┐  ┌──▼────────┐  ┌──▼──────────┐
│ Mock  │    │  Supabase  │  │  Browser  │  │     API     │
│ Docs  │    │    Docs    │  │  Storage  │  │  Documents  │
│Service│    │  Service   │  │           │  │   Service   │
└───────┘    └────────────┘  └───────────┘  └─────────────┘
                                    │              │
                                    │              │
                                    └──────┬───────┘
                                           │ injected into
                                    ┌──────▼────────┐
                                    │   Document    │
                                    │    Client     │
                                    │ (thin wrapper)│
                                    └───────────────┘
```

## Design Decisions

### 1. DocumentBrowserStorage Implements DocumentServiceContract

**Rationale**: The contract already models document operations correctly. Browser storage is just another implementation of document persistence.

**Required Changes**:
- Conform method signatures to contract
- Accept structured params instead of simple arguments
- Return complete typed objects
- Support the `DocumentReferenceParams` pattern
- Use consistent error handling

**Trade-offs**:
- More verbose method signatures (worth it for consistency)
- Need to extract user_id from params (always 'guest' for browser)
- Slight API change for internal use (but it's private to the module)

### 2. Create APIDocumentService

**Rationale**: Currently DocumentClient mixes routing logic with API calls. Separate concerns by extracting API calls into their own service.

**Responsibilities**:
- Implement `DocumentServiceContract`
- Make HTTP requests to `/api/documents` endpoints
- Transform API responses to contract types
- Handle network errors consistently

**Benefits**:
- Clean separation: service makes calls, client coordinates
- Can be tested independently
- Reusable in other contexts
- Follows same pattern as Mock/Supabase services

### 3. DocumentClient Becomes Pure Delegator

**Rationale**: If all services implement the same interface, client doesn't need routing logic.

**New Responsibilities**:
- Accept a `DocumentServiceContract` via constructor
- Delegate all operations to the service
- Optional: Provide convenience methods that simplify params
- Optional: Add client-side caching/optimizations

**Benefits**:
- Zero conditional branches
- Impossible for guest/auth behavior to diverge
- Easier to test (mock the service)
- Easier to extend (new storage types just implement interface)

### 4. Factory Function for Service Selection

**Rationale**: Something needs to decide which service to use. Keep it in one place.

**Approach**:
```
createDocumentService(isGuest: boolean, userId: string): DocumentServiceContract {
  return isGuest
    ? new DocumentBrowserStorage()
    : new APIDocumentService();
}

createDocumentClient(isGuest: boolean, userId: string): DocumentClient {
  const service = createDocumentService(isGuest, userId);
  return new DocumentClient(service, userId);
}
```

**Benefits**:
- Single decision point for service selection
- Easy to add new service types
- Testable in isolation

## Benefits

1. **Eliminates Conditional Complexity**
   - Removes 10 conditional code paths (5 methods × 2 branches)
   - DocumentClient shrinks from 135 lines → ~60 lines (55% reduction)

2. **Guarantees Consistency**
   - Guest and authenticated modes must have identical behavior
   - Impossible to forget to update one code path
   - Single interface contract enforces compatibility

3. **Improves Testability**
   - Can test DocumentClient with any conformant mock
   - Can test each service implementation independently
   - No need to test both branches of every method

4. **Enables Extensibility**
   - New storage types (IndexedDB, WebSQL, etc.) just implement interface
   - No changes to DocumentClient required
   - Clean plugin architecture

5. **Clarifies Responsibilities**
   - Services: storage and retrieval
   - Client: convenience and coordination
   - Factory: service selection
   - Store: state management

## Non-Goals

- Changing the DocumentServiceContract interface
- Modifying server-side services (Mock/Supabase)
- Altering external APIs or routes
- Adding new document operations
- Performance optimization

## Migration Strategy

### Phase 1: Conformance
Update DocumentBrowserStorage to implement DocumentServiceContract without changing clients.

### Phase 2: Extraction
Create APIDocumentService to handle authenticated API calls.

### Phase 3: Simplification
Refactor DocumentClient to use injected service, removing conditional routing.

### Phase 4: Integration
Update document store and other consumers to use new architecture.

## Success Criteria

- ✅ DocumentBrowserStorage implements DocumentServiceContract
- ✅ APIDocumentService created and implements contract
- ✅ DocumentClient has zero conditional branches
- ✅ All 5 methods in DocumentClient use pure delegation
- ✅ Factory function creates appropriate service based on mode
- ✅ All existing tests pass
- ✅ Guest mode and authenticated mode have identical behavior patterns
- ✅ No changes to public APIs or external behavior

## Risk Assessment

**Low Risk**:
- Pure refactoring of internal implementation
- Contract interface already proven correct
- Can migrate incrementally
- Existing services unchanged

**Potential Issues**:
- Browser storage needs to handle user_id param (always 'guest')
- API service needs proper error transformation
- Need to ensure localStorage size limits still respected
- Might need to adjust how document store creates clients

## Open Questions

1. Should DocumentClient provide simplified convenience methods, or require full params?
2. Should we add caching/optimization to DocumentClient or keep it pure?
3. Should factory function be in DocumentClient file or separate module?
4. Do we need a NullDocumentService for error states?
