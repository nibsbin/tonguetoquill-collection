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
	| 'invalid_credentials'
	| 'user_not_found'
	| 'email_already_exists'
	| 'invalid_token'
	| 'token_expired'
	| 'invalid_email'
	| 'weak_password'
	| 'unauthorized'
	| 'session_expired'
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
 * Sign up parameters
 */
export interface SignUpParams {
	email: string;
	password: string;
	dodid?: string;
	profile?: Record<string, unknown>;
}

/**
 * Sign in parameters
 */
export interface SignInParams {
	email: string;
	password: string;
}

/**
 * Password reset parameters
 */
export interface ResetPasswordParams {
	email: string;
}

/**
 * Email verification parameters
 */
export interface VerifyEmailParams {
	token: string;
}

/**
 * Authentication contract interface
 * All authentication providers (mock and real) must implement this interface
 */
export interface AuthContract {
	/**
	 * Create a new user account
	 */
	signUp(params: SignUpParams): Promise<AuthResult>;

	/**
	 * Authenticate user and create session
	 */
	signIn(params: SignInParams): Promise<AuthResult>;

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
	 * Initiate password reset flow
	 */
	resetPassword(params: ResetPasswordParams): Promise<void>;

	/**
	 * Confirm email verification
	 */
	verifyEmail(params: VerifyEmailParams): Promise<void>;

	/**
	 * Validate JWT token and return payload
	 */
	validateToken(token: string): Promise<TokenPayload>;
}
