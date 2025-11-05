<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { ArrowLeft } from 'lucide-svelte';

	function returnToApp() {
		window.location.href = '/';
	}
</script>

<svelte:head>
	<title>About Us - Tongue to Quill</title>
</svelte:head>

<div class="h-screen bg-background text-foreground overflow-y-auto">
	<div class="container mx-auto px-4 py-8 max-w-4xl pb-24">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">About Us</h1>
			<p class="text-muted-foreground">
				Last updated: {new Date().toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</p>
		</div>

		<!-- Content -->
		<div class="prose prose-neutral dark:prose-invert max-w-none space-y-6">
			<section>
				<h2 class="text-2xl font-semibold mb-4">Welcome to Tongue to Quill</h2>
				<p>
					Tongue to Quill is a modern document editing platform designed to streamline your writing
					and collaboration workflow. Our mission is to provide powerful, intuitive tools that help
					you create, edit, and manage documents with ease.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">What We Do</h2>
				<p>
					We provide a comprehensive document editing solution that combines the power of
					professional word processing with the simplicity of modern web applications. Whether
					you're drafting a quick note or working on a complex document, Tongue to Quill adapts to
					your needs.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Our Features</h2>
				<ul class="list-disc pl-6 space-y-2">
					<li>Rich text editing with advanced formatting options</li>
					<li>Real-time document preview and export capabilities</li>
					<li>Secure cloud storage for all your documents</li>
					<li>Intuitive user interface designed for productivity</li>
					<li>Cross-platform compatibility</li>
				</ul>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Our Commitment</h2>
				<p>
					We are committed to protecting your privacy and providing a secure, reliable platform for
					your document needs. Your data belongs to you, and we take every measure to ensure it
					stays safe and accessible only to you.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">Contact Us</h2>
				<p>
					Have questions or feedback? We'd love to hear from you. Please reach out to us at:
				</p>
				<p class="font-medium">support@tonguetoquill.com</p>
			</section>
		</div>

		<!-- Footer -->
		<div class="mt-12 pt-6 border-t flex gap-3">
			<Button variant="default" on:click={returnToApp}>
				<ArrowLeft class="mr-2 h-4 w-4" />
				Return to App
			</Button>
			<Button variant="outline" on:click={() => window.close()}>Close Tab</Button>
		</div>
	</div>
</div>

<style>
	.prose h2 {
		margin-top: 2rem;
	}

	.prose p {
		line-height: 1.75;
	}
</style>
