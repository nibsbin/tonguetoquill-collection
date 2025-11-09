/**
 * Template Service Implementation
 *
 * Provides singleton service for template manifest loading and template content access.
 */

import { ClientService } from '../base';
import type { TemplateService, TemplateManifest, TemplateMetadata, Template } from './types';
import { TemplateError } from './types';

/**
 * Singleton implementation of TemplateService
 */
class TemplateServiceImpl extends ClientService<TemplateServiceImpl> implements TemplateService {
	private manifest: TemplateManifest | null = null;

	/**
	 * Initialize the Template service
	 */
	protected async doInitialize(): Promise<void> {
		// Load manifest
		this.manifest = await this.loadManifest();
	}

	/**
	 * Check if service is ready
	 */
	isReady(): boolean {
		return super.isReady() && this.manifest !== null;
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
			const response = await fetch(`/templates/${filename}`);
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
		const response = await fetch('/templates/templates.json');
		if (!response.ok) {
			throw new Error(`Failed to load manifest: ${response.statusText}`);
		}

		const data = await response.json();

		// Note: The JSON file is a direct array of templates, not an object with a 'templates' property
		// We validate the array format and wrap it in TemplateManifest for internal consistency
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

		// Wrap the array in TemplateManifest object for type safety
		return { templates: data };
	}

	/**
	 * Validate service is initialized
	 */
	protected validateInitialized(): void {
		super.validateInitialized();
		if (!this.manifest) {
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
