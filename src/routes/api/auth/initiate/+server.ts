/**
 * POST /api/auth/initiate
 * Initiates authentication with a specific provider
 * Request body: { providerId: string, data?: Record<string, string> }
 * Response:
 *   - For OAuth: { url: string } - redirect URL
 *   - For email OTP: { message: string } - success message
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';
import { getSiteURL } from '$lib/server/utils/api';

export const POST: RequestHandler = async (event) => {
	try {
		const { providerId, data } = await event.request.json();

		if (!providerId || typeof providerId !== 'string') {
			return json(
				{ error: 'invalid_request', message: 'Provider ID is required' },
				{ status: 400 }
			);
		}

		// Get the callback URL
		const callbackUrl = `${getSiteURL(event)}api/auth/callback`;

		// Initiate authentication
		const result = await authService.initiateAuth(providerId, callbackUrl, data);

		return json(result);
	} catch (error: any) {
		console.error('Failed to initiate auth:', error);

		// Handle AuthError instances
		if (error.code && error.statusCode) {
			return json({ error: error.code, message: error.message }, { status: error.statusCode });
		}

		return json(
			{ error: 'network_error', message: error.message || 'Failed to initiate authentication' },
			{ status: 500 }
		);
	}
};
