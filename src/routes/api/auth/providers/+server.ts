/**
 * GET /api/auth/providers
 * Get available authentication providers
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';
import { handleServiceError } from '$lib/server/utils/api';

export const GET: RequestHandler = async (event) => {
	try {
		const providers = await authService.getAvailableProviders();

		if (!providers || providers.length === 0) {
			return json(
				{ error: 'no_providers', message: 'No authentication providers available' },
				{ status: 503 }
			);
		}

		return json({ providers });
	} catch (error) {
		return handleServiceError(error);
	}
};
