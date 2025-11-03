# Login Service and Authentication Architecture

This document defines the Login Service and overall authentication architecture for user authentication using third-party authentication providers. The service follows the server/client pattern established in [SERVICES.md](./SERVICES.md).

> **Related**: [SERVICES.md](./SERVICES.md) for overall service architecture patterns

## Overview

The application uses **third-party authentication providers** exclusively. The application **never** manages passwords, login interfaces, or user credentials directly. All authentication flows are delegated to the provider (Supabase Auth or Keycloak).

**Key Principles:**

- **Provider-first**: All authentication handled by external services
- **No password management**: Application never stores or validates passwords
- **Token-based security**: JWT tokens for session management
- **Minimal API surface**: Simple interface for frontend integration

The Login Service provides this authentication. The application **never** manages its own login interfaces, passwords, or user credentials directly. All authentication flows are delegated to the auth provider.

**Key Characteristics:**

- **Third-party only**: All authentication handled by external providers
- **No password management**: Application never stores or validates passwords
- **Minimal API**: Simple interface for frontend integration
- **Provider abstraction**: Support for multiple providers (Supabase, Keycloak)
- **Token-based**: JWT tokens for session management

## Authentication Providers

The authentication architecture is designed to support multiple providers through an abstraction layer.

Real authentication providers (Supabase/Keycloak) natively handle:

- User registration and account creation
- Password storage and validation
- Password reset flows
- Email verification
- Password policies and strength validation
- Rate limiting and brute force protection
- Session management and token rotation

**The application never implements these features directly.**

### Mock Provider (Phases 1-9)

Development-only mock for rapid iteration. In-memory user storage with simulated JWT generation. No external dependencies. Enables rapid development without external dependencies.

**Environment:**

```
USE_AUTH_MOCKS=true
MOCK_JWT_SECRET=dev_secret_key
```

### Supabase Provider (Phase 10+)

Production auth using Supabase managed service. Handles email verification, password reset flows, rate limiting, and brute force protection.

**Environment:**

```
USE_AUTH_MOCKS=false
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=public_key
SUPABASE_JWT_SECRET=jwt_secret
```

### Keycloak Provider (Post-MVP)

Self-hosted enterprise auth with advanced OAuth/OIDC flows, SSO integration, and fine-grained permissions. Will be added post-MVP using the same abstraction layer.

**Environment:**

```
KEYCLOAK_URL=https://auth.example.com
KEYCLOAK_REALM=tonguetoquill
KEYCLOAK_CLIENT_ID=web_client
KEYCLOAK_CLIENT_SECRET=secret
```

## Architecture

Following the server/client pattern from [SERVICES.md](./SERVICES.md):

### Server-Side (`$lib/server/services/auth/`)

**File Structure:**

```
├── auth-provider.ts           ← createAuthService() factory
├── auth-mock-provider.ts      ← In-memory implementation for development
├── auth-supabase-provider.ts  ← Supabase Auth implementation (Phase 10+)
└── index.ts                   ← export { authService }
```

**Current Implementation (Phases 1-9):** Mock provider only
**Future (Phase 10+):** Add `auth-supabase-provider.ts` for Supabase integration

**Responsibilities**:

- Implement AuthServiceContract
- Communicate with third-party auth providers
- Validate and verify JWT tokens
- Execute server-only authentication logic
- Used exclusively by API route handlers

### Client-Side (`$lib/services/auth/`)

**File Structure:**

```
├── login-client.ts            ← Unified client interface
├── types.ts                   ← Shared types
└── index.ts                   ← export { loginClient }
```

**Responsibilities:**

- Simple async methods for login/logout/session management
- Token storage in HTTP-only cookies
- Communicate with API routes via `fetch()`
- Provide session state for components/stores

## Data Model

### User

Core user entity with UUID identifier, email, optional DoD ID, provider-specific profile data, and timestamps.

### Session

Contains access token (15 min expiry), refresh token (7 day expiry), expiration timestamp, and user information.

### Token Payload

JWT claims include subject (user ID), email, expiration, issued-at, role, and audience.

## Service Contract

### Server-Side Interface

Methods for auth provider integration:

- `signUp()` - Create account via provider (handles password validation)
- `signIn()` - Authenticate via provider (validates credentials)
- `signOut()` - Invalidate session with provider
- `refreshSession()` - Obtain new access token from provider
- `getCurrentUser()` - Validate token and return user info
- `validateToken()` - Verify JWT signature using provider's JWKS

### Client-Side Interface

Methods for frontend integration:

- `signIn()` - Call POST /api/auth/login
- `signOut()` - Call POST /api/auth/logout
- `getCurrentUser()` - Call GET /api/auth/me
- `isAuthenticated()` - Check if valid session exists
- `getSession()` - Get current session or null

## API Routes

Authentication API endpoints:

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and create session
- `POST /api/auth/logout` - Invalidate current session
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current authenticated user

**Request/Response:** Accept JSON request bodies, return JSON responses with user and session data. Errors return standard error format with error code and message.

**Future (Phase 10+):**

- `POST /api/auth/reset-password` - Initiate password reset (proxies to provider)
- `POST /api/auth/verify-email` - Request email verification (proxies to provider)
- `GET /api/auth/callback` - OAuth callback handler (future Keycloak support)

