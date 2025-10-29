# Phase 5-6 Implementation Plan

## Overview

This document outlines the revised implementation plan for Phases 5 and 6, incorporating feedback to use shadcn-svelte components and unify the guest/authenticated experience.

## Key Architectural Changes

### 1. Unified App Experience

**Before**: Separate routes for guest landing page (`/`) and authenticated app (`/app`)

**After**: Single app at home route (`/`) serving both guest and authenticated users

**Rationale**:

- Simpler user experience - no navigation confusion
- Guest users can immediately use the editor without signup
- Seamless transition from guest to authenticated mode
- Reduces code duplication

### 2. Guest Mode Capabilities

**Guest Users Can**:

- ✅ Use the markdown editor with full formatting toolbar
- ✅ See live preview of their content
- ✅ Store documents in browser LocalStorage
- ✅ Create, edit, and delete local documents

**Guest Users Cannot**:

- ❌ Sync documents across devices
- ❌ Access documents from another browser/device
- ❌ Save to cloud storage

**Implementation**:

- Document store checks authentication state
- If authenticated: Use API endpoints (`/api/documents`)
- If guest: Use LocalStorage with same interface
- Show banner to encourage signup for cloud sync

### 3. shadcn-svelte Component Library

**Components to Use**:

- **Sonner** - Toast notifications (replaces custom Toast component)
- **Dialog** - Modal dialogs (replaces custom Dialog component)
- **Button** - Consistent button styling
- **Card** - Document list items and empty states

**Installation**:

```bash
npx shadcn-svelte@latest init
npx shadcn-svelte@latest add sonner dialog button card
```

**Benefits**:

- Battle-tested, accessible components
- Consistent design system
- Less custom code to maintain
- Built-in dark mode support (future)

## Implementation Steps

### Phase 5: Document Management UI (Revised)

#### 5.1 Install shadcn-svelte

- [ ] Run `npx shadcn-svelte@latest init`
- [ ] Configure with Tailwind CSS 4.0
- [ ] Add Sonner, Dialog, Button, Card components
- [ ] Update dependencies in package.json

#### 5.2 Replace Custom Components

- [ ] Replace custom Toast with Sonner
  - Update `toast.svelte.ts` store to use Sonner API
  - Remove `Toast.svelte` component
- [ ] Replace custom Dialog with shadcn Dialog
  - Update DocumentList to use shadcn Dialog
  - Remove `Dialog.svelte` component
- [ ] Use shadcn Button for consistent styling
- [ ] Use shadcn Card for document list items

#### 5.3 Implement LocalStorage Document Service

- [ ] Create `LocalStorageDocumentService` class
- [ ] Implement same interface as MockDocumentService
- [ ] Store documents as JSON in LocalStorage
- [ ] Add max storage check (quota management)
- [ ] Implement garbage collection for old documents

#### 5.4 Unified Document Store

- [ ] Update document store to detect auth state
- [ ] Switch between API service and LocalStorage service
- [ ] Provide migration path (LocalStorage → API on signup)
- [ ] Show "Upgrade to sync" banner for guest users

#### 5.5 Move App to Home Route

- [ ] Move `(app)/app/+page.svelte` → `+page.svelte`
- [ ] Update authentication check to be optional
- [ ] Show different UI elements based on auth state
- [ ] Keep auth routes (`/login`, `/register`) as is

### Phase 6: Markdown Editor & Preview (Revised)

No significant changes needed - editor works the same for guests and authenticated users.

#### 6.1 Update Editor State Management

- [ ] Editor content auto-saves to LocalStorage for guests
- [ ] Editor content auto-saves to API for authenticated users
- [ ] Show appropriate save status indicator

## File Changes

### Files to Create

- `src/lib/services/documents/localstorage-service.ts` - LocalStorage implementation
- `src/lib/components/ui/` - shadcn components directory
- `plans/PHASE5-6_PLAN.md` - This file

### Files to Modify

