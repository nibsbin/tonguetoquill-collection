# Login Service

This document defines the Login Service for user authentication using third-party authentication providers. The service follows the server/client pattern established in [SERVICES.md](./SERVICES.md).

> **Related**: [SERVICES.md](./SERVICES.md) for overall service architecture patterns

## Overview

The Login Service provides authentication through third-party providers (Supabase Auth, Keycloak). The application **never** manages its own login interfaces, passwords, or user credentials directly. All authentication flows are delegated to the auth provider.

**Key Characteristics:**

- **Third-party only**: All authentication handled by external providers
- **No password management**: Application never stores or validates passwords
- **Minimal API**: Simple interface for frontend integration
- **Provider abstraction**: Support for multiple providers (Supabase, Keycloak)
- **Token-based**: JWT tokens for session management

## Architecture

Following the server/client pattern from [SERVICES.md](./SERVICES.md):

### Server-Side (`$lib/server/services/auth/`)

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

```
├── login-client.ts            ← Unified client interface
├── types.ts                   ← Shared types
└── index.ts                   ← export { loginClient }
```

**LoginClient** abstracts all authentication operations:

- Provides simple async methods for login/logout/session management
- Handles token storage in HTTP-only cookies
- Communicates with API routes via `fetch()`
- Provides session state for components/stores

```typescript
// Components/stores use login client for auth operations
async function handleLogin(email: string, password: string) {
  const session = await loginClient.signIn(email, password);
  // Session state updated automatically
}
```

## Data Model

### User

```typescript
interface User {
  /** Unique user identifier (UUID) */
  id: string;
  
  /** User email address */
  email: string;
  
  /** Optional DoD ID number */
  dodid?: string | null;
  
  /** Provider-specific profile data */
  profile: Record<string, unknown>;
  
  /** Account creation timestamp (ISO 8601) */
  created_at: string;
  
  /** Last update timestamp (ISO 8601) */
  updated_at: string;
}
```

### Session

```typescript
interface Session {
  /** Short-lived access token (15 minutes) */
  access_token: string;
  
  /** Long-lived refresh token (7 days) */
  refresh_token: string;
  
  /** Access token expiration (Unix timestamp) */
  expires_at: number;
  
  /** Authenticated user information */
  user: User;
}
```

### Token Payload

```typescript
interface TokenPayload {
  /** Subject - user ID (UUID) */
  sub: string;
  
  /** User email address */
  email: string;
  
  /** Token expiration (Unix timestamp) */
  exp: number;
  
  /** Issued at (Unix timestamp) */
  iat: number;
  
  /** User role */
  role: 'authenticated';
  
  /** Audience claim */
  aud: 'authenticated';
}
```

## Service Contract

### Server-Side Interface

The server-side service implements the following contract for use by API route handlers:

```typescript
interface AuthServiceContract {
  /**
   * Create new user account via auth provider
   * Provider handles password validation and storage
   */
  signUp(email: string, password: string, dodid?: string): Promise<AuthResult>;
  
  /**
   * Authenticate user via auth provider
   * Provider validates credentials
   */
  signIn(email: string, password: string): Promise<AuthResult>;
  
  /**
   * Invalidate user session
   * Provider handles token revocation
   */
  signOut(accessToken: string): Promise<void>;
  
  /**
   * Refresh expired access token
   * Provider issues new tokens
   */
  refreshSession(refreshToken: string): Promise<Session>;
  
  /**
   * Get current user from access token
   * Validates token and returns user info
   */
  getCurrentUser(accessToken: string): Promise<User | null>;
  
  /**
   * Validate JWT token and return payload
   * Verifies signature using provider's JWKS
   */
  validateToken(token: string): Promise<TokenPayload>;
}
```

### Client-Side Interface

The client-side service provides a minimal API for frontend integration:

```typescript
interface LoginClient {
  /**
   * Sign in with email and password
   * Calls POST /api/auth/login
   */
  signIn(email: string, password: string): Promise<Session>;
  
  /**
   * Sign out current user
   * Calls POST /api/auth/logout
   */
  signOut(): Promise<void>;
  
  /**
   * Get current authenticated user
   * Calls GET /api/auth/me
   */
  getCurrentUser(): Promise<User | null>;
  
  /**
   * Check if user is authenticated
   * Returns true if valid session exists
   */
  isAuthenticated(): boolean;
  
  /**
   * Get current session
   * Returns null if not authenticated
   */
  getSession(): Session | null;
}
```

## API Routes

The backend exposes the following authentication API endpoints:

### `POST /api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "dodid": "1234567890" // optional
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "dodid": "1234567890",
    "profile": {},
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1234567890,
    "user": { /* same as above */ }
  }
}
```

**Errors:**
- `400` - Email already exists, weak password, invalid email
- `500` - Provider error

### `POST /api/auth/login`

Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "user": { /* User object */ },
  "session": { /* Session object */ }
}
```

