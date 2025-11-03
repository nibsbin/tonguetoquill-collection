# Quillmark Web Integration

This document describes the integration of Quillmark WASM rendering engine into the Tonguetoquill web application.

> **Related**: [SERVICE.md](./SERVICE.md) for service implementation details

## Overview

Quillmark is a WASM-based document rendering engine that transforms markdown documents into PDF/SVG output using Quill templates (`.toml` + Typst glue files). This integration enables users to render their markdown documents with professional formatting templates.

**Key Goals:**

- Single Quillmark engine instance per page load (singleton pattern)
- Preload all available Quills from `static/quills/` on initialization
- Provide simple service API for document rendering
- Minimize duplication with Quillmark's internal registry

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────┐
│         Application Layer                   │
│  (Components, Pages, Stores)                │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│      QuillmarkService                       │
│  - Singleton engine instance                │
│  - Quill loading & preloading               │
│  - Render methods (PDF/SVG)                 │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│   @quillmark-test/web Library               │
│  - Quillmark WASM engine                    │
│  - loaders.fromZip()                        │
│  - exporters.render()                       │
└─────────────────────────────────────────────┘
```

### Data Flow

1. **Build Time**: Package Quills into `.zip` files in `static/quills/`
2. **App Load**: Service initializes, loads manifest, preloads all Quills
3. **Render Request**: Component calls service → service delegates to engine
4. **Output**: Service returns rendered blob (PDF) or SVG string

## Quill Management

### Source Location

Quill templates are maintained in the `tonguetoquill-collection` submodule:

```
tonguetoquill-collection/
└── quills/
    ├── taro/
    │   ├── Quill.toml
    │   ├── glue.typ
    │   └── assets/
    ├── usaf_memo/
    │   ├── Quill.toml
    │   ├── glue.typ
    │   ├── assets/
    │   └── packages/
    └── usaf_form_8/
        ├── Quill.toml
        └── form.pdf
```

### Build Process

A build script (`scripts/package-quills.js`) packages each Quill directory into a `.zip` file:

**Input**: `tonguetoquill-collection/quills/*`
**Output**: `static/quills/*.zip` + `static/quills/manifest.json`

**Manifest Format**:

```json
{
	"quills": [
		{
			"name": "taro",
			"description": "A simple document template for testing",
			"backend": "typst",
			"exampleFile": "taro.md"
		},
		{
			"name": "usaf_memo",
			"description": "Typesetted USAF Official Memorandum",
			"backend": "typst",
			"exampleFile": "usaf_memo.md"
		}
	]
}
```

The manifest is generated from each `Quill.toml` file during packaging.

### Runtime Loading

On application load, the QuillmarkService:

1. Fetches `static/quills/manifest.json`
2. Preloads all Quills listed in manifest
3. Uses `loaders.fromZip()` to load each `.zip` file
4. Registers each Quill with the singleton engine via `engine.registerQuill()`

## Service Design

See [SERVICE.md](./SERVICE.md) for complete service API and implementation details.

**Key Principles:**

- **Singleton Engine**: One `Quillmark()` instance per application lifecycle
- **Preloading**: All Quills loaded upfront to avoid render-time delays
- **Delegation**: Delegate to Quillmark engine registry rather than maintaining separate state
- **Error Handling**: Graceful degradation if Quills fail to load
- **Type Safety**: Full TypeScript support with proper types

## Integration Points

### 1. Build Integration

Add to `package.json`:

```json
{
	"scripts": {
		"pack:quills": "node scripts/package-quills.js",
		"build": "npm run package:quills && vite build"
	}
}
```

### 2. Application Initialization

Initialize service in root layout or main page:

```typescript
import { quillmarkService } from '$lib/services/quillmark';

onMount(async () => {
	await quillmarkService.initialize();
});
```

### 3. Document Rendering

Components can request renders through the service:

```typescript
import { quillmarkService, resultToBlob, resultToSVGPages } from '$lib/services/quillmark';

// Render for preview (auto-detects backend and format from frontmatter)
const result = await quillmarkService.renderForPreview(markdown);
if (result.outputFormat === 'pdf') {
	// Display PDF blob
	const blob = resultToBlob(result);
	const url = URL.createObjectURL(blob);
	embedElement.src = url;
} else if (result.outputFormat === 'svg') {
	// Display SVG pages
	const pages = resultToSVGPages(result);
	pages.forEach(page => {
		const div = document.createElement('div');
		div.innerHTML = page;
		previewElement.appendChild(div);
	});
}

// Render to specific format for download
const pdfBlob = await quillmarkService.renderToPDF(markdown, 'usaf_memo');
await quillmarkService.downloadDocument(markdown, 'taro', 'output.svg', 'svg');
```

## Security Considerations

- **Trusted Quills**: Only Quills from `tonguetoquill-collection` are packaged
- **No Dynamic Loading**: Users cannot upload custom Quills (out of scope)
- **WASM Sandbox**: Quillmark runs in WASM sandbox with limited capabilities
- **Input Validation**: Markdown content is validated before rendering

## Performance

### Optimization Strategies

1. **Preloading**: All Quills loaded once at startup
2. **Singleton**: Single engine instance reused across all renders
3. **Lazy SVG**: SVG preview only rendered when preview pane is visible
4. **Debounced Renders**: User input debounced to limit render frequency

### Expected Performance

- **Initial Load**: ~100-500ms (one-time Quill loading)
- **PDF Render**: ~50-200ms per document
- **SVG Render**: ~30-100ms per document
- **Memory**: ~5-10MB for engine + loaded Quills

## Future Enhancements

**Not in current scope:**

- Custom Quill uploads by users
- Quill marketplace/discovery
- Real-time collaborative rendering
- Server-side rendering (SSR) of PDFs
- Quill versioning and updates

These may be considered in future iterations.

## References

- [@quillmark-test/web NPM package](https://www.npmjs.com/package/@quillmark-test/web)
- [Quillmark Documentation](https://quillmark.readthedocs.io/en/latest/)
- [tonguetoquill-collection Repository](https://github.com/nibsbin/tonguetoquill-collection)
- [Markdown Parsing Design](./PARSE.md)

---

_Document Status: Implemented - Reflects Current Codebase_
