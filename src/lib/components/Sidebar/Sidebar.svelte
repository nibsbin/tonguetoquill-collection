<script lang="ts">
	import { Menu, Settings, Plus, LogIn, User } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { SidebarButtonSlot } from '$lib/components/Sidebar';
	import { DocumentListItem } from '$lib/components/DocumentList';
	import BasePopover from '$lib/components/ui/base-popover.svelte';
	import Switch from '$lib/components/ui/switch.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import LoginPopover from './LoginPopover.svelte';
	import NewDocumentDialog from '$lib/components/NewDocumentDialog';
	import { documentStore } from '$lib/stores/documents.svelte';
	import { responsiveStore } from '$lib/stores/responsive.svelte';
	import { templateService } from '$lib/services/templates';
	import { onMount } from 'svelte';
	import { loginClient } from '$lib/services/auth';

	type SidebarProps = {
		user?: { email: string; id: string } | null;
		newDocDialogOpen?: boolean;
		onNewDocDialogOpenChange?: (open: boolean) => void;
		isExpanded?: boolean;
	};

	let {
		user,
		newDocDialogOpen = $bindable(false),
		isExpanded = $bindable(false)
	}: SidebarProps = $props();
	let autoSave = $state(true);
	let lineNumbers = $state(true);
	let popoverOpen = $state(false);
	let loginPopoverOpen = $state(false);
	let isDarkMode = $state(true);
	let profilePopoverOpen = $state(false);

	// Use centralized responsive store
	const isMobile = $derived(responsiveStore.isMobile);

	// Get existing document names for collision detection
	const existingDocumentNames = $derived(documentStore.documents.map((d) => d.name));

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

	async function handleCreateDocument(name: string, templateFilename: string) {
		let content = '';

		// Load template content
		try {
			const template = await templateService.getTemplate(templateFilename);
			content = template.content;
		} catch (error) {
			console.error('Failed to load template:', error);
			// Re-throw to show error in dialog
			throw error;
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
</script>

<!-- Sidebar -->
<aside
	role="navigation"
	aria-label="Main navigation"
	class="sidebar flex flex-col overflow-hidden overflow-x-hidden border-r border-border bg-background text-foreground transition-all duration-300"
	class:sidebar-mobile={isMobile}
	class:sidebar-desktop={!isMobile}
	class:sidebar-expanded={isExpanded}
	style="height: 100dvh; width: {isExpanded
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
				ariaExpanded={isExpanded}
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
				<NewDocumentDialog
					open={newDocDialogOpen}
					onOpenChange={(open) => (newDocDialogOpen = open)}
					onCreate={handleCreateDocument}
					{existingDocumentNames}
				>
					{#snippet triggerContent()}
						<SidebarButtonSlot
							icon={Plus}
							label="New Document"
							{isExpanded}
							ariaLabel="Create new document"
						/>
					{/snippet}
				</NewDocumentDialog>
			</div>

			{#if documentStore.documents.length > 0 && isExpanded}
				<!-- Scrollable Recent Items -->
				<div
					class="space-y-px overflow-x-hidden overflow-y-auto px-1 pt-1"
					style="max-height: calc(100dvh - 300px);"
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
			<BasePopover bind:open={loginPopoverOpen} side="right" align="start" title="Sign in">
				{#snippet trigger()}
					<SidebarButtonSlot
						icon={LogIn}
						label="Sign in to sync"
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
			<BasePopover
				bind:open={profilePopoverOpen}
				side="right"
				align="start"
				title="Account Information"
			>
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
					<div class="w-72 px-4">
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
		<BasePopover bind:open={popoverOpen} side="right" align="end" title="Settings">
			{#snippet trigger()}
				<SidebarButtonSlot
					icon={Settings}
					label="Settings"
					{isExpanded}
					ariaLabel="Open settings"
				/>
			{/snippet}
			{#snippet content()}
				<div class="w-64 px-4">
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
			{/snippet}
		</BasePopover>
	</div>
</aside>

<style>
	/* Sidebar base styles */
	.sidebar {
		box-shadow: none;
		transition:
			width 300ms cubic-bezier(0.165, 0.85, 0.45, 1),
			box-shadow 300ms cubic-bezier(0.165, 0.85, 0.45, 1);
	}

	/* Desktop mode: relative positioning, pushes layout */
	.sidebar-desktop {
		position: relative;
		z-index: var(--z-canvas-ui, 10);
	}

	/* Mobile mode: fixed positioning, overlays content */
	.sidebar-mobile {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		z-index: var(--z-sidebar, 50);
	}

	/* Expanded state shadow (only on mobile overlay mode) */
	.sidebar-mobile.sidebar-expanded {
		box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
	}

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

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.sidebar {
			transition-duration: 0.01ms !important;
		}
	}
</style>
