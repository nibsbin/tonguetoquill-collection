# Error System

**Unified error handling pattern across all application layers.**

## Overview

All errors in Tonguetoquill follow a consistent structure from WASM → Service → Frontend → UI. This pattern eliminates duplication while preserving flexibility for domain-specific error handling.

**Benefits**:

- Single error base class (AppError) for all services
- Type-safe error codes per domain
- Shared utilities for common operations
- Consistent UI display patterns
- Accessibility-first error presentation

## Design Principles

### Shared Structure, Explicit Control

**All errors share common base**, but **control remains explicit**:

- ✅ Base class provides: code, message, statusCode, hint, context
- ✅ Service-specific classes add typed error codes
- ✅ Shared utilities (message extraction, display, retry)
- ✅ Developer controls error recovery (context-dependent)

### Type Safety

- Service-specific error codes as string literal unions
- `instanceof` checks for error discrimination
- Compile-time validation
- Type-safe error handlers

### Eliminate Duplication, Preserve Flexibility

**Unified**:

- Error structure (AppError base class)
- Server error handler (one generic handler)
- Message extraction utility
- Visual design patterns

**Explicit**:

- Service-specific error codes
- Error handling decisions (retry, display, recover)
- Business logic for recovery
- Context-specific messages

### Accessibility First

- Color not sole indicator (icons + text)
- Screen reader support (ARIA attributes)
- Keyboard navigation
- High contrast visual design
- Progressive disclosure

## Error Class Hierarchy

### Base Error Class (AppError)

**Location**: `src/lib/errors/AppError.ts`

**Properties**:

```typescript
class AppError extends Error {
  code: string;                           // Unique identifier
  message: string;                        // Human-readable description
  statusCode: number;                     // HTTP status code
  hint?: string;                          // Optional fix guidance
  context?: Record<string, unknown>;      // Optional debug data
}
```

### Service Error Classes

**DocumentError**: Document CRUD errors

```typescript
type DocumentErrorCode =
  | 'not_found'
  | 'unauthorized'
  | 'invalid_name'
  | 'content_too_large'
  | 'validation_error'
  | 'unknown_error';

class DocumentError extends AppError {
  code: DocumentErrorCode;
}
```

**AuthError**: Authentication/session errors

```typescript
type AuthErrorCode =
  | 'invalid_token'
  | 'token_expired'
  | 'unauthorized'
  | 'session_expired'
  | 'network_error'
  | 'unknown_error';

class AuthError extends AppError {
  code: AuthErrorCode;
}
```

**TemplateError**: Template loading/parsing errors

```typescript
type TemplateErrorCode =
  | 'manifest_load_failed'
  | 'template_not_found'
  | 'parse_error'
  | 'network_error';

class TemplateError extends AppError {
  code: TemplateErrorCode;
}
```

**QuillmarkError**: WASM rendering errors

```typescript
type QuillmarkErrorCode =
  | 'not_initialized'
  | 'wasm_load_failed'
  | 'parse_error'
  | 'render_error'
  | 'unknown_error';

class QuillmarkError extends AppError {
  code: QuillmarkErrorCode;
  diagnostic?: QuillmarkDiagnostic;  // Structured diagnostic info
}

interface QuillmarkDiagnostic {
  severity: 'error' | 'warning' | 'info';
  code?: string;                  // e.g., 'QM001'
  message: string;
  hint?: string;
  location?: {                    // Source location
    line: number;
    column: number;
    length: number;
  };
  sourceChain: string[];          // Error trace
}
```

## Error Flow Layers

### 1. QuillMark Layer (WASM)

**Error Source**: WASM parsing/rendering

**Error Type**: QuillmarkError with structured diagnostic

**Examples**:

- Parse errors: Invalid YAML, missing SCOPE
- Render errors: Unknown Quill template, compilation failure
- Validation errors: Invalid metadata structure

**Pattern**: WASM diagnostic → QuillmarkError → Service → UI

### 2. Service Layer

**Error Types**: Service-specific error classes (DocumentError, AuthError, etc.)

