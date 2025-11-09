/**
 * Composable positioning behavior for overlays
 * Handles position calculation and viewport collision detection
 */

export type PositioningStrategy = 'center' | 'relative' | 'side' | 'corner';
export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Align = 'start' | 'center' | 'end';

export interface PositioningConfig {
	/** Positioning strategy */
	strategy: PositioningStrategy;
	/** Anchor element (for relative positioning) */
	anchor?: HTMLElement;
	/** Side (for relative/side/corner positioning) */
	side?: Side;
	/** Alignment (for relative positioning) */
	align?: Align;
	/** Offset in pixels */
	offset?: number;
}

export interface Position {
	top: number;
	left: number;
}

/**
 * Hook for positioning behavior
 * Returns position calculation function and event handlers
 */
export function usePositioning(config: PositioningConfig) {
	const { strategy, anchor, side = 'bottom', align = 'center', offset = 8 } = config;

	/**
	 * Calculate position based on strategy
	 */
	function calculatePosition(element: HTMLElement): Position {
		switch (strategy) {
			case 'center':
				return calculateCenterPosition();
			case 'relative':
				return calculateRelativePosition(element, anchor!, side, align, offset);
			case 'side':
				return calculateSidePosition(side);
			case 'corner':
				return calculateCornerPosition(side, align);
			default:
				return { top: 0, left: 0 };
		}
	}

	/**
	 * Center positioning (for dialogs)
	 * Uses CSS transform, returns placeholder values
	 */
	function calculateCenterPosition(): Position {
		// Centered via CSS (translate-x/y-1/2)
		// No JS calculation needed
		return { top: 0, left: 0 };
	}

	/**
	 * Relative positioning (for popovers)
	 * Positions relative to anchor element with collision detection
	 */
	function calculateRelativePosition(
		element: HTMLElement,
		anchor: HTMLElement,
		side: Side,
		align: Align,
		offset: number
	): Position {
		const anchorRect = anchor.getBoundingClientRect();
		const elementRect = element.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		let top = 0;
		let left = 0;

		// Calculate position based on side
		switch (side) {
			case 'top':
				top = anchorRect.top - elementRect.height - offset;
				break;
			case 'bottom':
				top = anchorRect.bottom + offset;
				break;
			case 'left':
				left = anchorRect.left - elementRect.width - offset;
				top = anchorRect.top;
				break;
			case 'right':
				left = anchorRect.right + offset;
				top = anchorRect.top;
				break;
		}

		// Calculate alignment
		if (side === 'top' || side === 'bottom') {
			switch (align) {
				case 'start':
					left = anchorRect.left;
					break;
				case 'center':
					left = anchorRect.left + anchorRect.width / 2 - elementRect.width / 2;
					break;
				case 'end':
					left = anchorRect.right - elementRect.width;
					break;
			}
		} else {
			// For left/right sides
			switch (align) {
				case 'start':
					top = anchorRect.top;
					break;
				case 'center':
					top = anchorRect.top + anchorRect.height / 2 - elementRect.height / 2;
					break;
				case 'end':
					top = anchorRect.bottom - elementRect.height;
					break;
			}
		}

		// Viewport collision detection
		if (left + elementRect.width > viewportWidth) {
			left = viewportWidth - elementRect.width - 8;
		}
		if (left < 8) {
			left = 8;
		}
		if (top + elementRect.height > viewportHeight) {
			top = viewportHeight - elementRect.height - 8;
		}
		if (top < 8) {
			top = 8;
		}

		return { top, left };
	}

	/**
	 * Side positioning (for sheets)
	 * Returns placeholder - handled by CSS classes
	 */
	function calculateSidePosition(_side: Side): Position {
		// Side positioning handled by CSS classes
		// (top-0, right-0, bottom-0, left-0)
		return { top: 0, left: 0 };
	}

	/**
	 * Corner positioning (for toasts)
	 * Returns placeholder - handled by CSS classes
	 */
	function calculateCornerPosition(_side: Side, _align: Align): Position {
		// Corner positioning handled by CSS classes
		// (top-4 right-4, bottom-4 left-4, etc.)
		return { top: 0, left: 0 };
	}

	/**
	 * Setup position tracking effect
	 * Returns cleanup function for listeners
	 */
	function setupPositionTracking(
		element: HTMLElement,
		onPositionChange: (position: Position) => void
	): () => void {
		if (strategy !== 'relative') {
			// Only relative positioning needs dynamic updates
			return () => {};
		}

		function updatePosition() {
			const position = calculatePosition(element);
			onPositionChange(position);
		}

		// Initial calculation (with RAF to ensure element is rendered)
		requestAnimationFrame(updatePosition);

		// Update on resize/scroll
		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);

		// Return cleanup
		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
		};
	}

	return {
		calculatePosition,
		setupPositionTracking
	};
}
