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
	get signUp() {
		return getAuthService().signUp.bind(getAuthService());
	},
	get signIn() {
		return getAuthService().signIn.bind(getAuthService());
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
	get resetPassword() {
		return getAuthService().resetPassword.bind(getAuthService());
	},
	get verifyEmail() {
		return getAuthService().verifyEmail.bind(getAuthService());
	},
	get validateToken() {
		return getAuthService().validateToken.bind(getAuthService());
	}
};
