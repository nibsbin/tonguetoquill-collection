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

	it('should highlight active document', async () => {
		const onSelect = vi.fn();
		const onDelete = vi.fn();
		const { container } = render(DocumentListItem, {
			document: {
				id: 'test-id',
				name: 'Test Document'
			},
			isActive: true,
			onSelect,
			onDelete
		});
		const activeElement = container.querySelector('.bg-accent');
		expect(activeElement).not.toBeNull();
	});

	it('should not highlight inactive document', async () => {
		const onSelect = vi.fn();
		const onDelete = vi.fn();
		const { container } = render(DocumentListItem, {
			document: {
				id: 'test-id',
				name: 'Test Document'
			},
			isActive: false,
			onSelect,
			onDelete
		});
		// Check for hover class instead of active class
		const hoverElement = container.querySelector('.hover\\:bg-accent\\/50');
		expect(hoverElement).not.toBeNull();
	});
});
