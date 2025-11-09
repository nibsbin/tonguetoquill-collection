# Error Handling

**Purpose**: Unified error handling pattern across all application layers with shared base class, utilities, and consistent structure.

**TL;DR**: All service errors extend `AppError` base class. Shared utilities eliminate duplication. Single generic error handler replaces multiple specialized handlers. Structured errors with codes, messages, hints flow from WASM → Service → Frontend → UI.

> **Related**: [DIAGNOSTICS.md](../quillmark/DIAGNOSTICS.md) for QuillMark-specific diagnostic structure

---

## When to Use

- Understanding error propagation across layers
- Adding new error types
- Implementing error handling in services
- Debugging error handling
- Ensuring consistent error UX

---

## Design Principles

### 1. Shared Structure, Explicit Control

**All errors share common structure**, but **control remains explicit**:

- ✅ Base error class provides: code, message, statusCode, hint, context
- ✅ Service-specific error classes add typed error codes
- ✅ Shared utilities for common operations (message extraction, display, retry)
- ✅ Developer chooses when to use utilities (not automatic)
- ✅ Developer controls error recovery strategy (context-dependent)

### 2. Type Safety

- Service-specific error codes as string literal unions
- instanceof checks for error type discrimination
- Compile-time validation of error codes
- Type-safe error handlers

### 3. Eliminate Duplication, Preserve Flexibility

**What gets unified**:

- Error class structure (code, message, statusCode, hint, context)
- Server error handler (one generic replaces multiple specialized)
- Message extraction utility (replaces inline checks)
- Optional utilities for display and retry

**What stays explicit**:

- Service-specific error codes
- Error handling decisions (when to retry, display, recover)
- Business logic for error recovery
- Context-specific error messages

---

## Error Class Hierarchy

### Base Error Class

**Purpose**: Shared structure for all application errors

**Properties**:

- `code: string` - Unique error identifier (typed in subclasses)
- `message: string` - Human-readable error description
- `statusCode: number` - HTTP status code for API responses
- `hint?: string` - Optional guidance for fixing the error
- `context?: Record<string, unknown>` - Optional contextual data for debugging

**Benefits**:

- Eliminates repeated base structure in service errors
- Standardizes error shape across all services
- Single source of truth for error metadata
- Enables generic error handling utilities

### Service Error Classes

**DocumentError**: Extends AppError with DocumentErrorCode union

**AuthError**: Extends AppError with AuthErrorCode union

**TemplateError**: Extends AppError with TemplateErrorCode union

**QuillmarkError**: Extends AppError with QuillmarkErrorCode union, adds diagnostic field

**Benefits**:

- Type-safe error codes per service domain
- Preserves domain-specific error information
- instanceof checks for error discrimination
- Typed error handling in catch blocks

---

## Error Handler Pattern

### Generic Service Error Handler

**Replaces**: Multiple duplicate handlers (handleAuthError, handleDocumentError, etc.)

**Purpose**: Single function handles all AppError instances

**Benefits**:

- Eliminates duplicate error handler implementations
- Consistent error response format
- One place to fix error handling bugs
- Easy to extend for new service error types

**Behavior**:

- Checks if error instanceof AppError
- Returns JSON response with error.code, error.message, error.statusCode
- Logs error for debugging
- Falls back to generic unknown_error for unexpected errors

---

## Error Utilities

### Message Extraction Utility

**Purpose**: Safe error-to-string conversion

**Replaces**: 10+ inline `err instanceof Error ? err.message : 'fallback'` checks

**Benefits**:

- Eliminates repeated message extraction pattern
- Consistent fallback behavior
- Handles all error types (Error, AppError, string, unknown)
- Type-safe implementation

### Retry Utility (Optional)

**Purpose**: Composable retry wrapper for operations that may fail transiently

**Usage**: Explicit - developer chooses when to use

**Benefits**:

- Eliminates custom retry implementations when needed
- Configurable retry count, delay, backoff strategy
- Not automatic - only used where appropriate
- Preserves error context through retries

