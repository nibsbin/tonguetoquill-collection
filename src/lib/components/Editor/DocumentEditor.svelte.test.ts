import { page } from '@vitest/browser/context';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DocumentEditor from './DocumentEditor.svelte';
import { AutoSave } from '$lib/utils/auto-save.svelte';
import { documentStore } from '$lib/stores/documents.svelte';

// Mock the document store
vi.mock('$lib/stores/documents.svelte', () => ({
	documentStore: {
		fetchDocument: vi.fn(),
		activeDocument: null
	}
}));

// Mock svelte-sonner
vi.mock('svelte-sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn()
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

	it('should render editor component', async () => {
		const autoSave = new AutoSave();
		const { container } = render(DocumentEditor, {
			documentId: 'test-id',
			autoSave: autoSave
		});

		// Wait for loading to complete
		await page.waitForChanges();

		// Check that the editor container is rendered
		const editorContainer = container.querySelector('.flex.h-full');
		expect(editorContainer).not.toBeNull();
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
		const { container } = render(DocumentEditor, {
			documentId: 'temp-123',
			autoSave: autoSave
		});

		// Wait for loading to complete
		await page.waitForChanges();

		// Check that the editor container is rendered
		const editorContainer = container.querySelector('.flex.h-full');
		expect(editorContainer).not.toBeNull();
	});
});
