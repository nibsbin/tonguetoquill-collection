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
	let error = $state<string | null>(null);

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onOpenChange(false);
		}
	}

	function handleClose() {
		onOpenChange(false);
		error = null;
		// Reset file input
		if (fileInput) {
			fileInput.value = '';
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		// Validate file type
		const validTypes = ['.md', '.txt', '.markdown'];
		const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

		if (!validTypes.includes(fileExtension) && !file.type.startsWith('text/')) {
			error = 'Please select a plaintext file (.md, .txt, etc.)';
			return;
		}

		error = null;

		// Immediately read and import the file
		const reader = new FileReader();

		reader.onload = (e) => {
			const content = e.target?.result as string;
			if (content !== null && content !== undefined) {
				onImport(content, file.name);
				handleClose();
			}
		};

		reader.onerror = () => {
			error = 'Failed to read file. Please try again.';
		};

		reader.readAsText(file);
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
					<p class="text-sm text-neutral-600 dark:text-neutral-400">Click to select a file</p>
					<p class="mt-1 text-xs text-neutral-500 dark:text-neutral-500">or drag and drop</p>
				</div>

				<!-- Error message -->
				{#if error}
					<p class="text-sm text-red-600 dark:text-red-400">
						{error}
					</p>
				{/if}
			</div>
		</div>
	</div>
{/if}
