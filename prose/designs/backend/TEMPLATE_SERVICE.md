# Template Service

This document defines the Template Service for exposing markdown templates from `tonguetoquill-collection/templates/` with metadata from the JSON manifest.

> **Related**: [SERVICES.md](./SERVICES.md) for overall service architecture patterns

## Overview

The Template Service provides read-only access to markdown templates stored in `tonguetoquill-collection/templates/`. Templates are static files distributed with the application, but the service is designed with an abstraction layer to support future database-backed templates.

**Key Characteristics:**

- **Read-only**: Templates are not modifiable through the service (static assets)
- **Metadata-driven**: `templates.json` provides structured metadata for each template
- **Future-ready**: Service contract designed to support database-backed templates
- **Client-side**: Templates loaded directly in browser (no server round-trip needed)

## Data Model

### Template Metadata Structure

Individual template entry from the manifest:

```json
{
	"name": "U.S. Air Force Memo",
	"description": "AFH 33-337 compliant official memorandum for the U.S. Air Force.",
	"file": "usaf_template.md",
	"production": true
}
```

### Manifest File Format

The `templates.json` file in `tonguetoquill-collection/templates/` is a direct array of template metadata:

```json
[
	{
		"name": "U.S. Air Force Memo",
		"description": "AFH 33-337 compliant official memorandum for the U.S. Air Force.",
		"file": "usaf_template.md",
		"production": true
	},
	{
		"name": "U.S. Space Force Memo",
		"description": "Official memorandum template for the U.S. Space Force.",
		"file": "ussf_template.md",
		"production": true
	}
]
```

The service implementation wraps this array in a `TemplateManifest` object internally for type safety.

### TypeScript Interfaces

```typescript
/**
 * Template metadata from manifest
 */
export interface TemplateMetadata {
	/** Unique display name of the template */
	name: string;

	/** Human-readable description of the template */
	description: string;

	/** Filename of the markdown template (relative to templates directory) */
	file: string;

	/** Whether template is ready for production use */
	production: boolean;
}

/**
 * Template manifest structure
 */
export interface TemplateManifest {
	/** Array of available templates */
	templates: TemplateMetadata[];
}

/**
 * Full template with content
 */
export interface Template {
	/** Template metadata */
	metadata: TemplateMetadata;

	/** Full markdown content of the template */
	content: string;
}
```

### Error Types

```typescript
export type TemplateErrorCode = 'not_found' | 'load_error' | 'invalid_manifest';

export class TemplateError extends Error {
	code: TemplateErrorCode;

	constructor(code: TemplateErrorCode, message: string) {
		super(message);
		this.name = 'TemplateError';
		this.code = code;
	}
}
```

## Service Contract

The Template Service follows the established service pattern used by Document Service and Quillmark Service.

### Interface Definition

```typescript
/**
 * Template Service Interface
 *
 * Provides read-only access to markdown templates with metadata.
 * Designed to support future database-backed implementations.
 */
export interface TemplateService {
	/**
	 * Initialize the service by loading the template manifest.
	 * Should be called once on application load.
	 *
	 * @throws {TemplateError} If initialization fails
	 */
	initialize(): Promise<void>;

	/**
	 * Check if service is initialized and ready to serve templates.
	 *
	 * @returns True if service is ready, false otherwise
	 */
	isReady(): boolean;

	/**
	 * Get list of template metadata for template selection.
	 * Typically used to populate a template selector component.
	 *
	 * @param productionOnly - If true, return only production-ready templates
	 * @returns Array of template metadata
	 * @throws {TemplateError} If service is not initialized
	 */
	listTemplates(productionOnly?: boolean): TemplateMetadata[];

	/**
	 * Get full template with content by filename.
	 *
	 * @param filename - Template filename from metadata
	 * @returns Template with metadata and content
	 * @throws {TemplateError} If service is not initialized or template not found
	 */
	getTemplate(filename: string): Promise<Template>;

	/**
	 * Get template metadata by filename.
	 *
	 * @param filename - Template filename
	 * @returns Template metadata
	 * @throws {TemplateError} If service is not initialized or template not found
	 */
	getTemplateMetadata(filename: string): TemplateMetadata;
}
```

## Implementation Strategy

### File Location

```
src/lib/services/templates/
├── index.ts                 # Service exports
├── types.ts                 # TypeScript types and interfaces
├── service.ts               # TemplateService implementation
├── template.test.ts         # Unit tests
└── README.md                # Service documentation
```

### Singleton Pattern

Following the pattern established by QuillmarkService:

```typescript
class TemplateServiceImpl implements TemplateService {
	private static instance: TemplateServiceImpl | null = null;
	private manifest: TemplateManifest | null = null;
	private initialized = false;

	private constructor() {}

	static getInstance(): TemplateServiceImpl {
		if (!TemplateServiceImpl.instance) {
			TemplateServiceImpl.instance = new TemplateServiceImpl();
		}
		return TemplateServiceImpl.instance;
	}

	async initialize(): Promise<void> {
		if (this.initialized) return;

		this.manifest = await this.loadManifest();
		this.initialized = true;
	}

	// ... other methods
}

// Export singleton instance
export const templateService = TemplateServiceImpl.getInstance();
```

### Initialization Flow

```
initialize()
  │
  └─> loadManifest()
      └─> fetch('/templates/templates.json')
          └─> Parse and validate JSON structure
```

