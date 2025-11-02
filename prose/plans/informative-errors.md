# Informative Errors Implementation Plan

This plan details the implementation of diagnostic error handling for Quillmark rendering failures.

> **Related Documents:**
>
> - Design: [prose/designs/quillmark/DIAGNOSTICS.md](../../designs/quillmark/DIAGNOSTICS.md)
> - Design: [prose/designs/frontend/ERROR_DISPLAY.md](../../designs/frontend/ERROR_DISPLAY.md)
> - Service: [prose/designs/quillmark/SERVICE.md](../../designs/quillmark/SERVICE.md)

## Objective

Enable detailed diagnostic error display when Quillmark rendering fails, surfacing error code, message, hint, and location to users through the Preview component.

**Key Requirements:**

1. Extend `QuillmarkError` to carry `diagnostic` information
2. Extract diagnostic from WASM errors in service layer
3. Display diagnostic information (code, message, hint, location) in Preview component
4. Maintain backward compatibility with existing error handling

## Implementation Tasks

### 1. Add Semantic Tokens for Error Display

**File:** `src/app.css`

**Changes:**

Add semantic color tokens for error and warning states to ensure consistent theming.

**New Tokens (Light Theme):**

```css
/* Error/Diagnostic colors */
--color-error: #ef4444; /* red-500 base */
--color-error-foreground: #991b1b; /* red-800 dark text */
--color-error-background: #fef2f2; /* red-50 light bg */
--color-error-border: #fecaca; /* red-200 subtle border */

/* Warning/Hint colors */
--color-warning: #f59e0b; /* amber-500 base */
--color-warning-foreground: #78350f; /* amber-900 dark text */
--color-warning-background: #fffbeb; /* amber-50 light bg */
--color-warning-border: #fde68a; /* amber-200 subtle border */
```

**New Tokens (Dark Theme):**

```css
.dark {
  /* Error/Diagnostic colors */
  --color-error: #ef4444; /* red-500 base (unchanged) */
  --color-error-foreground: #fecaca; /* red-200 light text */
  --color-error-background: #450a0a; /* red-950 dark bg */
  --color-error-border: #991b1b; /* red-800 stronger border */

  /* Warning/Hint colors */
  --color-warning: #f59e0b; /* amber-500 base (unchanged) */
  --color-warning-foreground: #fde68a; /* amber-200 light text */
  --color-warning-background: #451a03; /* amber-950 dark bg */
  --color-warning-border: #78350f; /* amber-800 stronger border */
}
```

**Tailwind Integration:**

Add to `@theme inline` block:

```css
@theme inline {
  /* ... existing tokens ... */

  /* Error/Diagnostic colors */
  --color-error: var(--color-error);
  --color-error-foreground: var(--color-error-foreground);
  --color-error-background: var(--color-error-background);
  --color-error-border: var(--color-error-border);

  /* Warning/Hint colors */
  --color-warning: var(--color-warning);
  --color-warning-foreground: var(--color-warning-foreground);
  --color-warning-background: var(--color-warning-background);
  --color-warning-border: var(--color-warning-border);
}
```

**Testing:**

- Verify tokens are defined in both light and dark themes
- Check Tailwind integration (e.g., `bg-error-background` works)
- Confirm colors meet WCAG contrast requirements

### 2. Update QuillmarkService Types

**File:** `src/lib/services/quillmark/types.ts`

**Changes:**

1. Add diagnostic type definitions
2. Update `QuillmarkError` class to include optional diagnostic
3. Export new types

**New Type Definitions:**

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

**Update QuillmarkError:**

```typescript
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

**Testing:**

- Type checking passes
- Existing code compiles (backward compatible)
- New diagnostic property is optional

### 3. Update QuillmarkService Implementation

**File:** `src/lib/services/quillmark/service.ts`

**Changes:**

1. Add helper methods to extract and normalize diagnostics
2. Update error handling in render methods to attach diagnostics
3. Maintain backward compatibility

**Add Helper Methods:**

```typescript
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
		severity: this.normalizeSeverity(diagnostic.severity),
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

/**
 * Normalize severity to lowercase TypeScript type
 */
