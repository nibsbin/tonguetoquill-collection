<script lang="ts">
	import { Menu, FileText, Plus, Settings, Trash2, User } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Separator from '$lib/components/ui/separator.svelte';
	import Popover from '$lib/components/ui/popover.svelte';
	import PopoverTrigger from '$lib/components/ui/popover-trigger.svelte';
	import PopoverContent from '$lib/components/ui/popover-content.svelte';
	import Switch from '$lib/components/ui/switch.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Sheet from '$lib/components/ui/sheet.svelte';
	import SheetTrigger from '$lib/components/ui/sheet-trigger.svelte';
	import SheetContent from '$lib/components/ui/sheet-content.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
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

	onMount(() => {
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
</script>

{#snippet sidebarContent()}
	<!-- Hamburger Menu and Title -->
	<div class="relative flex h-12 items-center p-1">
		<Button
			variant="ghost"
			size="icon"
			class="flex-shrink-0 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
			onclick={handleToggle}
		>
			{#snippet children()}
				<Menu class="h-5 w-5" />
			{/snippet}
		</Button>

		<span
			class="pointer-events-none absolute right-0 left-0 text-center whitespace-nowrap text-zinc-100 transition-opacity duration-300 {isExpanded
				? 'opacity-100'
				: 'opacity-0'}"
			style="font-family: 'Lato', Arial, sans-serif; font-weight: 700; font-size: 1.2rem;"
		>
			Tonguetoquill
		</span>
	</div>

	<!-- Logo centered below -->
	<div class="relative flex h-12 items-center justify-center overflow-hidden">
		<img src="/logo.svg" alt="Tonguetoquill Logo" class="h-8 flex-shrink-0" />
	</div>

	<Separator class="bg-zinc-700" />

	<!-- Menu Items -->
	<div class="flex-1 overflow-y-auto p-2">
		<div class="space-y-1">
			<Button
				variant="ghost"
				class="w-full justify-start text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
				onclick={handleNewFile}
			>
				{#snippet children()}
					<Plus class="mr-2 h-4 w-4 flex-shrink-0" />
					{#if isExpanded}
						<span class="animate-in fade-in transition-opacity duration-300">New File</span>
					{/if}
				{/snippet}
			</Button>

			{#if documentStore.documents.length > 0 && isExpanded}
				<Separator class="my-2 bg-zinc-700" />
				{#each documentStore.documents as doc (doc.id)}
					<div
						class="group -mr-2 flex items-center gap-1 rounded pr-2 pl-2 {doc.id ===
						documentStore.activeDocumentId
							? 'bg-zinc-700'
							: 'hover:bg-zinc-800'}"
					>
						<Button
							variant="ghost"
							class="flex-1 justify-start text-sm hover:bg-transparent {doc.id ===
							documentStore.activeDocumentId
								? 'text-zinc-100'
								: 'text-zinc-400 hover:text-zinc-100'}"
							onclick={() => handleFileSelect(doc.id)}
						>
							{#snippet children()}
								<FileText class="mr-2 h-4 w-4 flex-shrink-0" />
								<span class="animate-in fade-in truncate transition-opacity duration-300">
									{doc.name}
								</span>
							{/snippet}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							class="h-8 w-8 flex-shrink-0 text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-transparent hover:text-red-400"
							onclick={(e) => {
								e.stopPropagation();
								handleDeleteFile(doc.id);
							}}
						>
							{#snippet children()}
								<Trash2 class="h-4 w-4" />
							{/snippet}
						</Button>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- User Profile and Settings Section -->
	<div class="space-y-1 border-t border-zinc-700 p-2">
		<!-- User Profile Button -->
		{#if user}
			<Button
				variant="ghost"
				class="w-full justify-start text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
				title={user.email}
			>
				{#snippet children()}
					<User class="mr-2 h-5 w-5 flex-shrink-0" />
					{#if isExpanded}
						<span class="animate-in fade-in truncate transition-opacity duration-300">
							{user.email}
						</span>
					{/if}
				{/snippet}
			</Button>
		{/if}

		<!-- Settings Gear Button -->
		<Popover bind:open={popoverOpen}>
			{#snippet children()}
				<PopoverTrigger>
					{#snippet children()}
						<Button
							variant="ghost"
							class="w-full justify-start text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
						>
							{#snippet children()}
								<Settings class="mr-2 h-5 w-5 flex-shrink-0" />
								{#if isExpanded}
									<span class="animate-in fade-in transition-opacity duration-300">Settings</span>
								{/if}
							{/snippet}
						</Button>
					{/snippet}
				</PopoverTrigger>
				<PopoverContent
					side="right"
					align="end"
					class="w-64 border-zinc-700 bg-zinc-800 p-0 text-zinc-100"
				>
					{#snippet children()}
						<div class="p-4">
							<h3 class="mb-4">Settings</h3>

							<div class="space-y-4">
								<div class="flex items-center justify-between">
									<Label for="auto-save" class="text-zinc-300">
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
									<Label for="line-numbers" class="text-zinc-300">
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
							class="fixed top-2 left-2 z-40 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 lg:hidden"
						>
							{#snippet children()}
								<Menu class="h-5 w-5" />
							{/snippet}
						</Button>
					{/snippet}
				</SheetTrigger>
				<SheetContent side="left" class="flex w-56 flex-col bg-zinc-900 p-0 text-zinc-100">
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
		class="flex h-screen flex-col overflow-hidden bg-zinc-900 text-zinc-100 transition-all duration-300 {isExpanded
			? 'w-56'
			: 'w-12'}"
	>
		{@render sidebarContent()}
	</div>
{/if}

<!-- Delete Confirmation Dialog -->
<Dialog 
	open={deleteDialogOpen} 
	title="Delete Document" 
	description="Are you sure you want to delete this document? This action cannot be undone."
	onClose={cancelDelete}
>
	{#snippet children()}
		<div class="flex justify-end gap-2">
			<Button
				variant="ghost"
				size="sm"
				class="text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
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
		</div>
	{/snippet}
</Dialog>
