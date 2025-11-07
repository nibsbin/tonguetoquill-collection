# Document Service

This document defines the Document Service for managing user documents with support for both guest (localStorage) and authenticated (server-side) modes.

> **Related**: [SERVICES.md](./SERVICES.md) for overall service architecture patterns

## Overview

The Document Service manages document lifecycle operations (create, read, update, delete, list) with a dual-mode architecture:

- **Guest mode**: Documents stored in browser localStorage
- **Authenticated mode**: Documents stored server-side with ownership validation

**Key Characteristics:**

- **Dual-mode**: Seamless switching between guest and authenticated storage
- **Type-safe**: Strict separation between client and server code
- **Ownership-based**: All operations validate user ownership
- **Performance-optimized**: PostgreSQL TOAST for selective content loading

## Architecture

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

## Data Model

### Document Structure

```typescript
export interface Document {
	id: string; // UUID
	name: string; // 1-255 characters
	content: string; // Max 524,288 bytes (0.5 MB)
	owner_id: string; // UUID
	created_at: string; // ISO 8601 timestamp
	updated_at: string; // ISO 8601 timestamp
}

export interface DocumentMetadata {
	id: string;
	name: string;
	owner_id: string;
	size: number; // Content size in bytes
	created_at: string;
	updated_at: string;
}
```

## Service Contract

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

### Error Types

```typescript
// 404: Document does not exist
export class NotFoundError extends Error {
	code = 'not_found';
}

// 403: User doesn't own document
export class UnauthorizedError extends Error {
	code = 'unauthorized';
}

// 400: Input validation failed
export class ValidationError extends Error {
	code = 'validation_error';
	field: string;

	constructor(field: string, message: string) {
		super(message);
		this.field = field;
	}
}

// 413: Content exceeds 0.5 MB limit
export class ContentTooLargeError extends Error {
	code = 'content_too_large';
	maxSize = 524288;
}
```

## Performance Optimization

### PostgreSQL TOAST Strategy

Document queries use selective field selection with PostgreSQL TOAST:

- **Metadata queries**: Only SELECT non-content fields, TOAST skips loading content
- **Content queries**: SELECT all fields, TOAST fetches content as needed
- Single table design maintained for simplicity while preserving optimal performance

**Metadata Query Example:**

```sql
SELECT id, name, owner_id,
       octet_length(content) as size,
       created_at, updated_at
FROM documents
WHERE owner_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

**Content Query Example:**

```sql
SELECT id, name, owner_id, content, created_at, updated_at
FROM documents
WHERE id = $1 AND owner_id = $2;
```

### Client-Side Caching

DocumentClient can be extended with:

- In-memory cache for frequently accessed documents
- Optimistic updates for better UX
- Background sync for offline support

## Authentication Context

Services receive authenticated user context through middleware that validates JWT and extracts user ID. All operations include ownership validation:

```typescript
// Middleware extracts userId from JWT
const userId = await validateJWT(request.headers.authorization);

// Service validates ownership
const document = await documentService.getDocumentContent(userId, documentId);
```

## Guest Mode (Browser Storage)

For unauthenticated users, documents are stored in browser localStorage:

```typescript
// documentBrowserStorage implementation
class DocumentBrowserStorage {
	private readonly STORAGE_KEY = 'tonguetoquill_documents';

	async createDocument(name: string, content: string): Promise<DocumentMetadata> {
		const doc = {
			id: crypto.randomUUID(),
			name,
			content,
			owner_id: 'guest',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};

		const docs = this.loadDocuments();
		docs.push(doc);
		this.saveDocuments(docs);

		return this.toMetadata(doc);
	}

	// ... other methods
}
```

**Limitations:**

- No cross-device sync
- Storage quota limits (~5-10 MB per origin)
- Data persists until browser storage cleared
- No server-side backup

## Future Database Implementation

### Database Schema (Phase 10+)

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 255),
  content TEXT NOT NULL CHECK (octet_length(content) <= 524288),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_owner_created
  ON documents(owner_id, created_at DESC);
```

### Migration Strategy

1. **Phase 1-9**: Mock service + localStorage
2. **Phase 10**: Add Supabase service implementation
3. **Phase 11+**: Migration tool for guest → authenticated document transfer

## Usage Examples

### Store Integration

```typescript
// document-store.ts
import { documentClient } from '$lib/services/documents';

class DocumentStore {
	async loadDocuments() {
		try {
			const docs = await documentClient.listDocuments();
			this.documents.set(docs);
		} catch (error) {
			this.handleError(error);
		}
	}

	async createDocument(name: string, content: string) {
		try {
			const metadata = await documentClient.createDocument(name, content);
			this.addDocument(metadata);
			return metadata;
		} catch (error) {
			this.handleError(error);
		}
	}
}
```

### Component Usage

```svelte
<script lang="ts">
	import { documentStore } from '$lib/stores/document-store';
	import { onMount } from 'svelte';

	onMount(async () => {
		await documentStore.loadDocuments();
	});

	async function handleCreate() {
		await documentStore.createDocument('New Document', '# Hello World');
	}
</script>
```

## Testing Strategy

### Unit Tests

**Server-Side Tests:**

- Mock service implementation
- Input validation
- Error handling
- Ownership checks

**Client-Side Tests:**

- DocumentClient mode switching
- Browser storage operations
- API request formatting
- Error propagation

### Integration Tests

- End-to-end document CRUD operations
- Guest to authenticated migration
- API route handlers with auth middleware

## Design Decisions

### Why Separate Client/Server Services?

- **Type Safety**: Server providers cannot be imported in client code (SvelteKit convention)
- **Simplified Stores**: Focus on state, not I/O orchestration
- **Testability**: Client service easily mocked for testing
- **Maintainability**: API communication changes isolated to client service

### Why Dual-Mode Architecture?

- **Accessibility**: Guest users can use the app without signup
- **Conversion**: Easy migration from guest to authenticated mode
- **Development**: Faster iteration without auth setup

### Why TOAST Optimization?

- **Performance**: Avoid loading large content when only metadata needed
- **Simplicity**: Single table design (no separate metadata table)
- **Scalability**: PostgreSQL handles TOAST efficiently at scale

### Why 0.5 MB Content Limit?

- **Performance**: Keep documents fast to load/save
- **Storage**: Reasonable limit for text documents
- **UX**: Encourages focused, well-scoped documents
- **Future**: Can be increased if needed with proper optimization

## Constraints and Limitations

### Current Scope

- ✅ CRUD operations for documents
- ✅ Ownership-based authorization
- ✅ Guest mode with localStorage
- ✅ Metadata-only queries
- ✅ Content size validation

### Out of Scope (Future Enhancements)

- ❌ Document sharing/collaboration
- ❌ Version history
- ❌ Document search/full-text indexing
- ❌ Soft delete/trash
- ❌ Document tags/categories
- ❌ Bulk operations
- ❌ Document templates (separate Template Service)

## Cross-References

- [SERVICES.md](./SERVICES.md) - Overall service architecture patterns
- [TEMPLATE_SERVICE.md](./TEMPLATE_SERVICE.md) - Template service design
- [LOGIN_SERVICE.md](./LOGIN_SERVICE.md) - Authentication service design
- [../frontend/ARCHITECTURE.md](../frontend/ARCHITECTURE.md) - Client architecture
- [../frontend/STATE_MANAGEMENT.md](../frontend/STATE_MANAGEMENT.md) - Store patterns
- [../frontend/OPTIMISTIC_PAGE_LOADING.md](../frontend/OPTIMISTIC_PAGE_LOADING.md) - Document loading and switching UX
