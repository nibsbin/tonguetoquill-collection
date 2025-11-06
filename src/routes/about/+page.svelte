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

<div class="h-screen overflow-y-auto bg-background text-foreground">
	<div class="container mx-auto max-w-4xl px-4 py-8 pb-24">
		<!-- Header -->
		<div class="mb-8">
			<div class="mb-4 flex items-center justify-between">
				<h1 class="text-4xl font-bold">About Us</h1>
				<Button class="bg-foreground text-background hover:bg-foreground/90" onclick={returnToApp}>
					<ArrowLeft class="mr-2 h-4 w-4" />
					Return to App
				</Button>
			</div>
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
				<h2 class="mb-4 text-2xl font-semibold">Welcome to Tongue to Quill</h2>
				<p>
					Tongue to Quill is a modern document editing platform designed to streamline your writing
					and collaboration workflow. Our mission is to provide powerful, intuitive tools that help
					you create, edit, and manage documents with ease.
				</p>
			</section>

			<section>
				<h2 class="mb-4 text-2xl font-semibold">What We Do</h2>
				<p>
					We provide a comprehensive document editing solution that combines the power of
					professional word processing with the simplicity of modern web applications. Whether
					you're drafting a quick note or working on a complex document, Tongue to Quill adapts to
					your needs.
				</p>
			</section>

			<section>
				<h2 class="mb-4 text-2xl font-semibold">Our Features</h2>
				<ul class="list-disc space-y-2 pl-6">
					<li>Rich text editing with advanced formatting options</li>
					<li>Real-time document preview and export capabilities</li>
					<li>Secure cloud storage for all your documents</li>
					<li>Intuitive user interface designed for productivity</li>
					<li>Cross-platform compatibility</li>
				</ul>
			</section>

			<section>
				<h2 class="mb-4 text-2xl font-semibold">Our Commitment</h2>
				<p>
					We are committed to protecting your privacy and providing a secure, reliable platform for
					your document needs. Your data belongs to you, and we take every measure to ensure it
					stays safe and accessible only to you.
				</p>
			</section>

			<section>
				<h2 class="mb-4 text-2xl font-semibold">Contact Us</h2>
				<p>Have questions or feedback? We'd love to hear from you. Please reach out to us at:</p>
				<p class="font-medium">support@tonguetoquill.com</p>
			</section>
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
