/**
 * Quillmark Service Implementation
 *
 * Provides singleton service for Quillmark WASM engine initialization and document rendering.
 * Uses lazy loading for @quillmark-test/web to reduce cold start time and fix WASM loading.
 */

import { ClientService } from '../base';
import type { Artifact } from '@quillmark-test/web';
import type {
	QuillmarkService,
	QuillManifest,
	QuillMetadata,
	RenderFormat,
	RenderResult
} from './types';
import { QuillmarkError } from './types';
import { getErrorMessage } from '$lib/errors';

/**p
 * Lazy-loaded modules from @quillmark-test/web
 */
let Quillmark: typeof import('@quillmark-test/web').Quillmark | null = null;
let loaders: typeof import('@quillmark-test/web').loaders | null = null;
let exporters: typeof import('@quillmark-test/web').exporters | null = null;

/**
 * Load the @quillmark-test/web module dynamically
 */
async function loadQuillmarkModule() {
	if (!Quillmark || !loaders || !exporters) {
		const module = await import('@quillmark-test/web');
		Quillmark = module.Quillmark;
		loaders = module.loaders;
		exporters = module.exporters;
	}
	return { Quillmark, loaders, exporters };
}

/**
 * Singleton implementation of QuillmarkService
 */
class QuillmarkServiceImpl extends ClientService<QuillmarkServiceImpl> implements QuillmarkService {
	private engine: InstanceType<typeof import('@quillmark-test/web').Quillmark> | null = null;
	private manifest: QuillManifest | null = null;

	/**
	 * Initialize the Quillmark service
	 */
	protected async doInitialize(): Promise<void> {
		// Lazy load the @quillmark-test/web module
		await loadQuillmarkModule();

		// Load manifest
		this.manifest = await this.loadManifest();

		// Create Quillmark engine
		this.engine = new Quillmark!();

		// Preload all Quills
		await this.preloadQuills();
	}

	/**
	 * Check if service is ready
	 */
	isReady(): boolean {
		return super.isReady() && this.engine !== null;
	}

	/**
	 * Get available Quills
	 */
	getAvailableQuills(): QuillMetadata[] {
		this.validateInitialized();
		return this.manifest?.quills ?? [];
	}
	/**
	 * Render markdown to specified format
	 * Does not specify quill or output format - allows engine to auto-detect
	 */
	async render(markdown: string, format?: RenderFormat): Promise<RenderResult> {
		this.validateInitialized();

		try {
			// Render without quill name or format - let engine auto-detect based on content
			let result: RenderResult;
			if (format) {
				result = exporters!.render(this.engine!, markdown, {
					format
				});
			} else {
				result = exporters!.render(this.engine!, markdown);
			}

			return result;
		} catch (error) {
			// Extract diagnostic information if available
			const diagnostic = this.extractDiagnostic(error);

			if (diagnostic) {
				// Throw with diagnostic information
				throw new QuillmarkError(
					'render_error',
					diagnostic.message || 'Failed to render preview',
					diagnostic
				);
			} else {
				// Fallback to generic error
				const message = getErrorMessage(error, 'Unknown error');
				throw new QuillmarkError('render_error', `Failed to render preview: ${message}`);
			}
		}
	}

	/**
	 * Download rendered document
	 */
	async downloadDocument(
		markdown: string,
		quillName: string,
		filename: string,
		format: RenderFormat
	): Promise<void> {
		this.validateInitialized();
		this.validateQuillExists(quillName);

		try {
			const result = exporters!.render(this.engine!, markdown, {
				quillName: quillName,
				format
			});

			exporters!.download(result, filename);
		} catch (error) {
			const diagnostic = this.extractDiagnostic(error);

			if (diagnostic) {
				throw new QuillmarkError('render_error', diagnostic.message, diagnostic);
			} else {
				const message = getErrorMessage(error, 'Unknown error');
				throw new QuillmarkError('render_error', `Failed to download document: ${message}`);
			}
		}
	}

	/**
	 * Load manifest from static files
	 */
	private async loadManifest(): Promise<QuillManifest> {
		const response = await fetch('/quills/manifest.json');
		if (!response.ok) {
			throw new Error(`Failed to load manifest: ${response.statusText}`);
		}
		const manifest = await response.json();

		// Validate manifest structure
		if (!manifest || !Array.isArray(manifest.quills)) {
			throw new Error('Invalid manifest format: missing quills array');
		}

		// Validate each quill has required fields
		for (const quill of manifest.quills) {
			if (!quill.name || !quill.backend) {
				throw new Error(`Invalid quill in manifest: missing required fields`);
			}
		}

		return manifest;
	}

	/**
	 * Preload all Quills from manifest
	 */
	private async preloadQuills(): Promise<void> {
		if (!this.manifest || !this.engine) {
			throw new Error('Cannot preload Quills: manifest or engine not initialized');
		}

		// Load all Quills in parallel
		const loadPromises = this.manifest.quills.map(async (quill) => {
			try {
				const response = await fetch(`/quills/${quill.name}.zip`);
				if (!response.ok) {
					throw new Error(`Failed to load ${quill.name}: ${response.statusText}`);
				}

				const zipBlob = await response.blob();
				const quillJson = await loaders!.fromZip(zipBlob);

				this.engine!.registerQuill(quillJson);
			} catch (error) {
				console.error(`Failed to load Quill "${quill.name}":`, error);
				throw error;
			}
		});

		await Promise.all(loadPromises);
	}

