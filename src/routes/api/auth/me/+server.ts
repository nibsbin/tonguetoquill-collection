/**
 * GET /api/auth/me
 * Get current user information
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';
import { getAccessToken, handleServiceError } from '$lib/server/utils/api';

export const GET: RequestHandler = async (event) => {
	try {
		const accessToken = getAccessToken(event);

		if (!accessToken) {
			return json({ error: 'unauthorized', message: 'Not authenticated' }, { status: 401 });
		}

		const user = await authService.getCurrentUser(accessToken);

		if (!user) {
			return json({ error: 'unauthorized', message: 'Invalid session' }, { status: 401 });
		}

		return json({ user });
	} catch (error) {
		return handleServiceError(error);
	}
};
