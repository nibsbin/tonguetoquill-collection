# Frontend Architecture

## Overview

Tonguetoquill is a professional single-page application built with SvelteKit 5, designed for editing heavily formatted documents like USAF official memos. The architecture follows SvelteKit best practices with server-side rendering, progressive enhancement, and type-safe development.

## Technology Stack

- **Framework**: SvelteKit 5 with TypeScript
- **Styling**: Tailwind CSS 4.0
- **State Management**: Svelte 5 runes and stores
- **Authentication**: JWT-based (Keycloak or Supabase)
- **Document Rendering**: Quillmark integration
- **UI Components**: shadcn-svelte (includes icons and notifications)

## Routing Architecture

### Route Structure

The application uses a simple, flat route structure without route groups:

- `src/routes/+page.svelte` → Main application at `/`
- `src/routes/api/*` → API endpoints for backend communication

### Main Routes

**Root Route `/`**: Main application accessible without authentication (guest mode)

- Guest users can explore the app and create documents (stored in browser localStorage only)
- Authenticated users get full functionality with server persistence
- Shows authentication prompt banner for features requiring authentication
- Login button visible in top menu for guests

**Authentication Flow**:

See [../backend/LOGIN_SERVICE.md](../backend/LOGIN_SERVICE.md) for complete OAuth flow and authentication architecture. Frontend initiates login via `/api/auth/login` redirect.

### Guest Mode vs Authenticated Mode

**Guest Mode** (No Authentication Required):

- Access to app interface at `/`
- Can create and edit documents
- Documents stored in browser localStorage only
- "Sign in to save your work" banner displayed
- Limited to browser-local functionality

**Authenticated Mode** (After Login):

- Full document CRUD with server persistence
- Documents synced to user account
- Option to import localStorage documents on first login
- Access to all features without restrictions

### Data Loading Strategy

- **Universal Load**: Runs on both server and client for public data
- **Server Load**: Server-only for session data and protected resources
- **Optional Authentication**: Root route checks for auth but doesn't require it
- **Progressive Enhancement**: Guest experience works without server, auth adds features

## Component Architecture

### Component Organization

Components are organized by feature in `src/lib/components/`:

- **DocumentList/**: Document list and item components
- **Editor/**: Markdown editor components (DocumentEditor, MarkdownEditor, EditorToolbar)
- **Preview/**: Document preview components
- **Sidebar/**: Sidebar navigation and drawer components
- **TopMenu/**: Top menu bar component
- **ui/**: Reusable UI primitives from shadcn-svelte (Button, Dialog, Dropdown, etc.)

See [COMPONENT_ORGANIZATION.md](./COMPONENT_ORGANIZATION.md) for detailed structure, testing patterns, and file naming conventions.

### Component Hierarchy

- **Layout Components**: Persistent across navigation, manage global state
- **Page Components**: Route-specific views, consume data from load functions
- **Reusable Components**: Pure presentational, props-based communication

### Communication Patterns

- Parent to child via props
- Child to parent via callbacks/events
- Cross-component via global stores (documentStore, toastStore)
- Notifications via svelte-sonner (Toaster component)

## State Management

See [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) for detailed state management patterns.

### Reactive State Pattern

Component-local reactive state for:

- UI state (expanded/collapsed, selected items)
- Form inputs and validation
- Temporary calculations

SvelteKit 5 provides reactive primitives for component state, derived values, and side effects.

### Global Stores

Application-wide state using Svelte 5 runes (`$state`, `$derived`, `$effect`):

- **documentStore**: Document list, active document, loading states
- **toastStore**: Toast notifications (wrapper around svelte-sonner)
- Authentication state managed via server-side session (HTTP-only cookies)

### Form State

Server-side validation with progressive enhancement:

- Works without JavaScript (standard form submission)
- Enhanced with JavaScript (optimistic updates, client validation)

## Server-Side Architecture

### API Routes

RESTful API endpoints in `src/routes/api/`:

**Authentication** (`/api/auth/*`):

- `GET /api/auth/login` - Initiate OAuth flow
- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Sign out
- `POST /api/auth/refresh` - Refresh token

**Documents** (`/api/documents/*`):

- `GET /api/documents` - List user documents
- `POST /api/documents` - Create document
- `GET /api/documents/[id]` - Get document with content
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document
- `GET /api/documents/[id]/metadata` - Get metadata only

### Session Management

See [../backend/LOGIN_SERVICE.md](../backend/LOGIN_SERVICE.md) for token management and session details. Frontend supports guest mode fallback for unauthenticated users.

## Progressive Enhancement

### Core Philosophy

- Base functionality works without JavaScript
- JavaScript enhances user experience
- Graceful degradation for older browsers

### Enhancement Patterns

- API communication via fetch() for authenticated users
- Guest mode uses localStorage for client-side persistence
- Navigation server-rendered, client-enhanced
- Loading states added progressively with Svelte transitions

## Performance Strategy

### Code Splitting

- Automatic route-based splitting
- Dynamic imports for heavy components
- Lazy loading non-critical features

### Rendering Approach

- SSR for initial page load
- Client hydration for interactivity
- Debounced updates for auto-save (4 seconds)
- Live preview updates with Quillmark integration

### Data Fetching

- Parallel loading where possible
- Promise streaming for faster perceived performance
- Strategic caching

## Mobile Architecture

### Responsive Design

See [DESIGN_SYSTEM.md - Breakpoint Behavior](./DESIGN_SYSTEM.md#breakpoint-behavior) for complete responsive specifications.

Breakpoints: 640px (mobile), 768px (tablet), 1024px (desktop), 1280px+ (large)

### Adaptive Layouts

- **Desktop**: Sidebar + split editor/preview
- **Tablet**: Drawer sidebar + collapsible preview
- **Mobile**: Full-screen drawer + tabbed editor/preview

### Mobile Features

- Touch-optimized controls (44px minimum targets)
- Bottom sheet patterns for mobile dialogs
- Native share integration (where available)

## Security Architecture

### Protection Layers

- XSS prevention (automatic escaping)
- CSRF tokens
- HTTP-only session cookies
- Content Security Policy
- Input validation (client and server)

### Authentication Security

See [../backend/LOGIN_SERVICE.md](../backend/LOGIN_SERVICE.md) for authentication security architecture.

Frontend security measures:

- XSS prevention via automatic Svelte escaping
- CSRF protection via SameSite cookie attribute
- Tokens managed server-side only (never exposed to JavaScript)

## Build & Deployment

### Build Strategy

- TypeScript compilation
- Component bundling
- Asset optimization
- Server build for SSR

### Deployment Options

- adapter-auto: Development
- adapter-node: Self-hosted
- adapter-vercel: Vercel
- adapter-cloudflare: Cloudflare Pages

### Production Considerations

- SSR configuration
- Static page prerendering
- Error tracking setup
- Analytics integration
- Performance monitoring
