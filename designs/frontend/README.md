# Frontend Design Documentation

## Overview

This directory contains high-level design documentation for the TongueToQuill frontend rewrite using SvelteKit 5. The design maintains the professional VSCode-inspired aesthetic from the legacy implementation while modernizing the architecture, adding mobile support, and ensuring Section 508 compliance.

## Design Documents

### [ARCHITECTURE.md](./ARCHITECTURE.md)
**SvelteKit 5 Application Architecture**

High-level overview of application structure, routing strategy, component organization, and deployment considerations.

**Topics**: Project structure, route groups, component hierarchy, state management patterns, progressive enhancement, mobile architecture, security, deployment

---

### [UI_COMPONENTS.md](./UI_COMPONENTS.md)
**Component Specifications**

Component design specifications including layout, editor, and UI components with responsive and accessibility considerations.

**Topics**: Layout components (Sidebar, TopMenu), editor components (Toolbar, Editor, Preview), UI library (Button, Dialog, Toast), responsive patterns, touch interactions, animations

---

### [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
**Visual Design Language**

Visual design system defining colors, typography, spacing, and other design tokens for consistent UI across platforms.

**Topics**: Color palette (dark/light/high-contrast), typography system, spacing scale, border radius, shadows, icons, transitions, responsive breakpoints, accessibility features

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

Backend API integration patterns for authentication, document management, and data synchronization.

**Topics**: API client architecture, authentication flows, document CRUD, error handling, optimistic updates, real-time updates, type safety, performance optimization

---

## Design Principles

### 1. SvelteKit 5 Best Practices
- Leverage Svelte 5 runes for reactive state
- Use file-based routing with route groups
- Implement progressive enhancement
- Server-side rendering for performance
- Type-safe development with TypeScript

### 2. Mobile-First Design
- Responsive layouts at all breakpoints (640px, 768px, 1024px, 1280px)
- Touch-optimized interactions (44px minimum targets)
- Adaptive UI patterns (drawer, bottom sheet, tabs)
- Native-feeling gestures and animations
- Performance optimization for mobile devices

### 3. Section 508 Compliance
- Keyboard accessibility for all functionality
- Screen reader support with semantic HTML and ARIA
- Sufficient color contrast (4.5:1 minimum)
- Visible focus indicators
- Alternative text for images
- Proper form labels and error messages

### 4. Professional Aesthetic
- VSCode-inspired dark theme with zinc-900 palette
- Clean, minimal interface
- Smooth transitions (300ms standard)
- Consistent spacing and typography
- Professional document rendering with Quillmark

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

The frontend integrates with backend services documented in `designs/backend/`:

### Authentication (AUTH.md)
- JWT-based authentication (Keycloak or Supabase)
- HTTP-only cookies for token storage
- Automatic token refresh
- Protected route handling

### Document Management (SERVICES.md, SCHEMAS.md)
- Document CRUD operations
- Multi-user support with ownership
- Real-time collaboration (future)
- Quillmark template rendering

## Implementation Guidelines

### Getting Started
1. Review ARCHITECTURE.md for project structure
2. Study UI_COMPONENTS.md for component patterns
3. Reference DESIGN_SYSTEM.md for styling
4. Implement ACCESSIBILITY.md requirements
5. Use STATE_MANAGEMENT.md patterns for state
6. Follow API_INTEGRATION.md for backend communication

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

**UI**: Lucide Svelte (icons), Svelte Sonner (toasts)

**Document Rendering**: Quillmark, markdown with remark-gfm

**Authentication**: JWT tokens, HTTP-only cookies, Keycloak or Supabase

## Key Patterns

### Responsive Layout
- **Desktop**: Sidebar (224px/48px) + split editor/preview (50/50)
- **Tablet**: Drawer sidebar + split view (60/40)
- **Mobile**: Full-screen drawer + tabbed editor OR preview

### State Management
- Component-local: Svelte 5 runes ($state, $derived, $effect)
- Global: Svelte stores for auth, preferences, documents
- Server: Form actions for validated operations

### Progressive Enhancement
- Base: Forms work without JavaScript (HTTP POST)
- Enhanced: Optimistic updates, client validation, loading states
- Fallback: Server handles all validation

## References

### SvelteKit
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)

### Design
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

### Accessibility
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Section 508](https://www.section508.gov/)

### Backend
- See `designs/backend/` for API specifications
- See `designs/legacy/QUILLMARK_INTEGRATION.md` for rendering

## Document Maintenance

When updating documentation:
1. Keep high-level focus
2. Avoid implementation details
3. Update cross-references
4. Maintain consistency
5. Version significant changes

---

*Last Updated: October 28, 2025*
