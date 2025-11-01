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
	};

	let {
		fileName,
		onDownload,
		saveStatus = 'idle',
		saveError,
		onDocumentInfo
	}: TopMenuProps = $props();

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
	class="flex items-center justify-between border-b border-border bg-background px-4 top-menu-strong-border"
	style="height: var(--top-menu-height);"
>
	<div class="flex items-center gap-2" style="height: 3.1rem;">
		<!-- Logo to the left of document title (decorative) -->
		<img src="/logo.svg" alt="Tonguetoquill logo" aria-hidden="true" class="h-8 w-auto mr-3 shrink-0" />
		<span class="text-foreground/80">{fileName}</span>

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
				{#snippet children()}
					<Download class="mr-1 h-4 w-4" />
					Download
				{/snippet}
			</Button>
		</div>

		<!-- Meatball Menu -->
		<DropdownMenu>
			{#snippet children()}
				<DropdownMenuTrigger>
					{#snippet children()}
						<Button
							variant="ghost"
							size="sm"
							class="h-8 w-8 p-0 text-foreground/80 hover:bg-accent hover:text-foreground"
							aria-label="More options"
						>
							{#snippet children()}
								<MoreVertical class="h-4 w-4" />
							{/snippet}
						</Button>
					{/snippet}
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					class="w-56 border-border bg-surface-elevated text-foreground"
				>
					{#snippet children()}
						<!-- Group 1: Document Actions -->
						<DropdownMenuItem
							class="text-foreground/80 focus:bg-accent focus:text-foreground"
							onclick={handleImport}
						>
							{#snippet children()}
								<Upload class="mr-2 h-4 w-4" />
								Import
							{/snippet}
						</DropdownMenuItem>

						<DropdownMenuItem
							class="text-foreground/80 focus:bg-accent focus:text-foreground"
							onclick={handleShare}
						>
							{#snippet children()}
								<Share2 class="mr-2 h-4 w-4" />
								Share
							{/snippet}
						</DropdownMenuItem>

						<DropdownMenuSeparator class="bg-border" />

						<!-- Group 2: Info & Help -->
						<DropdownMenuItem
							class="text-foreground/80 focus:bg-accent focus:text-foreground"
							onclick={handleDocumentInfo}
						>
							{#snippet children()}
								<FileText class="mr-2 h-4 w-4" />
								Document Info
							{/snippet}
						</DropdownMenuItem>

						<DropdownMenuSeparator class="bg-border" />

						<!-- Group 3: Legal & About -->
						<DropdownMenuItem
							class="text-foreground/80 focus:bg-accent focus:text-foreground"
							onclick={handleAbout}
						>
							{#snippet children()}
								<Info class="mr-2 h-4 w-4" />
								About Us
								<ExternalLink class="ml-auto h-3 w-3" />
							{/snippet}
						</DropdownMenuItem>

						<DropdownMenuItem
							class="text-foreground/80 focus:bg-accent focus:text-foreground"
							onclick={handleTerms}
						>
							{#snippet children()}
								<FileText class="mr-2 h-4 w-4" />
								Terms of Use
								<ExternalLink class="ml-auto h-3 w-3" />
							{/snippet}
						</DropdownMenuItem>

						<DropdownMenuItem
							class="text-foreground/80 focus:bg-accent focus:text-foreground"
							onclick={handlePrivacy}
						>
							{#snippet children()}
								<Shield class="mr-2 h-4 w-4" />
								Privacy Policy
								<ExternalLink class="ml-auto h-3 w-3" />
							{/snippet}
						</DropdownMenuItem>
					{/snippet}
				</DropdownMenuContent>
			{/snippet}
		</DropdownMenu>
	</div>
</div>
