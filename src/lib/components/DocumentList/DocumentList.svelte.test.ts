import { page } from '@vitest/browser/context';
import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DocumentList from './DocumentList.svelte';

describe('DocumentList', () => {
	it('should render', async () => {
		render(DocumentList);
		// Wait for component to initialize
		await page.waitForTimeout(100);
	});
});
