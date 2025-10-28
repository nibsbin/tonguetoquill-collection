# State Management

## Overview

TongueToQuill uses a hybrid state management approach leveraging SvelteKit 5's new runes system for reactive local state, stores for global application state, and server-side state management for data persistence.

## Svelte 5 Runes

### Reactive State (`$state`)

**Component-Local State**:
```svelte
<script>
  // Primitive values
  let count = $state(0)
  let isExpanded = $state(false)
  
  // Complex objects
  let user = $state({
    name: '',
    email: ''
  })
  
  // Arrays
  let files = $state<File[]>([])
  
  // Deep reactivity
  let document = $state({
    title: '',
    metadata: {
      author: '',
      date: new Date()
    }
  })
  
  // Updates trigger reactivity
  function updateTitle() {
    document.title = 'New Title' // Reactive
    document.metadata.author = 'John' // Also reactive
  }
</script>
```

**Class-Based State**:
```svelte
<script>
  class DocumentState {
    content = $state('')
    isDirty = $state(false)
    lastSaved = $state<Date | null>(null)
    
    updateContent(newContent: string) {
      this.content = newContent
      this.isDirty = true
    }
    
    markSaved() {
      this.isDirty = false
      this.lastSaved = new Date()
    }
  }
  
  let doc = new DocumentState()
</script>
```

### Derived State (`$derived`)

**Computed Values**:
```svelte
<script>
  let files = $state<File[]>([])
  let activeFileId = $state<string | null>(null)
  
  // Auto-updates when dependencies change
  let activeFile = $derived(
    files.find(f => f.id === activeFileId)
  )
  
  let fileName = $derived(
    activeFile?.name || 'untitled.md'
  )
  
  let fileCount = $derived(files.length)
  
  let hasUnsavedChanges = $derived(
    files.some(f => f.isDirty)
  )
</script>

<h2>{fileName}</h2>
<p>{fileCount} documents</p>
```

**Complex Derivations**:
```svelte
<script>
  let documents = $state<Document[]>([])
  let searchQuery = $state('')
  let filterStatus = $state<'all' | 'draft' | 'published'>('all')
  
  let filteredDocuments = $derived(() => {
    let result = documents
    
    // Filter by search
    if (searchQuery) {
      result = result.filter(d => 
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(d => d.status === filterStatus)
    }
    
    return result
  })
</script>
```

### Side Effects (`$effect`)

**Auto-Save Implementation**:
```svelte
<script>
  let content = $state('')
  let autoSaveEnabled = $state(true)
  let lastSaved = $state<Date | null>(null)
  
  $effect(() => {
    if (!autoSaveEnabled || !content) return
    
    const timeoutId = setTimeout(async () => {
      await saveDocument(content)
      lastSaved = new Date()
    }, 2000) // 2 second debounce
    
    return () => clearTimeout(timeoutId)
  })
</script>
```

**Tracking Changes**:
```svelte
<script>
  let document = $state({ title: '', content: '' })
  let originalContent = $state('')
  
  let isDirty = $derived(
    JSON.stringify(document) !== JSON.stringify(originalContent)
  )
  
  // Warn before leaving with unsaved changes
  $effect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  })
</script>
```

**Synchronizing with External State**:
```svelte
<script>
  import { user } from '$lib/stores/auth'
  
  let localUser = $state<User | null>(null)
  
  // Sync local state with store
  $effect(() => {
    const unsubscribe = user.subscribe(value => {
      localUser = value
    })
    
    return unsubscribe
  })
</script>
```

## Global Stores

### Writable Stores

**Authentication Store**:
```typescript
// lib/stores/auth.ts
import { writable } from 'svelte/store'
import type { User } from '$lib/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  })
  
  return {
    subscribe,
    setUser: (user: User) => update(state => ({
      ...state,
      user,
      isAuthenticated: true,
      isLoading: false
    })),
    clearUser: () => set({
      user: null,
      isAuthenticated: false,
      isLoading: false
    }),
    setLoading: (isLoading: boolean) => update(state => ({
      ...state,
      isLoading
    }))
  }
}

export const auth = createAuthStore()
```

**Preferences Store**:
```typescript
// lib/stores/preferences.ts
import { writable } from 'svelte/store'
import { browser } from '$app/environment'

interface Preferences {
  theme: 'light' | 'dark' | 'system'
  autoSave: boolean
  lineNumbers: boolean
  fontSize: number
}

const defaultPrefs: Preferences = {
  theme: 'dark',
  autoSave: true,
  lineNumbers: true,
  fontSize: 16
}

function createPreferencesStore() {
  // Load from localStorage on client
  const stored = browser 
    ? localStorage.getItem('preferences')
    : null
  
  const initial = stored 
    ? { ...defaultPrefs, ...JSON.parse(stored) }
    : defaultPrefs
  
  const { subscribe, set, update } = writable<Preferences>(initial)
  
  // Persist to localStorage on change
  if (browser) {
    subscribe(value => {
      localStorage.setItem('preferences', JSON.stringify(value))
    })
  }
  
  return {
    subscribe,
    set,
    update,
    setTheme: (theme: Preferences['theme']) => 
      update(p => ({ ...p, theme })),
    toggleAutoSave: () => 
      update(p => ({ ...p, autoSave: !p.autoSave })),
    toggleLineNumbers: () =>
      update(p => ({ ...p, lineNumbers: !p.lineNumbers })),
    setFontSize: (fontSize: number) =>
      update(p => ({ ...p, fontSize }))
  }
}

export const preferences = createPreferencesStore()
```