**Errors:**
- `401` - Invalid credentials
- `500` - Provider error

### `POST /api/auth/logout`

Invalidate current session.

**Request:** Empty body (tokens from cookies)

**Response (204 No Content):** Empty

**Errors:**
- `401` - Not authenticated

### `POST /api/auth/refresh`

Refresh access token using refresh token.

**Request:** Empty body (refresh token from cookie)

**Response (200 OK):**
```json
{
  "session": { /* Session object with new tokens */ }
}
```

**Errors:**
- `401` - Invalid or expired refresh token

### `GET /api/auth/me`

Get current authenticated user.

**Request:** Empty (access token from cookie)

**Response (200 OK):**
```json
{
  "user": { /* User object */ }
}
```

**Errors:**
- `401` - Not authenticated or token expired

## Token Management

### Token Lifecycle

1. **Login**: Provider issues access token (15 min) + refresh token (7 days)
2. **Storage**: Tokens stored in HTTP-only cookies
3. **Usage**: Access token sent with each API request
4. **Refresh**: Client proactively refreshes when ~2 min remain
5. **Logout**: Provider revokes tokens

### Cookie Configuration

Tokens stored with security attributes:

```typescript
{
  httpOnly: true,           // Prevents JavaScript access
  secure: true,             // HTTPS-only
  sameSite: 'strict',       // CSRF protection
  path: '/',                // Available to all routes
  maxAge: 604800            // 7 days for refresh token
}
```

### Token Refresh Strategy

Client-side refresh logic:

1. **Proactive refresh**: Check token expiry on app load and periodically
2. **Automatic retry**: On 401 errors, attempt refresh then retry original request
3. **Clock skew tolerance**: Refresh 2 minutes before actual expiry

### Token Validation

Server-side validation process:

1. Extract token from cookie
2. Verify JWT signature using provider's JWKS endpoint
3. Check expiration timestamp
4. Validate required claims (sub, email, exp, iat)
5. Cache JWKS keys (24 hours) for performance

## Error Handling

### Error Types

```typescript
type AuthErrorCode =
  | 'invalid_credentials'     // Wrong email/password
  | 'user_not_found'         // User doesn't exist
  | 'email_already_exists'   // Duplicate email on signup
  | 'invalid_token'          // Malformed or invalid token
  | 'token_expired'          // Token past expiration
  | 'invalid_email'          // Email format invalid
  | 'weak_password'          // Password doesn't meet requirements
  | 'unauthorized'           // Not authenticated
  | 'session_expired'        // Session no longer valid
  | 'network_error'          // Provider unreachable
  | 'unknown_error';         // Unexpected error

class AuthError extends Error {
  code: AuthErrorCode;
  statusCode: number;
  
  constructor(code: AuthErrorCode, message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
```

### Error Responses

API routes return consistent error format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message"
}
```

**Common Status Codes:**
- `400` - Bad request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal server error (provider errors)

## Provider Configuration

### Mock Provider (Phases 1-9)

Development-only mock for rapid iteration:

```
USE_AUTH_MOCKS=true
MOCK_JWT_SECRET=dev_secret_key
```

**Features:**
- In-memory user storage
- Simulated JWT generation
- No external dependencies
- Predictable for testing

### Supabase Provider (Phase 10+)

Production auth using Supabase:

```
USE_AUTH_MOCKS=false
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=public_key
SUPABASE_JWT_SECRET=jwt_secret
```

**Features:**
- Managed authentication service
- Email verification
- Password reset flows
- Rate limiting and brute force protection
- OAuth providers (future)

### Keycloak Provider (Post-MVP)

Self-hosted enterprise auth:

```
KEYCLOAK_URL=https://auth.example.com
KEYCLOAK_REALM=tonguetoquill
KEYCLOAK_CLIENT_ID=web_client
KEYCLOAK_CLIENT_SECRET=secret
```

**Features:**
- Self-hosted control
- Advanced OAuth/OIDC flows
- SSO integration
- Fine-grained permissions

## Implementation Strategy

### File Structure

Server-side service:
```
src/lib/server/services/auth/
├── index.ts                      # Exports
├── auth-provider.ts              # Factory function
├── auth-mock-provider.ts         # Mock implementation
└── auth-supabase-provider.ts     # Supabase implementation (Phase 10+)
```

Client-side service:
```
src/lib/services/auth/
├── index.ts                      # Exports
├── login-client.ts               # Client implementation
└── types.ts                      # Shared types
```

### Provider Factory Pattern

```typescript
// src/lib/server/services/auth/auth-provider.ts
export function createAuthService(): AuthServiceContract {
  const useMocks = process.env.USE_AUTH_MOCKS === 'true';
  
  if (useMocks) {
    return new MockAuthProvider(process.env.MOCK_JWT_SECRET);
  }
  
  return new SupabaseAuthProvider({
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET
  });
}

