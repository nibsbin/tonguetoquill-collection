# Services Architecture

## Overview

Services are separated into two layers with strict boundaries:

1. **Server-Side Services** (`$lib/server/services/`): Provider implementations for databases and external services. SvelteKit's `$lib/server/` convention ensures these are never bundled in client code.
2. **Client-Side Services** (`$lib/services/`): Abstract API communication and browser storage. Provides unified interface for stores/components regardless of guest vs authenticated mode.

This separation provides type safety, clear boundaries, and simplified stores that focus solely on state management.

## Authentication Context

Services receive authenticated user context through middleware that validates JWT and extracts user ID. Services perform ownership/permission checks before operations.

## Document Service

### Server-Side (`$lib/server/services/documents/`)

```
├── document-provider.ts         ← createDocumentService() factory
├── document-mock-service.ts     ← In-memory implementation
└── index.ts                     ← export { documentService }
```

**Current Implementation (Phases 1-9):** Mock service only
**Future (Phase 10+):** Add `document-supabase-service.ts` for database implementation

**Responsibilities**: Implement DocumentServiceContract, access databases (future), execute server-only business logic. Used exclusively by API route handlers.

### Client-Side (`$lib/services/documents/`)

```
├── document-client.ts           ← Unified client interface
├── document-browser-storage.ts  ← localStorage wrapper
├── types.ts                     ← Shared types
└── index.ts                     ← export { documentClient }
```

**DocumentClient** abstracts all I/O operations:

- Branches internally on guest vs authenticated mode
- Guest: Uses `documentBrowserStorage` (localStorage)
- Authenticated: Uses `fetch()` to call API routes
- Provides simple async methods for stores/components

```typescript
// Stores delegate all I/O to client service
async fetchDocuments() {
  const documents = await documentClient.listDocuments();
  this.setDocuments(documents);
}
```

### API Specification

All methods validate inputs and check authorization. Server-side implementation throws typed errors.

**`createDocument(userId: UUID, name: String, content: String): DocumentMetadata`**

- Validation: name (1-255 chars, trimmed), content (max 524,288 bytes)
- Returns: Document metadata (id, name, owner_id, size, timestamps)
- Errors: `ValidationError`, `ContentTooLargeError`

**`getDocumentMetadata(userId: UUID, documentId: UUID): DocumentMetadata`**

- Authorization: User must own document
- Returns: Metadata without content (TOAST optimization skips loading content)
- Errors: `NotFoundError`, `UnauthorizedError`

**`getDocumentContent(userId: UUID, documentId: UUID): Document`**

- Authorization: User must own document
- Returns: Full document including content
- Errors: `NotFoundError`, `UnauthorizedError`

**`updateDocumentContent(userId: UUID, documentId: UUID, content: String): DocumentMetadata`**

- Validation: content (max 524,288 bytes)
- Returns: Updated metadata
- Errors: `NotFoundError`, `UnauthorizedError`, `ValidationError`, `ContentTooLargeError`

**`updateDocumentName(userId: UUID, documentId: UUID, name: String): DocumentMetadata`**

- Validation: name (1-255 chars, trimmed)
- Returns: Updated metadata
- Errors: `NotFoundError`, `UnauthorizedError`, `ValidationError`

**`deleteDocument(userId: UUID, documentId: UUID): void`**

- Authorization: User must own document
- Errors: `NotFoundError`, `UnauthorizedError`

**`listUserDocuments(userId: UUID, limit: Integer, offset: Integer): List<DocumentMetadata>`**

- Validation: limit (default 50, max 100), offset (default 0)
- Returns: Metadata list ordered by created_at DESC
- Query optimization: Selects only metadata fields, TOAST skips content

### Performance

Document queries use selective field selection with PostgreSQL TOAST:

- **Metadata queries**: Only SELECT non-content fields, TOAST skips loading content
- **Content queries**: SELECT all fields, TOAST fetches content as needed
- Single table design maintained for simplicity while preserving optimal performance

### Error Types