	/**
	 * Validate service is initialized
	 */
	protected validateInitialized(): void {
		super.validateInitialized();
		if (!this.engine) {
			throw new QuillmarkError(
				'not_initialized',
				'Quillmark service is not initialized. Call initialize() first.'
			);
		}
	}

	/**
	 * Validate Quill exists
	 */
	private validateQuillExists(quillName: string): void {
		const exists = this.manifest?.quills.some((q) => q.name === quillName);
		if (!exists) {
			const available = this.manifest?.quills.map((q) => q.name).join(', ') ?? 'none';
			throw new QuillmarkError(
				'quill_not_found',
				`Quill "${quillName}" not found. Available: ${available}`
			);
		}
	}

	/**
	 * Extract diagnostic information from WASM error
	 */
	private extractDiagnostic(error: unknown): import('./types').QuillmarkDiagnostic | null {
		// The WASM engine may return errors with a `diagnostic` property
		// or embed diagnostic information in the error structure
		if (error && typeof error === 'object') {
			// Handle Map objects from WASM
			if (error instanceof Map) {
				// Check if the Map has a diagnostics array
				const diagnostics = error.get('diagnostics');
				if (Array.isArray(diagnostics) && diagnostics.length > 0) {
					const firstDiagnostic = this.normalizeDiagnostic(diagnostics[0]);
					// If there are multiple diagnostics, append a note to the message
					if (diagnostics.length > 1) {
						const additionalCount = diagnostics.length - 1;
						firstDiagnostic.message = `${firstDiagnostic.message} (${additionalCount} additional diagnostic${additionalCount > 1 ? 's' : ''} encountered)`;
					}
					return firstDiagnostic;
				}

				// Check if the Map has diagnostic structure (type: 'diagnostic')
				if (error.get('type') === 'diagnostic') {
					// Convert Map to plain object
					const obj: Record<string, unknown> = {};
					error.forEach((value, key) => {
						obj[key] = value;
					});
					return this.normalizeDiagnostic(obj);
				}
			}

			const err = error as Record<string, unknown>;

			// Check for diagnostics array
			if (Array.isArray(err.diagnostics) && err.diagnostics.length > 0) {
				const diagnostics = err.diagnostics as unknown[];
				const firstDiagnostic = this.normalizeDiagnostic(diagnostics[0]);
				// If there are multiple diagnostics, append a note to the message
				if (diagnostics.length > 1) {
					const additionalCount = diagnostics.length - 1;
					firstDiagnostic.message = `${firstDiagnostic.message} (${additionalCount} additional diagnostic${additionalCount > 1 ? 's' : ''} encountered)`;
				}
				return firstDiagnostic;
			}

			// Check for diagnostic property
			if (err.diagnostic) {
				return this.normalizeDiagnostic(err.diagnostic);
			}

			// Check if error itself is a diagnostic
			if (err.severity && err.message) {
				return this.normalizeDiagnostic(err);
			}
		}

		return null;
	}

	/**
	 * Normalize WASM diagnostic to TypeScript type
	 */
	private normalizeDiagnostic(diagnostic: unknown): import('./types').QuillmarkDiagnostic {
		const d = diagnostic as Record<string, unknown>;
		return {
			severity: this.normalizeSeverity(d.severity),
			code: (d.code as string) || undefined,
			message: (d.message as string) || 'Unknown error',
			location: d.primary
				? {
						line: (d.primary as Record<string, unknown>).line as number,
						column: (d.primary as Record<string, unknown>).column as number,
						length: (d.primary as Record<string, unknown>).length as number | undefined
					}
				: undefined,
			hint: (d.hint as string) || undefined,
			sourceChain: (d.source_chain as string[]) || (d.sourceChain as string[]) || []
		};
	}

	/**
	 * Normalize severity to lowercase TypeScript type
	 */
	private normalizeSeverity(severity: unknown): import('./types').DiagnosticSeverity {
		if (typeof severity === 'string') {
			const lower = severity.toLowerCase();
			if (lower === 'error' || lower === 'warning' || lower === 'info') {
				return lower as import('./types').DiagnosticSeverity;
			}
		}
		return 'error'; // Default to error
	}
}

/**
 * Export singleton instance
 */
export const quillmarkService = QuillmarkServiceImpl.getInstance();

/**
 * Helper Functions for RenderResult Decoding
 */

/**
 * Convert RenderResult to Blob (for PDF format)
 * @param result - RenderResult from Quillmark engine
 * @returns Blob containing the rendered output
 */
export function resultToBlob(result: RenderResult): Blob {
	return exporters!.toBlob(result);
}

/**
 * Decode SVG artifact to string
 * @param artifact - Artifact containing SVG bytes
 * @returns SVG as string
 */
export function artifactToSVGString(artifact: Artifact): string {
	const decoder = new TextDecoder('utf-8');
	const arrayBuffer = exporters!.toArrayBuffer(artifact);
	return decoder.decode(arrayBuffer);
}

/**
 * Get all SVG pages from RenderResult
 * @param result - RenderResult from Quillmark engine
 * @returns Array of SVG strings, one per page
 */
export function resultToSVGPages(result: RenderResult): string[] {
	if (result.outputFormat !== 'svg') {
		throw new Error('RenderResult is not SVG format');
	}
	return result.artifacts.map(artifactToSVGString);
}