private normalizeSeverity(severity: any): DiagnosticSeverity {
	if (typeof severity === 'string') {
		const lower = severity.toLowerCase();
		if (lower === 'error' || lower === 'warning' || lower === 'info') {
			return lower as DiagnosticSeverity;
		}
	}
	return 'error'; // Default to error
}
```

**Update renderForPreview:**

```typescript
async renderForPreview(markdown: string): Promise<RenderResult> {
	this.validateInitialized();

	try {
		const result = exporters!.render(this.engine!, markdown, {});
		return result;
	} catch (error) {
		// Extract diagnostic information if available
		const diagnostic = this.extractDiagnostic(error);

		if (diagnostic) {
			// Throw with diagnostic information
			throw new QuillmarkError(
				'render_error',
				diagnostic.message || 'Failed to render preview',
				diagnostic
			);
		} else {
			// Fallback to generic error
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new QuillmarkError('render_error', `Failed to render preview: ${message}`);
		}
	}
}
```

**Update renderToPDF:**

Apply same pattern to `renderToPDF` and `downloadDocument` methods:

```typescript
async renderToPDF(markdown: string, quillName: string): Promise<Blob> {
	this.validateInitialized();
	this.validateQuillExists(quillName);

	try {
		const result = exporters!.render(this.engine!, markdown, {
			quillName: quillName,
			format: 'pdf'
		});
		return exporters!.toBlob(result);
	} catch (error) {
		const diagnostic = this.extractDiagnostic(error);

		if (diagnostic) {
			throw new QuillmarkError('render_error', diagnostic.message, diagnostic);
		} else {
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new QuillmarkError('render_error', `Failed to render PDF: ${message}`);
		}
	}
}
```

**Testing:**

- Unit tests for `extractDiagnostic` with various error formats
- Unit tests for `normalizeDiagnostic` with WASM diagnostic structure
- Unit tests for `normalizeSeverity` with different inputs
- Test render methods throw `QuillmarkError` with diagnostic
- Test backward compatibility (errors without diagnostics)

### 4. Update Preview Component

**File:** `src/lib/components/Preview/Preview.svelte`

**Changes:**

1. Add error display state structure
2. Extract diagnostic information from caught errors
3. Display diagnostic details in error UI
4. Maintain existing error display for non-diagnostic errors

**Add Error Display State:**

```typescript
interface ErrorDisplayState {
	code?: string;
	message: string;
	hint?: string;
	location?: {
		line: number;
		column: number;
	};
	sourceChain?: string[];
}
```

**Add Helper Function:**

```typescript
/**
 * Extract error display information from caught error
 */
