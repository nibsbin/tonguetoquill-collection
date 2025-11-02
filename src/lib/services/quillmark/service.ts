/**
 * Quillmark Service Implementation
 *
 * Provides singleton service for Quillmark WASM engine initialization and document rendering.
 * Uses lazy loading for @quillmark-test/web to reduce cold start time and fix WASM loading.
 */

import type { Artifact } from '@quillmark-test/web';
import type {
	QuillmarkService,
	QuillManifest,
	QuillMetadata,
	RenderFormat,
	RenderResult
} from './types';
import { QuillmarkError } from './types';

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
class QuillmarkServiceImpl implements QuillmarkService {
	private static instance: QuillmarkServiceImpl | null = null;
	private engine: InstanceType<typeof import('@quillmark-test/web').Quillmark> | null = null;
	private manifest: QuillManifest | null = null;
	private initialized = false;

	/**
	 * Private constructor enforces singleton pattern
	 */
	private constructor() {}

	/**
	 * Get singleton instance
	 */
	static getInstance(): QuillmarkServiceImpl {
		if (!QuillmarkServiceImpl.instance) {
			QuillmarkServiceImpl.instance = new QuillmarkServiceImpl();
		}
		return QuillmarkServiceImpl.instance;
	}

	/**
	 * Initialize the Quillmark service
	 */
	async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}

		try {
			// Lazy load the @quillmark-test/web module
			await loadQuillmarkModule();

			// Load manifest
			this.manifest = await this.loadManifest();

			// Create Quillmark engine
			this.engine = new Quillmark!();

			// Preload all Quills
			await this.preloadQuills();

			this.initialized = true;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new QuillmarkError('load_error', `Failed to initialize Quillmark: ${message}`);
		}
	}

	/**
	 * Check if service is ready
	 */
	isReady(): boolean {
		return this.initialized && this.engine !== null;
	}

	/**
	 * Get available Quills
	 */
	getAvailableQuills(): QuillMetadata[] {
		this.validateInitialized();
		return this.manifest?.quills ?? [];
	}

	/**
	 * Render markdown to PDF
	 */
	async renderToPDF(markdown: string, quillName: string): Promise<Blob> {
		this.validateInitialized();
		this.validateQuillExists(quillName);

		try {
			const result = exporters!.render(this.engine!, markdown, {
				quillName: quillName,
				format: 'pdf'
			});

			return exporters!.toBlob(result);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new QuillmarkError('render_error', `Failed to render PDF: ${message}`);
		}
	}

	/**
	 * Render markdown for preview with auto-detected format and backend
	 * Does not specify quill or output format - allows engine to auto-detect
	 */
	async renderForPreview(markdown: string): Promise<RenderResult> {
		this.validateInitialized();

		try {
			// Render without quill name or format - let engine auto-detect based on content
			const result = exporters!.render(this.engine!, markdown, {
				// No quillName or format specified - engine auto-detects backend
			});

			return result;
		} catch (error) {
			console.log('Error during renderForPreview:', error);
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new QuillmarkError('render_error', `Failed to render preview: ${message}`);
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
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new QuillmarkError('render_error', `Failed to download document: ${message}`);
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
	private validateInitialized(): void {
		if (!this.initialized || !this.engine) {
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
