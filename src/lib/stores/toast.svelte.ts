/**
 * Toast notification using svelte-sonner via shadcn-svelte wrapper
 */

import { toast as sonner } from '$lib/components/ui/sonner';

export const toastStore = {
	success(message: string) {
		sonner.success(message);
	},

	error(message: string) {
		sonner.error(message);
	},

	info(message: string) {
		sonner.info(message);
	},

	warning(message: string) {
		sonner.warning(message);
	}
};
