<script lang="ts">
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

	function handleClick() {
		if (disabled) return;
		const newValue = !checked;
		checked = newValue;
		onCheckedChange?.(newValue);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (disabled) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	{id}
	{disabled}
	tabindex={disabled ? -1 : 0}
	onclick={handleClick}
	onkeydown={handleKeydown}
	class={cn(
		'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
		checked ? 'bg-primary' : 'bg-accent',
		className
	)}
	{...restProps}
>
	<span
		class={cn(
			'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
			checked ? 'translate-x-4' : 'translate-x-0'
		)}
	></span>
</button>
