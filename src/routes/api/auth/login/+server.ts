/**
 * GET /api/auth/login
 * Initiates OAuth flow by redirecting to provider
 * Uses provider-specific getLoginUrl() to generate the appropriate redirect
 */

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';
import { getSiteURL } from '$lib/server/utils/api';

export const GET: RequestHandler = async (event) => {
	// Get the callback URL (where the provider will redirect back to)
	// Use getSiteURL() to handle local development, Vercel preview, and production
	// Pass event to auto-detect the actual host and port
	const callbackUrl = `${getSiteURL(event)}api/auth/callback`;

	// Get the provider-specific login URL
	// - Mock provider: Returns callback URL with mock code
	// - Supabase provider: Returns Supabase OAuth URL with PKCE
	const loginUrl = await authService.getLoginUrl(callbackUrl);

	// Redirect to the login URL
	throw redirect(302, loginUrl);
};
