# Services Architecture

## Overview

Services are separated into two layers with strict boundaries:

1. **Server-Side Services** (`$lib/server/services/`): Provider implementations for databases and external services. SvelteKit's `$lib/server/` convention ensures these are never bundled in client code.
2. **Client-Side Services** (`$lib/services/`): Abstract API communication and browser storage. Provides unified interface for stores/components regardless of guest vs authenticated mode.

This separation provides type safety, clear boundaries, and simplified stores that focus solely on state management.

## Authentication Context

Services receive authenticated user context through middleware that validates JWT and extracts user ID. Services perform ownership/permission checks before operations.

## Cross-References

**Service-Specific Documentation:**

- [DOCUMENT_SERVICE.md](./DOCUMENT_SERVICE.md) - Document service specification
- [TEMPLATE_SERVICE.md](./TEMPLATE_SERVICE.md) - Template service specification
- [LOGIN_SERVICE.md](./LOGIN_SERVICE.md) - Login service specification

**Related Architecture:**

- [../frontend/ARCHITECTURE.md](../frontend/ARCHITECTURE.md) - Client architecture
- [../frontend/STATE_MANAGEMENT.md](../frontend/STATE_MANAGEMENT.md) - Store patterns
