/**
 * Contract Tests for Authentication Provider
 * These tests run against both mock and real providers to ensure consistent behavior
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockAuthProvider } from './auth-mock-provider';
import { AuthError } from '$lib/services/auth/types';

describe('AuthContract - MockAuthProvider', () => {
	let authProvider: MockAuthProvider;

	beforeEach(async () => {
		authProvider = await MockAuthProvider.create();
		authProvider.clearAllData();
	});

	describe('exchangeCodeForTokens', () => {
		it('should exchange valid code for tokens', async () => {
			const result = await authProvider.exchangeCodeForTokens('valid_auth_code');

			expect(result.user).toBeDefined();
			expect(result.user.email).toBe('asdf@asdf.com'); // Default user
			expect(result.user.id).toBeDefined();
			expect(result.session).toBeDefined();
			expect(result.session.access_token).toBeDefined();
			expect(result.session.refresh_token).toBeDefined();
		});

		it('should reject empty authorization code', async () => {
			await expect(authProvider.exchangeCodeForTokens('')).rejects.toThrow(AuthError);
		});

		it('should reject whitespace-only code', async () => {
			await expect(authProvider.exchangeCodeForTokens('   ')).rejects.toThrow(AuthError);
		});

		it('should accept any non-empty code in mock mode', async () => {
			// Mock accepts any non-empty code for development
			const result = await authProvider.exchangeCodeForTokens('any_valid_string');
			expect(result.user).toBeDefined();
		});
	});

	describe('getCurrentUser', () => {
		it('should return user from valid access token', async () => {
			const { session, user: authUser } = await authProvider.exchangeCodeForTokens('test_code');

			const user = await authProvider.getCurrentUser(session.access_token);

			expect(user).toBeDefined();
			expect(user?.id).toBe(authUser.id);
			expect(user?.email).toBe(authUser.email);
		});

		it('should return null for invalid token', async () => {
			const user = await authProvider.getCurrentUser('invalid-token');
			expect(user).toBeNull();
		});
	});

	describe('signOut', () => {
		it('should complete without error', async () => {
			const { session } = await authProvider.exchangeCodeForTokens('test_code');

			await expect(authProvider.signOut(session.access_token)).resolves.not.toThrow();
		});

		it('should accept any token string', async () => {
			// Mock signOut is a no-op, so it accepts any string
			await expect(authProvider.signOut('any_token')).resolves.not.toThrow();
		});
	});

	describe('refreshSession', () => {
		it('should create new session from refresh token', async () => {
			const { session: originalSession } = await authProvider.exchangeCodeForTokens('test_code');

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
});
