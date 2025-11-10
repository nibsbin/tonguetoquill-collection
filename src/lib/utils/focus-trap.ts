/**
 * Focus trap utility for dialogs and modals
 * Traps keyboard focus within a container element
 */

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

function createFocusTrap(container: HTMLElement) {
	let previouslyFocusedElement: HTMLElement | null = null;

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;

		const focusableElements = getFocusableElements(container);
		if (focusableElements.length === 0) return;

		const firstFocusable = focusableElements[0];
		const lastFocusable = focusableElements[focusableElements.length - 1];

		if (event.shiftKey) {
			// Shift+Tab: moving backwards
			if (document.activeElement === firstFocusable) {
				event.preventDefault();
				lastFocusable?.focus();
			}
		} else {
			// Tab: moving forwards
			if (document.activeElement === lastFocusable) {
				event.preventDefault();
				firstFocusable?.focus();
			}
		}
	}

	function activate() {
		// Save currently focused element
		previouslyFocusedElement = document.activeElement as HTMLElement;

		// Focus first focusable element
		const focusableElements = getFocusableElements(container);
		if (focusableElements.length > 0) {
			// Small delay to ensure element is mounted
			setTimeout(() => {
				focusableElements[0]?.focus();
			}, 0);
		}

		// Add keydown listener
		container.addEventListener('keydown', handleKeyDown);
	}

	function deactivate() {
		// Remove keydown listener
		container.removeEventListener('keydown', handleKeyDown);

		// Restore focus to previously focused element
		if (previouslyFocusedElement) {
			// Small delay to ensure smooth transition
			setTimeout(() => {
				previouslyFocusedElement?.focus();
			}, 0);
		}
	}

	return {
		activate,
		deactivate
	};
}

/**
 * Svelte action for focus trapping
 * Usage: <div use:focusTrap>
 */
export function focusTrap(node: HTMLElement) {
	const trap = createFocusTrap(node);
	trap.activate();

	return {
		destroy() {
			trap.deactivate();
		}
	};
}