### Template Loading Flow

```
getTemplate(filename)
  │
  ├─> validateInitialized()
  ├─> getTemplateMetadata(filename)
  │
  └─> fetch(`/templates/${filename}`)
      └─> return { metadata, content }
```

## Future Database Support

The service contract is designed to support a future database-backed implementation without breaking changes:

### Migration Path

1. **Phase 1 (Current)**: Static file-based implementation
   - Templates stored in `tonguetoquill-collection/templates/`
   - Manifest loaded from `templates.json`
   - Template content fetched from static files

2. **Phase 2 (Future)**: Hybrid implementation
   - Add database table for user-created templates
   - `listTemplates()` returns both static + database templates
   - `getTemplate()` checks database first, falls back to static files
   - Static templates remain immutable

3. **Phase 3 (Future)**: Full database implementation
   - Migrate static templates to database seed data
   - Remove dependency on static files
   - Support template versioning and user modifications

### Database Schema (Future)

```sql
-- Future schema design (not implemented)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  filename TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  production BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Service Interface Compatibility

The current interface supports future database implementation:

- `initialize()`: Can be extended to initialize database connection
- `listTemplates()`: Already returns metadata array (source-agnostic)
- `getTemplate()`: Already async (supports database queries)
- `getTemplateMetadata()`: Can query database instead of in-memory manifest

**No breaking changes required** to support database-backed templates.

## Usage Examples

### Application Initialization

```typescript
// src/routes/+layout.svelte
import { onMount } from 'svelte';
import { templateService } from '$lib/services/templates';

onMount(async () => {
	try {
		await templateService.initialize();
		console.log('Template service ready');
	} catch (error) {
		console.error('Failed to initialize template service:', error);
	}
});
```

### Template Selector Component

```typescript
// src/lib/components/TemplateSelector.svelte
import { templateService } from '$lib/services/templates';

// Get production templates for selector dropdown
const templates = templateService.listTemplates(true);

// templates = [
//   { name: 'U.S. Air Force Memo', description: '...', file: 'usaf_template.md', production: true },
//   { name: 'U.S. Space Force Memo', description: '...', file: 'ussf_template.md', production: true }
// ]
```

### Loading Template Content

```typescript
import { templateService } from '$lib/services/templates';

async function loadTemplate(filename: string) {
	try {
		const template = await templateService.getTemplate(filename);

		// template = {
		//   metadata: { name: '...', description: '...', file: '...', production: true },
		//   content: '---\nQUILL: usaf_memo\n...'
		// }

		// Use template.content to populate editor
		editor.setContent(template.content);
	} catch (error) {
		console.error('Failed to load template:', error);
	}
}
```

## Testing Strategy

### Unit Tests

Test file: `src/lib/services/templates/template.test.ts`

**Test Cases:**

1. Singleton pattern enforcement
2. Initialization success path
3. Initialization with invalid manifest
4. List templates (all)
5. List templates (production only)
6. Get template metadata (valid)
7. Get template metadata (not found)
8. Get template content (valid)
9. Get template content (not found)
10. Methods require initialization
11. Manifest caching behavior

### Mock Strategy

Use vitest mocks for external dependencies:

- Mock `fetch()` for manifest and template files
- Verify proper error handling for network failures
- Test with both valid and invalid JSON manifests

## Design Decisions

### Why Client-Side Service?

- **Performance**: No server round-trip for static content
- **Simplicity**: Static files served directly by Vite/build system
- **Offline Support**: Templates available even if server is down
- **Cost**: No server compute or database queries for static content

### Why Singleton?

- **Simplicity**: Single source of truth for template state
- **Performance**: Avoid re-loading manifest multiple times
- **Consistency**: All components use same template list

### Why Separate Metadata and Content?

- **Performance**: List operation doesn't load all template content
- **UX**: Fast template selector population
- **Lazy Loading**: Content loaded only when template is selected

### Why Production Flag?

- **Development**: Show experimental templates in dev/test environments
- **Quality Control**: Hide incomplete templates from production users
- **Flexibility**: Easy to toggle template visibility

### Why Not Part of Quillmark Service?

Templates and Quills are related but serve different purposes:

- **Templates**: Starter content for documents (markdown files)
- **Quills**: Rendering engines for documents (Typst templates)
- **Separation of Concerns**: Template selection is independent of rendering
- **Future Flexibility**: Templates may reference different Quills

Templates provide starting content; Quills provide rendering. A template may specify which Quill to use via frontmatter (`QUILL: usaf_memo`), but template management is orthogonal to Quill management.

## Constraints and Limitations

### Current Scope

- ✅ Read-only access to static templates
- ✅ Metadata-based template listing
- ✅ Production/development filtering
- ✅ Type-safe API
- ✅ Future-ready for database support

### Out of Scope

- ❌ Template creation/modification (read-only)
- ❌ User-specific templates
- ❌ Template versioning
- ❌ Template search/filtering (beyond production flag)
- ❌ Template categories/tags
- ❌ Template previews/thumbnails

These features may be added when database-backed templates are implemented.

## Cross-References

- [SERVICES.md](./SERVICES.md) - Overall service architecture
- [../quillmark/SERVICE.md](../quillmark/SERVICE.md) - Quillmark service pattern
- [../frontend/ARCHITECTURE.md](../frontend/ARCHITECTURE.md) - Client architecture