function extractErrorDisplay(error: unknown): ErrorDisplayState {
	if (error instanceof QuillmarkError && error.diagnostic) {
		return {
			code: error.diagnostic.code,
			message: error.diagnostic.message,
			hint: error.diagnostic.hint,
			location: error.diagnostic.location,
			sourceChain:
				error.diagnostic.sourceChain.length > 0 ? error.diagnostic.sourceChain : undefined
		};
	}

	if (error instanceof QuillmarkError) {
		return { message: error.message };
	}

	return { message: 'An unexpected error occurred while rendering' };
}
```

**Update State Management:**

```typescript
// Replace: let error = $state<string | null>(null);
// With:
let errorDisplay = $state<ErrorDisplayState | null>(null);
```

**Update Error Handling:**

```typescript
async function renderPreview(): Promise<void> {
	// ... existing code ...

	try {
		const result = await quillmarkService.renderForPreview(markdown);
		renderResult = result;
		// ... process result ...
	} catch (err) {
		// Extract diagnostic information
		errorDisplay = extractErrorDisplay(err);
		console.error('Preview render error:', err);
	} finally {
		loading = false;
	}
}
```

**Update Error Display UI:**

Replace the existing error display block with:

```svelte
{:else if errorDisplay}
	<div class="flex h-full items-center justify-center p-4">
		<div class="max-w-2xl rounded-lg border border-error-border bg-error-background p-6">
			<!-- Error Header -->
			<div class="mb-4 flex items-center gap-2">
				<svg
					class="h-6 w-6 text-error"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<h3 class="text-lg font-semibold text-error-foreground">Render Error</h3>
			</div>

			<!-- Error Code -->
			{#if errorDisplay.code}
				<div class="mb-3">
					<span class="inline-block rounded bg-error-border px-2 py-1 font-mono text-sm text-error-foreground">
						{errorDisplay.code}
					</span>
				</div>
			{/if}

			<!-- Error Message -->
			<p class="mb-4 text-error-foreground">
				{errorDisplay.message}
			</p>

			<!-- Hint -->
			{#if errorDisplay.hint}
				<div class="mb-4 flex gap-2 rounded border-l-4 border-warning bg-warning-background p-3">
					<svg
						class="h-5 w-5 flex-shrink-0 text-warning"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
						/>
					</svg>
					<p class="text-sm text-warning-foreground">
						{errorDisplay.hint}
					</p>
				</div>
			{/if}

			<!-- Location -->
			{#if errorDisplay.location}
				<div class="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
					<svg
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					<span class="font-mono">
						Line {errorDisplay.location.line}, Column {errorDisplay.location.column}
					</span>
				</div>
			{/if}

			<!-- Source Chain -->
			{#if errorDisplay.sourceChain && errorDisplay.sourceChain.length > 0}
				<details class="mt-4">
					<summary class="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
						Error Context
					</summary>
					<ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
						{#each errorDisplay.sourceChain as source}
							<li>{source}</li>
						{/each}
					</ul>
				</details>
			{/if}
		</div>
	</div>
{/if}
```

**Testing:**

- Component renders with diagnostic information
- Component handles errors without diagnostic (backward compatible)
- All diagnostic fields display correctly when present
- Component handles missing optional fields gracefully
- Source chain is collapsed by default
- Error display is accessible (ARIA attributes)

### 5. Update Service Tests

**File:** `src/lib/services/quillmark/quillmark.test.ts`

**Add Test Cases:**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { QuillmarkDiagnostic } from './types';

describe('QuillmarkService - Diagnostic Handling', () => {
	describe('extractDiagnostic', () => {
		it('extracts diagnostic from error with diagnostic property', () => {
			const error = {
				diagnostic: {
					severity: 'Error',
					code: 'E001',
					message: 'Syntax error',
					primary: { line: 42, column: 15 },
					hint: 'Check bracket',
					source_chain: ['template error', 'parsing failed']
				}
			};

			// Access private method via service instance (testing pattern)
			const diagnostic = (service as any).extractDiagnostic(error);

			expect(diagnostic).toEqual({
				severity: 'error',
				code: 'E001',
				message: 'Syntax error',
				location: { line: 42, column: 15 },
				hint: 'Check bracket',
				sourceChain: ['template error', 'parsing failed']
			});
		});

		it('extracts diagnostic when error is diagnostic', () => {
			const error = {
				severity: 'Warning',
				message: 'Deprecated field',
				hint: 'Use new syntax'
			};

			const diagnostic = (service as any).extractDiagnostic(error);

			expect(diagnostic).toEqual({
				severity: 'warning',
				message: 'Deprecated field',
				hint: 'Use new syntax',
				sourceChain: []
			});
		});

		it('returns null for non-diagnostic errors', () => {
			const error = new Error('Generic error');
			const diagnostic = (service as any).extractDiagnostic(error);
			expect(diagnostic).toBeNull();
		});
	});

	describe('renderForPreview with diagnostics', () => {
		it('throws QuillmarkError with diagnostic on render failure', async () => {
			const wasmError = {
				diagnostic: {
					severity: 'Error',
					message: 'Template compilation failed',
					code: 'typst::compile',
					hint: 'Check template syntax'
				}
			};

			vi.mocked(exporters!.render).mockImplementation(() => {
				throw wasmError;
			});

			try {
				await service.renderForPreview('# Test');
				expect.fail('Should have thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(QuillmarkError);
				expect((error as QuillmarkError).diagnostic).toBeDefined();
				expect((error as QuillmarkError).diagnostic?.code).toBe('typst::compile');
				expect((error as QuillmarkError).diagnostic?.hint).toBe('Check template syntax');
			}
		});

		it('throws QuillmarkError without diagnostic for generic errors', async () => {
			vi.mocked(exporters!.render).mockImplementation(() => {
				throw new Error('Generic failure');
			});

			try {
				await service.renderForPreview('# Test');
				expect.fail('Should have thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(QuillmarkError);
				expect((error as QuillmarkError).diagnostic).toBeUndefined();
			}
		});
	});
});
```

### 6. Documentation Updates

**File:** `src/lib/services/quillmark/README.md`

**Add Section:**

````markdown
## Error Handling with Diagnostics

When rendering fails, the service provides detailed diagnostic information:

### QuillmarkError Structure

```typescript
interface QuillmarkError extends Error {
	code: 'not_initialized' | 'quill_not_found' | 'render_error' | 'load_error';
	diagnostic?: QuillmarkDiagnostic;
}

interface QuillmarkDiagnostic {
	severity: 'error' | 'warning' | 'info';
	code?: string;
	message: string;
	location?: {
		line: number;
		column: number;
		length?: number;
	};
	hint?: string;
	sourceChain: string[];
}
```
````

### Usage Example

```typescript
try {
	const result = await quillmarkService.renderForPreview(markdown);
	// Handle success
} catch (error) {
	if (error instanceof QuillmarkError && error.diagnostic) {
		// Display detailed error information
		console.error('Error code:', error.diagnostic.code);
		console.error('Message:', error.diagnostic.message);
		console.error('Hint:', error.diagnostic.hint);
		console.error('Location:', error.diagnostic.location);
	} else {
		// Handle generic error
		console.error('Render failed:', error.message);
	}
}
```

````

### 7. Type Checking and Linting

Run type checking and linting on all modified files:

```bash
npm run check        # Type checking
npm run lint         # ESLint
npm run format       # Prettier
````

Fix any issues found.

### 8. Build and Test

Run full test suite and build:

```bash
npm run test:unit    # Unit tests
npm run build        # Production build
```

Verify all tests pass and build succeeds.

## Success Criteria

- ✅ Semantic tokens added to app.css for error and warning states
- ✅ Tokens support both light and dark themes
- ✅ Tailwind integration configured for new tokens
- ✅ `QuillmarkDiagnostic` type added to service types
- ✅ `QuillmarkError` includes optional `diagnostic` property
- ✅ Service extracts diagnostic from WASM errors
- ✅ Service normalizes diagnostic format (snake_case → camelCase)
- ✅ Preview component displays diagnostic information using semantic tokens
- ✅ Error code displayed when available
- ✅ Error message displayed (required)
- ✅ Hint displayed when available
- ✅ Location displayed when available
- ✅ Source chain displayed when available
- ✅ Backward compatible (errors without diagnostics work)
- ✅ Unit tests pass
- ✅ Type checking passes
- ✅ Linting passes
- ✅ Build succeeds
- ✅ Accessible error display (ARIA attributes)

## Design Decisions Summary

### 1. Why Optional Diagnostic on QuillmarkError?

**Decision:** Add `diagnostic` as optional property to existing `QuillmarkError` class.

**Rationale:**

- Backward compatible (existing error handling works)
- Not all errors have diagnostics (e.g., initialization errors)
- Allows gradual adoption
- Follows JavaScript error pattern

**Alternative Considered:** New `DiagnosticError` class.
**Rejected because:** Complicates error handling, breaks existing code.

### 2. Why Extract and Normalize in Service?

**Decision:** Service layer extracts and normalizes diagnostics from WASM.

**Rationale:**

- Decouples UI from WASM internal structure
- Provides type-safe interface to consumers
- Handles different WASM error formats consistently
- Converts snake_case to camelCase (TypeScript convention)

**Alternative Considered:** Pass WASM error directly to UI.
**Rejected because:** Fragile, breaks type safety, couples UI to WASM.

### 3. Why Display All Diagnostic Fields?

**Decision:** Display code, message, hint, location, source chain when available.

**Rationale:**

- Provides complete information for debugging
- Actionable guidance (hint) helps users fix issues
- Location helps identify error source
- Source chain provides context for complex errors
- Progressive disclosure (source chain collapsed)

**Alternative Considered:** Display message only.
**Rejected because:** Loses valuable information, less helpful to users.

## Non-Goals

The following are explicitly **out of scope** for this implementation:

- ❌ Click-to-navigate from location to editor line
- ❌ Inline error highlighting in markdown editor
- ❌ Multiple diagnostics (warnings + errors)
- ❌ Error history tracking
- ❌ Copy diagnostic to clipboard
- ❌ Error code documentation links
- ❌ Automated fix suggestions

These features may be added in future iterations.

## Testing Notes

### Manual Testing Scenarios

Since we don't have actual WASM errors with diagnostics yet, testing will be done with:

1. **Mock Service:** Mock `renderForPreview` to throw `QuillmarkError` with diagnostic
2. **Component Testing:** Verify UI displays all diagnostic fields correctly
3. **Type Safety:** Ensure TypeScript compilation passes
4. **Backward Compatibility:** Verify existing error handling still works

### Integration Testing (Future)

When WASM diagnostics are available:

1. Create markdown that triggers syntax error
2. Verify diagnostic extracted and displayed
3. Create markdown that triggers template error
4. Verify hint displayed correctly
5. Test various error types and formats

## References

- [Diagnostic Design](../../designs/quillmark/DIAGNOSTICS.md)
- [Error Display Design](../../designs/frontend/ERROR_DISPLAY.md)
- [Quillmark Service Design](../../designs/quillmark/SERVICE.md)
- [Preview Component](../../designs/quillmark/PREVIEW.md)
- [@quillmark-test/wasm Error Types](https://github.com/nibsbin/quillmark)

---

_Document Status: Ready for Implementation_
