/**
 * Toast notification system - custom implementation
 * Migrated from writable to $state for Svelte 5 runes
 */

export interface Toast {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	title?: string;
	duration?: number;
	dismissible?: boolean;
}

class ToastStore {
	private _toasts = $state<Toast[]>([]);
	private toastId = 0;

	get toasts(): Toast[] {
		return this._toasts;
	}

	private addToast(toast: Omit<Toast, 'id'>): string {
		const id = `toast-${++this.toastId}`;
		const newToast = { ...toast, id };

		this._toasts = [...this._toasts, newToast];

		// Auto-dismiss after duration (unless duration is Infinity)
		if (toast.duration !== Infinity) {
			const duration = toast.duration ?? 4000;
			setTimeout(() => this.dismiss(id), duration);
		}

		return id;
	}

	success(message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>): string {
		return this.addToast({ type: 'success', message, dismissible: true, ...options });
	}

	error(message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>): string {
		return this.addToast({ type: 'error', message, dismissible: true, ...options });
	}

	info(message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>): string {
		return this.addToast({ type: 'info', message, dismissible: true, ...options });
	}

	warning(message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>): string {
		return this.addToast({ type: 'warning', message, dismissible: true, ...options });
	}

	dismiss(id: string): void {
		this._toasts = this._toasts.filter((toast) => toast.id !== id);
	}
}

export const toastStore = new ToastStore();

// Export dismiss function for convenience
export function dismissToast(id: string) {
	toastStore.dismiss(id);
}
