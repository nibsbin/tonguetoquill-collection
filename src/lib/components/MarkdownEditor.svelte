<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, keymap, lineNumbers } from '@codemirror/view';
	import { EditorState } from '@codemirror/state';
	import { markdown } from '@codemirror/lang-markdown';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
	import { createEditorTheme } from '$lib/utils/editor-theme';

	interface Props {
		value: string;
		onChange: (value: string) => void;
		onSave?: () => void;
		showLineNumbers?: boolean;
	}

	let { value, onChange, onSave, showLineNumbers = true }: Props = $props();

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

	// Expose handleFormat method for external toolbar
	export function handleFormat(type: string) {
		switch (type) {
			case 'bold':
				handleBold();
				break;
			case 'italic':
				handleItalic();
				break;
			case 'strikethrough':
				handleStrikethrough();
				break;
			case 'code':
				handleCodeBlock();
				break;
			case 'quote':
				handleQuote();
				break;
			case 'bulletList':
				handleBulletList();
				break;
			case 'numberedList':
				handleNumberedList();
				break;
			case 'link':
				handleLink();
				break;
		}
	}
	
	onMount(() => {
		const extensions = [
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
				},
				{
					key: 'Mod-s',
					preventDefault: true,
					run: () => {
						if (onSave) {
							onSave();
						}
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
			createEditorTheme()
		];

		// Conditionally add line numbers
		if (showLineNumbers) {
			extensions.push(lineNumbers());
		}

		const startState = EditorState.create({
			doc: value,
			extensions
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

	// Recreate editor when showLineNumbers changes
	$effect(() => {
		// Only recreate if editor already exists (not initial mount)
		if (editorView && editorElement) {
			const currentValue = editorView.state.doc.toString();
			editorView.destroy();

			const extensions = [
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
					},
					{
						key: 'Mod-s',
						preventDefault: true,
						run: () => {
							if (onSave) {
								onSave();
							}
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
						fontSize: '14px',
						backgroundColor: '#18181b' // zinc-900
					},
					'.cm-scroller': {
						overflow: 'auto',
						fontFamily: 'ui-monospace, monospace'
					},
					'.cm-content': {
						padding: '16px 0',
						color: '#f4f4f5' // zinc-100
					},
					'.cm-line': {
						padding: '0 16px'
					},
					'.cm-cursor': {
						borderLeftColor: '#f4f4f5'
					},
					'.cm-activeLine': {
						backgroundColor: '#27272a' // zinc-800
					},
					'.cm-selectionBackground, .cm-focused .cm-selectionBackground': {
						backgroundColor: '#3f3f46' // zinc-700
					},
					'.cm-gutters': {
						backgroundColor: '#18181b', // match editor background (zinc-900)
						color: '#71717a', // zinc-500
						border: 'none'
					}
				})
			];

			// Conditionally add line numbers
			if (showLineNumbers) {
				extensions.push(lineNumbers());
			}

			const startState = EditorState.create({
				doc: currentValue,
				extensions
			});

			editorView = new EditorView({
				state: startState,
				parent: editorElement
			});
		}
	});
</script>

<!-- Editor -->
<div class="h-full overflow-hidden bg-zinc-900" bind:this={editorElement}></div>
