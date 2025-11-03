# Quillmark Service

This document defines the QuillmarkService implementation for managing Quillmark WASM engine and Quill templates.

> **Related**: [INTEGRATION.md](./INTEGRATION.md) for overall integration architecture

## Service Contract

The QuillmarkService provides a typed interface for Quillmark operations.

### Core Interface

```typescript
interface QuillmarkService {
	/**
	 * Initialize the service by loading the Quillmark engine and preloading all Quills
	 * Should be called once on application load
	 */
	initialize(): Promise<void>;

	/**
	 * Check if service is initialized and ready
	 */
	isReady(): boolean;

	/**
	 * Get list of available Quills
	 */
	getAvailableQuills(): QuillMetadata[];

	/**
	 * Render markdown to PDF blob
	 * @param markdown - Markdown content to render
	 * @param quillName - Name of Quill template to use
	 * @returns PDF blob
	 */
	renderToPDF(markdown: string, quillName: string): Promise<Blob>;

	/**
	 * Render markdown for preview with auto-detected format and backend
	 * Does not specify quill or output format - allows engine to auto-detect based on content
	 * @param markdown - Markdown content to render
	 * @returns RenderResult from Quillmark engine
	 */
	renderForPreview(markdown: string): Promise<RenderResult>;

	/**
	 * Download rendered document
	 * @param markdown - Markdown content to render
	 * @param quillName - Name of Quill template to use
	 * @param filename - Output filename
	 * @param format - Output format (pdf or svg)
	 */
	downloadDocument(
		markdown: string,
		quillName: string,
		filename: string,
		format: 'pdf' | 'svg'
	): Promise<void>;
}
```

### Supporting Types

```typescript
/**
 * Quill metadata from manifest
 */
interface QuillMetadata {
	name: string;
	description: string;
	backend: string;
	exampleFile: string;
}

/**
 * Quill manifest structure
 */
interface QuillManifest {
	quills: QuillMetadata[];
}

/**
 * Quillmark service errors
 */
class QuillmarkError extends Error {
	code: 'not_initialized' | 'quill_not_found' | 'render_error' | 'load_error';
	constructor(code: string, message: string);
}
```

## Implementation

### File Location

```
src/lib/services/quillmark/
├── index.ts              # Service exports
├── types.ts              # TypeScript types and interfaces
├── service.ts            # QuillmarkService implementation
├── quillmark.test.ts     # Unit tests
└── README.md             # Service documentation
```

### Singleton Pattern

The service uses a singleton pattern to ensure only one Quillmark engine instance exists:

```typescript
class QuillmarkServiceImpl implements QuillmarkService {
	private static instance: QuillmarkServiceImpl | null = null;
	private engine: Quillmark | null = null;
	private manifest: QuillManifest | null = null;
	private initialized = false;

	private constructor() {}

	static getInstance(): QuillmarkServiceImpl {
		if (!QuillmarkServiceImpl.instance) {
			QuillmarkServiceImpl.instance = new QuillmarkServiceImpl();
		}
		return QuillmarkServiceImpl.instance;
	}

	async initialize(): Promise<void> {
		if (this.initialized) return;

		// Load manifest
		this.manifest = await this.loadManifest();

		// Create engine
		this.engine = new Quillmark();

		// Preload all Quills
		await this.preloadQuills();

		this.initialized = true;
	}

	// ... other methods
}

// Export singleton instance
export const quillmarkService = QuillmarkServiceImpl.getInstance();
```

### Initialization Flow

```
initialize()
  │
  ├─> loadManifest()
  │   └─> fetch('static/quills/manifest.json')
  │
  ├─> new Quillmark()
  │
  └─> preloadQuills()
      └─> for each quill in manifest:
          ├─> fetch(`static/quills/${quill.name}.zip`)
          ├─> loaders.fromZip(zipBlob)
          └─> engine.registerQuill(quillJson)
```

### Render Flow

**Explicit Format Rendering (Download):**

```
renderToPDF(markdown, quillName)
  │
  ├─> validateInitialized()
  ├─> validateQuillExists(quillName)
  │
  └─> exporters.render(engine, markdown, {
        quillName: quillName,
        format: 'pdf'
      })
```

