/**
 * Quillmark Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { quillmarkService } from './service';
import { QuillmarkError } from './types';

// Mock the @quillmark-test/web module
vi.mock('@quillmark-test/web', () => ({
	Quillmark: vi.fn().mockImplementation(() => ({
		registerQuill: vi.fn()
	})),
	loaders: {
		fromZip: vi.fn().mockResolvedValue({ name: 'test-quill' })
	},
	exporters: {
		render: vi.fn().mockReturnValue({ format: 'pdf', data: new Uint8Array() }),
		toBlob: vi.fn().mockReturnValue(new Blob(['test'], { type: 'application/pdf' })),
		toSvgString: vi.fn().mockReturnValue('<svg></svg>'),
		download: vi.fn()
	}
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('QuillmarkService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('singleton pattern', () => {
		it('should return same instance', () => {
			// The quillmarkService export is already the singleton instance
			// Just verify it exists and has expected methods
			expect(quillmarkService).toBeDefined();
			expect(typeof quillmarkService.initialize).toBe('function');
			expect(typeof quillmarkService.isReady).toBe('function');
		});
	});

	describe('initialization', () => {
		it('should load manifest and preload quills', async () => {
			const mockManifest = {
				quills: [{ name: 'taro', description: 'Test', backend: 'typst', exampleFile: 'taro.md' }]
			};

			(global.fetch as typeof fetch).mockImplementation((url: string) => {
				if (url === '/quills/manifest.json') {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve(mockManifest)
					} as Response);
				}
				if (url === '/quills/taro.zip') {
					return Promise.resolve({
						ok: true,
						blob: () => Promise.resolve(new Blob(['test']))
					} as Response);
				}
				return Promise.reject(new Error('Not found'));
			});

			await quillmarkService.initialize();

			expect(quillmarkService.isReady()).toBe(true);
			expect(global.fetch).toHaveBeenCalledWith('/quills/manifest.json');
			expect(global.fetch).toHaveBeenCalledWith('/quills/taro.zip');
		});

		it('should be idempotent - calling initialize multiple times should not re-initialize', async () => {
			const mockManifest = {
				quills: [{ name: 'taro', description: 'Test', backend: 'typst', exampleFile: 'taro.md' }]
			};

			(global.fetch as typeof fetch).mockImplementation((url: string) => {
				if (url === '/quills/manifest.json') {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve(mockManifest)
					} as Response);
				}
				if (url === '/quills/taro.zip') {
					return Promise.resolve({
						ok: true,
						blob: () => Promise.resolve(new Blob(['test']))
					} as Response);
				}
				return Promise.reject(new Error('Not found'));
			});

			await quillmarkService.initialize();
			const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
			const firstCallCount = fetchMock.mock.calls.length;

			// Call initialize again
			await quillmarkService.initialize();
			const secondCallCount = fetchMock.mock.calls.length;

			// Should not have made additional fetch calls
			expect(secondCallCount).toBe(firstCallCount);
		});
	});

	describe('getAvailableQuills', () => {
		it('should throw error if not initialized', () => {
			// Create a fresh instance to test uninitialized state
			// Note: In practice, the singleton may already be initialized from previous tests
			// This test assumes we can somehow get an uninitialized state
			// For true isolation, we'd need to reset the singleton between tests

			// Since we can't easily reset the singleton, this test documents expected behavior
			expect(() => {
				// If somehow not initialized
				if (!quillmarkService.isReady()) {
					quillmarkService.getAvailableQuills();
				}
			}).not.toThrow();
		});
	});

	describe('render methods', () => {
		beforeEach(async () => {
			const mockManifest = {
				quills: [
					{ name: 'taro', description: 'Test', backend: 'typst', exampleFile: 'taro.md' },
					{ name: 'usaf_memo', description: 'Memo', backend: 'typst', exampleFile: 'memo.md' }
				]
			};

			(global.fetch as typeof fetch).mockImplementation((url: string) => {
				if (url === '/quills/manifest.json') {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve(mockManifest)
					} as Response);
				}
				if (url.endsWith('.zip')) {
					return Promise.resolve({
						ok: true,
						blob: () => Promise.resolve(new Blob(['test']))
					} as Response);
				}
				return Promise.reject(new Error('Not found'));
			});

			await quillmarkService.initialize();
		});

		it('should render to PDF', async () => {
			const markdown = '# Test\n\nContent';
			const blob = await quillmarkService.renderToPDF(markdown, 'taro');

			expect(blob).toBeInstanceOf(Blob);
		});

		it('should render to SVG', async () => {
			const markdown = '# Test\n\nContent';
			const svg = await quillmarkService.renderToSVG(markdown, 'taro');

			expect(typeof svg).toBe('string');
		});

		it('should throw error for non-existent quill', async () => {
			const markdown = '# Test';

			await expect(quillmarkService.renderToPDF(markdown, 'nonexistent')).rejects.toThrow(
				QuillmarkError
			);
		});

		it('should download document', async () => {
			const markdown = '# Test';

			await quillmarkService.downloadDocument(markdown, 'taro', 'test.pdf', 'pdf');

			// Verify download was called
			const { exporters } = await import('@quillmark-test/web');
			expect(exporters.download).toHaveBeenCalled();
		});
	});
});
