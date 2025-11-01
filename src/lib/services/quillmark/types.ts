/**
 * Quillmark Service Types
 *
 * Type definitions for the Quillmark service and related functionality.
 */

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
 * Custom error class for Quillmark service errors
 */
export class QuillmarkError extends Error {
	/** Error code identifying the type of error */
	code: QuillmarkErrorCode;

	constructor(code: QuillmarkErrorCode, message: string) {
		super(message);
		this.name = 'QuillmarkError';
		this.code = code;
	}
}

/**
 * Render format options
 */
export type RenderFormat = 'pdf' | 'svg';

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
	 * Render markdown content to PDF blob.
	 *
	 * @param markdown - Markdown content to render
	 * @param quillName - Name of Quill template to use
	 * @returns PDF blob
	 * @throws {QuillmarkError} If service is not initialized or Quill not found
	 */
	renderToPDF(markdown: string, quillName: string): Promise<Blob>;

	/**
	 * Render markdown content to SVG string.
	 *
	 * @param markdown - Markdown content to render
	 * @param quillName - Name of Quill template to use
	 * @returns SVG as string
	 * @throws {QuillmarkError} If service is not initialized or Quill not found
	 */
	renderToSVG(markdown: string, quillName: string): Promise<string>;

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
