# Live Quillmark Preview Implementation Plan

This plan details the implementation of live Quillmark rendering for the Preview pane.

> **Related Documents:**
>
> - Design: [prose/designs/quillmark/PREVIEW.md](../designs/quillmark/PREVIEW.md)
> - Service: [prose/designs/quillmark/SERVICE.md](../designs/quillmark/SERVICE.md)
> - Integration: [prose/designs/quillmark/INTEGRATION.md](../designs/quillmark/INTEGRATION.md)

## Objective

Enable live Quillmark rendering in the Preview pane with automatic format detection (SVG or PDF) based on the backend's capabilities.

**Key Requirements:**

1. Call `exporters.render(engine, markdown, { quill: quillName })` without specifying format
2. Dynamically handle `RenderResult.outputFormat` (either 'pdf' or 'svg')
3. Use `exporters.toBlob()` for PDF and appropriate method for SVG
4. Service should not specify render type for preview (defaults to backend's optimal format)

## Implementation Tasks

### 1. Update QuillmarkService with Auto-Format Rendering

**File:** `src/lib/services/quillmark/service.ts`

Add new `renderForPreview()` method:

```typescript
/**
 * Render markdown for preview with auto-detected format
 */
async renderForPreview(
	markdown: string,
	quillName: string
): Promise<{ format: 'pdf' | 'svg'; data: Blob | string }> {
	this.validateInitialized();
	this.validateQuillExists(quillName);

	try {
		// Render without format - let backend choose
		const result = exporters.render(this.engine!, markdown, {
			quill: quillName
			// No format specified
		});

		// Return data based on actual output format
		if (result.outputFormat === 'pdf') {
			return {
				format: 'pdf',
				data: exporters.toBlob(result)
			};
		} else if (result.outputFormat === 'svg') {
			return {
				format: 'svg',
				data: exporters.toSvgString(result)
			};
		} else {
			throw new Error(`Unsupported output format: ${result.outputFormat}`);
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		throw new QuillmarkError('render_error', `Failed to render preview: ${message}`);
	}
}
```

**Testing:**

- Add unit test for `renderForPreview()` method
- Mock different `outputFormat` values
- Verify correct data type returned

### 2. Update Service Types

**File:** `src/lib/services/quillmark/types.ts`

Add method signature to `QuillmarkService` interface:

```typescript
export interface QuillmarkService {
	// ... existing methods

	/**
	 * Render markdown for preview with auto-detected format.
	 * Does not specify output format - allows backend to choose optimal format.
	 *
	 * @param markdown - Markdown content to render
	 * @param quillName - Name of Quill template to use
	 * @returns Object with detected format and appropriate data type
	 * @throws {QuillmarkError} If service is not initialized or Quill not found
	 */
	renderForPreview(
		markdown: string,
		quillName: string
	): Promise<{ format: 'pdf' | 'svg'; data: Blob | string }>;
}
```

### 3. Update Service README

**File:** `src/lib/services/quillmark/README.md`

Add documentation for the new method:

````markdown
### Render for Preview (Auto-Format)

```typescript
try {
	const { format, data } = await quillmarkService.renderForPreview(markdown, 'usaf_memo');

	if (format === 'pdf') {
		// Display PDF blob
		const url = URL.createObjectURL(data as Blob);
		embedElement.src = url;
	} else {
		// Display SVG string
		previewElement.innerHTML = data as string;
	}
} catch (error) {
	console.error('Preview render failed:', error);
}
```
````

**Why Auto-Format?**

The `renderForPreview()` method doesn't specify an output format, allowing the Quillmark backend to choose the optimal format for preview:

- Typst backend → SVG (best for inline display)
- PDF backend → PDF (only supported format)
- Future backends → May use other formats

This ensures the best user experience without manual format selection.

````

### 4. Update MarkdownPreview Component

**File:** `src/lib/components/Preview/MarkdownPreview.svelte`

**Changes:**

1. Add Quillmark mode support
2. Implement format-aware rendering
3. Add loading/error states
4. Debounce preview updates

**Implementation approach:**

```svelte
<script lang="ts">
	import { marked } from 'marked';
	import { quillmarkService, QuillmarkError } from '$lib/services/quillmark';
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		markdown: string;
		mode?: 'html' | 'quillmark';
		quillName?: string;
	}

	let { markdown, mode = 'html', quillName }: Props = $props();

	let loading = false;
	let error: string | null = null;
	let renderFormat: 'pdf' | 'svg' | null = null;
	let renderData: Blob | string | null = null;
	let objectUrl: string | null = null;

	// HTML preview (existing)
	let htmlPreview = $derived(mode === 'html' ? marked.parse(markdown) : '');

	// Debounced Quillmark render
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (mode === 'quillmark' && quillName) {
			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => renderQuillmark(), 300);
		}

		return () => {
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});

	async function renderQuillmark() {
		if (!quillName) {
			error = 'No template selected';
			return;
		}

		loading = true;
		error = null;

		try {
			const result = await quillmarkService.renderForPreview(markdown, quillName);

			renderFormat = result.format;

			// Clean up previous object URL
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
				objectUrl = null;
			}

			if (result.format === 'pdf') {
				renderData = result.data as Blob;
				objectUrl = URL.createObjectURL(renderData);
			} else {
				renderData = result.data as string;
			}
		} catch (err) {
			if (err instanceof QuillmarkError) {
				error = err.message;
			} else {
				error = 'Failed to render preview';
			}
			console.error('Preview render error:', err);
		} finally {
			loading = false;
		}
	}

	onDestroy(() => {
		if (objectUrl) {
			URL.revokeObjectURL(objectUrl);
		}
	});
</script>

<div class="preview-container">
	{#if mode === 'html'}
		<div class="html-preview">
			{@html htmlPreview}
		</div>
	{:else if mode === 'quillmark'}
		{#if loading}
			<div class="loading">Rendering preview...</div>
		{:else if error}
			<div class="error">{error}</div>
		{:else if renderFormat === 'svg'}
			<div class="svg-preview">
				{@html renderData}
			</div>
		{:else if renderFormat === 'pdf' && objectUrl}
			<embed
				src={objectUrl}
				type="application/pdf"
				class="pdf-preview"
				aria-label="PDF preview"
			/>
		{/if}
	{/if}
</div>

<style>
	/* ... existing styles ... */

	.svg-preview {
		width: 100%;
		height: 100%;
		overflow: auto;
	}

	.pdf-preview {
		width: 100%;
		height: 100%;
		border: none;
	}

	.loading,
	.error {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-muted-foreground);
	}

	.error {
		color: var(--color-destructive);
	}
</style>
````

### 5. Update Preview Component Tests

**File:** `src/lib/components/Preview/MarkdownPreview.svelte.test.ts`

Add tests for new functionality:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import MarkdownPreview from './MarkdownPreview.svelte';
import * as quillmarkService from '$lib/services/quillmark';

// Mock the service
vi.mock('$lib/services/quillmark', () => ({
	quillmarkService: {
		renderForPreview: vi.fn(),
		isReady: vi.fn(() => true)
	},
	QuillmarkError: class QuillmarkError extends Error {
		code: string;
		constructor(code: string, message: string) {
			super(message);
			this.code = code;
		}
	}
}));

describe('MarkdownPreview - Quillmark Mode', () => {
	it('renders HTML mode by default', () => {
		const { container } = render(MarkdownPreview, {
			props: { markdown: '# Hello' }
		});
		expect(container.querySelector('.html-preview')).toBeTruthy();
	});

	it('renders SVG when format is svg', async () => {
		vi.mocked(quillmarkService.quillmarkService.renderForPreview).mockResolvedValue({
			format: 'svg',
			data: '<svg>test</svg>'
		});

		const { container } = render(MarkdownPreview, {
			props: {
				markdown: '# Test',
				mode: 'quillmark',
				quillName: 'taro'
			}
		});

		// Wait for render
		await vi.waitFor(() => {
			expect(container.querySelector('.svg-preview')).toBeTruthy();
		});
	});

	it('renders PDF embed when format is pdf', async () => {
		const blob = new Blob(['pdf content'], { type: 'application/pdf' });
		vi.mocked(quillmarkService.quillmarkService.renderForPreview).mockResolvedValue({
			format: 'pdf',
			data: blob
		});

		const { container } = render(MarkdownPreview, {
			props: {
				markdown: '# Test',
				mode: 'quillmark',
				quillName: 'usaf_memo'
			}
		});

		await vi.waitFor(() => {
			expect(container.querySelector('.pdf-preview')).toBeTruthy();
		});
	});

	it('shows error on render failure', async () => {
		vi.mocked(quillmarkService.quillmarkService.renderForPreview).mockRejectedValue(
			new Error('Render failed')
		);

		const { container } = render(MarkdownPreview, {
			props: {
				markdown: '# Test',
				mode: 'quillmark',
				quillName: 'invalid'
			}
		});

		await vi.waitFor(() => {
			expect(container.querySelector('.error')).toBeTruthy();
		});
	});
});
```

### 6. Update Service Unit Tests

**File:** `src/lib/services/quillmark/quillmark.test.ts`

Add tests for the new method:

```typescript
describe('QuillmarkService.renderForPreview', () => {
	it('returns SVG format and data when backend outputs SVG', async () => {
		const mockResult: RenderResult = {
			artifacts: [{ bytes: new Uint8Array(), mimeType: 'image/svg+xml' }],
			outputFormat: 'svg'
		};

		vi.mocked(exporters.render).mockReturnValue(mockResult);
		vi.mocked(exporters.toSvgString).mockReturnValue('<svg>test</svg>');

		const result = await service.renderForPreview('# Test', 'taro');

		expect(result.format).toBe('svg');
		expect(result.data).toBe('<svg>test</svg>');
		expect(exporters.render).toHaveBeenCalledWith(
			expect.anything(),
			'# Test',
			{ quill: 'taro' } // No format specified
		);
	});

	it('returns PDF format and blob when backend outputs PDF', async () => {
		const mockResult: RenderResult = {
			artifacts: [{ bytes: new Uint8Array(), mimeType: 'application/pdf' }],
			outputFormat: 'pdf'
		};
		const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });

		vi.mocked(exporters.render).mockReturnValue(mockResult);
		vi.mocked(exporters.toBlob).mockReturnValue(mockBlob);

		const result = await service.renderForPreview('# Test', 'usaf_memo');

		expect(result.format).toBe('pdf');
		expect(result.data).toBe(mockBlob);
		expect(exporters.render).toHaveBeenCalledWith(
			expect.anything(),
			'# Test',
			{ quill: 'usaf_memo' } // No format specified
		);
	});

	it('throws error for unsupported output format', async () => {
		const mockResult: any = {
			artifacts: [],
			outputFormat: 'txt' // Unsupported
		};

		vi.mocked(exporters.render).mockReturnValue(mockResult);

		await expect(service.renderForPreview('# Test', 'taro')).rejects.toThrow(
			'Unsupported output format'
		);
	});
});
```

### 7. Lint and Format

Run linting and formatting on all modified files:

```bash
npm run format
npm run lint
```

Fix any issues.

### 8. Build and Test

Run full build and test suite:

```bash
npm run check        # Type checking
npm run test:unit    # Unit tests
npm run build        # Production build
```

Verify all tests pass and build succeeds.

## Success Criteria

- ✅ `renderForPreview()` method added to QuillmarkService
- ✅ Method calls `exporters.render()` without format specification
- ✅ Dynamically handles SVG and PDF output formats
- ✅ Uses `exporters.toBlob()` for PDF
- ✅ Uses `exporters.toSvgString()` for SVG
- ✅ MarkdownPreview component supports Quillmark mode
- ✅ SVG previews display inline
- ✅ PDF previews display in embed element
- ✅ Loading states shown during render
- ✅ Errors handled gracefully
- ✅ Unit tests pass
- ✅ TypeScript compilation succeeds
- ✅ Linting passes
- ✅ Build succeeds

## Design Decisions Summary

### 1. Why No Format Specification for Preview?

**Decision:** Call `exporters.render(engine, markdown, { quill })` without `format` option.

**Rationale:**

- Allows backend to choose optimal format (Typst → SVG, PDF → PDF)
- Simplifies service code (no backend capability tracking)
- Future-proof (new backends can define their own defaults)
- Better UX (always get best preview format automatically)

**Alternative Considered:** Always request SVG and fallback to PDF if unsupported.
**Rejected because:** Requires backend capability detection and more complex logic.

### 2. Why toBlob() Instead of Direct Uint8Array?

**Decision:** Use `exporters.toBlob()` and `exporters.toSvgString()` for data conversion.

**Rationale:**

- Stable public API (less likely to break)
- Handles MIME types correctly
- Properly decodes UTF-8 SVG content
- Type-safe return values
- Consistent with library design

**Alternative Considered:** Access `result.artifacts[0].bytes` directly.
**Rejected because:** Fragile, requires manual decoding, assumes single artifact.

### 3. Why Dynamic Format Handling?

**Decision:** Return `{ format, data }` object with union type for data.

**Rationale:**

- UI can adapt to actual output format
- Supports different backends with different capabilities
- Explicit format information prevents assumptions
- Type-safe with discriminated union

**Alternative Considered:** Always convert to single format (e.g., SVG only).
**Rejected because:** Not all backends support SVG, limits flexibility.

## Non-Goals

The following are explicitly **out of scope** for this implementation:

- ❌ UI for mode selection (HTML vs Quillmark)
- ❌ UI for template selection
- ❌ State persistence (localStorage)
- ❌ Export/download buttons
- ❌ Cache optimization
- ❌ Side-by-side comparison view
- ❌ Custom styling for SVG
- ❌ Print preview functionality

These features may be added in future iterations.

## References

- [Quillmark Preview Design](../designs/quillmark/PREVIEW.md)
- [Quillmark Service Design](../designs/quillmark/SERVICE.md)
- [Quillmark Integration Design](../designs/quillmark/INTEGRATION.md)
- [@quillmark-test/web API Docs](https://www.npmjs.com/package/@quillmark-test/web)
- [RenderResult Type Definition](../../node_modules/@quillmark-test/web/dist/lib/types.d.ts)
- [Exporters API](../../node_modules/@quillmark-test/web/dist/lib/exporters.d.ts)

---

_Document Status: Ready for Implementation_
