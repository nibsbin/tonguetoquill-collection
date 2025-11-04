# Supabase Database Adapter Implementation Plan

This plan outlines the implementation steps for the Supabase Database Adapter as defined in [SUPABASE_DATABASE_ADAPTER.md](../designs/backend/SUPABASE_DATABASE_ADAPTER.md).

> **Related Design**: [SUPABASE_DATABASE_ADAPTER.md](../designs/backend/SUPABASE_DATABASE_ADAPTER.md)
> **Related Contract**: [DOCUMENT_SERVICE.md](../designs/backend/DOCUMENT_SERVICE.md)

## Prerequisites

**Completed:**
- ✅ Document service contract defined (DocumentServiceContract interface)
- ✅ Mock document service implemented (MockDocumentService)
- ✅ Database schema defined (SCHEMAS.md)
- ✅ Supabase auth adapter implemented (reference pattern)
- ✅ Supabase client library installed (@supabase/supabase-js)

**Required:**
- Supabase project with documents table created
- Environment variables configured (SUPABASE_URL, keys)

## Implementation Steps

### Step 1: Create Supabase Document Service File

**File:** `src/lib/server/services/documents/document-supabase-service.ts`

**Tasks:**
- [ ] Create new file following naming convention
- [ ] Import required types from types.ts
- [ ] Import Supabase client types from @supabase/supabase-js
- [ ] Import environment variables
- [ ] Define SupabaseDocumentService class implementing DocumentServiceContract
- [ ] Add JSDoc comments explaining purpose and usage

**Pattern Reference:** 
Follow the structure of `auth-supabase-provider.ts`:
- Class-based implementation
- Constructor initializes Supabase client
- Private helper methods for validation and error mapping
- Public methods implement contract interface

**Deliverable:** Empty class skeleton with proper imports and structure

---

### Step 2: Implement Supabase Client Initialization

**Location:** `SupabaseDocumentService` constructor

**Tasks:**
- [ ] Import environment variables (SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, optional SUPABASE_SECRET_KEY)
- [ ] Validate required environment variables exist
- [ ] Create Supabase client instance using createClient()
- [ ] Configure client options (auth settings)
- [ ] Store client as private instance variable
- [ ] Add error handling for missing configuration

**Configuration:**
```typescript
constructor() {
  const supabaseUrl = env.SUPABASE_URL || publicEnv.PUBLIC_SUPABASE_URL || '';
  const supabaseKey = env.SUPABASE_SECRET_KEY || publicEnv.PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing. Check environment variables.');
  }
  
  this.supabase = createClient(supabaseUrl, supabaseKey);
}
```

**Validation:**
- Fail fast with clear error message if configuration missing
- No fallback values or defaults
- Use service role key for server-side operations

**Deliverable:** Constructor that initializes and validates Supabase client

---

### Step 3: Implement Helper Methods

**Location:** Private methods in `SupabaseDocumentService`

**Tasks:**
- [ ] Implement `validateName(name: string): void`
  - Check length (1-255 characters)
  - Check for leading/trailing whitespace
  - Throw DocumentError if invalid
- [ ] Implement `validateContent(content: string): void`
  - Calculate UTF-8 byte length
  - Check against MAX_CONTENT_SIZE (524,288 bytes)
  - Throw DocumentError if too large
- [ ] Implement `calculateContentSize(content: string): number`
  - Calculate UTF-8 byte length using Buffer
  - Return size in bytes
- [ ] Implement `mapDatabaseError(error: any): DocumentError`
  - Check error codes and messages
  - Map to appropriate DocumentError types
  - Include original error message for debugging

**Validation Constants:**
```typescript
private readonly MAX_CONTENT_SIZE = 524288; // 0.5 MB
private readonly MAX_NAME_LENGTH = 255;
private readonly MIN_NAME_LENGTH = 1;
```

