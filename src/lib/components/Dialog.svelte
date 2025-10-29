<script lang="ts">
	interface Props {
		open?: boolean;
		title: string;
		description?: string;
		onClose: () => void;
		children?: import('svelte').Snippet;
	}

	let { open = false, title, description, onClose, children }: Props = $props();

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			onClose();
		}
	}

	$effect(() => {
		if (open) {
			document.addEventListener('keydown', handleKeydown);
			return () => document.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
		tabindex="-1"
		onclick={handleBackdropClick}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	>
		<div
			class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
			onclick={(e) => e.stopPropagation()}
		>
			<h2 id="dialog-title" class="mb-2 text-xl font-semibold text-zinc-900">
				{title}
			</h2>

			{#if description}
				<p class="mb-4 text-sm text-zinc-600">
					{description}
				</p>
			{/if}

			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>
{/if}
