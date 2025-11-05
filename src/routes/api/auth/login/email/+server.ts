/**
 * POST /api/auth/login/email
 * Sends a magic link to the user's email for passwordless login
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';
import { getSiteURL } from '$lib/server/utils/api';

export const POST: RequestHandler = async (event) => {
	const { email } = await event.request.json();

	if (!email || typeof email !== 'string') {
		return json({ error: 'invalid_request', message: 'Email is required' }, { status: 400 });
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return json({ error: 'invalid_email', message: 'Invalid email format' }, { status: 400 });
	}

	try {
		// Get the callback URL (where the magic link will redirect back to)
		const callbackUrl = `${getSiteURL(event)}api/auth/callback`;

		// Send email OTP
		await authService.sendEmailOTP(email, callbackUrl);

		return json({ success: true, message: 'Magic link sent to your email' });
	} catch (error: any) {
		console.error('Email OTP error:', error);
		return json(
			{ error: 'network_error', message: error.message || 'Failed to send magic link' },
			{ status: 500 }
		);
	}
};
