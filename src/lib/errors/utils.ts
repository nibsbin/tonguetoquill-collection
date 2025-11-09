/**
 * Error Handling Utilities
 *
 * Provides utility functions for consistent error handling across the application.
 */

import { AppError } from './app-error';

/**
 * Extract error message from any error type
 *
 * Provides a consistent way to get error messages from various error types,
 * with a fallback for unknown error types.
 *
 * @param error - The error to extract a message from
 * @param fallback - Fallback message if error has no extractable message
 * @returns The extracted error message
 *
 * @example
 * ```typescript
 * try {
 *   await doSomething();
 * } catch (err) {
 *   const message = getErrorMessage(err, 'Failed to do something');
 *   console.error(message);
 * }
 * ```
 */
export function getErrorMessage(
	error: unknown,
	fallback: string = 'An unexpected error occurred'
): string {
	// AppError (includes all service errors)
	if (error instanceof AppError) {
		return error.message;
	}

	// Standard Error
	if (error instanceof Error) {
		return error.message;
	}

	// String error
	if (typeof error === 'string') {
		return error;
	}

	// Fallback for unknown types
	return fallback;
}

/**
 * Retry options for the withRetry utility
 */
export interface RetryOptions {
	/**
	 * Maximum number of attempts (including initial attempt)
	 * @default 3
	 */
	maxAttempts?: number;

	/**
	 * Initial delay between retries in milliseconds
	 * @default 1000
	 */
	delay?: number;

	/**
	 * Backoff multiplier for exponential backoff
	 * Set to 1 for constant delay
	 * @default 2
	 */
	backoff?: number;

	/**
	 * Function to determine if error should trigger a retry
	 * @default () => true
	 */
	shouldRetry?: (error: unknown, attempt: number) => boolean;
}

/**
 * Retry a function with configurable retry strategy
 *
 * Wraps an async function with retry logic. Useful for operations
 * that may fail transiently (network requests, etc.).
 *
 * @param fn - Async function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with function result or rejects with final error
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetchData(),
 *   {
 *     maxAttempts: 3,
 *     delay: 1000,
 *     backoff: 2,
 *     shouldRetry: (error) => error instanceof NetworkError
 *   }
 * );
 * ```
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
	const { maxAttempts = 3, delay = 1000, backoff = 2, shouldRetry = () => true } = options;

	let lastError: unknown;
	let currentDelay = delay;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			// Don't retry on last attempt or if shouldRetry returns false
			if (attempt === maxAttempts || !shouldRetry(error, attempt)) {
				throw error;
			}

			// Wait before retrying
			await new Promise((resolve) => setTimeout(resolve, currentDelay));

			// Apply backoff
			currentDelay *= backoff;
		}
	}

	// This should never be reached, but TypeScript needs it
	throw lastError;
}

/**
 * Display options for error toasts
 */
export interface DisplayOptions {
	/**
	 * Duration to show the toast in milliseconds
	 * @default 5000
	 */
	duration?: number;

	/**
	 * Optional action button configuration
	 */
	action?: {
		label: string;
		onClick: () => void;
	};

	/**
	 * Display inline instead of as toast
	 * @default false
	 */
	inline?: boolean;
}

/**
 * Toast store interface (minimal contract)
 */
export interface ToastStore {
	error: (message: string, duration?: number) => void;
}

/**
 * Display error with toast notification
 *
 * Provides consistent error display across the application.
 * Uses the application's toast system for user feedback.
 *
 * @param error - The error to display
 * @param toastStore - Toast store instance for showing notifications
 * @param options - Display configuration options
 *
 * @example
 * ```typescript
 * try {
 *   await saveDocument();
 * } catch (err) {
 *   displayError(err, toastStore, {
 *     duration: 5000,
 *     action: {
 *       label: 'Retry',
 *       onClick: () => saveDocument()
 *     }
 *   });
 * }
 * ```
 */
export function displayError(
	error: unknown,
	toastStore: ToastStore,
	options: DisplayOptions = {}
): void {
	const { duration = 5000 } = options;
	const message = getErrorMessage(error);

	// Display using toast store
	toastStore.error(message, duration);

	// Note: Action button support would require extending the toast system
	// This is a simplified implementation for now
}
