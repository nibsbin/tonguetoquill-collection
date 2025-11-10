# Authentication Flow

**Purpose**: End-to-end OAuth authentication flow across all layers.

**TL;DR**: OAuth delegation pattern with JWT tokens, provider abstraction, and optimistic guest-mode defaults.

---

## When to Use

- Understanding complete auth lifecycle
- Adding new OAuth providers
- Debugging auth issues across layers
- Onboarding new developers to auth system

---

## Authentication Architecture

### 1. Service Layer (Backend)

**Location**: [LOGIN_SERVICE.md](../backend/LOGIN_SERVICE.md)

**Contract**: `AuthContract` interface defines provider-agnostic operations

- `login(provider)` → OAuth redirect URL
- `callback(code, state)` → JWT token
- `logout()` → void
- `refreshToken()` → new JWT
- `getUser()` → user profile

**Key Design**: Minimal API surface, OAuth delegation to providers

### 2. Adapter Layer (Backend)

**Location**: [SUPABASE_AUTH_ADAPTER.md](../backend/SUPABASE_AUTH_ADAPTER.md)

**Implementation**: Maps AuthContract to Supabase Auth API

- Thin adapter (no business logic)
- Token validation and refresh
- Error mapping to app errors
- KISS principle

### 3. Frontend Integration (Client)

**Location**: [API_INTEGRATION.md](../frontend/API_INTEGRATION.md)

**Responsibilities**:

- Call `/api/auth/login` → Get OAuth URL
- Redirect to provider
- Handle `/api/auth/callback` → Store JWT
- Attach JWT to all authenticated requests
- Handle token refresh on 401
- Update auth store on success/failure

### 4. UI Layer (Client)

**Location**: [LOGIN_PROFILE_UI.md](../frontend/LOGIN_PROFILE_UI.md)

**Components**:

- Sign In button (guest mode)
- Profile button (authenticated mode)
- Login modal with provider selection
- Profile modal with user info
- Logout action

---

## Complete Flow

### Login Flow

```
User → UI                   : Click "Sign In"
UI → Auth Store            : Open login modal
UI → API                   : GET /api/auth/login?provider=github
API → Adapter              : adapter.login('github')
Adapter → Supabase         : Get OAuth URL
Supabase → Adapter         : Return OAuth URL
Adapter → API              : Return OAuth URL
API → UI                   : Return OAuth URL
UI → Browser               : Redirect to GitHub
GitHub → User              : User authorizes
GitHub → API               : GET /api/auth/callback?code=XXX
API → Adapter              : adapter.callback(code, state)
Adapter → Supabase         : Exchange code for token
Supabase → Adapter         : Return JWT + user
Adapter → API              : Return JWT + user
API → UI                   : Set-Cookie: token=XXX, return user
UI → Auth Store            : Update: isAuthenticated=true, user=...
UI → Document Store        : Fetch authenticated documents
```

### Token Refresh Flow

```
API Request → Backend      : GET /api/documents (with expired token)
Backend → Adapter          : Validate token
Adapter → Result           : Token expired (401)
Backend → Frontend         : 401 Unauthorized
Frontend → API             : POST /api/auth/refresh
API → Adapter              : adapter.refreshToken()
Adapter → Supabase         : Refresh token
Supabase → Adapter         : New JWT
Adapter → API              : Return new JWT
API → Frontend             : Set-Cookie: token=XXX
Frontend → API             : Retry original request (GET /api/documents)
```

### Logout Flow

```
User → UI                  : Click "Logout"
UI → API                   : POST /api/auth/logout
API → Adapter              : adapter.logout()
Adapter → Supabase         : Clear session
API → UI                   : Clear-Cookie: token
UI → Auth Store            : Update: isAuthenticated=false, user=null
UI → Document Store        : Switch to guest mode (localStorage)
```

---

## Key Patterns

### Provider Abstraction

- Service contract defines operations
- Adapter implements provider-specific details
- Easy to swap Supabase for another provider
- No provider-specific code in UI/API layers

### OAuth Delegation

- Don't implement OAuth ourselves
- Delegate to provider (Supabase, Firebase, Auth0, etc.)
- Minimal token management
- Security best practices handled by provider

### Optimistic Guest Mode

- App defaults to guest mode on load
- No blocking auth check
- Seamless transition when auth resolves
- See [OPTIMISTIC_PAGE_LOADING.md](../frontend/OPTIMISTIC_PAGE_LOADING.md)

### JWT Token Management

- Stored in HTTP-only cookie (secure)
- Attached to all API requests
- Auto-refresh on 401
- Clear on logout

---

## Error Handling

| Error         | Layer    | Behavior                            |
| ------------- | -------- | ----------------------------------- |
| Provider down | Adapter  | Return error, UI shows toast        |
| Invalid token | API      | Return 401, frontend refreshes      |
| Refresh fails | API      | Logout user, redirect to guest mode |
| Network error | Frontend | Retry with exponential backoff      |

---

## Adding New Providers

1. **Update AuthContract** (if needed for provider-specific features)
2. **Create Adapter** (e.g., `FirebaseAuthAdapter.ts`)
3. **Update LOGIN_PROFILE_UI.md** with new provider option
4. **Test complete flow** (login → callback → refresh → logout)

---

## Testing Strategy

- **Unit**: Test adapter methods in isolation
- **Integration**: Test complete auth flow with mock provider
- **E2E**: Test OAuth redirect and callback in browser
- **Manual**: Test each provider (GitHub, Google, etc.)

---

## Cross-References

- [LOGIN_SERVICE.md](../backend/LOGIN_SERVICE.md) - Service contract
- [SUPABASE_AUTH_ADAPTER.md](../backend/SUPABASE_AUTH_ADAPTER.md) - Adapter implementation
- [API_INTEGRATION.md](../frontend/API_INTEGRATION.md) - Frontend integration
- [LOGIN_PROFILE_UI.md](../frontend/LOGIN_PROFILE_UI.md) - UI components
- [STATE_MANAGEMENT.md](../frontend/STATE_MANAGEMENT.md) - Auth store pattern
