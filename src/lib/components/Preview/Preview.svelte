<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { quillmarkService, resultToBlob, resultToSVGPages } from '$lib/services/quillmark';
	import { QuillmarkError, type RenderResult } from '$lib/services/quillmark/types';

	interface Props {
		/** Markdown content to preview */
		markdown: string;
	}

	let { markdown }: Props = $props();

	// State
	let loading = $state(false);
	let error = $state<string | null>(null);
	let renderResult = $state<RenderResult | null>(null);
	let pdfObjectUrl = $state<string | null>(null);
	let svgPages = $state<string[]>([]);

	// Debounce timer
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Render markdown using Quillmark service
	 */
	async function renderPreview(): Promise<void> {
		if (!markdown) {
			renderResult = null;
			svgPages = [];
			// Clean up PDF object URL when clearing
			if (pdfObjectUrl) {
				URL.revokeObjectURL(pdfObjectUrl);
				pdfObjectUrl = null;
			}
			return;
		}

		loading = true;
		error = null;

		try {
			// Render with Quillmark - engine auto-detects backend from content
			const result = await quillmarkService.renderForPreview(markdown);
			renderResult = result;

			// Clean up previous PDF object URL before creating new one
			if (pdfObjectUrl) {
				URL.revokeObjectURL(pdfObjectUrl);
				pdfObjectUrl = null;
			}

			// Process output based on format
			if (result.outputFormat === 'svg') {
				svgPages = resultToSVGPages(result);
			} else if (result.outputFormat === 'pdf') {
				// Create new object URL for PDF only on new render
				svgPages = [];
				const blob = resultToBlob(result);
				pdfObjectUrl = URL.createObjectURL(blob);
				console.log('Length of PDF blob:', blob.size);
				console.log('Created PDF object URL:', pdfObjectUrl);
			} else {
				svgPages = [];
			}
		} catch (err) {
			if (err instanceof QuillmarkError) {
				switch (err.code) {
					case 'not_initialized':
						error = 'Preview unavailable. Please refresh.';
						break;
					case 'render_error':
						error = 'Failed to render preview. Check document syntax.';
						break;
					default:
						error = 'An error occurred while rendering.';
				}
			} else {
				error = 'An unexpected error occurred.';
			}
			console.error('Preview render error:', err);
		} finally {
			loading = false;
		}
	}

	/**
	 * Debounced render function
	 */
	function debouncedRender(): void {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			renderPreview();
		}, 50);
	}

	/**
	 * Initialize Quillmark service
	 */
	async function initializeService(): Promise<void> {
		if (!quillmarkService.isReady()) {
			try {
				loading = true;
				await quillmarkService.initialize();
			} catch (err) {
				error = 'Failed to initialize preview. Please refresh.';
				console.error('Quillmark initialization failed:', err);
			} finally {
				loading = false;
			}
		}
	}

	/**
	 * Trigger render when markdown changes
	 */
	$effect(() => {
		// Trigger debounced render when markdown changes
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		markdown;
		debouncedRender();
	});

	onMount(async () => {
		await initializeService();
		// Initial render
		await renderPreview();
	});

	onDestroy(() => {
		// Clean up debounce timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		// Clean up PDF object URL
		if (pdfObjectUrl) {
			URL.revokeObjectURL(pdfObjectUrl);
		}
	});
</script>

<div
	class="h-full overflow-auto bg-background"
	role="region"
	aria-label="Document preview"
	aria-live="polite"
	aria-busy={loading}
>
	{#if loading}
		<div class="flex h-full items-center justify-center">
			<div class="text-center">
				<div class="preview-loading-spinner mb-4"></div>
				<p class="text-muted-foreground">Rendering preview...</p>
			</div>
		</div>
	{:else if error}
		<div class="flex h-full items-center justify-center">
			<div class="max-w-md rounded-lg bg-red-50 p-6 text-center dark:bg-red-950">
				<svg
					class="mx-auto mb-4 h-12 w-12 text-destructive dark:text-red-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<h3 class="mb-2 text-lg font-semibold text-red-800 dark:text-red-300">Preview Error</h3>
				<p class="text-red-700 dark:text-red-300">{error}</p>
			</div>
		</div>
	{:else if renderResult?.outputFormat === 'svg' && svgPages.length > 0}
		<div class="preview-svg-container">
			{#each svgPages as page, index (index)}
				<div class="preview-svg-page">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html page}
				</div>
			{/each}
		</div>
	{:else if renderResult?.outputFormat === 'pdf' && pdfObjectUrl}
		<iframe
			src={pdfObjectUrl}
			title="PDF preview"
			class="h-full w-full border-0"
			aria-label="PDF preview"
		></iframe>
	{:else}
		<div class="flex h-full items-center justify-center">
			<p class="text-muted-foreground">No preview available</p>
		</div>
	{/if}
</div>

<style>
	.preview-svg-container {
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		min-height: 100%;
	}

	.preview-svg-page {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		width: 100%;
		max-width: 100%;
	}

	.preview-svg-page :global(svg) {
		max-width: 100%;
		height: auto;
		border-color: var(--color-foreground);
		box-shadow:
			0 1px 3px 1px var(--color-foreground-shadow),
			4px 0px 6px -1px var(--color-foreground-shadow);
	}
	.preview-loading-spinner {
		display: inline-block;
		width: 2rem;
		height: 2rem;
		border: 4px solid var(--color-primary);
		border-right-color: transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
