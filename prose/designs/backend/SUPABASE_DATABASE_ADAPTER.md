# Supabase Database Adapter Design

This document defines the design for a database adapter that integrates Supabase's PostgreSQL database with the application's document service. The adapter follows the KISS (Keep It Simple, Stupid) principle and seamlessly integrates with the existing service architecture.

> **Related**: [DOCUMENT_SERVICE.md](./DOCUMENT_SERVICE.md) for document service architecture
> **Related**: [SERVICES.md](./SERVICES.md) for service architecture patterns
> **Related**: [SCHEMAS.md](./SCHEMAS.md) for database schema definitions
> **Related**: [SUPABASE_AUTH_ADAPTER.md](./SUPABASE_AUTH_ADAPTER.md) for authentication adapter pattern reference

## Philosophy

**KISS - Keep It Simple, Stupid**

The Supabase database adapter should:
- Use official Supabase libraries (don't reinvent the wheel)
- Delegate all database operations to Supabase client (minimal custom logic)
- Follow the existing DocumentServiceContract interface (no interface changes)
- Use standard SQL patterns via Supabase query builder
- Be easy to understand and maintain

**Key Principle:** Let Supabase do the heavy lifting. Our adapter is just a thin wrapper that translates between our service contract and Supabase's database API.

## Overview

The Supabase Database Adapter is a server-side implementation of the DocumentServiceContract interface that integrates with Supabase's managed PostgreSQL database. It provides:

1. **CRUD Operations**: Create, read, update, and delete documents
2. **Ownership Validation**: Ensure users can only access their own documents
3. **Performance Optimization**: Use PostgreSQL TOAST for selective content loading
4. **Error Handling**: Map database errors to application error types
5. **Type Safety**: TypeScript support with proper typing

**What It Is:**
- A thin adapter between our DocumentServiceContract and Supabase's database API
- Server-side only (never exposed to client)
- Production-ready database integration using Supabase managed PostgreSQL

**What It Is NOT:**
- A custom database abstraction layer
- A client-side service
- A replacement for Supabase's query builder

## Architecture

### Adapter Pattern

The Supabase Database Adapter implements the Adapter pattern to translate between our application's DocumentServiceContract interface and Supabase's database API.

**Flow:**
1. Application Code (API routes)
2. DocumentServiceContract (interface)
3. SupabaseDocumentService (implementation)
4. Supabase Client Library
5. Supabase PostgreSQL Database

### Dependencies

**Required:**
- `@supabase/supabase-js` (v2.x) - Core Supabase client library (already installed)

**Our Approach:**
We use the **Supabase client** with its query builder to implement our DocumentServiceContract interface. This gives us:
- Perfect fit with existing service contract
- Type-safe database queries with TypeScript
- Automatic connection pooling and retry logic
- Row Level Security (RLS) enforcement
- Built-in error handling
- Battle-tested library maintained by Supabase team

## Database Schema

The adapter works with the existing Documents table schema defined in [SCHEMAS.md](./SCHEMAS.md):

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_size_bytes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Enforce content size limit (0.5 MB = 524,288 bytes)
    CONSTRAINT check_content_size CHECK (content_size_bytes <= 524288)
);

-- Index for listing user's documents
CREATE INDEX idx_documents_owner_created ON documents(owner_id, created_at DESC);
```

**Note:** The schema uses lowercase snake_case naming (PostgreSQL convention) while our TypeScript interfaces use camelCase. The adapter handles this mapping automatically.

## Adapter Components

### 1. Supabase Client Initialization

**Purpose:** Create and configure Supabase client instance for database operations

**Configuration:**
- `SUPABASE_URL`: Project URL (e.g., https://xyz.supabase.co)
- `SUPABASE_PUBLISHABLE_KEY`: Public anonymous key for API access
- `SUPABASE_SECRET_KEY`: Service role key for server-side operations (bypasses RLS)

**KISS Approach:**
- Single client instance (singleton pattern)
- Use environment variables for configuration
- Use service role key for server-side operations (we handle authorization ourselves)
- No custom configuration beyond defaults

**Security Note:**
Since we perform authorization checks in the service layer (validating owner_id matches user_id), we use the service role key to bypass RLS. This is appropriate because:
- All operations are server-side only
- Authorization is enforced in the service layer
- RLS would be redundant with our ownership validation

### 2. Create Document

**Purpose:** Insert a new document into the database

**Method:** `createDocument(params: CreateDocumentParams): Promise<Document>`

**Supabase API:** 
```typescript
supabase
  .from('documents')
  .insert({ ... })
  .select()
  .single()
