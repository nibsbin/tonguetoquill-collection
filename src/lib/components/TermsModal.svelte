<script lang="ts">
	import Dialog from '$lib/components/ui/base-dialog.svelte';
	import DialogContent from '$lib/components/ui/dialog-content.svelte';

	interface TermsModalProps {
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}

	let { open, onOpenChange }: TermsModalProps = $props();
</script>

<Dialog {open} {onOpenChange} title="Terms of Use" scoped size="fullscreen">
	{#snippet content()}
		<DialogContent prose fullscreen>
			{#snippet children()}
				<section>
					<h2 class="mb-4 text-2xl">1. Acceptance of Terms</h2>
					<p>
						By accessing and using Tongue to Quill ("the Service"), you agree to be bound by these
						Terms of Use, collectively known as "the Terms". This includes any assets on
						www.tonguetoquill.app, linked products and services, and any other content linked to the
						Service. Please carefully read these terms before use.
						<br /> <br />
						If you are under the age of majority in your jurisdiction (usually 18), you must have your
						parent or legal guardian’s permission to use a Tongue to Quill account. Please have your
						parent or legal guardian read these terms with you.
						<br /> <br />
						If you’re a parent or legal guardian, and you allow your child to use the Tongue to Quill
						services, then these terms apply to you and you’re responsible for your child’s activity
						on the services.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">2. Content Restrictions</h2>
					<p>
						Permission is granted to temporarily access and use the Service for legally authorized
						purposes only, and not to use the service in violation of any applicable laws or
						regulations. TongueToQuill explicitly forbids entering any classified information,
						including but not limited to any information that is subject to the International
						Traffic in Arms Regulations (ITAR), the Export Administration Regulations (EAR), or any
						other applicable export control laws.
						<br /> <br />
						We note that many users in our initial study are from the US Air Force, and we are committed
						to ensuring that our service is used responsibly and ethically. Do not put any Controlled
						Unclassified Information (CUI) or any other classified information into the service.
						<br /> <br />
						Additionally, you agree not to use the service to transmit any harmful code, viruses, or
						malware; impersonate or attempt to impersonate another user or person; harass, abuse, or
						harm another person; interfere with or disrupt the Service or servers; or any other activity
						that violates applicable law.
						<br /> <br />
						If any of your content is found to violate these terms, applicable law, or could harm our
						users, third parties, or TongueToQuill, we reserve the right to remove it and take appropriate
						action, including but not limited to suspending or terminating your account. Examples include
						libel, defamation, hate speech, harassment, and any other content that violates applicable
						law.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">3. User Account</h2>
					<p>
						To use certain features of the Service, you may be required to create an account. You
						are responsible for:
					</p>
					<ul class="list-disc space-y-2 pl-6">
						<li>Maintaining the confidentiality of your account credentials</li>
						<li>All activities that occur under your account</li>
						<li>Notifying us immediately of any unauthorized use of your account</li>
					</ul>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">4. Service Availability</h2>
					<p>
						We strive to provide reliable service, but we do not guarantee that the Service will be
						available at all times. We may experience hardware, software, or other problems or need
						to perform maintenance related to the Service, resulting in interruptions, delays, or
						errors.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">5. Limitation of Liability</h2>
					<p>
						In no event shall Tongue to Quill or its suppliers be liable for any damages (including,
						without limitation, damages for loss of data or profit, or due to business interruption)
						arising out of the use or inability to use the Service.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">6. Termination</h2>
					<p>
						We may terminate or suspend your account and access to the Service immediately, without
						prior notice or liability, for any reason, including breach of these Terms of Use.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">7. Dispute Resolution</h2>
					<p>
						Pennsylvania law will goven all disputes arising out of or relating to these Terms,
						regardless of conflict of laws rules.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">8. Changes to Terms</h2>
					<p>
						We reserve the right to modify these terms at any time. We will notify users of any
						material changes by updating the "Last updated" date. Your continued use of the Service
						after any changes constitutes acceptance of the new terms.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">9. Contact Information</h2>
					<p>If you have any questions about these Terms of Use, please contact us at:</p>
					<p class="font-semibold">support@tonguetoquill.com</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">10. Additional Notes</h2>
					<p>
						You have certain rights that can’t be limited by a contract like these Terms. These
						Terms are in no way intended to restrict those rights.
					</p>
				</section>
			{/snippet}
		</DialogContent>
	{/snippet}
</Dialog>

<!-- Inspiration
https://www.overleaf.com/legal
https://www.google.com/drive/terms-of-service/
https://policies.google.com/terms -->
