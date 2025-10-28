# Quillmark Integration Architecture

## Overview

This document describes how the tonguetoquill-app integrates with the Quillmark rendering engine to convert markdown content into professional-quality SVG and PDF documents. The integration uses a hybrid approach with graceful fallbacks to ensure the app works in all environments (SSR, development, and production).

## Key Concepts

### What is Quillmark?

Quillmark is a rendering engine (via `@quillmark-test/web` npm package) that converts markdown to professional documents. It uses **Quills** - reusable document templates with specific formatting rules, fonts, and layouts defined in TOML configuration files.

### What is a Quill?

A **Quill** is a packaged document template that includes:
- `Quill.toml` - Configuration defining fields, defaults, and metadata
- `glue.typ` - Typst glue code that handles document layout
- `assets/` - Fonts, images, and other resources
- `packages/` - Optional typst packages
- Example markdown file demonstrating usage

Quills are packaged as ZIP files and registered with the Quillmark engine at runtime.

## Architecture Components

### 1. Service Layer

#### quill-engine-service.ts
**Purpose**: Central service for all Quillmark rendering operations

**Key Functions**:
- `initializeEngine()`: Initializes the Quillmark engine with registered quills
  - Only runs in browser context (checks `browser` from `$app/environment`)
  - Dynamically imports `@quillmark-test/web` to avoid SSR bundling
  - Preloads all quill ZIP files using `quill-preload-service`
  - Returns singleton engine instance
  
- `renderPreview(markdown: string)`: Renders markdown to SVG/PDF artifacts
  - Uses mock renderer in SSR or when engine unavailable
  - Calls `exporters.exportPreview()` from `@quillmark-test/web`
  - Returns `RenderResult` with artifacts array
  - Implements fallback chain: engine → mock → error
  
- `render_pdf(markdown: string)`: Renders markdown to PDF bytes
  - Uses `exporters.toBlob()` with `format: 'pdf'`
  - Returns Uint8Array of PDF data
  - Falls back to mock renderer on failure

**Error Handling Strategy**:
1. Attempt rendering with Quillmark engine
2. If engine error contains `message` or `hint`, surface to UI
3. Otherwise, attempt mock renderer fallback
4. If mock also fails, throw original engine error

#### quill-preload-service.ts
**Purpose**: Preloads all quill ZIP files on application startup

**Key Functions**:
- `preloadBlobs()`: Fetches all quill ZIPs from `/static/quills/`
  - Iterates over `AVAILABLE_QUILLS` array (`['usaf_memo', 'taro', 'usaf_form_8']`)
  - Fetches each quill ZIP individually (supports future lazy loading)
  - Returns array of `{ name, zipBlob }` objects
  - Logs preload progress and errors

**Design Decision**: Each quill is loaded individually rather than in bulk to support potential future lazy-loading based on template selection.

### 2. Mock Implementations

#### wasm-mock.ts
**Purpose**: Provides mock SVG rendering for development and SSR

**Function**: `render_markdown_svg(markdown: string): Promise<Uint8Array[]>`
- Simulates 300ms async delay
- Generates 1-3 mock SVG pages based on content length
- Returns array of Uint8Array (SVG as bytes)
- Each page is 612x792 (letter size) with debugging info

**Usage**: Automatically used when:
- Code runs in SSR context (`!browser`)
- Quillmark engine fails to initialize
- Quillmark rendering fails and needs fallback

#### wasm-pdf-mock.ts
**Purpose**: Provides mock PDF rendering for development and SSR

**Function**: `render_markdown_pdf(markdown: string): Promise<Uint8Array>`
- Similar to SVG mock but returns single PDF byte array
- Used as fallback for PDF export failures

### 3. Component Layer

#### RenderPreview.svelte (Organism)
**Purpose**: Orchestrates the rendering pipeline and manages state

**State Management**:
- `renderResult`: Current render output (RenderResult | null)
- `lastSuccessfulRenderResult`: Cached successful render for error recovery
- `loading`: Boolean indicating render in progress
- `error`: String error message to display
- `errorHint`: Optional hint from Quillmark engine
- `allowRender`: Gate to prevent rendering template on initial load
- `hasRenderedOnce`: Tracks first successful render for loading state

