# Frontend Design Documentation

## Overview

This directory contains comprehensive design documentation for the TongueToQuill frontend rewrite using SvelteKit 5. The design maintains the professional VSCode-inspired aesthetic from the legacy implementation while modernizing the architecture, adding mobile support, and ensuring Section 508 compliance.

## Design Documents

### [ARCHITECTURE.md](./ARCHITECTURE.md)
**SvelteKit 5 Application Architecture**
- Project structure and organization
- Routing strategy with route groups
- Server-side and client-side patterns
- Component architecture patterns
- Progressive enhancement approach
- Build and deployment configuration
- Performance optimization strategies

**Key Concepts**: SvelteKit 5, TypeScript, SSR, Progressive Enhancement, Route Groups

---

### [UI_COMPONENTS.md](./UI_COMPONENTS.md)
**Component Specifications**
- Layout components (Sidebar, TopMenu)
- Editor components (Toolbar, Editor, Preview)
- UI component library (Button, Dialog, Toast, etc.)
- Document-specific components
- Responsive patterns for all screen sizes
- Mobile adaptations and touch interactions
- Component state management with Svelte 5 runes

**Key Concepts**: Component Design, Mobile-First, Touch Interactions, Accessibility

---

### [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
**Visual Design Language**
- Color palette (dark theme, light theme, high contrast)
- Typography system (fonts, scales, line heights)
- Spacing system and layout measurements
- Border radius and shadows
- Icon system (Lucide Svelte)
- Transitions and animations
- Responsive design breakpoints
- Design tokens and CSS variables

**Key Concepts**: Design System, Theming, Responsive Design, Design Tokens

---

### [ACCESSIBILITY.md](./ACCESSIBILITY.md)
**Section 508 & WCAG 2.1 Level AA Compliance**
- Section 508 requirements implementation
- WCAG 2.1 principles (Perceivable, Operable, Understandable, Robust)
- Screen reader support patterns
- Keyboard navigation strategy
- Color contrast requirements
- Focus management
- ARIA usage guidelines
- Touch target sizing
- Testing procedures and checklists

**Key Concepts**: Accessibility, Section 508, WCAG 2.1, ARIA, Keyboard Navigation

---

### [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
**State Management with Svelte 5 Runes**
- Svelte 5 runes (`$state`, `$derived`, `$effect`)
- Global stores (authentication, preferences, documents)
- Form state with SvelteKit form actions
- Progressive enhancement patterns
- Document state management
- State persistence (localStorage, IndexedDB)
- Context API usage
- When to use each state pattern

**Key Concepts**: Svelte 5 Runes, Stores, Form Actions, Progressive Enhancement

---

### [API_INTEGRATION.md](./API_INTEGRATION.md)
**Backend Integration & Communication**
- API client architecture
- Authentication flows (login, logout, token refresh)
- Document CRUD operations
- Error handling and retries
- Optimistic updates
- Real-time updates (WebSocket)
- Type-safe API calls
- Loading states and pagination

**Key Concepts**: API Integration, Authentication, Error Handling, Type Safety

---

## Design Principles

### 1. SvelteKit 5 Best Practices
- Use Svelte 5 runes for reactive state
- Leverage SvelteKit's file-based routing
- Implement progressive enhancement
- Server-side rendering for performance
- Type-safe development with TypeScript

### 2. Mobile-First Design
- Responsive layouts at all breakpoints
- Touch-friendly interactions (44x44px minimum)
- Adaptive UI patterns (drawer, bottom sheet, tabs)
- Optimized performance for mobile devices
- Native-feeling gestures and animations

### 3. Section 508 Compliance
- Keyboard accessibility throughout
- Screen reader support with ARIA
- Sufficient color contrast (4.5:1 minimum)
- Focus indicators always visible
- Alternative text for all images
- Forms with proper labels and error messages

### 4. Professional Aesthetic
- VSCode-inspired dark theme
- Clean, minimal interface
- Smooth transitions (300ms standard)
- Consistent spacing and typography
- Professional document rendering with Quillmark

### 5. Performance First
- Code splitting by route
- Lazy loading for heavy components
- Debounced preview updates
- Optimized bundle sizes
- Fast initial page loads

## Legacy Design Compatibility

The new design maintains visual compatibility with the legacy React implementation while modernizing the technical foundation:

### Preserved Elements
- **Color Palette**: Zinc-900 dark theme with brand blue (#355e93)
- **Layout**: Collapsible sidebar, split editor/preview, top menu
- **Typography**: System fonts for UI, monospace for editor, serif for preview
- **Interactions**: 300ms transitions, hover states, active states
- **Components**: Sidebar, TopMenu, EditorToolbar, MarkdownEditor, MarkdownPreview

### Modernized Elements
- **Framework**: React → SvelteKit 5
- **State**: React hooks → Svelte 5 runes + stores
- **Routing**: Client-only → File-based with SSR
- **Forms**: Client-side → Progressive enhancement with form actions
- **Mobile**: Desktop-only → Fully responsive
- **Accessibility**: Basic → Section 508 compliant

## Backend Integration

The frontend is designed to integrate with the backend services documented in `designs/backend/`:

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
4. Implement ACCESSIBILITY.md requirements throughout
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
- [ ] Color contrast meets WCAG AA
- [ ] Mobile-responsive at all breakpoints
- [ ] Touch targets minimum 44x44px
- [ ] Forms work without JavaScript
- [ ] Screen reader tested
- [ ] Performance budget met
- [ ] SSR working correctly
- [ ] Section 508 compliant

## Technology Stack Summary

**Core**:
- SvelteKit 5 (Framework)
- TypeScript (Language)
- Tailwind CSS 4.0 (Styling)

**State & Data**:
- Svelte 5 runes (Component state)
- Svelte stores (Global state)
- Form actions (Server state)

**UI & Components**:
- Lucide Svelte (Icons)
- Svelte Sonner (Toasts)
- Custom component library

**Document Rendering**:
- Quillmark (Professional output)
- Markdown rendering with remark-gfm

**Authentication**:
- JWT tokens
- HTTP-only cookies
- Keycloak or Supabase

## References

### SvelteKit Resources
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [Svelte Tutorial](https://learn.svelte.dev/)

### Design Resources
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Section 508](https://www.section508.gov/)

### Backend Integration
- See `designs/backend/` for API specifications
- See `designs/legacy/QUILLMARK_INTEGRATION.md` for rendering

## Maintenance

### Updating Documentation
When making significant changes:
1. Update relevant design documents
2. Keep code examples current
3. Update technology stack if changed
4. Revise implementation guidelines
5. Update this README if structure changes

### Version History
- **v1.0** (Current): Initial SvelteKit 5 design documentation
  - Complete architecture specification
  - Mobile-responsive design
  - Section 508 compliance
  - Backend integration patterns

## Contact

For questions or clarifications about the frontend design:
1. Review the relevant design document first
2. Check legacy design docs for context
3. Ensure consistency with design principles
4. Document any proposed changes

---

*Last Updated: October 28, 2025*
