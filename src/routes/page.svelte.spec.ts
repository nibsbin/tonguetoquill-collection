import { page } from '@vitest/browser/context';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { documentStore } from '$lib/stores/documents.svelte';

// Mock the document store
vi.mock('$lib/stores/documents.svelte', () => ({
	documentStore: {
		setGuestMode: vi.fn(),
		fetchDocuments: vi.fn(),
		activeDocumentId: null,
		activeDocument: null
	}
}));

// Mock fetch
global.fetch = vi.fn();

describe('/+page.svelte', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(global.fetch).mockResolvedValue({
			ok: false,
			status: 401
		} as Response);
	});

	it('should render loading state initially', async () => {
		const { container } = render(Page);
		const loadingText = container.querySelector('p');
		expect(loadingText?.textContent).toBe('Loading...');
	});

	it('should render main content after loading', async () => {
		render(Page);
		// Wait for component to finish loading
		await page.waitForChanges();
		const skipLink = page.getByText('Skip to main content');
		await expect.element(skipLink).toBeInTheDocument();
	});

	it('should show no document selected when no active document', async () => {
		vi.mocked(documentStore).activeDocumentId = null;
		render(Page);
		// Wait for component to finish loading
		await page.waitForChanges();
		const noDocText = page.getByText('No Document Selected');
		await expect.element(noDocText).toBeInTheDocument();
	});
});
