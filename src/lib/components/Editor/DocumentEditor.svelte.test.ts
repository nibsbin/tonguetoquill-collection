import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DocumentEditor from './DocumentEditor.svelte';
import { AutoSave } from '$lib/utils/auto-save.svelte';

describe('DocumentEditor', () => {
	it('should render', async () => {
		const autoSave = new AutoSave();
		render(DocumentEditor, {
			documentId: 'test-id',
			autoSave: autoSave,
			onContentChange: vi.fn()
		});
		// Wait for component to initialize
		await page.waitForTimeout(100);
	});
});