### Display Utility (Optional)

**Purpose**: Show error in toast or inline display

**Usage**: Explicit - developer chooses when to display

**Benefits**:

- Consistent error display UX
- Extracts appropriate message from any error type
- Works with toast store or inline error components
- Not automatic - preserves developer control

---

## Error Architecture Layers

### 1. QuillMark Layer (WASM)

**Location**: [DIAGNOSTICS.md](../quillmark/DIAGNOSTICS.md)

**Error Type**: QuillmarkError extends AppError

**Special Field**: `diagnostic?: QuillmarkDiagnostic` with structured error information

**Diagnostic Structure**:

- severity: 'error' | 'warning' | 'info'
- code?: string (e.g., 'QM001')
- message: string
- hint?: string
- location?: { line, column, length }
- sourceChain: string[] (error trace)

**Examples**:

- Parse errors: Invalid YAML, missing SCOPE
- Render errors: Unknown Quill template, compilation failure
- Validation errors: Invalid metadata structure

**Integration**: QuillmarkError wraps WASM diagnostics in AppError structure

### 2. Service Layer (Backend/Frontend)

**Error Classes**: All service errors extend AppError base class

**Document Service**:

- DocumentError extends AppError
- Typed error codes: 'not_found' | 'unauthorized' | 'invalid_name' | 'content_too_large' | 'validation_error' | 'unknown_error'
- Includes statusCode for HTTP responses

**Auth Service**:

- AuthError extends AppError
- Typed error codes: 'invalid_token' | 'token_expired' | 'unauthorized' | 'session_expired' | 'invalid_refresh_token' | 'network_error' | 'unknown_error'
- Includes statusCode for HTTP responses

**Template Service**:

- TemplateError extends AppError
- Typed error codes: 'not_initialized' | 'not_found' | 'load_error' | 'invalid_manifest'

**Quillmark Service**:

- QuillmarkError extends AppError
- Typed error codes: 'not_initialized' | 'quill_not_found' | 'render_error' | 'load_error'
- Special diagnostic field for WASM errors

**Server Error Handler**:

- Single `handleServiceError()` function replaces all specialized handlers
- Checks instanceof AppError
- Returns consistent JSON error response
- Falls back to unknown_error for unexpected errors

**Benefits**:

- Eliminates duplicate error handler functions
- Consistent error structure across all services
- Type-safe error handling with instanceof checks
- Easy to add new service error types

### 3. Frontend Integration

**Location**: [API_INTEGRATION.md](../frontend/API_INTEGRATION.md)

**Error Message Extraction**:

- Use `getErrorMessage(error, fallback)` utility instead of inline checks
- Replaces 10+ instances of `err instanceof Error ? err.message : 'fallback'`
- Handles all error types consistently

**Error Categories**:

**Network Errors**:

- Timeout → Use withRetry() utility if appropriate
- Connection failed → Show "offline" indicator
- 5xx → Use withRetry() utility (up to 3 times)

**Client Errors**:

- 400 → Display validation message with getErrorMessage()
- 401 → Trigger token refresh, then retry
- 403 → Show "permission denied" with getErrorMessage()
- 404 → Show "not found" with getErrorMessage()

**Validation Errors**:

- Extract field-specific errors from AppError.context if present
- Display inline next to form fields
- Highlight invalid inputs
- Use getErrorMessage() for generic messages

**Retry Pattern** (when appropriate):

- Use `withRetry()` utility for transient failures
- Developer chooses retry conditions (not automatic)
- Configurable retry count and backoff
- Preserves error context

### 4. UI Layer (Visual Display)

**Location**: [ERROR_DISPLAY.md](../frontend/ERROR_DISPLAY.md)

**Display Utility**:

- Use `displayError(error, toastStore)` for consistent error display
- Extracts appropriate message with getErrorMessage()
- Works with toast notifications or inline displays
- Developer chooses when to display (explicit control)

**Display Patterns**:

**Toast Notifications** (Transient errors):

