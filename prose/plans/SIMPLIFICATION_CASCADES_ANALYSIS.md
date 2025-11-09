# Simplification Cascades Analysis

**Date**: 2025-11-09  
**Status**: Analysis Complete  
**Priority**: High-impact opportunities identified

## Executive Summary

This analysis identifies **5 major simplification cascade opportunities** in the tonguetoquill-web codebase that could eliminate significant complexity. These cascades follow the pattern: "one insight eliminates 10+ things."

**Key Finding**: The codebase shows excellent architectural discipline but has accumulated complexity in specific areas where a unifying abstraction could collapse multiple similar patterns into one.

---

## Cascade 1: Client Service Layer Duplication

### Current Patterns

**Client-Side Services** (`src/lib/services/`) - **WILL BE REFACTORED**:

- quillmark service (WASM engine, singleton pattern)
- templates service (manifest loading, singleton pattern)
- Other browser-based services with initialization lifecycle

**Server-Side Services** (`src/lib/server/services/`) - **NO CHANGES NEEDED**:

- auth provider (factory pattern - already clean)
- documents provider (factory pattern - already clean)
- templates loader (simple utility)
- user service (factory pattern - already clean)

**Design Documents**:

- TEMPLATE_SERVICE.md (client-side singleton)
- SERVICE.md patterns (various)

### The Problem

**Client services only** - each implements ~100-150 lines of identical boilerplate:

- Singleton pattern with getInstance()
- Async initialization with idempotency checks
- initialized flag and isReady() method
- validateInitialized() before operations
- Similar error handling patterns

**Example redundancy** (repeated in templates, quillmark, etc.):
- Private static instance field
- Private initialized boolean
- Static getInstance() method (~10 lines)
- Async initialize() wrapper (~15 lines)
- isReady() check (~3 lines)
- validateInitialized() helper (~8 lines)

### Unifying Insight

**"Client services share identical initialization/lifecycle patterns; server services already use clean factory pattern"**

After analyzing actual implementations, we observe **two distinct patterns**:

**Client Services** (templates, quillmark):
- All implement singleton pattern with getInstance()
- All have async initialize() with idempotency checks
- All have isReady() and validateInitialized() boilerplate
- ~100-150 lines of repeated code per service

**Server Services** (document-provider, auth-provider):
- Already use simple factory functions with environment-based selection
- No initialization boilerplate - just mock vs real implementation switching
- Already clean and appropriate for their use case

**Key Finding**: Only client services have eliminable duplication. Server services should remain as factory functions.

### Proposed Abstraction

**1. ClientService Base Class** (for browser services):
- Abstract base class with generic singleton pattern
- Provides: getInstance(), initialize(), isReady(), validateInitialized()
- Eliminates 100-150 lines of boilerplate per client service
- Client services (templates, quillmark) extend this and only implement business logic

**2. Server Services - Keep Factory Pattern**:
- Server services (document-provider, auth-provider) already use appropriate factory pattern
- No base class needed - current approach is already clean
- Factory functions handle mock vs real implementation selection
- No boilerplate to eliminate

**3. Optional DualModeProvider Utility** (client-side):
- Generic helper for services with guest/authenticated mode switching
- Used by client services that need localStorage vs API toggling

### What Becomes Unnecessary

**Client Services Only**:
- ❌ Repeated singleton implementations in client services (~3-4 eliminated)
- ❌ Repeated initialization patterns in client services
- ❌ Repeated isReady() and validateInitialized() boilerplate
- ❌ Custom dual-mode switching logic (if using DualModeProvider)
- ❌ Multiple design documents explaining client service patterns

**Server Services**: No changes needed - already using appropriate pattern.

**Estimated Impact**:

- **Eliminates**: ~150-200 lines of client service boilerplate
- **Consolidates**: Service pattern docs → 1 CLIENT_SERVICE_FRAMEWORK.md
- **Reduces**: Cognitive load for new client service implementations
- **Preserves**: Clean server-side factory pattern (no unnecessary abstraction)

---

## Cascade 2: Widget Overlay System

### Current Variations (13+ implementations)

**Base Components** (`src/lib/components/ui/`):

- base-dialog.svelte (with variants)
- base-popover.svelte
- base-sheet.svelte
- base-select.svelte (dropdown)
- toast.svelte

**Feature Components Using Overlays**:

