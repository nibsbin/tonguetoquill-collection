/**
 * Quillmark Service Implementation
 *
 * Provides singleton service for Quillmark WASM engine initialization and document rendering.
 */

import { Quillmark, loaders, exporters } from '@quillmark-test/web';
import type { QuillmarkService, QuillManifest, QuillMetadata, RenderFormat } from './types';
import { QuillmarkError } from './types';

/**
 * Singleton implementation of QuillmarkService
 */
class QuillmarkServiceImpl implements QuillmarkService {
	private static instance: QuillmarkServiceImpl | null = null;
	private engine: Quillmark | null = null;
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
			// Load manifest
			this.manifest = await this.loadManifest();

			// Create Quillmark engine
			this.engine = new Quillmark();

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
			const result = exporters.render(this.engine!, markdown, {
				quill: quillName,
				format: 'pdf'
			});

			return exporters.toBlob(result);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new QuillmarkError('render_error', `Failed to render PDF: ${message}`);
		}
	}

	/**
	 * Render markdown to SVG
	 */
	async renderToSVG(markdown: string, quillName: string): Promise<string> {
		this.validateInitialized();
		this.validateQuillExists(quillName);

		try {
			const result = exporters.render(this.engine!, markdown, {
				quill: quillName,
				format: 'svg'
			});

			return exporters.toSvgString(result);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new QuillmarkError('render_error', `Failed to render SVG: ${message}`);
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
			const result = exporters.render(this.engine!, markdown, {
				quill: quillName,
				format
			});

			exporters.download(result, filename);
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
		return await response.json();
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
				const quillJson = await loaders.fromZip(zipBlob);

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
