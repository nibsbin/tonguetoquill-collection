# Service Framework

**Pattern for all services in Tonguetoquill (client and server).**

## Overview

Services encapsulate business logic and external integrations. The framework provides two patterns based on execution environment:

1. **Client Services**: Browser-side singletons with async initialization (QuillMark, Templates)
2. **Server Services**: Factory-based providers for backend APIs (Documents, Auth, Users)

## Service Architecture

### Client vs Server Separation

**Server-Side Services** (`$lib/server/services/`):

- Provider implementations for databases and external services
- SvelteKit's `$lib/server/` convention ensures never bundled in client code
- Factory pattern for environment-based selection (mock vs production)
- Stateless request/response handling

**Client-Side Services** (`$lib/services/`):

- Abstract API communication and browser resources
- Unified interface regardless of guest vs authenticated mode
- Singleton pattern for browser-wide instance management
- Stateful resource caching (WASM, manifests, API data)

**Boundary**: Clear separation provides type safety, prevents accidental client bundling of server code, and simplifies state management.

## Client Service Framework

### Pattern

**Characteristics**:

- Single instance per application lifecycle (singleton)
- Async initialization with resource loading
- Ready state validation before operations
- Type-safe error handling

**Examples**:

- QuillmarkService (WASM engine, Quill registry)
- TemplateService (template manifest, lazy content)
- DocumentClient (API integration, localStorage fallback)
- LoginClient (OAuth flow, session management)

### Lifecycle

**Initialization Flow**:

```
Application startup
  │
  ├─> Service getInstance()
  │   └─> Creates instance if needed
  │
  └─> Service initialize()
      │
      ├─> Check initialized flag
      │   └─> If true: return immediately (idempotent)
      │
      ├─> Load resources (WASM, manifests, etc.)
      │
      └─> Set initialized = true
```

**Operation Flow**:

```
Client calls service method
  │
  ├─> Validate initialization
  │   └─> Throw if not initialized
  │
  └─> Execute business logic
```

### Base Class Pattern

**Framework Provides**:

- Singleton instance management (private constructor, getInstance())
- Idempotent initialization wrapper
- Ready state tracking (isReady(), validateInitialized())
- Type-safe abstract base class

**Services Implement**:

- doInitialize() hook for resource loading
- Business logic methods
- Service-specific interfaces
- Domain error handling

**Code Reduction**: Eliminates ~80-100 lines of boilerplate per service

### Type Safety

**Compile-Time**:

- Abstract base class with TypeScript generics
- Concrete services implement typed interfaces
- Compile-time validation of initialization

**Runtime**:

- Initialization state validated before operations
- Clear error messages for contract violations
- Defensive validation prevents undefined behavior

## API Integration Pattern

### Architecture

**Base Configuration**:

- Base URL: Relative paths (same-origin API routes)
- Credentials: Automatic cookie inclusion (HTTP-only JWT)
- Error handling: Application-level retry for transient failures
- Timeout: Default browser timeout

**Endpoints**:

- `/api/auth/*` - Authentication (login, callback, me, logout, refresh)
- `/api/documents/*` - Document CRUD
- `/api/documents/[id]/metadata` - Document metadata

### Client Pattern

**Two Approaches**:

1. **Service Classes**: Centralized client for complex operations
   - DocumentClient: Routes between localStorage (guest) and API (auth)
   - LoginClient: OAuth flow management
   - Provides unified interface for stores/components

2. **Direct fetch()**: Simple operations and authentication checks
   - Used in page load functions for session checks
   - Used for one-off API calls

**Features**:

- Simple async/await API
- Optimistic updates for responsive UX
- Guest mode fallback to localStorage
- Error handling via try/catch

### HTTP Methods

- **GET**: Fetch resources (documents, user info)
- **POST**: Create resources, trigger actions
- **PUT**: Update resources
- **DELETE**: Remove resources

### Error Handling

**Network Errors**:

- Try/catch for fetch failures
- Toast notifications for user feedback
- Retry option for transient failures

