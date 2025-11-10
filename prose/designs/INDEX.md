# Architecture & Design Documentation

**Purpose**: Design documents describing Tonguetoquill's architectural patterns and desired state.

**Principle**: Design docs describe patterns, not implementations. Component/service specifications live in code READMEs.

---

## Quick Navigation

### Core Patterns (8 Documents)

All pattern documents live in `prose/designs/` (flat structure):

1. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Overall app structure, SvelteKit routing, component organization
2. **[SERVICE_FRAMEWORK.md](SERVICE_FRAMEWORK.md)** - Client & server service patterns, API integration
3. **[OVERLAY_SYSTEM.md](OVERLAY_SYSTEM.md)** - Unified overlay system (Dialog, Popover, Sheet, Toast, Select)
4. **[ERROR_SYSTEM.md](ERROR_SYSTEM.md)** - Error handling across all layers (WASM → Service → UI)
5. **[STATE_PATTERNS.md](STATE_PATTERNS.md)** - Store factory patterns, auto-save, guest mode
6. **[AUTHENTICATION.md](AUTHENTICATION.md)** - OAuth flow and authentication patterns
7. **[DESIGN_TOKENS.md](DESIGN_TOKENS.md)** - Design tokens (colors, spacing, typography, z-index)
8. **[ACCESSIBILITY.md](ACCESSIBILITY.md)** - WCAG 2.1 Level AA compliance standards

---

## Pattern Summaries

### Application Architecture

**[ARCHITECTURE.md](ARCHITECTURE.md)**:

- SvelteKit 5 with TypeScript
- Feature-based component organization
- SSR with progressive enhancement
- Guest mode + authenticated mode
- Mobile-responsive patterns

### Service Framework

**[SERVICE_FRAMEWORK.md](SERVICE_FRAMEWORK.md)**:

- Client services: Singleton pattern with async initialization (QuillMark, Templates)
- Server services: Factory pattern for environment selection (Documents, Auth, Users)
- API integration patterns
- Error handling and retry strategies

### Overlay System

**[OVERLAY_SYSTEM.md](OVERLAY_SYSTEM.md)**:

- Unified widget abstraction (Dialog, Popover, Sheet, Toast, Select)
- Composable behavior hooks
- Accessibility-first implementation
- Responsive mobile patterns

### Error System

**[ERROR_SYSTEM.md](ERROR_SYSTEM.md)**:

- AppError base class for all services
- Type-safe error codes per domain
- Structured diagnostics from QuillMark
- Consistent UI display patterns
- Accessibility-compliant error presentation

### State Management

**[STATE_PATTERNS.md](STATE_PATTERNS.md)**:

- Store factory patterns (collection, registry, simple state)
- Auto-save pattern with debouncing
- Dual storage strategy (localStorage vs API)
- Guest mode handling
- Svelte 5 runes ($state, $derived, $effect)

### Authentication

**[AUTHENTICATION.md](AUTHENTICATION.md)**:

- OAuth flow (login → callback → token → session)
- Guest mode fallback
- JWT token management
- Session refresh
- Provider abstraction

### Design Tokens

**[DESIGN_TOKENS.md](DESIGN_TOKENS.md)**:

- CSS custom properties for all design values
- Tailwind CSS integration via `@theme inline`
- Light/dark theme variants
- Z-index layering strategy
- Typography, spacing, color scales

### Accessibility

**[ACCESSIBILITY.md](ACCESSIBILITY.md)**:

- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader support
- Focus management
- High contrast support

---

## Component & Service Documentation

**Component READMEs** (in code, next to implementation):

```
src/lib/components/
├── Sidebar/README.md
├── TopMenu/README.md
├── MarkdownEditor/README.md
├── QuillmarkPreview/README.md
├── NewDocumentDialog/README.md
└── ... (see components for specific docs)
```

**Service READMEs** (in code, next to implementation):

```
src/lib/services/
├── documents/README.md
├── login/README.md
├── quillmark/README.md
├── templates/README.md
└── user/README.md
```

**Adapter READMEs** (in code, next to implementation):

