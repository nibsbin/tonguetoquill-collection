<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let dodid = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleRegister(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password, dodid: dodid || undefined })
			});

			if (response.ok) {
				goto('/');
			} else {
				const data = await response.json();
				error = data.message || 'Registration failed';
			}
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h1 class="text-3xl font-bold text-zinc-900">Create your account</h1>
			<p class="mt-2 text-sm text-zinc-600">Get started with Tonguetoquill</p>
		</div>

		<form onsubmit={handleRegister} class="mt-8 space-y-6">
			{#if error}
				<div class="rounded-md bg-red-50 p-4">
					<p class="text-sm text-red-800">{error}</p>
				</div>
			{/if}

			<div class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-zinc-700">Email address</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						bind:value={email}
						class="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						placeholder="you@example.com"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-zinc-700">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="new-password"
						required
						bind:value={password}
						class="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						placeholder="••••••••"
					/>
				</div>

				<div>
					<label for="dodid" class="block text-sm font-medium text-zinc-700"
						>DOD ID (Optional)</label
					>
					<input
						id="dodid"
						name="dodid"
						type="text"
						bind:value={dodid}
						class="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						placeholder="1234567890"
					/>
				</div>
			</div>

			<div>
				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:bg-zinc-400"
				>
					{loading ? 'Creating account...' : 'Create account'}
				</button>
			</div>

			<div class="text-center text-sm">
				<span class="text-zinc-600">Already have an account?</span>
				<a href="/login" class="font-medium text-blue-600 hover:text-blue-500"> Sign in </a>
			</div>
		</form>
	</div>
</div>
