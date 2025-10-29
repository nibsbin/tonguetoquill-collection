/**
 * POST /api/auth/refresh
 * Refresh access token endpoint
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authProvider } from '$lib/services/auth';
import { handleAuthError, setAuthCookies } from '$lib/utils/api';

export const POST: RequestHandler = async (event) => {
	try {
		const refreshToken = event.cookies.get('refresh_token');

		if (!refreshToken) {
			return json({ error: 'unauthorized', message: 'No refresh token provided' }, { status: 401 });
		}

		const session = await authProvider.refreshSession(refreshToken);

		// Set new authentication cookies
		setAuthCookies(event, session.access_token, session.refresh_token);

		return json({
			user: session.user,
			session: {
				expires_at: session.expires_at
			}
		});
	} catch (error) {
		return handleAuthError(error);
	}
};
