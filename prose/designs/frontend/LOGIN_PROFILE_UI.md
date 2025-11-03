# Login and Profile UI Integration

## Overview

This document defines the UI integration for login and profile functionality in the sidebar. The design supports two distinct states: **Guest Mode** (not authenticated) and **Logged-in Mode** (authenticated), with appropriate UI elements and modals for each state.

> **Related Documents:**
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
- `onclick`: Opens sign-in modal
- `ariaLabel`: "Sign in to your account"

**Styling:**
- Same classes as settings button
- `text-muted-foreground hover:bg-accent hover:text-foreground`
- `active:scale-[0.985]` for press feedback

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

### Sign In Modal

**Component:** shadcn-svelte Dialog

**Purpose:** Allows guest users to sign in to their account

**Structure:**
- DialogHeader: "Sign In" title with description
- Form fields: Email (type="email") and Password (type="password") inputs
- DialogFooter: Cancel button (ghost variant) and Sign In button (default variant)

**Behavior:**
- On successful sign in: Close modal, update UI to logged-in state
- On error: Display error message inline in modal above form fields
- On cancel: Close modal without action

**Error Display:**
- Position: Above form fields
- Styling: Destructive color scheme
- Clear error on retry

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

**Sign In Flow:**
- Call `loginClient.signIn(email, password)`
- On success: Update user state, close modal, optionally show success toast
- On error: Display error message in modal

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
- `signInModalOpen`: Boolean controlling sign-in modal visibility
- `profileModalOpen`: Boolean controlling profile modal visibility
- `signInError`: String for error messages (nullable)

**User State:**
- `user`: Object with `{ email: string; id: string }` or null
- Can be derived: `isAuthenticated = user !== null`

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

### Modal Appearance

**Follows Design System:**
- Background: `bg-surface-elevated`
- Text: `text-foreground`
- Borders: `border-border`
- Inputs use shadcn-svelte Input component
- Buttons use shadcn-svelte Button component

**Size:**
- Width: 400px (max-w-md)
- Centered on screen
- Mobile: Full width with padding

## Accessibility

### ARIA Labels

**Sign In Button:**
- `aria-label="Sign in to your account"`

**Profile Button:**
- `aria-label="User profile: {user.email}"`

### Keyboard Navigation

**Modals:**
- Focus trap within modal when open
- Escape key closes modal
- Tab cycles through form fields and buttons
- Enter submits form (sign in modal)

**Buttons:**
- Keyboard focusable
- Visible focus ring
- Enter/Space activates

### Screen Reader Support

**State Announcements:**
- "Signed in as {email}" on successful sign in
- "Signed out" on sign out

## Mobile Considerations

### Sheet Integration

Both buttons work identically in mobile sheet as in desktop sidebar:
- Same button structure
- Same modal behavior
- Modals appear centered over sheet
- Sheet closes on successful sign in/out (optional)

### Touch Targets

- Minimum 44x44px touch target (already met by button size)
- Adequate spacing from other buttons

## Error Handling

### Sign In Errors

**Display Location:** Inline in sign-in modal above form

**Error Types:**
- Invalid credentials: "Invalid email or password"
- Network error: "Unable to connect. Please try again."
- Server error: "An error occurred. Please try again later."

**Error Styling:**
- Text color: `text-destructive`
- Background: `bg-destructive/10`
- Border: `border-destructive`
- Icon: Alert triangle

### Sign Out Errors

**Display Location:** Toast notification (sign out errors are rare)

**Error Handling:**
- Clear local session state even on error
- Show toast: "Sign out may not have completed. Please try again."

## Future Enhancements

**Post-MVP Features:**

1. **Registration Flow**
   - Add "Create account" link in sign-in modal
   - Separate registration modal

2. **Password Reset**
   - Add "Forgot password" link in sign-in modal
   - Password reset flow modal

3. **Profile Editing**
   - Allow changing email
   - Allow changing password
   - Profile picture upload

4. **Session Management**
   - Display active sessions
   - Ability to sign out other sessions

5. **Social Sign-In**
   - OAuth providers (Google, GitHub, Microsoft)
   - Social login buttons in sign-in modal

## Implementation Checklist

- [ ] Add `LogIn` and `CircleUser` icons to Sidebar imports
- [ ] Add state variables for modals and errors
- [ ] Create sign-in button using SidebarButtonSlot (guest mode)
- [ ] Create profile button using SidebarButtonSlot (logged-in mode)
- [ ] Position buttons above settings, under same divider
- [ ] Implement sign-in modal with form
- [ ] Implement profile modal with account info
- [ ] Connect sign-in flow to loginClient
- [ ] Connect sign-out flow to loginClient
- [ ] Handle authentication state in layout
- [ ] Test guest mode → sign in → logged-in mode flow
- [ ] Test logged-in mode → sign out → guest mode flow
- [ ] Test error handling for sign in
- [ ] Test mobile sheet integration
- [ ] Verify accessibility (keyboard nav, ARIA labels)

## Cross-References

- [SIDEBAR.md](./SIDEBAR.md) - Sidebar structure and button patterns
- [LOGIN_SERVICE.md](../../designs/backend/LOGIN_SERVICE.md) - Login service API
- [AUTH.md](../../designs/backend/AUTH.md) - Authentication architecture
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - UI components and styling
- [API_INTEGRATION.md](./API_INTEGRATION.md) - Frontend API patterns
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - State management patterns
