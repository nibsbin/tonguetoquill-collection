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
	   - Symmetric 4px padding on all sides (top, right, bottom, left)
	   - Creates 40px × 40px space for button
	   - Expands horizontally when sidebar expands, vertical stays 48px

	2. Button Element (40px × 40px in collapsed, full width when expanded)
	   - Always has 8px padding on all sides (NEVER changes)
	   - Content area: 24px × 24px (perfect fit for icon)
	   - Always uses flex-start justification (NEVER changes)
	   - Only width changes between states, height stays 40px

	3. Icon Element (24px × 24px)
	   - ALWAYS positioned at 12px from all edges (4px slot + 8px button)
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
	 * - Slot container: 48px square with consistent 4px padding on all sides
	 * - Button: 40px square (collapsed), always has 8px padding on all sides
	 * - Icon: 24px square, always at 12px from edges (4px slot + 8px button)
	 *
	 * Math (same for both horizontal and vertical):
	 * - Slot: 48px total
	 * - Slot padding: 4px (top, right, bottom, left - all symmetric)
	 * - Button: 40px with 8px padding all around
	 * - Content area: 40px - 16px = 24px (exact icon size)
	 * - Icon position: 4px (slot) + 8px (button) = 12px from any edge
	 *
	 * This position is IDENTICAL in both collapsed and expanded states.
	 * Vertical and horizontal spacing is completely symmetric.
	 */

	/* Layer 1: Button Slot Container */
	:global(.sidebar-button-slot) {
		height: var(--sidebar-slot-height); /* 48px */
		box-sizing: border-box;

		/* Flexbox for button layout */
		display: flex;
		align-items: center;
		justify-content: flex-start;

		/* Symmetric padding on all sides: 4px + 40px + 4px = 48px */
		padding: var(--sidebar-button-spacing); /* 4px all around */

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