- AboutModal.svelte
- DocumentInfoDialog.svelte
- ImportFileDialog.svelte
- NewDocumentDialog/NewDocumentDialog.svelte
- PrivacyModal.svelte
- ShareModal.svelte
- TermsModal.svelte
- LoginPopover.svelte

**Supporting Systems**:

- `stores/overlay.svelte.ts` (overlay coordination)
- `stores/toast.svelte.ts` (toast state)
- portal.svelte (teleport)

**Design Documents**:

- WIDGET_ABSTRACTION.md (138 pages!)
- WIDGET_THEME_UNIFICATION.md
- ZINDEX_STRATEGY.md
- POPOVER_SIDEBAR_ALIGNMENT.md

### The Problem

Each widget type implements its own:

- ESC key dismissal logic
- Backdrop click detection
- Close button rendering
- Focus management
- Z-index positioning
- onOpenChange callback pattern
- ARIA attributes

**Observation**: The design doc WIDGET_ABSTRACTION.md is **1,051 lines** - a red flag that the abstraction isn't complete.

### Unifying Insight

**"All overlays are portaled elements with dismissal, focus, and positioning"**

The differences are cosmetic:

- Dialog = centered with backdrop
- Popover = positioned near trigger
- Sheet = slide-in from edge
- Toast = positioned corner
- Select = positioned below trigger

Core behavior is identical:

- Show/hide state management
- Dismissal methods (ESC, backdrop, close button)
- Focus trap or return
- Portal rendering
- Z-index layering

### Proposed Abstraction

**Unified Overlay Primitive**:

```typescript
// Single overlay component with behavior composition
<Overlay
  open={open}
  onOpenChange={handleChange}

  // Behavior (all opt-in with defaults)
  dismissOn={{ escape: true, backdrop: true, outside: true }}
  focusTrap={true}
  returnFocus={true}

  // Positioning (one of these)
  position="center"           // Dialog
  position={{ near: trigger, side: 'bottom' }}  // Popover
  position={{ edge: 'right' }}                  // Sheet
  position={{ corner: 'top-right' }}            // Toast

  // Styling
  backdrop={true}
  zLayer="modal"
  animation="fade" | "slide" | "scale"
>
  {@render content()}
</Overlay>
```

**Result**: All widget types become styling variations of ONE component.

### What Becomes Unnecessary

- ❌ 5 separate base widget components → 1 Overlay
- ❌ Repeated dismissal logic (ESC, backdrop, close)
- ❌ Repeated focus management
- ❌ Repeated portal rendering
- ❌ Separate overlay coordination store (built-in)
- ❌ 4 design documents about widgets
- ❌ 1,051 lines of WIDGET_ABSTRACTION.md explaining complexity

**Estimated Impact**:

- **Eliminates**: ~800 lines of widget code
- **Consolidates**: 4 design documents → 1 OVERLAY_SYSTEM.md
- **Simplifies**: All feature dialogs by 30-50%
- **Reduces**: Z-index conflicts to zero (single system)

---

## Cascade 3: Error Handling Duplication

### Current Variations (15+ implementations)

**Error Types Across Layers**:

- QuillMark diagnostics (WASM errors)
- Service errors (auth, documents, templates, user)
- API errors (400, 401, 403, 404, 500)
- Network errors (timeout, connection)
- Validation errors (form, content)

**Error Display Components**:

- Toast notifications (transient)
- Inline error displays (preview pane)
- Form validation messages
- Error boundaries (future?)

**Error Handling Code**:

- Each service: custom error classes
- Each API route: custom error responses
- Each component: custom error display
- Each store: custom error state

**Design Documents**:

- ERROR_HANDLING.md (end-to-end flow)
- ERROR_DISPLAY.md (UI patterns)
- DIAGNOSTICS.md (QuillMark errors)

### The Problem

Each layer defines its own:

- Error class hierarchy
- Error codes and messages
- Error transformation logic
- Retry strategies
- Display patterns

**Example of redundancy**:

```typescript
// documents service
export class NotFoundError extends Error {
	code = 'not_found';
}
export class UnauthorizedError extends Error {
	code = 'unauthorized';
}
export class ValidationError extends Error {
	code = 'validation_error';
}

// auth service
export class AuthError extends Error {
	code = 'auth_invalid';
}
export class TokenExpiredError extends Error {
	code = 'token_expired';
}

// templates service
export class TemplateError extends Error {
	code = 'not_found' | 'load_error';
}

// API routes
return json({ error: 'not_found', message: '...' }, { status: 404 });
return json({ error: 'unauthorized', message: '...' }, { status: 401 });
```