**Lifecycle**:
1. `onMount()`: Calls `initializeEngine()`, sets `allowRender = true`
2. Reactive statement watches `markdown` changes
3. Debounces render calls (50ms) to avoid excessive renders
4. Calls `renderPreview()` from engine service
5. Updates `renderResult` or preserves `lastSuccessfulRenderResult` on error

**Error Display Strategy**:
- If render succeeds: Clear error, update result
- If render fails: Display error banner but preserve last successful render
- Error messages sanitized by removing "WASM" prefix
- Shows hint from engine if available

**Props**:
- `markdown`: Input markdown content
- `onRenderError(error: string) | null`: Callback for parent notification
- `onRenderSuccess() | null`: Callback for parent notification

#### SvgPreview.svelte (Molecule)
**Purpose**: Displays array of SVG artifacts

**Implementation**:
- Receives `RenderResult` prop from parent
- Iterates over `renderResult.artifacts`
- Decodes each artifact's bytes using `TextDecoder`
- Renders SVG using `{@html}` directive
- Styles from `style.css` (16px gap between pages)

**Data Flow**: `RenderResult.artifacts[]` → decode bytes → render HTML

#### PdfPreview.svelte (Molecule)
**Purpose**: Displays PDF artifacts (future functionality)

**Current Implementation**: Basic structure for PDF rendering

### 4. Build System

#### build-quills.mjs
**Purpose**: Packages quills into ZIP files during build process

**Process**:
1. Scans `tonguetoquill-collection/quills/` for directories with `Quill.toml`
2. For each quill directory:
   - Creates AdmZip instance
   - Recursively adds all files (except `.quillignore`)
   - Writes ZIP to `static/quills/{quillname}.zip`
3. Logs build statistics (count, size)

**Output**: ZIP files in `static/quills/` (excluded from git via `.gitignore`)

**Invocation**: `npm run build:quills` (also runs as part of `npm run build`)

### 5. Template System Integration

#### template-service.ts
**Purpose**: Manages markdown templates that utilize quills

**Template Structure**:
- Templates stored in `tonguetoquill-collection/templates/*.md`
- Metadata in `tonguetoquill-collection/templates/templates.json`
- Templates include frontmatter specifying which quill to use

**Key Functions**:
- `getTemplateList()`: Returns filtered template metadata
  - Filters by production flag when `VERCEL_ENV=production`
  - Caches list to avoid recomputation
- `loadTemplate(id)`: Lazy-loads template content using Vite glob imports
- Uses `import.meta.glob('*.md', { query: '?raw' })` for efficient bundling

**Template-to-Quill Mapping**: Templates specify quill via frontmatter (validated by `frontmatter-service.ts`)

## Data Flow

### Complete Rendering Pipeline

```
User Types Markdown
    ↓
MarkdownEditor.svelte (component)
    ↓
RenderPreview.svelte (debounce 50ms)
    ↓
quill-engine-service.renderPreview()
    ↓
    ├─ SSR path → wasm-mock.ts → mock SVG bytes
    │
    └─ Browser path:
        ↓
        Quillmark engine (if initialized)
        ↓
        exporters.exportPreview(engine, markdown)
        ↓
        RenderResult { artifacts: [{ bytes, mimeType }], outputFormat }
        ↓
        ├─ Success → return RenderResult
        │
        └─ Error:
            ├─ Has message/hint? → throw error (UI displays)
            └─ Otherwise → fallback to wasm-mock.ts
    ↓
RenderPreview receives result
    ↓
    ├─ outputFormat === 'svg' → SvgPreview.svelte
    ├─ outputFormat === 'pdf' → PdfPreview.svelte
    └─ else → unsupported format message
    ↓
SvgPreview decodes bytes with TextDecoder
    ↓
Renders SVG via {@html} directive
    ↓
User sees rendered document
```

### Application Startup Flow

