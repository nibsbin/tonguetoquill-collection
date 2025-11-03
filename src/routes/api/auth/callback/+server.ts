/**
 * GET /api/auth/callback
 * OAuth callback endpoint that exchanges authorization code for tokens
 */

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';
import { setAuthCookies } from '$lib/utils/api';

export const GET: RequestHandler = async (event) => {
	try {
		const code = event.url.searchParams.get('code');

		if (!code) {
			// No code provided, redirect to login
			throw redirect(302, '/');
		}

		// Exchange code for tokens
		const result = await authService.exchangeCodeForTokens(code);

		// Set authentication cookies
		setAuthCookies(event, result.session.access_token, result.session.refresh_token);

		// Redirect to home page after successful authentication
		throw redirect(302, '/');
	} catch (error) {
		// If it's already a redirect, re-throw it without logging
		if (error instanceof Response && error.status >= 300 && error.status < 400) {
			throw error;
		}

		// Otherwise, log the actual error and redirect to home with error flag
		console.error('Authentication callback error:', error);
		throw redirect(302, '/?auth_error=true');
	}
};
