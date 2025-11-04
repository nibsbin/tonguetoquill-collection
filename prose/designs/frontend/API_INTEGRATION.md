# API Integration & Backend Communication

## Overview

Tonguetoquill integrates with a RESTful backend API for authentication, document management, and user profiles. The frontend handles API communication, error handling, and state synchronization while maintaining a responsive user experience.

For authentication details, see [prose/designs/backend/LOGIN_SERVICE.md](../backend/LOGIN_SERVICE.md).

## API Architecture

### Base Configuration

**API Settings**:

- Base URL: Relative paths (same-origin API routes)
- Timeout: Default browser timeout
- Retry strategy: Application-level retry for transient failures
- Credentials: Automatic cookie inclusion (HTTP-only cookies for JWT)

**Endpoints**:

- Authentication: `/api/auth/*` (login, callback, me, logout, refresh)
- Documents: `/api/documents/*` (list, get, create, update, delete)
- Document Metadata: `/api/documents/[id]/metadata`

### API Client Pattern

**Implementation**:

The application uses two complementary approaches:

1. **DocumentClient**: Centralized service for document operations
   - Routes between localStorage (guest mode) and API (authenticated mode)
   - Provides unified interface: `listDocuments()`, `getDocument()`, `createDocument()`, `updateDocument()`, `deleteDocument()`
   - Used by documentStore for all document I/O

2. **Direct fetch() calls**: For authentication and simple operations
   - Used in LoginClient for auth operations
   - Used in page components for user session checks

**Features**:

- Simple fetch() API with async/await
- Error handling via try/catch
- Optimistic updates in document store
- Guest mode fallback to localStorage

**HTTP Methods**:

- GET: Fetch resources (documents, user info)
- POST: Create resources, trigger actions (create document, logout)
- PUT: Update resources (update document)
- DELETE: Remove resources (delete document)

**Error Handling**:

- Network errors caught via try/catch
- HTTP error codes checked via `response.ok`
- Toast notifications for user feedback
- Optimistic update rollback on failure
- Guest mode fallback on authentication errors

## Authentication Integration

See [prose/designs/backend/LOGIN_SERVICE.md](../backend/LOGIN_SERVICE.md) for complete authentication architecture and specifications.

### Login Flow

**Process**:

1. User clicks "Sign In" button in TopMenu
2. Browser redirects to `/api/auth/login` (GET request)
3. Server redirects to auth provider's hosted login page (OAuth flow)
4. User authenticates with provider
5. Provider redirects back to `/api/auth/callback?code=...`
6. Server exchanges OAuth code for JWT tokens
7. Server sets HTTP-only cookies (`access_token`, `refresh_token`)
8. User redirected to `/` with full features unlocked

**Token Management**:

- JWT tokens stored in HTTP-only cookies (never accessible to JavaScript)
- `access_token`: 1 hour expiration
- `refresh_token`: 7 days expiration
- Automatic token refresh before expiration (handled server-side)
- Logout clears both cookies via `/api/auth/logout`
- Failed requests fall back to guest mode

### Protected Routes

**Server-Side Protection**:

- API routes use `requireAuth()` utility to verify JWT
- Extracts token from cookies via `getAccessToken()`
- Validates token with auth service
- Returns 401 if not authenticated or token invalid
- Client falls back to guest mode on 401

**Client-Side Behavior**:

- Check authentication via `GET /api/auth/me` on page load
- Set documentStore guest mode based on response
- Guest mode: documents stored in localStorage
- Authenticated mode: documents synced via API
- Toast notifications for errors

### Session Management

See [prose/designs/backend/LOGIN_SERVICE.md](../backend/LOGIN_SERVICE.md) for session timeout and refresh specifications.

**Features**:

- HTTP-only cookies for security
- Automatic token refresh via `/api/auth/refresh`
- Guest mode as fallback for unauthenticated users
- No explicit session timeout warnings (seamless experience)

## Document Management

### Document Service

**Operations**:

- **List**: Get all user's documents
- **Get**: Fetch single document by ID
- **Create**: Create new blank markdown document
- **Update**: Modify document content
- **Delete**: Remove document

**Ownership**: Each document owned by single user (creator). No sharing in MVP.

**Error Handling**:

