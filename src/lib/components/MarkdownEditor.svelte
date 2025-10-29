<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, keymap } from '@codemirror/view';
	import { EditorState } from '@codemirror/state';
	import { markdown } from '@codemirror/lang-markdown';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';

	interface Props {
		value: string;
		onChange: (value: string) => void;
	}

	let { value, onChange }: Props = $props();

	let editorElement: HTMLDivElement;
	let editorView: EditorView | null = null;

	function applyFormatting(prefix: string, suffix: string = prefix) {
		if (!editorView) return;

		const state = editorView.state;
		const selection = state.selection.main;
		const selectedText = state.doc.sliceString(selection.from, selection.to);

		let transaction;
		if (selectedText) {
			// Wrap selected text
			transaction = state.update({
				changes: {
					from: selection.from,
					to: selection.to,
					insert: `${prefix}${selectedText}${suffix}`
				},
				selection: {
					anchor: selection.from + prefix.length,
					head: selection.to + prefix.length
				}
			});
		} else {
			// Insert placeholder
			const placeholder = 'text';
			transaction = state.update({
				changes: {
					from: selection.from,
					insert: `${prefix}${placeholder}${suffix}`
				},
				selection: {
					anchor: selection.from + prefix.length,
					head: selection.from + prefix.length + placeholder.length
				}
			});
		}

		editorView.dispatch(transaction);
		editorView.focus();
	}

	function insertAtCursor(text: string) {
		if (!editorView) return;

		const state = editorView.state;
		const selection = state.selection.main;

		const transaction = state.update({
			changes: {
				from: selection.from,
				to: selection.to,
				insert: text
			},
			selection: {
				anchor: selection.from + text.length
			}
		});

		editorView.dispatch(transaction);
		editorView.focus();
	}

	function handleBold() {
		applyFormatting('**');
	}

	function handleItalic() {
		applyFormatting('*');
	}

	function handleStrikethrough() {
		applyFormatting('~~');
	}

	function handleCodeBlock() {
		insertAtCursor('\n```\ncode\n```\n');
	}

	function handleQuote() {
		const state = editorView?.state;
		if (!state) return;

		const selection = state.selection.main;
		const line = state.doc.lineAt(selection.from);
		const lineText = line.text;

		if (lineText.startsWith('> ')) {
			// Remove quote
			const transaction = state.update({
				changes: {
					from: line.from,
					to: line.from + 2,
					insert: ''
				}
			});
			editorView?.dispatch(transaction);
		} else {
			// Add quote
			const transaction = state.update({
				changes: {
					from: line.from,
					insert: '> '
				}
			});
			editorView?.dispatch(transaction);
		}
		editorView?.focus();
	}

	function handleBulletList() {
		const state = editorView?.state;
		if (!state) return;

		const selection = state.selection.main;
		const line = state.doc.lineAt(selection.from);
		const lineText = line.text;

		if (lineText.startsWith('- ')) {
			// Remove bullet
			const transaction = state.update({
				changes: {
					from: line.from,
					to: line.from + 2,
					insert: ''
				}
			});
			editorView?.dispatch(transaction);
		} else {
			// Add bullet
			const transaction = state.update({
				changes: {
					from: line.from,
					insert: '- '
				}
			});
			editorView?.dispatch(transaction);
		}
		editorView?.focus();
	}

	function handleNumberedList() {
		const state = editorView?.state;
		if (!state) return;

		const selection = state.selection.main;
		const line = state.doc.lineAt(selection.from);

		// Add numbered list
		const transaction = state.update({
			changes: {
				from: line.from,
				insert: '1. '
			}
		});
		editorView?.dispatch(transaction);
		editorView?.focus();
	}

	function handleLink() {
		applyFormatting('[', '](url)');
	}

	onMount(() => {
		const startState = EditorState.create({
			doc: value,
			extensions: [
				markdown(),
				history(),
				keymap.of([
					...defaultKeymap,
					...historyKeymap,
					{
						key: 'Mod-b',
						run: () => {
							handleBold();
							return true;
						}
					},
					{
						key: 'Mod-i',
						run: () => {
							handleItalic();
							return true;
						}
					}
				]),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						onChange(update.state.doc.toString());
					}
				}),
				EditorView.lineWrapping,
				EditorView.theme({
					'&': {
						height: '100%',
						fontSize: '14px'
					},
					'.cm-scroller': {
						overflow: 'auto',
						fontFamily: 'ui-monospace, monospace'
					},
					'.cm-content': {
						padding: '16px 0'
					},
					'.cm-line': {
						padding: '0 16px'
					}
				})
			]
		});

		editorView = new EditorView({
			state: startState,
			parent: editorElement
		});
	});

	onDestroy(() => {
		editorView?.destroy();
	});

	// Update editor when value changes externally
	$effect(() => {
		if (editorView && editorView.state.doc.toString() !== value) {
			editorView.dispatch({
				changes: {
					from: 0,
					to: editorView.state.doc.length,
					insert: value
				}
			});
		}
	});
</script>

<div class="flex h-full flex-col">
	<!-- Toolbar -->
	<div class="flex items-center gap-1 border-b border-zinc-200 bg-white px-2 py-1">
		<button
			onclick={handleBold}
			class="rounded p-2 text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none"
			title="Bold (Ctrl+B)"
			aria-label="Bold"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="3"
					d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
				/>
			</svg>
		</button>

		<button
			onclick={handleItalic}
			class="rounded p-2 text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none"
			title="Italic (Ctrl+I)"
			aria-label="Italic"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 4l4 16m-8-8h8"
				/>
			</svg>
		</button>

		<button
			onclick={handleStrikethrough}
			class="rounded p-2 text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none"
			title="Strikethrough"
			aria-label="Strikethrough"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 12h18M9 5h6m-7 14h8"
				/>
			</svg>
		</button>

		<div class="mx-1 h-6 w-px bg-zinc-300"></div>

		<button
			onclick={handleCodeBlock}
			class="rounded p-2 text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none"
			title="Code block"
			aria-label="Code block"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
				/>
			</svg>
		</button>

		<button
			onclick={handleQuote}
			class="rounded p-2 text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none"
			title="Quote"
			aria-label="Quote"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
				/>
			</svg>
		</button>

		<div class="mx-1 h-6 w-px bg-zinc-300"></div>

		<button
			onclick={handleBulletList}
			class="rounded p-2 text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none"
			title="Bullet list"
			aria-label="Bullet list"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button>

		<button
			onclick={handleNumberedList}
			class="rounded p-2 text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none"
			title="Numbered list"
			aria-label="Numbered list"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 4h1v5H3m2-5h1M3 14h2m-2 0v5h2m-2-5h2m10-9h6m-6 5h6m-6 5h6m-6 5h6"
				/>
			</svg>
		</button>

		<button
			onclick={handleLink}
			class="rounded p-2 text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none"
			title="Insert link"
			aria-label="Insert link"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
				/>
			</svg>
		</button>
	</div>

	<!-- Editor -->
	<div class="flex-1 overflow-hidden" bind:this={editorElement}></div>
</div>
