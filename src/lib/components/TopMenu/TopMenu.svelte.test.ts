import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TopMenu from './TopMenu.svelte';

describe('TopMenu', () => {
	it('should render with file name', async () => {
		render(TopMenu, {
			fileName: 'test-document.md',
			onDownload: () => {},
			saveStatus: 'saved'
		});
		const header = page.getByRole('banner');
		await expect.element(header).toBeInTheDocument();
	});
});
