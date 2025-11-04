# Supabase Auth Adapter Implementation Plan

This plan outlines the implementation of a proper Supabase Auth adapter using the official Supabase client library. The implementation follows the KISS principle and the design specified in [SUPABASE_AUTH_ADAPTER.md](../designs/backend/SUPABASE_AUTH_ADAPTER.md).

> **Related Design**: [../designs/backend/SUPABASE_AUTH_ADAPTER.md](../designs/backend/SUPABASE_AUTH_ADAPTER.md)
> **Related Architecture**: [../designs/backend/LOGIN_SERVICE.md](../designs/backend/LOGIN_SERVICE.md)

## Objectives

1. Replace raw fetch() calls with official Supabase client library
2. Implement proper JWT signature verification using Supabase's built-in validation
3. Simplify error handling using library's error types
4. Improve maintainability by leveraging battle-tested library
5. Maintain backward compatibility with existing AuthContract interface

## Scope

### In Scope

- Add `@supabase/supabase-js` dependency
- Replace `SupabaseAuthProvider` implementation with Supabase client
- Remove manual JWT parsing code
- Use Supabase's built-in token validation
- Update tests to mock Supabase client
- Update environment variable documentation
- Keep existing AuthContract interface (zero breaking changes)

### Out of Scope

- Changes to AuthContract interface
- Changes to API routes
- Changes to mock provider
- Client-side authentication changes
- Social auth providers (configured in Supabase dashboard)
- MFA/2FA implementation (configured in Supabase dashboard)

## Current State Analysis

### Existing Implementation Issues

1. **Manual fetch() calls**: Current implementation uses raw fetch to Supabase REST API
2. **Incomplete JWT validation**: Token validation has TODO for JWKS verification
3. **No library benefits**: Missing automatic token refresh, connection pooling, retry logic
4. **Error handling complexity**: Manual mapping of HTTP status codes to errors
5. **Maintenance burden**: Must keep up with Supabase API changes manually

### What Works (Keep)

- AuthContract interface design
- Data type mappings (User, Session, TokenPayload)
- Factory pattern in auth-provider.ts
- Environment variable structure
- Error type definitions (AuthError, AuthErrorCode)

## Implementation Steps

### Step 1: Add Supabase Dependencies

**Goal:** Install official Supabase client library

**Changes to `package.json`:**

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

**Commands:**
```bash
npm install @supabase/supabase-js
```

**Expected Outcome:** Supabase client library available for import

### Step 2: Create Supabase Client Singleton

**Goal:** Create single Supabase client instance for the adapter

**Changes to `src/lib/server/services/auth/auth-supabase-provider.ts`:**

Add client initialization in constructor:

```typescript
import { createClient } from '@supabase/supabase-js';

export class SupabaseAuthProvider implements AuthContract {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = env.SUPABASE_URL || '';
    const supabaseKey = env.SUPABASE_PUBLISHABLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing. Check environment variables.');
    }

    // Create Supabase client
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,  // We handle refresh manually
        persistSession: false,    // Server-side, no persistence needed
        detectSessionInUrl: false // Server-side, no URL detection
      }
    });
  }
}
```

**Note on Token Validation:** 
The supabase-js client library automatically handles JWT verification using the public JWKS endpoint. No manual JWT secret configuration is required.

**KISS Principle:** Use minimal configuration. Default settings work for most cases.

**Expected Outcome:** Supabase client ready for use in all methods

### Step 3: Implement exchangeCodeForTokens

**Goal:** Use Supabase client to exchange OAuth code for session

**Current Implementation (to replace):**
```typescript
// Manual fetch() call to Supabase REST API
const response = await fetch(
  `${this.supabaseUrl}/auth/v1/token?grant_type=authorization_code`,
  { /* ... */ }
);
```

**New Implementation:**
```typescript
async exchangeCodeForTokens(code: string): Promise<AuthResult> {
  try {
    const { data, error } = await this.supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw this.mapSupabaseError(error);
    }

    if (!data.session || !data.user) {
      throw new AuthError('invalid_token', 'Failed to get session from code', 401);
    }

    return {
      user: this.mapSupabaseUserToUser(data.user),
      session: this.mapSupabaseSessionToSession(data.session)
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('network_error', 'Failed to exchange code for tokens', 500);
  }
}
```

**KISS Benefits:**
- Library handles HTTP details
- Automatic error parsing
- Type-safe responses
- Retry logic included

