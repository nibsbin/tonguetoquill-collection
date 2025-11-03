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
		Share2
	} from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import DropdownMenu from '$lib/components/ui/dropdown-menu.svelte';
	import DropdownMenuTrigger from '$lib/components/ui/dropdown-menu-trigger.svelte';
	import DropdownMenuContent from '$lib/components/ui/dropdown-menu-content.svelte';
	import DropdownMenuItem from '$lib/components/ui/dropdown-menu-item.svelte';
	import DropdownMenuSeparator from '$lib/components/ui/dropdown-menu-separator.svelte';
	import type { SaveStatus } from '$lib/utils/auto-save.svelte';

	type TopMenuProps = {
		fileName: string;
		onDownload: () => void;
		saveStatus?: SaveStatus;
		saveError?: string;
		onDocumentInfo?: () => void;
		onTitleChange?: (newTitle: string) => void;
	};

	let {
		fileName,
		onDownload,
		saveStatus = 'idle',
		saveError,
		onDocumentInfo,
		onTitleChange
	}: TopMenuProps = $props();

	import { documentStore } from '$lib/stores/documents.svelte';
	let isEditing = $state(false);
	let title = $state(fileName);
	let inputEl = $state<HTMLInputElement | null>(null);

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
		// TODO: Open file picker
		console.log('Import document');
	}

	function handleShare() {
		// TODO: Open share dialog
		console.log('Share document');
	}

	function handleDocumentInfo() {
		if (onDocumentInfo) {
			onDocumentInfo();
		}
	}

	function handleAbout() {
		window.open('/about', '_blank');
	}

	function handleTerms() {
		window.open('/terms', '_blank');
	}

	function handlePrivacy() {
		window.open('/privacy', '_blank');
	}
</script>

<div
	class="top-menu-strong-border flex items-center justify-between border-b border-border bg-background px-4"
	style="height: var(--top-menu-height);"
>
	<div class="flex items-center gap-2" style="height: 3.1rem;">
		<!-- Logo to the left of document title (decorative) -->
		<img
			src="/logo.svg"
			alt="Tonguetoquill logo"
			aria-hidden="true"
			class="mr-3 h-8 w-auto shrink-0"
		/>
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
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button
					variant="ghost"
					size="sm"
					class="h-8 w-8 p-0 text-foreground/80 hover:bg-accent hover:text-foreground"
					aria-label="More options"
				>
					<MoreVertical class="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				class="w-56 border-border bg-surface-elevated text-foreground"
			>
				<!-- Group 1: Document Actions -->
				<DropdownMenuItem
					class="text-foreground/80 focus:bg-accent focus:text-foreground"
					onclick={handleImport}
				>
					<Upload class="mr-2 h-4 w-4" />
					Import
				</DropdownMenuItem>

				<DropdownMenuItem
					class="text-foreground/80 focus:bg-accent focus:text-foreground"
					onclick={handleShare}
				>
					<Share2 class="mr-2 h-4 w-4" />
					Share
				</DropdownMenuItem>

				<DropdownMenuSeparator class="bg-border" />

				<!-- Group 2: Info & Help -->
				<DropdownMenuItem
					class="text-foreground/80 focus:bg-accent focus:text-foreground"
					onclick={handleDocumentInfo}
				>
					<FileText class="mr-2 h-4 w-4" />
					Document Info
				</DropdownMenuItem>

				<DropdownMenuSeparator class="bg-border" />

				<!-- Group 3: Legal & About -->
				<DropdownMenuItem
					class="text-foreground/80 focus:bg-accent focus:text-foreground"
					onclick={handleAbout}
				>
					<Info class="mr-2 h-4 w-4" />
					About Us
					<ExternalLink class="ml-auto h-3 w-3" />
				</DropdownMenuItem>

				<DropdownMenuItem
					class="text-foreground/80 focus:bg-accent focus:text-foreground"
					onclick={handleTerms}
				>
					<FileText class="mr-2 h-4 w-4" />
					Terms of Use
					<ExternalLink class="ml-auto h-3 w-3" />
				</DropdownMenuItem>

				<DropdownMenuItem
					class="text-foreground/80 focus:bg-accent focus:text-foreground"
					onclick={handlePrivacy}
				>
					<Shield class="mr-2 h-4 w-4" />
					Privacy Policy
					<ExternalLink class="ml-auto h-3 w-3" />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	</div>
</div>
