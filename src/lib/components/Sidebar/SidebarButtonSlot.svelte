<script lang="ts">
	import type { ComponentType } from 'svelte';
	import Button from '$lib/components/ui/button.svelte';

	type SidebarButtonSlotProps = {
		icon: ComponentType;
		label?: string;
		isExpanded: boolean;
		variant?: 'ghost' | 'default' | 'outline';
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

	1. Slot Container (48px × 48px in collapsed state)
	   - Provides 4px horizontal padding to center the 40px button
	   - No vertical padding - button fills height via flexbox
	   - Expands horizontally when sidebar expands

	2. Button Element (40px × 40px)
	   - Square in collapsed state, centered in slot
	   - Expands to full width with padding in expanded state
	   - No internal padding in collapsed state

	3. Icon Element (24px × 24px)
	   - Fixed size icon, followed by label text
	   - Label has opacity transition for expand/collapse
-->
<div class="sidebar-button-slot">
	<Button
		{variant}
		size="icon"
		class="sidebar-slot-button {isExpanded ? 'sidebar-slot-button-full' : ''} {className}"
		{onclick}
		aria-label={ariaLabel}
		{title}
		{disabled}
	>
		{@const Icon = icon}
		<Icon class="sidebar-icon" />
		{#if label}
			<span
				class="truncate transition-opacity duration-300 {isExpanded ? 'opacity-100' : 'opacity-0'}"
				>{label}</span
			>
		{/if}
	</Button>
</div>

<style>
	/* Layer 1: Button Slot Container */
	:global(.sidebar-button-slot) {
		/*
		 * Slot sizing: 48px square in collapsed state
		 * Calculation: 40px button + 4px padding on each side = 48px total
		 */
		height: var(--sidebar-slot-height);
		box-sizing: border-box;

		/* Flexbox centering - centers the 40px button within 48px slot */
		display: flex;
		align-items: center;
		justify-content: flex-start;

		/*
		 * Horizontal padding only - centers 40px button in 48px width
		 * --sidebar-button-spacing = (48px - 40px) / 2 = 4px
		 */
		padding-left: var(--sidebar-button-spacing);
		padding-right: var(--sidebar-button-spacing);

		/* No vertical padding - button fills the vertical space via flexbox alignment */

		flex-shrink: 0;
		overflow: hidden; /* Clips expanding content in collapsed state */
	}

	/* Layer 2: Button Element - sized to fit perfectly in slot */
	:global(.sidebar-slot-button) {
		/*
		 * Button sizing: 40px × 40px square
		 * Fits perfectly in 48px slot with 4px padding on each side
		 */
		width: var(--sidebar-button-size);
		height: var(--sidebar-button-size);
		min-width: var(--sidebar-button-size);

		/* Flexbox for icon and label layout */
		display: inline-flex;
		align-items: center;
		justify-content: center;

		flex-shrink: 0;
		transition: none;

		/* No padding - icon size and spacing handled by --sidebar-icon-size */
		padding: 0;
	}

	/* Expanded state - button takes full width when sidebar expands */
	:global(.sidebar-slot-button-full) {
		width: 100%;
		justify-content: flex-start;
		padding-left: var(--sidebar-padding);
		padding-right: var(--sidebar-padding);
	}

	/* Layer 3: Icon Element (handled by global .sidebar-icon in Sidebar.svelte) */
</style>
