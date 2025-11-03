# Login Service and Authentication Architecture

This document defines the Login Service and overall authentication architecture for user authentication using third-party authentication providers. The service follows the server/client pattern established in [SERVICES.md](./SERVICES.md).

> **Related**: [SERVICES.md](./SERVICES.md) for overall service architecture patterns

## Philosophy

**Delegate Everything to the Provider**

The application takes a **radical delegation** approach to authentication: the entire authentication flow is handled by external providers (Supabase, Keycloak). The application's role is minimal and focused solely on token management.

**Guiding Principle:** The application should never see, store, or validate user passwords.

## Overview

The application uses **third-party authentication providers** exclusively for all authentication. The application delegates the entire authentication flow to the provider's hosted UI and backend services.

**Application Responsibilities (Minimal):**

1. **Validate** JWT tokens received from the provider
2. **Store** tokens securely in HTTP-only cookies
3. **Refresh** tokens before expiration
4. **Clear** cookies on logout

**Provider Responsibilities (Everything Else):**

- User registration and account creation
- Login UI and forms (provider-hosted pages)
- Password storage, hashing, and validation
- Password strength enforcement
- Password reset flows
- Email verification
- Rate limiting and brute force protection
- Session management and token issuance

**Key Principles:**

- **Provider-first**: All authentication UI and flows handled by external provider's hosted pages
- **No password management**: Application never sees, stores, or validates passwords
- **No custom auth UI**: Users redirected to provider-hosted sign-in/sign-up pages
- **Token-based security**: Application only validates JWT tokens from provider
- **Minimal API surface**: Simple token management endpoints only

## Authentication Flow

### Initial Authentication

1. User clicks "Login" in application
2. Application **redirects** to provider's hosted login page
3. User enters credentials on **provider's page** (not ours)
4. Provider validates credentials (we never see them)
5. Provider redirects back to application with OAuth code
6. Application exchanges code for tokens via provider API
7. Application stores tokens in HTTP-only cookies
8. User is authenticated

### Subsequent Requests

1. Browser automatically sends auth cookies with requests
2. Application validates JWT signature using provider's public keys (JWKS)
3. Application extracts user info from validated token
4. Application performs authorization checks (if needed)
5. Application serves the request

### Token Refresh

1. Access token expires after 15 minutes
2. Application uses refresh token to get new access token from provider
3. Application updates cookies with new tokens
4. User session continues seamlessly

### Logout

1. User clicks "Logout"
2. Application clears auth cookies
3. Application optionally notifies provider (for audit logs)
4. User is logged out

## Authentication Providers

The authentication architecture is designed to support multiple providers through an abstraction layer.

Real authentication providers (Supabase/Keycloak) natively handle **all** authentication features:

- User registration and account creation (via provider-hosted UI)
- Login/sign-in UI and forms (provider-hosted pages)
- Password storage, hashing, and validation
- Password reset flows and email delivery
- Email verification flows
- Password policies and strength validation
- Rate limiting and brute force protection
- Session management and token issuance

**The application delegates ALL of these to the provider. The application only validates tokens.**

### Mock Provider (Phases 1-9)

Development-only mock for rapid iteration. Simulates the provider's token issuance. No external dependencies. Enables rapid development without external dependencies.

**Note:** Even in mock mode, the application should NOT implement custom login UI. The mock simulates what a real provider does (token issuance), not custom auth flows.

**Environment:**

```
USE_AUTH_MOCKS=true
MOCK_JWT_SECRET=dev_secret_key
```

### Supabase Provider (Phase 10+)

Production auth using Supabase managed service. Users authenticate via Supabase-hosted UI pages. Application receives tokens via OAuth callback or direct provider API.

**Provider handles:** All authentication UI, email verification, password reset flows, rate limiting, and brute force protection.

**Application handles:** Token validation, cookie storage, and token refresh.

**Environment:**

```
USE_AUTH_MOCKS=false
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=public_key
SUPABASE_JWT_SECRET=jwt_secret
```

### Keycloak Provider (Post-MVP)

