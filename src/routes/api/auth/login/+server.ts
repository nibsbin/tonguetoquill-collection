/**
 * GET /api/auth/login
 * Initiates OAuth flow by redirecting to provider
 * Uses provider-specific getLoginUrl() to generate the appropriate redirect
 */

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';

export const GET: RequestHandler = async (event) => {
	// Get the callback URL (where the provider will redirect back to)
	const callbackUrl = `${event.url.origin}/api/auth/callback`;

	// Get the provider-specific login URL
	// - Mock provider: Returns callback URL with mock code
	// - Supabase provider: Returns Supabase OAuth URL with PKCE
	const loginUrl = await authService.getLoginUrl(callbackUrl);

	// Redirect to the login URL
	throw redirect(302, loginUrl);
};
