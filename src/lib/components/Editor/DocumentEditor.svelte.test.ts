import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DocumentEditor from './DocumentEditor.svelte';
import { AutoSave } from '$lib/utils/auto-save.svelte';

describe('DocumentEditor', () => {
	it('should render', async () => {
		const autoSave = new AutoSave();
		render(DocumentEditor, {
			documentId: 'test-id',
			autoSave: autoSave
		});
	});
});
