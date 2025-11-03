# Quillmark Preview Integration

This document describes the integration of live Quillmark rendering into the Preview component.

> **Related**:
>
> - [SERVICE.md](./SERVICE.md) for service API
> - [INTEGRATION.md](./INTEGRATION.md) for overall architecture

## Overview

The Preview component displays live Quillmark rendering with **automatic backend detection** based on document content. The preview displays professional PDF/SVG output determined by the document's frontmatter, providing a true WYSIWYG experience for document creation.

## Architecture

### Component Responsibilities

**Preview Component:**

- Display rendered output (SVG or PDF embed)
- Handle loading/error states
- Debounce rendering to avoid excessive updates

**QuillmarkService:**

- Render markdown using Quillmark engine
- **Auto-detect backend and quill from document frontmatter (QUILL field)**
- Auto-detect optimal preview format (SVG or PDF)
- Return RenderResult with format and artifacts

### Preview Layout

```
┌──────────────────────────────────────────┐
│         Preview                          │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │
│  │   Rendered Content                 │ │
│  │   (SVG / PDF)                      │ │
│  │   Auto-detected backend            │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

## Rendering Flow

```
markdown
  │
  ├─> quillmarkService.renderForPreview(markdown)
  │   │
  │   ├─> Engine auto-detects backend and quill from document frontmatter
  │   └─> Backend auto-selects format (SVG/PDF)
  │   └─> Returns RenderResult
  │
  ├─> Check result.outputFormat
  │   ├─> if 'svg': Use resultToSVGPages(result) to get array of SVG strings
  │   └─> if 'pdf': Use resultToBlob(result) to get Blob
  │
  └─> Update preview element
