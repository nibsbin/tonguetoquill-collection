# Error Display Design

This document describes how UI components display diagnostic error information to users when Quillmark rendering fails.

> **Related**:
>
> - [DIAGNOSTICS.md](../quillmark/DIAGNOSTICS.md) for diagnostic structure
> - [PREVIEW.md](../quillmark/PREVIEW.md) for Preview component
> - [ACCESSIBILITY.md](./ACCESSIBILITY.md) for accessibility requirements

## Overview

When Quillmark rendering fails, the Preview component must display diagnostic information in a clear, accessible, and actionable way. This includes:

- **Error code** (when available) - categorizes the error type
- **Error message** - explains what went wrong
- **Hint** (when available) - suggests how to fix it
- **Location** (when available) - shows where the error occurred
- **Source chain** (when available) - provides error context

## UI Components

### Error Display Component

The Preview component will show diagnostic information when rendering fails.

**Location:** `src/lib/components/Preview/Preview.svelte`

### Error Display States

1. **Loading** - Rendering in progress
2. **Success** - Rendered content displayed
3. **Error** - Diagnostic information displayed

### Error Display Layout

```
┌─────────────────────────────────────────────┐
│  Preview                                    │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  ⚠ Render Error                       │ │
│  │                                        │ │
│  │  [E001] Syntax Error                  │ │ <- Code (if available)
│  │                                        │ │
│  │  Missing closing bracket in field     │ │ <- Message
│  │  definition at line 42                │ │
│  │                                        │ │
│  │  💡 Hint: Check frontmatter syntax    │ │ <- Hint (if available)
│  │                                        │ │
│  │  📍 Line 42, Column 15                │ │ <- Location (if available)
│  └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

## Component Implementation

### Error State Structure

```typescript
interface ErrorDisplayState {
	/** Error code (e.g., "E001", "typst::syntax") */
	code?: string;
	/** Main error message */
	message: string;
	/** Optional hint for fixing */
	hint?: string;
	/** Source location */
	location?: {
		line: number;
		column: number;
		length?: number;
	};
	/** Error context chain */
	sourceChain?: string[];
}
```

### Error Extraction

Extract diagnostic information from QuillmarkError:

```typescript
import { QuillmarkError, type QuillmarkDiagnostic } from '$lib/services/quillmark/types';

function extractErrorDisplay(error: unknown): ErrorDisplayState | null {
	// Check if it's a QuillmarkError with diagnostic
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

	// Fallback to basic error message
	if (error instanceof QuillmarkError) {
		return {
			message: error.message
		};
	}

	// Unknown error
	return {
		message: 'An unexpected error occurred while rendering'
	};
}
```

## Visual Design

### Color Scheme

**Semantic Tokens:**

The error display uses semantic color tokens defined in `app.css` to ensure consistent theming:

**Error Display:**

- Background: `bg-error-background` (light: `#fef2f2` / dark: `#450a0a`)
- Border: `border-error-border` (light: `#fecaca` / dark: `#991b1b`)
- Text: `text-error-foreground` (light: `#991b1b` / dark: `#fecaca`)
- Icon: `text-error` (light/dark: `#ef4444`)

**Hint Display:**

- Background: `bg-warning-background` (light: `#fffbeb` / dark: `#451a03`)
- Border: `border-warning` (light/dark: `#f59e0b`)
- Icon: `text-warning` (light/dark: `#f59e0b`)
- Text: `text-warning-foreground` (light: `#78350f` / dark: `#fde68a`)

**Location Display:**

- Text: `text-muted-foreground` (existing semantic token)
- Uses existing muted semantic tokens for consistency

### Typography

- **Error Title**: `text-lg font-semibold`
- **Error Code**: `text-sm font-mono` (monospace for codes)
- **Error Message**: `text-base`
- **Hint**: `text-sm`
- **Location**: `text-sm font-mono`

### Spacing