export const authService = createAuthService();
```

### Client Implementation

```typescript
// src/lib/services/auth/login-client.ts
export class LoginClient {
  private session: Session | null = null;
  
  async signIn(email: string, password: string): Promise<Session> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    this.session = data.session;
    return this.session;
  }
  
  async signOut(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
    this.session = null;
  }
  
  async getCurrentUser(): Promise<User | null> {
    const response = await fetch('/api/auth/me');
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.user;
  }
  
  isAuthenticated(): boolean {
    return this.session !== null;
  }
  
  getSession(): Session | null {
    return this.session;
  }
}

export const loginClient = new LoginClient();
```

## Security Considerations

### What the Application Does NOT Do

- ❌ Store passwords (handled by provider)
- ❌ Validate password strength (handled by provider)
- ❌ Manage login UI/forms (delegated to provider)
- ❌ Handle password reset flows (delegated to provider)
- ❌ Implement rate limiting (handled by provider)
- ❌ Manage email verification (handled by provider)

### What the Application DOES Do

- ✅ Validate JWT tokens from provider
- ✅ Store tokens securely (HTTP-only cookies)
- ✅ Refresh tokens proactively
- ✅ Handle authorization/permissions
- ✅ Provide logout functionality
- ✅ Abstract provider details from frontend

### Token Security

1. **HTTP-only cookies**: JavaScript cannot access tokens
2. **Secure flag**: HTTPS-only transmission
3. **SameSite=Strict**: CSRF protection
4. **Short expiry**: Access tokens expire in 15 minutes
5. **Signature verification**: JWKS endpoint validates provider tokens

## Future Enhancements

### Phase 10+

- Supabase Auth integration
- Database-backed user profiles
- Email verification flows
- Password reset flows

### Post-MVP

- OAuth providers (Google, Microsoft, GitHub)
- Keycloak self-hosted option
- MFA/2FA support
- Role-based access control (RBAC)
- Session management UI
- Activity logging

## Design Decisions

### Why Third-Party Auth Only?

- **Security**: Experts handle password storage and validation
- **Compliance**: Providers maintain security certifications
- **Features**: Email verification, password reset, OAuth built-in
- **Maintenance**: No security patches or updates needed
- **Scale**: Providers handle rate limiting and abuse prevention

### Why Minimal API?

- **Simplicity**: Fewer surface areas for bugs
- **Maintainability**: Less code to test and update
- **Clarity**: Clear separation of concerns
- **Performance**: Minimal client-side logic

### Why HTTP-only Cookies?

- **Security**: XSS attacks cannot steal tokens
- **Automatic**: Browser sends with requests
- **Standard**: Well-understood security model

### Why Separate Login Service?

While authentication is currently in `$lib/services/auth/`, the Login Service provides:

- **Clear naming**: "Login" is more intuitive than "Auth"
- **Focused API**: Only login/logout/session management
- **Future-ready**: Separate from authorization/permissions logic
- **Consistent**: Matches Document Service, Template Service patterns

## Constraints and Limitations

### Current Scope

- ✅ Email/password authentication
- ✅ Session management (login/logout)
- ✅ Token refresh
- ✅ User profile retrieval
- ✅ Mock provider for development
- ✅ Supabase provider (Phase 10+)

### Out of Scope (Initial)

- ❌ OAuth providers (Google, GitHub, etc.)
- ❌ Multi-factor authentication (MFA)
- ❌ Role-based permissions
- ❌ User management UI
- ❌ Session history/activity logs
- ❌ Account deletion flows

These features may be added post-MVP.

## Testing Strategy

### Unit Tests

- Provider factory selection
- Mock provider functionality
- Token validation logic
- Error handling
- Cookie configuration

### Integration Tests

- Login flow end-to-end
- Logout flow
- Token refresh
- Session persistence
- Error scenarios

### Security Tests

- Token expiration handling
- Invalid token rejection
- CSRF protection
- XSS prevention (HTTP-only cookies)

## Cross-References

- [SERVICES.md](./SERVICES.md) - Overall service architecture
- [AUTH.md](./AUTH.md) - Detailed authentication architecture (consolidated into this document)
- [../frontend/API_INTEGRATION.md](../frontend/API_INTEGRATION.md) - Frontend API integration patterns
- [../frontend/STATE_MANAGEMENT.md](../frontend/STATE_MANAGEMENT.md) - Session state management
