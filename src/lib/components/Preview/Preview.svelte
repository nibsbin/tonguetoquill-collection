<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { quillmarkService, resultToBlob, resultToSVGPages } from '$lib/services/quillmark';
	import { QuillmarkError, type RenderResult } from '$lib/services/quillmark/types';
	import Separator from '$lib/components/ui/separator.svelte';

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
			return;
		}

		loading = true;
		error = null;

		try {
			// Render with Quillmark - engine auto-detects backend from content
			const result = await quillmarkService.renderForPreview(markdown);
			renderResult = result;

			// Process SVG pages if applicable
			if (result.outputFormat === 'svg') {
				svgPages = resultToSVGPages(result);
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
	 * Create PDF object URL when render result changes
	 */
	$effect(() => {
		// Clean up previous object URL
		if (pdfObjectUrl) {
			URL.revokeObjectURL(pdfObjectUrl);
			pdfObjectUrl = null;
		}

		// Create new object URL for PDF
		if (renderResult?.outputFormat === 'pdf') {
			const blob = resultToBlob(renderResult);
			pdfObjectUrl = URL.createObjectURL(blob);
		}
	});

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
	class="h-full overflow-auto bg-white"
	role="region"
	aria-label="Document preview"
	aria-live="polite"
	aria-busy={loading}
>
	{#if loading}
		<div class="flex h-full items-center justify-center">
			<div class="text-center">
				<div
					class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
				></div>
				<p class="text-gray-600">Rendering preview...</p>
			</div>
		</div>
	{:else if error}
		<div class="flex h-full items-center justify-center">
			<div class="max-w-md rounded-lg bg-red-50 p-6 text-center">
				<svg
					class="mx-auto mb-4 h-12 w-12 text-red-500"
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
				<h3 class="mb-2 text-lg font-semibold text-red-800">Preview Error</h3>
				<p class="text-red-700">{error}</p>
			</div>
		</div>
	{:else if renderResult?.outputFormat === 'svg' && svgPages.length > 0}
		<div class="svg-preview-container">
			{#each svgPages as page, index (index)}
				<div class="svg-page">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html page}
				</div>
				{#if index < svgPages.length - 1}
					<Separator class="my-6" />
				{/if}
			{/each}
		</div>
	{:else if renderResult?.outputFormat === 'pdf' && pdfObjectUrl}
		<embed
			src={pdfObjectUrl}
			type="application/pdf"
			class="h-full w-full"
			aria-label="PDF preview"
		/>
	{:else}
		<div class="flex h-full items-center justify-center">
			<p class="text-gray-500">No preview available</p>
		</div>
	{/if}
</div>

<style>
	.svg-preview-container {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 100%;
	}

	.svg-page {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		width: 100%;
		max-width: 100%;
	}

	.svg-page :global(svg) {
		max-width: 100%;
		height: auto;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
	}
</style>
