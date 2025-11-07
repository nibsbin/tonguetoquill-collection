/**
 * Quillmark Service Types
 *
 * Type definitions for the Quillmark service and related functionality.
 */

import type { RenderResult as QuillmarkRenderResult } from '@quillmark-test/web';

/**
 * Quill metadata extracted from Quill.toml
 */
export interface QuillMetadata {
	/** Unique name of the Quill template */
	name: string;

	/** Human-readable description of the template */
	description: string;

	/** Backend engine (e.g., 'typst', 'acroform') */
	backend: string;

	/** Example markdown file demonstrating the template */
	exampleFile: string;
}

/**
 * Quill manifest structure containing all available Quills
 */
export interface QuillManifest {
	/** Array of available Quill templates */
	quills: QuillMetadata[];
}

/**
 * Error codes for Quillmark service operations
 */
export type QuillmarkErrorCode =
	| 'not_initialized'
	| 'quill_not_found'
	| 'render_error'
	| 'load_error';

/**
 * Error severity level
 */
export type DiagnosticSeverity = 'error' | 'warning' | 'info';

/**
 * Source location for an error
 */
export interface DiagnosticLocation {
	/** Line number (1-indexed) */
	line: number;
	/** Column number (1-indexed) */
	column: number;
	/** Length of the error span */
	length?: number;
}

/**
 * Detailed diagnostic information from Quillmark rendering
 */
export interface QuillmarkDiagnostic {
	/** Error severity level */
	severity: DiagnosticSeverity;
	/** Optional error code (e.g., "E001", "typst::syntax") */
	code?: string;
	/** Human-readable error message */
	message: string;
	/** Primary source location */
	location?: DiagnosticLocation;
	/** Optional hint for fixing the error */
	hint?: string;
	/** Source chain as list of strings (for display purposes) */
	sourceChain: string[];
}

/**
 * Custom error class for Quillmark service errors
 */
export class QuillmarkError extends Error {
	/** Error code identifying the type of error */
	code: QuillmarkErrorCode;

	/** Optional diagnostic information for render errors */
	diagnostic?: QuillmarkDiagnostic;

	constructor(code: QuillmarkErrorCode, message: string, diagnostic?: QuillmarkDiagnostic) {
		super(message);
		this.name = 'QuillmarkError';
		this.code = code;
		this.diagnostic = diagnostic;
	}
}

/**
 * Render format options
 */
export type RenderFormat = 'pdf' | 'svg';

/**
 * Re-export RenderResult and Artifact from @quillmark-test/web
 */
export type { RenderResult, Artifact } from '@quillmark-test/web';

/**
 * Quillmark Service Interface
 *
 * Provides methods for initializing Quillmark engine and rendering documents.
 */
export interface QuillmarkService {
	/**
	 * Initialize the service by loading the Quillmark engine and preloading all Quills.
	 * Should be called once on application load.
	 *
	 * @throws {QuillmarkError} If initialization fails
	 */
	initialize(): Promise<void>;

	/**
	 * Check if service is initialized and ready to render documents.
	 *
	 * @returns True if service is ready, false otherwise
	 */
	isReady(): boolean;

	/**
	 * Get list of available Quill templates.
	 *
	 * @returns Array of Quill metadata
	 * @throws {QuillmarkError} If service is not initialized
	 */
	getAvailableQuills(): QuillMetadata[];

	/**
	 * Render markdown content to specified format.
	 *
	 * @param markdown - Markdown content to render
	 * @param format - Output format (pdf or svg)
	 * @returns RenderResult from Quillmark engine
	 * @throws {QuillmarkError} If service is not initialized or Quill not found
	 */
	renderToFormat(markdown: string, format: RenderFormat): Promise<QuillmarkRenderResult>;

	/**
	 * Render markdown for preview with auto-detected format and backend.
	 * Does not specify quill or output format - allows engine to auto-detect based on content.
	 *
	 * @param markdown - Markdown content to render
	 * @returns RenderResult from Quillmark engine
	 * @throws {QuillmarkError} If service is not initialized
	 */
	renderForPreview(markdown: string): Promise<QuillmarkRenderResult>;

	/**
	 * Download rendered document to user's file system.
	 *
	 * @param markdown - Markdown content to render
	 * @param quillName - Name of Quill template to use
	 * @param filename - Output filename
	 * @param format - Output format (pdf or svg)
	 * @throws {QuillmarkError} If service is not initialized or Quill not found
	 */
	downloadDocument(
		markdown: string,
		quillName: string,
		filename: string,
		format: RenderFormat
	): Promise<void>;
}