- **`NotFoundError`** (404): Document does not exist
- **`UnauthorizedError`** (403): User doesn't own document
- **`ValidationError`** (400): Input validation failed (includes specific message)
- **`ContentTooLargeError`** (413): Content exceeds 0.5 MB limit

## Benefits

1. **Type Safety**: Server providers cannot be imported in client code
2. **Simplified Stores**: Focus on state, not I/O orchestration
3. **Testability**: Client service easily mocked for testing
4. **Maintainability**: API communication changes isolated to client service
5. **Extensibility**: Easy to add new providers (e.g., SupabaseDocumentService) or features (offline caching, optimistic updates)

## Template Service

### Client-Side (`$lib/services/templates/`)

```
├── types.ts          ← Type definitions
├── service.ts        ← TemplateService implementation
├── index.ts          ← export { templateService }
├── template.test.ts  ← Unit tests
└── README.md         ← Service documentation
```

**Responsibilities**: Provide read-only access to markdown templates. Templates are sourced from `tonguetoquill-collection/templates/` and packaged to `static/templates/` during build. Designed to support future database-backed templates without breaking changes.

**TemplateService** provides:

- Singleton pattern for manifest caching
- Type-safe template metadata access
- On-demand template content loading
- Production/development filtering
- Future-ready abstraction for database migration

```typescript
// Initialize on app load
await templateService.initialize();

// List templates for selector
const templates = templateService.listTemplates(true); // production only

// Load template when selected
const template = await templateService.getTemplate('usaf_template.md');
```

### Build Process

Templates are packaged from source to static directory:

- **Source**: `tonguetoquill-collection/templates/`
- **Build**: `npm run pack:templates` copies to `static/templates/`
- **Runtime**: Service fetches from `/templates/` (served from `static/templates/`)

### API Specification

**`initialize(): Promise<void>`**

- Loads template manifest from `/templates/templates.json`
- Idempotent: Safe to call multiple times (only initializes once)
- Errors: `TemplateError` with code `load_error` or `invalid_manifest`

**`isReady(): boolean`**

- Returns: `true` if service is initialized and ready

**`listTemplates(productionOnly?: boolean): TemplateMetadata[]`**

- Parameters: `productionOnly` (optional, default `false`)
- Returns: Array of template metadata, filtered by production flag if requested
- Errors: `TemplateError` with code `not_initialized`

**`getTemplateMetadata(filename: string): TemplateMetadata`**

- Returns: Template metadata for the specified filename
- Errors: `TemplateError` with code `not_initialized` or `not_found`

**`getTemplate(filename: string): Promise<Template>`**

- Returns: Full template with metadata and markdown content
- Errors: `TemplateError` with code `not_initialized`, `not_found`, or `load_error`

### Build Process

Templates are packaged from source to static directory during build:

**Source Files:**
- Location: `tonguetoquill-collection/templates/`
- Build command: `npm run pack:templates`

**Runtime Paths:**
- Manifest: `/templates/templates.json` (served from `static/templates/`)
- Templates: `/templates/{filename}.md` (served from `static/templates/`)

### Error Types

- **`TemplateError`** - Custom error with typed error codes:
  - `not_initialized` - Service not initialized before use
  - `not_found` - Template not found in manifest
  - `load_error` - Failed to load manifest or template file
  - `invalid_manifest` - Manifest JSON is malformed

### Future Database Support

The service interface supports future migration to database-backed templates:

1. **Phase 1 (Current)**: Static files only
2. **Phase 2 (Future)**: Hybrid (database + static files)
3. **Phase 3 (Future)**: Full database migration

No breaking changes required to support database-backed templates.

### Documentation

Full service documentation available at:

- [Template Service README](../../../src/lib/services/templates/README.md) - Usage and API reference
- [Template Service Design](./TEMPLATE_SERVICE.md) - Complete design specification

## Cross-References

- [../frontend/ARCHITECTURE.md](../frontend/ARCHITECTURE.md) - Client architecture
- [../frontend/STATE_MANAGEMENT.md](../frontend/STATE_MANAGEMENT.md) - Store patterns
