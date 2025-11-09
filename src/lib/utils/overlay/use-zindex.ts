/**
 * Composable z-index coordination for overlays
 * Handles overlay store registration and lifecycle
 */

import { overlayStore, type OverlayType } from '$lib/stores/overlay.svelte';
import { dev } from '$app/environment';

export interface ZIndexConfig {
	/** Overlay layer type */
	layer: OverlayType;
	/** Callback when overlay should close */
	onClose: () => void;
}

let idCounter = 0;

/**
 * Hook for z-index coordination
 * Returns effect function to use in component $effect
 */
export function useZIndex(config: ZIndexConfig) {
	const { layer, onClose } = config;
	let isRegistered = false;

	/**
	 * Register with overlay store when active
	 * Call this in a $effect(() => { if (open) { return registerEffect() } })
	 */
	function registerEffect() {
		// Warn about potential bugs in dev
		if (dev && isRegistered) {
			console.warn(`[useZIndex] Multiple registrations for ${layer} - check effect dependencies`);
		}

		// Generate unique ID (timestamp + counter is simpler than Math.random)
		const overlayId = `${layer}-${Date.now()}-${++idCounter}`;
		isRegistered = true;

		// Register with store
		overlayStore.register(overlayId, layer, onClose);

		// Return cleanup function
		return () => {
			overlayStore.unregister(overlayId);
			isRegistered = false;
		};
	}

	return {
		registerEffect
	};
}
