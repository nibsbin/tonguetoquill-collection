/**
 * POST /api/auth/email/send
 * Send authentication email with OTP code
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';
import { getSiteURL } from '$lib/server/utils/api';

export const POST: RequestHandler = async (event) => {
	try {
		const { email } = await event.request.json();

		// Validate email
		if (!email || typeof email !== 'string') {
			return json({ error: 'Email is required' }, { status: 400 });
		}

		// Basic email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json({ error: 'Invalid email format' }, { status: 400 });
		}

		// Get callback URL
		const callbackUrl = `${getSiteURL(event)}api/auth/callback`;

		// Send OTP email
		const result = await authService.sendAuthEmail(email, callbackUrl);

		return json({ message: result.message });
	} catch (error: any) {
		console.error('Email send error:', error);
		return json(
			{
				error: 'Failed to send authentication email',
				message: error.message || 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
