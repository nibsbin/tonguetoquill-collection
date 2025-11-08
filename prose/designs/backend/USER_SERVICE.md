# User Service

This document defines the User Service for managing user-related operations, including first login actions.

> **Related**: [SCHEMAS.md](./SCHEMAS.md) for Users table schema, [LOGIN_SERVICE.md](./LOGIN_SERVICE.md) for authentication flow

## Overview

The User Service provides centralized functionality for user-related operations. Currently, this includes running actions on a user's first login (e.g., creating a welcome document).

**Key Characteristics:**

- **Dead simple**: Just a timestamp flag - no complex tracking
- **Centralized**: One place for all user-related operations
- **Idempotent**: Actions safe to run multiple times
- **Non-blocking**: Actions don't delay user login

## Architecture

```
src/lib/server/services/user/
├── first-login-actions.ts  ← All first login logic
└── index.ts                ← Service exports
```

## First Login Actions

### Data Model

The `first_login_at` field in the Users table tracks completion:

```sql
ALTER TABLE Users
ADD COLUMN first_login_at TIMESTAMP WITH TIME ZONE;
```

- `NULL` = first login not yet completed
- `Timestamp` = first login completed at this time

That's it! No complex JSONB arrays or individual action tracking.

### Action Definition

Actions are defined as simple objects in `first-login-actions.ts`:

```typescript
interface FirstLoginAction {
  id: string;
  description: string;
  execute: (userId: UUID) => Promise<void>;
}

const FIRST_LOGIN_ACTIONS: FirstLoginAction[] = [
  {
    id: 'create_welcome_document',
    description: 'Create a USAF Memo document for new users',
    async execute(userId: UUID) {
      const templateContent = await loadTemplate('usaf_template.md');
      await documentService.createDocument({
        user_id: userId,
        name: 'Welcome to Tonguetoquill',
        content: templateContent
      });
    }
  }
  // Add more actions here
];
```

### Execution Flow

1. **Auth callback** calls `runFirstLoginActions(userId, accessToken)` after successful login
2. Function checks if `first_login_at` is `NULL`
3. If `NULL`, runs all actions
4. Marks `first_login_at` with current timestamp
5. On subsequent logins, `first_login_at` is set, so actions are skipped

```typescript
export async function runFirstLoginActions(userId: UUID, accessToken: string): Promise<void>;
```

**Why this simple approach?**
- All actions run together as a group
- If one fails, just retry all of them next time
- Actions are idempotent anyway
- No need to track individual actions

## Adding New Actions

To add a new first login action:

1. Open `src/lib/server/services/user/first-login-actions.ts`
2. Add a new object to the `FIRST_LOGIN_ACTIONS` array:

```typescript
{
  id: 'my_new_action',
  description: 'Description of what this action does',
  async execute(userId: UUID) {
    // Your action logic here
  }
}
```

That's it! The action will run for all users who haven't completed first login yet.

## Integration Points

### Auth Callback

Actions are executed after successful authentication:

```typescript
// routes/api/auth/callback/+server.ts
import { runFirstLoginActions } from '$lib/server/services/user';

// After setting auth cookies...
runFirstLoginActions(result.user.id, result.session.access_token).catch(error => {
  console.error('Failed to run first login actions:', error);
});
```

## Error Handling

**Action Execution Failures:**

- Individual action failures are logged but don't block other actions
- If any action fails, `first_login_at` is still marked
- Failed actions should be idempotent, so re-running is safe

**Best Practices for Action Authors:**

- Make actions idempotent (safe to run multiple times)
- Check if result already exists before creating
- Use descriptive error messages
- Keep actions fast (< 1 second if possible)
- Avoid external API calls if possible

## Schema Migration

Add the `first_login_at` field to Users table:

```sql
-- Migration: Add first_login_at to Users table
ALTER TABLE Users
ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMP WITH TIME ZONE;
```

**Note**: Current implementation uses mock services, so no actual migration needed until Phase 10+.

## Design Decisions

### Why Just a Timestamp?

- **Simplicity**: One field instead of complex JSONB array
- **Sufficient**: We run all actions together anyway
- **Easier to query**: Simple NULL check
- **Less code**: No complex tracking logic

### Why Centralized User Service?

- **Future growth**: Can add other user-related operations here (profile updates, preferences, etc.)
- **Single responsibility**: All user operations in one place
- **Clear naming**: "user service" is intuitive

### Why Run All Actions Together?

- **Simplicity**: No need to track individual actions
- **Idempotent design**: Actions are safe to retry
- **Fewer edge cases**: Either all done or none done

### Why Non-Blocking?

- **UX**: Don't delay user's login
- **Reliability**: Action failures don't break login flow
- **Flexibility**: Actions can be retried on next login

## Future Enhancements

As the service grows, it can include:
- User profile management
- User preferences
- User settings
- User data export
- User deletion/anonymization

## Cross-References

- [SCHEMAS.md](./SCHEMAS.md) - Users table schema
- [LOGIN_SERVICE.md](./LOGIN_SERVICE.md) - Authentication flow
- [DOCUMENT_SERVICE.md](./DOCUMENT_SERVICE.md) - Document creation