- 400: Validation errors
- 403: Permission denied (not document owner)
- 404: Document not found
- 500: Server errors

### CRUD Patterns

**Loading Documents**: Fetch on page load via load function

**Creating Documents**: API call via DocumentClient, optimistic UI update

**Updating Documents**: Auto-save with debounce (4 seconds), optimistic updates

**Deleting Documents**: Confirmation dialog, optimistic removal, rollback on error

## Error Handling

### Error Patterns

**Network Errors**: Toast notification, retry option

**Validation Errors**: Inline form errors, error summary

**Permission Errors**: Redirect or error message

**Server Errors**: User-friendly message, error logging

### Error Boundaries

**Page-Level**: Catch load errors, show error page

**Component-Level**: Graceful degradation, fallback UI

**Global Handler**: Catch unhandled errors, log to service

### User Feedback

**Toast Notifications**: Brief, actionable messages using svelte-sonner

**Inline Errors**: Next to form fields for validation errors

**Error Pages**: For fatal errors with retry/home options

**Loading States**: Skeleton loaders and spinners for pending operations

## Optimistic Updates

### Pattern

**Process**:

1. Update local state immediately
2. Send request to server
3. On success: Keep update
4. On error: Rollback and show error toast

**Use Cases**:

- Document content updates (save operations)
- Document creation
- Document deletion
- Preference changes

**Benefits**:

- Instant feedback
- Better perceived performance
- Resilient to network latency

## Data Fetching Patterns

### Loading States

**States**: Idle, Loading, Success, Error

**UI Patterns**:

- Loading: Skeleton or spinner
- Success: Show data
- Error: Error message with retry
- Empty: Empty state message

### Pagination

**Strategies**:

- Offset-based: Page numbers
- Cursor-based: Efficient for large datasets
- Infinite scroll: Load more on scroll

**Implementation**:

- Server provides pagination metadata
- Client tracks current page/cursor
- Load more on user action or intersection

### Caching

**Strategies**:

- In-memory cache for session
- LocalStorage for persistence
- IndexedDB for large datasets
- Cache invalidation on mutations

## Type Safety

### API Response Types

**TypeScript Interfaces**:

- Type definitions in service files (e.g., `src/lib/services/documents/types.ts`)
- `DocumentMetadata`, `User`, `Session` interfaces
- Error response types (`ErrorResponse`)
- Type-safe service methods

**Implementation**:

- Manual TypeScript interfaces for API contracts
- Runtime checks via `response.ok` and error handling
- Zod schemas available for validation (package.json dependency)

### Request/Response Validation

**Client-Side**: TypeScript type checking, basic validation in services

**Server-Side**: Validation in API routes, error responses for invalid requests

**Runtime**: Error handling via try/catch, user-friendly error messages

## Performance Optimization

### Request Optimization

**Debouncing**: Auto-save debounced to 4 seconds to reduce API calls

**Caching**: DocumentStore maintains in-memory cache of document list

**Guest Mode**: LocalStorage for offline-capable guest experience

**Optimistic Updates**: Immediate UI feedback, rollback on error

### Response Handling

**JSON Parsing**: Standard `response.json()` for all API responses

**Error Handling**: Check `response.ok` before parsing

**State Updates**: Atomic updates to stores after successful responses

## API Integration Best Practices

### Request Practices

- Use relative URLs for same-origin API routes
- Include proper Content-Type headers for JSON
- Handle all error cases with try/catch
- Provide user feedback via toast notifications
- Use HTTPS in production (enforced by secure cookie flag)

### Response Practices

- Check `response.ok` before parsing
- Handle empty responses gracefully
- Parse errors with fallback messages
- Update store state atomically
- Show user feedback via toasts

### Security Practices

- JWT tokens never exposed to client JavaScript (HTTP-only cookies)
- Validate all user input server-side
- CSRF protection via SameSite cookie attribute
- XSS protection via automatic Svelte escaping
- Secure cookies in production (secure flag)
- OAuth delegation (no password handling)

## Testing Strategies

### API Testing

**Unit Tests**: Mock API responses, test error handling

**Integration Tests**: Test against real/mock server

**E2E Tests**: Full user flows with API

### Error Scenario Testing

- Network failures
- Timeout errors
- Server errors
- Invalid responses
- Authentication failures
- Permission errors
