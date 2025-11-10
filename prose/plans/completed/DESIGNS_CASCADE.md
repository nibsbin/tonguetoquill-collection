## Design Document Proliferation

### Current Situation (36 documents)

**Backend** (8 documents):

- SERVICES.md
- SCHEMAS.md
- DOCUMENT_SERVICE.md
- LOGIN_SERVICE.md
- TEMPLATE_SERVICE.md
- SUPABASE_AUTH_ADAPTER.md
- SUPABASE_DATABASE_ADAPTER.md
- USER_SERVICE.md

**Frontend** (20 documents):

- ARCHITECTURE.md
- DESIGN_SYSTEM.md
- STATE_MANAGEMENT.md
- API_INTEGRATION.md
- COMPONENT_ORGANIZATION.md
- ACCESSIBILITY.md
- SIDEBAR.md
- NEW_DOCUMENT.md
- TEMPLATE_SELECTOR.md
- LOGIN_PROFILE_UI.md
- LOGO_SIDEBAR.md
- MARKDOWN_EDITOR.md
- EMPTY_STATE_EDITOR.md
- ERROR_DISPLAY.md
- SHARE_MODAL.md
- WIDGET_ABSTRACTION.md (1,051 lines!)
- WIDGET_THEME_UNIFICATION.md
- POPOVER_SIDEBAR_ALIGNMENT.md
- ZINDEX_STRATEGY.md

**QuillMark** (6 documents):

- SERVICE.md
- INTEGRATION.md
- PREVIEW.md
- DIAGNOSTICS.md
- PARSE.md
- QUILLMARK_SYNTAX_HIGHLIGHTING.md

**Patterns** (2 documents):

- AUTHENTICATION.md
- ERROR_HANDLING.md

### The Problem

**Document Types Mixed Together**:

1. **Architecture patterns** (how we structure code)
2. **Component specifications** (individual UI components)
3. **Integration guides** (how systems connect)
4. **Implementation details** (too specific for design)

**Redundancy Across Documents**:

- SERVICES.md + individual service docs (LOGIN_SERVICE, DOCUMENT_SERVICE, etc.) repeat the service pattern
- WIDGET_ABSTRACTION.md + individual widget usage (SIDEBAR, NEW_DOCUMENT, etc.)
- ERROR_HANDLING.md + ERROR_DISPLAY.md + DIAGNOSTICS.md
- AUTHENTICATION.md pulls from LOGIN_SERVICE + SUPABASE_AUTH_ADAPTER

### Unifying Insight

**"Design docs should describe patterns, not implementations"**

Current docs mix:

- **Pattern** (the "how" - should be in designs/)
- **Specification** (the "what" - should be in code or minimal docs)
- **Implementation** (the "exactly" - should only be in code)

### Proposed Structure

**Patterns** (8-10 documents):

```
prose/designs/
├── ARCHITECTURE.md          # Overall app structure
├── SERVICE_FRAMEWORK.md     # How all services work (Cascade 1)
├── OVERLAY_SYSTEM.md        # How all overlays work (Cascade 2)
├── ERROR_SYSTEM.md          # How all errors work (Cascade 3)
├── STATE_PATTERNS.md        # How all stores work (Cascade 4)
├── AUTHENTICATION_FLOW.md   # OAuth/JWT pattern
├── DESIGN_TOKENS.md         # Color/typography system
└── ACCESSIBILITY.md         # A11y standards
```

**Component Specs** (move to code):

- README files in component directories
- JSDoc comments on components
- Storybook/vitest examples

**Integration Guides** (prose/guides/):

- Setting up local development
- Deploying to production
- Adding new features

### Documentation Decision Tree

**Where does new documentation go?**

**Ask: Is this about a pattern used across multiple features?**

- YES → Pattern doc in `prose/designs/` (e.g., SERVICE_FRAMEWORK.md)
- NO → Continue...

**Ask: Is this about a specific component/service implementation?**

- YES → README.md in the code directory
- NO → Continue...

**Ask: Is this a how-to guide for developers?**

- YES → Guide in `prose/guides/` (e.g., CONTRIBUTING.md)
- NO → It's probably a code comment, not a document

**Examples:**

- "How do all services handle initialization?" → `prose/designs/SERVICE_FRAMEWORK.md`
- "How do I use the template service?" → `src/lib/services/templates/README.md`
- "How do I set up my dev environment?" → `prose/guides/SETUP.md`
- "Why did we choose this algorithm?" → Code comment in the implementation

### Documentation Standards

**Standard README Template for Components** (`src/lib/components/*/README.md`):

```markdown
# [Component Name]

Brief description (1-2 sentences)

## Features

- Bullet list of key capabilities

## Props/API

TypeScript interface or API reference

## Usage

Code example showing basic usage

## Behavior

Key behaviors and interaction patterns

## Accessibility

ARIA roles, keyboard support, screen reader notes

## Styling

Design tokens, variants, responsive behavior

## Dependencies

What this component requires

## See Also

- [Pattern Doc](link to prose/designs/ if applicable)
```

**Standard README Template for Services** (`src/lib/services/*/README.md`):

```markdown
# [Service Name]

Brief description and purpose

> **Pattern**: This service follows the [Pattern Name](../../../prose/designs/PATTERN.md)

## Usage

Quick start code examples

## API Reference

Methods, types, parameters

## Error Handling

Error types and how to handle them

## Implementation Details

Singleton? Async? Important internals?

## Testing

How to test code using this service

## See Also

- [Pattern Doc](link to prose/designs/ if applicable)
```

**Size Guidelines:**

| Document Type     | Target        | Maximum   | If Exceeded                                      |
| ----------------- | ------------- | --------- | ------------------------------------------------ |
| Pattern docs      | 200-400 lines | 600 lines | Split into multiple patterns or extract examples |
| Component READMEs | 100-250 lines | 350 lines | Component may be too complex, consider splitting |
| Service READMEs   | 150-300 lines | 400 lines | May need sub-modules                             |

**Warning Signs Documentation is Wrong:**

1. **1,050 lines** (WIDGET_ABSTRACTION.md) - Should be ~300 line pattern + component READMEs
2. **Cross-references everywhere** - Information is duplicated
3. **"See also" list > 5 items** - Too many related docs = redundancy
4. **Last updated > 6 months ago** - Drifted from code, move to code
5. **Implementation code examples** - Examples belong in tests, not docs

**Current examples:**

- ✅ `src/lib/errors/README.md` (125 lines) - Perfect size
- ✅ `src/lib/components/NewDocumentDialog/README.md` (216 lines) - Good size
- ✅ `src/lib/services/templates/README.md` (278 lines) - Good size
- ❌ `prose/designs/frontend/WIDGET_ABSTRACTION.md` (1,050 lines) - Too large

### When to Create Documentation

**Always create README for:**

- ✅ Public APIs (services, stores, utilities)
- ✅ Reusable components used in 3+ places
- ✅ Complex components (>200 lines of code)
- ✅ Components with accessibility requirements
- ✅ Services with initialization lifecycle

**README optional for:**

- ⚠️ Simple components (<100 lines, no complex behavior)
- ⚠️ Private utilities used in one place
- ⚠️ Components with obvious props and behavior

**No README needed for:**

- ❌ Simple wrappers with no logic
- ❌ Type definitions (use JSDoc comments instead)
- ❌ Single-use components (document in parent)

**Use JSDoc comments instead when:**

- Component is <50 lines
- Props are self-explanatory
- No special behavior or accessibility needs

**Create pattern doc when:**

- Same pattern used in 3+ components/services
- Pattern has architectural significance
- Pattern involves multiple files/systems
- Need to explain "why" not just "how"
