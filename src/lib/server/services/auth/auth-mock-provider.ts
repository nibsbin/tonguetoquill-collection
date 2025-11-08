/**
 * Mock Authentication Provider
 * Implements AuthContract using in-memory storage for development
 * Simulates OAuth-like token issuance without password handling
 */

import { webcrypto as crypto } from 'node:crypto';
import type {
	AuthContract,
	AuthProvider,
	AuthProviderConfig,
	AuthResult,
	Session,
	TokenPayload,
	User,
	UUID
} from '$lib/services/auth/types';
import { AuthError } from '$lib/services/auth/types';

interface StoredUser {
	id: UUID;
	email: string;
	dodid?: string | null;
	profile: Record<string, unknown>;
	first_login_at?: string | null;
	created_at: string;
	updated_at: string;
}

/**
 * Mock Authentication Provider
 * Uses in-memory Map storage and simple JWT-like tokens
 * Simulates OAuth-like flow without password handling
 */
export class MockAuthProvider implements AuthContract {
	private users: Map<UUID, StoredUser> = new Map();
	private emailIndex: Map<string, UUID> = new Map(); // email -> user_id mapping
	private otpCodes: Map<string, { code: string; expiresAt: number }> = new Map(); // email -> OTP

	// Session expiry times (in milliseconds)
	private ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes (per design)
	private REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

	private constructor() {
		this.initializeDefaultUser();
	}

	/**
	 * Create a new MockAuthProvider instance
	 */
	static async create(): Promise<MockAuthProvider> {
		return new MockAuthProvider();
	}

	/**
	 * Initialize default test user for development
	 */
	private initializeDefaultUser(): void {
		const userId = '00000000-0000-0000-0000-000000000001' as UUID;
		const now = new Date().toISOString();

		const defaultUser: StoredUser = {
			id: userId,
			email: 'asdf@asdf.com',
			dodid: '0123456789abcdef',
			profile: {},
			first_login_at: null,
			created_at: now,
			updated_at: now
		};

		this.users.set(userId, defaultUser);
		this.emailIndex.set(defaultUser.email, userId);
	}

	/**
	 * Get the available authentication providers
	 */
	async getAvailableProviders(): Promise<AuthProviderConfig[]> {
		await this.simulateDelay();
		return [
			{
				id: 'mock',
				type: 'oauth',
				name: 'mock',
				icon: 'mock',
				requiresInput: false
			}
		];
	}

	/**
	 * Simulate network delay for realistic testing
	 */
	private async simulateDelay(): Promise<void> {
		const delay = Math.random() * 200 + 100; // 100-300ms
		await new Promise((resolve) => setTimeout(resolve, delay));
	}

	/**
	 * Generate a mock JWT token
	 */
	private generateToken(payload: TokenPayload): string {
		const header = { alg: 'none', typ: 'JWT' };
		const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
		const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

		// No signature for mock tokens - just header and payload
		return `${encodedHeader}.${encodedPayload}.`;
	}

	/**
	 * Validate and decode a mock JWT token
	 */
	async validateToken(token: string): Promise<TokenPayload> {
		await this.simulateDelay();

		try {
			const parts = token.split('.');
			if (parts.length !== 3) {
				throw new AuthError('invalid_token', 'Invalid token format', 401);
			}

			const [, encodedPayload] = parts;

			// Decode payload
			const payload = JSON.parse(
				Buffer.from(encodedPayload, 'base64url').toString()
			) as TokenPayload;

			// Check expiry
			const now = Math.floor(Date.now() / 1000);
			if (payload.exp < now) {
				throw new AuthError('token_expired', 'Token has expired', 401);
			}

			return payload;
		} catch (error) {
			if (error instanceof AuthError) {
				throw error;
			}
			throw new AuthError('invalid_token', 'Failed to validate token', 401);
		}
	}

	/**
	 * Get the OAuth login URL for mock provider
	 * Returns a callback URL with a mock authorization code
	 * @param redirectUri - The callback URL to return to after authentication
	 * @param provider - Optional provider to use (ignored in mock mode)
	 */
	async getLoginUrl(redirectUri: string, provider?: AuthProvider): Promise<string> {
		await this.simulateDelay();

		// Generate a mock authorization code
		const mockAuthCode = 'mock_auth_code_' + Date.now();

		// Return the callback URL with the mock code
		// In mock mode, we skip the actual login page and go straight to callback
		// Provider parameter is ignored since mock always returns the same default user
		return `${redirectUri}?code=${mockAuthCode}`;
	}