### Derived Stores

**Computed from Multiple Stores**:
```typescript
// lib/stores/derived.ts
import { derived } from 'svelte/store'
import { auth } from './auth'
import { preferences } from './preferences'

export const isDarkMode = derived(
  preferences,
  $prefs => {
    if ($prefs.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return $prefs.theme === 'dark'
  }
)

export const canEditDocuments = derived(
  auth,
  $auth => $auth.isAuthenticated && $auth.user?.role !== 'viewer'
)
```

### Readable Stores

**Time-Based Store**:
```typescript
// lib/stores/clock.ts
import { readable } from 'svelte/store'

export const currentTime = readable(new Date(), set => {
  const interval = setInterval(() => {
    set(new Date())
  }, 1000)
  
  return () => clearInterval(interval)
})
```

## Form State Management

### SvelteKit Form Actions

**Server-Side Form Handling**:
```typescript
// routes/(app)/documents/+page.server.ts
import type { Actions } from './$types'
import { fail } from '@sveltejs/kit'

export const actions = {
  createDocument: async ({ request, locals }) => {
    const data = await request.formData()
    const title = data.get('title')
    
    if (!title) {
      return fail(400, { 
        title, 
        error: 'Title is required' 
      })
    }
    
    const document = await createDocument({
      title: title.toString(),
      ownerId: locals.user.id
    })
    
    return { success: true, document }
  },
  
  updateDocument: async ({ request, locals }) => {
    const data = await request.formData()
    const id = data.get('id')
    const content = data.get('content')
    
    await updateDocument(id, { content }, locals.user.id)
    
    return { success: true }
  },
  
  deleteDocument: async ({ request, locals }) => {
    const data = await request.formData()
    const id = data.get('id')
    
    await deleteDocument(id, locals.user.id)
    
    return { success: true }
  }
} satisfies Actions
```

**Client-Side Form Enhancement**:
```svelte
<!-- routes/(app)/documents/+page.svelte -->
<script>
  import { enhance } from '$app/forms'
  
  let isSubmitting = $state(false)
  let formError = $state<string | null>(null)
</script>

<form 
  method="POST" 
  action="?/createDocument"
  use:enhance={() => {
    isSubmitting = true
    formError = null
    
    return async ({ result, update }) => {
      isSubmitting = false
      
      if (result.type === 'failure') {
        formError = result.data.error
      } else if (result.type === 'success') {
        // Optionally reset form or redirect
        await update()
      }
    }
  }}
>
  <input 
    name="title" 
    placeholder="Document title"
    required
  />
  
  {#if formError}
    <p class="error">{formError}</p>
  {/if}
  
  <button disabled={isSubmitting}>
    {isSubmitting ? 'Creating...' : 'Create Document'}
  </button>
</form>
```

### Progressive Enhancement

**Works Without JavaScript**:
```svelte
<form method="POST" action="?/updateDocument">
  <input type="hidden" name="id" value={document.id} />
  <textarea name="content" bind:value={content}></textarea>
  <button>Save</button>
</form>
```

**Enhanced With JavaScript**:
```svelte
<script>
  import { enhance } from '$app/forms'
  
  let optimisticContent = $state(content)
  
  function handleSubmit() {
    return async ({ formData, update }) => {
      // Optimistic update
      const newContent = formData.get('content')
      optimisticContent = newContent
      
      // Wait for server response
      await update()
    }
  }
</script>

<form method="POST" use:enhance={handleSubmit}>
  <textarea name="content" bind:value={optimisticContent}></textarea>
  <button>Save</button>
</form>
```

## Document State Management

### Document Store Pattern

