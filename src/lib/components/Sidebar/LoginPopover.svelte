<script lang="ts">
	import { Mail, Github, Key } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { loginClient } from '$lib/services/auth';
	import type { AuthProviderConfig } from '$lib/services/auth/types';
	import { browser } from '$app/environment';

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
	let email = $state('');
	let loading = $state(false);
	let message = $state('');
	let error = $state('');
	let emailSent = $state(false);

	// Icon mapping
	const iconMap: Record<string, any> = {
		github: Github,
		mail: Mail,
		key: Key
	};

	async function handleOAuthLogin(provider: AuthProviderConfig) {
		try {
			// Initiate OAuth login by redirecting
			await loginClient.initiateLogin(provider.id);
		} catch (err: any) {
			error = err.message || 'Failed to initiate login';
		}
	}

	async function handleEmailSubmit() {
		if (!email || !email.trim()) {
			error = 'Please enter your email';
			return;
		}

		loading = true;
		error = '';
		message = '';

		try {
			const result = await loginClient.sendEmailAuth(email);
			message = result.message;
			emailSent = true;
		} catch (err: any) {
			error = err.message || 'Failed to send magic link';
		} finally {
			loading = false;
		}
	}

	function resetEmailFlow() {
		emailSent = false;
		email = '';
		error = '';
		message = '';
	}

	function getProviderIcon(iconName?: string) {
		if (!iconName) return Key;
		return iconMap[iconName] || Key;
	}
</script>

<div class="w-72 px-4">
	{#if providers.length === 0}
		<div class="text-center text-muted-foreground">No authentication providers available</div>
	{:else}
		<div class="space-y-3">
			{#each providers as provider, index}
				{#if provider.type === 'oauth'}
					<!-- OAuth Button -->
					{@const Icon = getProviderIcon(provider.icon)}
					<Button
						variant={index === 0 ? 'default' : 'outline'}
						class="w-full justify-start gap-2"
						onclick={() => handleOAuthLogin(provider)}
						disabled={loading}
						aria-label={provider.name}
					>
						<Icon class="h-5 w-5" />
						{provider.name}
					</Button>
				{:else if provider.type === 'magic_link'}
					<!-- Email Magic Link Flow -->
					<div class="space-y-2">
						<Input
							type="email"
							placeholder={provider.inputConfig?.placeholder}
							bind:value={email}
							disabled={loading}
							onkeydown={(e) => e.key === 'Enter' && handleEmailSubmit()}
							class="text-foreground"
						/>
						<Button
							variant="outline"
							class="w-full justify-start gap-2"
							onclick={handleEmailSubmit}
							disabled={loading}
						>
							{@const Icon = getProviderIcon(provider.icon)}
							<Icon class="h-5 w-5" />
							{loading ? 'Sending...' : provider.name}
						</Button>
					</div>

					{#if emailSent}
						<div class="text-sm text-foreground">
							A magic link has been sent to <strong>{email}</strong>. Please check your inbox.
						</div>
						<Button
							variant="default"
							class="p-0 text-sm"
							onclick={resetEmailFlow}
							disabled={loading}
						>
							Send to a different email
						</Button>
					{/if}
				{/if}
			{/each}

			<!-- Success Message -->
			{#if message}
				<div
					class="rounded-md border border-success-border bg-success-background p-3 text-sm text-success-foreground"
				>
					{message}
				</div>
			{/if}

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
