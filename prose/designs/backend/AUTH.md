# Authentication Architecture

This document provides a high-level overview of the authentication architecture. For detailed service implementation, see [LOGIN_SERVICE.md](./LOGIN_SERVICE.md).

> **Related**: [LOGIN_SERVICE.md](./LOGIN_SERVICE.md) for detailed service design

## Philosophy

**Delegate Everything to the Provider**

The application takes a **radical delegation** approach to authentication: the entire authentication flow is handled by external providers (Supabase, Keycloak). The application's role is minimal and focused solely on token management.

**Guiding Principle:** The application should never see, store, or validate user passwords.

## Application Responsibilities (Minimal)

The application has exactly **four** responsibilities:

1. **Validate** JWT tokens received from the provider
2. **Store** tokens securely in HTTP-only cookies
3. **Refresh** tokens before they expire
4. **Clear** cookies on logout

That's it. Nothing more.

## Provider Responsibilities (Everything Else)

Authentication providers (Supabase, Keycloak) handle **everything** related to user authentication:

- **User Registration**
  - Registration UI (provider-hosted pages)
  - Email validation
  - Password strength enforcement
  - Account creation
  
- **User Login**
  - Login UI (provider-hosted pages)
  - Credential validation
  - Password verification
  - Brute force protection
  - Rate limiting
  
- **Password Management**
  - Password storage (hashed)
  - Password reset flows
  - Password reset emails
  - Password update UI
  
- **Email Verification**
  - Verification email delivery
  - Verification link handling
  - Email confirmation UI
  
- **Session Management**
  - Token generation (access + refresh)
  - Token rotation
  - Session tracking
  - Token revocation

## Authentication Flow

### Initial Authentication

1. User clicks "Login" in application
2. Application **redirects** to provider's hosted login page
3. User enters credentials on **provider's page** (not ours)
4. Provider validates credentials (we never see them)
5. Provider redirects back to application with OAuth code
6. Application exchanges code for tokens via provider API
7. Application stores tokens in HTTP-only cookies
8. User is authenticated

### Subsequent Requests

1. Browser automatically sends auth cookies with requests
2. Application validates JWT signature using provider's public keys (JWKS)
3. Application extracts user info from validated token
4. Application performs authorization checks (if needed)
5. Application serves the request

### Token Refresh

1. Access token expires after 15 minutes
2. Application uses refresh token to get new access token from provider
3. Application updates cookies with new tokens
4. User session continues seamlessly

### Logout

1. User clicks "Logout"
2. Application clears auth cookies
3. Application optionally notifies provider (for audit logs)
4. User is logged out

## Security Model

### What We Protect Against

- **XSS Attacks**: HTTP-only cookies prevent JavaScript access to tokens
- **CSRF Attacks**: SameSite=Strict cookies prevent cross-site requests
- **Token Theft**: Short-lived access tokens limit exposure window
- **Man-in-the-Middle**: HTTPS-only transmission (Secure flag)

### What Provider Protects Against

- **Password Breaches**: Provider stores hashed passwords with proper salting
- **Brute Force**: Provider implements rate limiting and account lockouts
- **Credential Stuffing**: Provider detects and blocks automated attacks
- **User Enumeration**: Provider prevents attackers from discovering valid emails
- **Weak Passwords**: Provider enforces password strength requirements

## Design Benefits

### Security Benefits

1. **No Password Exposure**: Application code never handles passwords
2. **Professional Security**: Providers employ security experts and maintain certifications
3. **Automatic Updates**: Provider handles security patches and protocol updates
4. **Reduced Attack Surface**: Minimal auth code means fewer vulnerabilities
5. **Compliance**: Providers maintain SOC 2, ISO 27001, and other certifications

### Maintainability Benefits

1. **Less Code**: No custom auth forms, password validation, or reset flows
2. **Fewer Tests**: Token validation is the only auth logic to test
3. **No Auth Migrations**: Provider handles database schema changes
4. **Simpler Updates**: No need to track auth-related security advisories
5. **Clear Separation**: Auth logic completely separate from business logic

### User Experience Benefits

1. **Professional UI**: Provider-hosted pages are polished and accessible
2. **Consistent Experience**: Users get familiar OAuth/OIDC flows
3. **Mobile Optimized**: Provider pages work well on all devices
4. **Social Login Ready**: Easy to add Google, GitHub, etc. (provider handles)
5. **Password Managers**: Provider forms work with password managers

## Implementation Phases

### Current (Phases 1-9): Mock Provider

For development and testing, use a mock provider that simulates token issuance:

- Mock generates JWT-like tokens for development
- No external dependencies during development
- Quick iteration on app features
- **Note**: Even mock should NOT implement custom login UI

### Phase 10: Supabase Integration

Production authentication using Supabase Auth:

- Redirect to Supabase-hosted login/signup pages
- OAuth callback handling to receive tokens
- JWKS-based token validation
- Token refresh via Supabase API

### Post-MVP: Enhanced Features

- Multiple OAuth providers (Google, GitHub, Microsoft)
- Keycloak for self-hosted enterprise auth
- Multi-factor authentication (provider-managed)
- Advanced session management
- Audit logging

## Why This Approach?

### Traditional Auth (What We're Avoiding)

Traditional approach requires implementing:
- Custom login/signup forms
- Password hashing (bcrypt/argon2)
- Password validation logic
- Password reset token generation
- Email sending infrastructure
- Rate limiting middleware
- Session management
- CSRF protection
- Account recovery flows
- Email verification flows

**Total complexity: ~1000s of lines of code + ongoing security maintenance**

### Delegated Auth (Our Approach)

Our approach requires:
- OAuth redirect handling
- JWT token validation
- Cookie management
- Token refresh logic

**Total complexity: ~100s of lines of code + minimal maintenance**

### The Trade-off

We give up **control** over the auth UI/UX in exchange for **security**, **simplicity**, and **maintainability**.

This is the right trade-off for most applications.

## Cross-References

- [LOGIN_SERVICE.md](./LOGIN_SERVICE.md) - Detailed service implementation
- [../frontend/API_INTEGRATION.md](../frontend/API_INTEGRATION.md) - Frontend integration patterns
- [../frontend/STATE_MANAGEMENT.md](../frontend/STATE_MANAGEMENT.md) - Session state management