```
App Loads
    ↓
RenderPreview.onMount()
    ↓
initializeEngine()
    ↓
    ├─ Check: browser? → No → return null
    │
    └─ Yes:
        ↓
        Dynamic import('@quillmark-test/web')
        ↓
        new Quillmark()
        ↓
        quill-preload-service.preloadBlobs()
        ↓
        For each quill ZIP:
            fetch('/quills/{quillname}.zip')
            ↓
            loaders.fromZip(zipBlob)
            ↓
            engine.registerQuill(quillJson)
        ↓
        return engine
    ↓
Set allowRender = true
    ↓
Ready to render
```

## Type Definitions

### RenderResult (from @quillmark-test/web)
```typescript
interface RenderResult {
  artifacts: Array<{
    bytes: Uint8Array;
    mimeType: string;  // 'image/svg+xml' | 'application/pdf'
  }>;
  outputFormat: 'svg' | 'pdf';
}
```

### QuillBlob (internal)
```typescript
interface QuillBlob {
  name: string;      // quill identifier (e.g., 'usaf_memo')
  zipBlob: Blob;     // ZIP file as Blob
}
```

### Template (from template-service.ts)
```typescript
interface Template {
  id: string;            // kebab-case ID (e.g., 'usaf-template')
  name: string;          // Display name
  description: string;   // User-facing description
  content: string;       // Markdown content with frontmatter
}
```

## Environment-Specific Behavior

### Server-Side Rendering (SSR)
- `browser === false`
- Quillmark engine not imported (prevents WASM in Node)
- Always uses `wasm-mock.ts` for rendering
- Returns mock SVG pages for preview

### Development (`npm run dev`)
- `browser === true`
- Quillmark engine initialized with dynamic import
- Quills preloaded from `/static/quills/*.zip`
- Falls back to mock on engine errors
- Full error messages displayed in UI

### Production Build (`npm run build`)
- Runs `build-quills.mjs` to generate ZIP files
- Quillmark engine bundled via dynamic import
- Same runtime behavior as development
- Error messages sanitized for user display

## Integration Points

### External Package: @quillmark-test/web

**Exported API**:
- `class Quillmark`: Main engine class
  - `registerQuill(quillJson)`: Registers a quill template
- `loaders.fromZip(blob)`: Converts ZIP blob to quill JSON
- `exporters.exportPreview(engine, markdown)`: Renders to RenderResult
- `exporters.toBlob(engine, markdown, options)`: Renders to Blob (PDF)

**Expected Quill Structure** (in ZIP):
```
quill.zip
  ├── Quill.toml          # Configuration
  ├── glue.typ            # Typst layout
  ├── example.md          # Example usage
  ├── assets/             # Fonts, images
  └── packages/           # Typst packages
```

### Frontmatter Integration

Templates specify rendering parameters via YAML frontmatter:

```yaml
---
quill: usaf_memo
letterhead_title: "DEPARTMENT OF THE AIR FORCE"
date: "2024-01-15"
subject: "Example Memorandum"
---

# Markdown content here
```

The frontmatter is parsed by `frontmatter-service.ts` and passed to the Quillmark engine for field substitution.

## Error Handling & Fallbacks

### Fallback Chain

1. **Primary**: Quillmark engine rendering
2. **Secondary**: Mock renderer (development/debugging)
3. **Tertiary**: Error message display with last successful result

### Error Types

**Engine Initialization Errors**:
- Logged to console
- Falls back to mock renderer
- User sees mock preview

**Rendering Errors**:
- Errors with `message` or `hint` → Displayed in UI banner
- Generic errors → Mock fallback attempted
- Both fail → Original error thrown

**Network Errors** (quill loading):
- Individual quill failures logged
- Other quills continue loading
- Missing quills cause template-specific render errors

## Performance Considerations

### Debouncing
- 50ms debounce on markdown changes
- Prevents excessive render calls during typing
- Configurable via `debouncedRender()` timeout

### Lazy Loading
- Quills currently preloaded on startup
- Template content lazy-loaded on selection
- Future: Lazy-load quills based on template selection

