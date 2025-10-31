import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MarkdownEditor from './MarkdownEditor.svelte';

describe('MarkdownEditor', () => {
	it('should render', async () => {
		render(MarkdownEditor, {
			content: 'test content',
			onContentChange: () => {},
			showLineNumbers: true
		});
		const editor = page.getByRole('textbox', { name: 'Markdown editor' });
		await expect.element(editor).toBeInTheDocument();
	});
});
