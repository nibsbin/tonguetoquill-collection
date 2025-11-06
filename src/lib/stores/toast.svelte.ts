/**
 * Toast notification system - custom implementation
 * Replaces svelte-sonner with a custom toast store
 */

import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	title?: string;
	duration?: number;
	dismissible?: boolean;
}

export const toasts = writable<Toast[]>([]);

let toastId = 0;

function addToast(toast: Omit<Toast, 'id'>) {
	const id = `toast-${++toastId}`;
	const newToast = { ...toast, id };

	toasts.update((t) => [...t, newToast]);

	// Auto-dismiss after duration (unless duration is Infinity)
	if (toast.duration !== Infinity) {
		const duration = toast.duration ?? 4000;
		setTimeout(() => dismissToast(id), duration);
	}

	return id;
}

export function dismissToast(id: string) {
	toasts.update((t) => t.filter((toast) => toast.id !== id));
}

export const toastStore = {
	success(message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) {
		return addToast({ type: 'success', message, dismissible: true, ...options });
	},

	error(message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) {
		return addToast({ type: 'error', message, dismissible: true, ...options });
	},

	info(message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) {
		return addToast({ type: 'info', message, dismissible: true, ...options });
	},

	warning(message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) {
		return addToast({ type: 'warning', message, dismissible: true, ...options });
	},

	dismiss(id: string) {
		dismissToast(id);
	}
};
