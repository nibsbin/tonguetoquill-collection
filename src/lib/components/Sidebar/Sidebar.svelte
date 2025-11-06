<script lang="ts">
	import { Menu, Settings, Plus, LogIn, User, Info, Shield, FileText } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { SidebarButtonSlot } from '$lib/components/Sidebar';
	import { DocumentListItem } from '$lib/components/DocumentList';
	import BasePopover from '$lib/components/ui/base-popover.svelte';
	import Switch from '$lib/components/ui/switch.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Dialog from '$lib/components/ui/base-dialog.svelte';
	import LoginPopover from './LoginPopover.svelte';
	import NewDocumentDialog from '$lib/components/NewDocumentDialog';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { templateService } from '$lib/services/templates';
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
	let isDarkMode = $state(true);
	let profilePopoverOpen = $state(false);
	let newDocDialogOpen = $state(false);

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
		newDocDialogOpen = true;
	}

	async function handleCreateDocument(name: string, templateFilename?: string) {
		let content = '';

		// Load template content if template selected
		if (templateFilename) {
			try {
				const template = await templateService.getTemplate(templateFilename);
				content = template.content;
			} catch (error) {
				console.error('Failed to load template:', error);
				// Fallback to blank document
			}
		}

		// Create document with name and content
		await documentStore.createDocument(name, content);
	}

	function handleFileSelect(fileId: string) {
		documentStore.setActiveDocumentId(fileId);
	}

	function handleDeleteFile(fileId: string) {
		// Delete immediately without confirmation
		documentStore.deleteDocument(fileId);
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
			// Always close popover and reload to clear state, even on error
			profilePopoverOpen = false;
			window.location.reload();
		}
	}

	function handleAbout() {
		window.location.href = '/about';
		popoverOpen = false;
	}

	function handleTerms() {
		window.location.href = '/terms';
		popoverOpen = false;
	}

	function handlePrivacy() {
		window.location.href = '/privacy';
		popoverOpen = false;
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
		<div class="z-canvas-ui relative flex-shrink-0" style="width: 48px;">
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
	<div class="flex flex-col border-t border-border">
		<!-- Sign-In Button (Guest Mode) -->
		{#if !user}
			<BasePopover bind:open={loginPopoverOpen} side="right" align="start">
				{#snippet trigger()}
					<SidebarButtonSlot
						icon={LogIn}
						label="Sign in"
						{isExpanded}
						ariaLabel="Sign in to your account"
					/>
				{/snippet}
				{#snippet content()}
					<LoginPopover onClose={() => (loginPopoverOpen = false)} />
				{/snippet}
			</BasePopover>
		{/if}

		<!-- User Profile Button (Logged-in Mode) -->
		{#if user}
			<BasePopover bind:open={profilePopoverOpen} side="right" align="start">
				{#snippet trigger()}
					<SidebarButtonSlot
						icon={User}
						label={user.email}
						{isExpanded}
						title={user.email}
						ariaLabel="User profile: {user.email}"
					/>
				{/snippet}
				{#snippet content()}
					<div class="w-72 p-4">
						<h3 class="mb-4 text-lg font-semibold text-foreground">Account Information</h3>

						<dl class="mb-4 space-y-4">
							<div>
								<dt class="text-sm font-medium text-muted-foreground">Email</dt>
								<dd class="text-foreground">{user.email}</dd>
							</div>
							<div>
								<dt class="text-sm font-medium text-muted-foreground">User ID</dt>
								<dd class="font-mono text-sm text-foreground">{user.id}</dd>
							</div>
						</dl>

						<Button
							variant="ghost"
							size="sm"
							class="w-full text-muted-foreground hover:bg-accent hover:text-foreground"
							onclick={handleSignOut}
						>
							Sign Out
						</Button>
					</div>
				{/snippet}
			</BasePopover>
		{/if}

		<!-- Settings Gear Button -->
		<BasePopover bind:open={popoverOpen} side="right" align="end">
			{#snippet trigger()}
				<SidebarButtonSlot
					icon={Settings}
					label="Settings"
					{isExpanded}
					ariaLabel="Open settings"
				/>
			{/snippet}
			{#snippet content()}
				<div class="w-64 p-4">
					<h3 class="mb-4 text-lg font-semibold text-foreground">Settings</h3>

					<div class="space-y-4">
						<div class="flex items-center justify-between">
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

						<div class="flex items-center justify-between border-b border-border pb-3">
							<Label for="line-numbers" class="text-muted-foreground">Line Numbers</Label>
							<Switch
								id="line-numbers"
								bind:checked={lineNumbers}
								onCheckedChange={handleLineNumbersChange}
							/>
						</div>

						<!-- Legal & About Section -->
						<div class="space-y-1">
							<button
								class="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground focus:outline-none"
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
					</div>
				</div>
			{/snippet}
		</BasePopover>
	</div>
</div>

<!-- New Document Dialog -->
<NewDocumentDialog
	open={newDocDialogOpen}
	onOpenChange={(open) => (newDocDialogOpen = open)}
	onCreate={handleCreateDocument}
/>

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
