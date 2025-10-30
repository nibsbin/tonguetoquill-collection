# Frontend Design Documentation

## Overview

This directory contains high-level design documentation for the Tonguetoquill frontend rewrite using SvelteKit 5. The design maintains the professional VSCode-inspired aesthetic from the legacy implementation while modernizing the architecture, adding mobile support, and ensuring Section 508 compliance.

## Design Documents

### [ARCHITECTURE.md](./ARCHITECTURE.md)

**SvelteKit 5 Application Architecture**

High-level overview of application structure, routing strategy, component organization, and deployment considerations.

**Topics**: Project structure, route groups, component hierarchy, state management patterns, progressive enhancement, mobile architecture, security, deployment

---

### [UI_COMPONENTS.md](./UI_COMPONENTS.md)

**Component Specifications**

Component behavior specifications including props, states, interactions, and accessibility requirements. References [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for all visual styling.

**Topics**: Layout components (Sidebar, TopMenu), editor components (Toolbar, Editor, Preview), UI library (Button, Dialog, Toast, Dropdown), responsive patterns, accessibility

---

### [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

**Visual Design Language & Design Tokens**

**Single source of truth** for all visual design decisions: colors, typography, spacing, shadows, animations, breakpoints, and component sizing. All other documents reference this for visual specifications.

**Topics**: Dark theme color palette, typography system, spacing scale, border radius, shadows, icons, transitions, responsive breakpoints, accessibility features, keyboard shortcuts, auto-save behavior, form validation, navigation patterns, loading states, classification message

---

### [ACCESSIBILITY.md](./ACCESSIBILITY.md)

**Section 508 & WCAG 2.1 Level AA Compliance**

Accessibility requirements and implementation strategies for Section 508 compliance and WCAG 2.1 Level AA.

**Topics**: Section 508 requirements, WCAG principles (Perceivable, Operable, Understandable, Robust), screen reader support, keyboard navigation, testing procedures, compliance checklist

---

### [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)

**State Management Patterns**

State management approach using Svelte 5 runes, global stores, and server-side state.

**Topics**: Svelte 5 runes ($state, $derived, $effect), global stores, form state, document management, persistence strategies, context API, best practices

---

### [API_INTEGRATION.md](./API_INTEGRATION.md)

**Backend Integration**

Backend API integration patterns for authentication, document management, and data synchronization. See [prose/designs/backend/AUTH.md](../backend/AUTH.md) for authentication details.

**Topics**: API client architecture, authentication flows, document CRUD, error handling, optimistic updates, type safety

---

### [MARKDOWN_EDITOR.md](./MARKDOWN_EDITOR.md)

**CodeMirror 6 Markdown Editor**

CodeMirror 6 integration with custom language mode for Quillmark's extended markdown syntax. Covers syntax highlighting, code folding, and intelligent editing features for inline metadata blocks.

**Topics**: CodeMirror 6 architecture, custom language mode, extended markdown syntax (SCOPE/QUILL), folding strategy, syntax highlighting, auto-completion, accessibility, mobile optimization, performance

---

### [COMPONENT_ORGANIZATION.md](./COMPONENT_ORGANIZATION.md)

**Component Organization Strategy**

Feature-based component organization with co-located tests and optional styles. Defines directory structure, file naming conventions, and testing patterns.

**Topics**: Feature folders (Sidebar, TopMenu, Editor, Preview), file structure per component, testing strategy, migration from flat structure, import patterns
### [UX_IMPROVEMENTS_2025.md](./UX_IMPROVEMENTS_2025.md)

**UX Improvements 2025**

Specifications for UX enhancements including Document Info dialog, keyboard shortcuts removal, and minimal markdown toolbar redesign.

**Topics**: Document Info dialog (metadata and statistics display), keyboard shortcuts removal (rely on semantic HTML and CodeMirror), minimal markdown toolbar (streamlined formatting buttons), accessibility improvements

---

## Design Principles

### 1. SvelteKit 5 Best Practices

- Leverage Svelte 5 runes for reactive state
- Use file-based routing with route groups
- Implement progressive enhancement
- Server-side rendering for performance
- Type-safe development with TypeScript

### 2. Mobile-First Design

- Responsive layouts at all breakpoints (see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md#breakpoint-behavior))
- Touch-optimized interactions (44px minimum targets)
- Adaptive UI patterns (drawer, bottom sheet, tabs)
- Performance optimization for mobile devices

### 3. Section 508 Compliance

- Keyboard accessibility for all functionality
- Screen reader support with semantic HTML and ARIA
- Sufficient color contrast (4.5:1 minimum)
- Visible focus indicators
- Alternative text for images
- Proper form labels and error messages

### 4. Professional Aesthetic

- VSCode-inspired dark theme (see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md#color-palette))
- Clean, minimal interface
- Smooth transitions (see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md#transitions--animations))
- Consistent spacing and typography
- Professional document rendering

### 5. Performance First

- Code splitting by route
- Lazy loading for heavy components
- Debounced preview updates
- Optimized bundle sizes
- Fast initial page loads with SSR

## Legacy Design Compatibility

The new design maintains visual compatibility with the legacy React implementation while modernizing the technical foundation:

### Preserved Elements

- **Color Palette**: Zinc-900 dark theme with USAF blue (#355e93)
- **Layout**: Collapsible sidebar, split editor/preview, top menu
- **Typography**: System fonts for UI, monospace for editor, serif for preview
- **Interactions**: 300ms transitions, hover states, toast notifications
- **Components**: Sidebar, TopMenu, EditorToolbar, MarkdownEditor, MarkdownPreview

### Modernized Elements

- **Framework**: React → SvelteKit 5
- **State**: React hooks → Svelte 5 runes + stores
- **Routing**: Client-only → File-based with SSR
- **Forms**: Client-side → Progressive enhancement
- **Mobile**: Desktop-only → Fully responsive
- **Accessibility**: Basic → Section 508 compliant

## Backend Integration

The frontend integrates with backend services documented in `prose/designs/backend/`:

### Authentication (AUTH.md)

- JWT-based authentication (Keycloak or Supabase)
- HTTP-only cookies for token storage
- Automatic token refresh
- Protected route handling

### Document Management (SERVICES.md, SCHEMAS.md)

- Document CRUD operations
- Single-user ownership model (no sharing in MVP)
- Basic document metadata

## Implementation Guidelines

### Getting Started

1. Review [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for all visual design tokens and patterns
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for project structure
3. Review [COMPONENT_ORGANIZATION.md](./COMPONENT_ORGANIZATION.md) for component structure and testing
4. Study [UI_COMPONENTS.md](./UI_COMPONENTS.md) for component behavior
5. Review [MARKDOWN_EDITOR.md](./MARKDOWN_EDITOR.md) for editor implementation details
6. Implement [ACCESSIBILITY.md](./ACCESSIBILITY.md) requirements
7. Use [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) patterns for state
8. Follow [API_INTEGRATION.md](./API_INTEGRATION.md) for backend communication

### Development Workflow

1. Build components mobile-first
2. Test keyboard navigation early
3. Verify color contrast regularly
4. Test with screen readers
5. Validate progressive enhancement
6. Monitor bundle sizes

### Quality Checklist

- [ ] TypeScript strict mode passing
- [ ] All components keyboard accessible
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Mobile-responsive at all breakpoints
- [ ] Touch targets minimum 44x44px
- [ ] Forms work without JavaScript
- [ ] Screen reader tested
- [ ] Performance budget met
- [ ] SSR working correctly
- [ ] Section 508 compliant

## Technology Stack

**Core**: SvelteKit 5, TypeScript, Tailwind CSS 4.0

**State**: Svelte 5 runes, Svelte stores, form actions

**UI**: shadcn-svelte (component library with icons and toasts)

**Editor**: CodeMirror 6 with custom language mode (see [MARKDOWN_EDITOR.md](./MARKDOWN_EDITOR.md))

**Document Rendering**: Quillmark for preview rendering

**Authentication**: JWT tokens, HTTP-only cookies, Keycloak or Supabase

## Key Patterns

### Responsive Layout

See [DESIGN_SYSTEM.md - Navigation Patterns](./DESIGN_SYSTEM.md#navigation-patterns) for detailed breakpoint behavior.

- **Desktop (≥1024px)**: Sidebar (224px/48px) + split editor/preview
- **Tablet (768px-1023px)**: Drawer sidebar + split or tabbed view
- **Mobile (<768px)**: Drawer sidebar + tabbed editor OR preview

### State Management

See [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) for detailed patterns.

- Component-local: Svelte 5 runes ($state, $derived, $effect)
- Global: Svelte stores for auth, preferences, documents
- Server: Form actions for validated operations

### Auto-Save

See [DESIGN_SYSTEM.md - Auto-Save Behavior](./DESIGN_SYSTEM.md#auto-save-behavior) for complete specification.

- 7-second debounce after last keystroke
- Manual save via Ctrl/Cmd+S
- Conflict resolution: last write wins

### Form Validation

See [DESIGN_SYSTEM.md - Form Validation Strategy](./DESIGN_SYSTEM.md#form-validation-strategy) for complete specification.

- Client-side: Progressive enhancement, immediate feedback
- Server-side: Authoritative validation
- Display: Inline errors + error summary

### Progressive Enhancement

- Base: Forms work without JavaScript (HTTP POST)
- Enhanced: Optimistic updates, client validation, loading states
- Fallback: Server handles all validation

## MVP Scope

### Included Features

- Single-user document editing
- Markdown editor with formatting toolbar
- Live preview pane
- Auto-save with 7-second debounce
- Document list (create, open, delete)
- User authentication
- Classification message (toast notification)
- Keyboard shortcuts
- Mobile-responsive layout
- Section 508 compliance

### Explicitly Excluded from MVP

- Document templates (blank markdown only)
- Document sharing/collaboration
- Version history
- Offline support
- Search and filter
- Quillmark integration (post-MVP)

## References

### SvelteKit

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)

### Design

- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn-svelte](https://www.shadcn-svelte.com/)

### Accessibility

- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Section 508](https://www.section508.gov/)

### Backend

- See `prose/designs/backend/` for API specifications
- See `prose/designs/backend/AUTH.md` for authentication details

## Document Maintenance

When updating documentation:

1. Keep high-level focus (avoid implementation details)
2. Update cross-references when moving content
3. DESIGN_SYSTEM.md is single source of truth for visual design
4. Maintain consistency across documents
5. Version significant changes

---

_Last Updated: October 29, 2025_
