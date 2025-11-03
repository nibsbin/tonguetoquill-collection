# Login and Profile UI Integration - Implementation Plan

**Status:** 🚧 IN PROGRESS  
**Date:** 2025-11-03  
**Design Document:** prose/designs/frontend/LOGIN_PROFILE_UI.md

## Overview

This plan implements the login and profile UI integration in the sidebar, supporting both guest mode (with sign-in button) and logged-in mode (with profile button). The implementation adds minimal UI changes to the existing sidebar structure.

## Design Goals

1. **Minimal Changes**: Add only necessary UI elements to existing sidebar
2. **Consistent Patterns**: Use existing SidebarButtonSlot and shadcn-svelte components
3. **Mobile Support**: Work seamlessly in both desktop sidebar and mobile sheet
4. **Authentication Integration**: Connect to existing loginClient service
5. **Accessibility**: Proper ARIA labels and keyboard navigation

## Implementation Tasks

### Phase 1: Design Documentation ✅

- [x] Create LOGIN_PROFILE_UI.md design document
- [x] Define authentication states (guest vs logged-in)
- [x] Specify modal structures and behaviors
- [x] Document integration with login service

### Phase 2: Sidebar Component Updates

#### Task 2.1: Add Icons and State

- [ ] Import `LogIn` and `CircleUser` icons from lucide-svelte
- [ ] Add modal state variables:
  - `signInModalOpen` - Controls sign-in modal visibility
  - `profileModalOpen` - Controls profile modal visibility
  - `signInError` - Stores sign-in error messages
- [ ] Add derived state: `isAuthenticated` based on user prop

**Files to Modify:**
- `src/lib/components/Sidebar/Sidebar.svelte`

#### Task 2.2: Add Sign-In Button (Guest Mode)

- [ ] Create SidebarButtonSlot for sign-in
  - Icon: `LogIn`
  - Label: "Sign in"
  - Position: Above settings button, under same divider
  - Click handler: Opens sign-in modal
- [ ] Add conditional rendering: Show only when `!user`
- [ ] Apply same styling as settings button

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

#### Task 3.1: Create Sign-In Modal

- [ ] Import shadcn-svelte Input component
- [ ] Create Dialog structure for sign-in
  - DialogHeader with title and description
  - Email input field
  - Password input field
  - Error message display area
  - DialogFooter with Cancel and Sign In buttons
- [ ] Implement form validation
- [ ] Add email/password state variables

**Files to Modify:**
- `src/lib/components/Sidebar/Sidebar.svelte`

**New Components to Add (if needed):**
- May need to add Input component from shadcn-svelte

#### Task 3.2: Create Profile Modal

- [ ] Create Dialog structure for profile
  - DialogHeader with title and description
  - Display user email
  - Display user ID (UUID, monospace)
  - DialogFooter with Sign Out and Close buttons
- [ ] Style information display

**Files to Modify:**
- `src/lib/components/Sidebar/Sidebar.svelte`

### Phase 4: Authentication Integration

#### Task 4.1: Connect Sign-In Flow

- [ ] Import `loginClient` from `$lib/services/auth`
- [ ] Implement `handleSignIn()` function
  - Call `loginClient.signIn(email, password)`
  - On success: Update user state, close modal
  - On error: Display error message in modal
- [ ] Clear error on modal close

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

- [ ] Verify sign-in button works in mobile sheet
- [ ] Verify profile button works in mobile sheet
- [ ] Ensure modals display correctly over sheet
- [ ] Test touch interactions

**Files to Verify:**
- `src/lib/components/Sidebar/Sidebar.svelte` (mobile sheet section)

### Phase 6: Testing and Validation

#### Task 6.1: Manual Testing

- [ ] Test guest mode → sign in → logged-in mode flow
- [ ] Test logged-in mode → sign out → guest mode flow
- [ ] Test sign-in with invalid credentials
- [ ] Test sign-in with network error
- [ ] Test mobile sheet integration
- [ ] Test keyboard navigation in modals
- [ ] Test screen reader announcements

#### Task 6.2: Verify Accessibility

