# Architecture & Design Documentation

**Purpose**: Design documents describing Tonguetoquill's desired state and architectural patterns.

**How to use**:

- One topic per page
- Each doc is the canonical source for its topic
- Docs cross-reference each other (follow the links)
- For implementation plans, see `prose/plans/`

---

## Quick Navigation

### Backend

- [SERVICES.md](backend/SERVICES.md) - Service architecture pattern (server vs client-side)
- [SCHEMAS.md](backend/SCHEMAS.md) - Database schema (Users, Documents)
- [DOCUMENT_SERVICE.md](backend/DOCUMENT_SERVICE.md) - Document CRUD with dual-mode (guest/auth)
- [LOGIN_SERVICE.md](backend/LOGIN_SERVICE.md) - OAuth authentication with provider abstraction
- [TEMPLATE_SERVICE.md](backend/TEMPLATE_SERVICE.md) - Read-only template service
- [SUPABASE_AUTH_ADAPTER.md](backend/SUPABASE_AUTH_ADAPTER.md) - Supabase auth adapter implementation
- [SUPABASE_DATABASE_ADAPTER.md](backend/SUPABASE_DATABASE_ADAPTER.md) - Supabase database adapter implementation
- [USER_SERVICE.md](backend/USER_SERVICE.md) - User service with first login actions

### Frontend Core

- [ARCHITECTURE.md](frontend/ARCHITECTURE.md) - SvelteKit 5 app structure, routing, and component hierarchy
- [DESIGN_SYSTEM.md](frontend/DESIGN_SYSTEM.md) - Colors, typography, spacing, auto-save behavior, tokens
- [STATE_MANAGEMENT.md](frontend/STATE_MANAGEMENT.md) - Svelte 5 runes, stores, and reactive patterns
- [API_INTEGRATION.md](frontend/API_INTEGRATION.md) - Backend integration, auth flows, error handling
- [COMPONENT_ORGANIZATION.md](frontend/COMPONENT_ORGANIZATION.md) - Feature-based file structure and testing
- [ACCESSIBILITY.md](frontend/ACCESSIBILITY.md) - WCAG 2.1 Level AA compliance

### UI Components

- [SIDEBAR.md](frontend/SIDEBAR.md) - Collapsible sidebar with button slot architecture
- [NEW_DOCUMENT.md](frontend/NEW_DOCUMENT.md) - New document creation with template selection
- [TEMPLATE_SELECTOR.md](frontend/TEMPLATE_SELECTOR.md) - Custom template selector with info tooltips
- [LOGIN_PROFILE_UI.md](frontend/LOGIN_PROFILE_UI.md) - Auth UI in sidebar (guest/logged-in states)
- [LOGO_SIDEBAR.md](frontend/LOGO_SIDEBAR.md) - Logo positioning and animation
- [MARKDOWN_EDITOR.md](frontend/MARKDOWN_EDITOR.md) - CodeMirror 6 integration with QuillMark
- [EMPTY_STATE_EDITOR.md](frontend/EMPTY_STATE_EDITOR.md) - Empty state handling when no document selected
- [ERROR_DISPLAY.md](frontend/ERROR_DISPLAY.md) - Error display patterns and diagnostics
- [SHARE_MODAL.md](frontend/SHARE_MODAL.md) - Share modal dialog (placeholder)

### UI System

- [WIDGET_ABSTRACTION.md](frontend/WIDGET_ABSTRACTION.md) - Custom widget system (BaseDialog, BasePopover, Toast, etc.)
- [WIDGET_THEME_UNIFICATION.md](frontend/WIDGET_THEME_UNIFICATION.md) - Widget theming standards

### UX Patterns

- [POPOVER_SIDEBAR_ALIGNMENT.md](frontend/POPOVER_SIDEBAR_ALIGNMENT.md) - Sidebar popover alignment strategy
- [ZINDEX_STRATEGY.md](frontend/ZINDEX_STRATEGY.md) - Z-index layering and stacking contexts
- See DESIGN_SYSTEM.md § Auto-Save Behavior for save triggers and debounce timing
- See STATE_MANAGEMENT.md § Auto-Save Pattern for implementation details

### QuillMark

- [SERVICE.md](quillmark/SERVICE.md) - QuillmarkService singleton with WASM integration
- [INTEGRATION.md](quillmark/INTEGRATION.md) - WASM build process and Quill management
- [PREVIEW.md](quillmark/PREVIEW.md) - Live preview rendering (SVG/PDF auto-detection)
- [DIAGNOSTICS.md](quillmark/DIAGNOSTICS.md) - Error handling with structured diagnostics
- [PARSE.md](quillmark/PARSE.md) - Extended YAML metadata (SCOPE/QUILL keywords)
- [QUILLMARK_SYNTAX_HIGHLIGHTING.md](quillmark/QUILLMARK_SYNTAX_HIGHLIGHTING.md) - Syntax highlighting for metadata blocks

---

## Cross-Cutting Patterns

- [AUTHENTICATION.md](patterns/AUTHENTICATION.md) - End-to-end OAuth flow (LOGIN_SERVICE → Adapter → API → UI)
- [ERROR_HANDLING.md](patterns/ERROR_HANDLING.md) - Error flow across all layers (WASM → Service → Frontend → UI)

**Document Lifecycle**: See DOCUMENT_SERVICE.md (backend) → STATE_MANAGEMENT.md (stores) → STATE_MANAGEMENT.md § Auto-Save Pattern (persistence)

---

## Directory Structure

```
prose/designs/
├── INDEX.md (this file)
├── backend/        # Server-side services and adapters
├── frontend/       # UI architecture, components, and patterns
└── quillmark/      # QuillMark WASM integration and rendering
```

---

## Related Resources

- **Implementation Plans**: `prose/plans/` (current and completed)
- **Frontend Index**: [frontend/INDEX.md](frontend/INDEX.md) (detailed frontend docs)
- **Architect Agent**: `.github/agents/Architect.md`
- **Programmer Agent**: `.github/agents/Programmer.md`

---

## Maintenance

- **One canonical per topic**: If docs overlap, consolidate or cross-reference
- **Delete completed refactor docs**: Move to plans/completed/ instead
- **Fix broken links**: Update references when renaming/moving docs
- **Keep skimmable**: Use examples over prose, bullets over paragraphs