**Expected Outcome:** Code exchange works using Supabase library

### Step 4: Implement validateToken

**Goal:** Use Supabase's built-in JWT validation

**Current Implementation (to replace):**
```typescript
// Manual JWT decoding without signature verification
const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
// TODO: Implement proper JWT signature verification using Supabase JWKS endpoint
```

**New Implementation:**
```typescript
async validateToken(token: string): Promise<TokenPayload> {
  try {
    // Supabase automatically validates JWT signature using JWKS
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error) {
      throw this.mapSupabaseError(error);
    }

    if (!data.user) {
      throw new AuthError('invalid_token', 'Token validation failed', 401);
    }

    // Extract payload information
    // Note: Supabase has already verified the signature
    const payload: TokenPayload = {
      sub: data.user.id,
      email: data.user.email || '',
      exp: Math.floor(Date.now() / 1000) + 900, // Estimated, library handles actual validation
      iat: Math.floor(Date.now() / 1000),
      role: 'authenticated',
      aud: 'authenticated'
    };

    return payload;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('invalid_token', 'Failed to validate token', 401);
  }
}
```

**KISS Benefits:**
- No manual JWKS fetching
- No manual signature verification
- No manual key caching
- Library handles key rotation

**Expected Outcome:** Proper JWT validation with signature verification

### Step 5: Implement refreshSession

**Goal:** Use Supabase's session refresh method