**Pattern**: Throw typed errors from service methods

**Example**:

```typescript
async getDocument(id: string): Promise<Document> {
  const doc = await fetch(`/api/documents/${id}`);
  if (!doc.ok) {
    if (doc.status === 404) {
      throw new DocumentError('not_found', `Document ${id} not found`, 404);
    }
    throw new DocumentError('unknown_error', 'Failed to load document', 500);
  }
  return doc.json();
}
```

### 3. Frontend Layer

**Error Handling**: Catch typed errors in components

**Pattern**:

```typescript
try {
  await documentStore.getDocument(id);
} catch (error) {
  if (error instanceof DocumentError) {
    if (error.code === 'not_found') {
      // Handle not found
    }
  }
  showErrorToast(getErrorMessage(error));
}
```

### 4. UI Layer

**Display Patterns**:

- **Toast Notifications**: Brief, actionable messages (network errors, save failures)
- **Inline Errors**: Next to form fields (validation errors)
- **Error Pages**: Fatal errors with recovery options
- **Diagnostics Panel**: Structured QuillMark errors with location

## Shared Utilities

### Message Extraction

**Utility**: `getErrorMessage(error: unknown): string`

**Purpose**: Safely extract message from any error type

**Pattern**:

```typescript
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
```

### Error Display

**Toast Notifications** (`showErrorToast`):

```typescript
function showErrorToast(error: unknown) {
  const message = getErrorMessage(error);
  const hint = error instanceof AppError ? error.hint : undefined;

  toast.error(message, {
    description: hint,
    action: /* retry button if applicable */
  });
}
```

### Server Error Handler

**Generic Handler**: Replaces multiple specialized handlers

**Pattern**:

```typescript
export function handleApiError(error: unknown): Response {
  if (error instanceof AppError) {
    return json(
      {
        error: error.code,
        message: error.message,
        hint: error.hint
      },
      { status: error.statusCode }
    );
  }

  // Fallback for unexpected errors
  return json(
    { error: 'unknown_error', message: 'An unexpected error occurred' },
    { status: 500 }
  );
}
```

## UI Display Patterns

### Toast Notifications

**Use For**: Transient errors (network, save failures, API errors)

**Pattern**: Brief message (3-5 seconds), optional action button (retry)

**Accessibility**:

- `role="alert"` for screen readers
- Icon + text (not color alone)
- Keyboard dismissible (ESC)

### Inline Form Errors

**Use For**: Validation errors, field-specific issues

**Pattern**: Error text below field, red border, error icon

**Accessibility**:

- `aria-invalid="true"` on field
- `aria-describedby` linking to error message
- Error icon with alt text
- High contrast red (#ef4444)

### Error Pages

**Use For**: Fatal errors, route errors, auth failures

**Pattern**: Full page with error message, retry button, home link

**Accessibility**:

- Clear heading structure
- Focus management (focus error heading on mount)
- Keyboard navigation
- Action buttons with clear labels

### Diagnostics Panel (QuillMark)

**Use For**: Structured QuillMark errors with source location

**Pattern**: Collapsible panel with diagnostic details

**Display**:

- Severity indicator (error/warning/info)
- Error message with code
- Hint (if available)
- Source location (line/column)
- Source chain (error trace)

**Accessibility**:

- Collapsible with `aria-expanded`
- Keyboard toggle (Enter/Space)
- Screen reader announces severity
- High contrast colors per severity

## Visual Design

### Error Colors

**Design Token**: `--color-destructive: #ef4444` (red)

**Usage**:

- Error text: `text-destructive`
- Error borders: `border-destructive`
- Error backgrounds: `bg-destructive/10` (10% opacity tint)

**Contrast**: 4.5:1 minimum (WCAG AA) on all backgrounds

### Error Icons

**Lucide Icons**:

- Error: `AlertCircle` (filled circle with exclamation)
- Warning: `AlertTriangle` (triangle with exclamation)
- Info: `Info` (circle with 'i')

**Sizes**:

- Toast: 20px
- Inline: 16px
- Page: 48px

**Always Paired**: Icon + text (never icon alone)

### Layout Patterns

**Toast**:

```
[Icon] Error message
       Optional hint text
       [Retry Button]
```

**Inline Error**:

```
[Input Field with red border]
[Icon] Error message
```

**Error Page**:

```
[Large Icon]
Error Title
Error message with details
[Retry Button] [Home Button]
```

**Diagnostics Panel**:

```
▶ [Severity Icon] Error: message (code)
  Hint: guidance text
  Location: line 5, column 12
  Source: WASM → Parser → Renderer
```

## Error Recovery Patterns

### Retry Strategy

**When to Retry**:

- Network errors (transient)
- Timeout errors
- 5xx server errors (sometimes)

**When NOT to Retry**:

- Validation errors (4xx except 429)
- Authentication errors (401, 403)
- Not found errors (404)

**Pattern**:

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1 || !isRetryable(error)) {
        throw error;
      }
      await delay(Math.pow(2, i) * 1000);  // Exponential backoff
    }
  }
}

