# Cascade 3: Error Handling Duplication Implementation Plan

**Date**: 2025-11-09
**Status**: 🔄 Ready for Implementation
**Related Design**: [ERROR_SYSTEM.md](../designs/patterns/ERROR_SYSTEM.md)
**Parent Analysis**: [SIMPLIFICATION_CASCADES_ANALYSIS.md](./SIMPLIFICATION_CASCADES_ANALYSIS.md)

## Objective

Eliminate ~125-150 lines of duplicated error handling code by creating a unified error system with base class, generic handler, and composable utilities. This will standardize error structure across all services while preserving type safety and developer control.

## Scope

### In Scope

- ✅ AppError abstract base class
- ✅ Migrate service errors to extend AppError (DocumentError, AuthError, TemplateError, QuillmarkError)
- ✅ Generic handleServiceError() replacing specialized handlers
- ✅ getErrorMessage() utility (replaces 10+ inline checks)
- ✅ Optional withRetry() utility
- ✅ Optional displayError() utility

### Out of Scope

- ❌ Automatic error handling (preserves explicit control)
- ❌ Global error boundary
- ❌ Error telemetry framework (separate concern)
- ❌ Changing error recovery logic (context-dependent)

## Current State Analysis

### Duplicated Code

**Error Handler Functions** (`src/lib/server/utils/api.ts`):

```typescript
// handleAuthError - 8 lines
function handleAuthError(error: unknown) {
	console.error('Auth error:', error);
	if (error instanceof AuthError) {
		return errorResponse(error.code, error.message, error.statusCode);
	}
	return errorResponse('unknown_error', 'An unexpected error occurred', 500);
}

// handleDocumentError - 8 lines (nearly identical)
function handleDocumentError(error: unknown) {
	console.error('Document error:', error);
	if (error instanceof DocumentError) {
		return errorResponse(error.code, error.message, error.statusCode);
	}
	return errorResponse('unknown_error', 'An unexpected error occurred', 500);
}
```

**Duplication**: ~16 lines total, only difference is error type

**Error Message Extraction** (found in 10+ locations):

- `src/lib/stores/documents.svelte.ts`: 5 instances
- `src/lib/utils/auto-save.svelte.ts`: 1 instance
- `src/lib/services/quillmark/service.ts`: 2 instances
- `src/lib/services/templates/service.ts`: 1 instance
- `src/lib/services/base/client-service.ts`: 1 instance
- `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte`: 1 instance
- `src/lib/components/Sidebar/LoginPopover.svelte`: 2 instances

**Pattern**: `err instanceof Error ? err.message : 'fallback'`

**Duplication**: ~10-13 instances, ~1-2 lines each = ~15-25 lines

**Error Class Structure** (repeated across 4 classes):

Each error class independently implements:

- code property
- message property (inherited from Error)
- statusCode property (DocumentError, AuthError)
- Constructor boilerplate

**Duplication**: ~10 lines per class × 4 classes = ~40 lines of similar structure

### Current Error Classes

**DocumentError** (`src/lib/services/documents/types.ts`):

- Lines: ~12
- Properties: code, statusCode
- Error codes: 6 typed variants

**AuthError** (`src/lib/services/auth/types.ts`):

- Lines: ~12
- Properties: code, statusCode
- Error codes: 7 typed variants

**TemplateError** (`src/lib/services/templates/types.ts`):

- Lines: ~10
- Properties: code only
- Error codes: 4 typed variants

**QuillmarkError** (`src/lib/services/quillmark/types.ts`):

- Lines: ~14
- Properties: code, diagnostic
- Error codes: 4 typed variants
- Special: Optional diagnostic field

## Desired State

### New Base Error Class

**Location**: `src/lib/errors/app-error.ts`

**Structure**:

```typescript
abstract class AppError extends Error {
	abstract code: string; // Must be overridden by subclasses
	statusCode: number;
	hint?: string;
	context?: Record<string, unknown>;

	constructor(code: string, message: string, statusCode: number = 500, options?: ErrorOptions);
}
```

**Benefits**:

- Shared structure for all service errors
- Type-safe with abstract code property
- Enables generic error handling
- Single source of truth for error metadata

### Generic Error Handler

**Location**: `src/lib/server/utils/api.ts`

**Replaces**: handleAuthError, handleDocumentError

**Implementation**:

```typescript
function handleServiceError(error: unknown) {
	console.error('Service error:', error);
	if (error instanceof AppError) {
		return errorResponse(error.code, error.message, error.statusCode);
	}
	return errorResponse('unknown_error', 'An unexpected error occurred', 500);
}
```

