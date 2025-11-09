<script lang="ts">
	import { toastStore, dismissToast, type Toast } from '$lib/stores/toast.svelte';
	import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { cn } from '$lib/utils/cn';
	import { fly } from 'svelte/transition';

	interface ToastProps {
		position?:
			| 'top-left'
			| 'top-center'
			| 'top-right'
			| 'bottom-left'
			| 'bottom-center'
			| 'bottom-right';
		maxToasts?: number;
	}

	let { position = 'bottom-right', maxToasts = 3 }: ToastProps = $props();

	// Limit toasts to maxToasts
	let visibleToasts = $derived(toastStore.toasts.slice(-maxToasts));

	const positionClasses = {
		'top-left': 'top-4 left-4',
		'top-center': 'top-4 left-1/2 -translate-x-1/2',
		'top-right': 'top-4 right-4',
		'bottom-left': 'bottom-4 left-4',
		'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
		'bottom-right': 'bottom-4 right-4'
	};

	function getIcon(type: Toast['type']) {
		switch (type) {
			case 'success':
				return CheckCircle;
			case 'error':
				return XCircle;
			case 'info':
				return Info;
			case 'warning':
				return AlertTriangle;
		}
	}

	function getTypeClasses(type: Toast['type']) {
		switch (type) {
			case 'success':
				return 'bg-success-background border-success-border text-success-foreground';
			case 'error':
				return 'bg-error-background border-error-border text-error-foreground';
			case 'info':
				return 'bg-info-background border-info-border text-info-foreground';
			case 'warning':
				return 'bg-warning-background border-warning-border text-warning-foreground';
		}
	}

	function getIconColor(type: Toast['type']) {
		switch (type) {
			case 'success':
				return 'text-success';
			case 'error':
				return 'text-error';
			case 'info':
				return 'text-info';
			case 'warning':
				return 'text-warning';
		}
	}
</script>

<div class={cn('z-toast fixed flex flex-col gap-2', positionClasses[position])}>
	{#each visibleToasts as toast (toast.id)}
		<div
			class={cn(
				'flex max-w-md min-w-[300px] items-start gap-3 rounded-lg border p-4 shadow-md',
				getTypeClasses(toast.type)
			)}
			role={toast.type === 'error' ? 'alert' : 'status'}
			aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
			transition:fly={{ y: position.startsWith('top') ? -20 : 20, duration: 200 }}
		>
			<!-- Icon -->
			{#snippet iconContent()}
				{@const IconComponent = getIcon(toast.type)}
				<div class={cn('flex-shrink-0', getIconColor(toast.type))}>
					<IconComponent class="h-5 w-5" />
				</div>
			{/snippet}
			{@render iconContent()}

			<!-- Content -->
			<div class="flex-1 space-y-1">
				{#if toast.title}
					<div class="font-semibold">{toast.title}</div>
				{/if}
				<div class="text-sm">{toast.message}</div>
			</div>

			<!-- Dismiss button -->
			{#if toast.dismissible !== false}
				<Button
					variant="ghost"
					size="icon"
					class="h-6 w-6 flex-shrink-0"
					onclick={() => dismissToast(toast.id)}
					aria-label="Dismiss notification"
				>
					<X class="h-4 w-4" />
				</Button>
			{/if}
		</div>
	{/each}
</div>