	/**
	 * Exchange OAuth authorization code for tokens
	 * In mock: Accept any code and return tokens for default user
	 * This simulates what a real OAuth provider would do
	 */
	async exchangeCodeForTokens(code: string): Promise<AuthResult> {
		await this.simulateDelay();

		// Mock: Accept any non-empty code
		if (!code || code.trim() === '') {
			throw new AuthError('invalid_token', 'Invalid authorization code', 400);
		}

		// For development, always return the default user
		// In a real implementation, this would exchange the code with the provider
		const userId = '00000000-0000-0000-0000-000000000001' as UUID;
		const user = this.users.get(userId);

		if (!user) {
			throw new AuthError('unknown_error', 'Default user not found', 500);
		}

		// Create session
		const session = await this.createSession(userId);

		return {
			user: this.toPublicUser(user),
			session
		};
	}

	/**
	 * Create a session for a user
	 */
	private async createSession(userId: UUID): Promise<Session> {
		const user = this.users.get(userId);
		if (!user) {
			throw new AuthError('unknown_error', 'User not found', 404);
		}

		const now = Math.floor(Date.now() / 1000);
		const accessTokenExpiry = now + Math.floor(this.ACCESS_TOKEN_EXPIRY / 1000);
		const refreshTokenExpiry = now + Math.floor(this.REFRESH_TOKEN_EXPIRY / 1000);

		// Create access token
		const accessTokenPayload: TokenPayload = {
			sub: userId,
			email: user.email,
			exp: accessTokenExpiry,
			iat: now,
			role: 'authenticated',
			aud: 'authenticated'
		};
		const accessToken = this.generateToken(accessTokenPayload);

		// Create refresh token
		const refreshTokenPayload: TokenPayload = {
			sub: userId,
			email: user.email,
			exp: refreshTokenExpiry,
			iat: now,
			role: 'authenticated',
			aud: 'authenticated'
		};
		const refreshToken = this.generateToken(refreshTokenPayload);

		return {
			access_token: accessToken,
			refresh_token: refreshToken,
			expires_at: accessTokenExpiry,
			user: this.toPublicUser(user)
		};
	}

	/**
	 * Invalidate session (no-op in mock since tokens are stateless)
	 */
	async signOut(accessToken: string): Promise<void> {
		await this.simulateDelay();
		// Mock: No-op since we don't track sessions in mock
		// In production, would invalidate the session in the provider
	}

	/**
	 * Refresh expired access token
	 */
	async refreshSession(refreshToken: string): Promise<Session> {
		await this.simulateDelay();

		try {
			const payload = await this.validateToken(refreshToken);
			const userId = payload.sub;

			// Create new session
			return await this.createSession(userId);
		} catch (error) {
			if (error instanceof AuthError && error.code === 'token_expired') {
				throw new AuthError('session_expired', 'Refresh token has expired', 401);
			}
			throw error;
		}
	}

	/**
	 * Retrieve user from access token
	 */
	async getCurrentUser(accessToken: string): Promise<User | null> {
		await this.simulateDelay();

		try {
			const payload = await this.validateToken(accessToken);
			const userId = payload.sub;
			const user = this.users.get(userId);

			return user ? this.toPublicUser(user) : null;
		} catch {
			return null;
		}
	}

	/**
	 * Convert StoredUser to public User interface
	 */
	private toPublicUser(user: StoredUser): User {
		return {
			id: user.id,
			email: user.email,
			dodid: user.dodid,
			profile: user.profile,
			first_login_at: user.first_login_at,
			created_at: user.created_at,
			updated_at: user.updated_at
		};
	}

	/**
	 * Helper method for testing: get all users
	 */
	getAllUsers(): User[] {
		return Array.from(this.users.values()).map((user) => this.toPublicUser(user));
	}

	/**
	 * Helper method for testing: create additional users for multi-user tests
	 * This simulates what would happen if multiple users authenticated via the provider
	 */
	createTestUser(email: string, dodid?: string): User {
		const userId = crypto.randomUUID();
		const now = new Date().toISOString();

		const user: StoredUser = {
			id: userId,
			email: email.toLowerCase(),
			dodid: dodid || null,
			profile: {},
			first_login_at: null,
			created_at: now,
			updated_at: now
		};

		this.users.set(userId, user);
		this.emailIndex.set(user.email, userId);

		return this.toPublicUser(user);
	}

	/**
	 * Helper method for testing: clear all data
	 */
	clearAllData(): void {
		this.users.clear();
		this.emailIndex.clear();
		// Reinitialize default user after clearing
		this.initializeDefaultUser();
	}

	async sendAuthEmail(email: string, redirectUri: string): Promise<{ message: string }> {
		// Not implemented in mock provider
		throw new AuthError(
			'unknown_error',
			'Email authentication not implemented in mock provider',
			501
		);
	}

	/**
	 * Mark user's first login as completed
	 * Used by the user service for first login actions
	 */
	async markFirstLoginCompleted(userId: UUID): Promise<void> {
		await this.simulateDelay();

		const user = this.users.get(userId);
		if (!user) {
			throw new Error(`User ${userId} not found`);
		}

		// Mark first login timestamp
		user.first_login_at = new Date().toISOString();
		user.updated_at = new Date().toISOString();

		this.users.set(userId, user);
	}
}
