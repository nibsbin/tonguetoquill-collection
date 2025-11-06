<script lang="ts">
	import Dialog from '$lib/components/ui/base-dialog.svelte';
	import DialogContent from '$lib/components/ui/dialog-content.svelte';

	interface PrivacyModalProps {
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}

	let { open, onOpenChange }: PrivacyModalProps = $props();
</script>

<Dialog {open} {onOpenChange} title="Privacy Policy" scoped size="lg">
	{#snippet content()}
		<DialogContent prose>
			{#snippet children()}
				<section>
					<h2 class="mb-4 text-2xl">1. Introduction</h2>
					<p>
						Tongue to Quill ("we," "our," or "us") is committed to protecting your privacy. This
						Privacy Policy explains how we collect, use, disclose, and safeguard your information
						when you use our document editing service.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">2. Information We Collect</h2>

					<h3 class="mt-4 mb-2 text-xl">2.1 Personal Information</h3>
					<p>When you create an account, we may collect:</p>
					<ul class="list-disc space-y-2 pl-6">
						<li>Email address</li>
						<li>Name (if provided)</li>
						<li>Account credentials</li>
						<li>Profile information</li>
					</ul>

					<h3 class="mt-4 mb-2 text-xl">2.2 Document Content</h3>
					<p>
						We store the documents you create, edit, and manage through our Service. This includes
						text content, formatting, and any files you upload.
					</p>

					<h3 class="mt-4 mb-2 text-xl">2.3 Usage Data</h3>
					<p>We automatically collect certain information when you use the Service, including:</p>
					<ul class="list-disc space-y-2 pl-6">
						<li>Browser type and version</li>
						<li>Device information</li>
						<li>IP address</li>
						<li>Pages visited and features used</li>
						<li>Time and date of access</li>
					</ul>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">3. How We Use Your Information</h2>
					<p>We use the information we collect to:</p>
					<ul class="list-disc space-y-2 pl-6">
						<li>Provide, operate, and maintain the Service</li>
						<li>Improve and personalize your experience</li>
						<li>Process your transactions and manage your account</li>
						<li>Send you technical notices and support messages</li>
						<li>Respond to your inquiries and provide customer support</li>
						<li>Monitor and analyze usage patterns and trends</li>
						<li>Detect, prevent, and address technical issues and security threats</li>
					</ul>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">4. Data Storage and Security</h2>
					<p>
						We implement appropriate technical and organizational security measures to protect your
						information against unauthorized access, alteration, disclosure, or destruction. Your
						documents are stored securely and encrypted both in transit and at rest.
					</p>
					<p>
						However, no method of transmission over the Internet or electronic storage is 100%
						secure. While we strive to use commercially acceptable means to protect your
						information, we cannot guarantee its absolute security.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">5. Data Sharing and Disclosure</h2>
					<p>
						We do not sell your personal information. We may share your information only in the
						following circumstances:
					</p>
					<ul class="list-disc space-y-2 pl-6">
						<li>
							<strong>With your consent:</strong> When you explicitly authorize us to share your information
						</li>
						<li>
							<strong>Service providers:</strong> With third-party vendors who perform services on our
							behalf (e.g., hosting, analytics)
						</li>
						<li>
							<strong>Legal requirements:</strong> When required by law, court order, or government request
						</li>
						<li>
							<strong>Business transfers:</strong> In connection with a merger, acquisition, or sale
							of assets
						</li>
						<li>
							<strong>Protection of rights:</strong> To protect the rights, property, or safety of Tongue
							to Quill, our users, or others
						</li>
					</ul>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">6. Your Rights and Choices</h2>
					<p>You have the right to:</p>
					<ul class="list-disc space-y-2 pl-6">
						<li>
							<strong>Access:</strong> Request a copy of the personal information we hold about you
						</li>
						<li>
							<strong>Correction:</strong> Request correction of inaccurate or incomplete information
						</li>
						<li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
						<li><strong>Export:</strong> Export your documents and data</li>
						<li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
					</ul>
					<p>To exercise these rights, please contact us at privacy@tonguetoquill.com</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">7. Data Retention</h2>
					<p>
						We retain your information for as long as your account is active or as needed to provide
						you with the Service. If you delete your account, we will delete or anonymize your
						information within a reasonable timeframe, except where we are required to retain it for
						legal or regulatory purposes.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">8. Cookies and Tracking Technologies</h2>
					<p>
						We use cookies and similar tracking technologies to track activity on our Service and
						hold certain information. Cookies are files with a small amount of data that may include
						an anonymous unique identifier. You can instruct your browser to refuse all cookies or
						to indicate when a cookie is being sent.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">9. Children's Privacy</h2>
					<p>
						Our Service is not intended for use by children under the age of 13. We do not knowingly
						collect personal information from children under 13. If you become aware that a child
						has provided us with personal information, please contact us.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">10. International Data Transfers</h2>
					<p>
						Your information may be transferred to and maintained on computers located outside of
						your country where data protection laws may differ. By using the Service, you consent to
						the transfer of your information to our facilities and service providers.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">11. Changes to This Privacy Policy</h2>
					<p>
						We may update our Privacy Policy from time to time. We will notify you of any changes by
						posting the new Privacy Policy on this page and updating the "Last updated" date. You
						are advised to review this Privacy Policy periodically for any changes.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">12. Contact Us</h2>
					<p>If you have any questions about this Privacy Policy, please contact us at:</p>
					<p class="font-semibold">privacy@tonguetoquill.com</p>
				</section>
			{/snippet}
		</DialogContent>
	{/snippet}
</Dialog>
