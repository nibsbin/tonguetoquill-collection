import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EditorToolbar from './EditorToolbar.svelte';

describe('EditorToolbar', () => {
	it('should render formatting buttons', async () => {
		const onFormat = vi.fn();
		render(EditorToolbar, {
			onFormat
		});
		const boldButton = page.getByRole('button', { name: 'Bold' });
		await expect.element(boldButton).toBeInTheDocument();
	});

	it('should render toggle frontmatter button', async () => {
		const onFormat = vi.fn();
		render(EditorToolbar, {
			onFormat
		});
		const toggleButton = page.getByRole('button', { name: 'Toggle All Metadata' });
		await expect.element(toggleButton).toBeInTheDocument();
	});

	it('should show save button when manual save provided', async () => {
		const onFormat = vi.fn();
		const onManualSave = vi.fn();
		render(EditorToolbar, {
			onFormat,
			isDirty: true,
			onManualSave
		});
		const saveButton = page.getByRole('button', { name: 'Save' });
		await expect.element(saveButton).toBeInTheDocument();
	});

	it('should not show save button when manual save not provided', async () => {
		const onFormat = vi.fn();
		render(EditorToolbar, {
			onFormat,
			isDirty: false
		});
		const saveButton = page.queryByRole('button', { name: 'Save' });
		expect(saveButton).toBeNull();
	});
});
