# State Management

## Overview

Tonguetoquill uses a hybrid state management approach leveraging SvelteKit 5's runes system for reactive local state, stores for global application state, and server-side state management for data persistence.

## Svelte 5 Runes

### Reactive State (`$state`)

**Component-Local State**: Primitive values, objects, and arrays that trigger reactivity when modified

**Deep Reactivity**: Nested object changes automatically trigger updates

**Class-Based State**: Organize related state in classes with methods

### Derived State (`$derived`)

**Computed Values**: Auto-update when dependencies change

**Complex Derivations**: Support for filtering, mapping, and transformations

**Performance**: Only recompute when dependencies actually change

### Side Effects (`$effect`)

**Auto-Save**: Trigger save operations after content changes

**Change Tracking**: Monitor for unsaved changes

**External Sync**: Synchronize with localStorage, WebSocket, etc.

**Cleanup**: Return cleanup function to prevent memory leaks

## Global Stores

### Writable Stores

**Authentication Store**:
- User information
- Authentication status
- Loading state
- Login/logout methods

**Preferences Store**:
- Theme selection
- Auto-save setting
- Line numbers toggle
- Font size
- Persisted to localStorage

**Document Store**:
- Document list
- Active document ID
- Loading/error states
- CRUD operations

### Derived Stores

**Computed from Multiple Stores**:
- Dark mode (from preferences + system)
- User permissions (from auth + role)
- Filtered documents (from documents + search)

### Readable Stores

**Time-Based Updates**: Current time, session duration, auto-refresh intervals

## Form State Management

### SvelteKit Form Actions

**Server-Side Handling**:
- Form validation on server
- Database operations
- Return success/failure responses
- Type-safe form data

**Progressive Enhancement**:
- Works without JavaScript (standard POST)
- Enhanced with JavaScript (optimistic updates, loading states)
- Client-side validation as enhancement
- Fallback to server validation

### Form Patterns

**Basic Forms**: Standard HTML submission to server actions

**Enhanced Forms**: `use:enhance` directive for better UX

**Optimistic Updates**: Update UI immediately, rollback on error

**Loading States**: Show progress during submission

**Error Handling**: Display validation errors, preserve user input

## Document State Management

### Document Store Pattern

**State Structure**:
- Documents array
- Active document ID
- Loading/error states

**Operations**:
- Load documents from server
- Set active document
- Update document content
- Mark as saved/dirty
- Add/remove documents

**Derived Data**:
- Active document
- Unsaved changes indicator
- Document count

### Auto-Save Pattern

**Debounced Saves**:
- Wait for pause in typing
- Configurable delay
- Cancel on unmount

**Optimistic Updates**:
- Mark as saved immediately
- Rollback on server error
- Show error state

## State Persistence

### LocalStorage Persistence

**User Preferences**:
- Theme selection
- Editor settings
- UI state (sidebar expanded, etc.)

**Strategy**:
- Load on mount
- Save on change
- Handle storage events for cross-tab sync

### IndexedDB for Large Data

**Use Cases**:
- Offline document storage
- Large file caching
- Binary data (future: images)

**Benefits**:
- Better performance than localStorage
- Larger storage capacity
- Structured data storage

## Context API

### Provider Pattern

**Use For**:
- Dependency injection
- Avoiding prop drilling
- Component trees
- Feature-specific state

### Context Usage

**Providing Context**: Use `setContext` in parent component

**Consuming Context**: Use `getContext` in child components

**Type Safety**: Define TypeScript interfaces for context

## State Patterns Summary

### When to Use Each

**`$state` Rune**:
- Component-local state
- UI state (expanded, selected, focused)
- Form inputs
- Temporary calculations

**Stores**:
- Global application state
- Cross-component communication
- Persistent state
- Shared derived state

**Form Actions**:
- Server-validated data
- Database operations
- File uploads
- Authentication flows

**Context API**:
- Dependency injection
- Feature-specific state
- Avoiding prop drilling
- Component trees

**Page Data**:
- Initial page data
- SSR data
- Route-specific data
- URL-based state

## State Best Practices

### Guidelines

**Keep State Close**: Use component-local state when possible

**Avoid Over-Storing**: Don't duplicate data in multiple stores

**Normalize Data**: Use IDs and lookups for related data

**Derive Don't Duplicate**: Use `$derived` instead of storing computed values

**Clean Up**: Always clean up effects and subscriptions

### Performance

**Minimize Reactivity**: Only make reactive what needs to be

**Batch Updates**: Group related state changes

**Debounce Expensive Operations**: Delay re-renders for rapid changes

**Memoize Derived State**: Prevent unnecessary recalculations

### Type Safety

**Define Interfaces**: TypeScript types for all state

**Type Stores**: Proper generic types for stores

**Validate Form Data**: Runtime validation of server responses

**Type Context**: Define types for context values

## State Flow Examples

### Authentication Flow

1. User submits login form
2. Form action validates credentials
3. Server sets HTTP-only cookie
4. Auth store updated with user data
5. Protected routes accessible
6. UI updates to show authenticated state

### Document Editing Flow

1. User types in editor
2. Local state updates immediately
3. Effect triggers auto-save after delay
4. Server persists changes
5. Document marked as saved
6. Error handling if save fails

### Preference Changes Flow

1. User toggles theme
2. Preference store updated
3. Effect persists to localStorage
4. CSS classes updated
5. Theme applied across app
6. State synced across tabs

## State Testing Strategies

### Component State Testing

- Test initial state
- Test state updates
- Test derived values
- Test effect cleanup

### Store Testing

- Test store mutations
- Test derived stores
- Test subscriptions
- Test persistence

### Form Testing

- Test submission without JS
- Test enhanced submission
- Test validation
- Test error handling
