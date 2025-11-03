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
	get exchangeCodeForTokens() {
		return getAuthService().exchangeCodeForTokens.bind(getAuthService());
	},
	get signOut() {
		return getAuthService().signOut.bind(getAuthService());
	},
	get refreshSession() {
		return getAuthService().refreshSession.bind(getAuthService());
	},
	get getCurrentUser() {
		return getAuthService().getCurrentUser.bind(getAuthService());
	},
	get validateToken() {
		return getAuthService().validateToken.bind(getAuthService());
	}
};
