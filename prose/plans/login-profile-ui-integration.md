# Login and Profile UI Integration - Implementation Plan

**Status:** 🚧 IN PROGRESS  
**Date:** 2025-11-03  
**Design Document:** prose/designs/frontend/LOGIN_PROFILE_UI.md

## Overview

This plan implements the login and profile UI integration in the sidebar, supporting both guest mode (with sign-in button) and logged-in mode (with profile button). The implementation uses OAuth delegation - users are redirected to the auth provider's hosted page for authentication, eliminating the need for custom login forms.

## Design Goals

1. **Minimal Changes**: Add only necessary UI elements to existing sidebar
2. **OAuth Delegation**: Redirect to provider for authentication (no custom forms)
3. **Consistent Patterns**: Use existing SidebarButtonSlot and shadcn-svelte components
4. **Mobile Support**: Work seamlessly in both desktop sidebar and mobile sheet
5. **Authentication Integration**: Connect to existing loginClient service
6. **Accessibility**: Proper ARIA labels and keyboard navigation

## Implementation Tasks

### Phase 1: Design Documentation ✅

- [x] Create LOGIN_PROFILE_UI.md design document
- [x] Define authentication states (guest vs logged-in)
- [x] Specify modal structures and behaviors
- [x] Document integration with login service

### Phase 2: Sidebar Component Updates

#### Task 2.1: Add Icons and State

- [ ] Import `LogIn` and `CircleUser` icons from lucide-svelte
- [ ] Add modal state variable:
  - `profileModalOpen` - Controls profile modal visibility
- [ ] Add derived state: `isAuthenticated` based on user prop

**Note:** No sign-in modal needed - OAuth provider handles authentication UI

**Files to Modify:**
- `src/lib/components/Sidebar/Sidebar.svelte`

#### Task 2.2: Add Sign-In Button (Guest Mode)

- [ ] Create SidebarButtonSlot for sign-in
  - Icon: `LogIn`
  - Label: "Sign in"
  - Position: Above settings button, under same divider
  - Click handler: Calls `loginClient.initiateLogin()` to redirect to OAuth provider
- [ ] Add conditional rendering: Show only when `!user`
- [ ] Apply same styling as settings button

**Behavior:** Button redirects to provider-hosted auth page (no modal)

**Files to Modify:**
- `src/lib/components/Sidebar/Sidebar.svelte`

#### Task 2.3: Add Profile Button (Logged-in Mode)

- [ ] Create SidebarButtonSlot for user profile
  - Icon: `CircleUser`
  - Label: User's email or name
  - Position: Above settings button, under same divider
  - Click handler: Opens profile modal
- [ ] Add conditional rendering: Show only when `user` exists
- [ ] Apply same styling as settings button

**Files to Modify:**
- `src/lib/components/Sidebar/Sidebar.svelte`

### Phase 3: Modal Implementation

#### Task 3.1: Create Profile Modal

- [ ] Create Dialog structure for profile
  - DialogHeader with title and description
  - Display user email
  - Display user ID (UUID, monospace)
  - DialogFooter with Sign Out and Close buttons
- [ ] Style information display

**Files to Modify:**
- `src/lib/components/Sidebar/Sidebar.svelte`

### Phase 4: Authentication Integration

#### Task 4.1: Connect Sign-In Flow (OAuth Redirect)

- [ ] Import `loginClient` from `$lib/services/auth`
- [ ] Implement sign-in button click handler
  - Call `loginClient.initiateLogin()` - redirects to OAuth provider
  - No modal, no form - provider handles authentication
  - User returns via `/api/auth/callback` after authenticating

**Files to Modify:**
- `src/lib/components/Sidebar/Sidebar.svelte`

#### Task 4.2: Connect Sign-Out Flow

- [ ] Implement `handleSignOut()` function
  - Call `loginClient.signOut()`
  - Clear user state
  - Close profile modal
  - Handle errors gracefully

**Files to Modify:**
- `src/lib/components/Sidebar/Sidebar.svelte`

#### Task 4.3: Check Initial Auth State

- [ ] Add `onMount` check for authentication
  - Call `loginClient.isAuthenticated()`
  - If authenticated, fetch and set user
- [ ] Handle loading state appropriately

**Files to Modify:**
- `src/lib/components/Sidebar/Sidebar.svelte`

### Phase 5: Mobile Sheet Integration

- [ ] Verify sign-in button works in mobile sheet (redirects to OAuth provider)
- [ ] Verify profile button works in mobile sheet
- [ ] Ensure profile modal displays correctly over sheet
- [ ] Test touch interactions

**Files to Verify:**
- `src/lib/components/Sidebar/Sidebar.svelte` (mobile sheet section)

### Phase 6: Testing and Validation

#### Task 6.1: Manual Testing

- [ ] Test guest mode → click sign in → redirect to OAuth provider
- [ ] Test OAuth provider authentication → callback → logged-in mode
- [ ] Test logged-in mode → sign out → guest mode flow
- [ ] Test OAuth callback error handling
- [ ] Test mobile sheet integration
- [ ] Test keyboard navigation in profile modal
- [ ] Test screen reader announcements

#### Task 6.2: Verify Accessibility

