# Frontend Architecture

## Overview

TongueToQuill is a professional single-page application built with SvelteKit 5, designed for editing heavily formatted documents like USAF official memos. The architecture follows SvelteKit best practices with server-side rendering, progressive enhancement, and type-safe development.

## Technology Stack

- **Framework**: SvelteKit 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **State Management**: Svelte 5 runes ($state, $derived, $effect)
- **Form Handling**: SvelteKit form actions
- **Authentication**: JWT-based (Keycloak/Supabase)
- **Document Rendering**: Quillmark integration
- **Icons**: Lucide Svelte
- **Notifications**: Svelte Sonner

## Project Structure

```
src/
├── lib/
│   ├── components/           # Reusable UI components
│   │   ├── layout/          # Layout components (Sidebar, TopMenu)
│   │   ├── editor/          # Editor components (Toolbar, Editor, Preview)
│   │   ├── ui/              # Generic UI components (Button, Dialog, etc.)
│   │   └── document/        # Document-specific components
│   ├── stores/              # Global state stores
│   ├── services/            # API service layer
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── config/              # Configuration constants
├── routes/
│   ├── (app)/               # Protected app routes
│   │   ├── editor/          # Document editor
│   │   ├── documents/       # Document management
│   │   └── settings/        # User settings
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   └── logout/
│   └── (marketing)/         # Public routes
│       ├── about/
│       ├── privacy/
│       └── terms/
└── app.html                 # Root HTML template
```

## Routing Architecture

### Route Groups

**Protected Routes** `(app)`:
- Require authentication
- Load user context in layout
- Redirect to login if unauthenticated

**Auth Routes** `(auth)`:
- Handle login/logout flows
- Redirect to app if authenticated

**Marketing Routes** `(marketing)`:
- Public pages
- No authentication required

### Page Load Strategy

```typescript
// +page.ts - Universal load (runs on server and client)
export const load = async ({ fetch, params }) => {
  // Fetch initial data
  return { documents, templates }
}

// +page.server.ts - Server-only load
export const load = async ({ locals, params }) => {
  // Access server-only resources
  return { user: locals.user }
}
```

## Component Architecture

### Component Patterns

**Layout Components**: 
- Persistent across navigation
- Handle global state
- Manage authentication state

**Page Components**: 
- Route-specific views
- Use data from load functions
- Handle form actions

**Reusable Components**: 
- Pure, presentational
- Accept props via Svelte 5 snippets
- Emit events for interactions

### Component Communication

```typescript
// Parent to child: Props
<EditorToolbar 
  onFormat={handleFormat}
  mode={editorMode}
/>

// Child to parent: Callbacks
function handleFormat(type: string) {
  // Handle formatting
}

// Global state: Stores
import { user } from '$lib/stores/auth'
```

## State Management

### Svelte 5 Runes

**Component State** (`$state`):
```typescript
let isExpanded = $state(false)
let files = $state<File[]>([])
```

**Derived State** (`$derived`):
```typescript
let activeFile = $derived(
  files.find(f => f.id === activeFileId)
)
```

**Side Effects** (`$effect`):
```typescript
$effect(() => {
  // Auto-save when content changes
  if (autoSave && content) {
    saveDocument(content)
  }
})
```

### Global Stores

Use stores for truly global state:
- User authentication state
- Application preferences
- Notification queue

```typescript
// lib/stores/auth.ts
import { writable } from 'svelte/store'

export const user = writable<User | null>(null)
export const isAuthenticated = writable(false)
```

## Server-Side Architecture

### API Routes

**Endpoints** (`/api/*`):
```typescript
// src/routes/api/documents/+server.ts
export async function GET({ locals }) {
  const documents = await getDocuments(locals.user.id)
  return json(documents)
}

export async function POST({ request, locals }) {
  const data = await request.json()
  const doc = await createDocument(data, locals.user.id)
  return json(doc, { status: 201 })
}
```

### Form Actions

