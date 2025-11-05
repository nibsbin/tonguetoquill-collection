# Email Authentication Flow Design

## Overview

This document outlines the design pattern for implementing email authentication (OTP/magic link) alongside the existing OAuth flow, while maintaining a clean and extensible architecture.

## Problem Statement

The current simplified `AuthContract` uses `getLoginUrl(provider?)` which assumes a redirect-based OAuth flow:

- **OAuth (GitHub)**: User clicks → redirect to provider → callback with code → exchange for tokens ✅
- **Email OTP**: User enters email → server sends OTP → user enters code → validate → create session ❌

Email authentication requires a multi-step flow that doesn't fit the redirect model.

## Design Goals

1. **Maintain simplicity** for OAuth flows (GitHub, Google, etc.)
2. **Support email OTP/magic link** flows elegantly
3. **Keep UI flexible** to handle both synchronous (OAuth) and asynchronous (email) flows
4. **Extensible** for future auth methods (SMS, passkeys, etc.)
5. **Type-safe** with clear contracts

## Proposed Solution: Dual-Contract Pattern

### 1. Core Contracts

```typescript
/**
 * Authentication contract for redirect-based OAuth flows
 * Simple and focused on what it does best
 */
export interface OAuthContract {
	/**
	 * Get OAuth redirect URL for a provider
	 * @returns URL to redirect user to for authentication
	 */
	getLoginUrl(provider: OAuthProvider, redirectUri: string): Promise<string>;

	/**
	 * Exchange OAuth code for session
	 */
	exchangeCodeForTokens(code: string): Promise<AuthResult>;
}

/**
 * Authentication contract for email-based flows (OTP, magic links)
 * Handles multi-step authentication
 */
export interface EmailAuthContract {
	/**
	 * Send authentication email (OTP code or magic link)
	 * @returns Success message to show user
	 */
	sendAuthEmail(email: string, redirectUri: string): Promise<{ message: string }>;

	/**
	 * Verify OTP code entered by user
	 * @returns Session if valid
	 */
	verifyOTP(email: string, code: string): Promise<AuthResult>;

	/**
	 * Verify magic link token (from email click)
	 * @returns Session if valid
	 */
	verifyMagicLink(token: string): Promise<AuthResult>;
}

/**
 * Unified auth provider implementing both contracts
 */
export interface AuthProvider extends OAuthContract, EmailAuthContract {
	// Common methods
	signOut(accessToken: string): Promise<void>;
	refreshSession(refreshToken: string): Promise<Session>;
	getCurrentUser(accessToken: string): Promise<User | null>;
	validateToken(token: string): Promise<TokenPayload>;
}
```

### 2. Provider Configuration (UI Layer)

```typescript
/**
 * UI configuration for authentication providers
 */
export type AuthProviderType = 'oauth' | 'email_otp' | 'magic_link';

export interface AuthProviderConfig {
	id: string;
	type: AuthProviderType;
	name: string;
	icon?: string;

	// For email-based auth
	requiresInput?: boolean;
	inputConfig?: {
		type: 'email';
		placeholder: string;
		label: string;
	};
}
```

### 3. Client Implementation

```typescript
/**
 * Login Client - handles both OAuth and email flows
 */
export class LoginClient {
	/**
	 * Get available auth providers for UI
	 */
	getAvailableProviders(): AuthProviderConfig[] {
		return [
			{
				id: 'github',
				type: 'oauth',
				name: 'Continue with GitHub',
				icon: 'github'
			},
			{
				id: 'email',
				type: 'email_otp',
				name: 'Continue with Email',
				icon: 'mail',
				requiresInput: true,
				inputConfig: {
					type: 'email',
					placeholder: 'your@email.com',
					label: 'Email'
				}
			}
		];
	}

	/**
	 * Initiate OAuth login (redirect-based)
	 */
	async initiateOAuthLogin(provider: string): Promise<void> {
		const url = `/api/auth/login?provider=${provider}`;
		window.location.href = url;
	}

	/**
	 * Send email authentication
	 * @returns Message to show user
	 */
	async sendEmailAuth(email: string): Promise<{ message: string }> {
		const response = await fetch('/api/auth/email/send', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email })
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message);
		}

		return response.json();
	}

	/**
	 * Verify OTP code
	 */
	async verifyEmailOTP(email: string, code: string): Promise<void> {
		const response = await fetch('/api/auth/email/verify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, code })
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message);
		}

		// Session cookies are set by server
		// Redirect to app
		window.location.href = '/';
	}
}
```