**Auto-Format Rendering (Preview):**

```
renderForPreview(markdown)
  │
  ├─> validateInitialized()
  │
  └─> exporters.render(engine, markdown, {
        // No quillName or format specified - engine auto-detects backend
      })
      └─> Returns RenderResult with outputFormat and artifacts
```

### Error Handling

The service implements defensive error handling:

1. **Not Initialized**: Throw `QuillmarkError` with code `not_initialized`
2. **Quill Not Found**: Throw `QuillmarkError` with code `quill_not_found`
3. **Render Errors**: Catch and wrap with code `render_error`
4. **Load Errors**: Catch and wrap with code `load_error`

Errors include descriptive messages for debugging.

## State Management

### Internal State

- `engine`: Quillmark WASM instance (null until initialized)
- `manifest`: Loaded manifest data (null until initialized)
- `initialized`: Boolean flag for initialization status

### State Validation

Methods validate state before executing:

```typescript
private validateInitialized(): void {
  if (!this.initialized || !this.engine) {
    throw new QuillmarkError('not_initialized', 'Service not initialized');
  }
}

private validateQuillExists(quillName: string): void {
  const exists = this.manifest?.quills.some(q => q.name === quillName);
  if (!exists) {
    throw new QuillmarkError('quill_not_found', `Quill "${quillName}" not found`);
  }
}
```

## Testing Strategy

### Unit Tests

Test file: `src/lib/services/quillmark/quillmark.test.ts`

**Test Cases:**

1. Singleton pattern enforcement
2. Initialization success path
3. Initialization error handling
4. Render methods require initialization
5. Render methods validate Quill existence
6. PDF rendering success
7. SVG rendering success
8. Download method invocation
9. Available Quills list retrieval

### Mock Strategy

Use vitest mocks for external dependencies:

- Mock `@quillmark-test/web` module
- Mock `fetch()` for manifest and zip files
- Verify proper delegation to Quillmark APIs

### Integration Tests

Integration tests are **out of scope** for this phase. The service relies on the `@quillmark-test/web` library being tested independently.

## Usage Examples

### Application Initialization

```typescript
// src/routes/+layout.svelte or +page.svelte
import { onMount } from 'svelte';
import { quillmarkService } from '$lib/services/quillmark';

onMount(async () => {
	try {
		await quillmarkService.initialize();
		console.log('Quillmark ready');
	} catch (error) {
		console.error('Failed to initialize Quillmark:', error);
	}
});
```

### Rendering Documents

```typescript
import { quillmarkService } from '$lib/services/quillmark';

// Render to PDF and download
async function downloadPDF() {
	try {
		await quillmarkService.downloadDocument(markdown, 'usaf_memo', 'my-memo.pdf', 'pdf');
	} catch (error) {
		console.error('Render failed:', error);
	}
}

// Render for preview with auto-detection
async function updatePreview() {
	try {
		const result = await quillmarkService.renderForPreview(markdown);
		
		if (result.outputFormat === 'pdf') {
			const blob = resultToBlob(result);
			const url = URL.createObjectURL(blob);
			embedElement.src = url;
		} else if (result.outputFormat === 'svg') {
			const pages = resultToSVGPages(result);
			// Display SVG pages
		}
	} catch (error) {
		console.error('Preview failed:', error);
	}
}
```

### Listing Available Quills

```typescript
import { quillmarkService } from '$lib/services/quillmark';

const quills = quillmarkService.getAvailableQuills();
// Returns: [
//   { name: 'taro', description: '...', backend: 'typst', exampleFile: 'taro.md' },
//   { name: 'usaf_memo', description: '...', backend: 'typst', exampleFile: 'usaf_memo.md' }
// ]
```

## Dependencies

### Runtime Dependencies

- `@quillmark-test/web`: Quillmark WASM bindings and utilities

### Type Dependencies

- TypeScript 5.x
- Vite types for static asset handling

## Constraints and Limitations

### Current Scope

