<script lang="ts">
	import { Mail, Github, Key } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { loginClient } from '$lib/services/auth';
	import type { AuthProviderConfig } from '$lib/services/auth/types';

	type LoginPopoverProps = {
		onClose?: () => void;
	};

	let { onClose }: LoginPopoverProps = $props();

	// Get available providers synchronously from login client
	const providers = loginClient.getAvailableProviders();

	// Icon mapping
	const iconMap: Record<string, any> = {
		github: Github,
		mail: Mail,
		key: Key
	};

	async function handleProviderAuth(provider: AuthProviderConfig) {
		try {
			// Initiate login by redirecting to the auth provider
			await loginClient.initiateLogin(provider.id);
		} catch (error: any) {
			console.error('Login failed:', error);
		}
	}

	function getProviderIcon(iconName?: string) {
		if (!iconName) return Key;
		return iconMap[iconName] || Key;
	}
</script>

<div class="w-72 p-4">
	<h3 class="mb-4 text-lg font-semibold text-foreground">Sign in</h3>

	{#if providers.length === 0}
		<div class="text-center text-muted-foreground">No authentication providers available</div>
	{:else}
		<div class="space-y-3">
			{#each providers as provider, index}
				{@const Icon = getProviderIcon(provider.icon)}
				<Button
					variant={index === 0 ? 'default' : 'outline'}
					class="w-full justify-start gap-2"
					onclick={() => handleProviderAuth(provider)}
					aria-label={provider.name}
				>
					<Icon class="h-5 w-5" />
					{provider.name}
				</Button>
			{/each}
		</div>
	{/if}
</div>
