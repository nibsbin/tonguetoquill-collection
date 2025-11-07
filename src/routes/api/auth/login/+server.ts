/**
 * GET /api/auth/login
 * Initiates OAuth flow by redirecting to provider
 * Uses provider-specific getLoginUrl() to generate the appropriate redirect
 *
 * Query Parameters:
 * - provider (optional): 'email' | 'github' - Specify which auth provider to use
 *   Required only when multiple providers are enabled
 */

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { AuthProvider } from '$lib/services/auth/types';
import { authService } from '$lib/server/services/auth';
import { getSiteURL } from '$lib/server/utils/api';

export const GET: RequestHandler = async (event) => {
	// Get optional provider parameter from query string
	const provider = event.url.searchParams.get('provider') as AuthProvider | null;

	// Get the callback URL (where the provider will redirect back to)
	// Use getSiteURL() to handle local development, Vercel preview, and production
	// Pass event to auto-detect the actual host and port
	const callbackUrl = `${getSiteURL(event)}api/auth/callback`;

	console.log('Auth login requested. Provider:', provider, 'Callback URL:', callbackUrl);

	// Get the provider-specific login URL
	// - Mock provider: Returns callback URL with mock code
	// - Supabase provider: Returns Supabase OAuth URL with PKCE
	// - If provider is specified, use that provider (validates it's enabled)
	// - If not specified and only one provider is enabled, auto-select it
	// - If not specified and multiple providers are enabled, throws error
	const loginUrl = await authService.getLoginUrl(callbackUrl, provider || undefined);

	// Redirect to the login URL
	throw redirect(302, loginUrl);
};