```

**KISS Approach:**
- Validate inputs (name length, content size)
- Calculate content_size_bytes before insertion
- Use Supabase query builder for insertion
- Return full document with generated id and timestamps
- Map database errors to DocumentError types

**Implementation Details:**
- Generate UUID on database side (DEFAULT gen_random_uuid())
- Set timestamps on database side (DEFAULT CURRENT_TIMESTAMP)
- Calculate content_size_bytes in service layer (UTF-8 byte count)
- Validate inputs before database call to fail fast

### 3. Get Document Metadata

**Purpose:** Retrieve document metadata without content (TOAST optimization)

**Method:** `getDocumentMetadata(userId: UUID, documentId: UUID): Promise<DocumentMetadata>`

**Supabase API:**
```typescript
supabase
  .from('documents')
  .select('id, owner_id, name, content_size_bytes, created_at, updated_at')
  .eq('id', documentId)
  .eq('owner_id', userId)
  .single()
```

**KISS Approach:**
- Select only metadata fields (excludes content)
- Filter by both id AND owner_id for ownership validation
- PostgreSQL TOAST automatically skips loading content column
- Return metadata or throw NotFoundError/UnauthorizedError

**Performance Optimization:**
By not selecting the content field, PostgreSQL TOAST mechanism avoids loading the potentially large TEXT value from disk, making metadata queries fast even with large documents.

### 4. Get Document Content

**Purpose:** Retrieve full document including content

**Method:** `getDocumentContent(userId: UUID, documentId: UUID): Promise<Document>`

**Supabase API:**
```typescript
supabase
  .from('documents')
  .select('*')
  .eq('id', documentId)
  .eq('owner_id', userId)
  .single()
```

**KISS Approach:**
- Select all fields (includes content)
- Filter by both id AND owner_id for ownership validation
- Return full document or throw NotFoundError/UnauthorizedError

### 5. Update Document Content

**Purpose:** Update document content and update timestamp

**Method:** `updateDocumentContent(params: UpdateContentParams): Promise<Document>`

**Supabase API:**
```typescript
supabase
  .from('documents')
  .update({ 
    content,
    content_size_bytes,
    updated_at: new Date().toISOString()
  })
  .eq('id', documentId)
  .eq('owner_id', userId)
  .select()
  .single()
```

**KISS Approach:**
- Validate content size before update
- Calculate new content_size_bytes
- Update content, size, and timestamp atomically
- Filter by both id AND owner_id for ownership validation
- Return updated document or throw error

**Note:** We explicitly set updated_at to ensure it changes even if content is identical.

### 6. Update Document Name

**Purpose:** Update document name and update timestamp

**Method:** `updateDocumentName(params: UpdateNameParams): Promise<DocumentMetadata>`

**Supabase API:**
```typescript
supabase
  .from('documents')
  .update({ 
    name,
    updated_at: new Date().toISOString()
  })
  .eq('id', documentId)
  .eq('owner_id', userId)
  .select('id, owner_id, name, content_size_bytes, created_at, updated_at')
  .single()
```

**KISS Approach:**
- Validate name (length, trimming)
- Update name and timestamp
- Filter by both id AND owner_id for ownership validation
- Return metadata only (no need for content)

### 7. Delete Document

**Purpose:** Remove document from database

**Method:** `deleteDocument(userId: UUID, documentId: UUID): Promise<void>`

**Supabase API:**
```typescript
supabase
  .from('documents')
  .delete()
  .eq('id', documentId)
  .eq('owner_id', userId)
