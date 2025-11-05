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
	const providers = browser ? loginClient.getAvailableProviders() : [];

	// State management
	let email = $state('');
	let otp = $state('');
	let showOTPInput = $state(false);
	let loading = $state(false);
	let message = $state('');
	let error = $state('');

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
			showOTPInput = true;
		} catch (err: any) {
			error = err.message || 'Failed to send email';
		} finally {
			loading = false;
		}
	}

	async function handleOTPSubmit() {
		if (!otp || !otp.trim()) {
			error = 'Please enter the verification code';
			return;
		}

		loading = true;
		error = '';

		try {
			await loginClient.verifyEmailOTP(email, otp);
			// Success! Redirect will happen automatically
			window.location.href = '/';
		} catch (err: any) {
			error = err.message || 'Invalid verification code';
			loading = false;
		}
	}

	function resetEmailFlow() {
		showOTPInput = false;
		otp = '';
		error = '';
		message = '';
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
				{#if provider.type === 'oauth'}
					<!-- OAuth Button (GitHub) -->
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
				{:else if provider.type === 'email_otp'}
					<!-- Email OTP Flow -->
					{#if !showOTPInput}
						<!-- Step 1: Enter Email -->
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
					{:else}
						<!-- Step 2: Enter OTP -->
						<div class="space-y-2">
							<Input
								type="text"
								placeholder="Enter 6-digit code"
								bind:value={otp}
								disabled={loading}
								maxlength="6"
								onkeydown={(e) => e.key === 'Enter' && handleOTPSubmit()}
								class="text-center text-lg tracking-widest text-foreground"
							/>
							<Button variant="default" class="w-full" onclick={handleOTPSubmit} disabled={loading}>
								{loading ? 'Verifying...' : 'Verify Code'}
							</Button>
							<button
								class="w-full text-center text-sm text-muted-foreground underline hover:text-foreground"
								onclick={resetEmailFlow}
								disabled={loading}
							>
								Use a different email
							</button>
						</div>
					{/if}
				{/if}
			{/each}

			<!-- Success Message -->
			{#if message}
				<div
					class="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300"
				>
					{message}
				</div>
			{/if}

			<!-- Error Message -->
			{#if error}
				<div
					class="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300"
				>
					{error}
				</div>
			{/if}
		</div>
	{/if}
</div>
