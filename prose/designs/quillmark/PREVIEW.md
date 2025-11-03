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

- `markdown`: Document content to preview

### State Management

Component maintains:
- Loading status
- Error state with diagnostic information
- Current and last successful render results
- Object URLs for PDF display (with cleanup)
- SVG page arrays for multi-page support

## Display Strategy

### SVG Display

SVG content injected directly into DOM with multi-page support. Advantages: inline rendering, perfect scaling, CSS styling support.

**Security:** SVG from trusted Quillmark engine, safe to render.

### PDF Display

PDF displayed using native browser `<embed>` element. Advantages: native PDF viewer, zoom/navigation, print support, accessibility.

**Cleanup:** Object URLs revoked on unmount or content change.

## Performance Optimization

### Debouncing

Rendering debounced (~50ms) to avoid excessive re-renders during typing.

### Loading States

Loading indicator shown during render. Progressive enhancement with previous render displayed while new render loads.

## Error Handling

### Render Errors

Service throws `QuillmarkError` with optional diagnostic information. Component extracts and displays:
- Error code
- Message
- Hint (if available)
- Source location (if available)
- Source chain (if available)

### Fallback Strategy

On render failure:
1. Display error with diagnostic details (if available)
2. Show previous successful render (if available)
3. Allow user to fix markdown
4. Component remains functional

## User Experience

### Backend Detection

Backend and quill auto-detected from document frontmatter `QUILL` field. No manual template selection needed.

Example frontmatter:
```yaml
---
QUILL: usaf_memo
---
```

## Integration Points

### Service Initialization

Quillmark service initialized before rendering, with error handling for initialization failures.

### Editor Integration

Preview component receives markdown from editor and updates on content changes.

## Accessibility

### Screen Reader Support

Preview region marked with appropriate ARIA attributes (`role="region"`, `aria-label`, `aria-live`, `aria-busy`).

### Keyboard Navigation

- Preview content scrollable with keyboard
- PDF viewer supports keyboard navigation within PDF

### Mobile Considerations

- Native select elements on mobile
- Touch-optimized PDF viewer with pinch-to-zoom
- Scrollable SVG preview

## Testing Strategy

### Unit Tests

Component testing focuses on:
- Service integration
- Display logic for SVG and PDF
- Multi-page SVG handling
- Loading states
- Error display with diagnostics
- Debounce behavior
- Object URL cleanup

### Integration Tests

Full workflow testing:
1. Service initialization
2. Markdown with QUILL frontmatter
3. Preview updates after debounce
4. Correct format display based on backend

### Visual Regression

Screenshot comparisons for SVG/PDF rendering and error states.

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
