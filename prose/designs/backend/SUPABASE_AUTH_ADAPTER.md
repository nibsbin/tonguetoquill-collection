# Supabase Auth Integration Adapter Design

This document defines the design for integrating Supabase Auth with the application's authentication system. The adapter follows the KISS (Keep It Simple, Stupid) principle and integrates seamlessly with the existing [LOGIN_SERVICE.md](./LOGIN_SERVICE.md) architecture.

> **Related**: [LOGIN_SERVICE.md](./LOGIN_SERVICE.md) for overall authentication architecture
> **Related**: [SERVICES.md](./SERVICES.md) for service architecture patterns

## Philosophy

**KISS - Keep It Simple, Stupid**

The Supabase auth adapter should:
- Use official Supabase libraries (don't reinvent the wheel)
- Delegate all auth operations to Supabase (minimal custom logic)
- Follow the existing AuthContract interface (no interface changes)
- Use standard patterns (no clever abstractions)
- Be easy to understand and maintain

**Key Principle:** Let Supabase do the heavy lifting. Our adapter is just a thin wrapper.

## Overview

The Supabase Auth Adapter is a server-side implementation of the AuthContract interface that integrates with Supabase's managed authentication service. It provides:

1. **OAuth Code Exchange**: Convert authorization codes to access/refresh tokens
2. **Token Validation**: Verify JWT signatures using Supabase's JWKS
3. **Session Management**: Refresh expired tokens, sign out users
4. **User Retrieval**: Extract user information from validated tokens

**What It Is:**
- A thin adapter between our AuthContract and Supabase's Auth API
- Server-side only (never exposed to client)
- Production-ready authentication using Supabase managed service

**What It Is NOT:**
- A custom authentication system
- A client-side service
- A replacement for Supabase's hosted UI

## Architecture

### Adapter Pattern

The Supabase Auth Adapter implements the Adapter pattern to translate between our application's AuthContract interface and Supabase's Auth API.

**Flow:**
1. Application Code
2. AuthContract (interface)
3. SupabaseAuthAdapter (implementation)
4. Supabase Client Library
5. Supabase Auth API

### Dependencies

**Official Supabase Libraries:**
- `@supabase/supabase-js` - Main Supabase client library
- `@supabase/auth-helpers-sveltekit` - SvelteKit-specific auth helpers

**Why Official Libraries:**
- Battle-tested and maintained by Supabase team
- Automatic handling of token refresh
- Built-in JWKS validation
- TypeScript support
- Regular security updates

**Alternative Considered:** Raw fetch() calls to Supabase REST API
**Why Rejected:** Requires manual implementation of JWT validation, token refresh logic, and JWKS caching. The official library handles all of this correctly and securely.

## Adapter Components

### 1. Supabase Client Initialization

**Purpose:** Create and configure Supabase client instance

**Configuration:**
- `SUPABASE_URL`: Project URL (e.g., https://xyz.supabase.co)
- `SUPABASE_ANON_KEY`: Public anonymous key for API access
- `SUPABASE_SERVICE_ROLE_KEY` (optional): For admin operations

**KISS Approach:**
- Single client instance (singleton pattern)
- Use environment variables for configuration
- No custom configuration beyond defaults

### 2. Token Exchange

**Purpose:** Convert OAuth authorization code to access/refresh tokens

**Method:** `exchangeCodeForTokens(code: string)`

**Supabase API:** `auth.exchangeCodeForSession(code)`

**KISS Approach:**
- Call Supabase library method directly
- Map response data to our User and Session types
- Handle errors via standard error mapping

**No custom logic needed** - Supabase library handles:
- Code validation
- Token generation
- User creation/retrieval
- Error handling

### 3. Token Validation

**Purpose:** Verify JWT signature and extract payload

**Method:** `validateToken(token: string)`

**Supabase API:** `auth.getUser(token)` or manual JWT verification with JWKS

**KISS Approach:**
- Use Supabase's built-in token validation
- Library automatically verifies signature using JWKS
- No manual JWKS fetching or caching needed
- Two options: Use built-in validation (recommended) or manual JWT decode if needed

### 4. Session Refresh

**Purpose:** Exchange refresh token for new access token

**Method:** `refreshSession(refreshToken: string)`

**Supabase API:** `auth.refreshSession({ refresh_token })`

**KISS Approach:**
- Supabase handles all refresh logic
- Call library method with refresh token
- Map response to our Session type

### 5. Sign Out

**Purpose:** Invalidate session on Supabase

**Method:** `signOut(accessToken: string)`

**Supabase API:** `auth.signOut()`

**KISS Approach:**
- Simple signout call to Supabase
- No complex cleanup needed

**Note:** Client must also clear cookies independently.

### 6. Get Current User

**Purpose:** Retrieve user information from access token

**Method:** `getCurrentUser(accessToken: string)`

**Supabase API:** `auth.getUser(token)`

**KISS Approach:**
- Call Supabase library method with access token
- Map response to our User type
- Return null if token invalid or user not found

## Data Mapping

The adapter maps between Supabase's data structures and our application's types.

### Supabase User → Application User

**Supabase provides:**
- `id`: User ID (UUID string)
- `email`: User email address
- `user_metadata`: Custom user data (Record<string, any>)
- `created_at`: Account creation timestamp (ISO 8601)
- `updated_at`: Last update timestamp (ISO 8601)

**Mapped to our User type:**
- `id`: Direct mapping from Supabase id
- `email`: Direct mapping from Supabase email
- `dodid`: Extracted from user_metadata.dodid (nullable)
- `profile`: Full user_metadata object
- `created_at`: Direct mapping from Supabase created_at
- `updated_at`: Direct mapping from Supabase updated_at

### Supabase Session → Application Session

**Supabase provides:**
- `access_token`: JWT access token (string)
- `refresh_token`: Refresh token (string)
- `expires_at`: Token expiration (Unix timestamp)
- `user`: User object (User type)

**Mapped to our Session type:**
- Direct mapping for all fields (structures already align)
- User field mapped via User mapping described above

**KISS Principle:** Our types align with Supabase's structure, so mapping is minimal.

## Error Handling

### Supabase Errors → AuthError

Map Supabase error codes to our AuthError codes:

| Supabase Error | Our AuthError Code | HTTP Status |
|----------------|-------------------|-------------|
| `invalid_grant` | `invalid_token` | 401 |
| `invalid_token` | `invalid_token` | 401 |
| `token_expired` | `token_expired` | 401 |
| Network errors | `network_error` | 500 |
| Other errors | `unknown_error` | 500 |

**KISS Approach:**
- Try-catch blocks around Supabase calls
- Map Supabase errors to our AuthError types
- Simple error mapping function

## Security Considerations

### What Supabase Handles (We Trust)

- JWT signature verification via JWKS
- Token expiration checking
- Secure token generation
- Password hashing and storage
- Rate limiting on auth endpoints
- HTTPS/TLS for all API calls

### What Adapter Handles (Minimal)

- Environment variable validation
- Error mapping
- Type conversions
- Access token storage in HTTP-only cookies (handled by API routes, not adapter)

**KISS Security:**
- Trust Supabase's security (they're the experts)
- Don't implement custom crypto or validation
- Use official libraries only

## Configuration

### Environment Variables

**Required:**
- `SUPABASE_URL`: Project URL (e.g., https://your-project.supabase.co)
- `SUPABASE_ANON_KEY`: Public anonymous key

**Optional:**
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations

### Validation

Adapter should validate configuration on initialization:
- Check all required env vars are present
- Throw clear error if misconfigured
- No fallback values (fail fast)

**KISS Validation:**
- Check for required variables (SUPABASE_URL and SUPABASE_ANON_KEY)
- Throw clear error if misconfigured
- No fallback values (fail fast)

**KISS Validation:**
- Simple if-statement to check for required variables
- Fail fast with clear error message on missing configuration

## Testing Strategy

### Unit Tests

Test adapter methods in isolation with mocked Supabase client:

- Test successful token exchange
- Test token validation
- Test session refresh
- Test error mapping
- Test data mapping

**KISS Testing:**
- Mock the Supabase client (not the HTTP layer)
- Test one method at a time
- Use simple assertions

### Integration Tests

Test with real Supabase project (test environment):

- Test full OAuth flow
- Test token refresh before expiry
- Test error scenarios (invalid tokens, expired sessions)
- Test concurrent requests

**Note:** Use dedicated Supabase test project, not production.

## Migration from Current Implementation

### Current State

The existing `SupabaseAuthProvider` uses raw fetch() calls and has incomplete JWT validation.

### Migration Steps

1. Add Supabase library dependencies
2. Replace fetch() calls with Supabase client methods
3. Remove manual JWT parsing
4. Update tests to use mocked Supabase client
5. Update environment configuration

**KISS Migration:**
- Replace methods one at a time
- Keep same AuthContract interface
- No breaking changes to callers

## Why This Design?

### Simplicity

- Official library handles complexity
- No custom JWT validation code
- Minimal error handling logic
- Clear separation of concerns

### Security

- Supabase's security expertise
- Automatic security updates
- No custom crypto implementations
- Regular security audits by Supabase

### Maintainability

- Less code to maintain
- Library updates handle breaking changes
- Clear documentation from Supabase
- Standard patterns (adapter pattern)

### Reliability

- Battle-tested library
- Automatic retry logic
- Connection pooling
- Token refresh handling

## Constraints and Limitations

### In Scope

- Server-side authentication only
- Token validation and management
- OAuth code exchange
- Session refresh
- User retrieval

### Out of Scope

- Custom OAuth flows (use Supabase's)
- Password management (delegated to Supabase)
- Custom user registration (use Supabase hosted UI)
- Social auth providers (configured in Supabase dashboard)
- MFA/2FA (configured in Supabase dashboard)

### Known Limitations

- Requires internet connection to Supabase API
- Dependent on Supabase service availability
- JWKS caching controlled by Supabase library (not configurable)

**KISS Trade-off:** Accept these limitations for simplicity. The alternative (self-hosting) adds massive complexity.

## Future Enhancements

**Post-MVP:**
- Add caching layer for user data (reduce API calls)
- Add metrics/logging for auth operations
- Add admin operations (user management via service role key)
- Add webhook integration for auth events

**KISS Rule:** Only add these if clearly needed. Start simple.

## Cross-References

- [LOGIN_SERVICE.md](./LOGIN_SERVICE.md) - Overall authentication architecture
- [SERVICES.md](./SERVICES.md) - Service patterns and conventions
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth) - Official Supabase auth docs
