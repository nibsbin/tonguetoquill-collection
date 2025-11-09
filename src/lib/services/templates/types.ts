/**
 * Template Service Types
 *
 * Type definitions for the Template service and related functionality.
 */

import { AppError } from '$lib/errors';

/**
 * Template metadata from manifest
 */
export interface TemplateMetadata {
	/** Unique display name of the template */
	name: string;

	/** Human-readable description of the template */
	description: string;

	/** Filename of the markdown template (relative to templates directory) */
	file: string;

	/** Whether template is ready for production use */
	production: boolean;
}

/**
 * Template manifest structure
 */
export interface TemplateManifest {
	/** Array of available templates */
	templates: TemplateMetadata[];
}

/**
 * Full template with content
 */
export interface Template {
	/** Template metadata */
	metadata: TemplateMetadata;

	/** Full markdown content of the template */
	content: string;
}

/**
 * Error codes for Template service operations
 */
export type TemplateErrorCode = 'not_initialized' | 'not_found' | 'load_error' | 'invalid_manifest';

/**
 * Custom error class for Template service errors
 */
export class TemplateError extends AppError {
	/** Error code identifying the type of error */
	code: TemplateErrorCode;

	constructor(code: TemplateErrorCode, message: string) {
		super(code, message, 400);
		this.name = 'TemplateError';
		this.code = code;
	}
}

/**
 * Template Service Interface
 *
 * Provides read-only access to markdown templates with metadata.
 * Designed to support future database-backed implementations.
 */
export interface TemplateService {
	/**
	 * Initialize the service by loading the template manifest.
	 * Should be called once on application load.
	 *
	 * @throws {TemplateError} If initialization fails
	 */
	initialize(): Promise<void>;

	/**
	 * Check if service is initialized and ready to serve templates.
	 *
	 * @returns True if service is ready, false otherwise
	 */
	isReady(): boolean;

	/**
	 * Get list of template metadata for template selection.
	 * Typically used to populate a template selector component.
	 *
	 * @param productionOnly - If true, return only production-ready templates
	 * @returns Array of template metadata
	 * @throws {TemplateError} If service is not initialized
	 */
	listTemplates(productionOnly?: boolean): TemplateMetadata[];

	/**
	 * Get full template with content by filename.
	 *
	 * @param filename - Template filename from metadata
	 * @returns Template with metadata and content
	 * @throws {TemplateError} If service is not initialized or template not found
	 */
	getTemplate(filename: string): Promise<Template>;

	/**
	 * Get template metadata by filename.
	 *
	 * @param filename - Template filename
	 * @returns Template metadata
	 * @throws {TemplateError} If service is not initialized or template not found
	 */
	getTemplateMetadata(filename: string): TemplateMetadata;
}