```

### Auto-Detection

The service calls `exporters.render(engine, markdown, {})` **without** specifying a quill name or format. The Quillmark engine:

1. **Auto-detects backend and quill** from document frontmatter (QUILL field in YAML)
2. **Auto-selects format** based on backend capabilities:
   - **Typst backend**: Defaults to SVG (optimal for inline preview)
   - **PDF backend**: Defaults to PDF (only supported format)
   - **Future backends**: May support other formats

The service returns a `RenderResult` object where:

- `outputFormat`: 'pdf' | 'svg' (indicates the format chosen by backend)
- `artifacts`: Array of artifacts (one per page for SVG, one for PDF)

Components use helper functions to convert:
- `resultToBlob(result)`: Convert to Blob (for PDF)
- `resultToSVGPages(result)`: Get array of SVG strings (one per page)

## Component Interface

### Props

```typescript
interface PreviewProps {
	/** Markdown content to preview */
	markdown: string;
}
```

### State

```typescript
interface PreviewState {
	loading: boolean;
	error: ErrorDisplayState | null;
	renderResult: RenderResult | null;
	lastSuccessfulResult: RenderResult | null;
	pdfObjectUrl: string | null;
	lastSuccessfulPdfUrl: string | null;
	svgPages: string[];
	lastSuccessfulSvgPages: string[];
}
```

## Display Strategy

### SVG Display

SVG content is injected directly into the DOM, with support for multi-page documents:

```svelte
{#if renderResult?.outputFormat === 'svg'}
	<div class="svg-preview">
		{#each svgPages as page}
			<div class="svg-page">
				{@html page}
			</div>
		{/each}
	</div>
{/if}
```

**Advantages:**

- Inline rendering (no external resources)
- Scales perfectly
- Fast display
- Supports CSS styling

**Security Note:** SVG is from trusted Quillmark engine, not user input. Safe to render with `@html`.

### PDF Display

PDF blob is displayed using `<embed>` element:

```svelte
{#if renderResult?.outputFormat === 'pdf' && pdfObjectUrl}
	<embed
		src={pdfObjectUrl}
		type="application/pdf"
		class="pdf-preview"
		aria-label="PDF preview"
	/>
{/if}
```

**Advantages:**

- Browser's native PDF viewer
- Zoom and navigation controls
- Print support
- Accessibility features

**Cleanup:** Revoke object URL when component unmounts or data changes.

## Performance Optimization

### Debouncing

Quillmark rendering can be expensive. Apply debouncing to avoid excessive re-renders:

```typescript
const debouncedRender = debounce(async () => {
	await renderQuillmark();
}, 50);
```

### Loading States

Show loading indicator during render:

```svelte
{#if loading}
	<div class="loading-spinner">Rendering preview...</div>
{/if}
```

**Progressive Enhancement:**

- Show previous render while new render loads
- Fade transition between renders
- Cancel in-flight renders on new input

## Error Handling

### Render Errors

```typescript
try {
	const result = await quillmarkService.renderForPreview(markdown);
	// Process result
} catch (error) {
	if (error instanceof QuillmarkError) {
		if (error.diagnostic) {
			// Display detailed diagnostic information
			errorDisplay = {
				code: error.diagnostic.code,
				message: error.diagnostic.message,
				hint: error.diagnostic.hint,
				location: error.diagnostic.location,
				sourceChain: error.diagnostic.sourceChain
			};
		} else {
			// Display simple error message
			errorDisplay = { message: error.message };
		}
	}
}
```

### Fallback Strategy

If Quillmark rendering fails:

1. Display error message in preview pane with diagnostic details (if available)
2. Show previous successful render (if available)
3. Allow user to fix markdown
4. Don't crash the entire component

## User Experience

### Backend Detection

The backend and quill are automatically detected from the document's frontmatter:

```markdown
---
QUILL: usaf_memo
---

# Document Content
```

The `QUILL` field in the frontmatter determines which quill template to use. No manual template selection is needed in the UI.

## Integration Points

### 1. Service Initialization

Ensure Quillmark service is initialized before rendering:

```typescript
onMount(async () => {
	if (!quillmarkService.isReady()) {
		try {
			await quillmarkService.initialize();
		} catch (error) {
			console.error('Quillmark initialization failed:', error);
			errorDisplay = { message: 'Failed to initialize preview. Please refresh.' };
		}
	}
});
```

### 2. Editor Integration

Preview receives markdown from the editor:

```svelte
<MarkdownEditor {markdown} on:change={(e) => (markdown = e.detail)} />
<Preview {markdown} />
```

## Accessibility

### Screen Reader Support

```svelte
<div role="region" aria-label="Document preview" aria-live="polite" aria-busy={loading}>
	<!-- Preview content -->
</div>
```

**Announcements:**

- "Rendering preview..." when loading
- "Preview updated" when render completes
- "Preview failed: [error]" on error

### Keyboard Navigation

- Template selector: Accessible via Tab, changed with Arrow keys
- Preview content: Scrollable with keyboard (arrow keys, Page Up/Down)

### PDF Accessibility

Native `<embed>` element provides:

- Text extraction for screen readers
- Keyboard navigation within PDF
- Zoom controls accessible via keyboard

## Mobile Considerations

### Touch Optimization

- Template selector: Native select on mobile for better UX
- PDF viewer: Pinch-to-zoom support (native)
- SVG preview: Scrollable, no pinch-zoom (maintains layout)

### Performance

- Consider disabling Quillmark preview on slow devices
- Show warning if render takes >2 seconds
- Allow canceling long-running renders

## Testing Strategy

### Unit Tests

**Preview Component:**

- Calls service with correct parameters
- Displays SVG and PDF correctly
- Handles multi-page SVG documents
- Handles loading states
- Shows error messages with diagnostic details on failure
- Debounces render calls
- Cleans up PDF object URLs properly

**Mock Service:**

- Mock `quillmarkService.renderForPreview()` in tests
- Test both SVG and PDF return formats
- Test multi-page SVG handling
- Simulate errors and timeouts
- Test diagnostic information display

### Integration Tests

**Full Workflow:**

1. Initialize Quillmark service
2. Type markdown in editor with QUILL frontmatter
3. Verify preview updates after debounce
4. Verify correct format displayed based on backend

### Visual Regression

- Screenshot tests for SVG rendering
- PDF embed rendering comparison
- Error state UI
- Loading state UI

## Future Enhancements

### Post-MVP Features

**Export Button:**

- Add "Export to PDF" button in preview pane
- Calls `quillmarkService.downloadDocument()`
- Saves rendered document to file system

**Print Preview:**

- Print button triggers browser print dialog
- PDF prints directly
- SVG renders to print-optimized PDF first

**Custom Styles:**

- Apply CSS to SVG preview
- Override colors for dark mode
- Custom font loading

## References

- [Quillmark Service Design](./SERVICE.md)
- [Integration Architecture](./INTEGRATION.md)
- [Preview Component](../frontend/UI_COMPONENTS.md)
- [Preview Component Current Implementation](../../../src/lib/components/Preview/Preview.svelte)
- [Quillmark Service Implementation](../../../src/lib/services/quillmark/service.ts)
- [@quillmark-test/web Exporters API](https://www.npmjs.com/package/@quillmark-test/web)

---

_Document Status: Implemented - Reflects Current Codebase_
