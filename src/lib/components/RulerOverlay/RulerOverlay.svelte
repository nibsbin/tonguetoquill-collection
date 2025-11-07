<script lang="ts">
	import { onDestroy } from 'svelte';
	import { rulerStore } from '$lib/stores/ruler.svelte';
	import { X } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';

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
	 * Handle clicks outside the preview pane to exit ruler mode
	 */
	function handleDocumentClick(event: MouseEvent) {
		if (!containerElement) return;

		const target = event.target as Node;
		if (!containerElement.contains(target)) {
			exitRulerMode();
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
			window.addEventListener('click', handleDocumentClick, true);

			return () => {
				window.removeEventListener('mousemove', handleMouseMove);
				window.removeEventListener('mouseup', handleMouseUp);
				window.removeEventListener('keydown', handleKeyDown);
				window.removeEventListener('click', handleDocumentClick, true);
			};
		}
	});

	// Cleanup on destroy
	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('click', handleDocumentClick, true);
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
		<div class="ruler-instructions group">
			<div class="ruler-instructions-content">
				<div class="ruler-instructions-text">
					<div class="ruler-title-row">
						<strong class="text-sm font-semibold text-foreground">Ruler Mode</strong>
						<Button
							variant="ghost"
							size="icon"
							class="ruler-close-button h-6 w-6 shrink-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
							onclick={exitRulerMode}
							aria-label="Exit ruler mode"
						>
							<X size={14} strokeWidth={2.5} />
						</Button>
					</div>
					<p class="text-xs leading-relaxed text-muted-foreground">
						Click and drag to measure. Hold <kbd
							class="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[0.6875rem] font-medium text-foreground shadow-sm"
							>Shift</kbd
						>
						to snap.
					</p>
				</div>
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
		z-index: var(--z-canvas-overlay);
		cursor: crosshair;
		pointer-events: auto;
	}

	.ruler-svg {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
	}

	.ruler-line {
		stroke: var(--color-primary);
		stroke-width: 2;
		stroke-dasharray: 6 3;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
	}

	.ruler-point {
		stroke: var(--color-background);
		stroke-width: 2;
		filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
	}

	.start-point {
		fill: var(--color-success);
	}

	.end-point {
		fill: var(--color-destructive);
	}

	.ruler-text {
		fill: var(--color-foreground);
		font-family:
			ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
		font-size: 15px;
		font-weight: 600;
		pointer-events: none;
		paint-order: stroke fill;
		stroke: var(--color-background);
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
		/* No z-index needed - positioned within .ruler-overlay stacking context */
		pointer-events: auto;
		animation: slideUp 0.3s ease-out;
		transition: opacity 0.2s ease-in-out;
	}

	/* Make banner semi-transparent on hover to see content behind */
	.ruler-instructions.group:hover .ruler-instructions-content {
		opacity: 0.3;
	}

	/* Keep close button opaque when banner is hovered */
	.ruler-instructions.group:hover .ruler-close-button {
		opacity: 1 !important;
	}

	.ruler-instructions-content {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		padding-top: 0.75rem;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		min-width: 350px;
		max-width: 450px;
		transition: opacity 0.2s ease-in-out;
	}

	.ruler-instructions-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.ruler-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.ruler-instructions-text p {
		max-width: 100%;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.ruler-close-button {
		opacity: 1 !important; /* Always keep button visible */
		transition: all 0.15s ease;
		flex-shrink: 0;
	}

	.ruler-close-button:hover {
		transform: scale(1.05);
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
			padding: 0.75rem 0.875rem;
			padding-top: 0.625rem;
		}
	}
</style>
