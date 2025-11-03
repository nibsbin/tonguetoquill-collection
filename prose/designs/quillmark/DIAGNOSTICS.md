# Quillmark Diagnostic Error Handling

This document describes how the Quillmark service surfaces diagnostic information when rendering fails, and how consumers use this information to provide informative error messages.

> **Related**:
>
> - [SERVICE.md](./SERVICE.md) for service architecture
> - [PREVIEW.md](./PREVIEW.md) for preview component integration

## Overview

When Quillmark rendering fails (e.g., syntax errors, template errors, backend compilation errors), the WASM engine returns a `SerializableDiagnostic` structure containing detailed error information. This diagnostic information must be surfaced through the service layer to UI components so users receive actionable feedback.

## Diagnostic Structure

The Quillmark WASM engine returns diagnostic information in this format:

```rust
pub struct SerializableDiagnostic {
    /// Error severity level
    pub severity: Severity,
    /// Optional error code (e.g., "E001", "typst::syntax")
    pub code: Option<String>,
    /// Human-readable error message
    pub message: String,
    /// Primary source location
    pub primary: Option<Location>,
    /// Optional hint for fixing the error
    pub hint: Option<String>,
    /// Source chain as list of strings (for display purposes)
    pub source_chain: Vec<String>,
}
```

### Severity Levels

```rust
pub enum Severity {
    Error,    // Fatal error - rendering failed
    Warning,  // Non-fatal issue - rendering succeeded with warnings
    Info,     // Informational message
}
```

### Location Information

```rust
pub struct Location {
    pub line: usize,
    pub column: usize,
    pub length: Option<usize>,
}
```

## TypeScript Type Definitions

### Service Types

**File:** `src/lib/services/quillmark/types.ts`

```typescript
/**
 * Error severity level
 */
export type DiagnosticSeverity = 'error' | 'warning' | 'info';

/**
 * Source location for an error
 */
export interface DiagnosticLocation {
	/** Line number (1-indexed) */
	line: number;
	/** Column number (1-indexed) */
	column: number;
	/** Length of the error span */
	length?: number;
}

/**
 * Detailed diagnostic information from Quillmark rendering
 */
export interface QuillmarkDiagnostic {
	/** Error severity level */
	severity: DiagnosticSeverity;
	/** Optional error code (e.g., "E001", "typst::syntax") */
	code?: string;
	/** Human-readable error message */
	message: string;
	/** Primary source location */
	location?: DiagnosticLocation;
	/** Optional hint for fixing the error */
	hint?: string;
	/** Source chain as list of strings (for display purposes) */
	sourceChain: string[];
}
```

### Enhanced Error Class

Update the `QuillmarkError` class to carry diagnostic information:

```typescript
/**
 * Custom error class for Quillmark service errors with diagnostic support
 */
export class QuillmarkError extends Error {
	/** Error code identifying the type of error */
	code: QuillmarkErrorCode;

	/** Optional diagnostic information for render errors */
	diagnostic?: QuillmarkDiagnostic;

	constructor(code: QuillmarkErrorCode, message: string, diagnostic?: QuillmarkDiagnostic) {
		super(message);
		this.name = 'QuillmarkError';
		this.code = code;
		this.diagnostic = diagnostic;
	}
}
```

## Service Layer Changes

### Render Error Handling

When the WASM engine throws an error during rendering, the service should:

1. **Catch the error** from the WASM boundary
2. **Extract diagnostic information** if available
3. **Create QuillmarkError** with diagnostic attached
4. **Throw to caller** for handling

### Example Implementation

