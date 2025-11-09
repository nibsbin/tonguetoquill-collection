/**
 * Error System Tests
 * Tests for AppError base class and error utilities
 */

import { describe, it, expect } from 'vitest';
import { AppError } from './app-error';
import { getErrorMessage, withRetry } from './utils';

// Create a concrete test error class for testing
class TestError extends AppError {
	code: 'test_error' | 'another_error';

	constructor(code: 'test_error' | 'another_error', message: string, statusCode?: number) {
		super(code, message, statusCode);
		this.name = 'TestError';
		this.code = code;
	}
}

describe('AppError', () => {
	it('should create error with code and message', () => {
		const error = new TestError('test_error', 'Test message', 400);

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(AppError);
		expect(error.code).toBe('test_error');
		expect(error.message).toBe('Test message');
		expect(error.statusCode).toBe(400);
		expect(error.name).toBe('TestError');
	});

	it('should default to status code 500 if not provided', () => {
		const error = new TestError('test_error', 'Test message');

		expect(error.statusCode).toBe(500);
	});

	it('should have stack trace', () => {
		const error = new TestError('test_error', 'Test message');

		expect(error.stack).toBeDefined();
		expect(error.stack).toContain('TestError');
	});

	it('should support optional hint and context', () => {
		const error = new TestError('test_error', 'Test message', 400);
		error.hint = 'Try this instead';
		error.context = { userId: '123', action: 'create' };

		expect(error.hint).toBe('Try this instead');
		expect(error.context).toEqual({ userId: '123', action: 'create' });
	});

	it('should work with instanceof checks', () => {
		const error = new TestError('test_error', 'Test message');

		expect(error instanceof AppError).toBe(true);
		expect(error instanceof TestError).toBe(true);
		expect(error instanceof Error).toBe(true);
	});
});

describe('getErrorMessage', () => {
	it('should extract message from AppError', () => {
		const error = new TestError('test_error', 'AppError message');
		const message = getErrorMessage(error);

		expect(message).toBe('AppError message');
	});

	it('should extract message from standard Error', () => {
		const error = new Error('Standard error message');
		const message = getErrorMessage(error);

		expect(message).toBe('Standard error message');
	});

	it('should return string error as-is', () => {
		const message = getErrorMessage('String error message');

		expect(message).toBe('String error message');
	});

	it('should return default fallback for unknown error types', () => {
		const message = getErrorMessage({ unknown: 'object' });

		expect(message).toBe('An unexpected error occurred');
	});

	it('should return custom fallback for unknown error types', () => {
		const message = getErrorMessage({ unknown: 'object' }, 'Custom fallback');

		expect(message).toBe('Custom fallback');
	});

	it('should handle null and undefined', () => {
		expect(getErrorMessage(null)).toBe('An unexpected error occurred');
		expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
		expect(getErrorMessage(null, 'Custom')).toBe('Custom');
		expect(getErrorMessage(undefined, 'Custom')).toBe('Custom');
	});
});

describe('withRetry', () => {
	it('should succeed on first attempt', async () => {
		let attempts = 0;
		const fn = async () => {
			attempts++;
			return 'success';
		};

		const result = await withRetry(fn);

		expect(result).toBe('success');
		expect(attempts).toBe(1);
	});

	it('should retry on failure and eventually succeed', async () => {
		let attempts = 0;
		const fn = async () => {
			attempts++;
			if (attempts < 3) {
				throw new Error('Temporary failure');
			}
			return 'success';
		};

		const result = await withRetry(fn, { maxAttempts: 3, delay: 10 });

		expect(result).toBe('success');
		expect(attempts).toBe(3);
	});

	it('should throw error after max attempts', async () => {
		let attempts = 0;
		const fn = async () => {
			attempts++;
			throw new Error('Persistent failure');
		};

		await expect(withRetry(fn, { maxAttempts: 3, delay: 10 })).rejects.toThrow(
			'Persistent failure'
		);
		expect(attempts).toBe(3);
	});

	it('should use exponential backoff', async () => {
		const timestamps: number[] = [];
		let attempts = 0;
		const fn = async () => {
			timestamps.push(Date.now());
			attempts++;
			if (attempts < 3) {
				throw new Error('Retry needed');
			}
			return 'success';
		};

		await withRetry(fn, { maxAttempts: 3, delay: 50, backoff: 2 });

		expect(attempts).toBe(3);
		expect(timestamps.length).toBe(3);

		// Verify delays (with tolerance for timing variations)
		const delay1 = timestamps[1] - timestamps[0];
		const delay2 = timestamps[2] - timestamps[1];

		// First delay should be ~50ms, second should be ~100ms (50 * 2)
		expect(delay1).toBeGreaterThanOrEqual(40); // Allow some tolerance
		expect(delay1).toBeLessThan(80);
		expect(delay2).toBeGreaterThanOrEqual(80);
		expect(delay2).toBeLessThan(150);
	});

	it('should respect shouldRetry predicate', async () => {
		let attempts = 0;
		const fn = async () => {
			attempts++;
			throw new TestError('test_error', 'Test error');
		};

		const shouldRetry = (error: unknown) => {
			// Don't retry for TestError
			return !(error instanceof TestError);
		};

		await expect(withRetry(fn, { maxAttempts: 3, delay: 10, shouldRetry })).rejects.toThrow(
			'Test error'
		);
		expect(attempts).toBe(1); // Should not retry
	});

	it('should use constant delay when backoff is 1', async () => {
		const timestamps: number[] = [];
		let attempts = 0;
		const fn = async () => {
			timestamps.push(Date.now());
			attempts++;
			if (attempts < 3) {
				throw new Error('Retry needed');
			}
			return 'success';
		};

		await withRetry(fn, { maxAttempts: 3, delay: 50, backoff: 1 });

		expect(attempts).toBe(3);

		// Both delays should be approximately the same
		const delay1 = timestamps[1] - timestamps[0];
		const delay2 = timestamps[2] - timestamps[1];

		expect(delay1).toBeGreaterThanOrEqual(40);
		expect(delay1).toBeLessThan(80);
		expect(delay2).toBeGreaterThanOrEqual(40);
		expect(delay2).toBeLessThan(80);
	});
});
