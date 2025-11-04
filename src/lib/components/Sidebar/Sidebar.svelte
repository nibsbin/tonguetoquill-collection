<script lang="ts">
	import { Menu, Settings, Plus, LogIn, User } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { SidebarButtonSlot } from '$lib/components/Sidebar';
	import { DocumentListItem } from '$lib/components/DocumentList';
	import Separator from '$lib/components/ui/separator.svelte';
	import Popover from '$lib/components/ui/popover.svelte';
	import PopoverTrigger from '$lib/components/ui/popover-trigger.svelte';
	import PopoverContent from '$lib/components/ui/popover-content.svelte';
	import Switch from '$lib/components/ui/switch.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Sheet from '$lib/components/ui/sheet.svelte';
	import SheetTrigger from '$lib/components/ui/sheet-trigger.svelte';
	import SheetContent from '$lib/components/ui/sheet-content.svelte';
	import { Root as Dialog } from '$lib/components/ui/dialog.svelte';
	import DialogContent from '$lib/components/ui/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog-title.svelte';
	import DialogDescription from '$lib/components/ui/dialog-description.svelte';
	import DialogFooter from '$lib/components/ui/dialog-footer.svelte';
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
	let mobileSheetOpen = $state(false);
	let isMobile = $state(false);
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

	function handleSignIn() {
		loginClient.initiateLogin();
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

<!-- Note: the main sidebar content is rendered inside the mobile Sheet or the desktop sidebar below
	 to avoid duplicating DOM and to ensure layout matches the selected container. -->
{#if isMobile}
	<!-- Mobile Sheet -->
	<div>
		<Sheet bind:open={mobileSheetOpen}>
			<SheetTrigger>
				<Button
					variant="ghost"
					size="icon"
					class="fixed top-2 left-2 z-40 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
				>
					<Menu class="h-5 w-5" />
				</Button>
			</SheetTrigger>
			<SheetContent side="left" class="flex w-72 flex-col bg-background p-0 text-foreground">
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
						class="pointer-events-none absolute right-0 left-0 text-center font-mono text-lg whitespace-nowrap text-foreground italic transition-opacity duration-300 {isExpanded
							? 'opacity-100'
							: 'opacity-0'}"
					>
						Tonguetoquill
					</span>
				</div>

				<!-- Separator directly after hamburger/title so top border aligns with TopMenu -->
				<Separator class="bg-border" />

				<!-- Menu Items -->
				<div class="flex-1 overflow-hidden">
					<div>
						<SidebarButtonSlot
							icon={Plus}
							label="New Document"
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

							<!-- Scrollable Recent Items -->
							<div
								class="overflow-x-hidden overflow-y-auto px-1 pt-1"
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
				<div class="space-y-1 border-t border-border">
					<!-- Sign-In Button (Guest Mode) -->
					{#if !user}
						<SidebarButtonSlot
							icon={LogIn}
							label="Sign in"
							{isExpanded}
							class="w-full justify-start overflow-hidden text-sm text-muted-foreground hover:bg-accent hover:text-foreground active:scale-[0.985]"
							onclick={handleSignIn}
							ariaLabel="Sign in to your account"
						/>
					{/if}

					<!-- User Profile Button (Logged-in Mode) -->
					{#if user}
						<SidebarButtonSlot
							icon={User}
							label={user.email}
							{isExpanded}
							class="w-full justify-start overflow-hidden text-sm text-muted-foreground hover:bg-accent hover:text-foreground active:scale-[0.985]"
							title={user.email}
							onclick={handleProfileClick}
							ariaLabel="User profile: {user.email}"
						/>
					{/if}

					<!-- Settings Gear Button -->
					<div class="sidebar-button-slot">
						<Popover bind:open={popoverOpen}>
							<PopoverTrigger
								class="sidebar-slot-button {isExpanded
									? 'sidebar-slot-button-full'
									: ''} inline-flex items-center overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-muted-foreground transition-transform hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
							>
								<Settings class="sidebar-icon" />
								{#if isExpanded}
									<span>Settings</span>
								{/if}
							</PopoverTrigger>
							<PopoverContent
								side="right"
								align="end"
								class="w-64 border-border bg-surface-elevated p-0 text-foreground"
							>
								<div class="p-4">
									<h3 class="mb-4 text-lg font-semibold">Settings</h3>

									<div class="space-y-4">
										<div class="flex items-center justify-between">
											<Label for="dark-mode" class="text-foreground/80">Dark Mode</Label>
											<Switch
												id="dark-mode"
												bind:checked={isDarkMode}
												onCheckedChange={handleDarkModeChange}
											/>
										</div>

										<Separator class="my-3 bg-border" />

										<div class="flex items-center justify-between">
											<Label for="auto-save" class="text-foreground/80">Auto-save</Label>
											<Switch
												id="auto-save"
												bind:checked={autoSave}
												onCheckedChange={handleAutoSaveChange}
											/>
										</div>

										<div class="flex items-center justify-between">
											<Label for="line-numbers" class="text-foreground/80">Line Numbers</Label>
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
			</SheetContent>
		</Sheet>
	</div>
{:else}
	<!-- Desktop Sidebar -->
	<div
		class="flex h-screen flex-col overflow-hidden border-r border-border bg-background text-foreground transition-all duration-300"
		style="width: {isExpanded
			? 'var(--sidebar-expanded-width)'
			: 'var(--sidebar-collapsed-width)'}; transition-timing-function: cubic-bezier(0.165, 0.85, 0.45, 1);"
	>
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
				class="pointer-events-none absolute right-0 left-0 text-center font-mono text-lg whitespace-nowrap text-foreground italic transition-opacity duration-300 {isExpanded
					? 'opacity-100'
					: 'opacity-0'}"
			>
				Tonguetoquill
			</span>
		</div>

		<!-- Separator directly after hamburger/title so top border aligns with TopMenu -->
		<Separator class="bg-border" />

		<!-- Menu Items -->
		<div class="flex-1 overflow-hidden">
			<div>
				<SidebarButtonSlot
					icon={Plus}
					label="New Document"
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

					<!-- Scrollable Recent Items -->
					<div
						class="overflow-x-hidden overflow-y-auto px-1 pt-1"
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
		<div class="space-y-1 border-t border-border">
			<!-- Sign-In Button (Guest Mode) -->
			{#if !user}
				<SidebarButtonSlot
					icon={LogIn}
					label="Sign in"
					{isExpanded}
					class="w-full justify-start overflow-hidden text-sm text-muted-foreground hover:bg-accent hover:text-foreground active:scale-[0.985]"
					onclick={handleSignIn}
					ariaLabel="Sign in to your account"
				/>
			{/if}

			<!-- User Profile Button (Logged-in Mode) -->
			{#if user}
				<SidebarButtonSlot
					icon={User}
					label={user.email}
					{isExpanded}
					class="w-full justify-start overflow-hidden text-sm text-muted-foreground hover:bg-accent hover:text-foreground active:scale-[0.985]"
					title={user.email}
					onclick={handleProfileClick}
					ariaLabel="User profile: {user.email}"
				/>
			{/if}

			<!-- Settings Gear Button -->
			<div class="sidebar-button-slot">
				<Popover bind:open={popoverOpen}>
					<PopoverTrigger
						class="sidebar-slot-button {isExpanded
							? 'sidebar-slot-button-full'
							: ''} inline-flex items-center overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-muted-foreground transition-transform hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
					>
						<Settings class="sidebar-icon" />
						{#if isExpanded}
							<span>Settings</span>
						{/if}
					</PopoverTrigger>
					<PopoverContent
						side="right"
						align="end"
						class="w-64 border-border bg-surface-elevated p-0 text-foreground"
					>
						<div class="p-4">
							<h3 class="mb-4 text-lg font-semibold">Settings</h3>

							<div class="space-y-4">
								<div class="flex items-center justify-between">
									<Label for="dark-mode" class="text-foreground/80">Dark Mode</Label>
									<Switch
										id="dark-mode"
										bind:checked={isDarkMode}
										onCheckedChange={handleDarkModeChange}
									/>
								</div>

								<Separator class="my-3 bg-border" />

								<div class="flex items-center justify-between">
									<Label for="auto-save" class="text-foreground/80">Auto-save</Label>
									<Switch
										id="auto-save"
										bind:checked={autoSave}
										onCheckedChange={handleAutoSaveChange}
									/>
								</div>

								<div class="flex items-center justify-between">
									<Label for="line-numbers" class="text-foreground/80">Line Numbers</Label>
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
	</div>
{/if}

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