- API errors (save failed, load failed)
- Network errors (connection lost)
- Auth errors (login failed)
- Duration: 5 seconds, dismissible
- Actions: Retry button, close button
- Use displayError() or manually call toastStore

**Inline Display** (QuillMark errors):

- Shown in preview pane
- Diagnostic information from QuillmarkError.diagnostic
- Source location (line/column)
- Syntax highlighting of error location
- Persistent until document fixed
- Render QuillmarkDiagnostic structure directly

**Form Validation** (Input errors):

- Red border on invalid field
- Error text below field
- Use getErrorMessage() to extract message from AppError
- Check AppError.context for field-specific details
- Real-time validation feedback
- Clear on correction

---

## Error Handling Patterns

### Unified Structure

All AppError instances include:

- **code**: Unique error identifier (typed per service)
- **message**: Human-readable description
- **statusCode**: HTTP status for API responses
- **hint?**: Optional guidance for fixing (optional)
- **context?**: Additional debugging data (optional)

### Benefits of Unified Structure

- ✅ Eliminates repeated base structure across 4+ error classes
- ✅ Enables single generic error handler
- ✅ Consistent error shape for utilities
- ✅ Type-safe with instanceof checks
- ✅ Preserves service-specific error codes

### Error Handler Pattern

**Before (duplicated)**:

```typescript
// Nearly identical functions:
function handleAuthError(error) {
	if (error instanceof AuthError) {
		return errorResponse(error.code, error.message, error.statusCode);
	}
	return errorResponse('unknown_error', 'An unexpected error occurred', 500);
}

function handleDocumentError(error) {
	if (error instanceof DocumentError) {
		return errorResponse(error.code, error.message, error.statusCode);
	}
	return errorResponse('unknown_error', 'An unexpected error occurred', 500);
}
```

**After (unified)**:

```typescript
// Single generic handler
function handleServiceError(error: unknown) {
	if (error instanceof AppError) {
		return errorResponse(error.code, error.message, error.statusCode);
	}
	return errorResponse('unknown_error', 'An unexpected error occurred', 500);
}
```

### Message Extraction Pattern

**Before (repeated 10+ times)**:

```typescript
err instanceof Error ? err.message : 'Failed to...';
```

**After (utility)**:

```typescript
getErrorMessage(err, 'Failed to...');
```


---

## Complete Error Flows

### QuillMark Render Error

```
User types invalid YAML   : Document with syntax error
Editor → QuillmarkService : render(documentContent)
Service → WASM            : quillmark_render()
WASM → Service            : Diagnostic { code: 'QM001', message: 'Invalid YAML' }
Service → Frontend        : throw new QuillmarkError('render_error', message, diagnostic)
Frontend → Preview        : catch QuillmarkError, update preview state
Preview → ErrorDisplay    : Render QuillmarkDiagnostic component
ErrorDisplay → User       : Show diagnostic with hint, location, source chain
```

### API Save Error

```
User edits document       : Auto-save triggers
Frontend → API            : PUT /api/documents/123
API → Database            : UPDATE documents SET...
Database → API            : Error: Constraint violation
API → handleServiceError  : DocumentError instance
handleServiceError → API  : JSON { error: 'invalid_title', message: '...', statusCode: 400 }
API → Frontend            : 400 Bad Request
Frontend → getErrorMessage: Extract message from error
Frontend → displayError   : Show toast with message and retry button
Toast → User              : "Failed to save: Invalid title" + Retry button
User → Retry Button       : Click retry
Frontend → API            : PUT /api/documents/123 (retry with withRetry if appropriate)
```

### Auth Token Expired

```
Frontend → API            : GET /api/documents
API → Auth                : Validate JWT
Auth → API                : Token expired (throw AuthError('token_expired', ...))
API → handleServiceError  : AuthError instance
handleServiceError → API  : JSON { error: 'token_expired', message: '...', statusCode: 401 }
API → Frontend            : 401 Unauthorized
Frontend → Auth           : POST /api/auth/refresh
Auth → Frontend           : New JWT
Frontend → API            : Retry GET /api/documents (with new token)
```

