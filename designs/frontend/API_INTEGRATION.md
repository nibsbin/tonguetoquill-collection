# API Integration & Backend Communication

## Overview

TongueToQuill integrates with a RESTful backend API for authentication, document management, and user profiles. The frontend handles authentication flows, API communication, and error handling while maintaining a responsive user experience.

## API Architecture

### Base Configuration

```typescript
// lib/config/api.ts
export const API_CONFIG = {
  baseUrl: import.meta.env.PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
}

export const ENDPOINTS = {
  // Auth
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/auth/me',
  
  // Documents
  documents: '/api/documents',
  document: (id: string) => `/api/documents/${id}`,
  
  // User
  profile: '/api/profile',
  preferences: '/api/preferences'
} as const
```

### API Client

```typescript
// lib/services/api.ts
import { goto } from '$app/navigation'
import { API_CONFIG, ENDPOINTS } from '$lib/config/api'

interface RequestOptions extends RequestInit {
  timeout?: number
  retry?: boolean
}

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

class APIClient {
  private baseUrl: string
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeout = API_CONFIG.timeout, retry = true, ...init } = options
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...init,
        signal: controller.signal,
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
          ...init.headers
        }
      })
      
      clearTimeout(timeoutId)
      
      // Handle authentication errors
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshToken()
        if (refreshed && retry) {
          // Retry original request
          return this.request(endpoint, { ...options, retry: false })
        } else {
          // Redirect to login
          goto('/login')
          throw new APIError('Unauthorized', 401)
        }
      }
      
      // Handle other errors
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new APIError(
          data?.message || 'Request failed',
          response.status,
          data
        )
      }
      
      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        return {} as T
      }
      
      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof APIError) {
        throw error
      }
      
      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', 408)
      }
      
      throw new APIError('Network error', 0, error)
    }
  }
  
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }
  
  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
  
  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
  
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
  
  private async refreshToken(): Promise<boolean> {
    try {
      await this.post(ENDPOINTS.refresh)
      return true
    } catch {
      return false
    }
  }
}

export const api = new APIClient(API_CONFIG.baseUrl)
```

## Authentication Integration

### Login Flow

```typescript
// lib/services/auth.ts
import { api } from './api'
import { ENDPOINTS } from '$lib/config/api'
import type { User, LoginCredentials } from '$lib/types'

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await api.post<{ user: User }>(
    ENDPOINTS.login,
    credentials
  )
  return response.user
}

export async function logout(): Promise<void> {
  await api.post(ENDPOINTS.logout)
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<{ user: User }>(ENDPOINTS.me)
    return response.user
  } catch (error) {
    if (error instanceof APIError && error.status === 401) {
      return null
    }
    throw error
  }
}

export async function refreshToken(): Promise<boolean> {
  try {
    await api.post(ENDPOINTS.refresh)
    return true
  } catch {
    return false
  }
}
```

### Login Component

```svelte
<!-- routes/(auth)/login/+page.svelte -->
<script>
  import { enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import type { ActionData } from './$types'
  
  let { form }: { form: ActionData } = $props()
  let isSubmitting = $state(false)
</script>

<form 
  method="POST" 
  use:enhance={() => {
    isSubmitting = true
    
    return async ({ result, update }) => {
      isSubmitting = false
      
      if (result.type === 'redirect') {
        goto(result.location)
      } else {
        await update()
      }
    }
  }}
>
  <h1>Login to TongueToQuill</h1>
  
  <label for="email">Email</label>
  <input 
    id="email"
    name="email" 
    type="email" 
    required 
    autocomplete="email"
    value={form?.email || ''}
  />
  
  <label for="password">Password</label>
  <input 
    id="password"
    name="password" 
    type="password" 
    required
    autocomplete="current-password"
  />
  
  {#if form?.error}
    <p class="error" role="alert">{form.error}</p>
  {/if}
  
  <button disabled={isSubmitting}>
    {isSubmitting ? 'Logging in...' : 'Login'}
  </button>
</form>
```

### Login Server Action