- Container padding: `p-6`
- Section gaps: `gap-4`
- Inline elements gap: `gap-2`
- Icon size: `h-5 w-5` (20px)

### Styling Example

Using semantic tokens from `app.css`:

```css
.error-display {
	background-color: var(--color-error-background);
	border: 1px solid var(--color-error-border);
	border-radius: 0.5rem;
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	max-width: 100%;
}

.error-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.error-icon {
	width: 1.5rem;
	height: 1.5rem;
	color: var(--color-error);
}

.error-title {
	font-size: 1.125rem;
	font-weight: 600;
	color: var(--color-error-foreground);
	margin: 0;
}

.code-badge {
	display: inline-block;
	font-family: monospace;
	font-size: 0.875rem;
	background-color: var(--color-error-border);
	color: var(--color-error-foreground);
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
}

.error-message {
	font-size: 1rem;
	color: var(--color-error-foreground);
	line-height: 1.5;
}

.error-hint {
	display: flex;
	align-items: start;
	gap: 0.5rem;
	background-color: var(--color-warning-background);
	border-left: 3px solid var(--color-warning);
	padding: 0.75rem;
	border-radius: 0.25rem;
}

.hint-icon {
	width: 1.25rem;
	height: 1.25rem;
	color: var(--color-warning);
	flex-shrink: 0;
}

.error-location {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-family: monospace;
	font-size: 0.875rem;
	color: var(--color-muted-foreground);
}

.error-source-chain {
	margin-top: 0.5rem;
	font-size: 0.875rem;
}

.error-source-chain summary {
	cursor: pointer;
	color: var(--color-muted-foreground);
	font-weight: 500;
}

.error-source-chain summary:hover {
	color: var(--color-foreground);
}

.error-source-chain ul {
	margin-top: 0.5rem;
	padding-left: 1.5rem;
	list-style: disc;
	color: var(--color-muted-foreground);
}
```

## Accessibility

### ARIA Attributes

```svelte
<div class="error-display" role="alert" aria-live="assertive" aria-atomic="true">
	<!-- Error content -->
</div>
```

**Rationale:**

- `role="alert"` - Identifies as important message
- `aria-live="assertive"` - Screen readers announce immediately
- `aria-atomic="true"` - Read entire error, not just changes

### Screen Reader Support

**Announcements:**

