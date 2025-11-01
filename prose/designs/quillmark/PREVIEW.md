# Quillmark Preview Integration

This document describes the integration of live Quillmark rendering into the MarkdownPreview component.

> **Related**:
>
> - [SERVICE.md](./SERVICE.md) for service API
> - [INTEGRATION.md](./INTEGRATION.md) for overall architecture

## Overview

The MarkdownPreview component will be enhanced to support live Quillmark rendering alongside the existing HTML markdown preview. Users can choose between:

1. **HTML Preview** (current): Fast, lightweight markdown-to-HTML rendering
2. **Quillmark Preview** (new): Professional PDF/SVG output using Quill templates

## Architecture

### Component Responsibilities

**MarkdownPreview Component:**

- Render mode selection (HTML vs Quillmark)
- Quill template selection (when in Quillmark mode)
- Display rendered output (HTML, SVG, or PDF embed)
- Handle loading/error states
- Debounce rendering to avoid excessive updates

**QuillmarkService:**

- Render markdown using Quillmark engine
- Auto-detect optimal preview format (SVG or PDF)
- Return format + data for flexible display

### Preview Modes

```
┌──────────────────────────────────────────┐
│         MarkdownPreview                  │
│                                          │
│  Mode: [HTML] [Quillmark ▼]             │
│  Template: [usaf_memo ▼]  (if Quillmark)│
│                                          │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │
│  │   Rendered Content                 │ │
│  │   (HTML / SVG / PDF)               │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

## Rendering Flow

### HTML Mode (Current)

```
markdown
  │
  ├─> marked.parse(markdown)
  │
  └─> {@html htmlString}
```

### Quillmark Mode (New)

```
markdown + quillName
  │
  ├─> quillmarkService.renderForPreview(markdown, quillName)
  │
  ├─> Check result.format
  │   ├─> if 'svg': Display inline SVG
  │   └─> if 'pdf': Display in <embed> or <iframe>
  │
  └─> Update preview element
```

### Auto-Format Detection

The service calls `exporters.render(engine, markdown, { quill: quillName })` **without** specifying a format. The Quillmark backend automatically chooses:

- **Typst backend**: Defaults to SVG (optimal for inline preview)
- **PDF backend**: Defaults to PDF (only supported format)
- **Future backends**: May support other formats

The service returns `{ format, data }` where:

- `format`: 'pdf' | 'svg' (from `RenderResult.outputFormat`)
- `data`: `Blob` (for PDF) or `string` (for SVG)

## Component Interface

### Props

```typescript
interface MarkdownPreviewProps {
	/** Markdown content to preview */
	markdown: string;

	/** Preview mode */
	mode?: 'html' | 'quillmark';

