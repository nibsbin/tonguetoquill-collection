<script lang="ts">
	import {
		Bold,
		Italic,
		Strikethrough,
		Code,
		List,
		ListOrdered,
		Link,
		Save,
		ListCollapse
	} from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';

	type EditorToolbarProps = {
		onFormat: (type: string) => void;
		isDirty?: boolean;
		onManualSave?: () => void;
	};

	let { onFormat, isDirty = false, onManualSave }: EditorToolbarProps = $props();
</script>

<div
	class="match-height flex min-h-11 items-center justify-between gap-1 border-b border-border bg-surface-elevated px-2"
>
	<div class="flex items-center gap-1">
		<!-- Toggle Metadata Blocks Button -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('toggleFrontmatter')}
			title="Toggle All Metadata"
		>
			<ListCollapse class="h-4 w-4" />
		</Button>

		<!-- Bold -->
		<Button
			variant="ghost"
			size="sm"
			class="ml-1 h-7 w-7 rounded-l-none border-l border-border p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('bold')}
			title="Bold"
		>
			<Bold class="h-4 w-4" />
		</Button>

		<!-- Italic -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('italic')}
			title="Italic"
		>
			<Italic class="h-4 w-4" />
		</Button>

		<!-- Strikethrough -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('strikethrough')}
			title="Strikethrough"
		>
			<Strikethrough class="h-4 w-4" />
		</Button>

		<!-- Code (inline) -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('code')}
			title="Inline Code"
		>
			<Code class="h-4 w-4" />
		</Button>

		<!-- Hyperlink -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('link')}
			title="Hyperlink"
		>
			<Link class="h-4 w-4" />
		</Button>

		<!-- Numbered List -->
		<Button
			variant="ghost"
			size="sm"
			class="ml-1 h-7 w-7 rounded-l-none border-l border-border p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('numberedList')}
			title="Numbered List"
		>
			<ListOrdered class="h-4 w-4" />
		</Button>

		<!-- Bullet List -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('bulletList')}
			title="Bullet List"
		>
			<List class="h-4 w-4" />
		</Button>
	</div>

	<!-- Manual Save Button (right side) -->
	{#if onManualSave}
		<div class="flex items-center gap-1">
			<Button
				variant="ghost"
				size="sm"
				class="h-7 gap-1 px-2 text-muted-foreground hover:bg-accent hover:text-foreground {isDirty
					? 'text-blue-400'
					: ''}"
				onclick={onManualSave}
				title="Save"
				disabled={!isDirty}
			>
				<Save class="h-4 w-4" />
				{#if isDirty}
					<span class="text-xs">*</span>
				{/if}
			</Button>
		</div>
	{/if}
</div>

<style>
	.match-height {
		height: 51px !important;
	}
</style>
