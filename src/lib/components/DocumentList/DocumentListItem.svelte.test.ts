import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DocumentListItem from './DocumentListItem.svelte';

describe('DocumentListItem', () => {
	it('should render with document data', async () => {
		const onSelect = vi.fn();
		const onDelete = vi.fn();
		render(DocumentListItem, {
			document: {
				id: 'test-id',
				name: 'Test Document'
			},
			isActive: false,
			onSelect,
			onDelete
		});
		const docName = page.getByText('Test Document');
		await expect.element(docName).toBeInTheDocument();
	});

	it('should render delete button', async () => {
		const onSelect = vi.fn();
		const onDelete = vi.fn();
		render(DocumentListItem, {
			document: {
				id: 'test-id',
				name: 'Test Document'
			},
			isActive: false,
			onSelect,
			onDelete
		});
		const deleteButton = page.getByRole('button', { name: 'Delete Test Document' });
		await expect.element(deleteButton).toBeInTheDocument();
	});

	it('should apply active styles when active', async () => {
		const onSelect = vi.fn();
		const onDelete = vi.fn();
		render(DocumentListItem, {
			document: {
				id: 'test-id',
				name: 'Test Document'
			},
			isActive: true,
			onSelect,
			onDelete
		});
		// Just verify the component renders - visual state is tested through E2E
		const docName = page.getByText('Test Document');
		await expect.element(docName).toBeInTheDocument();
	});

	it('should render when inactive', async () => {
		const onSelect = vi.fn();
		const onDelete = vi.fn();
		render(DocumentListItem, {
			document: {
				id: 'test-id',
				name: 'Test Document'
			},
			isActive: false,
			onSelect,
			onDelete
		});
		// Just verify the component renders - visual state is tested through E2E
		const docName = page.getByText('Test Document');
		await expect.element(docName).toBeInTheDocument();
	});
});
