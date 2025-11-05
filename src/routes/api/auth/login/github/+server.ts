/**
 * GET /api/auth/login/github
 * Initiates GitHub OAuth flow by redirecting to GitHub
 */

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/services/auth';
import { getSiteURL } from '$lib/server/utils/api';

export const GET: RequestHandler = async (event) => {
	// Get the callback URL (where GitHub will redirect back to)
	const callbackUrl = `${getSiteURL(event)}api/auth/callback`;

	// Get the GitHub-specific login URL
	const loginUrl = await authService.getGitHubLoginUrl(callbackUrl);

	// Redirect to the GitHub OAuth URL
	throw redirect(302, loginUrl);
};
