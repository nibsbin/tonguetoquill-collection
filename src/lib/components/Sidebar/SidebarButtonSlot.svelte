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
	   expands horizontally when sidebar expands, clips button content
	2. Button Element: Always full width of available space, content clipped by container
	3. Icon Element: Square of --sidebar-icon-size, followed by label text
-->
<div class="sidebar-button-slot">
	<Button
		{variant}
		size="icon"
		class="sidebar-slot-button {className}"
		{onclick}
		aria-label={ariaLabel}
		{title}
		{disabled}
	>
		{#snippet children()}
			{@const Icon = icon}
			<Icon class="sidebar-icon" />
			{#if label}
				<span
					class="truncate transition-opacity duration-300 {isExpanded
						? 'opacity-100'
						: 'opacity-0'}">{label}</span
				>
			{/if}
		{/snippet}
	</Button>
</div>

<style>
	/* Layer 1: Button Slot Container */
	:global(.sidebar-button-slot) {
		/* Square in collapsed state, expands horizontally when sidebar expands */
		height: var(--sidebar-slot-height);
		/* Include padding in the height calculation so slot height aligns with top menu */
		box-sizing: border-box;
		/* Flexbox for alignment */
		display: flex;
		align-items: center;
		justify-content: flex-start;
		/* Fixed left padding to keep button visually centered in collapsed state */
		padding-left: var(--sidebar-button-spacing);
		/* Top/bottom padding */
		padding-top: var(--sidebar-padding);
		padding-bottom: var(--sidebar-padding);
		/* Right padding matches left for symmetry */
		padding-right: var(--sidebar-button-spacing);
		/* Prevent shrinking */
		flex-shrink: 0;
		/* Overflow hidden to clip expanding button content */
		overflow: hidden;
	}

	/* Slightly reduced vertical padding for the very first slot (hamburger) to improve visual alignment */
	:global(.sidebar-button-slot:first-child) {
		padding-top: calc(var(--sidebar-padding));
		padding-bottom: calc(var(--sidebar-padding));
	}

	/* Layer 2: Button Element - always full width of available space */
	:global(.sidebar-slot-button) {
		/* Always full width - let container control clipping */
		width: 100%;
		height: var(--sidebar-button-size);
		/* Flexbox for centering icon */
		display: inline-flex;
		align-items: center;
		justify-content: flex-start;
		/* Prevent shrinking */
		flex-shrink: 0;
		/* No width transition - only opacity for label */
		transition: none;
		/* Padding for content */
		padding: var(--sidebar-padding);
	}

	/* Layer 3: Icon Element (handled by global .sidebar-icon in Sidebar.svelte) */
</style>
