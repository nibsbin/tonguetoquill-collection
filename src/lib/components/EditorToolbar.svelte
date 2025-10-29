<script lang="ts">
	import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Link } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Separator from '$lib/components/ui/separator.svelte';

	type EditorToolbarProps = {
		onFormat: (type: string) => void;
	};

	let { onFormat }: EditorToolbarProps = $props();
</script>

<div class="flex h-12 items-center justify-between gap-1 border-b border-zinc-700 bg-zinc-800 px-2">
	<div class="flex items-center gap-1">
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
			onclick={() => onFormat('bold')}
			title="Bold"
		>
			{#snippet children()}
				<Bold class="h-4 w-4" />
			{/snippet}
		</Button>

		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
			onclick={() => onFormat('italic')}
			title="Italic"
		>
			{#snippet children()}
				<Italic class="h-4 w-4" />
			{/snippet}
		</Button>

		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
			onclick={() => onFormat('strikethrough')}
			title="Strikethrough"
		>
			{#snippet children()}
				<Strikethrough class="h-4 w-4" />
			{/snippet}
		</Button>

		<Separator orientation="vertical" class="mx-1 h-5 bg-zinc-700" />

		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
			onclick={() => onFormat('code')}
			title="Code"
		>
			{#snippet children()}
				<Code class="h-4 w-4" />
			{/snippet}
		</Button>

		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
			onclick={() => onFormat('quote')}
			title="Quote"
		>
			{#snippet children()}
				<Quote class="h-4 w-4" />
			{/snippet}
		</Button>

		<Separator orientation="vertical" class="mx-1 h-5 bg-zinc-700" />

		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
			onclick={() => onFormat('bulletList')}
			title="Bullet List"
		>
			{#snippet children()}
				<List class="h-4 w-4" />
			{/snippet}
		</Button>

		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
			onclick={() => onFormat('numberedList')}
			title="Numbered List"
		>
			{#snippet children()}
				<ListOrdered class="h-4 w-4" />
			{/snippet}
		</Button>

		<Separator orientation="vertical" class="mx-1 h-5 bg-zinc-700" />

		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
			onclick={() => onFormat('link')}
			title="Link"
		>
			{#snippet children()}
				<Link class="h-4 w-4" />
			{/snippet}
		</Button>
	</div>
</div>