```typescript
// routes/(auth)/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { login } from '$lib/services/auth'

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData()
    const email = data.get('email')
    const password = data.get('password')
    
    if (!email || !password) {
      return fail(400, { 
        email,
        error: 'Email and password are required' 
      })
    }
    
    try {
      const user = await login({
        email: email.toString(),
        password: password.toString()
      })
      
      // Session cookie is set by backend
      // Redirect to app
      throw redirect(303, '/editor')
    } catch (error) {
      return fail(401, {
        email,
        error: 'Invalid email or password'
      })
    }
  }
} satisfies Actions
```

### Protected Routes

```typescript
// routes/(app)/+layout.server.ts
import type { LayoutServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: LayoutServerLoad = async ({ locals }) => {
  // User is set in hooks.server.ts
  if (!locals.user) {
    throw redirect(302, '/login')
  }
  
  return {
    user: locals.user
  }
}
```

### Server Hooks

```typescript
// hooks.server.ts
import type { Handle } from '@sveltejs/kit'
import { getCurrentUser } from '$lib/services/auth'

export const handle: Handle = async ({ event, resolve }) => {
  // Try to get current user from session
  try {
    const user = await getCurrentUser()
    event.locals.user = user
  } catch {
    event.locals.user = null
  }
  
  return resolve(event)
}
```

## Document Management

### Document Service

```typescript
// lib/services/documents.ts
import { api } from './api'
import { ENDPOINTS } from '$lib/config/api'
import type { Document, CreateDocumentData, UpdateDocumentData } from '$lib/types'

export async function getDocuments(userId: string): Promise<Document[]> {
  const response = await api.get<{ documents: Document[] }>(
    `${ENDPOINTS.documents}?userId=${userId}`
  )
  return response.documents
}

export async function getDocument(id: string): Promise<Document> {
  const response = await api.get<{ document: Document }>(
    ENDPOINTS.document(id)
  )
  return response.document
}

export async function createDocument(data: CreateDocumentData): Promise<Document> {
  const response = await api.post<{ document: Document }>(
    ENDPOINTS.documents,
    data
  )
  return response.document
}

export async function updateDocument(
  id: string,
  data: UpdateDocumentData
): Promise<Document> {
  const response = await api.put<{ document: Document }>(
    ENDPOINTS.document(id),
    data
  )
  return response.document
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(ENDPOINTS.document(id))
}
```

### Document CRUD Operations

**Loading Documents**:
```typescript
// routes/(app)/documents/+page.server.ts
import type { PageServerLoad } from './$types'
import { getDocuments } from '$lib/services/documents'

export const load: PageServerLoad = async ({ locals }) => {
  const documents = await getDocuments(locals.user.id)
  
  return {
    documents
  }
}
```

**Creating Documents**:
```typescript
// routes/(app)/documents/+page.server.ts
import type { Actions } from './$types'
import { createDocument } from '$lib/services/documents'

export const actions = {
  create: async ({ request, locals }) => {
    const data = await request.formData()
    const name = data.get('name')
    
    const document = await createDocument({
      name: name.toString(),
      ownerId: locals.user.id,
      content: ''
    })
    
    return { success: true, document }
  }
} satisfies Actions
```

**Updating Documents**:
```typescript
// routes/(app)/editor/[id]/+page.server.ts
import type { Actions } from './$types'
import { updateDocument } from '$lib/services/documents'

export const actions = {
  save: async ({ params, request, locals }) => {
    const data = await request.formData()
    const content = data.get('content')
    
    await updateDocument(params.id, {
      content: content.toString()
    })
    
    return { success: true }
  }
} satisfies Actions
```

## Real-Time Updates (Optional)

### WebSocket Connection

```typescript
// lib/services/websocket.ts
import { writable } from 'svelte/store'

interface WSMessage {
  type: string
  payload: unknown
}

class WSClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  
  public messages = writable<WSMessage[]>([])
  public connected = writable(false)
  
  connect(userId: string) {
    const wsUrl = import.meta.env.PUBLIC_WS_URL || 'ws://localhost:3000/ws'
    this.ws = new WebSocket(`${wsUrl}?userId=${userId}`)
    
    this.ws.onopen = () => {
      this.connected.set(true)
      this.reconnectAttempts = 0
    }
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.messages.update(msgs => [...msgs, message])
    }
    
    this.ws.onclose = () => {
      this.connected.set(false)
      this.reconnect()
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }
  
  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }
    
    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    
    setTimeout(() => {
      this.connect(userId)
    }, delay)
  }
  
  send(message: WSMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }
  
  disconnect() {
    this.ws?.close()
  }
}

export const wsClient = new WSClient()
```

