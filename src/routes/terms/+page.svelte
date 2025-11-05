<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { ArrowLeft } from 'lucide-svelte';

	function returnToApp() {
		window.location.href = '/';
	}
</script>

<svelte:head>
	<title>Terms of Use - Tongue to Quill</title>
</svelte:head>

<div class="h-screen bg-background text-foreground overflow-y-auto">
	<div class="container mx-auto px-4 py-8 max-w-4xl pb-24">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">Terms of Use</h1>
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
				<h2 class="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
				<p>
					By accessing and using Tongue to Quill ("the Service"), you agree to be bound by these
					Terms of Use. If you do not agree to these terms, please do not use the Service.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">2. Use License</h2>
				<p>
					Permission is granted to temporarily access and use the Service for personal,
					non-commercial transitory viewing only. This is the grant of a license, not a transfer of
					title, and under this license you may not:
				</p>
				<ul class="list-disc pl-6 space-y-2">
					<li>Modify or copy the materials</li>
					<li>Use the materials for any commercial purpose or for any public display</li>
					<li>Attempt to reverse engineer any software contained on the Service</li>
					<li>Remove any copyright or other proprietary notations from the materials</li>
					<li>Transfer the materials to another person or "mirror" the materials on any other server</li>
				</ul>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">3. User Account</h2>
				<p>
					To use certain features of the Service, you may be required to create an account. You are
					responsible for:
				</p>
				<ul class="list-disc pl-6 space-y-2">
					<li>Maintaining the confidentiality of your account credentials</li>
					<li>All activities that occur under your account</li>
					<li>Notifying us immediately of any unauthorized use of your account</li>
				</ul>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">4. User Content</h2>
				<p>
					You retain all rights to any content you submit, post, or display on or through the
					Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free
					license to use, reproduce, and store your content solely for the purpose of providing the
					Service to you.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
				<p>You agree not to use the Service:</p>
				<ul class="list-disc pl-6 space-y-2">
					<li>In any way that violates any applicable law or regulation</li>
					<li>To transmit any harmful code, viruses, or malware</li>
					<li>To impersonate or attempt to impersonate another user or person</li>
					<li>To harass, abuse, or harm another person</li>
					<li>To interfere with or disrupt the Service or servers</li>
				</ul>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">6. Service Availability</h2>
				<p>
					We strive to provide reliable service, but we do not guarantee that the Service will be
					available at all times. We may experience hardware, software, or other problems or need to
					perform maintenance related to the Service, resulting in interruptions, delays, or errors.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
				<p>
					In no event shall Tongue to Quill or its suppliers be liable for any damages (including,
					without limitation, damages for loss of data or profit, or due to business interruption)
					arising out of the use or inability to use the Service.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">8. Termination</h2>
				<p>
					We may terminate or suspend your account and access to the Service immediately, without
					prior notice or liability, for any reason, including breach of these Terms of Use.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
				<p>
					We reserve the right to modify these terms at any time. We will notify users of any
					material changes by updating the "Last updated" date. Your continued use of the Service
					after any changes constitutes acceptance of the new terms.
				</p>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">10. Contact Information</h2>
				<p>
					If you have any questions about these Terms of Use, please contact us at:
				</p>
				<p class="font-medium">legal@tonguetoquill.com</p>
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
