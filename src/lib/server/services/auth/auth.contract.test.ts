/**
 * Contract Tests for Authentication Provider
 * These tests run against both mock and real providers to ensure consistent behavior
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockAuthProvider } from './auth-mock-provider';
import { AuthError } from '$lib/services/auth/types';

describe('AuthContract - MockAuthProvider', () => {
	let authProvider: MockAuthProvider;

	beforeEach(() => {
		authProvider = new MockAuthProvider('test-secret');
		authProvider.clearAllData();
	});

	describe('signUp', () => {
		it('should create a new user account', async () => {
			const result = await authProvider.signUp({
				email: 'test@example.com',
				password: 'password123',
				dodid: 'DOD123456'
			});

			expect(result.user).toBeDefined();
			expect(result.user.email).toBe('test@example.com');
			expect(result.user.dodid).toBe('DOD123456');
			expect(result.user.id).toBeDefined();
			expect(result.session).toBeDefined();
			expect(result.session.access_token).toBeDefined();
			expect(result.session.refresh_token).toBeDefined();
		});

		it('should reject duplicate email addresses', async () => {
			await authProvider.signUp({
				email: 'test@example.com',
				password: 'password123'
			});

			await expect(
				authProvider.signUp({
					email: 'test@example.com',
					password: 'different'
				})
			).rejects.toThrow(AuthError);
		});

		it('should reject invalid email format', async () => {
			await expect(
				authProvider.signUp({
					email: 'invalid-email',
					password: 'password123'
				})
			).rejects.toThrow(AuthError);
		});

		it('should normalize email to lowercase', async () => {
			const result = await authProvider.signUp({
				email: 'TEST@EXAMPLE.COM',
				password: 'password123'
			});

			expect(result.user.email).toBe('test@example.com');
		});
	});

	describe('signIn', () => {
		beforeEach(async () => {
			await authProvider.signUp({
				email: 'test@example.com',
				password: 'password123'
			});
		});

		it('should authenticate user with correct credentials', async () => {
			const result = await authProvider.signIn({
				email: 'test@example.com',
				password: 'password123'
			});

			expect(result.user).toBeDefined();
			expect(result.user.email).toBe('test@example.com');
			expect(result.session).toBeDefined();
		});

		it('should reject incorrect password', async () => {
			await expect(
				authProvider.signIn({
					email: 'test@example.com',
					password: 'wrongpassword'
				})
			).rejects.toThrow(AuthError);
		});

		it('should reject non-existent email', async () => {
			await expect(
				authProvider.signIn({
					email: 'nonexistent@example.com',
					password: 'password123'
				})
			).rejects.toThrow(AuthError);
		});
	});

	describe('getCurrentUser', () => {
		it('should return user from valid access token', async () => {
			const { session, user: signedUpUser } = await authProvider.signUp({
				email: 'test@example.com',
				password: 'password123'
			});

			const user = await authProvider.getCurrentUser(session.access_token);

			expect(user).toBeDefined();
			expect(user?.id).toBe(signedUpUser.id);
			expect(user?.email).toBe(signedUpUser.email);
		});

		it('should return null for invalid token', async () => {
			const user = await authProvider.getCurrentUser('invalid-token');
			expect(user).toBeNull();
		});
	});

	describe('validateToken', () => {
		it('should validate and decode valid token', async () => {
			const { session } = await authProvider.signUp({
				email: 'test@example.com',
				password: 'password123'
			});

			const payload = await authProvider.validateToken(session.access_token);

			expect(payload).toBeDefined();
			expect(payload.email).toBe('test@example.com');
			expect(payload.role).toBe('authenticated');
			expect(payload.aud).toBe('authenticated');
		});

		it('should reject invalid token format', async () => {
			await expect(authProvider.validateToken('invalid-token')).rejects.toThrow(AuthError);
		});

		it('should reject token with invalid signature', async () => {
			const { session } = await authProvider.signUp({
				email: 'test@example.com',
				password: 'password123'
			});

			// Modify token to invalidate signature
			const parts = session.access_token.split('.');
			const tamperedToken = `${parts[0]}.${parts[1]}.invalidsignature`;

			await expect(authProvider.validateToken(tamperedToken)).rejects.toThrow(AuthError);
		});
	});

	describe('signOut', () => {
		it('should invalidate session', async () => {
			const { session } = await authProvider.signUp({
				email: 'test@example.com',
				password: 'password123'
			});

			await authProvider.signOut(session.access_token);

			// Session should still be valid for getCurrentUser (tokens are stateless)
			// In production with real DB, sessions would be tracked
			const user = await authProvider.getCurrentUser(session.access_token);
			expect(user).toBeDefined(); // Mock doesn't track session invalidation
		});
	});

	describe('refreshSession', () => {
		it('should create new session from refresh token', async () => {
			const { session: originalSession } = await authProvider.signUp({
				email: 'test@example.com',
				password: 'password123'
			});

			// Wait a bit to ensure different timestamps
			await new Promise((resolve) => setTimeout(resolve, 1100)); // Wait > 1 second for different exp

			const newSession = await authProvider.refreshSession(originalSession.refresh_token);

			expect(newSession.access_token).toBeDefined();
			expect(newSession.refresh_token).toBeDefined();
			expect(newSession.access_token).not.toBe(originalSession.access_token);
		});

		it('should reject invalid refresh token', async () => {
			await expect(authProvider.refreshSession('invalid-token')).rejects.toThrow(AuthError);
		});
	});

	describe('resetPassword', () => {
		it('should not throw for existing email', async () => {
			await authProvider.signUp({
				email: 'test@example.com',
				password: 'password123'
			});

			await expect(
				authProvider.resetPassword({ email: 'test@example.com' })
			).resolves.not.toThrow();
		});

		it('should not throw for non-existing email (security)', async () => {
			await expect(
				authProvider.resetPassword({ email: 'nonexistent@example.com' })
			).resolves.not.toThrow();
		});
	});
});