## Error Handling

### Error Boundary Component

```svelte
<!-- lib/components/ErrorBoundary.svelte -->
<script>
  import { onMount } from 'svelte'
  
  let error = $state<Error | null>(null)
  
  onMount(() => {
    const handleError = (event: ErrorEvent) => {
      error = event.error
      event.preventDefault()
    }
    
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  })
</script>

{#if error}
  <div class="error-boundary">
    <h2>Something went wrong</h2>
    <p>{error.message}</p>
    <button onclick={() => window.location.reload()}>
      Reload Page
    </button>
  </div>
{:else}
  <slot />
{/if}
```

### API Error Toast

```svelte
<script>
  import { toast } from 'svelte-sonner'
  import { api } from '$lib/services/api'
  
  async function handleAPICall() {
    try {
      await api.post('/api/documents', { name: 'New Doc' })
      toast.success('Document created')
    } catch (error) {
      if (error instanceof APIError) {
        if (error.status === 400) {
          toast.error('Invalid input')
        } else if (error.status === 403) {
          toast.error('Permission denied')
        } else if (error.status === 404) {
          toast.error('Not found')
        } else if (error.status === 500) {
          toast.error('Server error')
        } else {
          toast.error('Network error')
        }
      } else {
        toast.error('Unknown error occurred')
      }
    }
  }
</script>
```

## Optimistic Updates

### Optimistic Document Update

```svelte
<script>
  import { documents } from '$lib/stores/documents'
  import { updateDocument } from '$lib/services/documents'
  
  async function saveDocument(id: string, content: string) {
    // Optimistic update
    const originalDocs = $documents
    documents.updateContent(id, content)
    documents.markSaved(id)
    
    try {
      // Server update
      await updateDocument(id, { content })
    } catch (error) {
      // Rollback on error
      documents.set(originalDocs)
      toast.error('Failed to save document')
    }
  }
</script>
```

## Data Fetching Patterns

### Loading States

```svelte
<script>
  import { onMount } from 'svelte'
  
  let documents = $state<Document[]>([])
  let isLoading = $state(true)
  let error = $state<string | null>(null)
  
  onMount(async () => {
    try {
      documents = await getDocuments(userId)
    } catch (e) {
      error = e.message
    } finally {
      isLoading = false
    }
  })
</script>

{#if isLoading}
  <LoadingSpinner />
{:else if error}
  <ErrorMessage message={error} />
{:else if documents.length === 0}
  <EmptyState />
{:else}
  <DocumentList {documents} />
{/if}
```

### Pagination

```svelte
<script>
  let page = $state(1)
  let documents = $state<Document[]>([])
  let hasMore = $state(true)
  
  async function loadMore() {
    const response = await api.get(`/api/documents?page=${page}&limit=20`)
    documents = [...documents, ...response.documents]
    hasMore = response.hasMore
    page++
  }
</script>

<DocumentList {documents} />

{#if hasMore}
  <button onclick={loadMore}>Load More</button>
{/if}
```

### Infinite Scroll

```svelte
<script>
  import { onMount } from 'svelte'
  
  let sentinelEl: HTMLDivElement
  
  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })
    
    observer.observe(sentinelEl)
    
    return () => observer.disconnect()
  })
</script>

<DocumentList {documents} />
<div bind:this={sentinelEl}></div>
```

## Type Safety

### API Response Types

```typescript
// lib/types/api.ts
export interface Document {
  id: string
  name: string
  content: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'editor' | 'viewer'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateDocumentData {
  name: string
  ownerId: string
  content: string
}

export interface UpdateDocumentData {
  name?: string
  content?: string
}
```

### Generated Types (Optional)

```typescript
// Use openapi-typescript to generate types from OpenAPI spec
import type { paths } from '$lib/types/generated-api'

type DocumentsResponse = paths['/api/documents']['get']['responses']['200']['content']['application/json']
```