**Error Mapping Logic:**
```typescript
private mapDatabaseError(error: any): DocumentError {
  // Check for specific error patterns
  if (error.message?.includes('check_content_size')) {
    return new DocumentError('content_too_large', 'Content exceeds size limit', 413);
  }
  if (error.code === '23505') { // Unique constraint
    return new DocumentError('validation_error', 'Duplicate entry', 400);
  }
  // Default to unknown error
  return new DocumentError('unknown_error', error.message || 'Database error', 500);
}
```

**Deliverable:** Helper methods for validation and error handling

---

### Step 4: Implement createDocument Method

**Signature:** `createDocument(params: CreateDocumentParams): Promise<Document>`

**Tasks:**
- [ ] Validate name using validateName()
- [ ] Validate content using validateContent()
- [ ] Calculate content_size_bytes using calculateContentSize()
- [ ] Build insert query using Supabase query builder
- [ ] Execute query with error handling
- [ ] Map response to Document type
- [ ] Handle errors with mapDatabaseError()

**Implementation Pattern:**
```typescript
async createDocument(params: CreateDocumentParams): Promise<Document> {
  const { owner_id, name, content } = params;
  
  // Validate inputs
  this.validateName(name);
  this.validateContent(content);
  
  // Calculate size
  const content_size_bytes = this.calculateContentSize(content);
  
  try {
    // Insert document
    const { data, error } = await this.supabase
      .from('documents')
      .insert({
        owner_id,
        name,
        content,
        content_size_bytes
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');
    
    return data as Document;
  } catch (error) {
    throw this.mapDatabaseError(error);
  }
}
```

**Deliverable:** Working createDocument implementation

---

### Step 5: Implement getDocumentMetadata Method

**Signature:** `getDocumentMetadata(userId: UUID, documentId: UUID): Promise<DocumentMetadata>`

**Tasks:**
- [ ] Build select query for metadata fields only (excludes content)
- [ ] Filter by both id AND owner_id for ownership validation
- [ ] Use .single() to get exactly one result
- [ ] Handle not found case (throw DocumentError)
- [ ] Map response to DocumentMetadata type
- [ ] Handle errors with mapDatabaseError()

**Implementation Pattern:**
```typescript
async getDocumentMetadata(userId: UUID, documentId: UUID): Promise<DocumentMetadata> {
  try {
    const { data, error } = await this.supabase
      .from('documents')
      .select('id, owner_id, name, content_size_bytes, created_at, updated_at')
      .eq('id', documentId)
      .eq('owner_id', userId)
      .single();
    
    if (error) throw error;
    if (!data) {
      throw new DocumentError('not_found', 'Document not found', 404);
    }
    
    return data as DocumentMetadata;
  } catch (error) {
    if (error instanceof DocumentError) throw error;
    throw this.mapDatabaseError(error);
  }
}
```

**TOAST Optimization:** By not selecting content field, PostgreSQL automatically skips loading it

**Deliverable:** Working getDocumentMetadata implementation

---

### Step 6: Implement getDocumentContent Method

**Signature:** `getDocumentContent(userId: UUID, documentId: UUID): Promise<Document>`

**Tasks:**
- [ ] Build select query for all fields (includes content)
- [ ] Filter by both id AND owner_id for ownership validation
- [ ] Use .single() to get exactly one result
- [ ] Handle not found case (throw DocumentError)
- [ ] Map response to Document type
- [ ] Handle errors with mapDatabaseError()

**Implementation Pattern:**
```typescript
async getDocumentContent(userId: UUID, documentId: UUID): Promise<Document> {
  try {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('owner_id', userId)
      .single();
    
    if (error) throw error;
    if (!data) {
      throw new DocumentError('not_found', 'Document not found', 404);
    }
    
    return data as Document;
  } catch (error) {
    if (error instanceof DocumentError) throw error;
    throw this.mapDatabaseError(error);
  }
}
```

**Deliverable:** Working getDocumentContent implementation

---

### Step 7: Implement updateDocumentContent Method

**Signature:** `updateDocumentContent(params: UpdateContentParams): Promise<Document>`

