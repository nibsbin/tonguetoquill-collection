/**
 * Composable portal behavior for overlays
 * Provides configuration for Portal component usage
 */

export interface PortalConfig {
	/** Custom portal target element */
	target?: HTMLElement;
	/** Disable portal and render in place */
	disabled?: boolean;
}

/**
 * Hook for portal behavior
 * Returns config for Portal component
 */
export function usePortal(config: PortalConfig = {}) {
	const { target, disabled = false } = config;

	return {
		portalTarget: target,
		portalDisabled: disabled
	};
}
