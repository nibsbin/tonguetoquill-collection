/**
 * Base Error Class for Application Errors
 *
 * Abstract base class that provides a consistent structure for all service errors
 * in the application. Ensures type safety and enables generic error handling.
 */

/**
 * Abstract base error class for all application errors
 *
 * @abstract
 * @extends Error
 *
 * @example
 * ```typescript
 * class MyServiceError extends AppError {
 *   code: MyErrorCode;
 *   constructor(code: MyErrorCode, message: string, statusCode?: number) {
 *     super(code, message, statusCode);
 *     this.name = 'MyServiceError';
 *     this.code = code;
 *   }
 * }
 * ```
 */
export abstract class AppError extends Error {
	/**
	 * Error code identifying the specific error type
	 * Must be overridden by subclasses to provide typed error codes
	 */
	abstract code: string;

	/**
	 * HTTP status code for API responses
	 * @default 500
	 */
	statusCode: number;

	/**
	 * Optional hint for resolving the error
	 */
	hint?: string;

	/**
	 * Optional contextual data about the error
	 */
	context?: Record<string, unknown>;

	/**
	 * Create a new AppError
	 *
	 * @param code - Error code identifying the error type
	 * @param message - Human-readable error message
	 * @param statusCode - HTTP status code (default: 500)
	 * @param options - Additional error options (cause, etc.)
	 */
	constructor(code: string, message: string, statusCode: number = 500, options?: ErrorOptions) {
		super(message, options);
		this.statusCode = statusCode;

		// Maintains proper stack trace for where error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
