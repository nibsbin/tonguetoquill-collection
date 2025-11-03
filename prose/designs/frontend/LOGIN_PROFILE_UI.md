# Login and Profile UI Integration

## Overview

This document defines the UI integration for login and profile functionality in the sidebar. The design supports two distinct states: **Guest Mode** (not authenticated) and **Logged-in Mode** (authenticated), with appropriate UI elements and modals for each state.

> **Related Documents:**
>
> - [SIDEBAR.md](./SIDEBAR.md) - Sidebar design patterns and structure
> - [LOGIN_SERVICE.md](../../designs/backend/LOGIN_SERVICE.md) - Authentication service details
> - [AUTH.md](../../designs/backend/AUTH.md) - Authentication architecture
> - [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design system and UI patterns

## Design Goals

1. **Clear Authentication State**: Users can immediately identify whether they're signed in or not
2. **Minimal UI Changes**: Leverage existing sidebar structure and button patterns
3. **Consistent Interactions**: Use established modal patterns from shadcn-svelte
4. **Mobile Responsive**: Work seamlessly in both desktop sidebar and mobile sheet
5. **Accessibility**: Proper ARIA labels and keyboard navigation

## Authentication States

### Guest Mode (Not Authenticated)

**Collapsed Sidebar:**

- Display `log-in` icon from lucide-svelte
- Position above settings button
- Same visual treatment as settings button
- Clicking opens sign-in modal

**Expanded Sidebar:**

- Display `log-in` icon + "Sign in" text
- Position above settings button, under same divider
- Same visual treatment as settings button
- Clicking opens sign-in modal

**Visual Hierarchy:**

```
┌─────────────────────────────┐
│  ...                        │
│  Recent Documents           │
│  ...                        │
├─────────────────────────────┤ ← Divider
│  [log-in icon] Sign in      │ ← New button
│  [Settings icon] Settings   │
└─────────────────────────────┘
```

### Logged-in Mode (Authenticated)

**Collapsed Sidebar:**

- Display `circle-user` icon from lucide-svelte
- Position above settings button
- Same visual treatment as settings button
- Clicking opens profile modal

**Expanded Sidebar:**

- Display `circle-user` icon + user's name/email
- Position above settings button, under same divider
- Same visual treatment as settings button
- Text truncates with ellipsis if too long
- Clicking opens profile modal

**Visual Hierarchy:**

```
┌─────────────────────────────┐
│  ...                        │
│  Recent Documents           │
│  ...                        │
├─────────────────────────────┤ ← Divider
│  [circle-user] User Name    │ ← User profile button
│  [Settings icon] Settings   │
└─────────────────────────────┘
```

## UI Components

### Sign In Button (Guest Mode)

**Component Type:** SidebarButtonSlot

**Props:**

- `icon`: `LogIn` from lucide-svelte
- `label`: "Sign in" (shown when expanded)
- `isExpanded`: Sidebar expansion state
- `onclick`: Redirects to provider-hosted auth page via `loginClient.initiateLogin()`
- `ariaLabel`: "Sign in to your account"

**Styling:**

- Same classes as settings button
- `text-muted-foreground hover:bg-accent hover:text-foreground`
- `active:scale-[0.985]` for press feedback

**Behavior:**

- On click: Calls `loginClient.initiateLogin()` which redirects to OAuth provider
- No modal - user leaves application to authenticate on provider's page
- User returns via OAuth callback after successful authentication

### User Profile Button (Logged-in Mode)

**Component Type:** SidebarButtonSlot

**Props:**

- `icon`: `CircleUser` from lucide-svelte
- `label`: User's display name or email
- `isExpanded`: Sidebar expansion state
- `onclick`: Opens profile modal
- `ariaLabel`: "User profile: {user.email}"

**Styling:**

- Same classes as settings button
- `text-muted-foreground hover:bg-accent hover:text-foreground`
- `active:scale-[0.985]` for press feedback
- Text truncates with `overflow-hidden text-ellipsis`

## Modal Dialogs

### Profile Modal

**Component:** shadcn-svelte Dialog

**Purpose:** Display basic account information for logged-in users

**Structure:**

- DialogHeader: "Account Information" title with description
- Content area displaying:
  - Email address (with "Email" label)
  - User ID in UUID format (with "User ID" label, monospace font)
- DialogFooter: Sign Out button (ghost variant) and Close button (default variant)

**Behavior:**

- On sign out: Close modal, call loginClient.signOut(), update UI to guest state
- On close: Close modal without action

## Integration with Login Service

### Client-Side Integration

**Import:** Use `loginClient` from `$lib/services/auth`

**Sign In Flow (OAuth Delegation):**

- Call `loginClient.initiateLogin()` - redirects to provider's hosted auth page
- User authenticates on provider's page (email, password, MFA, etc.)
- Provider redirects back to `/api/auth/callback` with OAuth code
- Callback handler exchanges code for tokens and sets HTTP-only cookies
- User is redirected back to application, now authenticated
- **No custom forms needed** - provider handles all credential collection

**Sign Out Flow:**

- Call `loginClient.signOut()`
- Clear user state
- Close profile modal
- Handle errors gracefully (usually network errors)

**Check Authentication State:**

- On component mount, call `loginClient.isAuthenticated()`
- If authenticated, fetch current user with `loginClient.getCurrentUser()`

## State Management

### Reactive State Variables

**Modal State:**

- `profileModalOpen`: Boolean controlling profile modal visibility

**User State:**

- `user`: Object with `{ email: string; id: string }` or null
- Can be derived: `isAuthenticated = user !== null`

**Note:** No sign-in modal needed since authentication is delegated to provider

### User Prop

The Sidebar component accepts a `user` prop of type `{ email: string; id: string } | null`, passed from the layout or page that loads the user session.

## Layout Integration

### Root Layout Responsibilities

The root layout should:

1. Check authentication status on page load
2. Fetch current user if authenticated
3. Pass user to Sidebar component

**Pattern:** Use server-side load function to check for access token in cookies, validate with authService, and return user object or null.

## Visual Design

### Button Appearance

**Consistent with Settings Button:**

- Same height and padding
- Same icon size (24px / var(--sidebar-icon-size))
- Same hover effects (bg-accent, text-foreground)
- Same active state (scale-[0.985])
- Same text truncation behavior

**Icon Choice:**

- Guest mode: `LogIn` icon (arrow entering door)
- Logged-in: `CircleUser` icon (user avatar silhouette)

### Modal Appearance (Profile Modal Only)

**Follows Design System:**

- Background: `bg-surface-elevated`
- Text: `text-foreground`
- Borders: `border-border`
- Buttons use shadcn-svelte Button component

**Size:**

- Width: 400px (max-w-md)
- Centered on screen
- Mobile: Full width with padding

**Note:** No sign-in modal - users authenticate on provider-hosted pages

## Accessibility

### ARIA Labels

**Sign In Button:**

- `aria-label="Sign in to your account"`

**Profile Button:**

- `aria-label="User profile: {user.email}"`

### Keyboard Navigation

**Profile Modal:**

- Focus trap within modal when open
- Escape key closes modal
- Tab cycles through buttons

**Buttons:**

- Keyboard focusable
- Visible focus ring
- Enter/Space activates

### Screen Reader Support

**State Announcements:**

- "Signed in as {email}" when user returns from OAuth provider
- "Signed out" on sign out

**Navigation:**

- "Redirecting to sign in page" when initiating OAuth flow

## Mobile Considerations

### Sheet Integration

Both buttons work identically in mobile sheet as in desktop sidebar:

- Same button structure
- Same redirect behavior (sign in) and modal behavior (profile)
- Profile modal appears centered over sheet
- Sheet closes on successful sign out (optional)

### Touch Targets

- Minimum 44x44px touch target (already met by button size)
- Adequate spacing from other buttons

## Error Handling

### Sign In Errors (OAuth Provider)

**Delegation:** All sign-in errors handled by OAuth provider's hosted page

- Invalid credentials: Provider displays error
- MFA failures: Provider displays error
- Account issues: Provider displays error

**Application Responsibilities:**

- Handle OAuth callback errors (rare, usually provider issues)
- Display generic error if callback fails: "Sign in failed. Please try again."

### Sign Out Errors

**Display Location:** Toast notification (sign out errors are rare)

**Error Handling:**

- Clear local session state even on error
- Show toast: "Sign out may not have completed. Please try again."

## Future Enhancements

**Post-MVP Features:**

1. **Profile Editing**
   - Allow changing email (via provider settings page)
   - Allow changing password (via provider settings page)
   - Profile picture upload

2. **Session Management**
   - Display active sessions
   - Ability to sign out other sessions

3. **Social Sign-In (Provider Configuration)**
   - OAuth providers (Google, GitHub, Microsoft)
   - Configured on auth provider (Supabase/Keycloak)
   - Application automatically supports when provider enables

**Note:** Registration, password reset, and email verification are **delegated to the OAuth provider** and accessed via provider-hosted pages. The application does not implement these flows.

## Implementation Checklist

- [ ] Add `LogIn` and `CircleUser` icons to Sidebar imports
- [ ] Add state variables for profile modal
- [ ] Create sign-in button using SidebarButtonSlot (guest mode)
  - [ ] Button calls `loginClient.initiateLogin()` to redirect to OAuth provider
- [ ] Create profile button using SidebarButtonSlot (logged-in mode)
- [ ] Position buttons above settings, under same divider
- [ ] Implement profile modal with account info
- [ ] Connect sign-out flow to loginClient
- [ ] Handle authentication state in layout
- [ ] Test guest mode → OAuth redirect → provider auth → callback → logged-in mode flow
- [ ] Test logged-in mode → sign out → guest mode flow
- [ ] Test OAuth callback error handling
- [ ] Test mobile sheet integration
- [ ] Verify accessibility (keyboard nav, ARIA labels)

## Cross-References

- [SIDEBAR.md](./SIDEBAR.md) - Sidebar structure and button patterns
- [LOGIN_SERVICE.md](../../designs/backend/LOGIN_SERVICE.md) - Login service API
- [AUTH.md](../../designs/backend/AUTH.md) - Authentication architecture
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - UI components and styling
- [API_INTEGRATION.md](./API_INTEGRATION.md) - Frontend API patterns
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - State management patterns
