# Quillmark Integration Architecture

## Overview

The application integrates with Quillmark (`@quillmark-test/web`) to render markdown documents as professional SVG/PDF outputs. The system uses a hybrid architecture with mock fallbacks to work across server-side rendering, development, and production environments.

## Core Concepts

**Quillmark**: A rendering engine that converts markdown to professional documents using reusable templates called Quills.

**Quill**: A bundled document template containing:
- `Quill.toml` - Field definitions and configuration
- `glue.typ` - Typst layout code
- `assets/` - Fonts and resources
- Example markdown

Quills are distributed as ZIP files and registered with the engine at runtime.

## Architecture

### Rendering Service
Central service managing all Quillmark operations:
- **Initialize**: Loads engine in browser, registers preloaded quills
- **Render Preview**: Converts markdown to SVG/PDF artifacts
- **Render PDF**: Exports markdown to PDF bytes

**Environment Handling**:
- **Server-side**: Returns mock renders (no WASM in Node)
- **Browser**: Uses real Quillmark engine with fallbacks

### Quill Preloader
Fetches all quill ZIP files on startup:
- Loads from `/static/quills/` directory
- Individual fetches per quill (supports future lazy loading)
- Converts ZIPs to engine-compatible format

### Mock Renderer
Provides fallback rendering for development/SSR:
- Generates synthetic SVG/PDF output
- Activates when engine unavailable or fails

### Preview Component
Orchestrates the rendering pipeline:
- Debounces markdown changes (50ms)
- Manages loading and error states
- Preserves last successful render on errors
- Routes output to appropriate display (SVG/PDF)

### Display Components
- **SVG Display**: Decodes and renders SVG artifact bytes
- **PDF Display**: Handles PDF artifact presentation

## Rendering Pipeline

```
Markdown Input
    ↓
Debounce (50ms)
    ↓
Rendering Service
    ↓
├─ SSR → Mock Renderer
│
└─ Browser → Quillmark Engine
    ↓
    ├─ Success → Artifacts (bytes + mimetype)
    └─ Error → Mock Fallback (if generic) or Display Error
    ↓
Display Component (SVG/PDF)
```

**Artifact Format**:
```typescript
{
  artifacts: [{ bytes: Uint8Array, mimeType: string }],
  outputFormat: 'svg' | 'pdf'
}
```

## Build Process

**Quill Packaging** (`build-quills.mjs`):
1. Scans source directories for `Quill.toml` files
2. Packages each quill as ZIP with all assets
3. Outputs to `static/quills/*.zip`
4. Runs automatically during build

**Template System**:
- Templates stored as markdown with YAML frontmatter
- Frontmatter specifies quill and field values
- Metadata cached for performance
- Content lazy-loaded on selection

## Error Handling

**Fallback Chain**:
1. Quillmark engine rendering
2. Mock renderer (on generic errors)
3. Error display (preserving last successful render)

**Error Types**:
- **Engine errors with hints**: Displayed to user
- **Generic engine errors**: Trigger mock fallback
- **Network errors**: Logged, other quills continue
- **Initialization failures**: Silent fallback to mock

## Template Integration

Templates define rendering parameters via frontmatter:

```yaml
---
quill: usaf_memo
letterhead_title: "DEPARTMENT OF THE AIR FORCE"
subject: "Example Subject"
---
```

Fields validated against quill schema before rendering.

## Performance

- **Debouncing**: 50ms delay prevents excessive re-renders
- **Caching**: Template metadata and content cached after load
- **Lazy Loading**: Templates loaded on selection
- **Singleton**: One engine instance per application lifecycle

## Extension Points

**Adding a Quill**:
1. Create quill directory with `Quill.toml` and `glue.typ`
2. Add to available quills list
3. Run build script to generate ZIP
4. Create corresponding templates

**Testing Without Engine**:
- Comment out engine initialization
- Application auto-falls back to mock
- Enables UI/UX testing independently

## Security

- SVG rendered via trusted engine output only
- Quill ZIPs from trusted build process (no user uploads)
- Frontmatter validated before rendering
- No direct user content in SVG structure

## Future Improvements

- Lazy quill loading (load on template selection)
- Client-side result caching (IndexedDB)
- Web Worker rendering (off main thread)
- Incremental rendering (changed pages only)
- Quill versioning support