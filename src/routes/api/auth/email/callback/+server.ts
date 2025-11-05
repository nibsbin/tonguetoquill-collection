/**
 * GET /api/auth/email/callback
 * Magic link callback - verifies token and creates session
 * This is where users land after clicking the link in their email
 */

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';

export const GET: RequestHandler = async (event) => {
	try {
		// Get token from query params
		const token = event.url.searchParams.get('token');

		if (!token) {
			console.error('Magic link callback: missing token');
			// Redirect to home with error
			throw redirect(302, '/?error=invalid_link');
		}

		// Verify magic link token
		// Note: We use verifyOTP with token parameter for magic links
		// The method handles both OTP codes and magic link tokens
		const { session, user } = await authService.verifyOTP('', token);

		// Set session cookies
		event.cookies.set('sb-access-token', session.access_token, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		event.cookies.set('sb-refresh-token', session.refresh_token, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		console.log(`Magic link verified for user: ${user.email}`);

		// Redirect to app
		throw redirect(302, '/');
	} catch (error: any) {
		console.error('Magic link verification error:', error);

		// If it's already a redirect, re-throw it
		if (error.status >= 300 && error.status < 400) {
			throw error;
		}

		// Otherwise redirect to home with error
		throw redirect(302, '/?error=invalid_or_expired_link');
	}
};
