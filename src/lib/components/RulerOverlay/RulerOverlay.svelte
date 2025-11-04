<script lang="ts">
	import { onDestroy } from 'svelte';
	import { rulerStore } from '$lib/stores/ruler.svelte';
	import { X } from 'lucide-svelte';

	interface Props {
		/** The container element that holds the SVG to measure */
		containerElement: HTMLElement | null;
	}

	let { containerElement }: Props = $props();

	// Ruler measurement state
	let startPoint = $state<{ x: number; y: number } | null>(null);
	let currentPoint = $state<{ x: number; y: number } | null>(null);
	let isDrawing = $state(false);

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
		rulerStore.setActive(false);
		clearMeasurement();
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

		<!-- Custom instruction banner -->
		<div class="ruler-instructions">
			<div class="ruler-instructions-content">
				<div class="ruler-instructions-text">
					<strong>Ruler Mode Active</strong>
					<span>
						Click and drag to measure distances. Hold <kbd>Shift</kbd> to snap. Press
						<kbd>Esc</kbd> to exit.
					</span>
				</div>
				<button
					class="ruler-instructions-close"
					onclick={exitRulerMode}
					aria-label="Exit ruler mode"
					type="button"
				>
					<X size={18} />
				</button>
			</div>
		</div>
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

	/* Custom instruction banner */
	.ruler-instructions {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 40;
		pointer-events: auto;
		animation: slideUp 0.3s ease-out;
	}

	.ruler-instructions-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.875rem 1.25rem;
		background: rgba(30, 41, 59, 0.95);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(99, 102, 241, 0.3);
		border-radius: 0.75rem;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.3),
			0 2px 4px -1px rgba(0, 0, 0, 0.2),
			0 0 0 1px rgba(99, 102, 241, 0.1);
		min-width: 400px;
		max-width: 600px;
	}

	.ruler-instructions-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		color: white;
		font-size: 0.875rem;
		line-height: 1.4;
	}

	.ruler-instructions-text strong {
		font-weight: 600;
		font-size: 0.9375rem;
		color: rgb(165, 180, 252);
	}

	.ruler-instructions-text span {
		color: rgba(255, 255, 255, 0.9);
	}

	.ruler-instructions-text kbd {
		display: inline-block;
		padding: 0.125rem 0.375rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.25rem;
		font-family:
			ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
		font-size: 0.8125rem;
		font-weight: 500;
		color: rgb(165, 180, 252);
	}

	.ruler-instructions-close {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		color: white;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.ruler-instructions-close:hover {
		background: rgba(239, 68, 68, 0.2);
		border-color: rgb(239, 68, 68);
		color: rgb(252, 165, 165);
	}

	.ruler-instructions-close:active {
		transform: scale(0.95);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(1rem);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	@media (max-width: 640px) {
		.ruler-instructions-content {
			min-width: auto;
			max-width: calc(100vw - 2rem);
			padding: 0.75rem 1rem;
		}

		.ruler-instructions-text {
			font-size: 0.8125rem;
		}

		.ruler-instructions-text strong {
			font-size: 0.875rem;
		}
	}
</style>
