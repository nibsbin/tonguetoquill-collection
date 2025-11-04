import { page } from '@vitest/browser/context';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DocumentEditor from './DocumentEditor.svelte';
import { AutoSave } from '$lib/utils/auto-save.svelte';
import { documentStore } from '$lib/stores/documents.svelte';

// Mock the document store
vi.mock('$lib/stores/documents.svelte', () => ({
	documentStore: {
		fetchDocument: vi.fn()
	}
}));

describe('DocumentEditor', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(documentStore.fetchDocument).mockResolvedValue({
			id: 'test-id',
			name: 'Test Document',
			content: '# Test Content',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		});
	});

	it('should render editor and preview sections', async () => {
		const autoSave = new AutoSave();
		render(DocumentEditor, {
			documentId: 'test-id',
			autoSave: autoSave
		});

		// Wait for loading to complete
		await page.waitForChanges();

		const editorSection = page.getByRole('main', { name: 'Document editor' });
		await expect.element(editorSection).not.toBeNull();
	});

	it('should show loading state initially', async () => {
		const autoSave = new AutoSave();
		vi.mocked(documentStore.fetchDocument).mockImplementation(
			() => new Promise(() => {}) // Never resolves
		);

		const { container } = render(DocumentEditor, {
			documentId: 'test-id',
			autoSave: autoSave
		});

		const loadingElement = container.querySelector('[aria-busy="true"]');
		expect(loadingElement).not.toBeNull();
	});

	it('should render for temporary documents', async () => {
		const autoSave = new AutoSave();
		render(DocumentEditor, {
			documentId: 'temp-123',
			autoSave: autoSave
		});

		// Wait for loading to complete
		await page.waitForChanges();

		const editorSection = page.getByRole('main', { name: 'Document editor' });
		await expect.element(editorSection).not.toBeNull();
	});
});
