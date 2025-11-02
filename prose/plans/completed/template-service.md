# Template Service Implementation Plan

This plan outlines the steps to implement the Template Service described in [../designs/backend/TEMPLATE_SERVICE.md](../designs/backend/TEMPLATE_SERVICE.md).

## Overview

Create a client-side service that exposes markdown templates from `tonguetoquill-collection/templates/` with metadata from `templates.json`. The service follows the established pattern used by QuillmarkService and is designed to support future database-backed templates.

**Key Goals:**

- Provide type-safe access to template metadata for template selector components
- Load template content on-demand
- Support production/development filtering
- Future-proof for database migration

## Phase 1: Create Type Definitions

- [ ] Create `src/lib/services/templates/types.ts`
- [ ] Define `TemplateMetadata` interface matching `templates.json` structure
- [ ] Define `TemplateManifest` interface for manifest file
- [ ] Define `Template` interface combining metadata and content
- [ ] Define `TemplateErrorCode` type union
- [ ] Define `TemplateError` class extending Error
- [ ] Define `TemplateService` interface with all required methods
- [ ] Add JSDoc comments for all types and interfaces

## Phase 2: Implement Service

- [ ] Create `src/lib/services/templates/service.ts`
- [ ] Implement `TemplateServiceImpl` class with singleton pattern
- [ ] Implement private `loadManifest()` method to fetch and parse `templates.json`
- [ ] Implement private `validateInitialized()` method for state checking
- [ ] Implement `initialize()` method to load manifest on first call
- [ ] Implement `isReady()` method to check initialization state
- [ ] Implement `listTemplates(productionOnly?)` to return filtered metadata list
- [ ] Implement `getTemplateMetadata(filename)` to find metadata by filename
- [ ] Implement `getTemplate(filename)` to fetch template content
- [ ] Add proper error handling for all methods
- [ ] Export singleton instance as `templateService`

## Phase 3: Create Service Exports

- [ ] Create `src/lib/services/templates/index.ts`
- [ ] Export `templateService` singleton
- [ ] Export all types from `types.ts`
- [ ] Add module documentation

## Phase 4: Add Unit Tests

- [ ] Create `src/lib/services/templates/template.test.ts`
- [ ] Test singleton pattern enforcement
- [ ] Test successful initialization
- [ ] Test initialization with invalid manifest JSON
- [ ] Test initialization with network error
- [ ] Test `listTemplates()` returns all templates
- [ ] Test `listTemplates(true)` returns only production templates
- [ ] Test `listTemplates(false)` returns all templates
- [ ] Test `getTemplateMetadata()` with valid filename
- [ ] Test `getTemplateMetadata()` with invalid filename
- [ ] Test `getTemplate()` with valid filename
- [ ] Test `getTemplate()` with invalid filename
- [ ] Test methods throw error when not initialized
- [ ] Test manifest caching (only fetched once)

## Phase 5: Add Service Documentation

- [ ] Create `src/lib/services/templates/README.md`
- [ ] Document service purpose and usage
- [ ] Include initialization example
- [ ] Include template selector example
- [ ] Include template loading example
- [ ] Document error handling patterns
- [ ] Add cross-references to design document

## Phase 6: Integration Testing

- [ ] Verify manifest file is accessible at runtime
- [ ] Verify template files are accessible at runtime
- [ ] Test service in development mode (shows all templates)
- [ ] Test service with production filter (shows only production: true)
- [ ] Verify template content loads correctly
- [ ] Test error handling with missing files

## Phase 7: Type Checking and Build

- [ ] Run `npm run check` to verify TypeScript types
- [ ] Fix any type errors
- [ ] Run `npm run build` to verify production build
- [ ] Verify no client-side bundle size issues

## Phase 8: Update Documentation

- [ ] Update `prose/designs/backend/SERVICES.md` to reference template service
- [ ] Add template service to relevant architectural diagrams if any
- [ ] Add cross-references from related documents

## Implementation Notes

### Critical Details

1. **Static File Paths**: Templates accessed via `/tonguetoquill-collection/templates/` URL path
2. **Singleton Pattern**: Use same pattern as QuillmarkService for consistency
3. **Error Handling**: Use typed errors with specific error codes
4. **Future-Ready**: Interface designed to support database implementation without breaking changes
5. **Production Filtering**: Default to production-only in UI components

### Manifest Location

The manifest file is located at:

```
tonguetoquill-collection/templates/templates.json
```

At runtime, it's accessed via:

```
/tonguetoquill-collection/templates/templates.json
```

### Template File Structure

Each template entry in `templates.json`:

```json
{
	"name": "Display Name",
	"description": "Description text",
	"file": "template_filename.md",
	"production": true
}
```

### Service Usage Pattern

```typescript
// 1. Initialize on app load
await templateService.initialize();

// 2. List templates for selector
const templates = templateService.listTemplates(true); // production only

// 3. Load template when selected
const template = await templateService.getTemplate('usaf_template.md');
```

### Testing Strategy

- **Unit Tests**: Mock `fetch()` to test service logic in isolation
- **Integration Tests**: Use real manifest and template files
- **Error Cases**: Test all error paths (not found, network error, invalid JSON)

### Future Database Migration

The service interface supports future migration to database-backed templates:

1. **Phase 1 (Current)**: Static files
   - Fetch from `/tonguetoquill-collection/templates/`
2. **Phase 2 (Future)**: Hybrid approach
   - Check database for user templates first
   - Fall back to static templates
   - Both sources returned by `listTemplates()`

3. **Phase 3 (Future)**: Full database
   - Migrate static templates to database seed
   - Remove static file dependency
   - No service interface changes needed

The abstraction allows this migration without breaking existing code.

## File Checklist

**Files to Create:**

- `src/lib/services/templates/types.ts`
- `src/lib/services/templates/service.ts`
- `src/lib/services/templates/index.ts`
- `src/lib/services/templates/README.md`
- `src/lib/services/templates/template.test.ts`

**Files to Update:**

- `prose/designs/backend/SERVICES.md` (add template service reference)

**No Files to Delete or Move**

## Verification Checklist

Before considering this plan complete:

- [ ] All unit tests pass (`npm run test:unit`)
- [ ] Type checking passes (`npm run check`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Service correctly loads manifest from static files
- [ ] Service correctly loads template content
- [ ] Production filtering works as expected
- [ ] Error handling works for all error cases
- [ ] Documentation is complete and accurate
- [ ] Code follows project conventions (matches QuillmarkService pattern)

## Dependencies

### Runtime Dependencies

None - uses only browser `fetch()` API

### Development Dependencies

- `vitest` - For unit testing
- `@vitest/ui` - For test UI (optional)

### Static Assets

- `tonguetoquill-collection/templates/templates.json` - Template manifest
- `tonguetoquill-collection/templates/*.md` - Template markdown files

## Success Criteria

The implementation is complete when:

1. ✅ Template service follows established service patterns (singleton, typed errors, etc.)
2. ✅ Service can list all templates with metadata
3. ✅ Service can filter by production status
4. ✅ Service can load template content by filename
5. ✅ All unit tests pass
6. ✅ Service is documented with usage examples
7. ✅ Integration with static files works correctly
8. ✅ Service interface supports future database migration
9. ✅ Type checking and builds pass without errors
10. ✅ Code is ready for use by template selector components

## Next Steps (Out of Scope for This Plan)

After template service is implemented, future work may include:

- Create template selector UI component using the service
- Integrate template loading into document creation flow
- Add template preview functionality
- Implement database-backed templates
- Add user-specific templates
- Add template categories/tagging

These are separate tasks and should have their own design and implementation plans.
