/**
 * Store for managing ruler overlay state
 */
import { createSimpleState } from './factories.svelte';

const state = createSimpleState({
	initialValue: false
});

export const rulerStore = {
	get isActive() {
		return state.value;
	},
	setActive(active: boolean) {
		state.set(active);
	},
	toggle() {
		state.toggle();
	}
};
