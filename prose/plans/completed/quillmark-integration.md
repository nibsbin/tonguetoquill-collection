# Quillmark Integration Implementation Plan

This plan details the implementation of Quillmark WASM integration into the Tonguetoquill web application.

> **Related Documents:**
>
> - Design: [prose/designs/quillmark/INTEGRATION.md](../designs/quillmark/INTEGRATION.md)
> - Service Design: [prose/designs/quillmark/SERVICE.md](../designs/quillmark/SERVICE.md)

## Objective

Integrate the `@quillmark-test/web` package to enable PDF/SVG rendering of markdown documents using Quill templates. The integration will:

1. Abstract Quillmark interactions into a service
2. Create a singleton Quillmark engine instance
3. Preload Quills from `tonguetoquill-collection/quills`
4. Provide simple API for document rendering

## Prerequisites

- ✅ `@quillmark-test/web` dependency already in `package.json`
- ✅ Quill templates exist in `tonguetoquill-collection/quills/`
- ✅ Build infrastructure (Vite, TypeScript) configured

## Implementation Tasks

### 1. Create Build Script for Quill Packaging

**File**: `scripts/package-quills.js`

Create a Node.js script that:

- Reads all directories in `tonguetoquill-collection/quills/`
- For each directory:
  - Parses `Quill.toml` to extract metadata
  - Zips the entire directory contents
  - Saves as `static/quills/{name}.zip`
- Generates `static/quills/manifest.json` with all Quill metadata

**Dependencies**: Use Node.js built-in modules (`fs`, `path`) and `archiver` npm package for zipping.

**Testing**: Run script manually and verify output in `static/quills/`.

### 2. Update Build Configuration

**File**: `package.json`

Add new scripts:

```json
{
	"scripts": {
		"package:quills": "node scripts/package-quills.js",
		"prebuild": "npm run package:quills"
	}
}
```

The `prebuild` script ensures Quills are packaged before every build.

**Testing**: Run `npm run package:quills` and verify it completes successfully.

### 3. Create Service Directory Structure

Create new directory: `src/lib/services/quillmark/`

**Files to create:**

- `types.ts` - TypeScript interfaces and types
- `service.ts` - QuillmarkService implementation
- `index.ts` - Public exports
- `quillmark.test.ts` - Unit tests
- `README.md` - Service documentation

### 4. Implement Service Types

**File**: `src/lib/services/quillmark/types.ts`

Define:

- `QuillMetadata` interface
- `QuillManifest` interface
- `QuillmarkService` interface
- `QuillmarkError` class
- Export all types

### 5. Implement QuillmarkService

**File**: `src/lib/services/quillmark/service.ts`

Implement singleton service with:

- Private constructor
- Static `getInstance()` method
- `initialize()` - Load manifest and preload Quills
- `isReady()` - Check initialization status
- `getAvailableQuills()` - Return Quill metadata list
- `renderToPDF()` - Render markdown to PDF blob
- `renderToSVG()` - Render markdown to SVG string
- `downloadDocument()` - Render and trigger browser download

Internal methods:

- `loadManifest()` - Fetch and parse manifest.json
- `preloadQuills()` - Load and register all Quills from manifest
- `validateInitialized()` - Throw if not initialized
- `validateQuillExists()` - Throw if Quill not found

**Dependencies:**

```typescript
import { Quillmark, loaders, exporters } from '@quillmark-test/web';
```

### 6. Export Service

**File**: `src/lib/services/quillmark/index.ts`

```typescript
export * from './types';
export { quillmarkService } from './service';
```

### 7. Create Service Tests

**File**: `src/lib/services/quillmark/quillmark.test.ts`

Test coverage:

- Singleton instance enforcement
- Initialization flow
- Error handling (not initialized, Quill not found)
- Render methods (PDF and SVG)
- Available Quills retrieval

Use vitest mocks for `@quillmark-test/web` and `fetch()`.

### 8. Create Service README

**File**: `src/lib/services/quillmark/README.md`

Document:

- Service purpose
- API reference
- Usage examples
- Error codes
- References to design docs

### 9. Update .gitignore

Ensure `static/quills/` is not ignored (contains generated files needed at runtime).

Check if `static/` directory already allows files.

### 10. Integration Testing

Manually test:

