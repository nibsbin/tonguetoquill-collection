import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import Preview from './Preview.svelte';
import { quillmarkService } from '$lib/services/quillmark';
import { QuillmarkError } from '$lib/services/quillmark/types';

// Mock the quillmark service
vi.mock('$lib/services/quillmark', () => ({
	quillmarkService: {
		initialize: vi.fn(),
		isReady: vi.fn(),
		getAvailableQuills: vi.fn(),
		renderForPreview: vi.fn()
	}
}));

describe('Preview', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Default mock implementations
		vi.mocked(quillmarkService.isReady).mockReturnValue(true);
		vi.mocked(quillmarkService.getAvailableQuills).mockReturnValue([
			{ name: 'usaf_memo', description: 'USAF Memo', backend: 'typst', exampleFile: 'example.md' }
		]);
	});

	it('should render loading state initially', () => {
		vi.mocked(quillmarkService.isReady).mockReturnValue(false);
		vi.mocked(quillmarkService.initialize).mockImplementation(
			() => new Promise(() => {}) // Never resolves
		);

		render(Preview, {
			props: {
				markdown: '# Test',
				quillName: 'usaf_memo'
			}
		});

		expect(screen.getByText('Rendering preview...')).toBeDefined();
	});

	it('should render SVG preview', async () => {
		const svgContent = '<svg><text>Test SVG</text></svg>';
		vi.mocked(quillmarkService.renderForPreview).mockResolvedValue({
			format: 'svg',
			data: svgContent
		});

		render(Preview, {
			props: {
				markdown: '# Test',
				quillName: 'usaf_memo'
			}
		});

		await waitFor(() => {
			expect(screen.getByText('Test SVG')).toBeDefined();
		});
	});

	it('should render PDF preview', async () => {
		const pdfBlob = new Blob(['PDF content'], { type: 'application/pdf' });
		vi.mocked(quillmarkService.renderForPreview).mockResolvedValue({
			format: 'pdf',
			data: pdfBlob
		});

		render(Preview, {
			props: {
				markdown: '# Test',
				quillName: 'usaf_memo'
			}
		});

		await waitFor(() => {
			const embed = document.querySelector('embed');
			expect(embed).toBeDefined();
			expect(embed?.getAttribute('type')).toBe('application/pdf');
		});
	});

	it('should display error when quill not found', async () => {
		vi.mocked(quillmarkService.renderForPreview).mockRejectedValue(
			new QuillmarkError('quill_not_found', 'Quill not found')
		);

		render(Preview, {
			props: {
				markdown: '# Test',
				quillName: 'invalid_quill'
			}
		});

		await waitFor(() => {
			expect(screen.getByText('Invalid template selected.')).toBeDefined();
		});
	});

	it('should display error when not initialized', async () => {
		vi.mocked(quillmarkService.isReady).mockReturnValue(false);
		vi.mocked(quillmarkService.initialize).mockRejectedValue(new Error('Init failed'));

		render(Preview, {
			props: {
				markdown: '# Test',
				quillName: 'usaf_memo'
			}
		});

		await waitFor(() => {
			expect(screen.getByText('Failed to initialize preview. Please refresh.')).toBeDefined();
		});
	});

	it('should display error when render fails', async () => {
		vi.mocked(quillmarkService.renderForPreview).mockRejectedValue(
			new QuillmarkError('render_error', 'Render failed')
		);

		render(Preview, {
			props: {
				markdown: '# Test',
				quillName: 'usaf_memo'
			}
		});

		await waitFor(() => {
			expect(screen.getByText('Failed to render preview. Check document syntax.')).toBeDefined();
		});
	});

	it('should debounce render calls', async () => {
		const renderSpy = vi.mocked(quillmarkService.renderForPreview).mockResolvedValue({
			format: 'svg',
			data: '<svg>Test</svg>'
		});

		const { component } = render(Preview, {
			props: {
				markdown: '# Test 1',
				quillName: 'usaf_memo'
			}
		});

		// Update markdown multiple times rapidly
		await component.$set({ markdown: '# Test 2' });
		await component.$set({ markdown: '# Test 3' });
		await component.$set({ markdown: '# Test 4' });

		// Wait for debounce
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Should only render once after debounce period
		await waitFor(() => {
			expect(renderSpy).toHaveBeenCalledTimes(1);
		});
	});

	it('should cache render results', async () => {
		const renderSpy = vi.mocked(quillmarkService.renderForPreview).mockResolvedValue({
			format: 'svg',
			data: '<svg>Test</svg>'
		});

		const { component } = render(Preview, {
			props: {
				markdown: '# Test',
				quillName: 'usaf_memo'
			}
		});

		await waitFor(() => {
			expect(renderSpy).toHaveBeenCalledTimes(1);
		});

		// Change to different markdown
		await component.$set({ markdown: '# Different' });

		await waitFor(() => {
			expect(renderSpy).toHaveBeenCalledTimes(2);
		});

		// Change back to original markdown
		await component.$set({ markdown: '# Test' });

		await waitFor(() => {
			// Should still be 2 calls because result was cached
			expect(renderSpy).toHaveBeenCalledTimes(2);
		});
	});
});
