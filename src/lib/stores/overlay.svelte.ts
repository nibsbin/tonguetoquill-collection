/**
 * Centralized Overlay Coordination Store
 *
 * Manages the lifecycle and stacking of all overlay components (dialogs, popovers, sheets, etc.)
 * to ensure proper z-index handling and mutual exclusion when needed.
 *
 * Design Principles:
 * - DRY: Centralize overlay coordination logic instead of duplicating in each component
 * - Automatic cleanup: Higher-priority overlays auto-close lower-priority ones
 * - Type-safe: Use discriminated unions for overlay types
 * - Simple API: Components just register/unregister, store handles the rest
 *
 * Uses RegistryStore factory for Map-based storage, with custom priority logic.
 */

import { createRegistryStore } from './factories.svelte';

export type OverlayType = 'popover' | 'dialog' | 'modal' | 'sheet' | 'toast';

export interface OverlayRegistration {
	id: string;
	type: OverlayType;
	priority: number; // Higher priority = more important, appears above others
	onClose: () => void;
}

const OVERLAY_PRIORITIES: Record<OverlayType, number> = {
	popover: 1300, // Lowest priority - lightweight contextual UI
	dialog: 1500, // High priority - primary user actions
	modal: 1500, // Same as dialog - primary user actions
	sheet: 1500, // Same as dialog - primary user actions
	toast: 1600 // Highest priority - notifications (never auto-closed)
};

class OverlayStore {
	private registry = createRegistryStore<OverlayRegistration>();

	/**
	 * Register a new overlay. Automatically closes lower-priority overlays.
	 */
	register(id: string, type: OverlayType, onClose: () => void): void {
		const priority = OVERLAY_PRIORITIES[type];

		// Close all lower-priority overlays (except toasts which are non-blocking)
		if (type !== 'toast') {
			this.closeOverlaysWithPriorityBelow(priority);
		}

		// Register this overlay using factory
		this.registry.register(id, { id, type, priority, onClose });
	}

	/**
	 * Unregister an overlay when it closes
	 */
	unregister(id: string): void {
		this.registry.unregister(id);
	}

	/**
	 * Close all overlays with priority below the given threshold
	 */
	private closeOverlaysWithPriorityBelow(priority: number): void {
		for (const overlay of this.registry.values()) {
			if (overlay.priority < priority && overlay.type !== 'toast') {
				overlay.onClose();
			}
		}
	}

	/**
	 * Close the top-most overlay (useful for ESC key handling)
	 */
	closeTopMost(): void {
		let topOverlay: OverlayRegistration | null = null;

		for (const overlay of this.registry.values()) {
			if (overlay.type === 'toast') continue; // Skip toasts

			if (!topOverlay || overlay.priority > topOverlay.priority) {
				topOverlay = overlay;
			}
		}

		if (topOverlay) {
			topOverlay.onClose();
		}
	}

	/**
	 * Check if any overlay of a specific type is open
	 */
	hasOpenOverlay(type: OverlayType): boolean {
		for (const overlay of this.registry.values()) {
			if (overlay.type === type) return true;
		}
		return false;
	}

	/**
	 * Get count of open overlays (excluding toasts)
	 */
	get count(): number {
		let count = 0;
		for (const overlay of this.registry.values()) {
			if (overlay.type !== 'toast') count++;
		}
		return count;
	}

	/**
	 * Get all open overlays (for debugging)
	 */
	getAll(): OverlayRegistration[] {
		return this.registry.getAll();
	}
}

export const overlayStore = new OverlayStore();
