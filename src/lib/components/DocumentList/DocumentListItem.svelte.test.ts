import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DocumentListItem from './DocumentListItem.svelte';

describe('DocumentListItem', () => {
	it('should render with document data', async () => {
		render(DocumentListItem, {
			document: {
				id: 'test-id',
				name: 'Test Document',
				updatedAt: new Date().toISOString()
			},
			isActive: false,
			onSelect: () => {},
			onDelete: () => {}
		});
		const button = page.getByRole('button', { name: /Test Document/ });
		await expect.element(button).toBeInTheDocument();
	});
});