**Tasks:**
- [ ] Extract userId, documentId, content from params
- [ ] Validate content using validateContent()
- [ ] Calculate new content_size_bytes
- [ ] Build update query with content, size, and timestamp
- [ ] Filter by both id AND owner_id for ownership validation
- [ ] Use .select() and .single() to return updated document
- [ ] Handle not found case (throw DocumentError)
- [ ] Handle errors with mapDatabaseError()

**Implementation Pattern:**
```typescript
async updateDocumentContent(params: UpdateContentParams): Promise<Document> {
  const { user_id, document_id, content } = params;
  
  // Validate content
  this.validateContent(content);
  
  // Calculate new size
  const content_size_bytes = this.calculateContentSize(content);
  
  try {
    const { data, error } = await this.supabase
      .from('documents')
      .update({
        content,
        content_size_bytes,
        updated_at: new Date().toISOString()
      })
      .eq('id', document_id)
      .eq('owner_id', user_id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) {
      throw new DocumentError('not_found', 'Document not found', 404);
    }
    
    return data as Document;
  } catch (error) {
    if (error instanceof DocumentError) throw error;
    throw this.mapDatabaseError(error);
  }
}
```

**Deliverable:** Working updateDocumentContent implementation

---

### Step 8: Implement updateDocumentName Method

**Signature:** `updateDocumentName(params: UpdateNameParams): Promise<DocumentMetadata>`

**Tasks:**
- [ ] Extract userId, documentId, name from params
- [ ] Validate name using validateName()
- [ ] Build update query with name and timestamp
- [ ] Filter by both id AND owner_id for ownership validation
- [ ] Select metadata fields only (no content needed)
- [ ] Use .single() to get updated metadata
- [ ] Handle not found case (throw DocumentError)
- [ ] Handle errors with mapDatabaseError()

**Implementation Pattern:**
```typescript
async updateDocumentName(params: UpdateNameParams): Promise<DocumentMetadata> {
  const { user_id, document_id, name } = params;
  
  // Validate name
  this.validateName(name);
  
  try {
    const { data, error } = await this.supabase
      .from('documents')
      .update({
        name,
        updated_at: new Date().toISOString()
      })
      .eq('id', document_id)
      .eq('owner_id', user_id)
      .select('id, owner_id, name, content_size_bytes, created_at, updated_at')
      .single();
    
    if (error) throw error;
    if (!data) {
      throw new DocumentError('not_found', 'Document not found', 404);
    }
    
    return data as DocumentMetadata;
  } catch (error) {
    if (error instanceof DocumentError) throw error;
    throw this.mapDatabaseError(error);
  }
}
```

**Deliverable:** Working updateDocumentName implementation

---

### Step 9: Implement deleteDocument Method

**Signature:** `deleteDocument(userId: UUID, documentId: UUID): Promise<void>`

**Tasks:**
- [ ] Build delete query
- [ ] Filter by both id AND owner_id for ownership validation
- [ ] Execute delete
- [ ] Check affected row count
- [ ] Throw DocumentError if no rows deleted (not found)
- [ ] Handle errors with mapDatabaseError()

**Implementation Pattern:**
```typescript
async deleteDocument(userId: UUID, documentId: UUID): Promise<void> {
  try {
    const { error, count } = await this.supabase
      .from('documents')
      .delete({ count: 'exact' })
      .eq('id', documentId)
      .eq('owner_id', userId);
    
    if (error) throw error;
    
    if (count === 0) {
      throw new DocumentError('not_found', 'Document not found', 404);
    }
  } catch (error) {
    if (error instanceof DocumentError) throw error;
    throw this.mapDatabaseError(error);
  }
}
```

**Deliverable:** Working deleteDocument implementation

---

### Step 10: Implement listUserDocuments Method

**Signature:** `listUserDocuments(params: ListDocumentsParams): Promise<DocumentListResult>`