```typescript
// lib/stores/documents.ts
import { writable, derived } from 'svelte/store'
import type { Document } from '$lib/types'

interface DocumentsState {
  documents: Document[]
  activeId: string | null
  isLoading: boolean
  error: string | null
}

function createDocumentsStore() {
  const { subscribe, set, update } = writable<DocumentsState>({
    documents: [],
    activeId: null,
    isLoading: false,
    error: null
  })
  
  return {
    subscribe,
    
    // Load documents from server
    async load(userId: string) {
      update(s => ({ ...s, isLoading: true, error: null }))
      
      try {
        const response = await fetch(`/api/documents?userId=${userId}`)
        const documents = await response.json()
        
        update(s => ({
          ...s,
          documents,
          isLoading: false,
          activeId: documents[0]?.id || null
        }))
      } catch (error) {
        update(s => ({
          ...s,
          isLoading: false,
          error: error.message
        }))
      }
    },
    
    // Set active document
    setActive(id: string) {
      update(s => ({ ...s, activeId: id }))
    },
    
    // Update document content
    updateContent(id: string, content: string) {
      update(s => ({
        ...s,
        documents: s.documents.map(d => 
          d.id === id ? { ...d, content, isDirty: true } : d
        )
      }))
    },
    
    // Mark as saved
    markSaved(id: string) {
      update(s => ({
        ...s,
        documents: s.documents.map(d =>
          d.id === id ? { ...d, isDirty: false, lastSaved: new Date() } : d
        )
      }))
    },
    
    // Add document
    add(document: Document) {
      update(s => ({
        ...s,
        documents: [...s.documents, document],
        activeId: document.id
      }))
    },
    
    // Remove document
    remove(id: string) {
      update(s => {
        const filtered = s.documents.filter(d => d.id !== id)
        return {
          ...s,
          documents: filtered,
          activeId: s.activeId === id ? filtered[0]?.id || null : s.activeId
        }
      })
    }
  }
}

export const documents = createDocumentsStore()

// Derived stores
export const activeDocument = derived(
  documents,
  $docs => $docs.documents.find(d => d.id === $docs.activeId)
)

export const hasUnsavedChanges = derived(
  documents,
  $docs => $docs.documents.some(d => d.isDirty)
)
```

### Using Document Store

```svelte
<script>
  import { documents, activeDocument } from '$lib/stores/documents'
  import { auth } from '$lib/stores/auth'
  
  // Load documents on mount
  $effect(() => {
    if ($auth.user) {
      documents.load($auth.user.id)
    }
  })
  
  // Auto-save active document
  $effect(() => {
    if (!$activeDocument?.isDirty) return
    
    const timeout = setTimeout(async () => {
      await saveDocument($activeDocument.id, $activeDocument.content)
      documents.markSaved($activeDocument.id)
    }, 2000)
    
    return () => clearTimeout(timeout)
  })
</script>

{#if $documents.isLoading}
  <p>Loading documents...</p>
{:else if $documents.error}
  <p class="error">{$documents.error}</p>
{:else}
  <DocumentList documents={$documents.documents} />
  
  {#if $activeDocument}
    <Editor 
      content={$activeDocument.content}
      onchange={(content) => documents.updateContent($activeDocument.id, content)}
    />
  {/if}
{/if}
```

## State Persistence

### LocalStorage Persistence

```typescript
// lib/utils/persistence.ts
import { browser } from '$app/environment'

export function persistStore<T>(
  key: string,
  store: Writable<T>
) {
  if (!browser) return
  
  // Load initial value
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      store.set(JSON.parse(stored))
    } catch (e) {
      console.error('Failed to parse stored state:', e)
    }
  }
  
  // Persist on changes
  store.subscribe(value => {
    localStorage.setItem(key, JSON.stringify(value))
  })
}
```

### IndexedDB for Large Data

```typescript
// lib/utils/indexeddb.ts
import { openDB } from 'idb'

const DB_NAME = 'tonguetoquill'
const STORE_NAME = 'documents'

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
  })
}

export async function saveDocument(document: Document) {
  const db = await initDB()
  await db.put(STORE_NAME, document)
}

export async function getDocument(id: string) {
  const db = await initDB()
  return db.get(STORE_NAME, id)
}

export async function getAllDocuments() {
  const db = await initDB()
  return db.getAll(STORE_NAME)
}

export async function deleteDocument(id: string) {
  const db = await initDB()
  await db.delete(STORE_NAME, id)
}
```

## Context API

### Providing Context

```svelte
<!-- lib/components/DocumentProvider.svelte -->
<script>
  import { setContext } from 'svelte'
  
  let documents = $state<Document[]>([])
  let activeId = $state<string | null>(null)
  
  const context = {
    get documents() { return documents },
    get activeId() { return activeId },
    setActive: (id: string) => activeId = id,
    updateContent: (id: string, content: string) => {
      const doc = documents.find(d => d.id === id)
      if (doc) doc.content = content
    }
  }
  
  setContext('documents', context)
</script>

<slot />
```

### Consuming Context

```svelte
<script>
  import { getContext } from 'svelte'
  
  const { documents, activeId, setActive } = getContext('documents')
</script>

{#each documents as doc}
  <button 
    onclick={() => setActive(doc.id)}
    class:active={doc.id === activeId}
  >
    {doc.title}
  </button>
{/each}
```

## State Patterns Summary

### When to Use Each

**`$state` Rune**:
- Component-local state
- UI state (expanded, selected, focused)
- Form inputs
- Temporary state

**Stores**:
- Global application state
- Cross-component communication
- Persistent state (localStorage)
- Shared derived state

**Form Actions**:
- Server-validated data
- Database operations
- File uploads
- Authentication

**Context API**:
- Dependency injection
- Avoiding prop drilling
- Component trees
- Provider pattern

**Page Data**:
- Initial page data
- SSR data
- Navigation state
- Route params
