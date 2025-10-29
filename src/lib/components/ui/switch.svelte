<script lang="ts">
	import { Switch as SwitchPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	type SwitchProps = {
		checked?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		disabled?: boolean;
		id?: string;
		class?: string;
	};

	let {
		checked = $bindable(false),
		onCheckedChange,
		disabled = false,
		id,
		class: className,
		...restProps
	}: SwitchProps = $props();
</script>

<SwitchPrimitive.Root
	bind:checked
	{onCheckedChange}
	{disabled}
	{id}
	class={cn(
		'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-accent',
		className
	)}
	{...restProps}
>
	<SwitchPrimitive.Thumb
		class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
	/>
</SwitchPrimitive.Root>
