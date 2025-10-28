# Authentication Architecture

This document covers user authentication and token management. Authentication is abstracted to support multiple deployment environments without changing application code.

## Providers

We will support either:

- A self-hosted Keycloak instance for user authentication. Keycloak will handle user registration, login, password management, and social logins.
- Supabase Auth, a managed authentication service that provides similar features to Keycloak but is serverless.

Both providers natively handle:

- User registration
- Password reset flows
- Email verification
- Password policies and validation
- Rate limiting and brute force protection

## Routes

The backend will expose the following authentication-related routes:

- `POST /auth/login`: Authenticate a user and issue tokens.
- `POST /auth/refresh`: Refresh access tokens using a valid refresh token.
- `POST /auth/logout`: Invalidate the user's refresh token.
- `GET /auth/me`: Get current authenticated user

### OAuth Callback (Keycloak only)
- `GET /auth/callback`: Handle OAuth redirects from Keycloak

## Session Management

Sessions will be managed using JWTs (JSON Web Tokens) issued by the authentication provider (Keycloak or Supabase).

### Token Handling

- **Access tokens**: Short-lived (15 minutes), used for authenticating API requests
- **Refresh tokens**: Long-lived (7 days), used to obtain new access tokens
- Token rotation and server-side validation are handled by the provider

### Client Storage

Tokens will be stored in HTTP-only cookies with the following security attributes:
- `HttpOnly`: Prevents JavaScript access
- `Secure`: HTTPS-only transmission  
- `SameSite=Strict`: Prevents CSRF attacks
- Scoped `Path` and `Domain` as appropriate

### Protected Routes

All protected API endpoints will validate tokens by:
- Verifying JWT signature using the provider's public keys
- Checking token expiration
- Validating required claims (user ID, roles, etc.)

## Deployment Configurations

Provider selection via environment variable:

- `AUTH_PROVIDER=keycloak` → Use Keycloak adapter
- `AUTH_PROVIDER=supabase` → Use Supabase adapter

All provider-specific configuration (URLs, keys, secrets) set through environment variables.

**Keycloak Configuration:**
- `KEYCLOAK_URL`: Keycloak server URL
- `KEYCLOAK_REALM`: Realm name
- `KEYCLOAK_CLIENT_ID`: Client identifier
- `KEYCLOAK_CLIENT_SECRET`: Client secret

**Supabase Configuration:**
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Anonymous/public API key
- `SUPABASE_JWT_SECRET`: JWT secret for token verification