**Current Implementation (to replace):**
```typescript
// Manual fetch to token endpoint
const response = await fetch(
  `${this.supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
  { /* ... */ }
);
```

**New Implementation:**
```typescript
async refreshSession(refreshToken: string): Promise<Session> {
  try {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      if (error.message?.includes('expired')) {
        throw new AuthError('session_expired', 'Refresh token has expired', 401);
      }
      throw this.mapSupabaseError(error);
    }

    if (!data.session) {
      throw new AuthError('invalid_refresh_token', 'Failed to refresh session', 401);
    }

    return this.mapSupabaseSessionToSession(data.session);
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('network_error', 'Failed to refresh session', 500);
  }
}
```

**KISS Benefits:**
- Automatic token refresh logic
- Built-in error handling
- Type-safe response

**Expected Outcome:** Session refresh using Supabase library

### Step 6: Implement signOut

**Goal:** Use Supabase's signOut method

**Current Implementation (to replace):**
```typescript
const response = await fetch(`${this.supabaseUrl}/auth/v1/logout`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${accessToken}`, apikey: this.supabaseKey }
});
```

**New Implementation:**
```typescript
async signOut(accessToken: string): Promise<void> {
  try {
    // Note: signOut doesn't require token parameter in client mode
    // For server-side, we can call the API directly or just let cookies clear
    const { error } = await this.supabase.auth.signOut();

    if (error && error.message !== 'not_authenticated') {
      // Don't throw on not_authenticated - already logged out
      console.error('Logout error (non-critical):', error);
    }
  } catch (error) {
    // Swallow errors on logout - not critical
    console.error('Logout error (non-critical):', error);
  }
}
```

**KISS Simplification:** Logout is best-effort. Even if it fails, cookies are cleared client-side.

**Expected Outcome:** Simple logout using Supabase library

### Step 7: Implement getCurrentUser

**Goal:** Use Supabase's getUser method

**Current Implementation (to replace):**
```typescript
const response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
  method: 'GET',
  headers: { Authorization: `Bearer ${accessToken}`, apikey: this.supabaseKey }
});
```

**New Implementation:**
```typescript
async getCurrentUser(accessToken: string): Promise<User | null> {
  try {
    const { data, error } = await this.supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return null;
    }

    return this.mapSupabaseUserToUser(data.user);
  } catch (error) {
    // Return null for any error (user not authenticated)
    return null;
  }
}
```

**KISS Benefits:**
- Single method call
- Clear error handling
- Type-safe response

**Expected Outcome:** User retrieval using Supabase library

### Step 8: Add Helper Methods

**Goal:** Create mapping utilities for data conversion

**Add to `SupabaseAuthProvider` class:**

```typescript
/**
 * Map Supabase User to our User type
 */
private mapSupabaseUserToUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    dodid: supabaseUser.user_metadata?.dodid || null,
    profile: supabaseUser.user_metadata || {},
    created_at: supabaseUser.created_at || new Date().toISOString(),
    updated_at: supabaseUser.updated_at || new Date().toISOString()
  };
}

/**
 * Map Supabase Session to our Session type
 */
private mapSupabaseSessionToSession(supabaseSession: any): Session {
  return {
    access_token: supabaseSession.access_token,
    refresh_token: supabaseSession.refresh_token,
    expires_at: supabaseSession.expires_at || 0,
    user: this.mapSupabaseUserToUser(supabaseSession.user)
  };
}

/**
 * Map Supabase errors to AuthError
 */
private mapSupabaseError(error: any): AuthError {
  const message = error.message || 'Unknown error';

  // Map common Supabase error codes
  if (message.includes('invalid_grant')) {
    return new AuthError('invalid_token', 'Invalid authorization code', 401);
  }
  if (message.includes('expired')) {
    return new AuthError('token_expired', 'Token has expired', 401);
  }
  if (message.includes('not_authenticated')) {
    return new AuthError('unauthorized', 'Not authenticated', 401);
  }

  return new AuthError('unknown_error', message, 500);
}
```

**KISS Principle:** Simple, focused mapping functions. No clever abstractions.

**Expected Outcome:** Clean data mapping between Supabase and our types

### Step 9: Update Tests

**Goal:** Update tests to mock Supabase client instead of fetch

**Changes to `src/lib/server/services/auth/auth.contract.test.ts`:**

Replace fetch mocks with Supabase client mocks:

```typescript
import { vi } from 'vitest';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: vi.fn(),
      getUser: vi.fn(),
      refreshSession: vi.fn(),
      signOut: vi.fn()
    }
  }))
}));
```

Update test cases to mock Supabase responses:

```typescript
test('exchangeCodeForTokens returns valid session', async () => {
  const mockSupabase = createClient('url', 'key');
  mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
    data: {
      session: { /* mock session */ },
      user: { /* mock user */ }
    },
    error: null
  });

  const provider = new SupabaseAuthProvider();
  const result = await provider.exchangeCodeForTokens('valid-code');

  expect(result.user).toBeDefined();
  expect(result.session).toBeDefined();
});
```

**KISS Testing:** Mock at the library boundary, not HTTP layer.

**Expected Outcome:** All tests pass with Supabase client mocks

### Step 10: Update Documentation

**Goal:** Document the new implementation

**Changes to `README.md`:**

Add Supabase setup instructions:

```markdown
## Authentication Setup

### Using Supabase Auth (Production)

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Configure environment variables:

```bash
USE_AUTH_MOCKS=false
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

4. Run the application
```

**Changes to `.env.example`:**

```bash
# Auth Configuration
USE_AUTH_MOCKS=true  # Set to false for production

# Supabase Configuration (when USE_AUTH_MOCKS=false)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# Note: The supabase-js library automatically uses the public JWKS endpoint for token validation
```

**Expected Outcome:** Clear setup instructions for Supabase

### Step 11: Remove Deprecated Code

**Goal:** Clean up old implementation artifacts

**Remove from `SupabaseAuthProvider`:**
- Manual fetch() imports
- Manual JWT parsing code
- JWKS TODO comments
- Unused helper functions

**Keep:**
- Constructor structure
- Error handling patterns
- Type definitions

**KISS Principle:** Delete code, don't comment it out.

**Expected Outcome:** Clean, minimal implementation

## Testing Strategy

### Unit Tests

Test each method in isolation with mocked Supabase client:

- [x] `exchangeCodeForTokens()` - Success and error cases
- [x] `validateToken()` - Valid, expired, and invalid tokens
- [x] `refreshSession()` - Success, expired refresh token, network error
- [x] `signOut()` - Success and error cases (non-critical)
- [x] `getCurrentUser()` - Valid token, invalid token, network error
- [x] Error mapping - All Supabase error types to AuthError

**KISS Testing:**
- One assertion per test
- Mock only Supabase client
- Use descriptive test names

### Integration Tests (Manual)

Test with real Supabase project (test environment):

1. Set up test Supabase project
2. Configure test environment variables
3. Test OAuth flow end-to-end
4. Test token refresh before expiry
5. Test concurrent requests
6. Test error scenarios (invalid codes, expired tokens)

**Note:** Use separate Supabase project for testing, not production.

### Contract Tests

Ensure implementation satisfies AuthContract:

- [x] All methods implemented
- [x] Return types match contract
- [x] Errors match contract error codes
- [x] No breaking changes

## Migration Strategy

### Backward Compatibility

**Zero Breaking Changes:**
- AuthContract interface unchanged
- Factory pattern unchanged
- Environment variable structure unchanged (uses SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
- API routes unchanged
- Client service unchanged

### Rollout Plan

1. **Development:** Test with USE_AUTH_MOCKS=true (no changes needed)
2. **Staging:** Test with real Supabase project (USE_AUTH_MOCKS=false)
3. **Production:** Deploy with Supabase configuration

**Rollback Plan:** Set USE_AUTH_MOCKS=true to revert to mock provider

### Data Migration

**No data migration needed** - This is server-side auth provider change only.

## Success Criteria

- [ ] All tests passing (unit + contract tests)
- [ ] No fetch() calls to Supabase REST API (use client library)
- [ ] JWT validation uses Supabase's built-in verification (no manual JWKS)
- [ ] All TODO comments removed
- [ ] Documentation updated
- [ ] Manual testing with real Supabase project successful
- [ ] Zero breaking changes to AuthContract interface
- [ ] Code reduction (fewer lines than current implementation)

## Risks and Mitigations

### Risk: Dependency on external library

**Mitigation:** 
- Use official Supabase library (well-maintained, 1M+ downloads/week)
- Library is battle-tested and used in production by thousands
- Regular security updates
- Alternative: Could implement from scratch, but much higher risk

### Risk: Library version updates breaking changes

**Mitigation:**
- Pin dependency version in package.json
- Test updates in staging before production
- Supabase maintains backward compatibility
- Breaking changes are rare and well-documented

### Risk: Learning curve for team

**Mitigation:**
- Library is well-documented
- Simple API surface (5 methods used)
- KISS implementation (minimal configuration)
- Code is easier to understand than manual fetch()

### Risk: Network dependency on Supabase API

**Mitigation:**
- Same risk exists with current fetch() implementation
- Supabase has 99.9% uptime SLA
- Library includes retry logic
- Graceful degradation (show error, user can retry)

## Performance Considerations

### Improvements Over Current Implementation

1. **Connection Pooling:** Library maintains connection pool
2. **Automatic Retries:** Built-in retry logic for transient failures
3. **JWKS Caching:** Library caches public keys automatically
4. **Request Deduplication:** Library handles concurrent requests efficiently

### Metrics to Monitor

- Token validation latency
- Session refresh success rate
- API error rates
- JWKS cache hit rate (library handles internally)

**KISS Monitoring:** Start simple, add detailed metrics only if problems arise.

## Code Size Comparison

### Current Implementation

- ~240 lines of code
- Manual fetch() calls
- Manual JWT parsing
- Manual error handling
- Incomplete JWKS validation

### New Implementation (Estimated)

- ~180 lines of code
- Supabase client calls
- Library-handled JWT validation
- Simple error mapping
- Complete JWKS validation

**Net Reduction:** ~60 lines of code (~25% reduction)

**Quality Improvement:** More reliable, more secure, more maintainable

## Conclusion

This plan replaces the current manual Supabase integration with the official Supabase client library. The implementation follows KISS principles:

- **Simple:** Use official library, don't reinvent the wheel
- **Secure:** Trust Supabase's security expertise
- **Maintainable:** Less code, better abstractions
- **Compatible:** Zero breaking changes to existing code

The result is a **simpler**, **more secure**, and **more maintainable** authentication adapter.

## Cross-References

**Internal Documentation:**
- [../designs/backend/SUPABASE_AUTH_ADAPTER.md](../designs/backend/SUPABASE_AUTH_ADAPTER.md) - Design document
- [../designs/backend/SUPABASE_AUTH_VERIFICATION.md](../designs/backend/SUPABASE_AUTH_VERIFICATION.md) - Verification against Supabase docs
- [../designs/backend/LOGIN_SERVICE.md](../designs/backend/LOGIN_SERVICE.md) - Authentication architecture
- [../designs/backend/SERVICES.md](../designs/backend/SERVICES.md) - Service patterns

**Official Supabase Documentation:**
- [Supabase Auth Overview](https://supabase.com/docs/guides/auth) - Official auth documentation
- [SvelteKit Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/sveltekit) - SvelteKit integration guide
- [Supabase JS Library Reference](https://supabase.com/docs/reference/javascript) - JavaScript client API reference
