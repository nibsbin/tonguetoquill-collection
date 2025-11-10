/**
 * Modal coordinator - Composable utility for managing modal state and coordination
 *
 * Handles:
 * - Exclusive modal opening (close others when opening one)
 * - Ruler overlay dismissal
 * - Mobile view switching to preview
 *
 * Follows the composable hook pattern from the overlay system (OVERLAY_SYSTEM.md)
 */

import { responsiveStore } from '$lib/stores/responsive.svelte';
import { rulerStore } from '$lib/stores/ruler.svelte';

export type ModalSetter = (open: boolean) => void;
export type ModalRegistry = Record<string, ModalSetter>;

export interface ModalCoordinatorConfig {
	/**
	 * Registry of modal setters
	 * Keys are modal identifiers, values are functions to open/close them
	 */
	modals: ModalRegistry;

	/**
	 * Callback to switch mobile view
	 */
	onViewChange: (view: 'editor' | 'preview') => void;

	/**
	 * Whether to close ruler by default
	 * @default true
	 */
	closeRuler?: boolean;
}

export interface OpenModalOptions {
	/**
	 * Override default closeRuler behavior for this specific modal
	 */
	closeRuler?: boolean;
}

/**
 * Composable hook for coordinating modal state
 *
 * @example
 * ```ts
 * const modalCoordinator = useModalCoordinator({
 *   modals: {
 *     about: (open) => (showAboutModal = open),
 *     terms: (open) => (showTermsModal = open)
 *   },
 *   onViewChange: (view) => (mobileView = view)
 * });
 *
 * function handleAbout() {
 *   modalCoordinator.openModal('about');
 * }
 * ```
 */
export function useModalCoordinator(config: ModalCoordinatorConfig) {
	const { modals, onViewChange, closeRuler: defaultCloseRuler = true } = config;

	/**
	 * Close all registered modals
	 */
	function closeAll() {
		Object.values(modals).forEach((setter) => setter(false));
	}

	/**
	 * Open a modal with full coordination:
	 * 1. Close all other modals
	 * 2. Optionally dismiss ruler overlay
	 * 3. Open the target modal
	 * 4. Switch to preview on mobile (so modals are visible)
	 *
	 * @param modalKey - Key of the modal to open (must exist in registry)
	 * @param options - Optional configuration for this specific modal opening
	 */
	function openModal(modalKey: string, options: OpenModalOptions = {}) {
		// Close all modals
		closeAll();

		// Optionally dismiss ruler overlay
		const shouldCloseRuler = options.closeRuler ?? defaultCloseRuler;
		if (shouldCloseRuler) {
			rulerStore.setActive(false);
		}

		// Open target modal
		const modalSetter = modals[modalKey];
		if (!modalSetter) {
			console.warn(`[useModalCoordinator] Modal "${modalKey}" not found in registry`);
			return;
		}
		modalSetter(true);

		// Switch to preview on mobile so modals are visible
		// Utility modals (About, Terms, Privacy) are accessible even without an active document
		if (responsiveStore.isMobile) {
			onViewChange('preview');
		}
	}

	return {
		openModal,
		closeAll
	};
}
