<script lang="ts">
	import { Menu, Settings, Plus, LogIn, User } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { SidebarButtonSlot } from '$lib/components/Sidebar';
	import { DocumentListItem } from '$lib/components/DocumentList';
	import Popover from '$lib/components/ui/popover.svelte';
	import PopoverContent from '$lib/components/ui/popover-content.svelte';
	import PopoverTrigger from '$lib/components/ui/popover-trigger.svelte';
	import Switch from '$lib/components/ui/switch.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import { Root as Dialog } from '$lib/components/ui/dialog.svelte';
	import DialogContent from '$lib/components/ui/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog-title.svelte';
	import DialogDescription from '$lib/components/ui/dialog-description.svelte';
	import DialogFooter from '$lib/components/ui/dialog-footer.svelte';
	import LoginPopover from './LoginPopover.svelte';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { onMount } from 'svelte';
	import { loginClient } from '$lib/services/auth';

	type SidebarProps = {
		user?: { email: string; id: string } | null;
	};

	let { user }: SidebarProps = $props();

	let isExpanded = $state(false);
	let autoSave = $state(true);
	let lineNumbers = $state(true);
	let popoverOpen = $state(false);
	let loginPopoverOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let documentToDelete = $state<string | null>(null);
	let isDarkMode = $state(true);
	let profileModalOpen = $state(false);

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
	});

	function handleToggle() {
		isExpanded = !isExpanded;
		localStorage.setItem('sidebar-expanded', isExpanded.toString());
	}

	function handleNewFile() {
		documentStore.createDocument();
	}

	function handleFileSelect(fileId: string) {
		documentStore.setActiveDocumentId(fileId);
	}

	function handleDeleteFile(fileId: string) {
		// Always show confirmation dialog (allow deleting the last document).
		// The store will handle selecting a new active document or clearing it.
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
		// Dispatch storage event manually for same-tab communication
		window.dispatchEvent(
			new StorageEvent('storage', {
				key: 'auto-save',
				newValue: value.toString(),
				oldValue: (!value).toString(),
				url: window.location.href,
				storageArea: localStorage
			})
		);
	}

	function handleLineNumbersChange(value: boolean) {
		lineNumbers = value;
		localStorage.setItem('line-numbers', value.toString());
		// Dispatch storage event manually for same-tab communication
		window.dispatchEvent(
			new StorageEvent('storage', {
				key: 'line-numbers',
				newValue: value.toString(),
				oldValue: (!value).toString(),
				url: window.location.href,
				storageArea: localStorage
			})
		);
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

	async function handleSignOut() {
		try {
			await loginClient.signOut();
		} catch (error) {
			console.error('Sign out failed:', error);
		} finally {
			// Always close modal and reload to clear state, even on error
			profileModalOpen = false;
			window.location.reload();
		}
	}

	function handleProfileClick() {
		profileModalOpen = true;
	}
</script>

<!-- Sidebar -->
<div
	class="flex h-screen flex-col overflow-hidden border-r border-border bg-background text-foreground transition-all duration-300"
	style="width: {isExpanded
		? 'var(--sidebar-expanded-width)'
		: 'var(--sidebar-collapsed-width)'}; transition-timing-function: cubic-bezier(0.165, 0.85, 0.45, 1);"
