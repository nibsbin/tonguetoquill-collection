/**
 * POST /api/auth/login
 * User login endpoint
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAuthProvider } from '$lib/services/auth';
import { handleAuthError, setAuthCookies } from '$lib/utils/api';

export const POST: RequestHandler = async (event) => {
	try {
		const body = await event.request.json();
		const { email, password } = body;

		if (!email || !password) {
			return json(
				{ error: 'validation_error', message: 'Email and password are required' },
				{ status: 400 }
			);
		}

		const result = await getAuthProvider().signIn({ email, password });

		// Set authentication cookies
		setAuthCookies(event, result.session.access_token, result.session.refresh_token);

		return json({
			user: result.user,
			session: {
				expires_at: result.session.expires_at
			}
		});
	} catch (error) {
		return handleAuthError(error);
	}
};
