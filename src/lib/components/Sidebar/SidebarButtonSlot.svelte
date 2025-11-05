<script lang="ts">
	import type { ComponentType, Snippet } from 'svelte';

	type SidebarButtonSlotProps = {
		icon?: ComponentType;
		label?: string;
		isExpanded: boolean;
		variant?: 'ghost' | 'default';
		onclick?: (event: MouseEvent) => void;
		ariaLabel?: string;
		title?: string;
		disabled?: boolean;
		children?: Snippet;
		asChild?: boolean; // When true, renders as div for use with PopoverTrigger
	};

	let {
		icon,
		label,
		isExpanded,
		variant = 'ghost',
		onclick,
		ariaLabel,
		title,
		disabled = false,
		children,
		asChild = false
	}: SidebarButtonSlotProps = $props();
</script>

{#if children}
	<!-- Custom content mode: Render snippet in slot container -->
	<div class="sidebar-button-slot">
		{@render children()}
	</div>
{:else if icon}
	{@const Icon = icon}
	{#if asChild}
		<!-- asChild mode: Render button directly without wrapper for PopoverTrigger -->
		<button
			class="sidebar-button-unwrapped {variant}"
			{onclick}
			aria-label={ariaLabel}
			{title}
			{disabled}
		>
			<Icon class="sidebar-icon" />
			{#if label}
				<span class="sidebar-label" class:visible={isExpanded}>{label}</span>
			{/if}
		</button>
	{:else}
		<!-- Standard mode: Button wrapped in slot for consistent sizing -->
		<div class="sidebar-button-slot">
			<button class="sidebar-button {variant}" {onclick} aria-label={ariaLabel} {title} {disabled}>
				<Icon class="sidebar-icon" />
				{#if label}
					<span class="sidebar-label" class:visible={isExpanded}>{label}</span>
				{/if}
			</button>
		</div>
	{/if}
{/if}

<style>
	/*
	 * SIMPLE SIDEBAR BUTTON SLOT ARCHITECTURE
	 * ========================================
	 *
	 * Goal: Every button slot is EXACTLY 48px tall (same as collapsed sidebar width)
	 *
	 * Structure:
	 * 1. .sidebar-button-slot: 48px × 48px container (no padding, no margins)
	 * 2. .sidebar-button: Button that fills the slot completely
	 * 3. Content: Icon (24px) + optional label, with internal spacing
	 */

	/* Container: Exact 48px square with 4px padding around button */
	.sidebar-button-slot {
		width: 100%;
		height: 48px;
		min-height: 48px;
		max-height: 48px;
		display: flex;
		margin: 0;
		padding: 0.25rem; /* 4px padding creates 40px × 40px button area */
		box-sizing: border-box;
		flex-shrink: 0;
	}

	/* Button/Content: Fills the 40px × 40px area inside padded slot */
	.sidebar-button {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
		padding: 0 0.5rem; /* Horizontal padding for content */
		margin: 0;
		border: none;
		background: transparent;
		color: inherit;
		font-family: inherit;
		font-size: 0.875rem; /* 14px */
		font-weight: 500;
		border-radius: 0.375rem; /* rounded-md for inset button */
		transition:
			background-color 0.2s,
			color 0.2s;
		box-sizing: border-box;
		overflow: hidden;
		white-space: nowrap;
	}

	/* Cursor only on interactive button elements */
	button.sidebar-button {
		cursor: pointer;
	}

	/* Unwrapped button: Used with PopoverTrigger asChild, includes slot sizing */
	.sidebar-button-unwrapped {
		width: 100%;
		height: 48px; /* Full slot height */
		min-height: 48px;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
		padding: 0.25rem; /* 4px padding around inner content */
		padding-left: calc(0.25rem + 0.5rem); /* 4px + 8px = 12px left */
		padding-right: calc(0.25rem + 0.5rem); /* 4px + 8px = 12px right */
		margin: 0;
		border: none;
		background: transparent;
		color: inherit;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.375rem;
		transition:
			background-color 0.2s,
			color 0.2s;
		box-sizing: border-box;
		overflow: hidden;
		white-space: nowrap;
		cursor: pointer;
	}

	/* Variant styles - apply to both wrapped and unwrapped */
	.sidebar-button.ghost,
	.sidebar-button-unwrapped.ghost {
		color: rgb(from var(--color-foreground) r g b / 0.7);
	}

	.sidebar-button.ghost:hover:not(:disabled),
	.sidebar-button-unwrapped.ghost:hover:not(:disabled) {
		background-color: var(--color-accent);
		color: var(--color-foreground);
	}

	button.sidebar-button:active:not(:disabled),
	button.sidebar-button-unwrapped:active:not(:disabled) {
		transform: scale(0.985);
	}

	button.sidebar-button:disabled,
	button.sidebar-button-unwrapped:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Icon: Fixed 24px size - apply to both wrapped and unwrapped */
	:global(.sidebar-button .sidebar-icon),
	:global(.sidebar-button-unwrapped .sidebar-icon) {
		width: 24px;
		height: 24px;
		flex-shrink: 0;
	}

	/* Label: Hidden in collapsed state */
	.sidebar-label {
		opacity: 0;
		transition: opacity 0.3s;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sidebar-label.visible {
		opacity: 1;
	}
</style>
