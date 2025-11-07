<script lang="ts">
	import { fade } from 'svelte/transition';

	type SidebarBackdropProps = {
		visible?: boolean;
		onClick?: () => void;
	};

	let { visible = false, onClick }: SidebarBackdropProps = $props();

	function handleClick() {
		onClick?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClick?.();
		}
	}
</script>

{#if visible}
	<div
		class="sidebar-backdrop"
		onclick={handleClick}
		onkeydown={handleKeyDown}
		transition:fade={{ duration: 200 }}
		aria-hidden="true"
		role="presentation"
	></div>
{/if}

<style>
	.sidebar-backdrop {
		position: fixed;
		top: 0;
		left: 48px;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.4);
		z-index: var(--z-sidebar-backdrop, 40);
		cursor: pointer;
		transition: opacity 200ms cubic-bezier(0.165, 0.85, 0.45, 1);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.sidebar-backdrop {
			transition-duration: 0.01ms !important;
		}
	}
</style>
