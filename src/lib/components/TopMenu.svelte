<script lang="ts">
	import {
		Download,
		MoreVertical,
		FileText,
		Info,
		Shield,
		Upload,
		ExternalLink,
		Keyboard,
		Check,
		Loader2,
		AlertCircle
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
	};

	let { fileName, onDownload, saveStatus = 'idle', saveError }: TopMenuProps = $props();

	function handleKeyboardShortcuts() {
		// TODO: Open keyboard shortcuts dialog
		console.log('Keyboard shortcuts');
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

<div class="flex h-12 items-center justify-between border-b border-zinc-700 bg-zinc-800 px-4">
	<div class="flex items-center gap-2">
		<span class="text-zinc-300">{fileName}</span>
		
		<!-- Save Status Indicator -->
		{#if saveStatus === 'saving'}
			<div class="flex items-center gap-1 text-xs text-zinc-400">
				<Loader2 class="h-3 w-3 animate-spin" />
				<span>Saving...</span>
			</div>
		{:else if saveStatus === 'saved'}
			<div class="flex items-center gap-1 text-xs text-green-400">
				<Check class="h-3 w-3" />
				<span>Saved</span>
			</div>
		{:else if saveStatus === 'error'}
			<div class="flex items-center gap-1 text-xs text-red-400" title={saveError}>
				<AlertCircle class="h-3 w-3" />
				<span>Error</span>
			</div>
		{/if}
	</div>

	<div class="flex items-center gap-2">
		<div class="rounded-md border border-zinc-600 p-0.5">
			<Button
				variant="ghost"
				size="sm"
				class="h-7 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
				onclick={onDownload}
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
							class="h-8 w-8 p-0 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
						>
							{#snippet children()}
								<MoreVertical class="h-4 w-4" />
							{/snippet}
						</Button>
					{/snippet}
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" class="w-56 border-zinc-700 bg-zinc-800 text-zinc-100">
					{#snippet children()}
						<DropdownMenuItem
							class="text-zinc-300 focus:bg-zinc-700 focus:text-zinc-100"
							onclick={handleKeyboardShortcuts}
						>
							{#snippet children()}
								<Keyboard class="mr-2 h-4 w-4" />
								Keyboard Shortcuts
							{/snippet}
						</DropdownMenuItem>

						<DropdownMenuSeparator class="bg-zinc-700" />

						<DropdownMenuItem
							class="text-zinc-300 focus:bg-zinc-700 focus:text-zinc-100"
							onclick={handleAbout}
						>
							{#snippet children()}
								<Info class="mr-2 h-4 w-4" />
								About Us
								<ExternalLink class="ml-auto h-3 w-3" />
							{/snippet}
						</DropdownMenuItem>

						<DropdownMenuItem
							class="text-zinc-300 focus:bg-zinc-700 focus:text-zinc-100"
							onclick={handleTerms}
						>
							{#snippet children()}
								<FileText class="mr-2 h-4 w-4" />
								Terms of Use
								<ExternalLink class="ml-auto h-3 w-3" />
							{/snippet}
						</DropdownMenuItem>

						<DropdownMenuItem
							class="text-zinc-300 focus:bg-zinc-700 focus:text-zinc-100"
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
