import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MarkdownEditor from './MarkdownEditor.svelte';

describe('MarkdownEditor', () => {
	it('should render', async () => {
		render(MarkdownEditor);
	});
});