**Tasks:**
- [ ] Extract userId, limit, offset from params
- [ ] Apply defaults (limit=50, offset=0)
- [ ] Validate limit (max 100)
- [ ] Build query for metadata fields only
- [ ] Filter by owner_id
- [ ] Order by created_at DESC
- [ ] Apply pagination with .range()
- [ ] Execute count query separately
- [ ] Map response to DocumentListResult
- [ ] Handle errors with mapDatabaseError()

**Implementation Pattern:**
```typescript
async listUserDocuments(params: ListDocumentsParams): Promise<DocumentListResult> {
  const { user_id, limit = 50, offset = 0 } = params;
  
  // Validate limit
  const validatedLimit = Math.min(limit, 100);
  
  try {
    // Get paginated documents
    const { data, error } = await this.supabase
      .from('documents')
      .select('id, owner_id, name, content_size_bytes, created_at, updated_at')
      .eq('owner_id', user_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + validatedLimit - 1);
    
    if (error) throw error;
    
    // Get total count
    const { count, error: countError } = await this.supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user_id);
    
    if (countError) throw countError;
    
    return {
      documents: data as DocumentMetadata[],
      total: count || 0,
      limit: validatedLimit,
      offset
    };
  } catch (error) {
    throw this.mapDatabaseError(error);
  }
}
```

**TOAST Optimization:** Metadata-only select avoids loading content

**Deliverable:** Working listUserDocuments implementation with pagination

---

### Step 11: Update Provider Factory

**File:** `src/lib/server/services/documents/document-provider.ts`

**Tasks:**
- [ ] Import SupabaseDocumentService
- [ ] Update createDocumentService() to instantiate SupabaseDocumentService when USE_DB_MOCKS=false
- [ ] Remove TODO comment
- [ ] Test factory switching between mock and real service

**Implementation Pattern:**
```typescript
import { SupabaseDocumentService } from './document-supabase-service';

export async function createDocumentService(): Promise<DocumentServiceContract> {
  const useMocks = env.USE_DB_MOCKS === 'true';
  
  if (useMocks) {
    return new MockDocumentService();
  }
  
  // Real Supabase implementation
  return new SupabaseDocumentService();
}
```

**Deliverable:** Provider factory supports both mock and Supabase services

---

### Step 12: Update Exports

**File:** `src/lib/server/services/documents/index.ts`

**Tasks:**
- [ ] Export SupabaseDocumentService from document-supabase-service.ts
- [ ] Verify all types are properly exported
- [ ] Ensure documentService wrapper remains unchanged

**Implementation:**
```typescript
export { SupabaseDocumentService } from './document-supabase-service';
export { MockDocumentService } from './document-mock-service';
export { documentService } from './document-provider';
```

**Deliverable:** Clean public API for document services

---

### Step 13: Write Unit Tests

**File:** `src/lib/server/services/documents/document-supabase-service.test.ts`

**Tasks:**
- [ ] Set up test suite with Vitest
- [ ] Mock Supabase client
- [ ] Test createDocument with valid inputs
- [ ] Test createDocument with invalid name (too long, empty)
- [ ] Test createDocument with content too large
- [ ] Test getDocumentMetadata success case
- [ ] Test getDocumentMetadata not found case
- [ ] Test getDocumentMetadata ownership validation
- [ ] Test getDocumentContent success case
- [ ] Test updateDocumentContent success case
- [ ] Test updateDocumentName success case
- [ ] Test deleteDocument success case
- [ ] Test deleteDocument not found case
- [ ] Test listUserDocuments with pagination
- [ ] Test error mapping for various database errors

**Test Structure:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseDocumentService } from './document-supabase-service';
import { DocumentError } from '$lib/services/documents/types';

