# Frontend Architecture

## Overview

TongueToQuill is a professional single-page application built with SvelteKit 5, designed for editing heavily formatted documents like USAF official memos. The architecture follows SvelteKit best practices with server-side rendering, progressive enhancement, and type-safe development.

## Technology Stack

- **Framework**: SvelteKit 5 with TypeScript
- **Styling**: Tailwind CSS 4.0
- **State Management**: Svelte 5 runes and stores
- **Authentication**: JWT-based (Keycloak or Supabase)
- **Document Rendering**: Quillmark integration
- **UI Components**: Lucide Svelte icons, Svelte Sonner notifications

## Project Structure

```
src/
├── lib/
│   ├── components/           # Reusable UI components
│   │   ├── layout/          # Sidebar, TopMenu
│   │   ├── editor/          # Toolbar, Editor, Preview
│   │   ├── ui/              # Generic components (Button, Dialog, Toast)
│   │   └── document/        # Document-specific components
│   ├── stores/              # Global state stores
│   ├── services/            # API service layer
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript definitions
│   └── config/              # Configuration
├── routes/
│   ├── (app)/               # Protected routes (editor, documents, settings)
│   ├── (auth)/              # Auth routes (login, logout)
│   └── (marketing)/         # Public routes (about, privacy, terms)
└── app.html                 # Root template
```

## Routing Architecture

### Route Groups

**Protected Routes `(app)`**: Require authentication, redirect to login if not authenticated
**Auth Routes `(auth)`**: Login/logout flows, redirect to app if already authenticated
**Marketing Routes `(marketing)`**: Public pages accessible without authentication

### Data Loading Strategy

- **Universal Load**: Runs on both server and client for public data
- **Server Load**: Server-only for session data and protected resources
- Protected routes load user context in layout, handle redirects automatically

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

### Reactive State (Svelte 5 Runes)

- **$state**: Component-local reactive variables
- **$derived**: Auto-computed values from dependencies
- **$effect**: Side effects on reactive changes

### Global Stores

For application-wide state:
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

Breakpoints: 640px (mobile), 768px (tablet), 1024px (desktop), 1280px+ (large)

### Adaptive Layouts

- **Desktop**: Sidebar + split editor/preview
- **Tablet**: Drawer sidebar + collapsible preview
- **Mobile**: Full-screen drawer + tabbed editor/preview

### Mobile Features

- Touch-optimized controls (44px min)
- Swipe gestures for navigation
- Bottom sheet patterns
- Native share integration

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
