/**
 * GET /api/auth/callback
 * OAuth callback endpoint that exchanges authorization code for tokens
 */

import { isRedirect, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';
import { setAuthCookies } from '$lib/server/utils/api';

export const GET: RequestHandler = async (event) => {
	try {
		const code = event.url.searchParams.get('code');

		if (!code) {
			// No code provided, redirect to login
			console.warn('No authorization code provided in callback');
			redirect(302, '/');
		}

		// Exchange code for tokens
		const result = await authService.exchangeCodeForTokens(code);

		// Set authentication cookies
		setAuthCookies(event, result.session.access_token, result.session.refresh_token);

		// Redirect to home page after successful authentication
		console.log('Authentication successful, redirecting to home page');
		redirect(302, '/');
	} catch (error) {
		// Ignore expected redirect error
		if (isRedirect(error)) {
			throw error;
		}
		// Otherwise, log the actual error with details and redirect to home with error flag
		console.error('Authentication callback error:', error);
		if (error instanceof Error) {
			console.error('Error details:', {
				name: error.name,
				message: error.message,
				stack: error.stack
			});
		}
		throw redirect(302, '/?auth_error=true');
	}
};