```typescript
async renderForPreview(markdown: string): Promise<RenderResult> {
	this.validateInitialized();

	try {
		const result = exporters!.render(this.engine!, markdown, {});
		return result;
	} catch (error) {
		// Check if error contains diagnostic information
		const diagnostic = this.extractDiagnostic(error);

		if (diagnostic) {
			// Render error with diagnostic information
			throw new QuillmarkError(
				'render_error',
				diagnostic.message || 'Failed to render preview',
				diagnostic
			);
		} else {
			// Generic render error
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new QuillmarkError('render_error', `Failed to render preview: ${message}`);
		}
	}
}

/**
 * Extract diagnostic information from WASM error
 */
private extractDiagnostic(error: unknown): QuillmarkDiagnostic | null {
	// The WASM engine may return errors with a `diagnostic` property
	// or embed diagnostic information in the error structure
	if (error && typeof error === 'object') {
		const err = error as any;

		// Check for diagnostic property
		if (err.diagnostic) {
			return this.normalizeDiagnostic(err.diagnostic);
		}

		// Check if error itself is a diagnostic
		if (err.severity && err.message) {
			return this.normalizeDiagnostic(err);
		}
	}

	return null;
}

/**
 * Normalize WASM diagnostic to TypeScript type
 */
private normalizeDiagnostic(diagnostic: any): QuillmarkDiagnostic {
	return {
		severity: diagnostic.severity?.toLowerCase() || 'error',
		code: diagnostic.code || undefined,
		message: diagnostic.message || 'Unknown error',
		location: diagnostic.primary ? {
			line: diagnostic.primary.line,
			column: diagnostic.primary.column,
			length: diagnostic.primary.length
		} : undefined,
		hint: diagnostic.hint || undefined,
		sourceChain: diagnostic.source_chain || diagnostic.sourceChain || []
	};
}
```

## Error Propagation

### From Service to Components

1. **Service throws** `QuillmarkError` with diagnostic
2. **Component catches** and checks for `error.diagnostic`
3. **Component displays** error details to user

### Error Information Priority

When displaying errors, use this priority:

1. **Diagnostic message** (if available) - most specific
2. **Error code** (if available) - helps categorize error
3. **Hint** (if available) - actionable guidance
4. **Location** (if available) - helps locate issue in source
5. **Fallback message** - generic error message

## Design Decisions

### Why Attach Diagnostic to Error?

**Decision:** Include `diagnostic` as optional property on `QuillmarkError`.

**Rationale:**

- Preserves existing error handling patterns
- Backward compatible (diagnostic is optional)
- All error information in one object
- Easy to check `if (error.diagnostic)` for rich errors
- Follows JavaScript error pattern (errors with additional properties)

**Alternative Considered:** Separate `DiagnosticError` class.
**Rejected because:** Complicates error handling, requires instanceof checks.

### Why Optional Diagnostic?

**Decision:** Make diagnostic optional on QuillmarkError.

**Rationale:**

- Not all errors have diagnostics (e.g., initialization errors)
- Allows gradual adoption (existing code works without changes)
- WASM errors may not always include diagnostic information
- Graceful degradation to simple error messages

### Why Normalize Diagnostic?

**Decision:** Convert WASM diagnostic format to TypeScript interface.

**Rationale:**

- Type safety for consumers
- Consistent casing (snake_case → camelCase)
- Handles different error formats from WASM
- Allows defensive programming (null checks, defaults)
- Decouples UI from WASM internal structure

### Why Source Chain?

**Decision:** Include `sourceChain` array in diagnostic.

**Rationale:**

- Provides error context (e.g., "caused by X, which was caused by Y")
- Useful for debugging template issues
- Helps advanced users trace error origins
- Can be collapsed/expanded in UI for progressive disclosure

**Out of Scope:** UI implementation for source chain display.

## Future Enhancements

Potential improvements for future versions:

1. **Multiple Diagnostics**: Return array of diagnostics (errors + warnings)
2. **Diagnostic Codes**: Standardize error codes with documentation links
3. **Fix Suggestions**: Automated fix suggestions for common errors
4. **Source Highlighting**: Integrate with editor to highlight error locations
5. **Diagnostic History**: Track repeated errors across renders
6. **Telemetry**: Collect anonymous diagnostic data for improvement

## Testing Strategy

### Unit Tests

**Service Layer:**

- Test diagnostic extraction from WASM errors
- Test diagnostic normalization (snake_case → camelCase)
- Test QuillmarkError with and without diagnostic
- Test fallback to generic error message
- Test error propagation to caller

**Mock Scenarios:**

- Typst syntax error with location
- Template field validation error with hint
- Backend compilation error with source chain
- Generic error without diagnostic

### Integration Tests

**Full Error Flow:**

1. Trigger render error with invalid markdown
2. Verify diagnostic information extracted
3. Verify error propagated to component
4. Verify UI displays diagnostic details

## References

- [Quillmark Service Design](./SERVICE.md)
- [Preview Component Design](./PREVIEW.md)
- [Error Display Design](../frontend/ERROR_DISPLAY.md)
- [@quillmark-test/wasm Error Types](https://github.com/nibsbin/quillmark)

---

_Document Status: Design - Ready for Planning_