```

**KISS Approach:**
- Filter by both id AND owner_id for ownership validation
- Check affected row count to determine if document existed
- Throw NotFoundError if no rows deleted
- Return void on success

### 8. List User Documents

**Purpose:** Retrieve list of user's documents with pagination

**Method:** `listUserDocuments(params: ListDocumentsParams): Promise<DocumentListResult>`

**Supabase API:**
```typescript
// Get paginated results
supabase
  .from('documents')
  .select('id, owner_id, name, content_size_bytes, created_at, updated_at')
  .eq('owner_id', userId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1)

// Get total count
supabase
  .from('documents')
  .select('*', { count: 'exact', head: true })
  .eq('owner_id', userId)
```

**KISS Approach:**
- Select only metadata fields (TOAST optimization)
- Order by created_at DESC (newest first)
- Use range() for pagination (offset-based)
- Separate query for total count (Supabase pattern)
- Default limit 50, max limit 100

**Performance:**
- Uses idx_documents_owner_created index for efficient filtering and sorting
- TOAST optimization avoids loading content for list view
- Separate count query allows for efficient pagination

## Data Mapping

The adapter maps between Supabase's PostgreSQL data structures and our application's TypeScript types.

### Database Column Naming → TypeScript Property Naming

**Database (snake_case) → TypeScript (camelCase):**
- `id` → `id`
- `owner_id` → `owner_id` (keep as-is for consistency)
- `name` → `name`
- `content` → `content`
- `content_size_bytes` → `content_size_bytes` (keep as-is for clarity)
- `created_at` → `created_at` (keep as-is for consistency)
- `updated_at` → `updated_at` (keep as-is for consistency)

**KISS Principle:** Our TypeScript types already use snake_case for these fields to match database conventions, so no mapping needed. This simplifies the adapter code.

### Timestamp Handling

**Database → TypeScript:**
- PostgreSQL TIMESTAMPTZ → ISO 8601 string
- Supabase client automatically converts to ISO 8601 format
- No manual conversion needed

**TypeScript → Database:**
- ISO 8601 string → PostgreSQL TIMESTAMPTZ
- Use `new Date().toISOString()` for updated_at
- Supabase client handles conversion automatically

### UUID Handling

**Database → TypeScript:**
- PostgreSQL UUID → string (TypeScript UUID type alias)
- Supabase client returns UUIDs as strings
- No conversion needed

**TypeScript → Database:**
- string (UUID type alias) → PostgreSQL UUID
- Database validates UUID format
- Invalid UUIDs rejected by database constraint

## Error Handling

### Database Errors → DocumentError

Map Supabase/PostgreSQL error codes to our DocumentError types:

| Database Error | DocumentError Code | HTTP Status | Description |
|----------------|-------------------|-------------|-------------|
| No rows returned (single()) | `not_found` | 404 | Document doesn't exist or user doesn't own it |
| Check constraint violation (content_size) | `content_too_large` | 413 | Content exceeds 0.5 MB limit |
| Check constraint violation (name length) | `invalid_name` | 400 | Name validation failed |
| Foreign key violation | `validation_error` | 400 | Invalid owner_id |
| Network/timeout errors | `unknown_error` | 500 | Database connection issues |
| Other errors | `unknown_error` | 500 | Unexpected errors |

**KISS Approach:**
- Try-catch blocks around all Supabase calls
- Check for specific error codes/messages
- Map to appropriate DocumentError types
- Include original error message for debugging
- Simple error mapping function

**Error Detection Patterns:**
```typescript
// Not found: single() returns null or error
if (!data) {
  throw new DocumentError('not_found', 'Document not found', 404);
}

// Check constraint violations: error.code or error.message
if (error.message.includes('check_content_size')) {
  throw new DocumentError('content_too_large', 'Content exceeds size limit', 413);
}