describe('SupabaseDocumentService', () => {
  let service: SupabaseDocumentService;
  
  beforeEach(() => {
    // Mock environment variables
    vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'test-key');
    
    service = new SupabaseDocumentService();
  });
  
  describe('createDocument', () => {
    it('should create document with valid inputs', async () => {
      // Test implementation
    });
    
    it('should throw error when name is empty', async () => {
      // Test implementation
    });
  });
  
  // More test suites...
});
```

**Coverage Goals:**
- 100% of public methods
- All validation logic
- All error paths
- Edge cases (empty lists, boundary values)

**Deliverable:** Comprehensive unit test suite

---

### Step 14: Run Contract Compliance Tests

**File:** `src/lib/server/services/documents/document.contract.test.ts`

**Tasks:**
- [ ] Review existing contract tests
- [ ] Run tests against SupabaseDocumentService
- [ ] Fix any contract violations
- [ ] Ensure consistent behavior with MockDocumentService
- [ ] Verify error types and messages match contract

**Approach:**
The existing contract tests should work with both implementations:
```typescript
// Test both implementations
const implementations = [
  { name: 'MockDocumentService', service: new MockDocumentService() },
  { name: 'SupabaseDocumentService', service: new SupabaseDocumentService() }
];

implementations.forEach(({ name, service }) => {
  describe(`${name} Contract Compliance`, () => {
    // Run same tests for both
  });
});
```

**Deliverable:** All contract tests pass for Supabase service

---

### Step 15: Integration Testing (Optional)

**File:** `src/lib/server/services/documents/document.integration.test.ts`

**Tasks:**
- [ ] Set up test Supabase project or local instance
- [ ] Create test database with schema
- [ ] Test end-to-end CRUD operations
- [ ] Test with multiple users (ownership validation)
- [ ] Test pagination with varying data
- [ ] Test error scenarios (constraints, foreign keys)
- [ ] Clean up test data after each test

**Setup:**
```typescript
import { createClient } from '@supabase/supabase-js';

// Use test environment variables
const testSupabase = createClient(
  process.env.TEST_SUPABASE_URL!,
  process.env.TEST_SUPABASE_KEY!
);

beforeEach(async () => {
  // Clean test database
  await testSupabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
});
```

**Note:** Integration tests require a real Supabase instance and may be skipped in CI if not configured.

**Deliverable:** Integration tests verify real database behavior

---

### Step 16: Documentation Updates

**Tasks:**
- [ ] Update DOCUMENT_SERVICE.md with Supabase implementation notes
- [ ] Update README.md with Supabase setup instructions
- [ ] Add .env.example entries for Supabase configuration
- [ ] Document migration from mock to Supabase in README

**Documentation Additions:**

**README.md - Environment Variables:**
```markdown
**Production (Supabase Database):**
- `USE_DB_MOCKS=false` - Use real Supabase database
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key
- `SUPABASE_SECRET_KEY` - Supabase service role key (optional, for server-side)
```

**DOCUMENT_SERVICE.md - Implementation Status:**
```markdown
**Current Implementation:**
- ✅ Mock service (MockDocumentService) for development
- ✅ Supabase service (SupabaseDocumentService) for production
- Toggle with USE_DB_MOCKS environment variable
```

**Deliverable:** Updated documentation reflects Supabase support

---

### Step 17: Environment Configuration

**Files:**
- `.env.example` (update)
- `.env.supabase` (update)

**Tasks:**
- [ ] Add Supabase database configuration to .env.example
- [ ] Update .env.supabase with USE_DB_MOCKS=false
- [ ] Document required vs optional variables
- [ ] Add comments explaining each variable

**Example .env entries:**
```bash
# Database Configuration
USE_DB_MOCKS=false  # Set to 'true' for development with mock service

