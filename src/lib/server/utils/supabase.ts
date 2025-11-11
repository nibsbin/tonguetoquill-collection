/**
 * Supabase Configuration Utilities
 * Provider-specific utilities for Supabase integration
 */

import { env } from '$env/dynamic/private';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase configuration contract
 */
export interface SupabaseConfig {
	POSTGRES_URL: string;
	PUBLISHABLE_KEY: string;
	SECRET_KEY: string;
}

/**
 * Load Supabase configuration from environment variables
 * Supports multiple environment variable naming conventions
 */
export function loadSupabaseConfig(): SupabaseConfig {
	const POSTGRES_URL = env.SUPABASE_URL || env.PUBLIC_SUPABASE_URL;
	const PUBLISHABLE_KEY =
		env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY;
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
		SECRET_KEY
	};
}

/**
 * Singleton admin client for database operations
 * Uses service role key to bypass RLS (Row Level Security)
 * Shared across all server-side services for database operations
 */
let adminClient: SupabaseClient | null = null;

/**
 * Get or create the shared admin Supabase client
 * This client should be used for all server-side database operations
 * that require service role privileges (bypassing RLS)
 */
export function getAdminClient(): SupabaseClient {
	if (!adminClient) {
		const config = loadSupabaseConfig();
		adminClient = createClient(config.POSTGRES_URL, config.SECRET_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
				detectSessionInUrl: false
			}
		});
	}
	return adminClient;
}
