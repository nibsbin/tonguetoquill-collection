# Authentication Architecture

This document covers user authentication and token management. Authentication is abstracted to support multiple deployment environments without changing application code.

## Providers

The authentication architecture is designed to support multiple providers through an abstraction layer. For MVP, we will implement Supabase Auth exclusively, with the architecture prepared for future Keycloak support.

**MVP Provider: Supabase Auth**

- Managed authentication service (serverless)
- Handles user registration, login, password management
- Built-in email verification and password reset flows
- Native rate limiting and brute force protection

**Future Provider: Keycloak**

- Self-hosted authentication for enterprise deployments
- OAuth/OIDC flows for advanced integrations
- Will be added post-MVP using the same abstraction layer

Both providers natively handle:

- User registration
- Password reset flows
- Email verification
- Password policies and validation
- Rate limiting and brute force protection

## Routes

The backend will expose the following authentication-related routes:

- `POST /auth/register`: Create a new user account (proxies to auth provider)
- `POST /auth/login`: Authenticate a user and issue tokens
- `POST /auth/refresh`: Refresh access tokens using a valid refresh token
- `POST /auth/logout`: Invalidate the user's refresh token
- `POST /auth/reset-password`: Initiate password reset flow (proxies to auth provider)
- `POST /auth/verify-email`: Request email verification (proxies to auth provider)
- `GET /auth/me`: Get current authenticated user information
- `GET /auth/callback`: OAuth callback handler (stub for future Keycloak support)

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

Provider selection via environment variable (MVP: Supabase only):

- `AUTH_PROVIDER=supabase` → Use Supabase adapter (MVP)
- `AUTH_PROVIDER=keycloak` → Use Keycloak adapter (future)

All provider-specific configuration (URLs, keys, secrets) set through environment variables.

**Supabase Configuration:**

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
