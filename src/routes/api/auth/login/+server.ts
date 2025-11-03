/**
 * GET /api/auth/login
 * Initiates OAuth flow by redirecting to provider
 * In mock mode, simulates OAuth by redirecting to callback with a mock code
 */

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	// In mock mode, simulate OAuth flow by generating a mock authorization code
	// and redirecting to our callback endpoint
	// In production with Supabase, this would redirect to Supabase's hosted login page

	const mockAuthCode = 'mock_auth_code_' + Date.now();

	// Redirect to callback with the mock code
	throw redirect(302, `/api/auth/callback?code=${mockAuthCode}`);
};
