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

### Route Groups and URL Structure

**Important**: Route groups use parentheses `(groupname)` to organize routes **without affecting the URL path**.

Example:

- `src/routes/(auth)/login/+page.svelte` → URL is `/login` (not `/auth/login`)
- `src/routes/(auth)/register/+page.svelte` → URL is `/register` (not `/auth/register`)

The parentheses create a folder for organization but are removed from the final URL.

### Main Routes

**Root Route `/`**: Main application accessible without authentication (guest mode)

- Guest users can explore the app and create documents (stored in browser localStorage only)
- Authenticated users get full functionality with server persistence
- Shows login/register prompts for features requiring authentication
- Login/register buttons visible in header for guests

**Auth Routes**:

- `/login` - Login page (from `(auth)/login/+page.svelte`)
- `/register` - Registration page (from `(auth)/register/+page.svelte`)
- After authentication, redirect back to `/` with full features unlocked

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

### Component Hierarchy

- **Layout Components**: Persistent across navigation, manage global state
- **Page Components**: Route-specific views, consume data from load functions
- **Reusable Components**: Pure presentational, props-based communication

### Communication Patterns

- Parent to child via props
- Child to parent via callbacks/events
- Cross-component via global stores

## State Management

See [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) for detailed state management patterns.

### Reactive State Pattern

Component-local reactive state for:

- UI state (expanded/collapsed, selected items)
- Form inputs and validation
- Temporary calculations

SvelteKit 5 provides reactive primitives for component state, derived values, and side effects.

### Global Stores

Application-wide state for:

- Authentication status
- User preferences
- Document management

### Form State

Server-side validation with progressive enhancement:

- Works without JavaScript (standard form submission)
- Enhanced with JavaScript (optimistic updates, client validation)

## Server-Side Architecture

### API Routes

RESTful endpoints for:

- Document operations
- User management
- Settings

### Form Actions

Handle server-side:

- Form validation
- Database operations
- File handling
- Authentication

### Session Management

- HTTP-only cookies for tokens
- Automatic token refresh
- Protected route verification
- Redirect handling

## Progressive Enhancement

### Core Philosophy

- Base functionality works without JavaScript
- JavaScript enhances user experience
- Graceful degradation for older browsers

### Enhancement Patterns

- Forms submit via HTTP POST by default
- Enhanced with optimistic UI and validation
- Navigation server-rendered, client-enhanced
- Loading states added progressively

## Performance Strategy

### Code Splitting

- Automatic route-based splitting
- Dynamic imports for heavy components
- Lazy loading non-critical features

### Rendering Approach

- SSR for initial page load
- Client hydration for interactivity
- Debounced updates for live preview

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

- JWT in HTTP-only cookies
- Automatic token refresh
- Session management
- Attack prevention (CSRF, XSS, injection)

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
