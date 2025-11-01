/**
 * Template Service Implementation
 *
 * Provides singleton service for template manifest loading and template content access.
 */

import type { TemplateService, TemplateManifest, TemplateMetadata, Template } from './types';
import { TemplateError } from './types';

/**
 * Singleton implementation of TemplateService
 */
class TemplateServiceImpl implements TemplateService {
	private static instance: TemplateServiceImpl | null = null;
	private manifest: TemplateManifest | null = null;
	private initialized = false;

	/**
	 * Private constructor enforces singleton pattern
	 */
	private constructor() {}

	/**
	 * Get singleton instance
	 */
	static getInstance(): TemplateServiceImpl {
		if (!TemplateServiceImpl.instance) {
			TemplateServiceImpl.instance = new TemplateServiceImpl();
		}
		return TemplateServiceImpl.instance;
	}

	/**
	 * Initialize the Template service
	 */
	async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}

		try {
			// Load manifest
			this.manifest = await this.loadManifest();
			this.initialized = true;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new TemplateError('load_error', `Failed to initialize Template service: ${message}`);
		}
	}

	/**
	 * Check if service is ready
	 */
	isReady(): boolean {
		return this.initialized && this.manifest !== null;
	}

	/**
	 * Get list of template metadata for template selection
	 */
	listTemplates(productionOnly?: boolean): TemplateMetadata[] {
		this.validateInitialized();

		const templates = this.manifest?.templates ?? [];

		// Filter by production flag if requested
		if (productionOnly === true) {
			return templates.filter((t) => t.production === true);
		}

		return templates;
	}

	/**
	 * Get template metadata by filename
	 */
	getTemplateMetadata(filename: string): TemplateMetadata {
		this.validateInitialized();

		const metadata = this.manifest?.templates.find((t) => t.file === filename);
		if (!metadata) {
			const available = this.manifest?.templates.map((t) => t.file).join(', ') ?? 'none';
			throw new TemplateError(
				'not_found',
				`Template "${filename}" not found. Available: ${available}`
			);
		}

		return metadata;
	}

	/**
	 * Get full template with content by filename
	 */
	async getTemplate(filename: string): Promise<Template> {
		this.validateInitialized();

		// Get metadata first (validates template exists)
		const metadata = this.getTemplateMetadata(filename);

		try {
			// Fetch template content
			const response = await fetch(`/tonguetoquill-collection/templates/${filename}`);
			if (!response.ok) {
				throw new Error(`Failed to load template: ${response.statusText}`);
			}

			const content = await response.text();

			return {
				metadata,
				content
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new TemplateError('load_error', `Failed to load template "${filename}": ${message}`);
		}
	}

	/**
	 * Load manifest from static files
	 */
	private async loadManifest(): Promise<TemplateManifest> {
		const response = await fetch('/tonguetoquill-collection/templates/templates.json');
		if (!response.ok) {
			throw new Error(`Failed to load manifest: ${response.statusText}`);
		}

		const data = await response.json();

		// Validate manifest structure
		if (!Array.isArray(data)) {
			throw new TemplateError('invalid_manifest', 'Invalid manifest format: expected array');
		}

		// Validate each template has required fields
		for (const template of data) {
			if (!template.name || !template.file || typeof template.production !== 'boolean') {
				throw new TemplateError(
					'invalid_manifest',
					'Invalid template in manifest: missing required fields'
				);
			}
		}

		return { templates: data };
	}

	/**
	 * Validate service is initialized
	 */
	private validateInitialized(): void {
		if (!this.initialized || !this.manifest) {
			throw new TemplateError(
				'not_initialized',
				'Template service is not initialized. Call initialize() first.'
			);
		}
	}
}

/**
 * Export singleton instance
 */
export const templateService = TemplateServiceImpl.getInstance();
