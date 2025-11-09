/**
 * Error System Exports
 *
 * Centralized exports for the application error system.
 * Provides base error class and utility functions.
 */

// Base error class
export { AppError } from './app-error';

// Error utilities
export {
	getErrorMessage,
	withRetry,
	displayError,
	type RetryOptions,
	type DisplayOptions,
	type ToastStore
} from './utils';
