import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DocumentListItem from './DocumentListItem.svelte';

describe('DocumentListItem', () => {
	it('should render with document data', async () => {
		render(DocumentListItem, {
			document: {
				id: 'test-id',
				name: 'Test Document'
			},
			isActive: false,
			onSelect: () => {},
			onDelete: () => {}
		});
	});
});