### Unifying Insight

**"All errors are structured messages with codes, context, and recovery strategies"**

Every error needs:

1. **Code**: Machine-readable identifier
2. **Message**: Human-readable description
3. **Context**: What was being attempted
4. **Hint**: How to fix (optional)
5. **Recovery**: What actions are available

The only differences are:

- Domain-specific error codes
- Recovery strategies (retry, refresh token, show form error)

### Proposed Abstraction

**Unified Error System**:

```typescript
// Single error class with composition
class AppError extends Error {
	constructor(
		public code: ErrorCode,
		public message: string,
		public context?: Record<string, unknown>,
		public hint?: string,
		public cause?: Error
	) {
		super(message);
	}

	// Recovery strategies
	get retryable(): boolean {
		/* ... */
	}
	get refreshableAuth(): boolean {
		/* ... */
	}
	get userFixable(): boolean {
		/* ... */
	}

	// Display strategy
	get displayMode(): 'toast' | 'inline' | 'modal' {
		/* ... */
	}
}

// Error codes as typed constants
const ErrorCodes = {
	// Network
	NETWORK_TIMEOUT: 'network.timeout',
	NETWORK_OFFLINE: 'network.offline',

	// Auth
	AUTH_EXPIRED: 'auth.expired',
	AUTH_INVALID: 'auth.invalid',

	// Documents
	DOCUMENT_NOT_FOUND: 'document.not_found',
	DOCUMENT_TOO_LARGE: 'document.too_large',

	// QuillMark
	QUILLMARK_PARSE_ERROR: 'quillmark.parse',
	QUILLMARK_RENDER_ERROR: 'quillmark.render'
} as const;

// Automatic error handling
async function handleServiceCall<T>(
	fn: () => Promise<T>,
	context: string
): Promise<Result<T, AppError>> {
	try {
		return { ok: true, value: await fn() };
	} catch (error) {
		const appError = AppError.from(error, context);

		// Automatic retry for retryable errors
		if (appError.retryable) {
			return retry(fn, 3);
		}

		// Automatic token refresh for auth errors
		if (appError.refreshableAuth) {
			await refreshAuth();
			return fn();
		}

		// Display error appropriately
		displayError(appError);

		return { ok: false, error: appError };
	}
}
```

### What Becomes Unnecessary

- ❌ 8+ custom error classes across services
- ❌ Repeated try/catch boilerplate (automatic handling)
- ❌ Manual retry logic (6+ implementations)
- ❌ Manual token refresh (3+ implementations)
- ❌ Custom error display decisions (automatic)
- ❌ 3 design documents explaining error patterns

**Estimated Impact**:

- **Eliminates**: ~400 lines of error handling code
- **Consolidates**: 3 design documents → 1 ERROR_SYSTEM.md
- **Standardizes**: All error display patterns
- **Reduces**: Error handling bugs (single source of truth)

---

## Cascade 4: State Store Fragmentation

### Current Variations (5+ stores)

**Global Stores** (`src/lib/stores/`):

- documents.svelte.ts (7,734 bytes)
- overlay.svelte.ts (3,152 bytes)
- responsive.svelte.ts (1,300 bytes)
- ruler.svelte.ts (312 bytes)
- toast.svelte.ts (1,618 bytes)

**State Patterns in Stores**:

- Loading states (documents, auth)
- Error states (documents)
- Active selection (documents: activeDocumentId)
- UI state (overlay: which overlays are open)
- Responsive state (screen size)
- Temporary state (toast: active toasts, ruler: visible)

### The Problem

Each store reinvents:

- Loading state management
- Error state management
- Collection management (add, remove, update)
- Active item selection
- State persistence (some use localStorage)

**Example redundancy**:

```typescript
// documents store
class DocumentsStore {
	documents = $state<DocumentMetadata[]>([]);
	activeDocumentId = $state<string | null>(null);
	loading = $state(false);
	error = $state<string | null>(null);

	async fetchDocuments() {
		this.loading = true;
		this.error = null;
		try {
			const docs = await documentClient.listDocuments();
			this.documents = docs;
		} catch (err) {
			this.error = err.message;
		} finally {
			this.loading = false;
		}
	}
}

// Similar pattern would exist for templates, users, etc.
```

