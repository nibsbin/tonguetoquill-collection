<script lang="ts">
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { rulerStore } from '$lib/stores/ruler.svelte';

	interface Props {
		/** The container element that holds the SVG to measure */
		containerElement: HTMLElement | null;
	}

	let { containerElement }: Props = $props();

	// Ruler measurement state
	let startPoint = $state<{ x: number; y: number } | null>(null);
	let currentPoint = $state<{ x: number; y: number } | null>(null);
	let isDrawing = $state(false);
	let toastId = $state<string | number | undefined>(undefined);
	let isExiting = $state(false);

	// A4 page dimensions in inches
	const A4_WIDTH_INCHES = 8.5;
	const A4_HEIGHT_INCHES = 11;

	/**
	 * Calculate pixels per inch based on the SVG element's displayed size
	 */
	function getPixelsPerInch(container: HTMLElement): number {
		const svgElement = container.querySelector('svg');
		if (!svgElement) {
			const rect = container.getBoundingClientRect();
			return (rect.width / A4_WIDTH_INCHES + rect.height / A4_HEIGHT_INCHES) / 2;
		}

		const rect = svgElement.getBoundingClientRect();
		const ppiX = rect.width / A4_WIDTH_INCHES;
		const ppiY = rect.height / A4_HEIGHT_INCHES;
		return (ppiX + ppiY) / 2;
	}

	/**
	 * Convert pixel distance to inches
	 */
	function pixelsToInches(pixels: number, container: HTMLElement): number {
		const ppi = getPixelsPerInch(container);
		return pixels / ppi;
	}

	/**
	 * Snap measurement to 0.02 inch increments
	 */
	function snapToIncrement(inches: number, increment: number = 0.02): number {
		return Math.round(inches / increment) * increment;
	}

	/**
	 * Get relative coordinates within the container element
	 */
	function getRelativeCoordinates(
		event: MouseEvent,
		container: HTMLElement
	): { x: number; y: number } {
		const rect = container.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}

	/**
	 * Start measurement on mouse down
	 */
	function handleMouseDown(event: MouseEvent) {
		if (!containerElement) return;

		const coords = getRelativeCoordinates(event, containerElement);
		startPoint = coords;
		currentPoint = coords;
		isDrawing = true;
		event.preventDefault();
	}

	/**
	 * Update current point on mouse move
	 */
	function handleMouseMove(event: MouseEvent) {
		if (!isDrawing || !containerElement || !startPoint) return;

		let coords = getRelativeCoordinates(event, containerElement);

		// Shift key snaps to horizontal/vertical lines
		if (event.shiftKey) {
			const deltaX = Math.abs(coords.x - startPoint.x);
			const deltaY = Math.abs(coords.y - startPoint.y);

			if (deltaX > deltaY) {
				coords.y = startPoint.y; // Snap horizontal
			} else {
				coords.x = startPoint.x; // Snap vertical
			}
		}

		currentPoint = coords;
	}

	/**
	 * Finish measurement but keep overlay active
	 */
	function handleMouseUp(event: MouseEvent) {
		event.preventDefault();
	}

	/**
	 * Clear current measurement
	 */
	function clearMeasurement() {
		isDrawing = false;
		startPoint = null;
		currentPoint = null;
	}

	/**
	 * Handle clicks outside the SVG to clear measurement
	 */
	function handleOverlayClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			clearMeasurement();
		}
	}

	/**
	 * Handle keyboard events
	 */
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			exitRulerMode();
		}
	}

	/**
	 * Exit ruler mode completely
	 */
	function exitRulerMode() {
		if (isExiting) return; // Prevent recursive calls
		isExiting = true;
		rulerStore.setActive(false);
		clearMeasurement();
		// Don't dismiss toast here - let the effect handle it to avoid double-dismiss
	}

	/**
	 * Calculate distance measurement
	 */
	const measurement = $derived.by(() => {
		if (!startPoint || !currentPoint || !containerElement) return '';

		const deltaX = currentPoint.x - startPoint.x;
		const deltaY = currentPoint.y - startPoint.y;
		const pixelDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		const inchDistance = pixelsToInches(pixelDistance, containerElement);
		const snapped = snapToIncrement(inchDistance);

		return `${snapped.toFixed(2)}"`;
	});

	/**
	 * Show instructions toast when ruler becomes active
	 */
	$effect(() => {
		if (rulerStore.isActive) {
			isExiting = false; // Reset exit flag when activating

			// Show instructional toast
			toastId = toast('Ruler Mode Active', {
				description:
					'Click and drag to measure distances. Hold Shift to snap to horizontal/vertical. Press Esc or dismiss this message to exit.',
				duration: Infinity,
				position: 'bottom-center',
				onDismiss: () => {
					exitRulerMode();
				},
				action: {
					label: 'Exit',
					onClick: () => {
						exitRulerMode();
					}
				}
			});

			// Cleanup when effect re-runs or component unmounts
			return () => {
				if (toastId !== undefined) {
					const id = toastId;
					toastId = undefined;
					toast.dismiss(id);
				}
			};
		} else {
			// Clean up when deactivated
			clearMeasurement();
			if (toastId !== undefined) {
				const id = toastId;
				toastId = undefined;
				toast.dismiss(id);
			}
			isExiting = false; // Reset exit flag after cleanup
		}
	});

	/**
	 * Add/remove event listeners based on drawing state
	 */
	$effect(() => {
		if (typeof window !== 'undefined' && rulerStore.isActive) {
			if (isDrawing) {
				window.addEventListener('mousemove', handleMouseMove);
				window.addEventListener('mouseup', handleMouseUp);
			}

			window.addEventListener('keydown', handleKeyDown);

			return () => {
				window.removeEventListener('mousemove', handleMouseMove);
				window.removeEventListener('mouseup', handleMouseUp);
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	});

	// Cleanup on destroy
	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('keydown', handleKeyDown);
		}
		if (toastId !== undefined) {
			toast.dismiss(toastId);
		}
	});
