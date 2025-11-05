<script lang="ts">
	import { Mail, Github, Key } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import { loginClient } from '$lib/services/auth';
	import type { AuthProviderConfig } from '$lib/services/auth/types';
	import { onMount } from 'svelte';

	type LoginPopoverProps = {
		onClose?: () => void;
	};

	let { onClose }: LoginPopoverProps = $props();

	let providers = $state<AuthProviderConfig[]>([]);
	let isLoadingProviders = $state(true);
	let inputValues = $state<Record<string, string>>({});
	let loadingProvider = $state<string | null>(null);
	let successMessage = $state('');
	let errorMessage = $state('');

	// Icon mapping
	const iconMap: Record<string, any> = {
		github: Github,
		mail: Mail,
		key: Key
	};

	onMount(async () => {
		try {
			providers = await loginClient.getAvailableProviders();
		} catch (error: any) {
			errorMessage = 'Failed to load authentication providers';
		} finally {
			isLoadingProviders = false;
		}
	});

	async function handleProviderAuth(provider: AuthProviderConfig) {
		loadingProvider = provider.id;
		errorMessage = '';
		successMessage = '';

		try {
			let data: Record<string, string> | undefined;

			// If provider requires input, collect it
			if (provider.requiresInput && provider.inputConfig) {
				const inputValue = inputValues[provider.id];
				if (!inputValue || !inputValue.trim()) {
					errorMessage = `Please enter your ${provider.inputConfig.label.toLowerCase()}`;
					loadingProvider = null;
					return;
				}
				data = { [provider.inputConfig.type]: inputValue };
			}

			// Initiate authentication
			const result = await loginClient.initiateAuth(provider.id, data);

			// If message is returned (e.g., email OTP sent), show it
			if (result.message) {
				successMessage = result.message;
				// Clear input after successful submission
				if (provider.requiresInput) {
					inputValues[provider.id] = '';
				}
			}
		} catch (error: any) {
			errorMessage = error.message || 'Failed to initiate authentication';
		} finally {
			loadingProvider = null;
		}
	}

	function getProviderIcon(iconName?: string) {
		if (!iconName) return Key;
		return iconMap[iconName] || Key;
	}
</script>

<div class="w-72 p-4">
	<h3 class="mb-4 text-lg font-semibold text-foreground">Sign in</h3>

	{#if isLoadingProviders}
		<div class="flex items-center justify-center py-8">
			<div class="text-muted-foreground">Loading...</div>
		</div>
	{:else if providers.length === 0}
		<div class="text-center text-muted-foreground">No authentication providers available</div>
	{:else}
		<div class="space-y-3">
			{#each providers as provider, index}
				<!-- Provider without input (e.g., OAuth buttons) -->
				{#if !provider.requiresInput}
					{@const Icon = getProviderIcon(provider.icon)}
					<Button
						variant={index === 0 ? 'default' : 'outline'}
						class="w-full justify-start gap-2"
						onclick={() => handleProviderAuth(provider)}
						disabled={loadingProvider !== null}
						aria-label={provider.name}
					>
						<Icon class="h-5 w-5" />
						{provider.name}
					</Button>

					<!-- Divider after OAuth providers -->
					{#if index < providers.length - 1 && providers[index + 1].requiresInput}
						<div class="relative">
							<div class="absolute inset-0 flex items-center">
								<div class="w-full border-t border-border"></div>
							</div>
							<div class="relative flex justify-center text-xs uppercase">
								<span class="bg-surface-elevated px-2 text-muted-foreground">Or</span>
							</div>
						</div>
					{/if}
				{:else}
					<!-- Provider with input (e.g., email) -->
					{@const Icon = getProviderIcon(provider.icon)}
					<div class="space-y-2">
						<Label for="login-{provider.id}" class="text-foreground/80">
							{provider.inputConfig?.label || 'Input'}
						</Label>
						<Input
							id="login-{provider.id}"
							type={provider.inputConfig?.type || 'text'}
							placeholder={provider.inputConfig?.placeholder || ''}
							bind:value={inputValues[provider.id]}
							disabled={loadingProvider !== null}
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									handleProviderAuth(provider);
								}
							}}
						/>
					</div>

					<Button
						variant="outline"
						class="w-full justify-start gap-2"
						onclick={() => handleProviderAuth(provider)}
						disabled={loadingProvider !== null}
						aria-label={provider.name}
					>
						<Icon class="h-5 w-5" />
						{loadingProvider === provider.id ? 'Sending...' : provider.name}
					</Button>
				{/if}
			{/each}

			<!-- Success Message -->
			{#if successMessage}
				<div
					class="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300"
				>
					{successMessage}
				</div>
			{/if}

			<!-- Error Message -->
			{#if errorMessage}
				<div
					class="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300"
				>
					{errorMessage}
				</div>
			{/if}
		</div>
	{/if}
</div>
