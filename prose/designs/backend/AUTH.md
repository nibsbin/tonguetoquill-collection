# Authentication Architecture

This document covers the high-level authentication architecture and token management strategy. For implementation details of the Login Service, see [LOGIN_SERVICE.md](./LOGIN_SERVICE.md).

> **Implementation**: See [LOGIN_SERVICE.md](./LOGIN_SERVICE.md) for the server/client service pattern and detailed API specification.

## Overview

The application uses **third-party authentication providers** exclusively. The application **never** manages passwords, login interfaces, or user credentials directly. All authentication flows are delegated to the provider (Supabase Auth or Keycloak).

**Key Principles:**

- **Provider-first**: All authentication handled by external services
- **No password management**: Application never stores or validates passwords
- **Token-based security**: JWT tokens for session management
- **Minimal API surface**: Simple interface for frontend integration

## Providers

The authentication architecture is designed to support multiple providers through an abstraction layer.

**Current Implementation: Mock Provider (Phases 1-9)**

- In-memory authentication for development and testing
- Simulates JWT token generation and validation
- Enables rapid development without external dependencies
- Configured via `USE_AUTH_MOCKS=true` environment variable

**Future Provider: Supabase Auth (Phase 10+)**

- Managed authentication service (serverless)
- Handles user registration, login, password management
- Built-in email verification and password reset flows
- Native rate limiting and brute force protection

**Future Provider: Keycloak (Post-MVP)**

- Self-hosted authentication for enterprise deployments
- OAuth/OIDC flows for advanced integrations
- Will be added post-MVP using the same abstraction layer

Real authentication providers (Supabase/Keycloak) natively handle:

- User registration and account creation
- Password storage and validation
- Password reset flows
- Email verification
- Password policies and strength validation
- Rate limiting and brute force protection
- Session management and token rotation

**The application never implements these features directly.**

## API Routes

For detailed API specifications, see [LOGIN_SERVICE.md](./LOGIN_SERVICE.md#api-routes).

The backend exposes the following authentication-related routes:

**Currently Implemented (Phases 1-9):**

- `POST /api/auth/register`: Create a new user account
- `POST /api/auth/login`: Authenticate a user and issue tokens
- `POST /api/auth/refresh`: Refresh access tokens using a valid refresh token
- `POST /api/auth/logout`: Invalidate the user's refresh token
- `GET /api/auth/me`: Get current authenticated user information

**Planned for Phase 10+ (Supabase Integration):**

- `POST /api/auth/reset-password`: Initiate password reset flow (proxies to auth provider)
- `POST /api/auth/verify-email`: Request email verification (proxies to auth provider)
- `GET /api/auth/callback`: OAuth callback handler (for future Keycloak support)

## Session Management

Sessions will be managed using JWTs (JSON Web Tokens) issued by the authentication provider (Keycloak or Supabase).

### Token Handling

- **Access tokens**: Short-lived (15 minutes), used for authenticating API requests
- **Refresh tokens**: Long-lived (7 days), used to obtain new access tokens
- Token rotation and server-side validation are handled by the provider

**Token Refresh Strategy:**

- Client should proactively refresh access tokens when ~2 minutes remain before expiry
- Additionally, handle 401 Unauthorized responses as fallback (for clock skew, edge cases)
- Automatic retry with refreshed token on 401 errors

### Client Storage

Tokens will be stored in HTTP-only cookies with the following security attributes:

- `HttpOnly`: Prevents JavaScript access
- `Secure`: HTTPS-only transmission
- `SameSite=Strict`: Prevents CSRF attacks
- Scoped `Path` and `Domain` as appropriate

### Protected Routes

All protected API endpoints will validate tokens by:

- Verifying JWT signature using the provider's JWKS (JSON Web Key Set) endpoint
- Checking token expiration timestamp
- Validating required claims (user ID, roles)

**JWKS Endpoint:**

- Provider's public keys retrieved from `/.well-known/jwks.json`
- Keys cached locally for 24 hours to reduce external calls
- Cache invalidated on signature verification failures
- Automatic key rotation support via key ID (kid) header

**Required JWT Claims:**

- `sub`: Subject (user ID) - UUID format
- `exp`: Token expiration timestamp
- `iat`: Issued at timestamp
- `iss`: Issuer - verifies token is from correct auth provider

## Deployment Configurations

Provider selection via environment variable:

**Current (Phases 1-9):**

- `USE_AUTH_MOCKS=true` → Use mock authentication provider (development)
- `MOCK_JWT_SECRET`: Secret key for mock JWT generation (development only)

**Future (Phase 10+):**

- `USE_AUTH_MOCKS=false` → Use real authentication provider
- Provider-specific configuration via additional environment variables

**Supabase Configuration (Phase 10+):**

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Anonymous/public API key
- `SUPABASE_JWT_SECRET`: JWT secret for token verification

**Keycloak Configuration (future):**

- `KEYCLOAK_URL`: Keycloak server URL
- `KEYCLOAK_REALM`: Realm name
- `KEYCLOAK_CLIENT_ID`: Client identifier
- `KEYCLOAK_CLIENT_SECRET`: Client secret

## Error Responses

Authentication errors will return standard HTTP status codes with JSON error details:

**Format:**

```json
{
	"error": "error_code",
	"message": "Human-readable error message"
}
```

**Common Error Codes:**

- `401 Unauthorized`: Invalid or expired token
  - `invalid_token`: Token signature invalid or malformed
  - `expired_token`: Access token has expired (client should refresh)
- `403 Forbidden`: Valid token but insufficient permissions
  - `insufficient_permissions`: User lacks required role/permission
- `400 Bad Request`: Invalid authentication request
  - `invalid_credentials`: Wrong username/password
  - `invalid_refresh_token`: Refresh token invalid or revoked
  - `validation_error`: Request validation failed

## Service Architecture

The Login Service follows the server/client pattern described in [SERVICES.md](./SERVICES.md):

- **Server-side** (`$lib/server/services/auth/`): Provider implementations, token validation
- **Client-side** (`$lib/services/auth/`): API communication, session management

See [LOGIN_SERVICE.md](./LOGIN_SERVICE.md) for complete implementation details.

## Cross-References

- [LOGIN_SERVICE.md](./LOGIN_SERVICE.md) - Login Service implementation details
- [SERVICES.md](./SERVICES.md) - Overall service architecture pattern
- [../frontend/API_INTEGRATION.md](../frontend/API_INTEGRATION.md) - Frontend API integration
- [../frontend/STATE_MANAGEMENT.md](../frontend/STATE_MANAGEMENT.md) - Session state management