### Unifying Insight

**"All stores are reactive collections with loading/error states and operations"**

Common patterns:

1. **Collection store**: List of items with CRUD
2. **Single-value store**: One value with loading/error
3. **UI state store**: Transient flags and settings
4. **Persistent store**: Auto-sync to localStorage

### Proposed Abstraction

**Generic Store Patterns**:

```typescript
// Collection store pattern
function createCollectionStore<T, TId>(config: {
	idKey: keyof T;
	fetcher: () => Promise<T[]>;
	operations?: CRUD<T>;
}) {
	const items = $state<T[]>([]);
	const loading = $state(false);
	const error = $state<string | null>(null);
	const activeId = $state<TId | null>(null);

	// Automatic derived values
	const activeItem = $derived(items.find((item) => item[config.idKey] === activeId));

	// Generic operations
	async function fetch() {
		/* ... */
	}
	async function create(item: T) {
		/* ... */
	}
	async function update(id: TId, updates: Partial<T>) {
		/* ... */
	}
	async function remove(id: TId) {
		/* ... */
	}

	return { items, loading, error, activeId, activeItem, fetch, create, update, remove };
}

// Usage becomes trivial:
const documents = createCollectionStore({
	idKey: 'id',
	fetcher: () => documentClient.listDocuments(),
	operations: documentClient
});

const templates = createCollectionStore({
	idKey: 'file',
	fetcher: () => templateService.listTemplates()
	// Read-only (no operations)
});
```

**Persistent Store Pattern**:

```typescript
function createPersistedStore<T>(key: string, defaultValue: T) {
	const value = $state<T>(loadFromStorage(key) ?? defaultValue);

	$effect(() => {
		saveToStorage(key, value);
	});

	return { value };
}

// Usage:
const preferences = createPersistedStore('preferences', {
	autoSave: true,
	theme: 'dark'
});
```

### What Becomes Unnecessary

- ❌ Repeated loading/error state management (5 eliminated)
- ❌ Repeated collection operations (add, remove, update)
- ❌ Repeated active item selection logic
- ❌ Custom localStorage sync (2+ implementations)
- ❌ Manual derived state calculations

**Estimated Impact**:

- **Eliminates**: ~200 lines of store boilerplate
- **Standardizes**: All store patterns
- **Reduces**: State management bugs
- **Simplifies**: Adding new stores (2-5 lines vs 50+ lines)

---

## Cascade 5: Design Document Proliferation

### Current Situation (36 documents)

**Backend** (8 documents):

- SERVICES.md
- SCHEMAS.md
- DOCUMENT_SERVICE.md
- LOGIN_SERVICE.md
- TEMPLATE_SERVICE.md
- SUPABASE_AUTH_ADAPTER.md
- SUPABASE_DATABASE_ADAPTER.md
- USER_SERVICE.md

**Frontend** (20 documents):

- ARCHITECTURE.md
- DESIGN_SYSTEM.md
- STATE_MANAGEMENT.md
- API_INTEGRATION.md
- COMPONENT_ORGANIZATION.md
- ACCESSIBILITY.md
- SIDEBAR.md
- NEW_DOCUMENT.md
- TEMPLATE_SELECTOR.md
- LOGIN_PROFILE_UI.md
- LOGO_SIDEBAR.md
- MARKDOWN_EDITOR.md
- EMPTY_STATE_EDITOR.md
- ERROR_DISPLAY.md
- SHARE_MODAL.md
- WIDGET_ABSTRACTION.md (1,051 lines!)
- WIDGET_THEME_UNIFICATION.md
- POPOVER_SIDEBAR_ALIGNMENT.md
- ZINDEX_STRATEGY.md

**QuillMark** (6 documents):

- SERVICE.md
- INTEGRATION.md
- PREVIEW.md
- DIAGNOSTICS.md
- PARSE.md
- QUILLMARK_SYNTAX_HIGHLIGHTING.md

**Patterns** (2 documents):

- AUTHENTICATION.md
- ERROR_HANDLING.md

### The Problem

**Document Types Mixed Together**:

1. **Architecture patterns** (how we structure code)
2. **Component specifications** (individual UI components)
3. **Integration guides** (how systems connect)
4. **Implementation details** (too specific for design)

