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
	   - Provides 4px horizontal padding for button positioning
	   - Vertically centers the button via flexbox
	   - Expands horizontally when sidebar expands

	2. Button Element (40px × 40px in collapsed, full width when expanded)
	   - Always has 8px padding on all sides (NEVER changes)
	   - Content area: 24px × 24px (perfect fit for icon)
	   - Always uses flex-start justification (NEVER changes)
	   - Only width changes between states

	3. Icon Element (24px × 24px)
	   - ALWAYS positioned at 12px from left edge (4px + 8px)
	   - Position is identical in collapsed and expanded states
	   - Label text fades in/out with opacity transition
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
	/*
	 * Clean Button Slot Architecture
	 * ==============================
	 *
	 * Goal: Icons must NEVER move between collapsed/expanded states
	 *
	 * Layout structure:
	 * - Slot container: 48px square (collapsed), provides positioning
	 * - Button: 40px square (collapsed), always has 8px padding
	 * - Icon: 24px square, always at 12px from left edge (4px + 8px)
	 *
	 * Math:
	 * - Slot padding: 4px left + 4px right = 8px horizontal
	 * - Button: 40px wide, 8px padding all around
	 * - Content area: 40px - 16px padding = 24px (perfect for icon)
	 * - Icon position: 4px (slot) + 8px (button) = 12px from left edge
	 *
	 * This position is IDENTICAL in both collapsed and expanded states.
	 */

	/* Layer 1: Button Slot Container */
	:global(.sidebar-button-slot) {
		height: var(--sidebar-slot-height); /* 48px */
		box-sizing: border-box;

		/* Flexbox: centers 40px button vertically in 48px slot */
		display: flex;
		align-items: center;
		justify-content: flex-start;

		/* Horizontal padding positions the button */
		padding-left: var(--sidebar-button-spacing); /* 4px */
		padding-right: var(--sidebar-button-spacing); /* 4px */
		/* No vertical padding - button centered via align-items */

		flex-shrink: 0;
		overflow: hidden; /* Clips label text in collapsed state */
	}

	/* Layer 2: Button Element */
	:global(.sidebar-slot-button) {
		/*
		 * Button: 40px × 40px with 8px padding all around
		 * Content area: 24px × 24px (exact icon size)
		 * Total: 8px + 24px + 8px = 40px ✓
		 */
		width: var(--sidebar-button-size); /* 40px */
		height: var(--sidebar-button-size); /* 40px */
		min-width: var(--sidebar-button-size);

		/* Flexbox for icon + label layout */
		display: inline-flex;
		align-items: center;
		justify-content: flex-start; /* Left-align content */

		/* 8px padding ensures icon is always at same position */
		padding: var(--sidebar-padding); /* 8px all around */

		flex-shrink: 0;
		transition: none;
	}

	/* Expanded state: button stretches to full width */
	:global(.sidebar-slot-button-full) {
		width: 100%;
		/* Padding stays the same - icon position unchanged */
	}

	/* Layer 3: Icon Element (handled by global .sidebar-icon in Sidebar.svelte) */
</style>
