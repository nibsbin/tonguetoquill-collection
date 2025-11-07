/**
 * Svelte action for detecting clicks outside an element
 * Usage: <div use:clickOutside={() => close()}>
 */
export function clickOutside(
	node: HTMLElement,
	callback: (event: MouseEvent) => void
): { destroy: () => void } {
	function handleClick(event: MouseEvent) {
		if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			callback(event);
		}
	}

	// Add listener with a slight delay to avoid triggering on the same click that opens the element
	setTimeout(() => {
		document.addEventListener('click', handleClick, true);
	}, 0);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
