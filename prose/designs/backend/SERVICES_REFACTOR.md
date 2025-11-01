# Services Architecture Refactor

## Problem Statement

The current services architecture has several structural issues that make it brittle:

1. **Server-only logic mixed with shared logic**: Provider implementations (MockDocumentService, future SupabaseDocumentService) are accessible from both client and server contexts, even though they should only run server-side
2. **Client-side orchestration in stores**: The document store (`src/lib/stores/documents.svelte.ts`) directly orchestrates fetch calls and localStorage access, violating separation of concerns
3. **Tight coupling**: UI components and stores are tightly coupled to both API fetch logic and browser storage implementation details
4. **No clear client-side service layer**: There's no centralized client-side service to abstract communication patterns

## Goals

1. **Clear separation of concerns**: Server-only logic in `src/lib/server/`, shared logic in `src/lib/services/`
2. **Prevent client-side access to server logic**: Use SvelteKit's `$lib/server/` convention to ensure server providers aren't bundled in client code
3. **Centralized client-side service**: Abstract all API and storage communication through a client-side document service
4. **Simplified stores**: Stores should only manage state, not orchestrate fetch calls or storage operations

## Architecture Overview

### Server-Side Services (`src/lib/server/services/`)

Server-side services contain provider implementations that should never be accessed from client-side code:

```
$lib/server/services/documents/
  ├── document-provider.ts         ← createDocumentService()
  ├── document-mock-service.ts     ← MockDocumentService
  ├── document-supabase-service.ts ← SupabaseDocumentService (future)
  └── index.ts                     ← export { documentService }
```

**Responsibilities:**

- Implement DocumentServiceContract
- Access databases and external services
- Server-only business logic
- Used exclusively by API route handlers

**Key Files:**

- `document-provider.ts`: Factory function to create service instances based on environment
- `document-mock-service.ts`: In-memory mock implementation for development
- `document-supabase-service.ts`: Real database implementation (future)
- `index.ts`: Public exports for server-side code

### Client-Side Services (`src/lib/services/`)

Client-side services abstract all communication with APIs and browser storage:

```
$lib/services/documents/
  ├── document-client.ts           ← Client-side service (fetch + routing)
  ├── document-browser-storage.ts  ← DocumentBrowserStorage (localStorage wrapper)
  ├── types.ts                     ← Shared types
  └── index.ts                     ← export { documentClient }
```

**Responsibilities:**

- Abstract API communication via fetch
- Handle guest mode (localStorage) vs authenticated mode (API) branching
- Error handling and data transformation
- Provide simple async methods for stores/components

**Key Files:**

- `document-client.ts`: Main client service with branching logic for guest/auth modes
- `document-browser-storage.ts`: Browser localStorage wrapper (renamed from localstorage-service.ts)
- `types.ts`: Shared types used by both client and server
- `index.ts`: Public exports for client-side code

### Updated Store Pattern

Stores become pure state managers that delegate all I/O to the client service:

```typescript
// Before (brittle):
async fetchDocuments() {
  if (this.state.isGuest) {
    const documents = await localStorageDocumentService.listUserDocuments();
    this.setDocuments(documents);
  } else {
    const response = await fetch('/api/documents');
    const data = await response.json();
    this.setDocuments(data.documents || []);
  }
}

// After (clean):
async fetchDocuments() {
  const documents = await documentClient.listDocuments();
  this.setDocuments(documents);
}
```

## File Migration Plan

### Move to `src/lib/server/services/documents/`

1. `provider.ts` → `document-provider.ts`
2. `mock-service.ts` → `document-mock-service.ts`
3. Create new `index.ts` exporting server service

### Rename in `src/lib/services/documents/`

1. `localstorage-service.ts` → `document-browser-storage.ts`
2. Update class name: `LocalStorageDocumentService` → `DocumentBrowserStorage`
3. Update export: `localStorageDocumentService` → `documentBrowserStorage`

### Create in `src/lib/services/documents/`

1. `document-client.ts` - New centralized client service
2. Update `index.ts` to export client service

### Update Consumers

1. **API Routes** (`src/routes/api/**/*.ts`):
   - Import from `$lib/server/services/documents` instead of `$lib/services/documents`
2. **Stores** (`src/lib/stores/documents.svelte.ts`):
   - Replace direct fetch and localStorage calls with `documentClient` methods
   - Remove isGuest branching (handled in client service)
3. **Auto-save** (`src/lib/utils/auto-save.svelte.ts`):
   - Replace direct localStorage and fetch with `documentClient.saveDocument()`

## Implementation Details

### DocumentClient Interface

```typescript
class DocumentClient {
	constructor(private isGuest: () => boolean) {}

	async listDocuments(): Promise<DocumentMetadata[]>;
	async getDocument(id: string): Promise<{ id: string; content: string; name: string }>;
	async createDocument(name: string, content?: string): Promise<DocumentMetadata>;
	async updateDocument(id: string, updates: { content?: string; name?: string }): Promise<void>;
	async deleteDocument(id: string): Promise<void>;
}
```

Internal branching based on `isGuest()`:

- **Guest mode**: Use `documentBrowserStorage`
- **Authenticated mode**: Use `fetch()` to call API routes

### DocumentBrowserStorage Interface

Renamed but functionally identical to current `LocalStorageDocumentService`:

```typescript
class DocumentBrowserStorage {
	async createDocument(name: string, content?: string): Promise<DocumentMetadata>;
	async getDocumentMetadata(id: string): Promise<DocumentMetadata | null>;
	async getDocumentContent(
		id: string
	): Promise<{ id: string; content: string; name: string } | null>;
	async updateDocumentContent(id: string, content: string): Promise<void>;
	async updateDocumentName(id: string, name: string): Promise<void>;
	async deleteDocument(id: string): Promise<void>;
	async listUserDocuments(): Promise<DocumentMetadata[]>;
	// ... other helper methods
}
```

## Benefits

1. **Type Safety**: SvelteKit enforces that `$lib/server/` modules can't be imported in client code
2. **Clear Boundaries**: Server providers are physically separated from client services
3. **Simplified Stores**: Stores focus on state management, not I/O orchestration
4. **Testability**: Client service can be easily mocked for testing stores and components
5. **Maintainability**: Changes to API communication happen in one place (client service)
6. **Consistency**: All document operations go through the same service interface

## Testing Strategy

1. **Server services**: Existing contract tests continue to work
2. **Client service**: New unit tests for branching logic and API communication
3. **Stores**: Simplified tests with mocked client service
4. **Integration tests**: Existing integration tests should continue to pass

## Backwards Compatibility

This is an internal refactor with no API changes:

- API routes remain unchanged
- Store interface for components remains unchanged
- Only internal implementation changes

## Future Enhancements

After this refactor, we can easily:

1. Add SupabaseDocumentService in `$lib/server/services/documents/`
2. Add offline caching in the client service
3. Add optimistic updates in the client service
4. Support multiple storage backends without changing stores/components

## Cross-References

- See [SERVICES.md](./SERVICES.md) for original service design
- See [../frontend/ARCHITECTURE.md](../frontend/ARCHITECTURE.md) for client architecture
- See [../frontend/STATE_MANAGEMENT.md](../frontend/STATE_MANAGEMENT.md) for store patterns
