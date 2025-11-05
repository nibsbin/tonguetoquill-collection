/**
 * Authentication Service Exports
 * Server-side authentication service following the server/client pattern from SERVICES.md
 */

export * from './auth-provider';
export * from './auth-mock-provider';

import type { AuthProvider } from '$lib/services/auth/types';
import { getAuthService } from './auth-provider';

/**
 * Authentication service singleton
 * Export as authService for consistent API with document service
 */
export const authService = {
	async getLoginUrl(redirectUri: string, provider?: AuthProvider) {
		const service = await getAuthService();
		return service.getLoginUrl(redirectUri, provider);
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
