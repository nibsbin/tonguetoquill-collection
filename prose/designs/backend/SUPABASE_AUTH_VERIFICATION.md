# Supabase Auth Adapter - Documentation Verification

This document verifies the design and implementation plan against official Supabase documentation.

## Verification Against Supabase Documentation

### 1. Libraries and Dependencies

**Design Claims:**
- `@supabase/supabase-js` - Main Supabase client library ✅
- `@supabase/auth-helpers-sveltekit` - SvelteKit-specific auth helpers

**Verification:**
According to Supabase's SvelteKit auth documentation:
- ✅ `@supabase/supabase-js` (v2.x) is the core library
- ✅ `@supabase/ssr` is the recommended package for SvelteKit server-side auth (replaces auth-helpers)
- ❌ `@supabase/auth-helpers-sveltekit` is deprecated in favor of `@supabase/ssr`

**Action Required:** Update design to use `@supabase/ssr` for SvelteKit integration instead of deprecated auth-helpers.

### 2. Server-Side Client Configuration

**Design Configuration:**
```
auth: {
  autoRefreshToken: false,
  persistSession: false,
  detectSessionInUrl: false
}
```

**Verification:**
According to Supabase server-side documentation:
- ✅ `persistSession: false` is correct for server-side
- ✅ `detectSessionInUrl: false` is correct for server-side
- ⚠️ `autoRefreshToken: false` - While we handle refresh manually, this is acceptable but not standard

**Recommendation:** Configuration is acceptable for a custom adapter approach.

### 3. OAuth Code Exchange

**Plan Method:** `supabase.auth.exchangeCodeForSession(code)`

**Verification:**
- ✅ Correct method for PKCE flow (OAuth with code exchange)
- ✅ Returns `{ data: { session, user }, error }` structure
- ✅ Suitable for server-side code exchange

**Status:** Verified correct

### 4. Token Validation

**Plan Method:** `supabase.auth.getUser(token)`

**Verification:**
According to Supabase auth documentation:
- ✅ `auth.getUser(jwt)` validates JWT and returns user
- ✅ Automatically verifies JWT signature using project's JWT secret
- ✅ No manual JWKS fetching needed - handled internally
- ✅ Returns null/error for invalid tokens

**Status:** Verified correct

### 5. Session Refresh

**Plan Method:** `supabase.auth.refreshSession({ refresh_token })`

**Verification:**
- ✅ Correct method for refreshing sessions
- ✅ Returns new session with updated tokens
- ✅ Handles token rotation automatically

**Status:** Verified correct

### 6. Sign Out

**Plan Method:** `supabase.auth.signOut()`

**Verification:**
- ✅ Correct method for sign out
- ⚠️ For server-side, this clears the session in Supabase but cookies must be cleared separately
- ✅ Design correctly notes "Client must also clear cookies independently"

**Status:** Verified correct with noted caveat

### 7. Environment Variables

**Design Variables:**
- `SUPABASE_URL` ✅
- `SUPABASE_ANON_KEY` ✅  
- `SUPABASE_SERVICE_ROLE_KEY` (optional) ✅
- Missing: `SUPABASE_JWT_SECRET` ❌

**Verification:**
According to Supabase documentation:
- ✅ `SUPABASE_URL` - Project URL (required)
- ✅ `SUPABASE_ANON_KEY` - Public anon key (required)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Admin operations (optional, server-side only)
- ❌ `SUPABASE_JWT_SECRET` - **Required for server-side JWT verification**

**Action Required:** Add `SUPABASE_JWT_SECRET` to environment variables in design.

### 8. SvelteKit Server-Side Auth Pattern

**Design Approach:** Custom adapter with manual client creation

**Verification:**
Supabase's recommended SvelteKit pattern:
- Use `@supabase/ssr` package
- Create server client in hooks.server.ts
- Use helper functions for cookie management
- Automatic session handling

**Our Approach:** 
- Custom adapter implementing AuthContract
- Manual token management
- Manual cookie handling in API routes

**Status:** Valid alternative approach - we're implementing a custom adapter to fit our existing architecture rather than using Supabase's opinionated helpers. This is acceptable but should be documented as a deliberate architectural decision.

## Issues Found

### Critical Issues

1. **Deprecated Package Reference**
   - **Issue:** Design references `@supabase/auth-helpers-sveltekit` which is deprecated
   - **Fix:** Update to `@supabase/ssr` (though we may not need it for our custom adapter)
   - **Impact:** Medium - misleading but not blocking

2. **Missing JWT Secret**
   - **Issue:** `SUPABASE_JWT_SECRET` not listed in environment variables
   - **Fix:** Add to configuration section
   - **Impact:** High - required for server-side JWT verification

### Minor Issues

3. **SvelteKit-Specific Helpers**
   - **Issue:** Plan says "Don't add SvelteKit-specific helpers yet (YAGNI)"
   - **Verification:** For server-side auth in SvelteKit, `@supabase/ssr` is actually recommended
   - **Fix:** Revise to acknowledge `@supabase/ssr` as optional but recommended for SvelteKit
   - **Impact:** Low - our custom adapter approach is still valid

## Recommendations

### Must Fix
1. ✅ Replace `@supabase/auth-helpers-sveltekit` with `@supabase/ssr` in dependencies section
2. ✅ Add `SUPABASE_JWT_SECRET` to environment variables
3. ✅ Clarify that our custom adapter is an alternative to Supabase's opinionated SSR helpers

### Should Consider
4. ✅ Add note about `@supabase/ssr` as optional dependency for SvelteKit integration
5. ✅ Document why we're using custom adapter vs. Supabase's SSR helpers
6. ✅ Add reference to Supabase SvelteKit documentation in cross-references

## Corrected Implementation Approach

### Option A: Custom Adapter (Current Design)
- Use `@supabase/supabase-js` core library
- Implement AuthContract manually
- Handle cookies in API routes
- **Pros:** Fits our architecture, full control
- **Cons:** More code to maintain

### Option B: Supabase SSR Helpers (Alternative)
- Use `@supabase/ssr` package
- Use provided server client helpers
- Automatic cookie management
- **Pros:** Less code, official patterns
- **Cons:** May not fit AuthContract cleanly

**Recommendation:** Proceed with Option A (custom adapter) but acknowledge Option B exists.

## Verification Summary

| Aspect | Status | Action Needed |
|--------|--------|---------------|
| Core library (`@supabase/supabase-js`) | ✅ Verified | None |
| SvelteKit helpers package | ❌ Incorrect | Update to `@supabase/ssr` |
| Client configuration | ✅ Verified | None |
| OAuth code exchange | ✅ Verified | None |
| Token validation | ✅ Verified | None |
| Session refresh | ✅ Verified | None |
| Sign out | ✅ Verified | None |
| Environment variables | ⚠️ Incomplete | Add JWT_SECRET |
| Server-side pattern | ⚠️ Clarify | Document as alternative approach |

## Conclusion

The design and plan are **mostly correct** but need updates:
1. Fix deprecated package reference
2. Add missing JWT_SECRET environment variable
3. Clarify architectural decision to use custom adapter vs. SSR helpers

These are documentation updates only - the core technical approach is sound.