## Token and Session Management

Sessions will be managed using JWTs (JSON Web Tokens) issued by the authentication provider.

### Token Lifecycle and Handling

Provider issues access token (15 min) and refresh token (7 days) on login. Tokens stored in HTTP-only cookies with Secure and SameSite=Strict flags.

- **Access tokens**: Short-lived (15 minutes), used for authenticating API requests.
- **Refresh tokens**: Long-lived (7 days), used to obtain new access tokens.
- Token rotation and server-side validation are handled by the provider.

**Token Refresh Strategy:**

- Client proactively refreshes access tokens when \~2 minutes remain before expiry.
- Additionally, handle 401 Unauthorized responses as fallback (for clock skew, edge cases).
- Automatic retry with refreshed token on 401 errors.

### Cookie Configuration (Client Storage)

Tokens will be stored in HTTP-only cookies with the following security attributes:

- `HttpOnly`: Prevents JavaScript access (prevents XSS)
- `Secure`: HTTPS-only transmission
- `SameSite=Strict`: Prevents CSRF attacks
- Scoped `Path` and `Domain` as appropriate

### Token Validation (Protected Routes)

All protected API endpoints will validate tokens by:

- Verifying JWT signature using the provider's JWKS (JSON Web Key Set) endpoint
- Checking token expiration timestamp
- Validating required claims

**JWKS Endpoint:**

- Provider's public keys retrieved from `/.well-known/jwks.json`
- Keys cached locally for 24 hours to reduce external calls
- Cache invalidated on signature verification failures
- Automatic key rotation support via key ID (kid) header

**Required JWT Claims:**

- `sub`: Subject (user ID) - UUID format
- `email`: User's email
- `exp`: Token expiration timestamp
- `iat`: Issued at timestamp
- `iss`: Issuer - verifies token is from correct auth provider
- `role`: User role
- `aud`: Audience

## Error Handling

Custom `AuthError` class with typed error codes. API routes return a consistent JSON error format:

```json
{
	"error": "error_code",
	"message": "Human-readable error message"
}
```

Standard HTTP status codes: 400 (bad request), 401 (unauthorized), 403 (forbidden), 500 (provider error).

**Common Error Codes:**

- `invalid_credentials` - Wrong email/password
- `user_not_found` - User doesn't exist
- `email_already_exists` - Duplicate email on signup
- `invalid_token` - Malformed or invalid token
- `token_expired` - Token past expiration (client should refresh)
- `unauthorized` - Not authenticated
- `session_expired` - Session no longer valid
- `invalid_refresh_token`: Refresh token invalid or revoked
- `insufficient_permissions`: Valid token but insufficient permissions
- `validation_error`: Request validation failed
- `network_error` - Provider unreachable

## Security Considerations

### Third-Party Provider Delegation

The application **never** implements:

- Password storage or validation
- Login UI/forms (delegated to provider)
- Password reset flows
- Email verification
- Rate limiting
- Password strength validation

The application **does** implement:

- JWT token validation from provider
- Secure token storage (HTTP-only cookies)
- Token refresh logic
- Authorization/permissions
- Logout functionality

### Token Security

HTTP-only cookies prevent XSS attacks. Secure flag ensures HTTPS-only transmission. SameSite=Strict provides CSRF protection. Short access token expiry (15 min) limits exposure. JWKS signature verification validates provider tokens.

## Future Enhancements

**Phase 10+:** Supabase Auth integration, database-backed user profiles, email verification and password reset flows.

**Post-MVP:** OAuth providers (Google, Microsoft, GitHub), Keycloak self-hosted option, MFA/2FA support, role-based access control (RBAC), session management UI, activity logging.

## Design Decisions

**Why Third-Party Auth Only?** Security experts handle password storage and validation. Providers maintain security certifications and handle compliance. Built-in features like email verification, password reset, and OAuth. No security patches or updates needed for auth logic. Providers handle rate limiting and abuse prevention.

**Why Minimal API?** Fewer surface areas for bugs. Less code to test and update. Clear separation of concerns between auth and application logic.

**Why HTTP-only Cookies?** XSS attacks cannot steal tokens. Browser automatically sends with requests. Well-understood security model.

**Why Separate Login Service?** Clear naming ("Login" more intuitive than "Auth"). Focused API for login/logout/session management only. Future-ready for separation from authorization/permissions logic. Consistent with Document Service and Template Service patterns.

## Constraints and Limitations

**Current Scope:** Email/password authentication, session management (login/logout), token refresh, user profile retrieval, mock provider (dev), Supabase provider (Phase 10+).

**Out of Scope (Initial):** OAuth providers (Google, GitHub), multi-factor authentication (MFA), role-based permissions, user management UI, session history/activity logs, account deletion flows.

These features may be added post-MVP.

## Cross-References

- [SERVICES.md](./SERVICES.md) - Overall service architecture
- [../frontend/API_INTEGRATION.md](../frontend/API_INTEGRATION.md) - Frontend API integration patterns
- [../frontend/STATE_MANAGEMENT.md](../frontend/STATE_MANAGEMENT.md) - Session state management
