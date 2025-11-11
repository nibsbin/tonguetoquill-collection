<script lang="ts">
	import { Github, Key } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { loginClient } from '$lib/services/auth';
	import type { AuthProviderConfig } from '$lib/services/auth/types';
	import { browser } from '$app/environment';
	import { getErrorMessage } from '$lib/errors';

	type LoginPopoverProps = {
		onClose?: () => void;
	};

	let { onClose }: LoginPopoverProps = $props();

	// Get available providers (client-side only to avoid SSR fetch warning)
	let providers = $state<AuthProviderConfig[]>([]);

	$effect(() => {
		if (browser) {
			loginClient.getProviders().then((result) => {
				providers = result;
			});
		}
	});

	// State management
	let loading = $state(false);
	let error = $state('');

	// Google icon component (SVG)
	const GoogleIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;

	// Icon mapping
	const iconMap: Record<string, any> = {
		github: Github,
		google: null, // Will use custom SVG
		key: Key
	};

	async function handleOAuthLogin(provider: AuthProviderConfig) {
		try {
			loading = true;
			error = '';
			// Initiate OAuth login by redirecting
			await loginClient.initiateLogin(provider.id);
		} catch (err: any) {
			error = getErrorMessage(err, 'Failed to initiate login');
		} finally {
			loading = false;
		}
	}

	function getProviderIcon(iconName?: string) {
		if (!iconName) return Key;
		return iconMap[iconName] || Key;
	}

	function isGoogleIcon(iconName?: string): boolean {
		return iconName === 'google';
	}
</script>

<div class="w-72 px-4">
	{#if providers.length === 0}
		<div class="text-center text-muted-foreground">No authentication providers available</div>
	{:else}
		<div class="space-y-3">
			{#each providers as provider, index}
				<!-- OAuth Button -->
				{@const Icon = getProviderIcon(provider.icon)}
				<Button
					variant={index === 0 ? 'default' : 'outline'}
					class="w-full justify-start gap-2"
					onclick={() => handleOAuthLogin(provider)}
					disabled={loading}
					aria-label={provider.name}
				>
					{#if isGoogleIcon(provider.icon)}
						{@html GoogleIcon}
					{:else}
						<Icon class="h-5 w-5" />
					{/if}
					{provider.name}
				</Button>
			{/each}

			<!-- Error Message -->
			{#if error}
				<div
					class="rounded-md border border-error-border bg-error-background p-3 text-sm text-error-foreground"
				>
					{error}
				</div>
			{/if}
		</div>
	{/if}
</div>