### Network Timeout

```
Frontend → API            : GET /api/documents (slow network)
[30 seconds pass]
Fetch → Frontend          : TimeoutError
Frontend → withRetry      : Retry attempt 1/3 (if using retry utility)
Frontend → API            : GET /api/documents (retry)
[Success or more retries]
Frontend → displayError   : Show toast "Connection issue, retrying..." or "Success"
```

---

## Composable Utilities Pattern

### Message Extraction

**Purpose**: Safe error-to-string conversion

**Signature**: `getErrorMessage(error: unknown, fallback?: string): string`

**Behavior**:

- If error instanceof AppError: return error.message
- If error instanceof Error: return error.message
- If error is string: return error
- Otherwise: return fallback or 'An unexpected error occurred'

**Benefits**:

- Eliminates 10+ inline instanceof checks
- Consistent message extraction
- Type-safe implementation
- Handles all error types

### Retry Wrapper

**Purpose**: Retry operations that may fail transiently

**Signature**: `withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>`

**Options**:

- maxAttempts: number (default: 3)
- delay: number (default: 1000ms)
- backoff: 'none' | 'linear' | 'exponential' (default: 'exponential')
- shouldRetry?: (error: unknown) => boolean

**Usage**: Explicit - developer chooses when to retry

**Example**:

```typescript
// Retry network request
await withRetry(() => fetch('/api/documents'), {
	maxAttempts: 3,
	shouldRetry: (err) => err instanceof NetworkError
});
```

**Benefits**:

- Eliminates custom retry implementations when needed
- Configurable retry strategy
- Not automatic - preserves developer control
- Works with any async operation

### Display Utility

**Purpose**: Show error in toast or inline display

**Signature**: `displayError(error: unknown, toastStore: ToastStore, options?: DisplayOptions): void`

**Options**:

- duration?: number (toast display time)
- action?: { label: string; onClick: () => void } (retry button, etc.)
- inline?: boolean (use inline display instead of toast)

**Usage**: Explicit - developer chooses when to display

**Example**:

```typescript
// Show error toast with retry button
displayError(err, toastStore, {
	action: { label: 'Retry', onClick: () => saveDocument() }
});
```

**Benefits**:

- Consistent error display UX
- Extracts appropriate message with getErrorMessage()
- Works with toast or inline displays
- Not automatic - preserves developer control

---

## Error Categorization

| Type       | Display             | Persistence     | Action                        | Utility                |
| ---------- | ------------------- | --------------- | ----------------------------- | ---------------------- |
| Validation | Inline (form field) | Until fixed     | User corrects input           | getErrorMessage        |
| QuillMark  | Inline (preview)    | Until fixed     | User fixes document           | QuillmarkDiagnostic UI |
| Network    | Toast               | 5 seconds       | Use withRetry if appropriate  | withRetry, displayError|
| Auth       | Toast               | 5 seconds       | Refresh token automatically   | handleServiceError     |
| API        | Toast               | 5 seconds       | displayError with retry button| displayError           |
| Fatal      | Modal               | Until dismissed | Reload page                   | displayError           |

---

## Design Decisions

### Why Base Error Class?

- **Eliminates Duplication**: Shared structure across 4+ error types
- **Enables Generic Handler**: Single function replaces multiple specialized handlers
- **Type Safety**: instanceof checks with TypeScript
- **Flexibility**: Services can extend with domain-specific fields

### Why Not Automatic Error Handling?

- **Context Matters**: Different errors need different recovery strategies
- **Developer Control**: Explicit choices about retry, display, recovery
- **Flexibility**: Not all errors should be displayed or retried
- **Predictability**: No hidden magic, clear error handling flow

### Why Composable Utilities?

- **Opt-in**: Use utilities when appropriate, not forced
- **Reusability**: Common operations like retry, display available
- **Consistency**: Utilities provide standard behavior when used
- **Simplicity**: Simple functions, not complex framework

