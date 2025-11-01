# Services Refactor Implementation Plan

This plan outlines the steps to implement the services refactor described in [../designs/backend/SERVICES_REFACTOR.md](../designs/backend/SERVICES_REFACTOR.md).

## Overview

Restructure services to separate server-side provider implementations from client-side communication logic:

- Move server-only logic to `src/lib/server/services/`
- Keep shared types in `src/lib/services/`
- Create centralized client-side service for API/storage communication
- Update stores to use client service instead of direct fetch/localStorage

## Phase 1: Create Server-Side Services Directory

- [ ] Create `src/lib/server/services/documents/` directory
- [ ] Move `src/lib/services/documents/mock-service.ts` → `src/lib/server/services/documents/document-mock-service.ts`
- [ ] Move `src/lib/services/documents/provider.ts` → `src/lib/server/services/documents/document-provider.ts`
- [ ] Create `src/lib/server/services/documents/index.ts` exporting `documentService`
- [ ] Update API route imports to use `$lib/server/services/documents`

## Phase 2: Refactor Client-Side Services

- [ ] Rename `src/lib/services/documents/localstorage-service.ts` → `src/lib/services/documents/document-browser-storage.ts`
- [ ] Update class name: `LocalStorageDocumentService` → `DocumentBrowserStorage`
- [ ] Update export: `localStorageDocumentService` → `documentBrowserStorage`
- [ ] Create `src/lib/services/documents/document-client.ts` with centralized client service
- [ ] Update `src/lib/services/documents/index.ts` to export client service

## Phase 3: Update Stores

- [ ] Update `src/lib/stores/documents.svelte.ts` to use `documentClient` instead of direct fetch/localStorage
- [ ] Remove guest mode branching from store (delegate to client service)
- [ ] Simplify store methods to focus on state management

## Phase 4: Update Auto-Save Utility

- [ ] Update `src/lib/utils/auto-save.svelte.ts` to use `documentClient.updateDocument()`
- [ ] Remove direct localStorage and fetch calls

## Phase 5: Update Tests

- [ ] Move/update contract tests for server services
- [ ] Add tests for client service
- [ ] Update store tests to mock client service
- [ ] Update integration tests as needed

## Phase 6: Update Documentation

- [ ] Update `prose/designs/backend/SERVICES.md` to reference new structure
- [ ] Add cross-reference to `SERVICES_REFACTOR.md`

## Phase 7: Verification

- [ ] Run type checking (`npm run check`)
- [ ] Run unit tests (`npm run test:unit`)
- [ ] Run build (`npm run build`)
- [ ] Verify no client-side imports of `$lib/server/` modules

## Implementation Notes

### Critical Details

1. **Import Paths**: SvelteKit's `$lib/server/` alias prevents client-side imports - use it for all server providers
2. **No Breaking Changes**: Store interface for components remains identical
3. **Incremental Testing**: Test after each phase to catch issues early
4. **Type Safety**: Leverage TypeScript to ensure correct usage

### Migration Safety

- Keep existing types in `src/lib/services/documents/types.ts` - they're shared between client and server
- API routes continue to work unchanged - only internal implementation changes
- Store public API remains the same - components don't need updates

### File Checklist

**Files to Move:**

- `src/lib/services/documents/mock-service.ts` → `src/lib/server/services/documents/document-mock-service.ts`
- `src/lib/services/documents/provider.ts` → `src/lib/server/services/documents/document-provider.ts`

**Files to Rename:**

- `src/lib/services/documents/localstorage-service.ts` → `src/lib/services/documents/document-browser-storage.ts`

**Files to Create:**

- `src/lib/server/services/documents/index.ts`
- `src/lib/services/documents/document-client.ts`

**Files to Update:**

- `src/lib/services/documents/index.ts`
- `src/lib/stores/documents.svelte.ts`
- `src/lib/utils/auto-save.svelte.ts`
- `src/routes/api/documents/+server.ts`
- `src/routes/api/documents/[id]/+server.ts`
- `src/routes/api/documents/[id]/metadata/+server.ts`
- Test files as needed

**Files to Delete:**

- `src/lib/services/documents/mock-service.ts` (moved)
- `src/lib/services/documents/provider.ts` (moved)
- `src/lib/services/documents/localstorage-service.ts` (renamed)

## Success Criteria

✅ All server provider code in `src/lib/server/services/`
✅ Client service abstracts all fetch/localStorage operations
✅ Stores only manage state, delegate I/O to client service
✅ No direct imports of server providers in client code
✅ All tests pass
✅ Build succeeds with no errors
✅ Type checking passes

## Cross-References

- Design: [../designs/backend/SERVICES_REFACTOR.md](../designs/backend/SERVICES_REFACTOR.md)
- Original Services Design: [../designs/backend/SERVICES.md](../designs/backend/SERVICES.md)
- Frontend Architecture: [../designs/frontend/ARCHITECTURE.md](../designs/frontend/ARCHITECTURE.md)
