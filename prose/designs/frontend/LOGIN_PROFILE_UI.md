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
```svelte
<Dialog bind:open={signInModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Sign In</DialogTitle>
      <DialogDescription>
        Sign in to your Tonguetoquill account
      </DialogDescription>
    </DialogHeader>
    
    <!-- Sign in form -->
    <form>
      <div class="space-y-4">
        <div>
          <Label for="email">Email</Label>
          <Input id="email" type="email" required />
        </div>
        <div>
          <Label for="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
      </div>
    </form>
    
    <DialogFooter>
      <Button variant="ghost" onclick={closeSignInModal}>
        Cancel
      </Button>
      <Button variant="default" onclick={handleSignIn}>
        Sign In
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Fields:**
- Email (text input, type="email")
- Password (text input, type="password")

**Actions:**
- Cancel button (ghost variant)
- Sign In button (default variant)

**Behavior:**
- On successful sign in: Close modal, update UI to logged-in state
- On error: Display error message inline in modal
- On cancel: Close modal without action

**Error Display:**
- Show error message above form fields
- Use destructive color scheme
- Clear error on retry

### Profile Modal

**Component:** shadcn-svelte Dialog

**Purpose:** Display basic account information for logged-in users

**Structure:**
```svelte
<Dialog bind:open={profileModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Account Information</DialogTitle>
      <DialogDescription>
        Your account details
      </DialogDescription>
    </DialogHeader>
    
    <!-- Account info display -->
    <div class="space-y-4">
      <div>
        <Label class="text-muted-foreground">Email</Label>
        <p class="text-foreground">{user.email}</p>
      </div>
      <div>
        <Label class="text-muted-foreground">User ID</Label>
        <p class="text-foreground font-mono text-sm">{user.id}</p>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="ghost" onclick={handleSignOut}>
        Sign Out
      </Button>
      <Button variant="default" onclick={closeProfileModal}>
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Information Displayed:**
- Email address
- User ID (UUID format, monospace font)

**Actions:**
- Sign Out button (ghost variant, destructive action)
- Close button (default variant)

**Behavior:**
- On sign out: Close modal, call loginClient.signOut(), update UI to guest state
- On close: Close modal without action

## Integration with Login Service

### Client-Side Integration

**Import:**
```typescript
import { loginClient } from '$lib/services/auth';
```

**Sign In Flow:**
```typescript
async function handleSignIn() {
  try {
    const result = await loginClient.signIn(email, password);
    if (result.success) {
      // Update user state
      user = result.user;
      // Close modal
      signInModalOpen = false;
      // Optional: Show success toast
    }
  } catch (error) {
    // Display error in modal
    errorMessage = error.message;
  }
}
```

**Sign Out Flow:**
```typescript
async function handleSignOut() {
  try {
    await loginClient.signOut();
    // Clear user state
    user = null;
    // Close modal
    profileModalOpen = false;
    // Optional: Show success toast
  } catch (error) {
    // Display error (likely network error)
    console.error('Sign out failed:', error);
  }
}
```

**Check Authentication State:**
```typescript
onMount(async () => {
  if (await loginClient.isAuthenticated()) {
    const currentUser = await loginClient.getCurrentUser();
    user = currentUser;
  }
});
```

## State Management

### Reactive State Variables

**In Sidebar Component:**
```typescript
let user = $state<{ email: string; id: string } | null>(null);
let signInModalOpen = $state(false);
let profileModalOpen = $state(false);
let signInError = $state<string | null>(null);
```

**Derived State:**
```typescript
const isAuthenticated = $derived(user !== null);
```

### User Prop

The Sidebar component already accepts a `user` prop:
```typescript
type SidebarProps = {
  user?: { email: string; id: string } | null;
};

let { user }: SidebarProps = $props();
```

This prop should be passed from the layout or page that loads the user session.

## Layout Integration

### Root Layout Responsibilities

The root layout (`+layout.svelte` or `+layout.server.ts`) should:

1. Check authentication status on page load
2. Fetch current user if authenticated
3. Pass user to Sidebar component

**Example Pattern:**
```typescript
// +layout.server.ts
import { authService } from '$lib/server/services/auth';

export async function load({ cookies }) {
  const token = cookies.get('access_token');
  
  if (token) {
    try {
      const user = await authService.getCurrentUser(token);
      return { user };
    } catch {
      // Invalid token, user not authenticated
      return { user: null };
    }
  }
  
  return { user: null };
}
```

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
