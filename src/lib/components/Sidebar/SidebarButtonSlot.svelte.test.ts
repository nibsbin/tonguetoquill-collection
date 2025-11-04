import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Menu } from 'lucide-svelte';
import SidebarButtonSlot from './SidebarButtonSlot.svelte';

describe('SidebarButtonSlot', () => {
	it('should render with label when expanded', async () => {
		render(SidebarButtonSlot, {
			icon: Menu,
			label: 'Test Label',
			variant: 'default',
			isExpanded: true
		});
		const button = page.getByRole('button', { name: 'Test Label' });
		await expect.element(button).toBeInTheDocument();
	});

	it('should render without label when collapsed', async () => {
		render(SidebarButtonSlot, {
			icon: Menu,
			label: 'Test Label',
			variant: 'default',
			isExpanded: false
		});
		// Button should still exist but may not show label text
		const button = page.getByRole('button');
		await expect.element(button).toBeInTheDocument();
	});

	it('should render with custom aria label', async () => {
		render(SidebarButtonSlot, {
			icon: Menu,
			label: 'Test Label',
			variant: 'default',
			isExpanded: true,
			ariaLabel: 'Custom Aria Label'
		});
		const button = page.getByRole('button', { name: 'Custom Aria Label' });
		await expect.element(button).toBeInTheDocument();
	});

	it('should call onclick when clicked', async () => {
		const onclick = vi.fn();
		render(SidebarButtonSlot, {
			icon: Menu,
			label: 'Test Label',
			variant: 'default',
			isExpanded: true,
			onclick
		});
		const button = page.getByRole('button', { name: 'Test Label' });
		await button.click();
		expect(onclick).toHaveBeenCalledTimes(1);
	});
});
