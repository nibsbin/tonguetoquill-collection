import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EditorToolbar from './EditorToolbar.svelte';

describe('EditorToolbar', () => {
	it('should render', async () => {
		render(EditorToolbar, {
			onInsertBold: () => {},
			onInsertItalic: () => {},
			onInsertLink: () => {},
			onInsertCode: () => {},
			onInsertHeading: () => {},
			onInsertList: () => {},
			onInsertNumberedList: () => {},
			onInsertBlockquote: () => {},
			onUndo: () => {},
			onRedo: () => {}
		});
		const toolbar = page.getByRole('toolbar', { name: 'Editor toolbar' });
		await expect.element(toolbar).toBeInTheDocument();
	});
});
