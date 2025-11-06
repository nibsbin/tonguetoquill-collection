# Error Handling

**Purpose**: End-to-end error flow from WASM → Service → Frontend → UI.

**TL;DR**: Structured errors with codes, messages, hints, and source chains. Display via toast notifications or inline error displays.

---

## When to Use

- Understanding error propagation across layers
- Adding new error types
- Debugging error handling
- Ensuring consistent error UX

---

## Error Architecture

### 1. QuillMark Layer (WASM)

**Location**: [DIAGNOSTICS.md](../quillmark/DIAGNOSTICS.md)

**Structure**:
```typescript
interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  code: string;              // e.g., 'QM001'
  message: string;           // Human-readable error
  hint?: string;             // How to fix
  location?: {               // Where in document
    line: number;
    column: number;
    length: number;
  };
  source_chain?: string[];   // Error trace
}
```

**Examples**:
- Parse errors: Invalid YAML, missing SCOPE
- Render errors: Unknown Quill template, compilation failure
- Validation errors: Invalid metadata structure

### 2. Service Layer (Backend/Frontend)

**Location**: [SERVICE.md](../quillmark/SERVICE.md)

**Error Mapping**:
- WASM errors → Service exceptions
- Add context (document ID, user action)
- Preserve diagnostic information
- Return structured error responses

**API Errors** (Backend):
- 400 Bad Request: Client error with details
- 401 Unauthorized: Auth failure
- 404 Not Found: Resource missing
- 500 Internal Server Error: Unexpected failure

### 3. Frontend Integration

**Location**: [API_INTEGRATION.md](../frontend/API_INTEGRATION.md)

**Error Categories**:

**Network Errors**:
- Timeout → Retry with backoff
- Connection failed → Show "offline" indicator
- 5xx → Retry up to 3 times

**Client Errors**:
- 400 → Display validation message
- 401 → Trigger token refresh, then retry
- 403 → Show "permission denied"
- 404 → Show "not found"

**Validation Errors**:
- Extract field-specific errors from API response
- Display inline next to form fields
- Highlight invalid inputs

### 4. UI Layer (Visual Display)

**Location**: [ERROR_DISPLAY.md](../frontend/ERROR_DISPLAY.md)

**Display Patterns**:

**Toast Notifications** (Transient errors):
- API errors (save failed, load failed)
- Network errors (connection lost)
- Auth errors (login failed)
- Duration: 5 seconds, dismissible
- Actions: Retry button, close button

**Inline Display** (QuillMark errors):
- Shown in preview pane
- Diagnostic information (code, message, hint)
- Source location (line/column)
- Syntax highlighting of error location
- Persistent until document fixed

**Form Validation** (Input errors):
- Red border on invalid field
- Error text below field
- Real-time validation feedback
- Clear on correction

---

## Complete Error Flow

### QuillMark Render Error

```
User types invalid YAML   : Document with syntax error
Editor → QuillmarkService : render(documentContent)
Service → WASM            : quillmark_render()
WASM → Service            : Error: Diagnostic { code: 'QM001', message: 'Invalid YAML' }
Service → Frontend        : Return structured error
Frontend → Preview        : Update preview state
Preview → ErrorDisplay    : Render error component
ErrorDisplay → User       : Show diagnostic with hint
```

### API Save Error

```
User edits document       : Auto-save triggers
Frontend → API            : PUT /api/documents/123
API → Database            : UPDATE documents SET...
Database → API            : Error: Constraint violation
API → Frontend            : 400 Bad Request { error: 'Invalid title' }
Frontend → Toast          : Show error toast
Toast → User              : "Failed to save: Invalid title" + Retry button
User → Retry Button       : Click retry
Frontend → API            : PUT /api/documents/123 (retry)
```

### Auth Token Expired

```
Frontend → API            : GET /api/documents
API → Auth                : Validate JWT
Auth → API                : Token expired (401)
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
Frontend → Retry Logic    : Attempt 1/3
Frontend → API            : GET /api/documents (retry)
[Success or more retries]
Frontend → Toast          : "Connection issue, retrying..." or "Success"
```

---

## Error Handling Patterns

### Structured Errors

Always include:
- **Code**: Unique error identifier (e.g., 'QM001', 'AUTH_INVALID')
- **Message**: Human-readable description
- **Context**: What user was doing
- **Hint**: How to fix (if known)
- **Trace**: Source chain for debugging

### Progressive Error Display

1. **Optimistic**: Assume success, show loading
2. **Failure**: Display error immediately
3. **Retry**: Offer retry action
4. **Recovery**: Provide alternative actions (e.g., "Discard changes", "Try again later")

### Error Categorization

| Type | Display | Persistence | Action |
|------|---------|-------------|--------|
| Validation | Inline (form field) | Until fixed | User corrects input |
| QuillMark | Inline (preview) | Until fixed | User fixes document |
| Network | Toast | 5 seconds | Retry automatically |
| Auth | Toast | 5 seconds | Refresh token automatically |
| API | Toast | 5 seconds | Retry button |
| Fatal | Modal | Until dismissed | Reload page |

### Silent vs. Visible Errors

**Silent** (log only):
- Token refresh success
- Auto-save during navigation (prevents data loss but doesn't block)
- Background prefetch failures

**Visible** (show to user):
- User-initiated actions fail (save, load, delete)
- Document rendering errors
- Authentication errors
- Permission denied

---

## Error Recovery

### Auto-Save Failure
- Keep local changes in editor
- Mark document as "unsaved"
- Show retry button in toast
- Don't discard user work

### Document Load Failure
- Show error toast
- Keep editor interactive
- Allow creating new document
- Provide retry option

### Preview Render Failure
- Display diagnostic in preview pane
- Keep editor functional
- Highlight error location (if available)
- Show hint for fixing

---

## Error Messages

### Guidelines

**Good**:
- "Failed to save document: Network timeout. Retry?"
- "Invalid YAML on line 5: Missing closing quote"
- "Authentication expired. Signing in again..."

**Bad**:
- "Error" (too vague)
- "Exception in QuillmarkService.render()" (too technical)
- "Something went wrong" (unhelpful)

**Components**:
1. **What failed**: "Failed to save document"
2. **Why**: "Network timeout"
3. **Action**: "Retry?"

---

## Cross-References

- [DIAGNOSTICS.md](../quillmark/DIAGNOSTICS.md) - QuillMark error structure
- [SERVICE.md](../quillmark/SERVICE.md) - Error mapping in services
- [API_INTEGRATION.md](../frontend/API_INTEGRATION.md) - API error handling
- [ERROR_DISPLAY.md](../frontend/ERROR_DISPLAY.md) - Visual error patterns
- [DESIGN_SYSTEM.md](../frontend/DESIGN_SYSTEM.md) - Error colors and tokens
- [WIDGET_ABSTRACTION.md](../frontend/WIDGET_ABSTRACTION.md) - Toast component