### 4. Server Implementation

#### OAuth Flow (Existing)

```typescript
// src/routes/api/auth/login/+server.ts
export const GET: RequestHandler = async (event) => {
	const provider = event.url.searchParams.get('provider') as AuthProvider;
	const callbackUrl = `${getSiteURL(event)}api/auth/callback`;

	// Get OAuth redirect URL
	const loginUrl = await authService.getLoginUrl(provider, callbackUrl);

	throw redirect(302, loginUrl);
};
```

#### Email OTP Flow (New)

```typescript
// src/routes/api/auth/email/send/+server.ts
export const POST: RequestHandler = async (event) => {
	const { email } = await event.request.json();

	// Validate email
	if (!email || !isValidEmail(email)) {
		return json({ error: 'Invalid email' }, { status: 400 });
	}

	// Send OTP email
	const result = await authService.sendAuthEmail(
		email,
		`${getSiteURL(event)}api/auth/email/callback`
	);

	return json({ message: result.message });
};

// src/routes/api/auth/email/verify/+server.ts
export const POST: RequestHandler = async (event) => {
	const { email, code } = await event.request.json();

	try {
		// Verify OTP and get session
		const { session, user } = await authService.verifyOTP(email, code);

		// Set session cookies
		event.cookies.set('sb-access-token', session.access_token, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		event.cookies.set('sb-refresh-token', session.refresh_token, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		return json({ success: true, user });
	} catch (error) {
		return json({ error: 'Invalid code' }, { status: 401 });
	}
};

// src/routes/api/auth/email/callback/+server.ts (for magic links)
export const GET: RequestHandler = async (event) => {
	const token = event.url.searchParams.get('token');

	if (!token) {
		return json({ error: 'Missing token' }, { status: 400 });
	}

	try {
		// Verify magic link token
		const { session, user } = await authService.verifyMagicLink(token);

		// Set session cookies
		// ... (same as verify endpoint)

		// Redirect to app
		throw redirect(302, '/');
	} catch (error) {
		return json({ error: 'Invalid or expired link' }, { status: 401 });
	}
};
```

#### Supabase Provider Implementation

```typescript
export class SupabaseAuthProvider implements AuthProvider {
	// OAuth Contract
	async getLoginUrl(provider: OAuthProvider, redirectUri: string): Promise<string> {
		const { data, error } = await this.supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: redirectUri,
				skipBrowserRedirect: true
			}
		});

		if (error || !data.url) {
			throw new AuthError('network_error', 'Failed to generate login URL', 500);
		}

		return data.url;
	}

	// Email Auth Contract
	async sendAuthEmail(email: string, redirectUri: string): Promise<{ message: string }> {
		// Option A: OTP (6-digit code sent via email)
		const { error } = await this.supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: true
			}
		});

		// Option B: Magic link (clickable link in email)
		// const { error } = await this.supabase.auth.signInWithOtp({
		//   email,
		//   options: {
		//     emailRedirectTo: redirectUri,
		//     shouldCreateUser: true
		//   }
		// });

		if (error) {
			throw new AuthError('network_error', error.message, 500);
		}

		return { message: 'Check your email for a verification code' };
	}

	async verifyOTP(email: string, code: string): Promise<AuthResult> {
		const { data, error } = await this.supabase.auth.verifyOtp({
			email,
			token: code,
			type: 'email'
		});

		if (error || !data.session || !data.user) {
			throw new AuthError('invalid_token', 'Invalid verification code', 401);
		}

		return this.mapSupabaseSession(data.session, data.user);
	}

	async verifyMagicLink(token: string): Promise<AuthResult> {
		// Supabase handles this via their callback URL
		// This would be called from the callback endpoint
		const { data, error } = await this.supabase.auth.exchangeCodeForSession(token);

		if (error || !data.session || !data.user) {
			throw new AuthError('invalid_token', 'Invalid or expired magic link', 401);
		}

		return this.mapSupabaseSession(data.session, data.user);
	}

	// ... existing methods (signOut, refreshSession, etc.)
}
```

