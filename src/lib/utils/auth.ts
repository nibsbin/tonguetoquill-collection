/**
 * Authentication Middleware Utilities
 * Helper functions for protecting API routes
 */

import type { RequestEvent } from '@sveltejs/kit';
import { authService } from '$lib/server/services/auth';
import { getAccessToken, errorResponse } from './api';
import type { User } from '$lib/services/auth';

/**
 * Require authentication for a request
 * Returns user if authenticated, otherwise throws error response
 */
export async function requireAuth(event: RequestEvent): Promise<User> {
	const accessToken = getAccessToken(event);

	if (!accessToken) {
		throw errorResponse('unauthorized', 'Authentication required', 401);
	}

	const user = await authService.getCurrentUser(accessToken);

	if (!user) {
		throw errorResponse('unauthorized', 'Invalid or expired session', 401);
	}

	return user;
}

/**
 * Optional authentication - returns user if authenticated, null otherwise
 */
export async function optionalAuth(event: RequestEvent): Promise<User | null> {
	const accessToken = getAccessToken(event);

	if (!accessToken) {
		return null;
	}

	return await authService.getCurrentUser(accessToken);
}