- Error appears: "Alert: Render Error. [code]. [message]. [hint]. [location]."
- Error clears: "Preview updated" (via preview container's `aria-live="polite"`)

### Keyboard Navigation

- Source chain `<details>` - Expand/collapse with Enter/Space
- Error display is scrollable with keyboard (Arrow keys, Page Up/Down)
- Focus remains on editor after error (user can fix and re-trigger render)

### Visual Indicators

- Color is not sole indicator (icons + text)
- High contrast between text and background
- Clear visual hierarchy (title → message → hint → details)
- Icons have `aria-hidden="true"` (decorative, text conveys meaning)

## Responsive Design

### Mobile Considerations

**Layout Adjustments:**

- Reduce padding on small screens: `p-4` instead of `p-6`
- Stack elements vertically (already flex-column)
- Allow horizontal scrolling for long error codes/locations
- Collapse source chain by default (already using `<details>`)

**Touch Optimization:**

- Adequate tap target for `<summary>` (min 44px height)
- Scrollable error container for long messages
- No hover states (rely on visible states)

### Desktop Enhancements

- Show source chain expanded by default
- More generous spacing
- Wider max-width for error container

## Information Priority

Display error information in this priority order:

1. **Error Code** (if available) - Quick categorization
2. **Error Message** (required) - What went wrong
3. **Hint** (if available) - How to fix it
4. **Location** (if available) - Where it occurred
5. **Source Chain** (if available) - Error context

### Conditional Rendering

- Always show: Error icon + title + message
- Show if available: Code, hint, location, source chain
- Graceful degradation: Works with any subset of information

## Error Categories

### Common Error Types

**Syntax Errors:**

- Code: `E001`, `typst::syntax`
- Location: Usually available
- Hint: Often available (e.g., "missing closing bracket")
- Example: Markdown syntax error, invalid YAML frontmatter

**Template Errors:**

- Code: `E002`, `template::field`
- Location: May not be available
- Hint: Usually available (e.g., "field 'date' is required")
- Example: Missing required field, invalid field type

**Backend Errors:**

- Code: Backend-specific (e.g., `typst::compile`)
- Location: May be available
- Hint: May be available
- Source chain: Often has multiple levels
- Example: Typst compilation error, LaTeX error

**Service Errors:**

- Code: `not_initialized`, `quill_not_found`
- No location (not source-related)
- Hint: May suggest action (e.g., "refresh page")
- Example: Service not ready, invalid template

## Testing Strategy

### Visual Tests

**Component States:**

- Error with all fields (code + message + hint + location + source chain)
- Error with minimal fields (message only)
- Error with code and message
- Error with hint but no location
- Long error message (text wrapping)
- Long source chain (scrolling)

**Responsive Tests:**

- Mobile viewport (320px - 768px)
- Tablet viewport (768px - 1024px)
- Desktop viewport (1024px+)

### Accessibility Tests

**Screen Reader:**

- Error announcement on render failure
- Tab navigation through interactive elements
- Details expand/collapse keyboard support

**Keyboard Navigation:**

- Focus management on error state
- Scrolling with keyboard
- No keyboard traps

### Integration Tests

**Error Scenarios:**

1. Trigger syntax error → Verify diagnostic display
2. Trigger template error → Verify hint display
3. Trigger backend error → Verify source chain
4. Trigger service error → Verify graceful handling
5. Fix error → Verify error clears

## Design Decisions

### Why Inline Error Display?

**Decision:** Show error in Preview pane, not as toast/modal.

**Rationale:**

- Error is contextual to preview
- User can see error while editing
- Persists until fixed (not dismissed)
- No modal interruption to workflow
- Matches editor error display patterns

**Alternative Considered:** Toast notification.
**Rejected because:** Temporary, can be missed, interrupts flow.

### Why Progressive Disclosure for Source Chain?

**Decision:** Use `<details>` element to collapse source chain by default.

**Rationale:**

- Reduces visual clutter for common errors
- Advanced users can expand for context
- Native HTML element (accessibility built-in)
- Works without JavaScript

**Alternative Considered:** Always show full source chain.
**Rejected because:** Too verbose for most cases.

### Why Monospace for Code/Location?

**Decision:** Use monospace font for error codes and location info.

**Rationale:**

- Distinguishes technical info from prose
- Easier to parse (line/column numbers)
- Matches editor font (consistency)
- Common pattern for code/technical info

### Why Color + Icon?

**Decision:** Use both color and icons for error display.

**Rationale:**

- Color not sole indicator (accessibility)
- Icons provide quick visual scanning
- Color reinforces severity
- Meets WCAG 2.1 requirements

## Future Enhancements

Potential improvements for future versions:

1. **Click to Navigate**: Click location to jump to line in editor
2. **Inline Highlighting**: Highlight error location in markdown editor
3. **Multiple Diagnostics**: Display warnings alongside errors
4. **Error History**: Show previous errors in collapsible list
5. **Copy Error**: Button to copy diagnostic for sharing/debugging
6. **Error Documentation**: Link error codes to help documentation
7. **Quick Fixes**: Suggest automated fixes for common errors

## References

- [Diagnostic Structure](../quillmark/DIAGNOSTICS.md)
- [Preview Component](../quillmark/PREVIEW.md)
- [Accessibility Guidelines](./ACCESSIBILITY.md)
- [Design System](./DESIGN_SYSTEM.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

_Document Status: Design - Ready for Planning_
