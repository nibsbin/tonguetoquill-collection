import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EditorToolbar from './EditorToolbar.svelte';

describe('EditorToolbar', () => {
	it('should render', async () => {
		render(EditorToolbar);
	});
});
