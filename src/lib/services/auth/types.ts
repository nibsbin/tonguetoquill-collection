/**
 * Authentication Types and Contracts
 * Defines interfaces for authentication providers (mock and real)
 */

// UUID type alias for type safety
export type UUID = string;

/**
 * User interface representing an authenticated user
 */
export interface User {
	id: UUID;
	email: string;
	dodid?: string | null;
	profile: Record<string, unknown>;
	created_at: string; // ISO 8601 timestamp
	updated_at: string; // ISO 8601 timestamp
}

/**
 * Session interface representing an authentication session
 */
export interface Session {
	access_token: string;
	refresh_token: string;
	expires_at: number; // Unix timestamp
	user: User;
}

/**
 * Authentication result containing user and session
 */
export interface AuthResult {
	user: User;
	session: Session;
}

/**
 * Token payload structure for JWT tokens
 */
export interface TokenPayload {
	sub: UUID; // user ID (subject)
	email: string; // user email
	exp: number; // expiry timestamp (Unix epoch)
	iat: number; // issued at timestamp (Unix epoch)
	role: 'authenticated'; // user role
	aud: 'authenticated'; // audience claim
}

/**
 * Authentication error codes
 */
export type AuthErrorCode =
	| 'invalid_token'
	| 'token_expired'
	| 'unauthorized'
	| 'session_expired'
	| 'invalid_refresh_token'
	| 'network_error'
	| 'unknown_error';

/**
 * Authentication error class
 */
export class AuthError extends Error {
	code: AuthErrorCode;
	statusCode: number;

	constructor(code: AuthErrorCode, message: string, statusCode: number = 400) {
		super(message);
		this.name = 'AuthError';
		this.code = code;
		this.statusCode = statusCode;
	}
}

/**
 * Authentication contract interface
 * All authentication providers (mock and real) must implement this interface
 * Focused on token validation and management only - no password handling
 */
export interface AuthContract {
	/**
	 * Get the OAuth login URL for this provider
	 * Returns the URL to redirect users to for authentication
	 * @param redirectUri - The callback URL to return to after authentication
	 */
	getLoginUrl(redirectUri: string): Promise<string>;

	/**
	 * Exchange OAuth authorization code for tokens
	 * This is called after the user authenticates with the provider
	 */
	exchangeCodeForTokens(code: string): Promise<AuthResult>;

	/**
	 * Invalidate session
	 */
	signOut(accessToken: string): Promise<void>;

	/**
	 * Refresh expired access token
	 */
	refreshSession(refreshToken: string): Promise<Session>;

	/**
	 * Retrieve user from access token
	 */
	getCurrentUser(accessToken: string): Promise<User | null>;

	/**
	 * Validate JWT token and return payload
	 */
	validateToken(token: string): Promise<TokenPayload>;
}
