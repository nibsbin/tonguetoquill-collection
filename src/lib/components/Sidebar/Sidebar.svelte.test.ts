import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Sidebar from './Sidebar.svelte';

describe('Sidebar', () => {
	it('should render', async () => {
		render(Sidebar);
		const sidebar = page.getByRole('navigation', { name: 'Document sidebar' });
		await expect.element(sidebar).toBeInTheDocument();
	});
});
