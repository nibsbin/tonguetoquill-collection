# Document Service Interface Unification Implementation Plan

**Design Document**: `prose/designs/document-service-interface-unification.md`

## Overview

Eliminate conditional routing in DocumentClient by unifying all document storage implementations under a single `DocumentServiceContract` interface. This refactoring removes 10 conditional branches and reduces DocumentClient complexity by ~55%.

## Current State Analysis

### DocumentClient Conditional Routing

**File**: `src/lib/services/documents/document-client.ts`

Every method has conditional branching:
- Line 22-33: `listDocuments()` - if/else on `isGuest()`
- Line 39-54: `getDocument()` - if/else on `isGuest()`
- Line 60-76: `createDocument()` - if/else on `isGuest()`
- Line 86-99: `updateDocument()` (guest path only)
- Line 122-134: `deleteDocument()` - if/else on `isGuest()`

**Total**: 5 methods with 10 code paths (each method has 2 branches)

### DocumentBrowserStorage Non-Conformant Interface

**File**: `src/lib/services/documents/document-browser-storage.ts`

Methods don't match `DocumentServiceContract`:
- `createDocument(name, content)` - should take `CreateDocumentParams`
- `getDocumentMetadata(id)` - should take `DocumentReferenceParams`
- `getDocumentContent(id)` - should take `DocumentReferenceParams`
- `updateDocumentContent(id, content)` - should take `UpdateContentParams`
- `updateDocumentName(id, name)` - should take `UpdateNameParams`
- `deleteDocument(id)` - should take `DocumentReferenceParams`
- `listUserDocuments()` - should take `ListDocumentsParams`

Returns partial types instead of full contract types.

### DocumentStore Usage

**File**: `src/lib/stores/documents.svelte.ts`

Line 29: Creates client with `createDocumentClient(() => this._isGuest)`
- Passes guest mode accessor function
- No user ID passed
- Client handles routing internally

## Implementation Steps

### Step 1: Update DocumentBrowserStorage to Implement Contract

**Action**: Refactor `src/lib/services/documents/document-browser-storage.ts`

**Changes**:

1. Add type import at top:
```typescript
import type {
  CreateDocumentParams,
  Document,
  DocumentListResult,
  DocumentMetadata,
  DocumentServiceContract,
  ListDocumentsParams,
  UpdateContentParams,
  UpdateNameParams,
  DocumentReferenceParams
} from './types';
```

2. Update class declaration:
```typescript
export class DocumentBrowserStorage implements DocumentServiceContract {
```

3. Update method signatures to match contract:
   - `createDocument(params: CreateDocumentParams): Promise<Document>`
   - `getDocumentMetadata(params: DocumentReferenceParams): Promise<DocumentMetadata>`
   - `getDocumentContent(params: DocumentReferenceParams): Promise<Document>`
   - `updateDocumentContent(params: UpdateContentParams): Promise<Document>`
   - `updateDocumentName(params: UpdateNameParams): Promise<DocumentMetadata>`
   - `deleteDocument(params: DocumentReferenceParams): Promise<void>`
   - `listUserDocuments(params: ListDocumentsParams): Promise<DocumentListResult>`

4. Update method implementations:
   - Extract values from params instead of direct arguments
   - Return complete `Document` objects instead of partial types
   - Return `DocumentListResult` with pagination info
   - Ignore `user_id` param (always 'guest' for browser storage)
   - Maintain all existing validation and localStorage logic

5. Keep `StoredDocument` interface and private helper methods unchanged

6. Remove the singleton export temporarily (will be restored after testing)

**Lines to modify**: ~70 lines (method signatures and implementations)
**Lines to add**: ~15 lines (imports and return type adjustments)

### Step 2: Create APIDocumentService

**Action**: Create new file `src/lib/services/documents/api-document-service.ts`

**Content**:
```typescript
import type {
  CreateDocumentParams,
  Document,
  DocumentListResult,
  DocumentMetadata,
  DocumentServiceContract,
  ListDocumentsParams,
  UpdateContentParams,
  UpdateNameParams,
  DocumentReferenceParams
} from './types';

export class APIDocumentService implements DocumentServiceContract {

  async createDocument(params: CreateDocumentParams): Promise<Document> {
    // POST to /api/documents with {name, content}
    // Transform response to Document type
  }

  async getDocumentMetadata(params: DocumentReferenceParams): Promise<DocumentMetadata> {
    // GET /api/documents/{id} with select for metadata only
    // Or fetch full document and strip content
  }

  async getDocumentContent(params: DocumentReferenceParams): Promise<Document> {
    // GET /api/documents/{id}
    // Return full document
  }

  async updateDocumentContent(params: UpdateContentParams): Promise<Document> {
    // PUT /api/documents/{id} with {content}
    // Return updated document
  }

  async updateDocumentName(params: UpdateNameParams): Promise<DocumentMetadata> {
    // PUT /api/documents/{id} with {name}
    // Return metadata
  }

  async deleteDocument(params: DocumentReferenceParams): Promise<void> {
    // DELETE /api/documents/{id}
  }

  async listUserDocuments(params: ListDocumentsParams): Promise<DocumentListResult> {
    // GET /api/documents with ?limit&offset
    // Return DocumentListResult
  }
}
```