// No rows affected by delete
if (count === 0) {
  throw new DocumentError('not_found', 'Document not found', 404);
}
```

## Security Considerations

### Row Level Security (RLS)

**Approach:** Service-layer authorization with service role key

We use the service role key (bypasses RLS) because:
- All operations are server-side only (never client-accessible)
- Authorization is enforced in service layer (userId checks)
- Simpler than maintaining parallel RLS policies
- Consistent with existing auth adapter pattern

**Authorization Pattern:**
Every query includes `.eq('owner_id', userId)` to ensure users can only access their own documents. This is enforced at the query level, not RLS level.

### What Supabase Handles (We Trust)

- Connection security (TLS/SSL)
- SQL injection prevention (parameterized queries)
- Connection pooling and management
- Database backups and replication
- Automatic failover and high availability

### What Adapter Handles

- Input validation (name length, content size)
- Ownership validation (every query filters by owner_id)
- Error mapping and handling
- Type conversions (timestamps, UUIDs)
- Content size calculation

**KISS Security:**
- Trust Supabase's security (they're the experts)
- Don't implement custom SQL (use query builder)
- Validate inputs at service boundary
- Always filter by owner_id for data access

## Configuration

### Environment Variables

**Required:**
- `SUPABASE_URL`: Project URL (e.g., https://your-project.supabase.co)
- `SUPABASE_PUBLISHABLE_KEY`: Public anonymous key for client operations

**Optional:**
- `SUPABASE_SECRET_KEY`: Service role key for server-side operations (recommended for production)

**Usage:**
- Use service role key for server-side document operations (bypasses RLS)
- Use publishable key only if implementing RLS policies (not in current design)

### Validation

Adapter should validate configuration on initialization:
- Check required env vars exist
- Throw clear error if misconfigured
- No fallback values (fail fast)

**KISS Validation:**
```typescript
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Supabase configuration missing. Check environment variables.');
}
```

## Provider Factory Integration

The adapter integrates with the existing provider factory pattern in `document-provider.ts`:

```typescript
export async function createDocumentService(): Promise<DocumentServiceContract> {
  const useMocks = env.USE_DB_MOCKS === 'true';
  
  if (useMocks) {
    return new MockDocumentService();
  }
  
  // Phase 10: Real Supabase implementation
  return new SupabaseDocumentService();
}
```

**Pattern Consistency:**
- Same factory pattern as auth service
- Environment variable controls mock vs real
- Lazy singleton for performance
- No interface changes needed

## Performance Optimization

### PostgreSQL TOAST Strategy

The adapter leverages PostgreSQL's TOAST (The Oversized-Attribute Storage Technique) for optimal performance:

**Metadata Queries (List, Get Metadata):**
```typescript
.select('id, owner_id, name, content_size_bytes, created_at, updated_at')
```
- Excludes content field from SELECT
- PostgreSQL TOAST skips loading content from disk
- Fast queries even with large documents

**Content Queries (Get Content, Create, Update):**
```typescript
.select('*') // or explicit list including content
```
- Includes content field in SELECT
- PostgreSQL TOAST loads content as needed
- Only used when content is actually needed

**Benefits:**
- Single table design (no complex joins)
- Automatic optimization (no manual cache management)
- Consistent with design document specifications

### Database Indexes

The adapter relies on existing database indexes for performance:

**Primary Index:**
- `PRIMARY KEY (id)` - Fast lookup by document ID

**Composite Index:**
- `idx_documents_owner_created ON documents(owner_id, created_at DESC)`
- Optimizes list queries (filter by owner, order by date)
- Supports efficient pagination

**No Custom Indexes Needed:**
All query patterns are covered by existing indexes defined in SCHEMAS.md.

## Testing Strategy

### Unit Tests

Test adapter methods in isolation with proper mocking:

**Test Coverage:**
- Test successful CRUD operations
- Test ownership validation (queries filter by owner_id)
- Test error mapping (database errors → DocumentError)
- Test data validation (name, content size)
- Test pagination logic
- Test TOAST optimization (field selection)

**Mocking Strategy:**
- Mock Supabase client responses
- Test adapter logic without real database
- Verify correct query builder calls
- Check error handling paths

**Example Test Cases:**
```typescript
describe('SupabaseDocumentService', () => {
  describe('createDocument', () => {
    it('should create document with valid inputs');
    it('should throw error when name is empty');
    it('should throw error when content exceeds size limit');
  });
  
  describe('getDocumentMetadata', () => {
    it('should return metadata without content');
    it('should throw not_found when document does not exist');
    it('should throw not_found when user does not own document');
  });
  
  // ... more test suites
});
```

### Integration Tests

Test adapter against real Supabase database:

**Test Coverage:**
- End-to-end CRUD operations
- Ownership validation with multiple users
- Pagination with varying limits/offsets
- TOAST optimization verification
- Error scenarios (constraints, foreign keys)

**Setup Requirements:**
- Test Supabase project or local Supabase instance
- Test database with clean state
- Test data fixtures

### Contract Compliance Tests

Verify adapter implements DocumentServiceContract correctly:

**Test Coverage:**
- All interface methods implemented
- Correct return types
- Proper error throwing
- Consistent behavior with mock service

**Reuse Existing Tests:**
The existing `document.contract.test.ts` should work with both MockDocumentService and SupabaseDocumentService, ensuring contract compliance.

## Why This Design?

### Simplicity

- Official library handles complexity
- No custom SQL query building
- Minimal error handling logic
- Clear separation of concerns
- Consistent with existing auth adapter pattern

### Security

- Supabase's database security expertise
- Automatic SQL injection prevention
- Service-layer authorization (explicit owner_id checks)
- No client-side database access
- Secure credential management

### Maintainability

- Less code to maintain
- Library updates handle breaking changes
- Clear documentation from Supabase
- Standard adapter pattern
- Consistent with existing codebase patterns

### Reliability

- Battle-tested library
- Automatic retry logic
- Connection pooling
- Type-safe queries
- Comprehensive error handling

### Performance

- PostgreSQL TOAST optimization
- Efficient indexes
- Connection pooling
- Minimal data transfer (metadata queries)
- Scalable to thousands of documents per user

## Migration Path

### From Mock to Supabase

**Step 1: Database Setup**
- Create Supabase project
- Run schema migrations (SCHEMAS.md)
- Configure environment variables

**Step 2: Adapter Implementation**
- Implement SupabaseDocumentService
- Follow patterns from SupabaseAuthProvider
- Test against real database

**Step 3: Provider Factory Update**
- Update createDocumentService() to return SupabaseDocumentService
- Toggle with USE_DB_MOCKS environment variable
- Deploy to production

**Step 4: Data Migration (Future)**
- Optional: Migration tool for guest documents (localStorage → database)
- Not in scope for initial adapter implementation

## Constraints and Limitations

### In Scope

- Server-side document storage only
- CRUD operations with ownership validation
- Pagination support
- Performance optimization (TOAST)
- Error handling and mapping

### Out of Scope

- Client-side Supabase integration (we use API routes)
- Real-time subscriptions (not in current requirements)
- Document search/full-text indexing (future enhancement)
- Soft delete/trash (future enhancement)
- Document sharing/collaboration (future enhancement)
- Version history (future enhancement)
- Optimistic locking/conflict resolution (not needed for single-user editing)

## Cross-References

**Internal Documentation:**
- [DOCUMENT_SERVICE.md](./DOCUMENT_SERVICE.md) - Overall document service architecture
- [SERVICES.md](./SERVICES.md) - Service patterns and conventions
- [SCHEMAS.md](./SCHEMAS.md) - Database schema definitions
- [SUPABASE_AUTH_ADAPTER.md](./SUPABASE_AUTH_ADAPTER.md) - Authentication adapter pattern reference

**Implementation Files:**
- `src/lib/server/services/documents/document-provider.ts` - Provider factory
- `src/lib/server/services/auth/auth-supabase-provider.ts` - Reference implementation pattern
- `src/lib/services/documents/types.ts` - Service contract and types

**Official Supabase Documentation:**
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript) - Query builder API
- [Supabase Database Guide](https://supabase.com/docs/guides/database) - PostgreSQL best practices
- [Supabase Server-Side Auth](https://supabase.com/docs/guides/auth/server-side) - Server-side patterns