	/** Quill template name (required when mode='quillmark') */
	quillName?: string;
}
```

### State

```typescript
interface PreviewState {
	mode: 'html' | 'quillmark';
	quillName: string | null;
	loading: boolean;
	error: string | null;
	renderFormat: 'pdf' | 'svg' | null;
	renderData: Blob | string | null;
}
```

## Display Strategy

### SVG Display

SVG content is injected directly into the DOM:

```svelte
{#if renderFormat === 'svg'}
	<div class="svg-preview">
		{@html renderData}
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
{#if renderFormat === 'pdf'}
	<embed
		src={URL.createObjectURL(renderData)}
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

Quillmark rendering is more expensive than HTML rendering. Apply debouncing:

```typescript
const debouncedRender = debounce(async () => {
	await renderQuillmark();
}, 300); // 300ms delay
```

**Strategy:**

- **HTML mode**: Fast, minimal debounce (50ms)
- **Quillmark mode**: Slower, longer debounce (300ms)

### Caching

Cache rendered output to avoid re-rendering identical content:

```typescript
const renderCache = new Map<string, RenderResult>();
const cacheKey = `${quillName}:${markdown.slice(0, 100)}:${markdown.length}`;

if (renderCache.has(cacheKey)) {
	return renderCache.get(cacheKey);
}
```

**Cache Invalidation:**

- Clear on quill change
- Clear on markdown change (detected via cache key)
- LRU eviction if cache grows too large (e.g., >10 entries)

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
	const result = await quillmarkService.renderForPreview(markdown, quillName);
	// Display result
} catch (error) {
	if (error instanceof QuillmarkError) {
		switch (error.code) {
			case 'not_initialized':
				showError('Preview unavailable. Please refresh.');
				break;
			case 'quill_not_found':
				showError('Invalid template selected.');
				break;
			case 'render_error':
				showError('Failed to render preview. Check document syntax.');
				break;
		}
	}
}
```

### Fallback Strategy

If Quillmark rendering fails:

1. Show error message in preview pane
2. Keep mode selector enabled
3. Allow switching back to HTML mode
4. Don't crash the entire component

## User Experience

### Mode Selection

Dropdown or toggle to switch between HTML and Quillmark modes:

```svelte
<select bind:value={mode}>
	<option value="html">HTML Preview</option>
	<option value="quillmark">Quillmark Preview</option>
</select>
```

### Template Selection

When in Quillmark mode, show template selector:

```svelte
{#if mode === 'quillmark'}
	<select bind:value={quillName}>
		{#each availableQuills as quill}
			<option value={quill.name}>{quill.description}</option>
		{/each}
	</select>
{/if}
```

**Template List:**

- Fetched from `quillmarkService.getAvailableQuills()`
- Show description for clarity
- Default to first available template

### State Persistence

Remember user's mode and template selection:

```typescript
// Save to localStorage
localStorage.setItem('preview-mode', mode);
localStorage.setItem('preview-quill', quillName);

// Restore on mount
onMount(() => {
	mode = localStorage.getItem('preview-mode') ?? 'html';
	quillName = localStorage.getItem('preview-quill') ?? null;
});
```

## Integration Points

### 1. Service Initialization

Ensure Quillmark service is initialized before enabling Quillmark mode:

```typescript
onMount(async () => {
	if (!quillmarkService.isReady()) {
		try {
			await quillmarkService.initialize();
			availableQuills = quillmarkService.getAvailableQuills();
			quillmarkAvailable = true;
		} catch (error) {
			console.error('Quillmark initialization failed:', error);
			quillmarkAvailable = false;
		}
	}
});
```

### 2. Editor Integration

MarkdownPreview receives markdown from the editor:

```svelte
<MarkdownEditor {markdown} on:change={(e) => (markdown = e.detail)} />
<MarkdownPreview {markdown} mode="quillmark" quillName="usaf_memo" />
```

### 3. TopMenu Integration

Show template selector in TopMenu when Quillmark mode is active:

```svelte
<!-- TopMenu.svelte -->
{#if previewMode === 'quillmark'}
	<Select bind:value={selectedQuill}>
		{#each quills as quill}
			<option value={quill.name}>{quill.description}</option>
		{/each}
	</Select>
{/if}
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

- Mode selector: Accessible via Tab, changed with Arrow keys
- Template selector: Accessible via Tab, changed with Arrow keys
- Preview content: Scrollable with keyboard (arrow keys, Page Up/Down)

### PDF Accessibility

Native `<embed>` element provides:

- Text extraction for screen readers
- Keyboard navigation within PDF
- Zoom controls accessible via keyboard

## Mobile Considerations

### Touch Optimization

- Mode selector: Large touch targets (44px minimum)
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

- Renders HTML mode correctly
- Switches to Quillmark mode when selected
- Calls service with correct parameters
- Displays SVG and PDF correctly
- Handles loading states
- Shows error messages on failure
- Debounces render calls

**Mock Service:**

- Mock `quillmarkService.renderForPreview()` in tests
- Test both SVG and PDF return formats
- Simulate errors and timeouts

### Integration Tests

**Full Workflow:**

1. Initialize Quillmark service
2. Switch to Quillmark mode
3. Select template
4. Type markdown in editor
5. Verify preview updates after debounce
6. Verify correct format displayed

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

**Side-by-Side Comparison:**

- Show HTML and Quillmark previews simultaneously
- Useful for debugging formatting differences

**Custom Styles:**

- Apply CSS to SVG preview
- Override colors for dark mode
- Custom font loading

## References

- [Quillmark Service Design](./SERVICE.md)
- [Integration Architecture](./INTEGRATION.md)
- [MarkdownPreview Component](../frontend/UI_COMPONENTS.md)
- [Preview Component Current Implementation](../../../src/lib/components/Preview/MarkdownPreview.svelte)
- [@quillmark-test/web Exporters API](https://www.npmjs.com/package/@quillmark-test/web)

---

_Document Status: Draft - Pending Implementation_