**Redundancy Across Documents**:

- SERVICES.md + individual service docs (LOGIN_SERVICE, DOCUMENT_SERVICE, etc.) repeat the service pattern
- WIDGET_ABSTRACTION.md + individual widget usage (SIDEBAR, NEW_DOCUMENT, etc.)
- ERROR_HANDLING.md + ERROR_DISPLAY.md + DIAGNOSTICS.md
- AUTHENTICATION.md pulls from LOGIN_SERVICE + SUPABASE_AUTH_ADAPTER

### Unifying Insight

**"Design docs should describe patterns, not implementations"**

Current docs mix:

- **Pattern** (the "how" - should be in designs/)
- **Specification** (the "what" - should be in code or minimal docs)
- **Implementation** (the "exactly" - should only be in code)

### Proposed Structure

**Patterns** (8-10 documents):

```
prose/designs/
├── ARCHITECTURE.md          # Overall app structure
├── SERVICE_FRAMEWORK.md     # How all services work (Cascade 1)
├── OVERLAY_SYSTEM.md        # How all overlays work (Cascade 2)
├── ERROR_SYSTEM.md          # How all errors work (Cascade 3)
├── STATE_PATTERNS.md        # How all stores work (Cascade 4)
├── AUTHENTICATION_FLOW.md   # OAuth/JWT pattern
├── DESIGN_TOKENS.md         # Color/typography system
└── ACCESSIBILITY.md         # A11y standards
```

**Component Specs** (move to code):

- README files in component directories
- JSDoc comments on components
- Storybook/vitest examples

**Integration Guides** (prose/guides/):

- Setting up local development
- Deploying to production
- Adding new features

### What Becomes Unnecessary

- ❌ 8+ service-specific docs → 1 SERVICE_FRAMEWORK.md
- ❌ 5+ widget-specific docs → 1 OVERLAY_SYSTEM.md
- ❌ 3+ error docs → 1 ERROR_SYSTEM.md
- ❌ Individual component docs (move to code)
- ❌ Redundant pattern explanations
- ❌ Implementation details that belong in code

**Estimated Impact**:

- **Consolidates**: 36 documents → 15-20 documents
- **Clarifies**: Design (patterns) vs Spec (details)
- **Reduces**: Maintenance burden (fewer docs to update)
- **Improves**: Discoverability (patterns easy to find)

---

## Priority Ranking

Based on **impact** (10x wins, not 10% improvements):

### 1. Cascade 2: Widget Overlay System (Highest Impact)

**Impact**: 10x reduction in widget complexity

- Eliminates 800+ lines of repeated code
- Reduces 13 implementations to 1
- Collapses 4 design docs to 1
- Eliminates z-index conflicts entirely
- **ROI**: Highest - touches most UI code

### 2. Cascade 1: Client Service Layer Duplication (Medium-High Impact)

**Impact**: 3x reduction in client service boilerplate

- Eliminates 150-200 lines of client service boilerplate
- Standardizes client service patterns (templates, quillmark, etc.)
- Makes new client services trivial to implement
- Preserves clean server-side factory pattern (no forced abstraction)
- **ROI**: Medium-High - improves velocity for browser-side features

### 3. Cascade 3: Error Handling Duplication (High Impact)

**Impact**: 5x improvement in error handling

- Eliminates 400+ lines of error code
- Automatic retry/recovery logic
- Consistent error UX across app
- **ROI**: High - reduces bugs and improves UX

### 4. Cascade 4: State Store Fragmentation (Medium Impact)

**Impact**: 3x reduction in store code

- Eliminates 200+ lines of boilerplate
- Standardizes store patterns
- Makes new stores trivial
- **ROI**: Medium - incremental improvement

### 5. Cascade 5: Design Document Proliferation (Low Code Impact)

**Impact**: 2x reduction in documentation

- Consolidates 36 docs → 15-20 docs
- Clarifies design vs implementation
- Easier maintenance
- **ROI**: Low code impact, high clarity impact

---

## Implementation Strategy

### Phase 1: Widget Overlay System (Cascade 2)

**Duration**: 2-3 days  
**Risk**: Medium (touches many components)

Steps:

1. Create unified `Overlay` component
2. Migrate one widget type (dialog)
3. Migrate remaining widget types
4. Remove old base components
5. Update all feature components
6. Consolidate design docs

