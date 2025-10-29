<script lang="ts">
	import { onMount } from 'svelte';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { toast } from 'svelte-sonner';
	import EditorToolbar from './EditorToolbar.svelte';
	import MarkdownEditor from './MarkdownEditor.svelte';
	import MarkdownPreview from './MarkdownPreview.svelte';

	interface Props {
		documentId: string;
	}

	let { documentId }: Props = $props();

	let content = $state('');
	let loading = $state(true);
	let debouncedContent = $state('');
	let debounceTimer: number | undefined;
	let editorRef = $state<MarkdownEditor | null>(null);

	// Debounce preview updates
	function updateDebouncedContent(newContent: string) {
		content = newContent;

		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = window.setTimeout(() => {
			debouncedContent = newContent;
		}, 50);
	}

	function handleFormat(type: string) {
		// Forward formatting command to editor
		if (editorRef && typeof editorRef.handleFormat === 'function') {
			editorRef.handleFormat(type);
		}
	}

	onMount(async () => {
		try {
			const doc = await documentStore.fetchDocument(documentId);
			content = doc.content;
			debouncedContent = doc.content;
		} catch {
			toast.error('Failed to load document');
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
	<div class="flex h-full items-center justify-center bg-zinc-900">
		<p class="text-zinc-400">Loading document...</p>
	</div>
{:else}
	<div class="flex h-full flex-1">
		<!-- Editor Section -->
		<div class="flex flex-1 flex-col border-r border-zinc-700">
			<EditorToolbar onFormat={handleFormat} />
			<MarkdownEditor bind:this={editorRef} value={content} onChange={updateDebouncedContent} />
		</div>

		<!-- Preview Section (Desktop) -->
		<div class="hidden flex-1 overflow-auto lg:block">
			<MarkdownPreview markdown={debouncedContent} />
		</div>

		<!-- TODO: Mobile tabs for editor/preview toggle -->
	</div>
{/if}
