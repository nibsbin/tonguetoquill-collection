/**
 * API Response Utilities
 * Helper functions for consistent API responses
 */

import { json, type RequestEvent } from '@sveltejs/kit';
import { AuthError } from '$lib/services/auth';
import { DocumentError } from '$lib/services/documents';
import { env } from '$env/dynamic/private';
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
 * Handle authentication errors
 */
export function handleAuthError(error: unknown) {
	console.error('Auth error:', error);

	if (error instanceof AuthError) {
		return errorResponse(error.code, error.message, error.statusCode);
	}

	return errorResponse('unknown_error', 'An unexpected error occurred', 500);
}

/**
 * Handle document errors
 */
export function handleDocumentError(error: unknown) {
	console.error('Document error:', error);

	if (error instanceof DocumentError) {
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
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(event: RequestEvent) {
	event.cookies.delete('access_token', { path: '/' });
	event.cookies.delete('refresh_token', { path: '/' });
}

/**
 * Get the site URL for the current environment
 * Handles local development, Vercel preview, and production deployments
 */
export function getSiteURL(event?: RequestEvent): string {
	// In order of priority:
	// 1. Explicit site URL from environment
	// 2. Vercel URL (automatically set by Vercel for preview/production)
	// 3. Request origin (detects actual host and port from the incoming request)
	// 4. Local development fallback
	let url = env.VERCEL_URL ?? (event ? event.url.origin : null) ?? 'http://localhost:5173';

	console.log('Determined site URL:', url);

	// Make sure to include `https://` when not localhost
	url = url.startsWith('http') ? url : `https://${url}`;

	// Make sure to include a trailing `/`
	url = url.endsWith('/') ? url : `${url}/`;

	return url;
}