**Implementation Details**:
- Extract fetch logic from current DocumentClient methods
- Add proper error handling and response parsing
- Transform API responses to match contract types
- Handle network errors consistently
- Support pagination parameters

**Lines to add**: ~150 lines (new service implementation)

### Step 3: Refactor DocumentClient

**Action**: Refactor `src/lib/services/documents/document-client.ts`

**Changes**:

1. Update constructor to accept service:
```typescript
export class DocumentClient {
  constructor(
    private service: DocumentServiceContract,
    private userId: string
  ) {}
}
```

2. Remove `isGuest` function parameter

3. Update all methods to pure delegation:
   - Remove all `if (this.isGuest())` conditional branches
   - Call `this.service.methodName(params)` directly
   - Construct params with `this.userId`

4. Method implementations become:
```typescript
async listDocuments(): Promise<DocumentMetadata[]> {
  const result = await this.service.listUserDocuments({
    user_id: this.userId
  });
  return result.documents;
}

async getDocument(id: string): Promise<{ id: string; content: string; name: string }> {
  const doc = await this.service.getDocumentContent({
    user_id: this.userId,
    document_id: id
  });
  return { id: doc.id, content: doc.content, name: doc.name };
}

async createDocument(name: string, content: string = ''): Promise<DocumentMetadata> {
  const doc = await this.service.createDocument({
    owner_id: this.userId,
    name,
    content
  });
  // Return metadata (exclude content)
  const { content: _, ...metadata } = doc;
  return metadata;
}

async updateDocument(
  id: string,
  updates: { content?: string; name?: string }
): Promise<{ content_size_bytes?: number; updated_at?: string }> {
  let result: Document | DocumentMetadata;

  if (updates.content !== undefined) {
    result = await this.service.updateDocumentContent({
      user_id: this.userId,
      document_id: id,
      content: updates.content
    });
  }

  if (updates.name !== undefined) {
    result = await this.service.updateDocumentName({
      user_id: this.userId,
      document_id: id,
      name: updates.name
    });
  }

  return {
    content_size_bytes: result.content_size_bytes,
    updated_at: result.updated_at
  };
}

async deleteDocument(id: string): Promise<void> {
  await this.service.deleteDocument({
    user_id: this.userId,
    document_id: id
  });
}
```

5. Update factory function:
```typescript
export function createDocumentClient(
  isGuest: boolean,
  userId: string = 'guest'
): DocumentClient {
  const service = isGuest
    ? new DocumentBrowserStorage()
    : new APIDocumentService();

  return new DocumentClient(service, userId);
}
```

**Lines to delete**: ~70 lines (all conditional branches and fetch logic)
**Lines to add**: ~60 lines (delegation implementations)
**Net change**: DocumentClient shrinks from 135 lines → ~75 lines (44% reduction)

### Step 4: Update DocumentStore

**Action**: Update `src/lib/stores/documents.svelte.ts`

**Changes**:

1. Add userId state:
```typescript
private _userId = $state<string>('guest');
```

2. Update client creation to pass userId:
```typescript
private documentClient = $derived(
  createDocumentClient(this._isGuest, this._userId)
);
```

Or keep it simpler with recreation on auth change:
```typescript
private rebuildClient() {
  this.documentClient = createDocumentClient(this._isGuest, this._userId);
}
```

3. Add method to set userId:
```typescript
setUserId(userId: string) {
  this._userId = userId;
  this.rebuildClient();
}
```

4. Update setGuestMode to rebuild client:
```typescript
setGuestMode(isGuest: boolean) {
  this._isGuest = isGuest;
  this.rebuildClient();
}
```

