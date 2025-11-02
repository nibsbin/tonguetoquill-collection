/**
 * Template Service Tests
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { templateService } from './service';
import { TemplateError } from './types';

// Mock fetch globally
global.fetch = vi.fn();

// Shared mock manifest used across all tests
const MOCK_MANIFEST = [
	{
		name: 'Production Template',
		description: 'A production template',
		file: 'prod.md',
		production: true
	},
	{
		name: 'Dev Template',
		description: 'A development template',
		file: 'dev.md',
		production: false
	},
	{
		name: 'Another Prod Template',
		description: 'Another production template',
		file: 'prod2.md',
		production: true
	},
	{
		name: 'Test Template',
		description: 'A test template',
		file: 'test.md',
		production: true
	}
];

describe('TemplateService', () => {
	// Initialize service once for all tests
	beforeAll(async () => {
		(global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
			if (url === '/tonguetoquill-collection/templates/templates.json') {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve(MOCK_MANIFEST)
				} as Response);
			}
			if (url === '/tonguetoquill-collection/templates/test.md') {
				return Promise.resolve({
					ok: true,
					text: () => Promise.resolve('# Test Template\n\nThis is a test template.')
				} as Response);
			}
			if (url === '/tonguetoquill-collection/templates/prod.md') {
				return Promise.resolve({
					ok: true,
					text: () => Promise.resolve('# Production Template')
				} as Response);
			}
			// Return 404 for any other template files
			return Promise.resolve({
				ok: false,
				statusText: 'Not Found'
			} as Response);
		});

		await templateService.initialize();
	});

	describe('singleton pattern', () => {
		it('should return same instance', () => {
			expect(templateService).toBeDefined();
			expect(typeof templateService.initialize).toBe('function');
			expect(typeof templateService.isReady).toBe('function');
			expect(typeof templateService.listTemplates).toBe('function');
			expect(typeof templateService.getTemplateMetadata).toBe('function');
			expect(typeof templateService.getTemplate).toBe('function');
		});
	});

	describe('initialization', () => {
		it('should be initialized and ready', () => {
			expect(templateService.isReady()).toBe(true);
		});

		it('should be idempotent - calling initialize multiple times should not re-initialize', async () => {
			const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
			const callCountBefore = fetchMock.mock.calls.filter(
				(call) => call[0] === '/tonguetoquill-collection/templates/templates.json'
			).length;

			// Call initialize again
			await templateService.initialize();

			const callCountAfter = fetchMock.mock.calls.filter(
				(call) => call[0] === '/tonguetoquill-collection/templates/templates.json'
			).length;

			// Should not have made additional fetch calls
			expect(callCountAfter).toBe(callCountBefore);
		});
	});

	describe('listTemplates', () => {
		it('should return all templates when productionOnly is not specified', () => {
			const templates = templateService.listTemplates();

			expect(templates).toHaveLength(4);
			expect(templates.map((t) => t.file)).toEqual(['prod.md', 'dev.md', 'prod2.md', 'test.md']);
		});

		it('should return all templates when productionOnly is false', () => {
			const templates = templateService.listTemplates(false);

			expect(templates).toHaveLength(4);
		});

		it('should return only production templates when productionOnly is true', () => {
			const templates = templateService.listTemplates(true);

			expect(templates).toHaveLength(3);
			expect(templates.map((t) => t.file)).toEqual(['prod.md', 'prod2.md', 'test.md']);
			expect(templates.every((t) => t.production === true)).toBe(true);
		});
	});

	describe('getTemplateMetadata', () => {
		it('should return metadata for valid filename', () => {
			const metadata = templateService.getTemplateMetadata('test.md');

			expect(metadata).toEqual({
				name: 'Test Template',
				description: 'A test template',
				file: 'test.md',
				production: true
			});
		});

		it('should throw error for invalid filename', () => {
			expect(() => templateService.getTemplateMetadata('nonexistent.md')).toThrow(TemplateError);
		});

		it('should throw error with correct error code for not found', () => {
			try {
				templateService.getTemplateMetadata('nonexistent.md');
				expect.fail('Should have thrown error');
			} catch (error) {
				expect(error).toBeInstanceOf(TemplateError);
				if (error instanceof TemplateError) {
					expect(error.code).toBe('not_found');
				}
			}
		});
	});

	describe('getTemplate', () => {
		it('should load template content for valid filename', async () => {
			const template = await templateService.getTemplate('test.md');

			expect(template).toEqual({
				metadata: {
					name: 'Test Template',
					description: 'A test template',
					file: 'test.md',
					production: true
				},
				content: '# Test Template\n\nThis is a test template.'
			});
		});

		it('should throw error for invalid filename', async () => {
			await expect(templateService.getTemplate('nonexistent.md')).rejects.toThrow(TemplateError);
		});

		it('should throw error when template file fetch fails', async () => {
			// Template 'dev.md' is in the manifest but fetch returns 404
			await expect(templateService.getTemplate('dev.md')).rejects.toThrow(TemplateError);
		});
	});

	describe('error handling', () => {
		it('should have proper error code for not_initialized', () => {
			const error = new TemplateError('not_initialized', 'Not initialized');
			expect(error.code).toBe('not_initialized');
			expect(error.name).toBe('TemplateError');
			expect(error.message).toBe('Not initialized');
		});

		it('should have proper error code for not_found', () => {
			const error = new TemplateError('not_found', 'Not found');
			expect(error.code).toBe('not_found');
			expect(error.name).toBe('TemplateError');
		});

		it('should have proper error code for load_error', () => {
			const error = new TemplateError('load_error', 'Load error');
			expect(error.code).toBe('load_error');
			expect(error.name).toBe('TemplateError');
		});

		it('should have proper error code for invalid_manifest', () => {
			const error = new TemplateError('invalid_manifest', 'Invalid manifest');
			expect(error.code).toBe('invalid_manifest');
			expect(error.name).toBe('TemplateError');
		});
	});
});