### 5. UI Implementation

```svelte
<script lang="ts">
	import { Mail, Github } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { loginClient } from '$lib/services/auth';
	import { browser } from '$app/environment';

	let email = $state('');
	let otp = $state('');
	let showOTPInput = $state(false);
	let loading = $state(false);
	let message = $state('');
	let error = $state('');

	const providers = browser ? loginClient.getAvailableProviders() : [];

	async function handleOAuthLogin(provider: string) {
		await loginClient.initiateOAuthLogin(provider);
	}

	async function handleEmailSubmit() {
		if (!email) {
			error = 'Please enter your email';
			return;
		}

		loading = true;
		error = '';
		message = '';

		try {
			const result = await loginClient.sendEmailAuth(email);
			message = result.message;
			showOTPInput = true;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function handleOTPSubmit() {
		if (!otp) {
			error = 'Please enter the verification code';
			return;
		}

		loading = true;
		error = '';

		try {
			await loginClient.verifyEmailOTP(email, otp);
			// Redirects automatically on success
		} catch (err) {
			error = err.message;
			loading = false;
		}
	}
</script>

<div class="w-72 p-4">
	<h3 class="mb-4 text-lg font-semibold">Sign in</h3>

	<div class="space-y-3">
		{#each providers as provider}
			{#if provider.type === 'oauth'}
				<!-- OAuth Button -->
				<Button
					variant="default"
					class="w-full justify-start gap-2"
					onclick={() => handleOAuthLogin(provider.id)}
				>
					<Github class="h-5 w-5" />
					{provider.name}
				</Button>
			{:else if provider.type === 'email_otp'}
				<!-- Email + OTP Flow -->
				{#if !showOTPInput}
					<!-- Step 1: Enter Email -->
					<div class="space-y-2">
						<Input
							type="email"
							placeholder={provider.inputConfig?.placeholder}
							bind:value={email}
							disabled={loading}
							onkeydown={(e) => e.key === 'Enter' && handleEmailSubmit()}
						/>
						<Button
							variant="outline"
							class="w-full justify-start gap-2"
							onclick={handleEmailSubmit}
							disabled={loading}
						>
							<Mail class="h-5 w-5" />
							{loading ? 'Sending...' : provider.name}
						</Button>
					</div>
				{:else}
					<!-- Step 2: Enter OTP -->
					<div class="space-y-2">
						<Input
							type="text"
							placeholder="Enter 6-digit code"
							bind:value={otp}
							disabled={loading}
							maxlength={6}
							onkeydown={(e) => e.key === 'Enter' && handleOTPSubmit()}
						/>
						<Button variant="outline" class="w-full" onclick={handleOTPSubmit} disabled={loading}>
							{loading ? 'Verifying...' : 'Verify Code'}
						</Button>
						<button
							class="text-sm text-muted-foreground underline"
							onclick={() => {
								showOTPInput = false;
								otp = '';
							}}
						>
							Use a different email
						</button>
					</div>
				{/if}
			{/if}
		{/each}

		<!-- Success Message -->
		{#if message}
			<div
				class="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300"
			>
				{message}
			</div>
		{/if}

		<!-- Error Message -->
		{#if error}
			<div
				class="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300"
			>
				{error}
			</div>
		{/if}
	</div>
</div>
```

## Architecture Benefits

