import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TopMenu from './TopMenu.svelte';

describe('TopMenu', () => {
	it('should render with file name', async () => {
		render(TopMenu, {
			fileName: 'test-document.md',
			onDownload: () => {},
			saveStatus: 'saved'
		});
		const fileName = page.getByText('test-document.md');
		await expect.element(fileName).toBeInTheDocument();
	});

	it('should show download button', async () => {
		const onDownload = vi.fn();
		render(TopMenu, {
			fileName: 'test-document.md',
			onDownload,
			saveStatus: 'saved'
		});
		const downloadButton = page.getByRole('button', { name: 'Download document' });
		await expect.element(downloadButton).toBeInTheDocument();
	});

	it('should show saved status', async () => {
		render(TopMenu, {
			fileName: 'test-document.md',
			onDownload: () => {},
			saveStatus: 'saved'
		});
		const savedText = page.getByText('Saved');
		await expect.element(savedText).toBeInTheDocument();
	});

	it('should show saving status', async () => {
		render(TopMenu, {
			fileName: 'test-document.md',
			onDownload: () => {},
			saveStatus: 'saving'
		});
		const savingText = page.getByText('Saving...');
		await expect.element(savingText).toBeInTheDocument();
	});

	it('should show error status', async () => {
		render(TopMenu, {
			fileName: 'test-document.md',
			onDownload: () => {},
			saveStatus: 'error',
			saveError: 'Network error'
		});
		const errorText = page.getByText('Error');
		await expect.element(errorText).toBeInTheDocument();
	});
});