**Benefits**:

- Eliminates duplicate handler functions
- Automatically handles all AppError subclasses
- Consistent error response format
- Easy to extend for new error types

### Error Utilities

**Location**: `src/lib/errors/utils.ts`

**getErrorMessage Utility**:

```typescript
function getErrorMessage(error: unknown, fallback?: string): string;
```

Replaces 10+ inline `err instanceof Error ? err.message : 'fallback'` checks

**withRetry Utility** (optional):

```typescript
function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
```

Composable retry wrapper for operations that may fail transiently

**displayError Utility** (optional):

```typescript
function displayError(error: unknown, toastStore: ToastStore, options?: DisplayOptions): void;
```

Consistent error display with toast notifications

### Migrated Service Errors

**All errors extend AppError**:

- DocumentError extends AppError
- AuthError extends AppError
- TemplateError extends AppError
- QuillmarkError extends AppError (keeps diagnostic field)

**Benefits**:

- Shared base structure
- Type-safe error codes
- instanceof checks work with base class
- Preserves service-specific fields

## Implementation Steps

### Phase 1: Create Base Error Class

**File**: `src/lib/errors/app-error.ts`

**Tasks**:

1. Create abstract AppError class extending Error
2. Add abstract code property (must be overridden)
3. Add statusCode property (default 500)
4. Add optional hint property
5. Add optional context property
6. Implement constructor with proper Error initialization
7. Add TypeScript typing for ErrorOptions

**File**: `src/lib/errors/index.ts`

**Tasks**:

1. Export AppError base class
2. Export all utilities (to be created in Phase 4)

**Acceptance Criteria**:

- TypeScript compiles without errors
- Abstract code property enforced by compiler
- Properties accessible on instances
- Error stack traces work correctly

### Phase 2: Migrate Service Error Classes

**File**: `src/lib/services/documents/types.ts`

**Tasks**:

1. Import AppError from @/lib/errors
2. Change DocumentError to extend AppError
3. Update constructor to call super(code, message, statusCode)
4. Ensure code property uses DocumentErrorCode type
5. Remove duplicate property declarations (message from Error, others from AppError)
6. Verify error codes remain typed

**File**: `src/lib/services/auth/types.ts`

**Tasks**:

1. Import AppError from @/lib/errors
2. Change AuthError to extend AppError
3. Update constructor to call super(code, message, statusCode)
4. Ensure code property uses AuthErrorCode type
5. Remove duplicate property declarations
6. Verify error codes remain typed

**File**: `src/lib/services/templates/types.ts`

**Tasks**:

1. Import AppError from @/lib/errors
2. Change TemplateError to extend AppError
3. Update constructor to call super(code, message, 400) (add statusCode)
4. Ensure code property uses TemplateErrorCode type
5. Remove duplicate property declarations
6. Verify error codes remain typed

**File**: `src/lib/services/quillmark/types.ts`

**Tasks**:

1. Import AppError from @/lib/errors
2. Change QuillmarkError to extend AppError
3. Update constructor to call super(code, message, 400), keep diagnostic parameter
4. Ensure code property uses QuillmarkErrorCode type
5. Keep diagnostic property (QuillmarkError-specific)
6. Remove duplicate property declarations
7. Verify error codes remain typed

**Acceptance Criteria**:

- All service errors extend AppError
- instanceof AppError works for all service errors
- Typed error codes preserved
- QuillmarkError.diagnostic field preserved
- No breaking changes to error construction
- TypeScript compiles without errors

### Phase 3: Create Generic Error Handler

**File**: `src/lib/server/utils/api.ts`

**Tasks**:

1. Import AppError from @/lib/errors
2. Create handleServiceError(error: unknown) function
3. Implement instanceof AppError check
4. Return errorResponse with error.code, error.message, error.statusCode
5. Add fallback for non-AppError errors
6. Mark handleAuthError as deprecated (add comment)
7. Mark handleDocumentError as deprecated (add comment)
8. Keep deprecated functions temporarily for backward compatibility

**Acceptance Criteria**:

- handleServiceError handles all AppError subclasses
- Deprecated handlers still work (backward compatible)
- Error response format unchanged
- TypeScript types correct
- Logging preserved

### Phase 4: Create Error Utilities

**File**: `src/lib/errors/utils.ts`

**Tasks**:

1. Implement getErrorMessage(error: unknown, fallback?: string): string
   - Check if error instanceof AppError → return error.message
   - Check if error instanceof Error → return error.message
   - Check if error is string → return error
   - Otherwise → return fallback or 'An unexpected error occurred'
