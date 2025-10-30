<script lang="ts">
	import type { ComponentType } from 'svelte';
	import Button from '$lib/components/ui/button.svelte';

	type SidebarButtonSlotProps = {
		icon: ComponentType;
		label?: string;
		isExpanded: boolean;
		variant?: 'ghost' | 'default' | 'outline' | 'secondary' | 'destructive' | 'link';
		class?: string;
		onclick?: (event: MouseEvent) => void;
		ariaLabel?: string;
		title?: string;
		disabled?: boolean;
	};

	let {
		icon,
		label,
		isExpanded,
		variant = 'ghost',
		class: className = '',
		onclick,
		ariaLabel,
		title,
		disabled = false
	}: SidebarButtonSlotProps = $props();
</script>

<!-- 
	Button Slot Architecture (3 layers):
	1. Slot Container: Square of --sidebar-collapsed-width in collapsed state, 
	   expands horizontally when sidebar expands
	2. Button Element: Square of --sidebar-button-size when icon-only,
	   full width with padding when label is shown
	3. Icon Element: Square of --sidebar-icon-size, centered in button
-->
<div class="sidebar-button-slot">
	<Button
		{variant}
		size="icon"
		class="sidebar-slot-button {isExpanded && label ? 'sidebar-slot-button-full' : ''} {className}"
		{onclick}
		aria-label={ariaLabel}
		{title}
		{disabled}
	>
		{#snippet children()}
			{@const Icon = icon}
			<Icon class="sidebar-icon" />
			{#if isExpanded && label}
				<span class="truncate">{label}</span>
			{/if}
		{/snippet}
	</Button>
</div>

<style>
	/* Layer 1: Button Slot Container */
	:global(.sidebar-button-slot) {
		/* Square in collapsed state, expands horizontally when sidebar expands */
		height: var(--sidebar-slot-height);
		/* Flexbox for centering button */
		display: flex;
		align-items: center;
		justify-content: center;
		/* Consistent padding */
		padding: var(--sidebar-padding);
		/* Prevent shrinking */
		flex-shrink: 0;
	}

	/* Layer 2: Button Element (icon-only, square) */
	:global(.sidebar-slot-button) {
		/* Fixed square size */
		width: var(--sidebar-button-size);
		height: var(--sidebar-button-size);
		/* Flexbox for centering icon */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		/* Prevent shrinking */
		flex-shrink: 0;
		/* Smooth transitions */
		transition: all 300ms cubic-bezier(0.165, 0.85, 0.45, 1);
	}

	/* Layer 2: Button Element (with label, expands horizontally) */
	:global(.sidebar-slot-button-full) {
		/* Full width in expanded state */
		width: 100%;
		/* Left-aligned content */
		justify-content: flex-start;
		/* Maintain consistent padding */
		padding: var(--sidebar-padding);
	}

	/* Layer 3: Icon Element (handled by global .sidebar-icon in Sidebar.svelte) */
</style>
