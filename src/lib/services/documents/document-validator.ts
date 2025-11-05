/**
 * Document Validator
 * Centralized validation logic for document names and content
 * Used by all document storage implementations (Mock, Supabase, Browser)
 */

import { DocumentError } from './types';

/**
 * DocumentValidator
 * Provides static methods for validating document names and content
 * Ensures consistent validation rules across all storage implementations
 */
export class DocumentValidator {
	// Validation constants
	static readonly MAX_CONTENT_SIZE = 524288; // 0.5 MB in bytes
	static readonly MAX_NAME_LENGTH = 255;
	static readonly MIN_NAME_LENGTH = 1;

	/**
	 * Validate document name
	 * @throws {DocumentError} if name is invalid
	 */
	static validateName(name: string): void {
		const trimmedName = name.trim();

		if (trimmedName.length < this.MIN_NAME_LENGTH) {
			throw new DocumentError('invalid_name', 'Document name cannot be empty', 400);
		}

		if (trimmedName.length > this.MAX_NAME_LENGTH) {
			throw new DocumentError(
				'invalid_name',
				`Document name must be ${this.MAX_NAME_LENGTH} characters or less`,
				400
			);
		}

		if (trimmedName !== name) {
			throw new DocumentError(
				'invalid_name',
				'Document name cannot have leading or trailing whitespace',
				400
			);
		}
	}

	/**
	 * Validate content size
	 * @throws {DocumentError} if content exceeds size limit
	 */
	static validateContent(content: string): void {
		const byteLength = this.getByteLength(content);

		if (byteLength > this.MAX_CONTENT_SIZE) {
			throw new DocumentError(
				'content_too_large',
				`Content size (${byteLength} bytes) exceeds maximum of ${this.MAX_CONTENT_SIZE} bytes`,
				413
			);
		}
	}

	/**
	 * Calculate byte length of string (UTF-8)
	 * Used for content size validation
	 */
	static getByteLength(str: string): number {
		return Buffer.from(str, 'utf-8').length;
	}
}
