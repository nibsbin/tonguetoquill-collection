<script lang="ts">
	import { Toaster as SonnerToaster } from 'svelte-sonner';

	type ToasterProps = {
		position?:
			| 'top-left'
			| 'top-center'
			| 'top-right'
			| 'bottom-left'
			| 'bottom-center'
			| 'bottom-right';
		richColors?: boolean;
		expand?: boolean;
		duration?: number;
		visibleToasts?: number;
		closeButton?: boolean;
	};

	let {
		position = 'bottom-right',
		richColors = false,
		expand = false,
		duration = 4000,
		visibleToasts = 3,
		closeButton = true,
		...restProps
	}: ToasterProps = $props();

	// Detect dark mode from document class
	let isDark = $state(false);

	$effect(() => {
		// Check initial dark mode state
		isDark = document.documentElement.classList.contains('dark');

		// Watch for dark mode changes
		const observer = new MutationObserver(() => {
			isDark = document.documentElement.classList.contains('dark');
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});

		return () => observer.disconnect();
	});
</script>

<SonnerToaster
	theme={isDark ? 'dark' : 'light'}
	{position}
	{richColors}
	{expand}
	{duration}
	{visibleToasts}
	{closeButton}
	{...restProps}
/>
