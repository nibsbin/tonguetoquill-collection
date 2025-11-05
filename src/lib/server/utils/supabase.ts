/**
 * Supabase Configuration Utilities
 * Provider-specific utilities for Supabase integration
 */

import { env } from '$env/dynamic/private';

/**
 * Supabase configuration contract
 */
export interface SupabaseConfig {
	POSTGRES_URL: string;
	PUBLISHABLE_KEY: string;
	ENABLE_EMAIL: boolean;
	ENABLE_GITHUB: boolean;
	SECRET_KEY: string;
}

/**
 * Load Supabase configuration from environment variables
 * Supports multiple environment variable naming conventions
 */
export function loadSupabaseConfig(): SupabaseConfig {
	const POSTGRES_URL = env.SUPABASE_URL || env.PUBLIC_SUPABASE_URL;
	const PUBLISHABLE_KEY =
		env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY;
	const ENABLE_EMAIL = env.SUPABASE_ENABLE_EMAIL === 'true';
	const ENABLE_GITHUB = env.SUPABASE_ENABLE_GITHUB === 'true';
	const SECRET_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

	if (!POSTGRES_URL) {
		throw new Error('Missing required environment variable: SUPABASE_URL or PUBLIC_SUPABASE_URL');
	}

	if (!PUBLISHABLE_KEY) {
		throw new Error(
			'Missing required environment variable: PUBLIC_SUPABASE_PUBLISHABLE_KEY or SUPABASE_ANON_KEY'
		);
	}

	if (!SECRET_KEY) {
		throw new Error(
			'Missing required environment variable: SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY'
		);
	}

	return {
		POSTGRES_URL,
		PUBLISHABLE_KEY,
		ENABLE_EMAIL,
		ENABLE_GITHUB,
		SECRET_KEY
	};
}
