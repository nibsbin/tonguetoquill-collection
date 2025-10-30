<script lang="ts">
	import { Menu, FileText, SquarePen, Settings, Trash2, User } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import SidebarButtonSlot from '$lib/components/SidebarButtonSlot.svelte';
	import Separator from '$lib/components/ui/separator.svelte';
	import Popover from '$lib/components/ui/popover.svelte';
	import PopoverTrigger from '$lib/components/ui/popover-trigger.svelte';
	import PopoverContent from '$lib/components/ui/popover-content.svelte';
	import Switch from '$lib/components/ui/switch.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Sheet from '$lib/components/ui/sheet.svelte';
	import SheetTrigger from '$lib/components/ui/sheet-trigger.svelte';
	import SheetContent from '$lib/components/ui/sheet-content.svelte';
	import { Root as Dialog, Portal, Close } from '$lib/components/ui/dialog.svelte';
	import DialogContent from '$lib/components/ui/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog-title.svelte';
	import DialogDescription from '$lib/components/ui/dialog-description.svelte';
	import DialogFooter from '$lib/components/ui/dialog-footer.svelte';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { onMount } from 'svelte';

	type SidebarProps = {
		user?: { email: string; id: string } | null;
	};

	let { user }: SidebarProps = $props();

	let isExpanded = $state(false);
	let autoSave = $state(true);
	let lineNumbers = $state(true);
	let popoverOpen = $state(false);
	let mobileSheetOpen = $state(false);
	let isMobile = $state(false);
	let deleteDialogOpen = $state(false);
	let documentToDelete = $state<string | null>(null);
	let isDarkMode = $state(true);

	onMount(() => {
		// Load dark mode preference from localStorage
		const savedDarkMode = localStorage.getItem('dark-mode');
		if (savedDarkMode !== null) {
			isDarkMode = savedDarkMode === 'true';
		}
		// Apply dark mode class to document
		updateDarkMode(isDarkMode);

		// Check if sidebar should be expanded from localStorage
		const savedExpanded = localStorage.getItem('sidebar-expanded');
		if (savedExpanded !== null) {
			isExpanded = savedExpanded === 'true';
		}

		// Load settings from localStorage
		const savedAutoSave = localStorage.getItem('auto-save');
		if (savedAutoSave !== null) {
			autoSave = savedAutoSave === 'true';
		}

		const savedLineNumbers = localStorage.getItem('line-numbers');
		if (savedLineNumbers !== null) {
			lineNumbers = savedLineNumbers === 'true';
		}

		// Check if mobile
		const checkMobile = () => {
			isMobile = window.innerWidth < 1024;
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});

	function handleToggle() {
		isExpanded = !isExpanded;
		localStorage.setItem('sidebar-expanded', isExpanded.toString());
	}

	function handleNewFile() {
		documentStore.createDocument();
		// Close mobile sheet after creating file
		if (isMobile) {
			mobileSheetOpen = false;
		}
	}

	function handleFileSelect(fileId: string) {
		documentStore.setActiveDocumentId(fileId);
		// Close mobile sheet after selecting file
		if (isMobile) {
			mobileSheetOpen = false;
		}
	}

	function handleDeleteFile(fileId: string) {
		if (documentStore.documents.length === 1) {
			// Can't delete the last file
			return;
		}
		// Show confirmation dialog
		documentToDelete = fileId;
		deleteDialogOpen = true;
	}

	function confirmDelete() {
		if (documentToDelete) {
			documentStore.deleteDocument(documentToDelete);
			documentToDelete = null;
		}
		deleteDialogOpen = false;
	}

	function cancelDelete() {
		documentToDelete = null;
		deleteDialogOpen = false;
	}

	function handleAutoSaveChange(value: boolean) {
		autoSave = value;
		localStorage.setItem('auto-save', value.toString());
	}

	function handleLineNumbersChange(value: boolean) {
		lineNumbers = value;
		localStorage.setItem('line-numbers', value.toString());
	}

	function updateDarkMode(dark: boolean) {
		if (dark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	function handleDarkModeChange(value: boolean) {
		isDarkMode = value;
		localStorage.setItem('dark-mode', value.toString());
		updateDarkMode(value);
	}
</script>

{#snippet sidebarContent()}
	<!-- Hamburger Menu and Title -->
	<div class="relative flex items-center">
		<SidebarButtonSlot
			icon={Menu}
			{isExpanded}
			class="text-muted-foreground hover:bg-accent hover:text-foreground active:scale-95"
			onclick={handleToggle}
			ariaLabel={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
		/>

		<span
			class="pointer-events-none absolute right-0 left-0 text-center text-lg font-mono whitespace-nowrap text-foreground transition-opacity duration-300 {isExpanded
				? 'opacity-100'
				: 'opacity-0'}"
		>
			Tonguetoquill
		</span>
	</div>

	<!-- Logo centered below -->
	<div class="pt-0 pb-3 relative flex items-center justify-center overflow-hidden">
		<img src="/logo.svg" alt="Tonguetoquill Logo" class="h-8 shrink-0" />
	</div>

	<Separator class="bg-border" />

	<!-- Menu Items -->
	<div class="flex-1 overflow-hidden">
		<div>
			<SidebarButtonSlot
				icon={SquarePen}
				label="New File"
				{isExpanded}
				class="w-full justify-start overflow-hidden text-sm text-foreground/80 hover:bg-accent hover:text-foreground active:scale-[0.985]"
				onclick={handleNewFile}
				ariaLabel="Create new document"
			/>

			{#if !isExpanded}
				<Separator class="bg-border" />
			{/if}

			{#if documentStore.documents.length > 0 && isExpanded}
				<Separator class="bg-border" />

				<!-- Recents Section Header -->
				<div class="sticky top-0 z-10 mt-1 bg-gradient-to-b from-background from-50% to-background/40 pb-2 pl-2">
					<h3 class="text-xs text-muted-foreground">Recents</h3>
				</div>

				<!-- Scrollable Recent Items -->
				<div class="space-y-px overflow-x-hidden overflow-y-auto" style="max-height: calc(100vh - 300px);">
					{#each documentStore.documents as doc (doc.id)}
						<div
							class="group flex h-8 items-center gap-1 rounded pr-2 transition-transform {doc.id === documentStore.activeDocumentId ? 'bg-accent active:scale-100' : 'hover:bg-accent/50 active:scale-[0.985]'}"
						>
							<Button
								variant="ghost"
								class="flex-1 overflow-hidden justify-start p-2 text-xs transition-colors hover:bg-transparent {doc.id ===
								documentStore.activeDocumentId
									? 'font-medium text-foreground'
									: 'text-muted-foreground hover:text-foreground'}"
								onclick={() => handleFileSelect(doc.id)}
							>
								{#snippet children()}
									<FileText class="sidebar-icon sidebar-icon-small" />
									<span class="truncate transition-opacity duration-300">
										{doc.name}
									</span>
								{/snippet}
							</Button>
							<Button
								variant="ghost"
								size="icon"
								class="h-5 w-5 shrink-0 p-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-transparent hover:text-red-400 active:scale-95"
								onclick={(e) => {
									e.stopPropagation();
									handleDeleteFile(doc.id);
								}}
								aria-label="Delete {doc.name}"
							>
								{#snippet children()}
									<Trash2 class="h-5 w-5" />
								{/snippet}
							</Button>
						</div>
					{/each}

					<!-- Bottom gradient fade -->
					<div
						class="pointer-events-none sticky bottom-0 h-4 bg-gradient-to-t from-background to-transparent"
					></div>
				</div>
			{/if}
		</div>
	</div>

	<!-- User Profile and Settings Section -->
	<div class="space-y-1 border-t border-border">
		<!-- User Profile Button -->
		{#if user}
			<SidebarButtonSlot
				icon={User}
				label={user.email}
				{isExpanded}
				class="w-full justify-start overflow-hidden text-sm text-muted-foreground hover:bg-accent hover:text-foreground active:scale-[0.985]"
				title={user.email}
				ariaLabel="User profile: {user.email}"
			/>
		{/if}

		<!-- Settings Gear Button -->
		<div class="sidebar-button-slot">
			<Popover bind:open={popoverOpen}>
				{#snippet children()}
					<PopoverTrigger
						class="sidebar-slot-button {isExpanded ? 'sidebar-slot-button-full' : ''} inline-flex items-center overflow-hidden rounded-md text-sm font-medium text-muted-foreground whitespace-nowrap transition-transform hover:bg-accent hover:text-foreground active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
					>
						{#snippet children()}
							<Settings class="sidebar-icon" />
							{#if isExpanded}
								<span>Settings</span>
							{/if}
						{/snippet}
					</PopoverTrigger>
				<PopoverContent
					side="right"
					align="end"
					class="w-64 border-border bg-surface-elevated p-0 text-foreground"
				>
					{#snippet children()}
						<div class="p-4">
							<h3 class="mb-4 text-lg font-semibold">Settings</h3>

							<div class="space-y-4">
								<div class="flex items-center justify-between">
									<Label for="dark-mode" class="text-foreground/80">
										{#snippet children()}
											Dark Mode
										{/snippet}
									</Label>
									<Switch
										id="dark-mode"
										bind:checked={isDarkMode}
										onCheckedChange={handleDarkModeChange}
									/>
								</div>

								<Separator class="my-3 bg-border" />

								<div class="flex items-center justify-between">
									<Label for="auto-save" class="text-foreground/80">
										{#snippet children()}
											Auto-save
										{/snippet}
									</Label>
									<Switch
										id="auto-save"
										bind:checked={autoSave}
										onCheckedChange={handleAutoSaveChange}
									/>
								</div>

								<div class="flex items-center justify-between">
									<Label for="line-numbers" class="text-foreground/80">
										{#snippet children()}
											Line Numbers
										{/snippet}
									</Label>
									<Switch
										id="line-numbers"
										bind:checked={lineNumbers}
										onCheckedChange={handleLineNumbersChange}
									/>
								</div>
							</div>
						</div>
					{/snippet}
				</PopoverContent>
			{/snippet}
		</Popover>
		</div>
	</div>
{/snippet}

{#if isMobile}
	<!-- Mobile Sheet -->
	<div>
		<Sheet bind:open={mobileSheetOpen}>
			{#snippet children()}
				<SheetTrigger>
					{#snippet children()}
						<Button
							variant="ghost"
							size="icon"
							class="fixed top-2 left-2 z-40 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
						>
							{#snippet children()}
								<Menu class="h-5 w-5" />
							{/snippet}
						</Button>
					{/snippet}
				</SheetTrigger>
				<SheetContent side="left" class="flex w-72 flex-col bg-background p-0 text-foreground">
					{#snippet children()}
						{@render sidebarContent()}
					{/snippet}
				</SheetContent>
			{/snippet}
		</Sheet>
	</div>
{:else}
	<!-- Desktop Sidebar -->
	<div
		class="flex h-screen flex-col overflow-hidden border-r border-border bg-background text-foreground transition-all duration-300"
		style="width: {isExpanded ? 'var(--sidebar-expanded-width)' : 'var(--sidebar-collapsed-width)'}; transition-timing-function: cubic-bezier(0.165, 0.85, 0.45, 1);"
	>
		{@render sidebarContent()}
	</div>
{/if}

<!-- Delete Confirmation Dialog -->
<Dialog bind:open={deleteDialogOpen}>
	{#snippet children()}
		<DialogContent>
			{#snippet children()}
				<DialogHeader>
					{#snippet children()}
						<DialogTitle>
							{#snippet children()}
								Delete Document
							{/snippet}
						</DialogTitle>
						<DialogDescription>
							{#snippet children()}
								Are you sure you want to delete this document? This action cannot be undone.
							{/snippet}
						</DialogDescription>
					{/snippet}
				</DialogHeader>
				<DialogFooter>
					{#snippet children()}
						<Button
							variant="ghost"
							size="sm"
							class="text-muted-foreground hover:bg-accent hover:text-foreground"
							onclick={cancelDelete}
						>
							{#snippet children()}
								Cancel
							{/snippet}
						</Button>
						<Button
							variant="default"
							size="sm"
							class="bg-red-600 text-white hover:bg-red-700"
							onclick={confirmDelete}
						>
							{#snippet children()}
								Delete
							{/snippet}
						</Button>
					{/snippet}
				</DialogFooter>
			{/snippet}
		</DialogContent>
	{/snippet}
</Dialog>

<style>
    :global(.sidebar-icon) {
        width: var(--sidebar-icon-size);
        height: var(--sidebar-icon-size);
        flex-shrink: 0;
    }

    :global(.sidebar-icon:has(+ *)) {
        margin-right: 0.5rem;
    }

	:global(.sidebar-icon-small) {
        /* This calculates 60% of the parent's --sidebar-icon-size */
        width: calc(var(--sidebar-icon-size) * 0.6);
		height: calc(var(--sidebar-icon-size) * 0.6);
    }

    :global(.sidebar-section-height) {
        height: calc(var(--sidebar-button-size) + var(--sidebar-padding) * 2);
    }

</style>