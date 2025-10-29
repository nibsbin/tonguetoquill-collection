/**
 * Mock Authentication Provider
 * Implements AuthContract using in-memory storage for development
 */

import { webcrypto as crypto } from 'node:crypto';
import type {
	AuthContract,
	AuthResult,
	Session,
	SignInParams,
	SignUpParams,
	TokenPayload,
	User,
	UUID,
	ResetPasswordParams,
	VerifyEmailParams
} from './types';
import { AuthError } from './types';

interface StoredUser {
	id: UUID;
	email: string;
	password: string; // In mock, we store plaintext (never do this in production!)
	dodid?: string | null;
	profile: Record<string, unknown>;
	created_at: string;
	updated_at: string;
	email_verified: boolean;
}

interface StoredSession {
	access_token: string;
	refresh_token: string;
	expires_at: number;
	user_id: UUID;
}

/**
 * Mock Authentication Provider
 * Uses in-memory Map storage and simple JWT-like tokens
 */
export class MockAuthProvider implements AuthContract {
	private users: Map<UUID, StoredUser> = new Map();
	private sessions: Map<string, StoredSession> = new Map(); // keyed by access_token
	private emailIndex: Map<string, UUID> = new Map(); // email -> user_id mapping
	private secret: string;

	// Session expiry times (in milliseconds)
	private ACCESS_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
	private REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

	constructor(secret?: string) {
		this.secret = secret || process.env.MOCK_JWT_SECRET || 'dev-secret-key';
	}

	/**
	 * Simulate network delay for realistic testing
	 */
	private async simulateDelay(): Promise<void> {
		const delay = Math.random() * 200 + 100; // 100-300ms
		await new Promise((resolve) => setTimeout(resolve, delay));
	}

	/**
	 * Validate email format
	 */
	private validateEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Generate a mock JWT token
	 */
	private generateToken(payload: TokenPayload): string {
		const header = { alg: 'HS256', typ: 'JWT' };
		const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
		const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

		// Simple HMAC-like signature (not cryptographically secure, just for mocking)
		const signature = Buffer.from(`${encodedHeader}.${encodedPayload}.${this.secret}`).toString(
			'base64url'
		);

		return `${encodedHeader}.${encodedPayload}.${signature}`;
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

			const [encodedHeader, encodedPayload, signature] = parts;

			// Verify signature
			const expectedSignature = Buffer.from(
				`${encodedHeader}.${encodedPayload}.${this.secret}`
			).toString('base64url');
			if (signature !== expectedSignature) {
				throw new AuthError('invalid_token', 'Invalid token signature', 401);
			}

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
	 * Create a new user account
	 */
	async signUp(params: SignUpParams): Promise<AuthResult> {
		await this.simulateDelay();

		// Validate email
		if (!this.validateEmail(params.email)) {
			throw new AuthError('invalid_email', 'Invalid email format', 400);
		}

		// Check if email already exists
		if (this.emailIndex.has(params.email.toLowerCase())) {
			throw new AuthError('email_already_exists', 'Email already registered', 400);
		}

		// Create user
		const userId = crypto.randomUUID();
		const now = new Date().toISOString();

		const user: StoredUser = {
			id: userId,
			email: params.email.toLowerCase(),
			password: params.password, // Mock: storing plaintext (never in production!)
			dodid: params.dodid || null,
			profile: params.profile || {},
			created_at: now,
			updated_at: now,
			email_verified: false // Mock: assume unverified initially
		};

		this.users.set(userId, user);
		this.emailIndex.set(user.email, userId);

		// Create session
		const session = await this.createSession(userId);

		return {
			user: this.toPublicUser(user),
			session
		};
	}

	/**
	 * Authenticate user and create session
	 */
	async signIn(params: SignInParams): Promise<AuthResult> {
		await this.simulateDelay();

		const email = params.email.toLowerCase();
		const userId = this.emailIndex.get(email);

		if (!userId) {
			throw new AuthError('invalid_credentials', 'Invalid email or password', 401);
		}

		const user = this.users.get(userId);
		if (!user) {
			throw new AuthError('user_not_found', 'User not found', 404);
		}

		// Check password (plaintext comparison in mock)
		if (user.password !== params.password) {
			throw new AuthError('invalid_credentials', 'Invalid email or password', 401);
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
			throw new AuthError('user_not_found', 'User not found', 404);
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

		// Store session
		const storedSession: StoredSession = {
			access_token: accessToken,
			refresh_token: refreshToken,
			expires_at: accessTokenExpiry,
			user_id: userId
		};
		this.sessions.set(accessToken, storedSession);

		return {
			access_token: accessToken,
			refresh_token: refreshToken,
			expires_at: accessTokenExpiry,
			user: this.toPublicUser(user)
		};
	}

	/**
	 * Invalidate session
	 */
	async signOut(accessToken: string): Promise<void> {
		await this.simulateDelay();
		this.sessions.delete(accessToken);
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
	 * Initiate password reset flow (mock: just log it)
	 */
	async resetPassword(params: ResetPasswordParams): Promise<void> {
		await this.simulateDelay();

		const email = params.email.toLowerCase();
		const userId = this.emailIndex.get(email);

		if (!userId) {
			// In production, don't reveal if email exists
			// In mock, we'll silently succeed
			return;
		}

		// Mock: simulate sending email (just log)
		console.log(`[MockAuthProvider] Password reset email sent to ${email}`);
	}

	/**
	 * Confirm email verification (mock: just mark as verified)
	 */
	async verifyEmail(params: VerifyEmailParams): Promise<void> {
		await this.simulateDelay();

		// Mock: assume token is user_id for simplicity
		const userId = params.token as UUID;
		const user = this.users.get(userId);

		if (!user) {
			throw new AuthError('invalid_token', 'Invalid verification token', 400);
		}

		user.email_verified = true;
		user.updated_at = new Date().toISOString();
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
	 * Helper method for testing: clear all data
	 */
	clearAllData(): void {
		this.users.clear();
		this.sessions.clear();
		this.emailIndex.clear();
	}
}
