<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { quillmarkService, resultToBlob, resultToSVGPages } from '$lib/services/quillmark';
	import {
		QuillmarkError,
		type RenderResult,
		type QuillmarkDiagnostic
	} from '$lib/services/quillmark/types';

	interface Props {
		/** Markdown content to preview */
		markdown: string;
	}

	let { markdown }: Props = $props();

	interface ErrorDisplayState {
		code?: string;
		message: string;
		hint?: string;
		location?: {
			line: number;
			column: number;
		};
		sourceChain?: string[];
	}

	// State
	let loading = $state(false);
	let errorDisplay = $state<ErrorDisplayState | null>(null);
	let renderResult = $state<RenderResult | null>(null);
	let pdfObjectUrl = $state<string | null>(null);
	let svgPages = $state<string[]>([]);

	// Debounce timer
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Extract error display information from caught error
	 */
	function extractErrorDisplay(error: unknown): ErrorDisplayState {
		if (error instanceof QuillmarkError && error.diagnostic) {
			return {
				code: error.diagnostic.code,
				message: error.diagnostic.message,
				hint: error.diagnostic.hint,
				location: error.diagnostic.location,
				sourceChain:
					error.diagnostic.sourceChain.length > 0 ? error.diagnostic.sourceChain : undefined
			};
		}

		if (error instanceof QuillmarkError) {
			return { message: error.message };
		}

		return { message: 'An unexpected error occurred while rendering' };
	}

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
		errorDisplay = null;

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
			// Extract diagnostic information
			errorDisplay = extractErrorDisplay(err);
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
				errorDisplay = { message: 'Failed to initialize preview. Please refresh.' };
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
	{:else if errorDisplay}
		<div class="flex h-full items-center justify-center p-4">
			<div class="max-w-2xl rounded-lg border border-error-border bg-error-background p-6">
				<!-- Error Header -->
				<div class="mb-4 flex items-center gap-2">
					<svg
						class="h-6 w-6 text-error"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<h3 class="text-lg font-semibold text-error-foreground">Render Error</h3>
				</div>

				<!-- Error Code -->
				{#if errorDisplay.code}
					<div class="mb-3">
						<span
							class="inline-block rounded bg-error-border px-2 py-1 font-mono text-sm text-error-foreground"
						>
							{errorDisplay.code}
						</span>
					</div>
				{/if}

				<!-- Error Message -->
				<p class="mb-4 text-error-foreground">
					{errorDisplay.message}
				</p>

				<!-- Hint -->
				{#if errorDisplay.hint}
					<div class="mb-4 flex gap-2 rounded border-l-4 border-warning bg-warning-background p-3">
						<svg
							class="h-5 w-5 flex-shrink-0 text-warning"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
							/>
						</svg>
						<p class="text-sm text-warning-foreground">
							{errorDisplay.hint}
						</p>
					</div>
				{/if}

				<!-- Location -->
				{#if errorDisplay.location}
					<div class="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
						<svg
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						<span class="font-mono">
							Line {errorDisplay.location.line}, Column {errorDisplay.location.column}
						</span>
					</div>
				{/if}

				<!-- Source Chain -->
				{#if errorDisplay.sourceChain && errorDisplay.sourceChain.length > 0}
					<details class="mt-4">
						<summary
							class="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground"
						>
							Error Context
						</summary>
						<ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
							{#each errorDisplay.sourceChain as source}
								<li>{source}</li>
							{/each}
						</ul>
					</details>
				{/if}
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