**Validation**: All existing UI tests pass without modification

### Phase 2: Client Service Layer (Cascade 1)

**Duration**: 1 day
**Risk**: Low (internal refactor, client-side only)

Steps:

1. Create `ClientService` abstract base class
2. Create optional `DualModeProvider` helper (if needed)
3. Migrate template service to extend ClientService
4. Migrate quillmark service to extend ClientService
5. Migrate any other client services
6. Update design docs
7. **Leave server services unchanged** (factory pattern already appropriate)

**Validation**: All client service tests pass, initialization behavior unchanged

### Phase 3: Error System (Cascade 3)

**Duration**: 2-3 days  
**Risk**: Medium (touches all layers)

Steps:

1. Create `AppError` class with typed codes
2. Create automatic error handler
3. Migrate service errors
4. Migrate API errors
5. Migrate UI error display
6. Update design docs

**Validation**: Error UX unchanged, automatic recovery works

### Phase 4: State Patterns (Cascade 4)

**Duration**: 1 day  
**Risk**: Low (incremental)

Steps:

1. Create store helper functions
2. Migrate documents store
3. Migrate remaining stores
4. Update design docs

**Validation**: All store tests pass, reactivity unchanged

### Phase 5: Documentation Consolidation (Cascade 5)

**Duration**: 1 day  
**Risk**: None (documentation only)

Steps:

1. Create consolidated pattern docs
2. Move component specs to code
3. Archive old docs
4. Update INDEX.md

---

## Success Metrics

### Quantitative Improvements

**Code Reduction**:

- Widget code: -800 lines (60% reduction)
- Client service code: -150-200 lines (boilerplate elimination)
- Error handling: -400 lines (50% reduction)
- Store code: -200 lines (30% reduction)
- **Total**: ~1,550-1,600 lines removed

**Documentation Reduction**:

- Design docs: 36 → 15-20 (45% reduction)
- Total lines: ~15,000 → ~8,000 (45% reduction)

**Complexity Reduction**:

- Widget implementations: 13 → 1 (92% reduction)
- Client service patterns: 3-4 → base + thin services (60% reduction in boilerplate)
- Error classes: 8+ → 1 unified (87% reduction)
- Store patterns: 5 unique → 2 generic (60% reduction)

### Qualitative Improvements

- **Consistency**: All widgets behave identically
- **Maintainability**: Fix once, benefit everywhere
- **Velocity**: New features 3-5x faster
- **Onboarding**: New developers understand patterns quickly
- **Bug Reduction**: Fewer places for bugs to hide

---

## Risks and Mitigation

### Risk 1: Breaking Changes During Migration

**Mitigation**:

- Migrate one component at a time
- Keep old and new systems running in parallel
- Comprehensive test coverage before migration

### Risk 2: Abstraction Too Generic

**Mitigation**:

- Start with concrete use cases
- Extract abstraction from real code
- Validate with all existing use cases

### Risk 3: Developer Resistance

**Mitigation**:

- Show clear before/after examples
- Demonstrate velocity improvements
- Involve team in abstraction design

### Risk 4: Regression Bugs

**Mitigation**:

- Maintain existing test suite
- Visual regression testing for widgets
- Gradual rollout with feature flags

---

## Conclusion

The tonguetoquill-web codebase demonstrates **excellent architectural discipline** but has accumulated complexity in five key areas where **simplification cascades** can deliver significant improvements:

1. **Widget system**: 13 implementations → 1 unified overlay
2. **Client service layer**: 3-4 client services → ClientService base + thin services (server services keep factory pattern)
3. **Error handling**: 8+ classes → 1 unified system with automatic recovery
4. **State stores**: 5 unique → 2 generic patterns
5. **Documentation**: 36 docs → 15-20 consolidated patterns

**Total Impact**:

- Remove ~1,550-1,600 lines of code (23% reduction)
- Consolidate 36 docs to 15-20 (45% reduction)
- Reduce complexity by 60-90% in affected areas
- Increase feature velocity by 3-5x
- Avoid over-abstraction (preserve appropriate patterns like server-side factories)

**Recommended Action**: Implement in priority order (Cascades 2, 1, 3, 4, 5) over 2-3 weeks.

The key insight across all cascades: **"Separate what varies from what stays the same"**. The codebase already follows good patterns but hasn't yet extracted the common abstractions that make those patterns trivial to apply.
