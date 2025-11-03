# Authentication Delegation Implementation Plan

This plan outlines the implementation of delegated authentication where the application **only** handles token validation and storage, while authentication UI and flows are completely delegated to external providers.

> **Related Design**: [../designs/backend/LOGIN_SERVICE.md](../designs/backend/LOGIN_SERVICE.md) - Authentication architecture and service implementation

## Objectives

1. Remove all custom authentication UI (login/register forms)
2. Remove password handling logic from the application
3. Implement OAuth callback handling for provider-hosted auth
4. Simplify auth service to token validation only
5. Update API routes to support OAuth flow

## Scope

### In Scope

- Remove custom login/register UI pages
- Remove password reset and email verification flows
- Simplify AuthContract to token validation only
- Add OAuth callback handling
- Update mock provider to simulate OAuth flow
- Add Supabase provider implementation (Phase 10)
- Update error handling to remove password-related errors
- Update documentation

### Out of Scope

- OAuth provider integration (Google, GitHub) - Post-MVP
- Multi-factor authentication - Post-MVP  
- Advanced session management UI - Post-MVP
- Keycloak provider - Post-MVP

## Implementation Steps

### Step 1: Update AuthContract Interface

**Goal**: Simplify the auth service contract to only handle tokens

**Changes to `src/lib/services/auth/types.ts`:**

- Remove `SignUpParams` interface (no longer needed)
- Remove `SignInParams` interface (no longer needed)
- Remove `ResetPasswordParams` interface (delegated to provider)
- Remove `VerifyEmailParams` interface (delegated to provider)
- Remove error codes: `invalid_credentials`, `user_not_found`, `email_already_exists`, `weak_password`, `invalid_email`
- Simplify `AuthContract` interface:
  - Remove `signUp()` method
  - Remove `signIn()` method
  - Remove `resetPassword()` method
  - Remove `verifyEmail()` method
  - Keep `validateToken()`, `getCurrentUser()`, `refreshSession()`, `signOut()`
  - Add `exchangeCodeForTokens(code: string)` for OAuth callback

**Expected Outcome**: Cleaner interface focused solely on token management

### Step 2: Update Mock Provider

**Goal**: Simplify mock to simulate OAuth-like token issuance

**Changes to `src/lib/server/services/auth/auth-mock-provider.ts`:**

- Remove `signUp()` implementation
- Remove `signIn()` implementation  
- Remove `resetPassword()` implementation
- Remove `verifyEmail()` implementation
- Remove password storage and validation logic
- Simplify to only provide:
  - `exchangeCodeForTokens()` - Simulate OAuth callback (accepts any code, returns valid tokens)
  - `validateToken()` - Validate JWT signature
  - `refreshSession()` - Exchange refresh token for new access token
  - `getCurrentUser()` - Extract user from token
  - `signOut()` - Invalidate token (no-op in mock)

**Expected Outcome**: Mock simulates provider behavior without password handling

### Step 3: Remove Custom Auth UI

**Goal**: Remove login and registration pages

**Files to Remove:**
- `src/routes/(auth)/login/+page.svelte`
- `src/routes/(auth)/register/+page.svelte`
- `src/routes/(auth)/` directory (if now empty)

**Expected Outcome**: No custom auth UI in application

### Step 4: Update API Routes

**Goal**: Replace custom auth endpoints with OAuth flow

**Routes to Remove:**
- `src/routes/api/auth/register/+server.ts` - Use provider's hosted signup
- `src/routes/api/auth/login/+server.ts` - Use provider's hosted login

**Routes to Add:**
- `src/routes/api/auth/login/+server.ts` - GET handler that redirects to provider
- `src/routes/api/auth/callback/+server.ts` - Handle OAuth callback, exchange code for tokens

**Routes to Keep (with updates):**
- `src/routes/api/auth/logout/+server.ts` - Clear cookies
- `src/routes/api/auth/refresh/+server.ts` - Refresh tokens
- `src/routes/api/auth/me/+server.ts` - Get current user

**Expected Outcome**: API supports OAuth flow instead of custom auth

### Step 5: Update Client Service

**Goal**: Update login client to use OAuth flow

**Changes to `src/lib/services/auth/login-client.ts`:**

- Remove or update `signIn()` to redirect to provider instead of posting credentials
- Remove or update `signUp()` to redirect to provider instead of posting credentials
- Add `handleCallback()` to process OAuth callback
- Keep `signOut()`, `getCurrentUser()`, `isAuthenticated()`, `getSession()`

