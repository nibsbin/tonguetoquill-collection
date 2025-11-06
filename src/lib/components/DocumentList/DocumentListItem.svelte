<script lang="ts">
	import { FileText, Trash2 } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';

	type DocumentListItemProps = {
		document: {
			id: string;
			name: string;
		};
		isActive: boolean;
		onSelect: (id: string) => void;
		onDelete: (id: string) => void;
	};

	let { document, isActive, onSelect, onDelete }: DocumentListItemProps = $props();

	function handleSelect() {
		onSelect(document.id);
	}

	function handleDelete(e: MouseEvent) {
		e.stopPropagation();
		onDelete(document.id);
	}
</script>

<div
	class="group flex h-8 items-center gap-1 rounded pr-2 transition-transform {isActive
		? 'bg-accent active:scale-100'
		: 'hover:bg-accent/50 active:scale-[0.985]'}"
>
	<Button
		variant="ghost"
		class="flex-1 justify-start gap-2 overflow-hidden p-2 text-xs transition-colors hover:bg-transparent {isActive
			? 'font-medium text-foreground'
			: 'text-muted-foreground hover:text-foreground'}"
		onclick={handleSelect}
	>
		<FileText class="sidebar-icon sidebar-icon-small" />
		<span class="truncate transition-opacity duration-300">
			{document.name}
		</span>
	</Button>
	<Button
		variant="ghost"
		size="icon"
		class="h-5 w-5 shrink-0 p-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-transparent hover:text-red-400 active:scale-95"
		onclick={handleDelete}
		aria-label="Delete {document.name}"
	>
		<Trash2 class="h-5 w-5" />
	</Button>
</div>
