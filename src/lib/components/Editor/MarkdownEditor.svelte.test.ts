import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MarkdownEditor from './MarkdownEditor.svelte';

describe('MarkdownEditor', () => {
	it('should render with value', async () => {
		const onChange = vi.fn();
		const { container } = render(MarkdownEditor, {
			value: '# Test',
			onChange
		});
		await expect.element(container.querySelector('.cm-editor')).toBeInTheDocument();
	});

	it('should render with empty value', async () => {
		const onChange = vi.fn();
		const { container } = render(MarkdownEditor, {
			value: '',
			onChange
		});
		await expect.element(container.querySelector('.cm-editor')).toBeInTheDocument();
	});

	it('should render with line numbers by default', async () => {
		const onChange = vi.fn();
		const { container } = render(MarkdownEditor, {
			value: '# Test',
			onChange,
			showLineNumbers: true
		});
		await expect.element(container.querySelector('.cm-lineNumbers')).toBeInTheDocument();
	});

	it('should render without line numbers when disabled', async () => {
		const onChange = vi.fn();
		const { container } = render(MarkdownEditor, {
			value: '# Test',
			onChange,
			showLineNumbers: false
		});
		expect(container.querySelector('.cm-lineNumbers')).toBeNull();
	});
});
