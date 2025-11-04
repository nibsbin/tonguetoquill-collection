/**
 * POST /api/auth/logout
 * User logout endpoint
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';
import { clearAuthCookies, getAccessToken, handleAuthError } from '$lib/server/utils/api';

export const POST: RequestHandler = async (event) => {
	try {
		const accessToken = getAccessToken(event);

		if (accessToken) {
			await authService.signOut(accessToken);
		}

		// Clear authentication cookies
		clearAuthCookies(event);

		return json({ success: true });
	} catch (error) {
		return handleAuthError(error);
	}
};
