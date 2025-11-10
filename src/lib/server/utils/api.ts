/**
 * API Response Utilities
 * Helper functions for consistent API responses
 */

import { json, type RequestEvent } from '@sveltejs/kit';
import { AppError } from '$lib/errors';
import { env } from '$env/dynamic/private';
import { config } from '$lib/config';
/**
 * Standard error response format
 */
export interface ErrorResponse {
	error: string;
	message: string;
}

/**
 * Create JSON error response
 */
export function errorResponse(code: string, message: string, status: number = 400) {
	return json({ error: code, message } as ErrorResponse, { status });
}

/**
 * Handle service errors (generic handler for all AppError subclasses)
 */
export function handleServiceError(error: unknown) {
	console.error('Service error:', error);

	if (error instanceof AppError) {
		return errorResponse(error.code, error.message, error.statusCode);
	}

	return errorResponse('unknown_error', 'An unexpected error occurred', 500);
}

/**
 * Extract access token from cookies or Authorization header
 */
export function getAccessToken(event: RequestEvent): string | null {
	// Try cookie first
	const cookieToken = event.cookies.get('access_token');
	if (cookieToken) {
		return cookieToken;
	}

	// Try Authorization header
	const authHeader = event.request.headers.get('Authorization');
	if (authHeader?.startsWith('Bearer ')) {
		return authHeader.substring(7);
	}

	return null;
}

/**
 * Set authentication cookies
 */
export function setAuthCookies(event: RequestEvent, accessToken: string, refreshToken: string) {
	// Set HTTP-only cookies for security
	event.cookies.set('access_token', accessToken, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		maxAge: 60 * 60 // 1 hour
	});

	event.cookies.set('refresh_token', refreshToken, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		maxAge: 7 * 24 * 60 * 60 // 7 days
	});

	// Set a non-HTTP-only indicator cookie so client can check auth status
	// This prevents unnecessary 401 errors in guest mode
	event.cookies.set('is_authenticated', 'true', {
		path: '/',
		httpOnly: false,
		secure: true,
		sameSite: 'strict',
		maxAge: 60 * 60 // 1 hour (matches access_token)
	});
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(event: RequestEvent) {
	event.cookies.delete('access_token', { path: '/' });
	event.cookies.delete('refresh_token', { path: '/' });
	event.cookies.delete('is_authenticated', { path: '/' });
}

/**
 * Get the site URL for the current environment
 * Handles local development, Vercel preview, and production deployments
 */
export function getSiteURL(event?: RequestEvent): string {
	const url_production = config.urls.production;
	const url_staging = config.urls.staging;

	// production | preview | development
	const deployment = env.VERCEL_ENV;

	let url;
	if (deployment === 'production' && url_production) {
		url = url_production;
	} else if (deployment === 'preview' && url_staging) {
		url = url_staging;
	} else {
		// Fallback to request origin or Vercel URL or localhost
		url = (event ? event.url.origin : null) ?? env.VERCEL_URL ?? 'http://localhost:5173';
	}

	console.log('Determined site URL:', url);

	// Make sure to include `https://` when not localhost
	url = url.startsWith('http') ? url : `https://${url}`;

	// Make sure to include a trailing `/`
	url = url.endsWith('/') ? url : `${url}/`;

	return url;
}
