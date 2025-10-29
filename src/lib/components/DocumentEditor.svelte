<script lang="ts">
	import { onMount } from 'svelte';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import MarkdownEditor from './MarkdownEditor.svelte';
	import MarkdownPreview from './MarkdownPreview.svelte';

	interface Props {
		documentId: string;
	}

	let { documentId }: Props = $props();

	let content = $state('');
	let loading = $state(true);
	let showPreview = $state(true);
	let debouncedContent = $state('');
	let debounceTimer: number | undefined;

	// Debounce preview updates
	function updateDebouncedContent(newContent: string) {
		content = newContent;

		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = window.setTimeout(() => {
			debouncedContent = newContent;
		}, 300);
	}

	onMount(async () => {
		try {
			const doc = await documentStore.fetchDocument(documentId);
			content = doc.content;
			debouncedContent = doc.content;
		} catch {
			toastStore.error('Failed to load document');
		} finally {
			loading = false;
		}
	});

	// Cleanup debounce timer
	$effect(() => {
		return () => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
		};
	});
</script>

{#if loading}
	<div class="flex h-full items-center justify-center bg-zinc-50">
		<p class="text-zinc-600">Loading document...</p>
	</div>
{:else}
	<div class="flex h-full">
		<!-- Editor Pane -->
		<div class="flex-1 border-r border-zinc-200">
			<MarkdownEditor value={content} onChange={updateDebouncedContent} />
		</div>

		<!-- Preview Pane (Desktop) -->
		{#if showPreview}
			<div class="hidden flex-1 lg:block">
				<MarkdownPreview markdown={debouncedContent} />
			</div>
		{/if}

		<!-- TODO: Mobile tabs for editor/preview toggle -->
	</div>
{/if}