</script>

{#if rulerStore.isActive && containerElement}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="ruler-overlay"
		class:active={isDrawing}
		onmousedown={handleMouseDown}
		onclick={handleOverlayClick}
		role="application"
		aria-label="Ruler overlay for measuring distances"
		tabindex="0"
	>
		{#if isDrawing && startPoint && currentPoint}
			<svg class="ruler-svg" width="100%" height="100%">
				<!-- Measurement line -->
				<line
					x1={startPoint.x}
					y1={startPoint.y}
					x2={currentPoint.x}
					y2={currentPoint.y}
					class="ruler-line"
				/>

				<!-- Start point marker -->
				<circle cx={startPoint.x} cy={startPoint.y} r="5" class="ruler-point start-point" />

				<!-- End point marker -->
				<circle cx={currentPoint.x} cy={currentPoint.y} r="5" class="ruler-point end-point" />

				<!-- Measurement label with background -->
				<g class="ruler-label">
					<text
						x={(startPoint.x + currentPoint.x) / 2}
						y={(startPoint.y + currentPoint.y) / 2 - 10}
						class="ruler-text"
						text-anchor="middle"
					>
						{measurement}
					</text>
				</g>
			</svg>
		{/if}
	</div>
{/if}

<style>
	.ruler-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 30;
		cursor: crosshair;
		pointer-events: auto;
		transition: background-color 0.2s ease;
	}

	.ruler-overlay.active {
		background-color: rgba(99, 102, 241, 0.02);
	}

	.ruler-svg {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
	}

	.ruler-line {
		stroke: rgb(99, 102, 241);
		stroke-width: 2;
		stroke-dasharray: 6 3;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
	}

	.ruler-point {
		stroke: white;
		stroke-width: 2;
		filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
	}

	.start-point {
		fill: rgb(34, 197, 94);
	}

	.end-point {
		fill: rgb(239, 68, 68);
	}

	.ruler-text {
		fill: rgb(30, 27, 75);
		font-family:
			ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
		font-size: 15px;
		font-weight: 600;
		pointer-events: none;
		paint-order: stroke fill;
		stroke: white;
		stroke-width: 4;
		stroke-linejoin: round;
		stroke-linecap: round;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
	}
</style>