2. Implement withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>
   - Define RetryOptions interface (maxAttempts, delay, backoff, shouldRetry)
   - Implement retry loop with configurable strategy
   - Preserve error context through retries
   - Add JSDoc comments with usage examples
3. Implement displayError(error: unknown, toastStore: ToastStore, options?: DisplayOptions): void
   - Define DisplayOptions interface (duration, action, inline)
   - Use getErrorMessage to extract message
   - Call toastStore with formatted error
   - Support action buttons (retry, etc.)
   - Add JSDoc comments with usage examples

**File**: `src/lib/errors/index.ts`

**Tasks**:

1. Export getErrorMessage utility
2. Export withRetry utility
3. Export displayError utility
4. Export RetryOptions interface
5. Export DisplayOptions interface

**Acceptance Criteria**:

- All utilities work with any error type
- getErrorMessage handles all cases correctly
- withRetry implements configurable retry strategy
- displayError integrates with existing toast system
- TypeScript types correct
- JSDoc documentation complete

### Phase 5: Update Error Handling Sites

**File**: `src/lib/stores/documents.svelte.ts`

**Tasks**:

1. Import getErrorMessage from @/lib/errors
2. Replace 5 instances of `err instanceof Error ? err.message : 'fallback'`
3. Use getErrorMessage(err, 'fallback') instead
4. Verify error display behavior unchanged

**File**: `src/lib/utils/auto-save.svelte.ts`

**Tasks**:

1. Import getErrorMessage from @/lib/errors
2. Replace error message extraction with getErrorMessage()
3. Verify auto-save error handling unchanged

**File**: `src/lib/services/quillmark/service.ts`

**Tasks**:

1. Import getErrorMessage from @/lib/errors
2. Replace 2 instances of inline message extraction
3. Use getErrorMessage() utility
4. Verify QuillmarkError handling unchanged

**File**: `src/lib/services/templates/service.ts`

**Tasks**:

1. Import getErrorMessage from @/lib/errors
2. Replace inline message extraction with utility
3. Verify TemplateError handling unchanged

**File**: `src/lib/services/base/client-service.ts`

**Tasks**:

1. Import getErrorMessage from @/lib/errors
2. Replace inline message extraction with utility
3. Verify ClientServiceError handling unchanged

**File**: `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte`

**Tasks**:

1. Import getErrorMessage from @/lib/errors
2. Replace inline message extraction with utility
3. Verify error display unchanged

**File**: `src/lib/components/Sidebar/LoginPopover.svelte`

**Tasks**:

1. Import getErrorMessage from @/lib/errors
2. Replace 2 instances of message access with getErrorMessage()
3. Verify login error display unchanged

**Acceptance Criteria**:

- All inline message extractions replaced with utility
- Error display behavior unchanged
- No breaking changes to user-facing behavior
- TypeScript compiles without errors

### Phase 6: Update API Routes to Use Generic Handler

**Find all API routes using error handlers**:

```bash
grep -r "handleAuthError\|handleDocumentError" src/routes/api
```

**For each route**:

1. Import handleServiceError from utils/api
2. Replace handleAuthError with handleServiceError
3. Replace handleDocumentError with handleServiceError
4. Verify error response format unchanged
5. Test API route behavior

**Acceptance Criteria**:

- All API routes use handleServiceError
- Error responses unchanged
- Status codes correct
- Error messages consistent

### Phase 7: Remove Deprecated Handlers

**File**: `src/lib/server/utils/api.ts`

**Tasks**:

1. Remove handleAuthError function
2. Remove handleDocumentError function
3. Keep only handleServiceError
4. Update exports

**Acceptance Criteria**:

- Deprecated handlers removed
- No breaking changes (all routes already migrated)
- TypeScript compiles without errors
- All API routes still work

### Phase 8: Update Documentation

**Update**:

- prose/designs/patterns/ERROR_SYSTEM.md (already updated)
- Add JSDoc comments to all error classes
- Add usage examples in code comments
- Update any inline documentation in error files

**Create**:

- src/lib/errors/README.md - Document error system usage

**Acceptance Criteria**:

- Design doc reflects new architecture
- README provides clear usage examples
- JSDoc comments on all public APIs
- Cross-references maintained

## Validation Strategy

### Behavioral Equivalence

**Error Handling**:

1. Throw DocumentError → Same API response
2. Throw AuthError → Same API response
3. Extract error message → Same result
4. Display error in UI → Same behavior

**Type Safety**:

1. Error codes remain typed per service
2. instanceof checks work correctly
3. AppError instanceof checks work for all subclasses
4. TypeScript compilation succeeds

### Testing Approach

**Unit Tests**:

