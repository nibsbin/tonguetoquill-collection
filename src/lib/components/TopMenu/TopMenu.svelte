<script lang="ts">
	import {
		Download,
		MoreVertical,
		FileText,
		Info,
		Shield,
		Upload,
		ExternalLink,
		Check,
		Loader2,
		AlertCircle,
		Share2,
		Ruler
	} from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import BasePopover from '$lib/components/ui/base-popover.svelte';
	import type { SaveStatus } from '$lib/utils/auto-save.svelte';
	import { rulerStore } from '$lib/stores/ruler.svelte';

	type TopMenuProps = {
		fileName: string;
		onDownload: () => void;
		saveStatus?: SaveStatus;
		saveError?: string;
		onDocumentInfo?: () => void;
		onTitleChange?: (newTitle: string) => void;
		onImport?: () => void;
		onRulerToggle?: () => void;
		onShare?: () => void;
	};

	let {
		fileName,
		onDownload,
		saveStatus = 'idle',
		saveError,
		onDocumentInfo,
		onTitleChange,
		onImport,
		onRulerToggle,
		onShare
	}: TopMenuProps = $props();

	import { documentStore } from '$lib/stores/documents.svelte';
	let isEditing = $state(false);
	let title = $state(fileName);
	let inputEl = $state<HTMLInputElement | null>(null);
	let dropdownOpen = $state(false);

	$effect(() => {
		if (!isEditing) {
			// keep local title in sync when not editing
			title = fileName;
		}
	});

	function startEditing() {
		isEditing = true;
		// focus will be set via on:use or after DOM update
		setTimeout(() => inputEl?.select(), 0);
	}

	function cancelEditing() {
		isEditing = false;
		title = fileName;
	}

	async function commitEditing() {
		isEditing = false;
		const newName = (title || '').trim() || 'Untitled Document';
		// Update local title immediately
		title = newName;

		// Notify parent of title change immediately (for TopMenu display)
		if (onTitleChange) {
			onTitleChange(newName);
		}

		// Persist to store (this will update sidebar reactively)
		// Authenticated mode: optimistic update (immediate sidebar update)
		// Guest mode: updates after localStorage write (slight delay)
		if (documentStore.activeDocumentId) {
			try {
				await documentStore.updateDocument(documentStore.activeDocumentId, { name: newName });
			} catch (err) {
				// Error is already handled by the store, just log for debugging
				console.error('Failed to update document name:', err);
				// Revert local title on error
				title = fileName;
				if (onTitleChange) {
					onTitleChange(fileName);
				}
			}
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			commitEditing();
		} else if (event.key === 'Escape') {
			cancelEditing();
		}
	}

	function handleImport() {
		if (onImport) {
			onImport();
		}
		dropdownOpen = false;
	}

	function handleShare() {
		if (onShare) {
			onShare();
		}
		dropdownOpen = false;
	}

	function handleDocumentInfo() {
		if (onDocumentInfo) {
			onDocumentInfo();
		}
		dropdownOpen = false;
	}

	function handleAbout() {
		window.location.href = '/about';
	}

	function handleTerms() {
		window.location.href = '/terms';
	}

	function handlePrivacy() {
		window.location.href = '/privacy';
	}

	function handleRulerToggle() {
		if (onRulerToggle) {
			onRulerToggle();
		} else {
			rulerStore.toggle();
		}
		dropdownOpen = false;
	}
</script>

<div
	class="top-menu-strong-border flex items-center justify-between border-b border-border bg-background px-4"
	style="height: var(--top-menu-height);"
>
	<div class="flex items-center gap-2" style="height: 3.1rem;">
		{#if isEditing}
			<input
				bind:this={inputEl}
				class="bg-transparent text-lg font-medium text-foreground/80 focus:outline-none"
				value={title}
				oninput={(e) => (title = (e.target as HTMLInputElement).value)}
				onblur={commitEditing}
				onkeydown={onKeydown}
				aria-label="Edit document title"
			/>
		{:else}
			<span
				class="cursor-text text-foreground/80"
				role="button"
				tabindex="0"
				onclick={startEditing}
				onkeydown={(e) => e.key === 'Enter' && startEditing()}
				title="Click to edit document title"
			>
				{title}
			</span>
		{/if}

		<!-- Save Status Indicator -->
		{#if saveStatus === 'saving'}
			<div class="flex items-center gap-1 text-xs text-muted-foreground">
				<Loader2 class="h-3 w-3 animate-spin" />
				<span>Saving...</span>
			</div>
		{:else if saveStatus === 'saved'}
			<div class="flex items-center gap-1 text-xs text-muted-foreground">
				<Check class="h-3 w-3" />
				<span>Saved</span>
			</div>
		{:else if saveStatus === 'error'}
			<div class="flex items-center gap-1 text-xs text-destructive" title={saveError}>
				<AlertCircle class="h-3 w-3" />
				<span>Error</span>
			</div>
		{/if}
	</div>

	<div class="flex items-center gap-2">
		<div class="rounded-md border border-border-hover p-0.5">
			<Button
				variant="ghost"
				size="sm"
				class="h-7 text-foreground/80 hover:bg-accent hover:text-foreground"
				onclick={onDownload}
				aria-label="Download document"
			>
				<Download class="mr-1 h-4 w-4" />
				Download
			</Button>
		</div>

		<!-- Meatball Menu -->
		<BasePopover bind:open={dropdownOpen} side="bottom" align="end" closeOnOutsideClick={true}>
			{#snippet trigger()}
				<Button
					variant="ghost"
					size="sm"
					class="h-8 w-8 p-0 text-foreground/80 hover:bg-accent hover:text-foreground"
					aria-label="More options"
				>
					<MoreVertical class="h-4 w-4" />
				</Button>
			{/snippet}
			{#snippet content()}
				<div class="min-w-[14rem] p-1">
					<!-- Group 1: Document Actions -->
					<button
						class="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground focus:outline-none"
						onclick={handleImport}
					>
						<Upload class="mr-2 h-4 w-4" />
						Import
					</button>

					<button
						class="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground focus:outline-none"
						onclick={handleShare}
					>
						<Share2 class="mr-2 h-4 w-4" />
						Share
					</button>

					<button
						class="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground focus:outline-none"
						onclick={handleRulerToggle}
					>
						<Ruler class="mr-2 h-4 w-4" />
						Ruler Tool
					</button>

					<!-- Group 2: Info & Help -->
					<button
						class="relative flex w-full cursor-pointer items-center rounded-sm border-t border-border px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground focus:outline-none"
						onclick={handleDocumentInfo}
					>
						<FileText class="mr-2 h-4 w-4" />
						Document Info
					</button>

					<!-- Group 3: Legal & About -->
					<button
						class="relative flex w-full cursor-pointer items-center rounded-sm border-t border-border px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground focus:outline-none"
						onclick={handleAbout}
					>
						<Info class="mr-2 h-4 w-4" />
						About Us
					</button>

					<button
						class="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground focus:outline-none"
						onclick={handleTerms}
					>
						<FileText class="mr-2 h-4 w-4" />
						Terms of Use
					</button>

					<button
						class="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground focus:outline-none"
						onclick={handlePrivacy}
					>
						<Shield class="mr-2 h-4 w-4" />
						Privacy Policy
					</button>
				</div>
			{/snippet}
		</BasePopover>
	</div>
</div>
