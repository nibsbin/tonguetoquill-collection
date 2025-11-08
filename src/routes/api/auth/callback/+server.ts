/**
 * GET /api/auth/callback
 * OAuth callback endpoint that exchanges authorization code for tokens
 */

import { isRedirect, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';
import { setAuthCookies } from '$lib/server/utils/api';
import { runFirstLoginActions } from '$lib/server/services/user';

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

		// Run first login actions (non-blocking)
		// Errors are logged but don't block login flow
		runFirstLoginActions(result.user.id, result.session.access_token).catch((error) => {
			console.error('Failed to run first login actions:', error);
		});

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
