<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	type DropdownMenuSeparatorProps = {
		class?: string;
	};

	let { class: className, ...restProps }: DropdownMenuSeparatorProps = $props();
</script>

<DropdownMenuPrimitive.Separator
	class={cn('-mx-1 my-1 h-px bg-zinc-700', className)}
	{...restProps}
/>
