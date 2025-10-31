import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SidebarButtonSlot from './SidebarButtonSlot.svelte';

describe('SidebarButtonSlot', () => {
	it('should render with default props', async () => {
		render(SidebarButtonSlot, {
			icon: 'test-icon',
			label: 'Test Label',
			variant: 'default'
		});
		const button = page.getByRole('button', { name: 'Test Label' });
		await expect.element(button).toBeInTheDocument();
	});
});