### Why Single Generic Handler?

- **Eliminates Duplication**: One handler replaces 2+ identical functions
- **Consistency**: All errors handled the same way
- **Maintainability**: Fix once, benefit everywhere
- **Extensibility**: New error types automatically handled

---

## Migration Strategy

### Phase 1: Create Base Error Class

- Define abstract AppError base class
- Include code, message, statusCode, hint?, context?
- All service errors will extend this base

### Phase 2: Migrate Service Errors

- Update DocumentError to extend AppError
- Update AuthError to extend AppError
- Update TemplateError to extend AppError
- Update QuillmarkError to extend AppError (keep diagnostic field)
- Verify all error codes remain typed

### Phase 3: Create Generic Handler

- Implement handleServiceError(error: unknown)
- Replace handleAuthError with handleServiceError
- Replace handleDocumentError with handleServiceError
- Verify API responses unchanged

### Phase 4: Create Utilities

- Implement getErrorMessage(error, fallback)
- Implement withRetry(fn, options) (optional)
- Implement displayError(error, toastStore, options) (optional)
- Document utility usage

### Phase 5: Update Error Sites

- Replace inline message extraction with getErrorMessage
- Use displayError where appropriate (optional)
- Use withRetry where appropriate (optional)
- Maintain explicit error handling control

---

## Impact

### Code Reduction

**Error Handlers**:

- Before: 2+ duplicate functions (~40 lines total)
- After: 1 generic function (~15 lines)
- Eliminated: ~25 lines

**Message Extraction**:

- Before: 10+ inline checks (~10 lines each = ~100 lines)
- After: 1 utility + call sites (~20 lines total)
- Eliminated: ~80 lines

**Base Structure**:

- Before: Repeated structure in 4 error classes (~40 lines duplicate)
- After: Shared AppError base (~20 lines)
- Eliminated: ~20 lines

**Total**: ~125-150 lines eliminated

### Complexity Reduction

- Error handlers: 2+ specialized → 1 generic (50% reduction)
- Message extraction: 10+ inline → 1 utility (90% reduction)
- Base structure: 4 independent → 1 base + 4 extensions (standardized)

### Qualitative Improvements

- **Consistency**: All errors have same structure
- **Maintainability**: Fix once, benefit everywhere
- **Type Safety**: instanceof checks with base class
- **Flexibility**: Utilities optional, explicit control preserved
- **Simplicity**: Clear patterns, no magic

---

## Constraints and Limitations

### Current Scope

- ✅ Unified error structure (AppError base)
- ✅ Service-specific error classes
- ✅ Generic error handler
- ✅ Message extraction utility
- ✅ Optional retry and display utilities
- ✅ Type-safe error codes

### Out of Scope

- ❌ Automatic error handling (preserves developer control)
- ❌ Global error boundary (not appropriate for all errors)
- ❌ Error telemetry/logging framework (separate concern)
- ❌ Error recovery framework (context-dependent)

### Future Considerations

**Error Telemetry**:

- If we add error tracking (Sentry, etc.)
- Utilities can log errors automatically
- Current: Manual console.error calls

**Error Recovery Patterns**:

- If common recovery patterns emerge
- May add recovery strategy utilities
- Current: Context-dependent recovery

---

## Cross-References

- [DIAGNOSTICS.md](../quillmark/DIAGNOSTICS.md) - QuillMark diagnostic structure
- [SERVICE.md](../quillmark/SERVICE.md) - QuillmarkService error handling
- [API_INTEGRATION.md](../frontend/API_INTEGRATION.md) - Frontend error handling
- [ERROR_DISPLAY.md](../frontend/ERROR_DISPLAY.md) - Visual error patterns
- [DESIGN_SYSTEM.md](../frontend/DESIGN_SYSTEM.md) - Error colors and tokens
- [WIDGET_ABSTRACTION.md](../frontend/WIDGET_ABSTRACTION.md) - Toast component

---

_Document Status: Design - Describes Desired State_
