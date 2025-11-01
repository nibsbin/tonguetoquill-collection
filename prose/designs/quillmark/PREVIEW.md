# Quillmark Preview Integration

This document describes the integration of live Quillmark rendering into the Preview component.

> **Related**:
>
> - [SERVICE.md](./SERVICE.md) for service API
> - [INTEGRATION.md](./INTEGRATION.md) for overall architecture

## Overview

The Preview component will be enhanced to support live Quillmark rendering. The preview will display professional PDF/SVG output with **automatic backend detection** based on document content, providing a true WYSIWYG experience for document creation.

## Architecture

### Component Responsibilities

**Preview Component:**

- Display rendered output (SVG or PDF embed)
- Handle loading/error states
- Debounce rendering to avoid excessive updates

**QuillmarkService:**

- Render markdown using Quillmark engine
- **Auto-detect appropriate backend from document content**
- Auto-detect optimal preview format (SVG or PDF)
- Return format + data for flexible display

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
  │   ├─> Engine auto-detects backend from content
  │   └─> Backend auto-selects format (SVG/PDF)
  │
  ├─> Check result.format
  │   ├─> if 'svg': Display inline SVG
  │   └─> if 'pdf': Display in <embed> or <iframe>
  │
  └─> Update preview element
```

### Auto-Detection

The service calls `exporters.render(engine, markdown, {})` **without** specifying a quill name or format. The Quillmark engine:

1. **Auto-detects backend** based on document content markers
2. **Auto-selects format** based on backend capabilities:
   - **Typst backend**: Defaults to SVG (optimal for inline preview)
   - **PDF backend**: Defaults to PDF (only supported format)
   - **Future backends**: May support other formats

The service returns `{ format, data }` where:

- `format`: 'pdf' | 'svg' (from `RenderResult.outputFormat`)
- `data`: `Blob` (for PDF) or `string` (for SVG)

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
	// Display result
} catch (error) {
	if (error instanceof QuillmarkError) {
		switch (error.code) {
			case 'not_initialized':
				showError('Preview unavailable. Please refresh.');
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
2. Keep template selector enabled
3. Allow user to change templates or fix markdown
4. Don't crash the entire component

## User Experience

### Template Selection

Template selector for choosing the Quill template:

```svelte
<select bind:value={quillName}>
	{#each availableQuills as quill}
		<option value={quill.name}>{quill.description}</option>
	{/each}
</select>
```

**Template List:**

- Fetched from `quillmarkService.getAvailableQuills()`
- Show description for clarity
- Default to first available template

### State Persistence

Remember user's template selection:

```typescript
// Save to localStorage
localStorage.setItem('preview-quill', quillName);

// Restore on mount
onMount(() => {
	quillName = localStorage.getItem('preview-quill') ?? availableQuills[0]?.name;
});
```

## Integration Points

### 1. Service Initialization

Ensure Quillmark service is initialized before rendering:

```typescript
onMount(async () => {
	if (!quillmarkService.isReady()) {
		try {
			await quillmarkService.initialize();
			availableQuills = quillmarkService.getAvailableQuills();
		} catch (error) {
			console.error('Quillmark initialization failed:', error);
			showError('Failed to initialize preview. Please refresh.');
		}
	}
});
```

### 2. Editor Integration

Preview receives markdown from the editor:

```svelte
<MarkdownEditor {markdown} on:change={(e) => (markdown = e.detail)} />
<Preview {markdown} quillName="usaf_memo" />
```

### 3. TopMenu Integration

Show template selector in TopMenu:

```svelte
<!-- TopMenu.svelte -->
<Select bind:value={selectedQuill}>
	{#each quills as quill}
		<option value={quill.name}>{quill.description}</option>
	{/each}
</Select>
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
- Handles loading states
- Shows error messages on failure
- Debounces render calls
- Switches templates correctly

**Mock Service:**

- Mock `quillmarkService.renderForPreview()` in tests
- Test both SVG and PDF return formats
- Simulate errors and timeouts

### Integration Tests

**Full Workflow:**

1. Initialize Quillmark service
2. Select template
3. Type markdown in editor
4. Verify preview updates after debounce
5. Verify correct format displayed

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
- [@quillmark-test/web Exporters API](https://www.npmjs.com/package/@quillmark-test/web)

---

_Document Status: Draft - Pending Implementation_
