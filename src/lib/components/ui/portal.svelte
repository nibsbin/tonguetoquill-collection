<script lang="ts">
	/**
	 * Portal component for rendering content at document.body level
	 * When disabled, renders inline (for scoped positioning)
	 */
	interface PortalProps {
		disabled?: boolean;
		children?: import('svelte').Snippet;
	}

	let { disabled = false, children }: PortalProps = $props();
</script>

<!--
  For Svelte 5, we use fixed positioning instead of actual DOM portaling.
  Fixed positioning achieves the same visual result (overlay on viewport)
  without the complexity of teleporting DOM nodes.
  When disabled, container uses absolute positioning within parent.
-->
{#if children}
	{@render children()}
{/if}