- Test AppError base class construction
- Test each service error extends AppError correctly
- Test handleServiceError with all error types
- Test getErrorMessage with all input types
- Test withRetry utility (if implemented)
- Test displayError utility (if implemented)

**Integration Tests**:

- Test API error responses unchanged
- Test frontend error display unchanged
- Test error message extraction in components

**Manual Testing**:

- Trigger document errors → Verify response
- Trigger auth errors → Verify response
- Trigger QuillMark errors → Verify diagnostic display
- Trigger network errors → Verify retry behavior

### Code Review Checklist

- [ ] No breaking changes to error structure
- [ ] All service errors extend AppError
- [ ] handleServiceError handles all error types
- [ ] getErrorMessage handles all input types
- [ ] Typed error codes preserved
- [ ] QuillmarkError.diagnostic preserved
- [ ] API responses unchanged
- [ ] Frontend error display unchanged
- [ ] TypeScript types correct
- [ ] Documentation updated

## Rollback Plan

If issues discovered post-migration:

1. **Immediate**: Revert commits (git revert)
2. **Validate**: Verify old code works
3. **Analyze**: Identify root cause
4. **Fix**: Address issue in base class or utilities
5. **Retry**: Re-apply migration with fix

**Risk**: Low (mostly internal refactor, well-typed)

## Success Metrics

### Quantitative

**Code Reduction**:

- Error handlers: 2 functions (~16 lines) → 1 function (~10 lines) = ~6 lines eliminated
- Message extraction: ~10-13 instances (~15-25 lines) → 1 utility + imports (~20 lines) = ~0-5 lines net reduction (but eliminates duplication pattern)
- Base structure: ~40 lines duplicate → ~20 lines shared = ~20 lines eliminated
- **Total**: ~30-50 lines eliminated (though primary benefit is pattern elimination, not raw line count)

**Pattern Elimination**:

- Error handler duplication: 2 → 1 (50% reduction)
- Message extraction pattern: 10-13 instances → 0 instances (100% elimination of pattern)
- Base error structure: 4 independent → 1 base + 4 extensions (standardized)

### Qualitative

**Developer Experience**:

- Consistent error structure across all services
- Single error handler for all service errors
- Simple utility replaces repeated inline checks
- Clear patterns for error handling

**Maintainability**:

- Error handling bugs fixed once in base or handler
- Error structure changes propagate automatically
- Testing pattern shared across error types

**Type Safety**:

- Base class enforces structure
- Service error codes remain typed
- instanceof checks work with inheritance
- Compile-time validation

**Future Velocity**:

- New service errors: Extend AppError (~5 lines instead of ~12)
- Error handling: Use handleServiceError (already works)
- Message extraction: Use getErrorMessage (already implemented)

## Risk Assessment

### Low Risk

- **Scope**: Mostly internal refactor, preserves external behavior
- **Type Safety**: TypeScript enforces correct usage
- **Backward Compatibility**: Deprecated handlers kept temporarily
- **Reversibility**: Easy to revert if issues found

### Potential Issues

**Issue**: Breaking change to error structure
**Mitigation**: Preserve all existing error properties, only add base class

**Issue**: instanceof checks fail after migration
**Mitigation**: Test extensively, verify AppError extends Error correctly

**Issue**: Error response format changes
**Mitigation**: Compare before/after API responses, maintain exact format

**Issue**: TypeScript type errors
**Mitigation**: Abstract code property ensures subclasses define typed codes

## Dependencies

### Prerequisites

- None (internal refactor)

### Blocks

- None (can proceed immediately)

## Timeline Estimate

**Total**: 6-8 hours

- Phase 1 (Base class): 1 hour
- Phase 2 (Migrate errors): 1.5 hours
- Phase 3 (Generic handler): 0.5 hour
- Phase 4 (Utilities): 1.5 hours
- Phase 5 (Update sites): 1.5 hours
- Phase 6 (Migrate routes): 1 hour
- Phase 7 (Remove deprecated): 0.5 hour
- Phase 8 (Documentation): 0.5-1 hour

## Next Steps

1. ✅ Design approved (ERROR_SYSTEM.md updated)
2. ⏳ Implement AppError base class
3. ⏳ Migrate service error classes
4. ⏳ Create generic error handler
5. ⏳ Create error utilities
6. ⏳ Update error handling sites
7. ⏳ Migrate API routes
8. ⏳ Remove deprecated handlers
9. ⏳ Update documentation
10. ⏳ Validate all tests pass
11. ⏳ Move this plan to prose/plans/completed/

---

_Implementation Status: 🔄 Ready for Implementation_
