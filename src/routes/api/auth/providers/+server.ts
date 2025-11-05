/**
 * GET /api/auth/providers
 * Returns list of available authentication providers
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';

export const GET: RequestHandler = async () => {
	try {
		const providers = await authService.getAvailableProviders();
		return json({ providers });
	} catch (error: any) {
		console.error('Failed to get auth providers:', error);
		return json(
			{ error: 'network_error', message: 'Failed to get authentication providers' },
			{ status: 500 }
		);
	}
};