**Server Actions** (`+page.server.ts`):
```typescript
export const actions = {
  updateDocument: async ({ request, locals }) => {
    const data = await request.formData()
    const content = data.get('content')
    
    await updateDocument(id, content, locals.user.id)
    
    return { success: true }
  }
}
```

## Authentication Flow

### Session Management

```typescript
// hooks.server.ts
export async function handle({ event, resolve }) {
  const token = event.cookies.get('access_token')
  
  if (token) {
    event.locals.user = await verifyToken(token)
  }
  
  return resolve(event)
}
```

### Protected Routes

```typescript
// (app)/+layout.server.ts
export const load = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login')
  }
  
  return { user: locals.user }
}
```

## Progressive Enhancement

### Forms

All forms work without JavaScript:
```svelte
<form method="POST" action="?/createDocument" use:enhance>
  <input name="title" required />
  <button>Create</button>
</form>
```

With JavaScript:
- Optimistic UI updates
- Client-side validation
- Loading states

### Navigation

- Server-side navigation works by default
- Client-side navigation for speed (SvelteKit default)
- Fallback to full page load on error

## Performance Optimization

### Code Splitting

- Automatic route-based splitting
- Dynamic imports for heavy components
- Lazy load Quillmark engine

```typescript
const QuillmarkPreview = lazy(() => 
  import('$lib/components/QuillmarkPreview.svelte')
)
```

### Data Loading

- Parallel data fetching in load functions
- Streaming with promises
- Cache responses where appropriate

### Rendering

- SSR for initial page load (SEO, performance)
- Client-side hydration for interactivity
- Debounce preview updates (50ms)

## Error Handling

### Error Pages

```typescript
// +error.svelte
<script>
  import { page } from '$app/stores'
</script>

<h1>{$page.status}: {$page.error.message}</h1>
```

### Error Boundaries

```typescript
// Catch errors in load functions
export const load = async () => {
  try {
    return await fetchData()
  } catch (error) {
    throw error(500, 'Failed to load data')
  }
}
```

## Build Configuration

### Adapters

Development/Preview:
- `@sveltejs/adapter-auto`

Production Options:
- `@sveltejs/adapter-node` (self-hosted)
- `@sveltejs/adapter-vercel` (Vercel)
- `@sveltejs/adapter-cloudflare` (Cloudflare Pages)

### Environment Variables

```
PUBLIC_API_URL=https://api.tonguetoquill.com
PUBLIC_APP_NAME=TongueToQuill
AUTH_PROVIDER=supabase
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

## Development Workflow

### Type Safety

```typescript
// Generate types from backend schemas
import type { Document, User } from '$lib/types/api'

// Use throughout application
const doc: Document = await fetchDocument(id)
```

### Testing Strategy

- Unit tests: Vitest
- Component tests: Testing Library
- E2E tests: Playwright
- Type checking: TypeScript strict mode

## Mobile Considerations

### Responsive Breakpoints

```css
/* Tailwind breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile-Specific Features

- Touch-friendly controls (44x44px minimum)
- Swipe gestures for sidebar
- Bottom sheet for file list
- Native share integration
- Responsive typography scaling

### Adaptive Layout

- Desktop: Split editor/preview
- Tablet: Collapsible preview
- Mobile: Tabbed editor OR preview

## Security

### XSS Prevention

- Sanitize user input
- Use Svelte's automatic escaping
- Validate markdown before rendering

### CSRF Protection

- SvelteKit CSRF tokens
- HTTP-only cookies
- SameSite cookie attribute

### Content Security Policy

```typescript
// svelte.config.js
kit: {
  csp: {
    directives: {
      'default-src': ['self'],
      'script-src': ['self'],
      'style-src': ['self', 'unsafe-inline']
    }
  }
}
```

## Deployment

### Build Process

```bash
npm run build
# Outputs to .svelte-kit/output
```

### Environment Setup

- Configure adapter for target platform
- Set environment variables
- Enable/disable SSR as needed
- Configure prerendering for static pages

### Monitoring

- Error tracking (Sentry)
- Analytics (privacy-focused)
- Performance monitoring (Web Vitals)
