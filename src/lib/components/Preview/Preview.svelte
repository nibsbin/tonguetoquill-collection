<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { quillmarkService } from '$lib/services/quillmark';
	import { QuillmarkError } from '$lib/services/quillmark/types';

	interface Props {
		/** Markdown content to preview */
		markdown: string;
		/** Quill template name */
		quillName: string;
	}

	let { markdown, quillName }: Props = $props();

	// State
	let loading = $state(false);
	let error = $state<string | null>(null);
	let renderFormat = $state<'pdf' | 'svg' | null>(null);
	let renderData = $state<Blob | string | null>(null);
	let pdfObjectUrl = $state<string | null>(null);

	// Debounce timer
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Cache for rendered content
	const renderCache = new SvelteMap<string, { format: 'pdf' | 'svg'; data: Blob | string }>();
	const MAX_CACHE_SIZE = 10;

	/**
	 * Generate cache key from markdown and quillName
	 */
	function getCacheKey(md: string, quill: string): string {
		return `${quill}:${md.slice(0, 100)}:${md.length}`;
	}

	/**
	 * Evict oldest cache entries if cache is too large
	 */
	function evictCache(): void {
		if (renderCache.size >= MAX_CACHE_SIZE) {
			const firstKey = renderCache.keys().next().value;
			if (firstKey) {
				renderCache.delete(firstKey);
			}
		}
	}

	/**
	 * Render markdown using Quillmark service
	 */
	async function renderPreview(): Promise<void> {
		if (!markdown || !quillName) {
			renderFormat = null;
			renderData = null;
			return;
		}

		loading = true;
		error = null;

		try {
			// Check cache first
			const cacheKey = getCacheKey(markdown, quillName);
			const cached = renderCache.get(cacheKey);

			if (cached) {
				renderFormat = cached.format;
				renderData = cached.data;
				loading = false;
				return;
			}

			// Render with Quillmark
			const result = await quillmarkService.renderForPreview(markdown, quillName);

			// Cache result
			evictCache();
			renderCache.set(cacheKey, { format: result.format, data: result.data });

			renderFormat = result.format;
			renderData = result.data;
		} catch (err) {
			if (err instanceof QuillmarkError) {
				switch (err.code) {
					case 'not_initialized':
						error = 'Preview unavailable. Please refresh.';
						break;
					case 'quill_not_found':
						error = 'Invalid template selected.';
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
	 * Create PDF object URL when render data changes
	 */
	$effect(() => {
		// Clean up previous object URL
		if (pdfObjectUrl) {
			URL.revokeObjectURL(pdfObjectUrl);
			pdfObjectUrl = null;
		}

		// Create new object URL for PDF
		if (renderFormat === 'pdf' && renderData instanceof Blob) {
			pdfObjectUrl = URL.createObjectURL(renderData);
		}
	});

	/**
	 * Trigger render when markdown or quillName changes
	 */
	$effect(() => {
		// Trigger debounced render when markdown or quillName changes
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		(markdown, quillName);
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

		// Clear cache
		renderCache.clear();
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
	{:else if renderFormat === 'svg' && typeof renderData === 'string'}
		<div class="svg-preview p-6">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html renderData}
		</div>
	{:else if renderFormat === 'pdf' && pdfObjectUrl}
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
	.svg-preview {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		min-height: 100%;
	}

	.svg-preview :global(svg) {
		max-width: 100%;
		height: auto;
	}
</style>