- [ ] Check ARIA labels on buttons
- [ ] Verify focus trap in profile modal
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Verify visible focus indicators
- [ ] Test with screen reader (if possible)
- [ ] Verify redirect announcement for OAuth flow

#### Task 6.3: Build and Lint

- [ ] Run linter to check for issues
- [ ] Build application to verify no errors
- [ ] Check for TypeScript errors

### Phase 7: Documentation Updates

- [ ] Update README if needed
- [ ] Add comments to complex code sections
- [ ] Document any deviations from design (if any)

## Files to Create/Modify

### Files to Modify

1. **`src/lib/components/Sidebar/Sidebar.svelte`**
   - Add icons import (LogIn, CircleUser)
   - Add profile modal state variable
   - Add sign-in button (guest mode) - redirects to OAuth provider
   - Add profile button (logged-in mode)
   - Add profile modal
   - Add authentication handlers

### Files to Create

None (all changes are modifications to existing files)

**Note:** No Input component needed - OAuth provider handles credential collection

## Dependencies

### Existing Dependencies (Already Available)

- `lucide-svelte` - For LogIn and CircleUser icons ✅
- `shadcn-svelte Dialog` - For profile modal ✅
- `shadcn-svelte Button` - For buttons ✅
- `loginClient` from `$lib/services/auth` - For authentication ✅

### OAuth Provider Dependencies

- Auth provider (Supabase/Keycloak) configured with OAuth endpoints
- Provider handles all authentication UI and flows
- No additional UI dependencies needed in application

## Testing Strategy

### Manual Testing Checklist

**Guest Mode:**
- [ ] Sign-in button displays in collapsed sidebar
- [ ] Sign-in button displays with text in expanded sidebar
- [ ] Clicking sign-in button redirects to OAuth provider
- [ ] OAuth provider displays authentication page
- [ ] After authenticating, redirected back to app as logged-in user

**Logged-in Mode:**
- [ ] Profile button displays in collapsed sidebar
- [ ] Profile button displays with user email in expanded sidebar
- [ ] Clicking profile button opens modal
- [ ] Modal displays email and user ID
- [ ] Close button closes modal
- [ ] Sign out button signs out and closes modal

**OAuth Flow:**
- [ ] Successful authentication on provider redirects back
- [ ] Failed authentication shows error on provider page
- [ ] Callback error handling works correctly

**Mobile:**
- [ ] All above tests work in mobile sheet

**Accessibility:**
- [ ] All buttons keyboard focusable
- [ ] Profile modal traps focus
- [ ] Escape closes profile modal
- [ ] ARIA labels present
- [ ] OAuth redirect announced to screen readers

## Design Adherence

### Matches LOGIN_PROFILE_UI.md ✅

All implementation follows the design specification:
- Button placement (above settings, under divider)
- Icon choice (LogIn for guest, CircleUser for logged-in)
- OAuth redirect approach (no custom forms)
- Profile modal structure (shadcn-svelte Dialog)
- Authentication integration (loginClient.initiateLogin())
- State management (reactive variables)
- Accessibility (ARIA labels, keyboard nav)

## Deviations

### None Planned

This implementation should have zero deviations from the design document.

### Potential Adjustments

None needed - OAuth delegation eliminates need for custom form components

## Acceptance Criteria

- [ ] Sign-in button visible in guest mode
- [ ] Sign-in button redirects to OAuth provider (no modal)
- [ ] Profile button visible in logged-in mode
- [ ] Profile modal displays account info
- [ ] OAuth authentication flow works correctly
- [ ] Callback handling works correctly
- [ ] Sign-out flow works correctly
- [ ] Mobile sheet integration works
- [ ] No visual regressions in sidebar
- [ ] All accessibility requirements met
- [ ] No build or lint errors
- [ ] All manual tests pass

## Next Steps (Future Work)

Per LOGIN_PROFILE_UI.md future enhancements:

### Post-MVP Features

1. **Profile Editing**
   - Edit email/password via provider settings page
   - Profile picture

2. **Social Sign-In**
   - OAuth providers (Google, GitHub, etc.)
   - Configured on auth provider side

3. **Session Management**
   - Display active sessions
   - Sign out other sessions

**Note:** Registration, password reset, and email verification are **delegated to the OAuth provider**. Users access these features via the provider's hosted pages, not through custom UI in our application.

## Cross-References

- [LOGIN_PROFILE_UI.md](../../prose/designs/frontend/LOGIN_PROFILE_UI.md) - Design specification
- [SIDEBAR.md](../../prose/designs/frontend/SIDEBAR.md) - Sidebar patterns
- [LOGIN_SERVICE.md](../../prose/designs/backend/LOGIN_SERVICE.md) - Authentication API
- [DESIGN_SYSTEM.md](../../prose/designs/frontend/DESIGN_SYSTEM.md) - UI components

## Conclusion

This plan provides a minimal-change approach to adding login and profile UI to the sidebar using OAuth delegation. By redirecting to the auth provider's hosted pages for authentication, we eliminate the need for custom forms while maintaining a clean, professional user experience. The implementation leverages existing components (SidebarButtonSlot, shadcn-svelte Dialog) and patterns for consistency.