- `src/routes/+page.svelte` - Move app UI here
- `src/lib/stores/documents.svelte.ts` - Add LocalStorage support
- `src/lib/stores/toast.svelte.ts` - Use Sonner API
- `src/lib/components/DocumentList.svelte` - Use shadcn components
- `package.json` - Add shadcn-svelte dependencies
- `designs/frontend/ARCHITECTURE.md` - Document new routing
- `designs/frontend/STATE_MANAGEMENT.md` - Document LocalStorage service
- `designs/frontend/UI_COMPONENTS.md` - Reference shadcn components

### Files to Delete

- `src/lib/components/Dialog.svelte` - Replaced by shadcn
- `src/lib/components/Toast.svelte` - Replaced by Sonner
- `src/routes/(app)/app/+page.svelte` - Moved to root

### Files to Keep

- `src/lib/components/MarkdownEditor.svelte` - Editor unchanged
- `src/lib/components/MarkdownPreview.svelte` - Preview unchanged
- `src/lib/components/DocumentEditor.svelte` - Container unchanged
- `src/lib/components/DocumentList.svelte` - Update to use shadcn

## Design Document Updates

### ARCHITECTURE.md

Update routing section:

```markdown
## Routing Structure

- `/` - Main app (guest and authenticated)
- `/login` - Authentication page
- `/register` - Registration page
- `/api/*` - API endpoints

### Guest vs Authenticated

The home route (`/`) serves both guest and authenticated users:

- **Guest users**: Documents stored in LocalStorage
- **Authenticated users**: Documents synced via API

No separate `/app` route - authentication is optional.
```

### STATE_MANAGEMENT.md

Add LocalStorage service documentation:

```markdown
## LocalStorage Document Service

For guest users, documents are stored in browser LocalStorage:

- Max 5MB storage (browser limit)
- Documents stored as JSON array
- Same interface as API service
- Migration to API on signup
```

### UI_COMPONENTS.md

Update component library section:

```markdown
## Component Library: shadcn-svelte

We use shadcn-svelte for common UI components:

- **Sonner**: Toast notifications
- **Dialog**: Modal dialogs and confirmations
- **Button**: Consistent button styling
- **Card**: Document cards and containers

Custom components are only created when shadcn doesn't provide
the specific functionality needed (e.g., MarkdownEditor).
```

## Migration Strategy

### For Existing Users

1. **Authenticated users**: No change - continue using API
2. **New guests**: Start with LocalStorage
3. **Guest → Signup**: Migrate LocalStorage docs to API

### Data Migration Flow

```typescript
async function migrateGuestDocuments() {
	const localDocs = LocalStorageService.getAllDocuments();
	for (const doc of localDocs) {
		await ApiService.createDocument(doc.name, doc.content);
	}
	LocalStorageService.clear();
}
```

## Testing Strategy

### Unit Tests

- LocalStorage service CRUD operations
- Document store auth state switching
- Migration logic

### E2E Tests

- Guest user can create/edit documents (LocalStorage)
- Authenticated user can create/edit documents (API)
- Guest signup migrates documents
- Banner shows for guests, hides for authenticated

## Success Criteria

- [ ] shadcn-svelte components integrated
- [ ] App works at home route `/`
- [ ] Guest users can edit without signup
- [ ] Documents persist in LocalStorage for guests
- [ ] Authenticated users use API as before
- [ ] Smooth transition from guest to authenticated
- [ ] All tests passing
- [ ] Design docs updated

## Timeline

- **Setup shadcn-svelte**: 30 minutes
- **Replace custom components**: 1 hour
- **Implement LocalStorage service**: 2 hours
- **Update document store**: 1 hour
- **Move app to home route**: 1 hour
- **Update design docs**: 1 hour
- **Testing and polish**: 2 hours

**Total**: ~8 hours

## Notes

- Keep authentication routes (`/login`, `/register`) separate
- Maintain backward compatibility with existing API
- LocalStorage quota is ~5-10MB (varies by browser)
- Consider IndexedDB for larger storage needs in future
- Guest banner should be dismissible (localStorage flag)
