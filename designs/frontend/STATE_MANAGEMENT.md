# State Management

## Overview

Tonguetoquill uses a hybrid state management approach with reactive local state, global stores for application-wide state, and server-side state management for data persistence. The implementation leverages SvelteKit 5's reactive system.

## Reactive State Patterns

### Component-Local State

**Purpose**: UI state, form inputs, temporary data within a component

**Characteristics**:
- Reactive updates when values change
- Deep reactivity for nested objects
- Can be organized in classes for related state

### Derived State

**Purpose**: Computed values that auto-update based on dependencies

**Characteristics**:
- Automatically recomputes when dependencies change
- Supports filtering, mapping, transformations
- Performance-optimized (only recalculates when needed)

### Side Effects

**Purpose**: React to state changes with side effects

**Use Cases**:
- Auto-save after content changes (see [DESIGN_SYSTEM.md - Auto-Save](../frontend/DESIGN_SYSTEM.md#auto-save-behavior))
- Change tracking for unsaved indicators
- External synchronization (localStorage, etc.)

**Best Practice**: Always provide cleanup to prevent memory leaks

## Global Stores

### Writable Stores

**Authentication Store**:
- User information
- Authentication status
- Loading state
- Login/logout methods

**Preferences Store**:
- Auto-save setting (enabled/disabled)
- Font size (optional)
- Persisted to localStorage

See [DESIGN_SYSTEM.md - Auto-Save Behavior](../frontend/DESIGN_SYSTEM.md#auto-save-behavior) for auto-save specifications.

**Document Store**:
- Document list
- Active document ID
- Loading/error states
- CRUD operations

### Derived Stores

**Computed from Multiple Stores**:
- User permissions (from auth + role)
- Active document (from document list + active ID)

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

See [DESIGN_SYSTEM.md - Auto-Save Behavior](../frontend/DESIGN_SYSTEM.md#auto-save-behavior) for complete auto-save specifications.

**Implementation**:
- Debounced saves (7 seconds after last keystroke)
- Cancel pending saves on unmount
- Optimistic UI updates
- Error handling and rollback

## State Persistence

### LocalStorage Persistence

**User Preferences**:
- Auto-save setting (enabled/disabled)
- Editor settings (font size, etc.)
- UI state (sidebar expanded/collapsed)

**Strategy**:
- Load on mount
- Save on change
- Handle storage events for cross-tab sync

## Context API

### Provider Pattern

**Use For**:
- Dependency injection
- Avoiding prop drilling
- Component trees
- Feature-specific state

### Context Usage

**Providing Context**: Parent component provides values to descendant tree

**Consuming Context**: Child components access provided values

**Type Safety**: Define TypeScript interfaces for all context values

## State Patterns Summary

### When to Use Each Pattern

**Component-Local State**:
- UI state (expanded, selected, focused)
- Form inputs
- Temporary calculations
- Data that doesn't need to be shared

**Global Stores**:
- Application-wide state (auth, preferences, documents)
- Cross-component communication
- Persistent state
- Shared derived state

**Form Actions** (Server-side):
- Server-validated data
- Database operations
- File uploads
- Authentication flows

**Context API**:
- Dependency injection
- Feature-specific state
- Avoiding prop drilling through many levels
- Component tree configuration

**Page Data** (SSR):
- Initial page data loaded on server
- Route-specific data
- URL-based state
- SEO-critical data

## State Best Practices

### Guidelines

**Keep State Close**: Use component-local state when possible, only elevate when needed

**Avoid Over-Storing**: Don't duplicate data across multiple stores

**Normalize Data**: Use IDs and lookups for related data structures

**Derive Don't Duplicate**: Compute values from source data rather than storing separately

**Clean Up**: Always clean up effects, subscriptions, and listeners

### Performance

**Minimize Reactivity**: Only make reactive what actually needs reactivity

**Batch Updates**: Group related state changes together

**Debounce Expensive Operations**: Delay updates for rapid changes (e.g., auto-save)

**Memoize Derived State**: Prevent unnecessary recalculations of computed values

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
