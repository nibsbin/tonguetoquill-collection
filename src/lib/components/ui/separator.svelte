<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type SeparatorProps = {
		orientation?: 'horizontal' | 'vertical';
		class?: string;
	};

	let { orientation = 'horizontal', class: className }: SeparatorProps = $props();
</script>

<div
	class={cn(
		'shrink-0 bg-zinc-700',
		orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
		className
	)}
></div>
