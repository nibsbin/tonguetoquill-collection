import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MarkdownPreview from './MarkdownPreview.svelte';

describe('MarkdownPreview', () => {
	it('should render with markdown content', async () => {
		render(MarkdownPreview, {
			content: '# Test Heading'
		});
		const preview = page.getByRole('article', { name: 'Markdown preview' });
		await expect.element(preview).toBeInTheDocument();
	});
});
