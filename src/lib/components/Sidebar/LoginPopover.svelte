<script lang="ts">
	import { Mail, Github } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import { loginClient } from '$lib/services/auth';

	type LoginPopoverProps = {
		onClose?: () => void;
	};

	let { onClose }: LoginPopoverProps = $props();

	let email = $state('');
	let isLoading = $state(false);
	let successMessage = $state('');
	let errorMessage = $state('');

	async function handleEmailLogin() {
		if (!email) {
			errorMessage = 'Please enter your email';
			return;
		}

		isLoading = true;
		errorMessage = '';
		successMessage = '';

		try {
			const result = await loginClient.initiateEmailLogin(email);
			successMessage = result.message;
			email = '';
		} catch (error: any) {
			errorMessage = error.message || 'Failed to send magic link';
		} finally {
			isLoading = false;
		}
	}

	function handleGitHubLogin() {
		loginClient.initiateGitHubLogin();
	}
</script>

<div class="w-72 p-4">
	<h3 class="mb-4 text-lg font-semibold text-foreground">Sign in</h3>

	<!-- GitHub Login Button -->
	<Button
		variant="default"
		class="mb-4 w-full justify-start gap-2"
		onclick={handleGitHubLogin}
		aria-label="Sign in with GitHub"
	>
		<Github class="h-5 w-5" />
		Sign in with GitHub
	</Button>

	<!-- Divider -->
	<div class="relative mb-4">
		<div class="absolute inset-0 flex items-center">
			<div class="w-full border-t border-border"></div>
		</div>
		<div class="relative flex justify-center text-xs uppercase">
			<span class="bg-surface-elevated px-2 text-muted-foreground">Or</span>
		</div>
	</div>

	<!-- Email Login Form -->
	<div class="space-y-3">
		<div class="space-y-2">
			<Label for="login-email" class="text-foreground/80">Email</Label>
			<Input
				id="login-email"
				type="email"
				placeholder="your@email.com"
				bind:value={email}
				disabled={isLoading}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						handleEmailLogin();
					}
				}}
			/>
		</div>

		<Button
			variant="outline"
			class="w-full justify-start gap-2"
			onclick={handleEmailLogin}
			disabled={isLoading}
			aria-label="Send magic link"
		>
			<Mail class="h-5 w-5" />
			{isLoading ? 'Sending...' : 'Send magic link'}
		</Button>

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
</div>