**HTTP Errors**:

- Check `response.ok` before parsing
- 400: Validation errors (inline feedback)
- 401: Authentication required (fallback to guest mode)
- 403: Permission denied (error message)
- 404: Resource not found (empty state or error)
- 500: Server errors (user-friendly message)

**Optimistic Updates**:

1. Update local state immediately
2. Send request to server
3. On success: Keep update
4. On error: Rollback + show error toast

## Server Service Framework

### Factory Pattern

**Characteristics**:

- Environment-based provider selection (mock vs production)
- No initialization boilerplate needed
- Stateless request/response
- Clean factory functions

**Examples**:

- Document provider (mock vs Supabase)
- Auth provider (mock vs Supabase)
- User provider (mock vs Supabase)

**Pattern**:

```typescript
// Factory selects provider based on environment
export function getDocumentProvider() {
  return USE_MOCK ? mockDocumentProvider : supabaseDocumentProvider;
}

// Provider implements interface
interface DocumentProvider {
  listDocuments(userId: string): Promise<Document[]>;
  getDocument(id: string, userId: string): Promise<Document>;
  // ...
}
```

**No Abstraction Needed**: Factory pattern is already clean with minimal overhead

## Service Implementation Guidelines

### Client Services

**When to Create**:

- Needs to run in browser
- Requires async initialization (WASM, manifests)
- Manages stateful resources
- Used across multiple components

**Implementation Steps**:

1. Extend ClientService base class
2. Implement doInitialize() for resource loading
3. Add business methods with validateInitialized() checks
4. Define service-specific error types
5. Export singleton instance

**Boilerplate Eliminated**:

- No manual singleton pattern
- No initialize() wrapper
- No isReady() implementation
- No validateInitialized() helper

### Server Services

**When to Create**:

- Needs server-only APIs (database, external services)
- Stateless request/response pattern
- Environment-based behavior (mock vs production)

**Implementation Steps**:

1. Define provider interface
2. Implement mock provider (for testing)
3. Implement production provider (Supabase, etc.)
4. Create factory function for provider selection
5. Export factory function

### API Clients

**When to Create**:

- Manages complex API communication
- Needs guest/auth mode switching
- Requires optimistic updates
- Shared across multiple stores/components

**Implementation Steps**:

1. Create service class or utility module
2. Implement fetch wrappers for API endpoints
3. Add error handling and retry logic
4. Implement optimistic update support
5. Add guest mode fallback if applicable

## Authentication Context

**Server-Side**:

- Middleware validates JWT and extracts user ID
- Services perform ownership/permission checks
- `requireAuth()` utility for protected routes
- Returns 401 if not authenticated

**Client-Side**:

- Check session via `GET /api/auth/me` on page load
- Set guest mode based on 401 response
- Guest mode: localStorage persistence
- Authenticated mode: API sync

## Type Safety

### API Response Types

**TypeScript Interfaces**:

- Type definitions in service files (e.g., `types.ts`)
- `DocumentMetadata`, `User`, `Session` interfaces
- Error response types (`ErrorResponse`)
- Type-safe service methods

**Validation**:

- Manual TypeScript interfaces for API contracts
- Runtime checks via `response.ok` and error handling
- Zod schemas available for complex validation

## Performance Optimization

### Client Services

**Initialization**:

- Parallel initialization with `Promise.all()`
- Idempotent initialization prevents duplicate loads
- Ready state check before operations

**Caching**:

- In-memory cache for loaded resources
- Singleton ensures single resource instance
- Clear cache invalidation strategy

### API Clients

**Request Optimization**:

- Debouncing for auto-save (4s default)
- In-memory caching of document list
- Guest mode for offline capability
- Optimistic updates for instant feedback

**Response Handling**:

- Standard `response.json()` parsing
- Check `response.ok` before parsing
- Atomic state updates after success

## Testing Strategies

### Client Services

**Unit Tests**:

- Mock initialization resources
- Test error handling paths
- Verify singleton behavior
- Test ready state validation