**Expected Outcome**: Client supports OAuth flow

### Step 6: Implement Supabase Provider (Phase 10)

**Goal**: Add production auth provider

**New file: `src/lib/server/services/auth/auth-supabase-provider.ts`:**

Implement `AuthContract` using Supabase Auth:
- `exchangeCodeForTokens()` - Exchange OAuth code for tokens via Supabase API
- `validateToken()` - Validate JWT using Supabase JWKS
- `refreshSession()` - Refresh token via Supabase API
- `getCurrentUser()` - Extract user from validated token
- `signOut()` - Call Supabase logout endpoint (optional)

**Update `src/lib/server/services/auth/auth-provider.ts`:**
- Import SupabaseAuthProvider
- Create Supabase provider when `USE_AUTH_MOCKS=false`

**Expected Outcome**: Production-ready Supabase integration

### Step 7: Update Tests

**Goal**: Update tests to reflect simplified contract

**Changes to `src/lib/server/services/auth/auth.contract.test.ts`:**

- Remove tests for `signUp()`, `signIn()`, `resetPassword()`, `verifyEmail()`
- Add tests for `exchangeCodeForTokens()`
- Update tests to use new simplified interface
- Test token validation edge cases
- Test refresh token flow

**Expected Outcome**: Tests cover new contract

### Step 8: Update Environment Variables

**Goal**: Add configuration for OAuth and Supabase

**Update `.env.example`:**

```bash
# Auth Configuration
USE_AUTH_MOCKS=true

# Mock Provider (Development)
MOCK_JWT_SECRET=dev_secret_key

# Supabase Provider (Production)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret

# OAuth Configuration
AUTH_REDIRECT_URI=http://localhost:5173/api/auth/callback
```

**Expected Outcome**: Clear configuration for both mock and production

### Step 9: Update Documentation

**Goal**: Document the new OAuth flow

**Files to Update:**
- Add code examples to LOGIN_SERVICE.md showing OAuth flow
- Update README.md with new auth setup instructions
- Document environment variables

**Expected Outcome**: Clear documentation for OAuth-based auth

## Migration Path

Since this breaks existing auth implementation, we need a clean migration:

### For Development

1. Remove existing user accounts (mock only, no persistent data)
2. Clear browser cookies
3. Use the new OAuth-like flow (simplified in mock)

### For Production (Phase 10)

1. This will be a fresh deployment (MVP)
2. No existing users to migrate
3. All new users will use Supabase-hosted auth

## Testing Strategy

### Unit Tests

- Test token validation logic
- Test token refresh logic
- Test OAuth code exchange (mocked)
- Test error handling

### Integration Tests

- Test full OAuth flow (mock provider)
- Test callback handling
- Test token storage in cookies
- Test session persistence

### Manual Testing

- Test redirect to provider (in Supabase phase)
- Test callback handling
- Test authenticated requests
- Test token refresh
- Test logout

## Success Criteria

- [ ] No custom login/register UI in application
- [ ] No password handling in application code
- [ ] OAuth callback flow working with mock provider
- [ ] Tokens properly stored in HTTP-only cookies
- [ ] Token validation working
- [ ] Token refresh working
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Supabase provider ready for Phase 10

## Risks and Mitigations

### Risk: Breaking existing development workflow

**Mitigation**: Update mock provider to maintain development velocity. Developers can use simplified auth flow during development.

### Risk: OAuth complexity

**Mitigation**: Start with simple flow (authorization code). Provider libraries handle most complexity.

### Risk: Testing OAuth flow locally

**Mitigation**: Mock provider simulates OAuth without requiring external service. Real provider tested in staging.

### Risk: Token security

**Mitigation**: Use HTTP-only, Secure, SameSite cookies. Follow OWASP recommendations.

## Timeline Estimate

**Note**: Per agent instructions, no time estimates. This is a rough ordering only.

1. Update types and contract (Step 1)
2. Simplify mock provider (Step 2)
3. Update API routes (Step 4)
4. Remove custom UI (Step 3)
5. Update client service (Step 5)
6. Update tests (Step 7)
7. Update env and docs (Steps 8-9)
8. Supabase provider (Step 6) - Phase 10

## Conclusion

This plan simplifies authentication by delegating all auth UI and password handling to external providers. The application becomes focused solely on token management, dramatically reducing complexity and security risks.

The result is a **simpler**, **more secure**, and **more maintainable** authentication system.
