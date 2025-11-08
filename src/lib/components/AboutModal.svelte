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
		<DialogContent prose class="h-full max-h-none overflow-y-auto">
			{#snippet children()}
				<section>
					<h2 class="mb-4 text-2xl">Welcome to Tongue to Quill</h2>
					<p>
						Something as simple and routine as a memo shouldn’t cause stress and hair loss. But this
						is exactly the case John and Nick, fellow US Air Force cadets and classmates at Carnegie
						Mellon University, found themselves in over and over and over again. In situations
						ranging from corporate memos to preparing agendas, meeting minutes, and class notes, we
						often have the main ideas already in our head but end up spending most of our time
						correcting the formatting and fixing glitches that MS Word introduces when we copy-paste
						something from a website. How many times have you copied text from Slack or the internet
						into your document, only to find out later that the font was copied 1 pt. larger than
						the rest of your paragraph? Or your bulleted list won’t move all the way left, because
						Word decided it needed to be ½” to the right? TongueToQuill was born to solve these
						issues once and for all, taking all the things we love about compiled typesetters like
						LaTeX, with the human-readable formatting of Markdown, and put it into a beautiful
						in-browser editor usable by non-coders. We’re a small team of passionate developers who
						came together to build this project, utilizing modern frameworks to give a seamless user
						experience.
					</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl">Contact Us</h2>
					<p>Have questions or feedback? We'd love to hear from you. Please reach out to us at:</p>
					<p class="font-semibold">support@tonguetoquill.com</p>
				</section>

				<section>
					<h2 class="mb-4 text-2xl font-semibold">John Pan</h2>
					<div class="grid gap-8 sm:grid-cols-2">
						<article class="flex flex-col items-start gap-3">
							<img
								src="/team/john_profile.jpeg"
								alt="John photo"
								class="h-40 w-40 rounded-md object-cover"
							/>
							<h3 class="text-xl font-semibold">John Pan: The Fearless Leader</h3>
							<p class="text-muted-foreground">
								John was raised in Texas but cooks fish on the stove. We still don’t know why he
								doesn’t grill. When he’s not serving the country through his cybersecurity work at
								the US Air Force, he’s busy bouldering, debating about the meaning of life in a
								post-AI world, and vibe coding. He was frustrated with writing a 5-minute memo, and
								devoted the majority of the past few months building TTQ so that he could reduce
								that to 3.78 minutes.
							</p>
						</article>

						<article class="flex flex-col items-start gap-3">
							<img
								src="/team/nick_profile.jpeg"
								alt="Nick photo"
								class="h-40 w-40 rounded-md object-cover"
							/>
							<h3 class="text-xl font-semibold">Nick Hamby: The Data Nut</h3>
							<p class="text-muted-foreground">
								Nick is an expert in data, who enjoys all things that fly. He’s a graduate of the US
								Air Force Academy, currently serves in the US Space Force, and is passionate about
								using data to streamline operations. When AFK, he enjoys spending time with his
								fiancee and cooking excellent pasta using recipes from his hometown chef.
							</p>
						</article>

						<article class="flex flex-col items-start gap-3">
							<img
								src="/team/dylan_profile.jpeg"
								alt="Dylan photo"
								class="h-40 w-40 rounded-md object-cover"
							/>
							<h3 class="text-xl font-semibold">Dylan Shah: The User Advocate</h3>
							<p class="text-muted-foreground">
								Dylan is a researcher with interest in the full modern tech stack, from
								semiconductor fabrication up to vibe coding web apps. He has an academic background
								in robotics and materials science, and enjoys thinking laterally to find new
								solutions and opportunities. Outside the lab, he enjoys bouldering and reading about
								new fields or ideas.
							</p>
						</article>

						<article class="flex flex-col items-start gap-3">
							<img
								src="/team/william_profile.jpeg"
								alt="William photo"
								class="h-40 w-40 rounded-md object-cover"
							/>
							<h3 class="text-xl font-semibold">William Bechard: The Designer</h3>
							<p class="text-muted-foreground">
								Will is a developer at Booze Allen Hamilton, where he uses his experience in react
								and angular to build beautiful front-ends for enterprise applications. In his free
								time, Will enjoys game programming, micro-electronics, and woodworking. As a fan of
								Japanese language and AI agentic coding, one day he hopes to be able to vibe code
								using ChatGPT in Japanese
							</p>
						</article>
					</div>
				</section>
			{/snippet}
		</DialogContent>
	{/snippet}
</Dialog>