### 1. Separation of Concerns

- **OAuth flows**: Simple redirect-based, handled by `getLoginUrl()`
- **Email flows**: Multi-step, handled by dedicated `sendAuthEmail()` / `verifyOTP()`
- **UI Layer**: Adapts based on provider type, handles state management

### 2. Type Safety

```typescript
// Compile-time guarantees
type OAuthProvider = 'github' | 'google' | 'microsoft';
type EmailProvider = 'email';
type AuthProvider = OAuthProvider | EmailProvider;

// UI knows which flow to use
if (provider.type === 'oauth') {
	// Show button, redirect immediately
} else if (provider.type === 'email_otp') {
	// Show input, two-step flow
}
```

### 3. Extensibility

Easy to add new auth methods:

```typescript
// Future: SMS OTP
{
  id: 'sms',
  type: 'sms_otp',
  name: 'Continue with SMS',
  icon: 'phone',
  requiresInput: true,
  inputConfig: {
    type: 'tel',
    placeholder: '+1 (555) 123-4567',
    label: 'Phone Number'
  }
}

// Future: Passkeys (WebAuthn)
{
  id: 'passkey',
  type: 'webauthn',
  name: 'Continue with Passkey',
  icon: 'key'
}
```

### 4. Testing

Clear boundaries make testing easier:

```typescript
// Mock OAuth flow
const mockOAuthProvider = {
	getLoginUrl: vi.fn().mockResolvedValue('https://github.com/login/oauth/...')
};

// Mock Email flow
const mockEmailProvider = {
	sendAuthEmail: vi.fn().mockResolvedValue({ message: 'Code sent' }),
	verifyOTP: vi.fn().mockResolvedValue({ user, session })
};
```

## Implementation Plan

### Phase 1: Backend Contracts (1-2 hours)

1. Update `AuthContract` interface with email methods
2. Implement email methods in `SupabaseAuthProvider`
3. Add email endpoints (`/api/auth/email/send`, `/api/auth/email/verify`)
4. Write tests

### Phase 2: Client & UI (1-2 hours)

1. Add email methods to `LoginClient`
2. Update provider configuration to include email
3. Enhance `LoginPopover` with email flow UI
4. Handle OTP input state

### Phase 3: Testing & Polish (1 hour)

1. End-to-end testing with real Supabase
2. Error handling and user feedback
3. Loading states and accessibility
4. Documentation

## Alternative: Magic Links Only

If you prefer **magic links** instead of OTP codes:

### Pros

- Simpler UX (one step: enter email, click link)
- No code to remember
- Works well on mobile

### Cons

- Requires email access
- Can be blocked by some email clients
- Slightly slower (need to open email)

### Implementation Difference

```typescript
// Server sends magic link instead of OTP code
async sendAuthEmail(email: string, redirectUri: string): Promise<{ message: string }> {
  const { error } = await this.supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUri, // Magic link goes here
      shouldCreateUser: true
    }
  });

  return { message: 'Check your email for a sign-in link' };
}

// No verifyOTP needed - handled by callback endpoint
// User clicks link → /api/auth/email/callback?token=... → verifyMagicLink()
```

## Recommendation

**Start with OTP** because:

1. Better UX (no need to switch to email app)
2. Works in all environments
3. You can add magic links later as an option
4. Supabase supports both from the same API

## Security Considerations

1. **Rate Limiting**: Limit OTP send requests (e.g., 5 per hour per email)
2. **OTP Expiry**: Codes expire in 5-10 minutes
3. **Code Format**: 6-digit numeric (easy to type, hard to guess)
4. **Brute Force Protection**: Lock after 5 failed attempts
5. **HTTPS Only**: All endpoints require HTTPS in production
6. **CSRF Protection**: SvelteKit handles this automatically

## Monitoring & Analytics

Track these metrics:

- Email send success rate
- OTP verification success rate
- Average time to verify OTP
- Failed verification reasons
- Conversion rate (sent OTP → verified)
