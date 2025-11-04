import { page } from '@vitest/browser/context';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DocumentList from './DocumentList.svelte';
import { documentStore } from '$lib/stores/documents.svelte';

// Mock the document store
vi.mock('$lib/stores/documents.svelte', () => ({
	documentStore: {
		isLoading: false,
		error: null,
		documents: [],
		activeDocumentId: null,
		createDocument: vi.fn(),
		deleteDocument: vi.fn(),
		setActiveDocumentId: vi.fn(),
		fetchDocuments: vi.fn()
	}
}));

// Mock the toast store
vi.mock('$lib/stores/toast.svelte', () => ({
	toastStore: {
		success: vi.fn(),
		error: vi.fn()
	}
}));

describe('DocumentList', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(documentStore).isLoading = false;
		vi.mocked(documentStore).error = null;
		vi.mocked(documentStore).documents = [];
		vi.mocked(documentStore).activeDocumentId = null;
	});

	it('should render new document button', async () => {
		render(DocumentList);
		const newDocButton = page.getByRole('button', { name: '+ New Document' });
		await expect.element(newDocButton).toBeInTheDocument();
	});

	it('should show empty state when no documents', async () => {
		vi.mocked(documentStore).documents = [];
		render(DocumentList);
		const emptyText = page.getByText('No documents yet');
		await expect.element(emptyText).toBeInTheDocument();
	});

	it('should show loading state', async () => {
		vi.mocked(documentStore).isLoading = true;
		render(DocumentList);
		const loadingText = page.getByText('Loading...');
		await expect.element(loadingText).toBeInTheDocument();
	});

	it('should show error state', async () => {
		vi.mocked(documentStore).error = 'Failed to fetch documents';
		render(DocumentList);
		const errorText = page.getByText('Failed to fetch documents');
		await expect.element(errorText).toBeInTheDocument();
	});

	it('should render document list when documents exist', async () => {
		vi.mocked(documentStore).documents = [
			{
				id: 'doc-1',
				name: 'Test Document 1',
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			},
			{
				id: 'doc-2',
				name: 'Test Document 2',
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			}
		];
		render(DocumentList);
		const doc1 = page.getByText('Test Document 1');
		const doc2 = page.getByText('Test Document 2');
		await expect.element(doc1).toBeInTheDocument();
		await expect.element(doc2).toBeInTheDocument();
	});
});