**Integration Tests**:

- Test with real resources (WASM, manifests)
- Verify initialization lifecycle
- Test concurrent initialization attempts

### API Clients

**Unit Tests**:

- Mock fetch responses
- Test error handling (network, HTTP errors)
- Test optimistic update rollback
- Test guest mode fallback

**Integration Tests**:

- Test against mock server
- Verify authentication flow
- Test CRUD operations

**E2E Tests**:

- Full user flows with API
- Authentication scenarios
- Error recovery flows

## Security Practices

### Server Services

**Authentication**:

- JWT validation in middleware
- User ID extraction from token
- Ownership/permission checks before operations

**Data Access**:

- Row-level security (RLS) in database
- Service-level permission checks
- No client-side security assumptions

### API Clients

**Request Security**:

- HTTPS in production (secure cookies)
- CSRF protection via SameSite attribute
- Server-side input validation
- No sensitive data in client

**Response Security**:

- XSS protection via Svelte escaping
- Validate response structure
- Sanitize user-generated content

## Error Patterns

### Client Service Errors

**Not Initialized**:

- Thrown when methods called before initialize()
- Includes service name and helpful message
- Guides developer to call initialize() first

**Domain Errors**:

- Service-specific error types
- Errors from doInitialize() propagate through framework
- Business operation errors handled by service

### API Client Errors

**Network Errors**:

- Toast notification with retry option
- Rollback optimistic updates
- Fallback to guest mode if applicable

**Validation Errors**:

- Inline form errors
- Error summary for complex forms

**Permission Errors**:

- Redirect to login or error message
- Clear explanation of required permissions

**Server Errors**:

- User-friendly message (hide implementation details)
- Error logging for debugging

## Design Decisions

### Why Two Patterns?

**Client Services (Singleton)**:

- Browser constraint: single JavaScript context
- Resource efficiency: share expensive resources (WASM, manifests)
- State consistency: single source of truth
- Developer experience: easy import and use

**Server Services (Factory)**:

- Environment flexibility: mock vs production
- No boilerplate: factory functions minimal overhead
- Stateless nature: no initialization needed
- Appropriate abstraction: different environments need different patterns

### Why Idempotent Initialization?

**Benefits**:

- Component safety: multiple components can call initialize()
- No coordination needed: no tracking "who initializes"
- Race condition free: safe concurrent initialization
- Developer experience: forgiving API reduces errors

### Why Optimistic Updates?

**Benefits**:

- Instant feedback: immediate UI response
- Better perceived performance
- Resilient to network latency
- Graceful error recovery via rollback

## Constraints and Limitations

### Current Scope

**Client Services**:

- ✅ Browser environment only
- ✅ Singleton pattern enforcement
- ✅ Async initialization lifecycle
- ✅ Ready state management

**Server Services**:

- ✅ Factory pattern for provider selection
- ✅ Stateless request/response
- ✅ Environment-based behavior

### Out of Scope

**Client Services**:

- ❌ Multiple instances per service
- ❌ Synchronous initialization
- ❌ Service destruction/cleanup
- ❌ Service dependencies/injection
- ❌ Worker thread support

**Server Services**:

- ❌ Stateful services (use client services)
- ❌ Browser-side execution (use client services)

## Cross-References

- [ERROR_SYSTEM.md](ERROR_SYSTEM.md) - Error handling patterns
- [STATE_PATTERNS.md](STATE_PATTERNS.md) - Store integration
- [AUTHENTICATION.md](AUTHENTICATION.md) - OAuth flow details
- [ARCHITECTURE.md](ARCHITECTURE.md) - Overall app structure

**Component/Service READMEs**:

- `src/lib/services/quillmark/README.md` - QuillmarkService implementation
- `src/lib/services/templates/README.md` - TemplateService implementation
- `src/lib/services/documents/README.md` - DocumentClient implementation
- `src/lib/services/login/README.md` - LoginClient implementation

---

_Pattern Document: Describes how all services work across the application_