### Caching
- Template metadata cached in `template-service`
- Template content cached after first load
- Engine instance singleton (one per app lifecycle)

### Memory Management
- `lastSuccessfulRenderResult` prevents re-render on transient errors
- Old render results garbage collected when new results succeed
- Quill ZIPs held in memory after preload

## Development Workflow

### Adding a New Quill

1. Create directory in `tonguetoquill-collection/quills/{quillname}/`
2. Add `Quill.toml` with field definitions
3. Add `glue.typ` with Typst layout code
4. Add example markdown file
5. Add fonts/assets to `assets/` directory
6. Update `AVAILABLE_QUILLS` in `quill-preload-service.ts`
7. Run `npm run build:quills` to generate ZIP
8. Create template in `tonguetoquill-collection/templates/`
9. Add template metadata to `templates.json`

### Testing Without Quillmark Engine

The mock renderer in `wasm-mock.ts` allows full application testing without the Quillmark package:

1. Comment out engine initialization in `quill-engine-service.ts`
2. App automatically falls back to mock
3. Mock renders 1-3 pages with debug info
4. Useful for UI/UX testing independent of engine

### Debugging Rendering Issues

1. Check browser console for Quillmark errors
2. Verify quill ZIP loaded successfully (check Network tab)
3. Validate frontmatter against `Quill.toml` field definitions
4. Test with mock renderer to isolate engine vs. app issues
5. Check `RenderPreview` error banner for hints from engine

## Security Considerations

### SVG Rendering
- SVG content rendered via `{@html}` directive
- **Risk**: XSS if SVG contains malicious code
- **Mitigation**: Quillmark engine generates trusted SVG
- User markdown does not directly inject into SVG structure

### ZIP File Handling
- Quill ZIPs loaded from trusted `/static/quills/` directory
- No user-uploaded ZIPs processed
- Build-time generation ensures integrity

### Frontmatter Validation
- YAML parsed and validated by `frontmatter-service.ts`
- Fields validated against quill schema
- Invalid frontmatter rejected before render

## Future Enhancements

### Planned Improvements
1. **Lazy quill loading**: Load quills only when template selected
2. **Quill versioning**: Support multiple versions of same quill
3. **Client-side caching**: Cache rendered results in IndexedDB
4. **Incremental rendering**: Render only changed pages
5. **Worker-based rendering**: Move rendering to Web Worker
6. **Streaming output**: Stream SVG pages as they render

### API Stability
- Current integration uses `@quillmark-test/web` v0.3.5
- API considered unstable (test package)
- Future migration to stable `@quillmark/web` expected
- Abstraction via `quill-engine-service` eases future migration

## Troubleshooting

### "Quillmark engine not initialized"
**Cause**: Engine failed to load in browser context  
**Solution**: Check browser console for import errors; verify `@quillmark-test/web` installed

### "Failed to preload quill {name}"
**Cause**: ZIP file missing from `static/quills/`  
**Solution**: Run `npm run build:quills` to generate ZIPs

### "Rendering error" with hint
**Cause**: Markdown/frontmatter doesn't match quill requirements  
**Solution**: Check hint message; verify frontmatter fields against `Quill.toml`

### Blank preview in production
**Cause**: Quill ZIPs not included in build  
**Solution**: Ensure `npm run build:quills` runs before `vite build`; verify `static/quills/` copied to build output

### SSR errors mentioning WASM
**Cause**: Quillmark imported in SSR context  
**Solution**: Verify `browser` check before dynamic import; ensure engine service uses browser guard

## Summary

The Quillmark integration provides a robust, production-ready rendering pipeline with:
- **Graceful degradation**: Mock fallback for all environments
- **Error resilience**: Multi-level fallback chain preserves UX
- **Performance optimization**: Debouncing, caching, lazy loading
- **Developer experience**: Clear separation of concerns, comprehensive logging
- **Extensibility**: Easy to add new quills and templates

The architecture balances production reliability with development flexibility through strategic use of dynamic imports, browser detection, and fallback implementations.