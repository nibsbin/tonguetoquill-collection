/**
 * Store for managing ruler overlay state
 */
class RulerStore {
	private _isActive = $state(false);

	get isActive() {
		return this._isActive;
	}

	setActive(active: boolean) {
		this._isActive = active;
	}

	toggle() {
		this._isActive = !this._isActive;
	}
}

export const rulerStore = new RulerStore();
