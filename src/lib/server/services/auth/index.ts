/**
 * Authentication Service Exports
 * Server-side authentication service following the server/client pattern from SERVICES.md
 */

export * from './auth-provider';
export * from './auth-mock-provider';

import { getAuthService } from './auth-provider';

/**
 * Authentication service singleton
 * Export as authService for consistent API with document service
 */
export const authService = {
	async getLoginUrl(redirectUri: string) {
		const service = await getAuthService();
		return service.getLoginUrl(redirectUri);
	},
	async getGitHubLoginUrl(redirectUri: string) {
		const service = await getAuthService();
		// Check if the method exists (only on SupabaseAuthProvider)
		if ('getGitHubLoginUrl' in service) {
			return (service as any).getGitHubLoginUrl(redirectUri);
		}
		// Fallback to default getLoginUrl for MockAuthProvider
		return service.getLoginUrl(redirectUri);
	},
	async sendEmailOTP(email: string, redirectUri: string) {
		const service = await getAuthService();
		// Check if the method exists (only on SupabaseAuthProvider)
		if ('sendEmailOTP' in service) {
			return (service as any).sendEmailOTP(email, redirectUri);
		}
		// Mock provider doesn't support email OTP
		throw new Error('Email OTP not supported in mock mode');
	},
	async exchangeCodeForTokens(code: string) {
		const service = await getAuthService();
		return service.exchangeCodeForTokens(code);
	},
	async signOut(accessToken: string) {
		const service = await getAuthService();
		return service.signOut(accessToken);
	},
	async refreshSession(refreshToken: string) {
		const service = await getAuthService();
		return service.refreshSession(refreshToken);
	},
	async getCurrentUser(accessToken: string) {
		const service = await getAuthService();
		return service.getCurrentUser(accessToken);
	},
	async validateToken(token: string) {
		const service = await getAuthService();
		return service.validateToken(token);
	}
};
