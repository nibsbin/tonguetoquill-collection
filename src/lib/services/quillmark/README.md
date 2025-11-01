# Quillmark Service

Service for managing Quillmark WASM engine and rendering markdown documents to PDF/SVG.

## Overview

The Quillmark service provides a singleton interface to the Quillmark WASM rendering engine. It handles:

- Loading and initializing the Quillmark engine
- Preloading all available Quill templates
- Rendering markdown to PDF and SVG
- Downloading rendered documents

## Usage

### Initialization

Initialize the service once on application load:

```typescript
import { quillmarkService } from '$lib/services/quillmark';
import { onMount } from 'svelte';

onMount(async () => {
	try {
		await quillmarkService.initialize();
		console.log('Quillmark ready!');
	} catch (error) {
		console.error('Failed to initialize Quillmark:', error);
	}
});
```

### Check Readiness

```typescript
if (quillmarkService.isReady()) {
	// Service is ready to use
}
```

### List Available Quills

```typescript
const quills = quillmarkService.getAvailableQuills();
// Returns: [
//   { name: 'taro', description: '...', backend: 'typst', exampleFile: 'taro.md' },
//   { name: 'usaf_memo', description: '...', backend: 'typst', exampleFile: 'usaf_memo.md' },
//   ...
// ]
```

### Render to PDF

```typescript
try {
	const pdfBlob = await quillmarkService.renderToPDF(markdown, 'usaf_memo');
	// Use blob for preview or download
} catch (error) {
	console.error('Render failed:', error);
}
```

### Render to SVG

```typescript
try {
	const svgString = await quillmarkService.renderToSVG(markdown, 'taro');
	// Display SVG in preview pane
	previewElement.innerHTML = svgString;
} catch (error) {
	console.error('Render failed:', error);
}
```

### Download Document

```typescript
try {
	await quillmarkService.downloadDocument(markdown, 'usaf_memo', 'my-memo.pdf', 'pdf');
} catch (error) {
	console.error('Download failed:', error);
}
```

## Error Handling

The service throws `QuillmarkError` with specific error codes:

- `not_initialized` - Service not initialized, call `initialize()` first
- `quill_not_found` - Requested Quill template doesn't exist
- `render_error` - Error during rendering
- `load_error` - Error loading Quills or initializing engine

```typescript
import { QuillmarkError } from '$lib/services/quillmark';

try {
	await quillmarkService.renderToPDF(markdown, 'invalid');
} catch (error) {
	if (error instanceof QuillmarkError) {
		switch (error.code) {
			case 'not_initialized':
				console.error('Service not ready');
				break;
			case 'quill_not_found':
				console.error('Invalid template');
				break;
			case 'render_error':
				console.error('Rendering failed');
				break;
		}
	}
}
```

## API Reference

### `initialize(): Promise<void>`

Initialize the service by loading manifest and preloading all Quills. Must be called before any other methods.

**Throws:** `QuillmarkError` with code `load_error` if initialization fails.

### `isReady(): boolean`

Check if service is initialized and ready to render documents.

**Returns:** `true` if ready, `false` otherwise.

### `getAvailableQuills(): QuillMetadata[]`

Get list of available Quill templates.

**Returns:** Array of `QuillMetadata` objects.

**Throws:** `QuillmarkError` with code `not_initialized` if service not initialized.

### `renderToPDF(markdown: string, quillName: string): Promise<Blob>`

Render markdown content to PDF blob.

**Parameters:**

- `markdown` - Markdown content with frontmatter
- `quillName` - Name of Quill template (e.g., 'usaf_memo')

**Returns:** Promise resolving to PDF `Blob`.

**Throws:** `QuillmarkError` if not initialized, Quill not found, or render fails.

### `renderToSVG(markdown: string, quillName: string): Promise<string>`

Render markdown content to SVG string.

**Parameters:**

- `markdown` - Markdown content with frontmatter
- `quillName` - Name of Quill template (e.g., 'taro')

**Returns:** Promise resolving to SVG string.

**Throws:** `QuillmarkError` if not initialized, Quill not found, or render fails.

### `downloadDocument(markdown: string, quillName: string, filename: string, format: RenderFormat): Promise<void>`

Render and download document to user's file system.

**Parameters:**

- `markdown` - Markdown content with frontmatter
- `quillName` - Name of Quill template
- `filename` - Output filename (e.g., 'memo.pdf')
- `format` - Output format ('pdf' or 'svg')

**Throws:** `QuillmarkError` if not initialized, Quill not found, or render fails.

## Types

### `QuillMetadata`

```typescript
interface QuillMetadata {
	name: string;
	description: string;
	backend: string;
	exampleFile: string;
}
```

### `QuillmarkError`

```typescript
class QuillmarkError extends Error {
	code: 'not_initialized' | 'quill_not_found' | 'render_error' | 'load_error';
}
```

### `RenderFormat`

```typescript
type RenderFormat = 'pdf' | 'svg';
```

## Design Decisions

### Singleton Pattern

The service uses a singleton to ensure only one Quillmark engine instance exists per application lifecycle. This:

- Avoids re-initializing the WASM engine
- Maintains consistent Quill state
- Simplifies service usage

### Preloading

All Quills are preloaded during initialization rather than lazy-loaded:

- Eliminates render-time delays when switching templates
- Simplifies code (no lazy-loading logic)
- Acceptable cost (~2-3MB for current Quills)

### No Registry Duplication

The service delegates Quill registration to the Quillmark engine's internal registry:

- Follows DRY principle
- Engine is single source of truth for loaded Quills
- Manifest provides metadata only

## References

- Design: [prose/designs/quillmark/INTEGRATION.md](../../../prose/designs/quillmark/INTEGRATION.md)
- Design: [prose/designs/quillmark/SERVICE.md](../../../prose/designs/quillmark/SERVICE.md)
- Plan: [prose/plans/quillmark-integration.md](../../../prose/plans/quillmark-integration.md)
- [@quillmark-test/web NPM](https://www.npmjs.com/package/@quillmark-test/web)
- [Quillmark Docs](https://quillmark.readthedocs.io/en/latest/)