function isRetryable(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.statusCode >= 500 || error.code === 'network_error';
  }
  return false;
}
```

### Fallback Strategy

**Guest Mode Fallback**: If API fails, fall back to localStorage

**Pattern**:

```typescript
try {
  return await apiClient.getDocuments();
} catch (error) {
  if (error instanceof AuthError && error.code === 'unauthorized') {
    // Fall back to guest mode
    return localStorageClient.getDocuments();
  }
  throw error;
}
```

### Optimistic Updates Rollback

**Pattern**: Update UI immediately, rollback on error

```typescript
const originalDoc = { ...currentDoc };
currentDoc.content = newContent;  // Optimistic update

try {
  await documentStore.updateDocument(id, { content: newContent });
} catch (error) {
  currentDoc.content = originalDoc.content;  // Rollback
  showErrorToast(error);
}
```

## Testing Strategy

### Error Class Testing

**Test Cases**:

- Error instanceof checks
- Error code typing
- statusCode assignment
- hint and context fields

### Service Error Testing

**Test Cases**:

- Service throws correct error types
- Error codes match expected values
- statusCode matches error type
- hint provides guidance

### UI Error Testing

**Test Cases**:

- Toast displays error message
- Inline errors show below fields
- Error pages render correctly
- Diagnostics panel expands/collapses
- Accessibility attributes present
- Keyboard navigation works

### Error Recovery Testing

**Test Cases**:

- Retry on network errors
- No retry on validation errors
- Exponential backoff timing
- Guest mode fallback on auth errors
- Optimistic update rollback

## Best Practices

### Error Creation

**Do**:

- Use specific error codes
- Provide helpful hints
- Include context for debugging
- Set appropriate statusCode

**Don't**:

- Use generic 'error' code
- Expose internal details to users
- Include sensitive data in messages
- Ignore error context

### Error Handling

**Do**:

- Catch specific error types
- Provide user feedback
- Log errors for debugging
- Recover gracefully when possible

**Don't**:

- Catch and ignore errors
- Show technical jargon to users
- Retry non-retryable errors
- Forget accessibility

### Error Display

**Do**:

- Use clear, actionable messages
- Provide next steps (hint)
- Include retry option when appropriate
- Support keyboard navigation

**Don't**:

- Use color alone
- Show stack traces to users
- Block all interaction
- Auto-dismiss critical errors

## Cross-References

- [SERVICE_FRAMEWORK.md](SERVICE_FRAMEWORK.md) - Service error throwing patterns
- [STATE_PATTERNS.md](STATE_PATTERNS.md) - Error state in stores
- [DESIGN_TOKENS.md](DESIGN_TOKENS.md) - Error color tokens
- [ACCESSIBILITY.md](ACCESSIBILITY.md) - WCAG compliance for errors

**Component READMEs**:

- `src/lib/errors/README.md` - Error class implementations
- `src/lib/components/DiagnosticsPanel/README.md` - Diagnostics UI
- `src/lib/utils/error-handling.ts` - Shared error utilities

---

_Pattern Document: Describes error handling across the application_
