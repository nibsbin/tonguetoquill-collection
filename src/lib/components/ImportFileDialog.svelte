<script lang="ts">
	import { X, Upload } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onImport: (content: string, filename: string) => void;
	}

	let { open = $bindable(), onOpenChange, onImport }: Props = $props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let selectedFile = $state<File | null>(null);
	let error = $state<string | null>(null);

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onOpenChange(false);
		}
	}

	function handleClose() {
		onOpenChange(false);
		selectedFile = null;
		error = null;
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			// Validate file type
			const validTypes = ['.md', '.txt', '.markdown'];
			const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

			if (!validTypes.includes(fileExtension) && !file.type.startsWith('text/')) {
				error = 'Please select a plaintext file (.md, .txt, etc.)';
				selectedFile = null;
				return;
			}

			selectedFile = file;
			error = null;
		}
	}

	function handleImport() {
		if (!selectedFile) return;

		const reader = new FileReader();

		reader.onload = (e) => {
			const content = e.target?.result as string;
			if (content !== null && content !== undefined) {
				onImport(content, selectedFile!.name);
				handleClose();
			}
		};

		reader.onerror = () => {
			error = 'Failed to read file. Please try again.';
		};

		reader.readAsText(selectedFile);
	}

	function triggerFileInput() {
		fileInput?.click();
	}
</script>

{#if open}
	<div
		class="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
		onclick={handleBackdropClick}
		role="presentation"
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="import-dialog-title"
			tabindex="-1"
			class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-800"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.key === 'Escape' && handleClose()}
		>
			<!-- Header -->
			<div class="mb-4 flex items-center justify-between">
				<h2
					id="import-dialog-title"
					class="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
				>
					Import File
				</h2>
				<Button
					variant="ghost"
					size="icon"
					onclick={handleClose}
					aria-label="Close dialog"
					class="h-8 w-8"
				>
					<X class="h-4 w-4" />
				</Button>
			</div>

			<!-- Content -->
			<div class="space-y-4">
				<p class="text-sm text-neutral-600 dark:text-neutral-400">
					Select a plaintext file (.md, .txt) to import. This will replace the current editor
					content.
				</p>

				<!-- Hidden file input -->
				<input
					bind:this={fileInput}
					type="file"
					accept=".md,.txt,.markdown,text/plain,text/markdown"
					onchange={handleFileSelect}
					class="hidden"
					aria-label="File input"
				/>

				<!-- File selection area -->
				<div
					class="cursor-pointer rounded-lg border-2 border-dashed border-neutral-300 p-6 text-center transition-colors hover:border-neutral-400 dark:border-neutral-600 dark:hover:border-neutral-500"
					onclick={triggerFileInput}
					role="button"
					tabindex={0}
					onkeydown={(e) => e.key === 'Enter' && triggerFileInput()}
				>
					<Upload class="mx-auto mb-2 h-8 w-8 text-neutral-400 dark:text-neutral-500" />
					{#if selectedFile}
						<p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
							{selectedFile.name}
						</p>
						<p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
							{(selectedFile.size / 1024).toFixed(2)} KB
						</p>
					{:else}
						<p class="text-sm text-neutral-600 dark:text-neutral-400">Click to select a file</p>
						<p class="mt-1 text-xs text-neutral-500 dark:text-neutral-500">or drag and drop</p>
					{/if}
				</div>

				<!-- Error message -->
				{#if error}
					<p class="text-sm text-red-600 dark:text-red-400">
						{error}
					</p>
				{/if}
			</div>

			<!-- Actions -->
			<div class="mt-6 flex justify-end gap-2">
				<Button variant="outline" onclick={handleClose}>Cancel</Button>
				<Button
					onclick={handleImport}
					disabled={!selectedFile}
					class="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
				>
					Import
				</Button>
			</div>
		</div>
	</div>
{/if}
