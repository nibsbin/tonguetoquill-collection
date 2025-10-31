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
		ChevronDown
	} from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Separator from '$lib/components/ui/separator.svelte';

	type EditorToolbarProps = {
		onFormat: (type: string) => void;
		isDirty?: boolean;
		onManualSave?: () => void;
	};

	let { onFormat, isDirty = false, onManualSave }: EditorToolbarProps = $props();
</script>

<div
	class="flex min-h-11 items-center justify-between gap-1 border-b border-border bg-surface-elevated px-2 match-height"
>
	<div class="flex items-center gap-1">
		<!-- Frontmatter Toggle Button (stub) -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('toggleFrontmatter')}
			title="Toggle Frontmatter"
		>
			{#snippet children()}
				<ChevronDown class="h-4 w-4" />
			{/snippet}
		</Button>

		<Separator orientation="vertical" class="mx-1 h-5 bg-accent" />

		<!-- Bold -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('bold')}
			title="Bold"
		>
			{#snippet children()}
				<Bold class="h-4 w-4" />
			{/snippet}
		</Button>

		<!-- Italic -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('italic')}
			title="Italic"
		>
			{#snippet children()}
				<Italic class="h-4 w-4" />
			{/snippet}
		</Button>

		<!-- Strikethrough -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('strikethrough')}
			title="Strikethrough"
		>
			{#snippet children()}
				<Strikethrough class="h-4 w-4" />
			{/snippet}
		</Button>

		<!-- Code (inline) -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('code')}
			title="Inline Code"
		>
			{#snippet children()}
				<Code class="h-4 w-4" />
			{/snippet}
		</Button>

		<!-- Hyperlink -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('link')}
			title="Hyperlink"
		>
			{#snippet children()}
				<Link class="h-4 w-4" />
			{/snippet}
		</Button>

		<Separator orientation="vertical" class="mx-1 h-5 bg-accent" />

		<!-- Numbered List -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('numberedList')}
			title="Numbered List"
		>
			{#snippet children()}
				<ListOrdered class="h-4 w-4" />
			{/snippet}
		</Button>

		<!-- Bullet List -->
		<Button
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
			onclick={() => onFormat('bulletList')}
			title="Bullet List"
		>
			{#snippet children()}
				<List class="h-4 w-4" />
			{/snippet}
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
				{#snippet children()}
					<Save class="h-4 w-4" />
					{#if isDirty}
						<span class="text-xs">*</span>
					{/if}
				{/snippet}
			</Button>
		</div>
	{/if}
</div>

<style>
.match-height{
	height: 51px!important;
}
</style>