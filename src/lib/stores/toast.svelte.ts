/**
 * Toast notification store using Svelte 5 runes
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
}

class ToastStore {
	private state = $state<{ toasts: Toast[] }>({
		toasts: []
	});

	get toasts() {
		return this.state.toasts;
	}

	show(message: string, type: ToastType = 'info', duration: number = 5000) {
		const id = `toast-${Date.now()}-${Math.random()}`;
		const toast: Toast = { id, message, type, duration };

		this.state.toasts = [...this.state.toasts, toast];

		if (duration > 0) {
			setTimeout(() => {
				this.dismiss(id);
			}, duration);
		}

		return id;
	}

	success(message: string, duration?: number) {
		return this.show(message, 'success', duration);
	}

	error(message: string, duration?: number) {
		return this.show(message, 'error', duration);
	}

	info(message: string, duration?: number) {
		return this.show(message, 'info', duration);
	}

	warning(message: string, duration?: number) {
		return this.show(message, 'warning', duration);
	}

	dismiss(id: string) {
		this.state.toasts = this.state.toasts.filter((toast) => toast.id !== id);
	}

	clear() {
		this.state.toasts = [];
	}
}

export const toastStore = new ToastStore();
