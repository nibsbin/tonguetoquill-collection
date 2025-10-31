import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MarkdownPreview from './MarkdownPreview.svelte';

describe('MarkdownPreview', () => {
	it('should render with markdown content', async () => {
		render(MarkdownPreview);
	});
});