Self-hosted enterprise auth with advanced OAuth/OIDC flows, SSO integration, and fine-grained permissions. Users authenticate via Keycloak-hosted pages. Will be added post-MVP using the same abstraction layer.

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
├── auth-mock-provider.ts      ← Token validation mock (development only)
├── auth-supabase-provider.ts  ← Supabase token validation (Phase 10+)
└── index.ts                   ← export { authService }
```

**Current Implementation (Phases 1-9):** Mock provider for token validation only
**Future (Phase 10+):** Add `auth-supabase-provider.ts` for Supabase token validation

**Responsibilities**:

- Validate JWT tokens from provider
- Verify token signatures using provider's JWKS
- Execute server-only token validation logic
- Used exclusively by API route handlers and middleware

### Client-Side (`$lib/services/auth/`)

**File Structure:**

```
├── login-client.ts            ← Minimal client for token management
├── types.ts                   ← Shared types
└── index.ts                   ← export { loginClient }
```

**Responsibilities:**

- Redirect to provider-hosted auth pages
- Receive and store tokens from OAuth callback
- Token storage in HTTP-only cookies
- Token refresh before expiration
- Logout (clear cookies)
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

The server-side service is **minimal** and focused only on token validation:

- `validateToken()` - Verify JWT signature using provider's JWKS
- `getCurrentUser()` - Extract user info from validated token
- `refreshSession()` - Exchange refresh token for new access token (via provider API)

### Client-Side Interface

Minimal interface for token and session management:

- `initiateLogin()` - Redirect to provider's hosted login page
- `handleCallback()` - Process OAuth callback and store tokens
- `signOut()` - Clear cookies and redirect to provider logout
- `getCurrentUser()` - Get user from current session
- `isAuthenticated()` - Check if valid session exists
- `getSession()` - Get current session or null

## API Routes

**Minimal** authentication API endpoints for token management only:

- `GET /api/auth/login` - Redirect to provider's hosted login page
- `GET /api/auth/callback` - OAuth callback handler to receive and store tokens
- `POST /api/auth/logout` - Clear cookies and invalidate session
- `POST /api/auth/refresh` - Refresh access token using refresh token
- `GET /api/auth/me` - Get current authenticated user from token

**Request/Response:** 
- Callback endpoint receives OAuth code/token and sets HTTP-only cookies
- Other endpoints return JSON with user and session data
- Errors return standard error format with error code and message

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

- `invalid_token` - Malformed or invalid token
- `token_expired` - Token past expiration (client should refresh)
- `unauthorized` - Not authenticated
- `session_expired` - Session no longer valid
- `invalid_refresh_token` - Refresh token invalid or revoked
- `network_error` - Provider unreachable

## Security Model

### What We Protect Against

- **XSS Attacks**: HTTP-only cookies prevent JavaScript access to tokens
- **CSRF Attacks**: SameSite=Strict cookies prevent cross-site requests
- **Token Theft**: Short-lived access tokens limit exposure window
- **Man-in-the-Middle**: HTTPS-only transmission (Secure flag)

### What Provider Protects Against

- **Password Breaches**: Provider stores hashed passwords with proper salting
- **Brute Force**: Provider implements rate limiting and account lockouts
- **Credential Stuffing**: Provider detects and blocks automated attacks
- **User Enumeration**: Provider prevents attackers from discovering valid emails
- **Weak Passwords**: Provider enforces password strength requirements

## Design Benefits

### Security Benefits

1. **No Password Exposure**: Application code never handles passwords
2. **Professional Security**: Providers employ security experts and maintain certifications
3. **Automatic Updates**: Provider handles security patches and protocol updates
4. **Reduced Attack Surface**: Minimal auth code means fewer vulnerabilities
5. **Compliance**: Providers maintain SOC 2, ISO 27001, and other certifications

### Maintainability Benefits

1. **Less Code**: No custom auth forms, password validation, or reset flows
2. **Fewer Tests**: Token validation is the only auth logic to test
3. **No Auth Migrations**: Provider handles database schema changes
4. **Simpler Updates**: No need to track auth-related security advisories
5. **Clear Separation**: Auth logic completely separate from business logic

### User Experience Benefits

1. **Professional UI**: Provider-hosted pages are polished and accessible
2. **Consistent Experience**: Users get familiar OAuth/OIDC flows
3. **Mobile Optimized**: Provider pages work well on all devices
4. **Social Login Ready**: Easy to add Google, GitHub, etc. (provider handles)
5. **Password Managers**: Provider forms work with password managers

## Security Considerations

### Third-Party Provider Delegation

The application **delegates everything** to the provider:

**Provider handles (100% delegated):**
- Login UI and forms (provider-hosted pages)
- Registration UI and forms (provider-hosted pages)
- Password storage and hashing
- Password strength validation
- Password reset flows and email delivery
- Email verification flows
- Rate limiting and brute force protection
- User enumeration prevention

**Application handles (minimal responsibilities):**
- JWT token validation using provider's JWKS
- Secure token storage (HTTP-only cookies)
- Token refresh logic
- Logout functionality (clearing cookies)

### Token Security

HTTP-only cookies prevent XSS attacks. Secure flag ensures HTTPS-only transmission. SameSite=Strict provides CSRF protection. Short access token expiry (15 min) limits exposure. JWKS signature verification validates provider tokens.

**The application NEVER:**
- Sees user passwords
- Validates passwords
- Stores passwords (even hashed)
- Renders login/signup forms
- Implements password reset
- Implements email verification

## Future Enhancements

**Phase 10+:** Supabase Auth integration with provider-hosted UI, OAuth callbacks, and token validation.

**Post-MVP:** OAuth providers (Google, Microsoft, GitHub) via Supabase or Keycloak, Keycloak self-hosted option, MFA/2FA support (provider-managed), role-based access control (RBAC), session management UI, activity logging.

## Why This Approach?

### Traditional Auth (What We're Avoiding)

Traditional approach requires implementing:
- Custom login/signup forms
- Password hashing (bcrypt/argon2)
- Password validation logic
- Password reset token generation
- Email sending infrastructure
- Rate limiting middleware
- Session management
- CSRF protection
- Account recovery flows
- Email verification flows

**Total complexity: ~1000s of lines of code + ongoing security maintenance**

### Delegated Auth (Our Approach)

Our approach requires:
- OAuth redirect handling
- JWT token validation
- Cookie management
- Token refresh logic

**Total complexity: ~100s of lines of code + minimal maintenance**

### The Trade-off

We give up **control** over the auth UI/UX in exchange for **security**, **simplicity**, and **maintainability**.

This is the right trade-off for most applications.

## Design Decisions

**Why Third-Party Auth Only?** 
- Security experts handle all password management
- Providers maintain security certifications and compliance
- Built-in features like email verification, password reset, and OAuth
- No security patches or updates needed for auth logic
- Providers handle rate limiting and abuse prevention
- Eliminates entire categories of security vulnerabilities

**Why Provider-Hosted UI?**
- No risk of password exposure in application code
- Consistent, professionally designed auth experience
- Automatic updates to UI and security features
- Eliminates need to maintain custom forms
- Built-in accessibility and mobile optimization

**Why Minimal API?** 
- Fewer surface areas for bugs
- Less code to test and update
- Clear separation of concerns between auth and application logic
- Reduced attack surface

**Why HTTP-only Cookies?** 
- XSS attacks cannot steal tokens
- Browser automatically sends with requests
- Well-understood security model

**Why Separate Login Service?** 
- Clear naming ("Login" more intuitive than "Auth")
- Focused API for token management only
- Future-ready for separation from authorization/permissions logic
- Consistent with Document Service and Template Service patterns

## Constraints and Limitations

**Current Scope:** 
- OAuth callback handling
- Token validation and refresh
- Session management (token storage in cookies)
- User profile retrieval from validated tokens
- Mock provider (dev)
- Supabase provider (Phase 10+)

**Out of Scope (Delegated to Provider):** 
- User registration UI (use provider-hosted pages)
- Login UI (use provider-hosted pages)
- Password reset UI (use provider-hosted pages)
- Email verification UI (use provider-hosted pages)
- Password validation (provider enforces)
- Rate limiting (provider handles)
- Brute force protection (provider handles)

**Future (Post-MVP):**
- OAuth providers (Google, GitHub) via Supabase/Keycloak
- Multi-factor authentication (MFA) - provider-managed
- Role-based permissions
- Session history/activity logs
- Account deletion flows

## Cross-References

- [SERVICES.md](./SERVICES.md) - Overall service architecture
- [../frontend/API_INTEGRATION.md](../frontend/API_INTEGRATION.md) - Frontend API integration patterns
- [../frontend/STATE_MANAGEMENT.md](../frontend/STATE_MANAGEMENT.md) - Session state management