>
	<!-- Hamburger Menu and Title -->
	<div class="relative flex items-center">
		<div class="relative flex-shrink-0" style="width: 48px; z-index: 10;">
			<SidebarButtonSlot
				icon={Menu}
				{isExpanded}
				onclick={handleToggle}
				ariaLabel={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
			/>
		</div>

		<span
			class="pointer-events-none absolute right-0 left-0 text-center font-mono text-lg whitespace-nowrap text-foreground transition-opacity duration-300 {isExpanded
				? 'opacity-100'
				: 'opacity-0'}"
			style="transform: translateY(4px);"
		>
			<span class="">
				<span style="color: #3C79AA;">tongueto</span>quill
			</span>
		</span>
	</div>

	<!-- Logo Signature -->
	<div class="sidebar-logo-slot border-b border-border" class:expanded={isExpanded}>
		<img src="/logo.svg" alt="Tonguetoquill logo" aria-hidden="true" class="sidebar-logo" />
	</div>

	<!-- Menu Items -->
	<div class="flex-1 overflow-hidden">
		<div>
			<div class={documentStore.documents.length > 0 && isExpanded ? 'border-b border-border' : ''}>
				<SidebarButtonSlot
					icon={Plus}
					label="New Document"
					{isExpanded}
					onclick={handleNewFile}
					ariaLabel="Create new document"
				/>
			</div>

			{#if documentStore.documents.length > 0 && isExpanded}
				<!-- Scrollable Recent Items -->
				<div
					class="space-y-px overflow-x-hidden overflow-y-auto px-1 pt-1"
					style="max-height: calc(100vh - 300px);"
				>
					{#each documentStore.documents as doc (doc.id)}
						<DocumentListItem
							document={doc}
							isActive={doc.id === documentStore.activeDocumentId}
							onSelect={handleFileSelect}
							onDelete={handleDeleteFile}
						/>
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
	<div class="border-t border-border">
		<!-- Sign-In Button (Guest Mode) -->
		{#if !user}
			<Popover bind:open={loginPopoverOpen}>
				<PopoverTrigger asChild>
					<SidebarButtonSlot
						icon={LogIn}
						label="Sign in"
						{isExpanded}
						ariaLabel="Sign in to your account"
					/>
				</PopoverTrigger>
				<PopoverContent
					side="right"
					align="start"
					class="border-border bg-surface-elevated p-0 text-foreground"
				>
					<LoginPopover onClose={() => (loginPopoverOpen = false)} />
				</PopoverContent>
			</Popover>
		{/if}

		<!-- User Profile Button (Logged-in Mode) -->
		{#if user}
			<SidebarButtonSlot
				icon={User}
				label={user.email}
				{isExpanded}
				title={user.email}
				onclick={handleProfileClick}
				ariaLabel="User profile: {user.email}"
			/>
		{/if}

		<!-- Settings Gear Button -->
		<Popover bind:open={popoverOpen}>
			<PopoverTrigger asChild>
				<SidebarButtonSlot
					icon={Settings}
					label="Settings"
					{isExpanded}
					ariaLabel="Open settings"
				/>
			</PopoverTrigger>
			<PopoverContent
				side="right"
				align="end"
				class="w-64 border-border bg-surface-elevated p-0 text-foreground"
			>
				<div class="p-4">
					<h3 class="mb-4 text-lg font-semibold text-foreground">Settings</h3>

					<div class="space-y-4">
						<div class="flex items-center justify-between border-b border-border pb-3">
							<Label for="dark-mode" class="text-muted-foreground">Dark Mode</Label>
							<Switch
								id="dark-mode"
								bind:checked={isDarkMode}
								onCheckedChange={handleDarkModeChange}
							/>
						</div>

						<div class="flex items-center justify-between">
							<Label for="auto-save" class="text-muted-foreground">Auto-save</Label>
							<Switch
								id="auto-save"
								bind:checked={autoSave}
								onCheckedChange={handleAutoSaveChange}
							/>
						</div>

						<div class="flex items-center justify-between">
							<Label for="line-numbers" class="text-muted-foreground">Line Numbers</Label>
							<Switch
								id="line-numbers"
								bind:checked={lineNumbers}
								onCheckedChange={handleLineNumbersChange}
							/>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	</div>
</div>

<!-- Delete Confirmation Dialog -->
<Dialog bind:open={deleteDialogOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Delete Document</DialogTitle>
			<DialogDescription>
				Are you sure you want to delete this document? This action cannot be undone.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<Button
				variant="ghost"
				size="sm"
				class="text-muted-foreground hover:bg-accent hover:text-foreground"
				onclick={cancelDelete}
			>
				Cancel
			</Button>
			<Button
				variant="default"
				size="sm"
				class="bg-destructive text-white hover:bg-(--color-destructive-hover)"
				onclick={confirmDelete}
			>
				Delete
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<!-- Profile Modal -->
<Dialog bind:open={profileModalOpen}>
	<DialogContent class="max-w-md">
		<DialogHeader>
			<DialogTitle>Account Information</DialogTitle>
			<DialogDescription>View your account details</DialogDescription>
		</DialogHeader>
		{#if user}
			<dl class="space-y-4">
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Email</dt>
					<dd class="text-foreground">{user.email}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-muted-foreground">User ID</dt>
					<dd class="font-mono text-sm text-foreground">{user.id}</dd>
				</div>
			</dl>
		{/if}
		<DialogFooter>
			<Button
				variant="ghost"
				size="sm"
				class="text-muted-foreground hover:bg-accent hover:text-foreground"
				onclick={handleSignOut}
			>
				Sign Out
			</Button>
			<Button variant="default" size="sm" onclick={() => (profileModalOpen = false)}>Close</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<style>
	/* Logo signature slot */
	.sidebar-logo-slot {
		height: 48px;
		min-height: 48px;
		max-height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
	}

	.sidebar-logo {
		width: 30px;
		height: 30px;
		flex-shrink: 0;
		transition: transform 300ms cubic-bezier(0.165, 0.85, 0.45, 1);
		transform: translateY(-4px);
	}

	/* Legacy styles - kept for document list items */
	:global(.sidebar-icon-small) {
		width: calc(var(--sidebar-icon-size) * 0.6);
		height: calc(var(--sidebar-icon-size) * 0.6);
	}
</style>