```
src/lib/adapters/supabase/
├── auth/README.md
└── database/README.md
```

**Standard Templates**:

- See [DESIGNS_CASCADE.md](../plans/completed/DESIGNS_CASCADE.md) for README templates

---

## Documentation Decision Tree

**Where does new documentation go?**

### Is this about a pattern used across multiple features?

**YES** → Pattern doc in `prose/designs/` (e.g., SERVICE_FRAMEWORK.md)

**NO** → Continue...

### Is this about a specific component/service implementation?

**YES** → README.md in the code directory (e.g., `src/lib/components/Sidebar/README.md`)

**NO** → Continue...

### Is this a how-to guide for developers?

**YES** → Guide in `prose/guides/` (e.g., CONTRIBUTING.md)

**NO** → It's probably a code comment, not a document

### Examples

- "How do all services handle initialization?" → `prose/designs/SERVICE_FRAMEWORK.md`
- "How do I use the template service?" → `src/lib/services/templates/README.md`
- "How do I set up my dev environment?" → `prose/guides/SETUP.md`
- "Why did we choose this algorithm?" → Code comment in the implementation

---

## Design Standards

### Pattern Document Guidelines

**Target Size**: 200-400 lines
**Maximum**: 600 lines
**If Exceeded**: Split into multiple patterns or extract examples to code READMEs

**Structure**:

1. Overview (purpose, TL;DR)
2. Design principles
3. Pattern specification
4. Usage examples (brief)
5. Cross-references

### Component README Guidelines

**Target Size**: 100-250 lines
**Maximum**: 400 lines
**If Exceeded**: Component may be too complex, consider splitting

**Standard Template**:

```markdown
# [Component Name]

Brief description (1-2 sentences)

> **Pattern**: This component follows the [Pattern Name](../../../prose/designs/PATTERN.md)

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

### Service README Guidelines

**Target Size**: 150-300 lines
**Maximum**: 400 lines

**Standard Template**:

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

---

## Maintenance

### One Canonical Source Per Topic

- If docs overlap, consolidate or cross-reference
- Delete obsolete docs after consolidation
- Fix broken links when renaming/moving

### Keep Skimmable

- Examples over prose
- Bullets over paragraphs
- Code samples brief and focused

### Warning Signs Documentation is Wrong

1. **> 600 lines** - Should be ~300 line pattern + component READMEs
2. **Cross-references everywhere** - Information duplicated
3. **"See also" list > 5 items** - Too many related docs = redundancy
4. **Last updated > 6 months ago** - Drifted from code, move to code
5. **Implementation code examples** - Examples belong in tests, not docs

---

## Related Resources

- **Implementation Plans**: `prose/plans/` (current and completed)
- **Architect Agent**: `.github/agents/Architect.md`
- **Programmer Agent**: `.github/agents/Programmer.md`
- **Design Cascade**: `prose/plans/completed/DESIGNS_CASCADE.md`

---

## Migration Status

**Consolidated** (from 35 docs → 8 patterns):

- ✅ Backend services → SERVICE_FRAMEWORK.md
- ✅ Frontend components → ARCHITECTURE.md + component READMEs
- ✅ QuillMark integration → SERVICE_FRAMEWORK.md + ERROR_SYSTEM.md
- ✅ State management → STATE_PATTERNS.md
- ✅ Design system → DESIGN_TOKENS.md
- ✅ Z-index strategy → DESIGN_TOKENS.md
- ✅ Error handling → ERROR_SYSTEM.md

**Preserved** (already good patterns):

- ✅ OVERLAY_SYSTEM.md
- ✅ AUTHENTICATION.md
- ✅ ACCESSIBILITY.md

**Obsolete Directories Removed**:

- `prose/designs/backend/` - Content consolidated into patterns
- `prose/designs/frontend/` - Content consolidated into patterns
- `prose/designs/quillmark/` - Content consolidated into patterns
- `prose/designs/patterns/` - Moved to root of prose/designs/

---

_Last Updated: 2025-11-09_
_Status: Consolidated (Cascade: Design Document Proliferation)_
