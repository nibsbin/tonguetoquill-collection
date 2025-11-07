<script lang="ts">
	import type { TemplateMetadata } from '$lib/services/templates/types';
	import Tooltip from '$lib/components/ui/tooltip.svelte';
	import { Info, Check } from 'lucide-svelte';
	import { cn } from '$lib/utils/cn';

	interface TemplateSelectorProps {
		/** List of available templates */
		templates: TemplateMetadata[];

		/** Currently selected template file */
		selectedTemplate: string;

		/** Template selection callback */
		onTemplateChange: (file: string) => void;

		/** Disable selector */
		disabled?: boolean;

		/** Additional CSS classes */
		class?: string;
	}

	let {
		templates,
		selectedTemplate = $bindable(),
		onTemplateChange,
		disabled = false,
		class: className
	}: TemplateSelectorProps = $props();

	// Handle template selection
	function handleTemplateClick(template: TemplateMetadata) {
		if (disabled) return;
		selectedTemplate = template.file;
		onTemplateChange(template.file);
	}
</script>

<!-- Static scrollable container for templates -->
<div
	class={cn(
		'overflow-y-auto rounded-md border border-border bg-surface-elevated shadow-sm',
		className
	)}
	style="max-height: 300px;"
	role="listbox"
	aria-label="Template selection"
>
	<div class="py-1">
		{#each templates as template (template.file)}
			{@const isSelected = template.file === selectedTemplate}
			<div
				role="option"
				aria-selected={isSelected}
				class={cn(
					'flex h-10 w-full items-center justify-between gap-2 px-3 text-sm transition-colors',
					isSelected
						? 'bg-accent text-accent-foreground'
						: 'hover:bg-accent/50 hover:text-accent-foreground',
					disabled && 'opacity-50'
				)}
			>
				<button
					type="button"
					onclick={() => handleTemplateClick(template)}
					{disabled}
					class="flex min-w-0 flex-1 items-center gap-2 text-left"
				>
					{#if isSelected}
						<Check class="h-4 w-4 shrink-0 text-primary" />
					{:else}
						<div class="h-4 w-4 shrink-0"></div>
					{/if}
					<span class="truncate">{template.name}</span>
				</button>
				<Tooltip content={template.description} position="left" delay={300}>
					{#snippet children()}
						<button
							type="button"
							class="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-background/10"
							onclick={(e) => {
								// Info button - does not trigger template selection
								e.stopPropagation();
							}}
							aria-label="Show description for {template.name} template"
							{disabled}
						>
							<Info class="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
						</button>
					{/snippet}
				</Tooltip>
			</div>
		{/each}
	</div>
</div>
