<script lang="ts">
	import Dialog from '$lib/components/ui/base-dialog.svelte';
	import DialogContent from '$lib/components/ui/dialog-content.svelte';

	interface AboutModalProps {
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}

	let { open, onOpenChange }: AboutModalProps = $props();
</script>

<Dialog {open} {onOpenChange} title="About Us" scoped size="fullscreen">
	{#snippet content()}
		<DialogContent prose fullscreen>
			{#snippet children()}
				<section>
					<h2 class="mb-4 text-2xl">Welcome to Tongue to Quill</h2>
					<p>
						Tongue to Quill is a modern document editing platform designed to streamline your
						writing and collaboration workflow. Our mission is to provide powerful, intuitive tools
						that help you create, edit, and manage documents with ease.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">What We Do</h2>
					<p>
						We provide a comprehensive document editing solution that combines the power of
						professional word processing with the simplicity of modern web applications. Whether
						you're drafting a quick note or working on a complex document, Tongue to Quill adapts to
						your needs.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">Our Features</h2>
					<ul class="list-disc space-y-2 pl-6">
						<li>Rich text editing with advanced formatting options</li>
						<li>Real-time document preview and export capabilities</li>
						<li>Secure cloud storage for all your documents</li>
						<li>Intuitive user interface designed for productivity</li>
						<li>Cross-platform compatibility</li>
					</ul>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">Our Commitment</h2>
					<p>
						We are committed to protecting your privacy and providing a secure, reliable platform
						for your document needs. Your data belongs to you, and we take every measure to ensure
						it stays safe and accessible only to you.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">Contact Us</h2>
					<p>Have questions or feedback? We'd love to hear from you. Please reach out to us at:</p>
					<p class="font-semibold">support@tonguetoquill.com</p>
				</section>
			{/snippet}
		</DialogContent>
	{/snippet}
</Dialog>
