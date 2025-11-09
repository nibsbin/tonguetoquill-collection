/**
 * Composable focus trap behavior for overlays
 * Wraps existing focus-trap utility with enable/disable control
 */

import { focusTrap as baseFocusTrap } from '$lib/utils/focus-trap';

export interface FocusTrapConfig {
	/** Whether focus trap is enabled */
	enabled: boolean;
}

/**
 * Hook for focus trap behavior
 * Returns Svelte action that conditionally applies focus trap
 */
export function useFocusTrap(config: FocusTrapConfig) {
	const { enabled } = config;

	/**
	 * Conditional focus trap action
	 * Use as Svelte action: use:focusTrapAction
	 */
	function focusTrapAction(node: HTMLElement) {
		if (!enabled) {
			return { destroy: () => {} };
		}
		return baseFocusTrap(node);
	}

	return {
		focusTrapAction
	};
}