# Supabase Configuration (required when USE_DB_MOCKS=false)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-service-role-key  # Optional, for server-side operations
```

**Deliverable:** Clear environment configuration examples

---

## Testing Checklist

### Unit Tests
- [ ] All methods have test coverage
- [ ] Validation logic tested
- [ ] Error mapping tested
- [ ] Edge cases covered
- [ ] Mocked Supabase client works correctly

### Contract Tests
- [ ] All contract tests pass for SupabaseDocumentService
- [ ] Behavior matches MockDocumentService
- [ ] Error types and codes consistent

### Integration Tests (Optional)
- [ ] CRUD operations work end-to-end
- [ ] Ownership validation prevents unauthorized access
- [ ] Pagination works correctly
- [ ] TOAST optimization verified (metadata vs content queries)

### Manual Testing
- [ ] Create document via API
- [ ] List documents via API
- [ ] Update document content via API
- [ ] Update document name via API
- [ ] Delete document via API
- [ ] Verify ownership validation (cannot access other user's documents)
- [ ] Test with USE_DB_MOCKS=false

---

## Validation Criteria

### Functionality
- ✅ All DocumentServiceContract methods implemented
- ✅ Ownership validation on all operations
- ✅ Input validation (name, content size)
- ✅ Proper error handling and mapping
- ✅ Pagination support

### Performance
- ✅ TOAST optimization (metadata queries exclude content)
- ✅ Efficient indexing (uses idx_documents_owner_created)
- ✅ Minimal data transfer

### Code Quality
- ✅ TypeScript strict mode compliant
- ✅ Consistent with existing auth adapter pattern
- ✅ Well-documented with JSDoc comments
- ✅ No eslint/prettier violations
- ✅ Proper error handling (no silent failures)

### Testing
- ✅ Unit tests pass
- ✅ Contract tests pass
- ✅ Integration tests pass (if implemented)
- ✅ Test coverage > 80%

### Documentation
- ✅ Design document complete (SUPABASE_DATABASE_ADAPTER.md)
- ✅ Implementation plan complete (this document)
- ✅ README updated with Supabase instructions
- ✅ Code comments explain complex logic

---

## Deployment Checklist

### Prerequisites
- [ ] Supabase project created
- [ ] Database schema deployed (from SCHEMAS.md)
- [ ] Environment variables configured in deployment platform
- [ ] Service role key securely stored

### Deployment Steps
1. [ ] Set USE_DB_MOCKS=false in production environment
2. [ ] Configure Supabase environment variables
3. [ ] Deploy application
4. [ ] Verify database connection works
5. [ ] Test document CRUD operations
6. [ ] Monitor for errors in logs

### Rollback Plan
- Set USE_DB_MOCKS=true to revert to mock service
- No data loss (mock service uses in-memory storage)
- No database changes needed

---

## Success Metrics

### Functional Success
- ✅ All document operations work in production
- ✅ No unauthorized data access
- ✅ Proper error messages for users
- ✅ Fast metadata queries (< 100ms)
- ✅ Acceptable content queries (< 500ms for 0.5MB)

### Code Quality Success
- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors
- ✅ All tests passing
- ✅ Code review approved

### Documentation Success
- ✅ Design document reviewed and approved
- ✅ Implementation matches design
- ✅ README instructions tested
- ✅ Team understands new adapter

---

## Timeline Estimate

**Note:** Per agent instructions, do NOT include time estimates

---

## Cross-References

**Design Documents:**
- [SUPABASE_DATABASE_ADAPTER.md](../designs/backend/SUPABASE_DATABASE_ADAPTER.md) - Adapter design
- [DOCUMENT_SERVICE.md](../designs/backend/DOCUMENT_SERVICE.md) - Service architecture
- [SCHEMAS.md](../designs/backend/SCHEMAS.md) - Database schema
- [SERVICES.md](../designs/backend/SERVICES.md) - Service patterns

**Implementation Files:**
- `src/lib/server/services/documents/document-provider.ts` - Provider factory
- `src/lib/server/services/documents/document-mock-service.ts` - Mock reference
- `src/lib/server/services/auth/auth-supabase-provider.ts` - Pattern reference
- `src/lib/services/documents/types.ts` - Service contract

**Related Plans:**
- [supabase-auth-adapter-implementation.md](./completed/supabase-auth-adapter-implementation.md) - Auth adapter (completed reference)