- [ ] Check ARIA labels on buttons
- [ ] Verify focus trap in modals
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Verify visible focus indicators
- [ ] Test with screen reader (if possible)

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
   - Add modal state variables
   - Add sign-in button (guest mode)
   - Add profile button (logged-in mode)
   - Add sign-in modal
   - Add profile modal
   - Add authentication handlers

2. **`src/lib/components/ui/input.svelte`** (if not exists)
   - Add shadcn-svelte Input component

### Files to Create

None (all changes are modifications to existing files)

## Dependencies

### Existing Dependencies (Already Available)

- `lucide-svelte` - For LogIn and CircleUser icons ✅
- `shadcn-svelte Dialog` - For modals ✅
- `shadcn-svelte Button` - For buttons ✅
- `loginClient` from `$lib/services/auth` - For authentication ✅

### Potentially Missing Dependencies

- `shadcn-svelte Input` - For form fields
  - Check if exists: `src/lib/components/ui/input.svelte`
  - If missing, add from shadcn-svelte CLI

## Testing Strategy

### Manual Testing Checklist

**Guest Mode:**
- [ ] Sign-in button displays in collapsed sidebar
- [ ] Sign-in button displays with text in expanded sidebar
- [ ] Clicking sign-in button opens modal
- [ ] Modal contains email and password fields
- [ ] Cancel button closes modal
- [ ] Sign in with valid credentials works
- [ ] Sign in with invalid credentials shows error

**Logged-in Mode:**
- [ ] Profile button displays in collapsed sidebar
- [ ] Profile button displays with user email in expanded sidebar
- [ ] Clicking profile button opens modal
- [ ] Modal displays email and user ID
- [ ] Close button closes modal
- [ ] Sign out button signs out and closes modal

**Mobile:**
- [ ] All above tests work in mobile sheet

**Accessibility:**
- [ ] All buttons keyboard focusable
- [ ] Modals trap focus
- [ ] Escape closes modals
- [ ] ARIA labels present

## Design Adherence

### Matches LOGIN_PROFILE_UI.md ✅

All implementation follows the design specification:
- Button placement (above settings, under divider)
- Icon choice (LogIn for guest, CircleUser for logged-in)
- Modal structure (shadcn-svelte Dialog)
- Authentication integration (loginClient)
- State management (reactive variables)
- Accessibility (ARIA labels, keyboard nav)

## Deviations

### None Planned

This implementation should have zero deviations from the design document.

### Potential Adjustments

If Input component is missing:
- Add it from shadcn-svelte: `npx shadcn-svelte@latest add input`
- Alternative: Use basic HTML input with proper styling

## Acceptance Criteria

- [ ] Sign-in button visible in guest mode
- [ ] Profile button visible in logged-in mode
- [ ] Sign-in modal functional with form
- [ ] Profile modal displays account info
- [ ] Authentication flows work correctly
- [ ] Mobile sheet integration works
- [ ] No visual regressions in sidebar
- [ ] All accessibility requirements met
- [ ] No build or lint errors
- [ ] All manual tests pass

## Next Steps (Future Work)

Per LOGIN_PROFILE_UI.md future enhancements:

### Post-MVP Features

1. **Registration Flow**
   - Create account modal
   - Link from sign-in modal

2. **Password Reset**
   - Forgot password flow
   - Reset password modal

3. **Profile Editing**
   - Edit email/password
   - Profile picture

4. **Social Sign-In**
   - OAuth provider buttons
   - Provider integration

## Cross-References

- [LOGIN_PROFILE_UI.md](../../prose/designs/frontend/LOGIN_PROFILE_UI.md) - Design specification
- [SIDEBAR.md](../../prose/designs/frontend/SIDEBAR.md) - Sidebar patterns
- [LOGIN_SERVICE.md](../../prose/designs/backend/LOGIN_SERVICE.md) - Authentication API
- [DESIGN_SYSTEM.md](../../prose/designs/frontend/DESIGN_SYSTEM.md) - UI components

## Conclusion

This plan provides a minimal-change approach to adding login and profile UI to the sidebar. By leveraging existing components (SidebarButtonSlot, shadcn-svelte Dialog) and patterns, the implementation maintains consistency while adding essential authentication UI.
