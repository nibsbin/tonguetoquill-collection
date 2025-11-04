import { describe, it, expect, vi, beforeEach } from 'vitest';
import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
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
	},
	resultToBlob: vi.fn(),
	resultToSVGPages: vi.fn()
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

	it('should render loading state initially', async () => {
		vi.mocked(quillmarkService.isReady).mockReturnValue(false);
		vi.mocked(quillmarkService.initialize).mockImplementation(
			() => new Promise(() => {}) // Never resolves
		);

		render(Preview, {
			markdown: '# Test'
		});

		const loadingText = page.getByText('Rendering preview...');
		await expect.element(loadingText).toBeInTheDocument();
	});

	it('should render preview region', async () => {
		vi.mocked(quillmarkService.renderForPreview).mockResolvedValue({
			outputFormat: 'svg',
			artifacts: [{ bytes: new TextEncoder().encode('<svg><text>Test SVG</text></svg>') }]
		});

		render(Preview, {
			markdown: '# Test'
		});

		const previewRegion = page.getByRole('region', { name: 'Document preview' });
		await expect.element(previewRegion).toBeInTheDocument();
	});

	it('should render when no markdown provided', async () => {
		render(Preview, {
			markdown: ''
		});

		const previewRegion = page.getByRole('region', { name: 'Document preview' });
		await expect.element(previewRegion).toBeInTheDocument();
	});
});
