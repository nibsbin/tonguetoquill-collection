# Template Service

The Template Service provides read-only access to markdown templates stored in `tonguetoquill-collection/templates/`. Templates are static files distributed with the application, but the service is designed with an abstraction layer to support future database-backed templates.

## Purpose

- Provide type-safe access to template metadata for template selector components
- Load template content on-demand
- Support production/development filtering
- Future-proof for database migration

## Design

For full design details, see [prose/designs/backend/TEMPLATE_SERVICE.md](../../../prose/designs/backend/TEMPLATE_SERVICE.md).

## Usage

### 1. Initialize on Application Load

The service must be initialized before use. This loads the template manifest from `templates.json`.

```typescript
import { templateService } from '$lib/services/templates';

// In your root layout or app initialization
await templateService.initialize();
```

### 2. List Templates for Selector

Get template metadata for displaying in a template selector component:

```typescript
import { templateService } from '$lib/services/templates';

// Get all templates (including development templates)
const allTemplates = templateService.listTemplates();

// Get only production-ready templates (recommended for production UI)
const productionTemplates = templateService.listTemplates(true);

// Example output:
// [
//   {
//     name: 'U.S. Air Force Memo',
//     description: 'AFH 33-337 compliant official memorandum...',
//     file: 'usaf_template.md',
//     production: true
//   },
//   ...
// ]
```

### 3. Load Template Content

Fetch the full template content when a user selects a template:

```typescript
import { templateService } from '$lib/services/templates';

async function loadTemplate(filename: string) {
	try {
		const template = await templateService.getTemplate(filename);

		// template.metadata contains the metadata
		// template.content contains the markdown content

		// Use template content to populate editor
		editor.setContent(template.content);
	} catch (error) {
		if (error instanceof TemplateError) {
			console.error(`Template error: ${error.code} - ${error.message}`);
		}
	}
}
```

### 4. Get Template Metadata Only

If you need to check template metadata without loading the content:

```typescript
import { templateService } from '$lib/services/templates';

try {
	const metadata = templateService.getTemplateMetadata('usaf_template.md');
	console.log(`Template: ${metadata.name}`);
	console.log(`Description: ${metadata.description}`);
	console.log(`Production ready: ${metadata.production}`);
} catch (error) {
	if (error instanceof TemplateError && error.code === 'not_found') {
		console.error('Template not found');
	}
}
```

## Error Handling

The service uses typed errors for better error handling:

```typescript
import { templateService, TemplateError } from '$lib/services/templates';

try {
	await templateService.initialize();
} catch (error) {
	if (error instanceof TemplateError) {
		switch (error.code) {
			case 'load_error':
				// Failed to load manifest or template file
				console.error('Failed to load:', error.message);
				break;
			case 'invalid_manifest':
				// Manifest JSON is malformed
				console.error('Invalid manifest:', error.message);
				break;
			case 'not_initialized':
				// Service not initialized before use
				console.error('Service not ready:', error.message);
				break;
			case 'not_found':
				// Template not found in manifest
				console.error('Template not found:', error.message);
				break;
		}
	}
}
```

## API Reference

### `initialize(): Promise<void>`

Initialize the service by loading the template manifest. Should be called once on application load.

- **Throws**: `TemplateError` if initialization fails
- **Idempotent**: Safe to call multiple times (only initializes once)

### `isReady(): boolean`

Check if service is initialized and ready to serve templates.

- **Returns**: `true` if service is ready, `false` otherwise

### `listTemplates(productionOnly?: boolean): TemplateMetadata[]`

Get list of template metadata for template selection.

- **Parameters**:
  - `productionOnly` (optional): If `true`, return only production-ready templates
- **Returns**: Array of template metadata
- **Throws**: `TemplateError` if service is not initialized

### `getTemplateMetadata(filename: string): TemplateMetadata`

Get template metadata by filename.

- **Parameters**:
  - `filename`: Template filename from metadata (e.g., `'usaf_template.md'`)
- **Returns**: Template metadata
- **Throws**: `TemplateError` if service is not initialized or template not found

### `getTemplate(filename: string): Promise<Template>`

Get full template with content by filename.

- **Parameters**:
  - `filename`: Template filename from metadata (e.g., `'usaf_template.md'`)
- **Returns**: Template with metadata and content
- **Throws**: `TemplateError` if service is not initialized or template not found

## Types

### `TemplateMetadata`

```typescript
interface TemplateMetadata {
	/** Unique display name of the template */
	name: string;

	/** Human-readable description of the template */
	description: string;

	/** Filename of the markdown template (relative to templates directory) */
	file: string;

	/** Whether template is ready for production use */
	production: boolean;
}
```

### `Template`

```typescript
interface Template {
	/** Template metadata */
	metadata: TemplateMetadata;

	/** Full markdown content of the template */
	content: string;
}
```

### `TemplateError`

```typescript
class TemplateError extends Error {
	/** Error code identifying the type of error */
	code: 'not_initialized' | 'not_found' | 'load_error' | 'invalid_manifest';
}
```

## Implementation Details

### Singleton Pattern

The service uses a singleton pattern to ensure only one instance exists and the manifest is only loaded once:

```typescript
// Always returns the same instance
const service1 = TemplateServiceImpl.getInstance();
const service2 = TemplateServiceImpl.getInstance();
console.log(service1 === service2); // true
```

### Manifest Caching

The manifest is fetched and parsed once during initialization and then cached in memory. Subsequent calls to service methods use the cached manifest.

### Static File Paths

Templates are accessed via the URL path `/tonguetoquill-collection/templates/`:

- Manifest: `/tonguetoquill-collection/templates/templates.json`
- Templates: `/tonguetoquill-collection/templates/{filename}.md`

### Production Filtering

The `production` flag in template metadata controls visibility:

- **Development mode**: Show all templates (`listTemplates()` or `listTemplates(false)`)
- **Production mode**: Show only production-ready templates (`listTemplates(true)`)

This allows testing experimental templates without exposing them to end users.

## Future Database Support

The service interface is designed to support future database-backed templates without breaking changes:

1. **Current**: Static files only
2. **Future Phase 1**: Hybrid (database + static files)
3. **Future Phase 2**: Full database migration

The abstraction allows this migration without changing the service API.

## Testing

The service includes comprehensive unit tests in `template.test.ts`:

- Singleton pattern enforcement
- Initialization and idempotency
- Template listing with production filtering
- Template metadata retrieval
- Template content loading
- Error handling for all error codes

Run tests:

```bash
npm run test:unit -- src/lib/services/templates/template.test.ts
```

## Cross-References

- [Design Document](../../../prose/designs/backend/TEMPLATE_SERVICE.md) - Full service design
- [Services Architecture](../../../prose/designs/backend/SERVICES.md) - Overall service patterns
- [Implementation Plan](../../../prose/plans/template-service.md) - Implementation checklist