- ✅ Single engine instance (singleton)
- ✅ Preload all Quills on initialization
- ✅ PDF rendering with explicit quill selection
- ✅ Auto-detection for preview (no quill selection needed)
- ✅ Download functionality
- ✅ Type-safe API
- ✅ Helper functions for RenderResult conversion

### Out of Scope

- ❌ Lazy loading of Quills (all preloaded)
- ❌ Dynamic Quill registration by users
- ❌ Server-side rendering (SSR)
- ❌ Quill unloading/cleanup
- ❌ Quill versioning
- ❌ Caching rendered outputs
- ❌ Background rendering workers

These features may be added in future iterations as needed.

## Design Decisions

### Why Singleton?

- **Simplicity**: Single source of truth for Quill state
- **Performance**: Avoid re-initializing WASM engine
- **Consistency**: All renders use same engine configuration

### Why Preload All Quills?

- **User Experience**: No delays when switching templates
- **Simplicity**: Avoid complex lazy-loading logic
- **Acceptable Cost**: ~3-5 Quills = ~1-2MB total (minimal)

### Why resultToBlob() and Helper Functions?

For preview rendering, we use different approaches for different formats:

**For PDF:**

- **API Stability**: `exporters.toBlob()` is stable public API
- **Type Safety**: Return type is properly typed (Blob)
- **MIME Type Handling**: toBlob() handles MIME type correctly
- **Future-proof**: Handles multi-artifact results if needed

**For SVG:**

- **Helper Functions**: Use `resultToSVGPages()` to get array of SVG strings (one per page)
- **Multi-page Support**: Handles documents with multiple pages correctly
- **TextDecoder + toArrayBuffer**: Uses `exporters.toArrayBuffer(artifact)` to get ArrayBuffer, then `TextDecoder` to decode to UTF-8 string
- **Standard API**: TextDecoder is a standard web API
- **Efficiency**: No unnecessary intermediate conversions

The service provides helper functions `resultToSVGPages()` and `artifactToSVGString()` for consumers to convert `RenderResult` artifacts to strings.

### Why Auto-Detect for Preview?

The `renderForPreview()` method doesn't specify a quill name or format, allowing the Quillmark engine to auto-detect based on document content:

- **Backend Intelligence**: Engine auto-detects backend from document frontmatter (QUILL field)
- **Format Selection**: Backend chooses optimal format (Typst→SVG, PDF backend→PDF)
- **Flexibility**: Different backends may support different formats
- **Performance**: Backend can choose most efficient format for preview
- **User Experience**: Always get the best preview format without manual selection
- **Simplicity**: No need to track backend capabilities in the service

Download methods still specify explicit format because users expect specific file types.

- **User Experience**: No delays when switching templates
- **Simplicity**: Avoid complex lazy-loading logic
- **Acceptable Cost**: ~3-5 Quills = ~1-2MB total (minimal)

### Why No SSR?

- **WASM Limitation**: Quillmark WASM designed for browser
- **Complexity**: Server rendering requires different architecture
- **MVP Scope**: Client-side rendering sufficient for initial release

### Why No Registry Duplication?

- **DRY Principle**: Quillmark engine maintains internal registry
- **Single Source**: Engine tracks registered Quills
- **Simplicity**: Manifest provides metadata, engine handles instances

## Future Considerations

Potential enhancements for future versions:

1. **Caching**: Cache rendered PDFs/SVGs to improve performance
2. **Workers**: Move rendering to Web Workers for better responsiveness
3. **Streaming**: Support rendering large documents in chunks
4. **SSR Support**: Add server-side rendering for initial page loads
5. **Custom Quills**: Allow users to upload and use custom templates

These should be evaluated based on user needs and performance data.

## References

- [@quillmark-test/web documentation](https://www.npmjs.com/package/@quillmark-test/web)
- [Quillmark WASM API](https://quillmark.readthedocs.io/en/latest/)
- [Frontend Architecture](../frontend/ARCHITECTURE.md)
- [Service Pattern](../backend/SERVICES.md)

---

_Document Status: Implemented - Reflects Current Codebase_
