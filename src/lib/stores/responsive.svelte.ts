/**
 * Responsive store - Centralized responsive state management
 *
 * Provides a reactive store for tracking viewport size and device type.
 * Used across components (Sidebar, DocumentEditor, etc.) to coordinate
 * responsive behavior.
 *
 * Note: This store uses custom lifecycle management (initialize/destroy) that
 * doesn't benefit from factory abstraction. Kept as-is for clarity.
 */

// Breakpoint definition (matches Tailwind's md breakpoint)
const MOBILE_BREAKPOINT = 768;

class ResponsiveStore {
	isMobile = $state(false);
	isInitialized = $state(false);

	constructor() {
		// Initialize will be called on mount
	}

	/**
	 * Initialize responsive tracking
	 * Should be called once in the root layout or main component
	 */
	initialize() {
		if (this.isInitialized) return;

		// Check initial state
		this.checkMobile();

		// Listen for resize events
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', this.checkMobile);
			this.isInitialized = true;
		}
	}

	/**
	 * Clean up event listeners
	 */
	destroy() {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', this.checkMobile);
			this.isInitialized = false;
		}
	}

	/**
	 * Check if viewport is mobile size
	 */
	checkMobile = () => {
		if (typeof window !== 'undefined') {
			this.isMobile = window.innerWidth < MOBILE_BREAKPOINT;
		}
	};
}

// Export singleton instance
export const responsiveStore = new ResponsiveStore();
