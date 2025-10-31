<script lang="ts">
	import { marked } from 'marked';

	interface Props {
		markdown: string;
	}

	let { markdown }: Props = $props();

	// Configure marked options
	marked.setOptions({
		breaks: true,
		gfm: true
	});

	let html = $derived(marked.parse(markdown));
</script>

<div class="h-full overflow-auto bg-white p-6">
	<div class="prose mx-auto">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</div>
</div>

<style>
	/* Prose styles for rendered markdown */
	:global(.prose) {
		color: #18181b;
		font-size: 1rem;
		line-height: 1.75;
		font-family: 'Crimson Text', Georgia, serif;
	}

	:global(.prose h1) {
		font-size: 2.25rem;
		font-weight: 800;
		line-height: 1.2;
		margin-top: 0;
		margin-bottom: 1rem;
		color: #18181b;
	}

	:global(.prose h2) {
		font-size: 1.875rem;
		font-weight: 700;
		line-height: 1.3;
		margin-top: 2rem;
		margin-bottom: 1rem;
		color: #18181b;
	}

	:global(.prose h3) {
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.4;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: #18181b;
	}

	:global(.prose p) {
		margin-top: 0;
		margin-bottom: 1rem;
	}

	:global(.prose a) {
		color: #2563eb;
		text-decoration: underline;
	}

	:global(.prose a:hover) {
		color: #1d4ed8;
	}

	:global(.prose strong) {
		font-weight: 600;
		color: #18181b;
	}

	:global(.prose em) {
		font-style: italic;
	}

	:global(.prose code) {
		background-color: #f4f4f5;
		color: #18181b;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
		font-family: ui-monospace, monospace;
	}

	:global(.prose pre) {
		background-color: #f4f4f5;
		color: #18181b;
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin: 1rem 0;
	}

	:global(.prose pre code) {
		background-color: transparent;
		padding: 0;
		border-radius: 0;
		font-size: 0.875rem;
	}

	:global(.prose ul) {
		list-style-type: disc;
		padding-left: 1.5rem;
		margin: 1rem 0;
	}

	:global(.prose ol) {
		list-style-type: decimal;
		padding-left: 1.5rem;
		margin: 1rem 0;
	}

	:global(.prose li) {
		margin: 0.5rem 0;
	}

	:global(.prose blockquote) {
		border-left: 4px solid #d4d4d8;
		padding-left: 1rem;
		margin: 1rem 0;
		font-style: italic;
		color: #52525b;
	}

	:global(.prose table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1rem 0;
	}

	:global(.prose th) {
		background-color: #f4f4f5;
		padding: 0.5rem;
		text-align: left;
		font-weight: 600;
		border: 1px solid #d4d4d8;
	}

	:global(.prose td) {
		padding: 0.5rem;
		border: 1px solid #d4d4d8;
	}

	:global(.prose img) {
		max-width: 100%;
		height: auto;
		margin: 1rem 0;
		border-radius: 0.5rem;
	}

	:global(.prose hr) {
		border: none;
		border-top: 1px solid #d4d4d8;
		margin: 2rem 0;
	}
</style>