**Alternative Approach** (if derived doesn't work with class instances):
Keep current approach but update factory call:
```typescript
// In +layout.svelte or auth handler
documentStore.setGuestMode(false);
documentStore.setUserId(user.id);
```

**Lines to modify**: ~10 lines
**Lines to add**: ~5 lines

### Step 5: Update DocumentBrowserStorage Export

**Action**: Update exports in `src/lib/services/documents/document-browser-storage.ts`

**Changes**:

Keep singleton export for backward compatibility:
```typescript
export const documentBrowserStorage = new DocumentBrowserStorage();
```

But also export class for direct instantiation:
```typescript
export { DocumentBrowserStorage };
```

**Lines to add**: 1 line

### Step 6: Update Index Exports

**Action**: Update `src/lib/services/documents/index.ts`

**Changes**:

Add API service to exports:
```typescript
export * from './api-document-service';
```

**Lines to add**: 1 line

### Step 7: Find and Update UserId Usage

**Action**: Search for where user ID is available and pass to client

**Commands**:
```bash
grep -r "user\.id\|userId" src/ --include="*.svelte" --include="*.ts"
```

**Expected locations**:
- `src/routes/+layout.svelte` - auth handling
- `src/lib/components/TopMenu.svelte` - user display

**Changes**:
Update auth flow to pass user ID to document store:
```typescript
// When user logs in
documentStore.setGuestMode(false);
documentStore.setUserId(user.id);

// When user logs out
documentStore.setGuestMode(true);
documentStore.setUserId('guest');
```

### Step 8: Verify Type Compliance

**Action**: Check that all implementations properly implement contract

**Commands**:
```bash
grep -A 2 "implements DocumentServiceContract" src/lib/services/documents/
```

**Expected**:
- MockDocumentService ✅
- SupabaseDocumentService ✅
- DocumentBrowserStorage ✅ (after Step 1)
- APIDocumentService ✅ (after Step 2)

### Step 9: Test Changes

**Action**: Manual verification and testing

**Test Cases**:

1. **Guest Mode Document Operations**:
   - Create document → stored in localStorage
   - List documents → retrieved from localStorage
   - Update document → persisted to localStorage
   - Delete document → removed from localStorage

2. **Authenticated Mode Document Operations**:
   - Create document → API call to /api/documents
   - List documents → API call to /api/documents
   - Update document → API call to /api/documents/{id}
   - Delete document → API call to /api/documents/{id}

3. **Mode Switching**:
   - Switch from guest to authenticated → client recreated with API service
   - Switch from authenticated to guest → client recreated with browser storage
   - Documents load correctly after mode switch

4. **Error Handling**:
   - Validation errors thrown correctly
   - Network errors handled gracefully
   - Optimistic updates rolled back on failure

**Commands**:
```bash
npm run dev
# Test in browser UI
# Check browser console for errors
# Verify localStorage operations (guest mode)
# Verify network requests (authenticated mode)
```

### Step 10: Code Cleanup

**Action**: Remove unused code and imports

**Check for**:
- Unused imports in DocumentClient
- Dead code paths
- Console logs or debug statements

## Rollback Plan

Each step is independent and can be rolled back:
1. Step 1-2: Can be developed without affecting existing code
2. Step 3: Revert DocumentClient changes
3. Step 4: Revert DocumentStore changes
4. Use `git reset --hard HEAD~N` to undo N commits

## Risk Assessment

**Medium Risk**:
- Significant refactoring of core document handling
- Touches multiple files and layers
- Changes how services are instantiated
- Need to pass userId through layers

**Mitigation**:
- Implement incrementally with git commits after each step
- Test thoroughly at each step
- Keep backward compatibility where possible
- Can feature-flag the change if needed

**High-Risk Areas**:
- DocumentStore client recreation logic
- UserId availability and threading
- Browser storage backward compatibility with localStorage data

## Success Verification

After completion, verify:
- [ ] DocumentBrowserStorage implements DocumentServiceContract
- [ ] APIDocumentService created and implements contract
- [ ] DocumentClient has zero `if (isGuest())` branches
- [ ] DocumentClient constructor takes service and userId
- [ ] Factory function creates appropriate service
- [ ] DocumentStore passes userId to client
- [ ] Guest mode operations work (localStorage)
- [ ] Authenticated mode operations work (API)
- [ ] Mode switching works correctly
- [ ] All document operations succeed
- [ ] Error handling works as expected
- [ ] No TypeScript errors
- [ ] No console errors in browser

## Estimated Impact

**Code Changes**:
- DocumentBrowserStorage: 166 lines → ~180 lines (+8%)
- APIDocumentService: 0 lines → ~150 lines (new)
- DocumentClient: 135 lines → ~75 lines (-44%)
- DocumentStore: ~250 lines → ~260 lines (+4%)

**Complexity Reduction**:
- Conditional branches in DocumentClient: 10 → 0 (100% elimination)
- Code paths to test: 10 → 5 (50% reduction)
- Lines of conditional routing: ~70 → 0 (100% elimination)

**Maintainability**:
- Document operations: 3 different interfaces → 1 unified interface
- Service selection: Distributed → Centralized in factory
- Extensibility: Hard to add storage → Easy (implement interface)
