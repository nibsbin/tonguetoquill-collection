# Services Architecture

## Overview

Services are separated into two layers with strict boundaries:

1. **Server-Side Services** (`$lib/server/services/`): Provider implementations for databases and external services. SvelteKit's `$lib/server/` convention ensures these are never bundled in client code.
2. **Client-Side Services** (`$lib/services/`): Abstract API communication and browser storage. Provides unified interface for stores/components regardless of guest vs authenticated mode.

This separation provides type safety, clear boundaries, and simplified stores that focus solely on state management.

## Authentication Context

Services receive authenticated user context through middleware that validates JWT and extracts user ID. Services perform ownership/permission checks before operations.

## Document Service

The Document Service manages document lifecycle operations (create, read, update, delete, list) with dual-mode architecture supporting both guest (localStorage) and authenticated (server-side) storage.

**Architecture:**

- **Server-Side** (`$lib/server/services/documents/`): Provider implementations (mock, future database)
- **Client-Side** (`$lib/services/documents/`): Unified client interface with mode-switching logic

**Key Features:**

- Ownership-based authorization
- PostgreSQL TOAST optimization for selective content loading
- 0.5 MB content size limit
- Metadata-only queries for performance

**Documentation:**

Full service specification available at [DOCUMENT_SERVICE.md](./DOCUMENT_SERVICE.md)

## Benefits

1. **Type Safety**: Server providers cannot be imported in client code
2. **Simplified Stores**: Focus on state, not I/O orchestration
3. **Testability**: Client service easily mocked for testing
4. **Maintainability**: API communication changes isolated to client service
5. **Extensibility**: Easy to add new providers (e.g., SupabaseDocumentService) or features (offline caching, optimistic updates)

## Template Service

The Template Service provides read-only access to markdown templates stored in `tonguetoquill-collection/templates/`. Templates are packaged to `static/templates/` during build and served as static files.

**Architecture:**

- **Client-Side** (`$lib/services/templates/`): Singleton service with manifest caching

**Key Features:**

- Singleton pattern for manifest caching
- Type-safe template metadata access
- On-demand template content loading
- Production/development filtering
- Future-ready abstraction for database migration

**Build Process:**

- Source: `tonguetoquill-collection/templates/`
- Build: `npm run pack:templates` copies to `static/templates/`
- Runtime: Service fetches from `/templates/` (served from `static/templates/`)

**Documentation:**

Full service specification available at [TEMPLATE_SERVICE.md](./TEMPLATE_SERVICE.md)

## Login Service

The Login Service handles all authentication operations by delegating to third-party auth providers. The application never manages passwords, login interfaces, or user credentials directly.

**Architecture:**

- **Server-Side** (`$lib/server/services/auth/`): Provider implementations (mock, future Supabase/Keycloak)
- **Client-Side** (`$lib/services/auth/`): Unified client interface for login/logout/session management

**Key Features:**

- Third-party provider delegation (Supabase Auth, Keycloak)
- JWT token management (access + refresh tokens)
- HTTP-only cookie storage with Secure and SameSite=Strict flags
- JWKS endpoint verification with 24-hour cache
- Proactive token refresh (2 minutes before expiry)

**Current Implementation:**

- **Phases 1-9**: Mock provider for development
- **Phase 10+**: Supabase Auth provider
- **Post-MVP**: Keycloak provider option

**Documentation:**

Full service specification available at [LOGIN_SERVICE.md](./LOGIN_SERVICE.md)

## Cross-References

**Service-Specific Documentation:**

- [DOCUMENT_SERVICE.md](./DOCUMENT_SERVICE.md) - Document service specification
- [TEMPLATE_SERVICE.md](./TEMPLATE_SERVICE.md) - Template service specification
- [LOGIN_SERVICE.md](./LOGIN_SERVICE.md) - Login service specification

**Related Architecture:**

- [../frontend/ARCHITECTURE.md](../frontend/ARCHITECTURE.md) - Client architecture
- [../frontend/STATE_MANAGEMENT.md](../frontend/STATE_MANAGEMENT.md) - Store patterns
