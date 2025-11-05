/**
 * POST /api/auth/email/verify
 * Verify OTP code and create session
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';

export const POST: RequestHandler = async (event) => {
	try {
		const { email, code } = await event.request.json();

		// Validate inputs
		if (!email || typeof email !== 'string') {
			return json({ error: 'Email is required' }, { status: 400 });
		}

		if (!code || typeof code !== 'string') {
			return json({ error: 'Verification code is required' }, { status: 400 });
		}

		// Verify OTP and get session
		const { session, user } = await authService.verifyOTP(email, code);

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

		return json({ success: true, user });
	} catch (error: any) {
		console.error('OTP verification error:', error);

		// Return appropriate error messages
		if (error.code === 'invalid_token') {
			return json(
				{
					error: 'Invalid verification code',
					message: error.message
				},
				{ status: 401 }
			);
		}

		if (error.code === 'token_expired') {
			return json(
				{
					error: 'Verification code expired',
					message: error.message
				},
				{ status: 401 }
			);
		}

		return json(
			{
				error: 'Failed to verify code',
				message: error.message || 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