1. Run `npm run package:quills`
2. Verify `static/quills/` contains `.zip` files and `manifest.json`
3. Run `npm run dev`
4. Open browser console
5. Test service initialization:

```javascript
import { quillmarkService } from '$lib/services/quillmark';
await quillmarkService.initialize();
console.log(quillmarkService.getAvailableQuills());
```

### 11. Lint and Format

Run linting and formatting on all new files:

```bash
npm run format
npm run lint
```

Fix any issues.

### 12. Build Verification

Run full build to ensure no errors:

```bash
npm run build
```

Verify:

- Quills are packaged
- Build completes successfully
- `static/quills/` files are included in build output

## Success Criteria

- ✅ Build script packages Quills into `static/quills/`
- ✅ Manifest contains metadata for all Quills
- ✅ QuillmarkService implements defined contract
- ✅ Service uses singleton pattern
- ✅ All Quills preloaded on initialization
- ✅ Unit tests pass
- ✅ No TypeScript errors
- ✅ Linting passes
- ✅ Build completes successfully
- ✅ Service can be imported and initialized

## Non-Goals (Future Work)

The following are explicitly **out of scope** for this implementation:

- ❌ UI components for template selection
- ❌ Integration into document editor/preview
- ❌ Server-side rendering (SSR)
- ❌ Lazy loading of Quills
- ❌ User-uploaded custom Quills
- ❌ Quill versioning/updates
- ❌ Render caching
- ❌ Web Workers for rendering

These features will be addressed in future iterations after core service is validated.

## Rollout Strategy

### Phase 1: Service Implementation (This Plan)

- Create service infrastructure
- Package Quills at build time
- Expose service API
- Add tests

### Phase 2: UI Integration (Future)

- Add template selector UI
- Wire service to document preview
- Add download buttons
- Handle loading/error states

### Phase 3: Advanced Features (Future)

- Caching and performance optimization
- Web Workers for background rendering
- Template discovery and management
- User preferences for default templates

## Dependencies

### NPM Packages

- `@quillmark-test/web` - Already installed (v0.4.0)
- `archiver` - **NEW** (for zipping Quills in build script)

Add to `devDependencies`:

```bash
npm install --save-dev archiver @types/archiver
```

### Static Assets

- `tonguetoquill-collection/quills/*` - Source Quill templates
- `static/quills/*` - Generated zip files and manifest (created by build script)

## Risk Mitigation

### Risk: WASM Loading Failures

**Mitigation**: Graceful error handling with descriptive messages. Service initialization errors are caught and logged.

### Risk: Large Quill Sizes

**Mitigation**: Monitor total size of `static/quills/`. Current estimate: ~1-2MB total for 3 Quills (acceptable).

### Risk: Browser Compatibility

**Mitigation**: Quillmark requires modern browsers with WASM support. Document minimum browser requirements.

### Risk: Build Script Failures

**Mitigation**: Build script validates `Quill.toml` parsing and handles missing files gracefully. Fails build on errors.

## Testing Checklist

- [ ] Build script packages all Quills correctly
- [ ] Manifest.json format is correct
- [ ] Service singleton pattern works
- [ ] Service initialization loads all Quills
- [ ] Render methods require initialization
- [ ] Render methods validate Quill names
- [ ] PDF rendering returns Blob
- [ ] SVG rendering returns string
- [ ] Download triggers browser download
- [ ] Unit tests pass
- [ ] TypeScript compilation succeeds
- [ ] Linting passes
- [ ] Full build succeeds

## Documentation Updates

- ✅ `prose/designs/quillmark/INTEGRATION.md` - Created
- ✅ `prose/designs/quillmark/SERVICE.md` - Created
- ✅ `prose/plans/quillmark-integration.md` - This document
- [ ] `src/lib/services/quillmark/README.md` - To be created
- [ ] Update main `README.md` if Quillmark becomes user-facing

## References

- [Quillmark Web NPM Package](https://www.npmjs.com/package/@quillmark-test/web)
- [Quillmark Documentation](https://quillmark.readthedocs.io/en/latest/)
- [tonguetoquill-collection](https://github.com/nibsbin/tonguetoquill-collection)
- [Frontend Architecture](../designs/frontend/ARCHITECTURE.md)
- [Service Patterns](../designs/backend/SERVICES.md)
