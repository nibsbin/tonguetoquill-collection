<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, keymap, lineNumbers } from '@codemirror/view';
	import { EditorState, StateEffect } from '@codemirror/state';
	import { markdown } from '@codemirror/lang-markdown';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
	import {
		foldKeymap,
		foldState,
		codeFolding,
		foldedRanges,
		unfoldEffect
	} from '@codemirror/language';
	import { createEditorTheme } from '$lib/utils/editor-theme';
	import {
		quillmarkDecorator,
		createQuillmarkTheme,
		quillmarkFoldService,
		foldAllMetadataBlocks,
		toggleAllMetadataBlocks
	} from '$lib/editor';

	interface Props {
		value: string;
		onChange: (value: string) => void;
		onSave?: () => void;
		showLineNumbers?: boolean;
	}

	let { value, onChange, onSave, showLineNumbers = false }: Props = $props();

	let editorElement: HTMLDivElement;
	let editorView: EditorView | null = null;
	let isDarkTheme = $state(false);

	// Build the extension list based on current settings
	function buildExtensions() {
		const extensions = [
			markdown(),
			history(),
			keymap.of([
				...defaultKeymap,
				...historyKeymap,
				...foldKeymap,
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
			createEditorTheme(),
			quillmarkDecorator,
			createQuillmarkTheme(),
			quillmarkFoldService,
			foldState,
			codeFolding({
				preparePlaceholder: (_state, range) => range,
				placeholderDOM: (view, onclick, prepared) => {
					const wrapper = document.createElement('span');
					wrapper.className = 'cm-foldPlaceholder';
					wrapper.onclick = onclick;

					const foldedText = view.state.doc.sliceString(prepared.from, prepared.to);
					const contentLines = foldedText
						.trim()
						.split('\n')
						.filter((line) => line.trim() !== '---');
					const firstLine = contentLines[0] || '';

					if (firstLine) {
						wrapper.textContent = `--- ${firstLine} ---`;
					} else {
						wrapper.textContent = '--- ---';
					}

					return wrapper;
				}
			})
		];

		// Conditionally add line numbers
		if (showLineNumbers) {
			extensions.push(lineNumbers());
		}

		return extensions;
	}

	// Extract editor creation logic to follow DRY principles
	function createEditor(content: string) {
		const startState = EditorState.create({
			doc: content,
			extensions: buildExtensions()
		});

		return new EditorView({
			state: startState,
			parent: editorElement
		});
	}

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

	function handleBold() {
		applyFormatting('**');
	}

	function handleItalic() {
		applyFormatting('*');
	}

	function handleStrikethrough() {
		applyFormatting('~~');
	}

	function handleInlineCode() {
		applyFormatting('`');
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

	function handleToggleFrontmatter() {
		if (!editorView) return;
		toggleAllMetadataBlocks(editorView);
	}

	function handleFoldFrontmatter() {
		if (!editorView) return;
		foldAllMetadataBlocks(editorView);
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
				handleInlineCode();
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
			case 'toggleFrontmatter':
				handleToggleFrontmatter();
				break;
			case 'foldFrontmatter':
				handleFoldFrontmatter();
				break;
		}
	}

	onMount(() => {
		// Detect initial theme
		isDarkTheme = document.documentElement.classList.contains('dark');

		// Create initial editor
		editorView = createEditor(value);

		// Watch for theme changes via MutationObserver
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === 'class') {
					const newIsDarkTheme = document.documentElement.classList.contains('dark');
					if (isDarkTheme !== newIsDarkTheme) {
						isDarkTheme = newIsDarkTheme;
					}
				}
			});
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});

		return () => {
			observer.disconnect();
		};
	});

	onDestroy(() => {
		editorView?.destroy();
	});

	// Update editor when value changes externally
	$effect(() => {
		if (editorView && editorView.state.doc.toString() !== value) {
			// Clear all existing folds before replacing content to prevent
			// fold state from the previous document interfering with the new document
			const effects: StateEffect<unknown>[] = [];
			const folded = foldedRanges(editorView.state);
			folded.between(0, editorView.state.doc.length, (from, to) => {
				effects.push(unfoldEffect.of({ from, to }));
			});

			// Dispatch transaction with content replacement and fold clearing
			editorView.dispatch({
				changes: {
					from: 0,
					to: editorView.state.doc.length,
					insert: value
				},
				effects
			});
		}
	});

	// Reconfigure editor when showLineNumbers or theme changes
	$effect(() => {
		// Track both showLineNumbers and isDarkTheme for reactivity
		// use `void` to satisfy linters that disallow unused expressions
		void showLineNumbers;
		void isDarkTheme;

		// Only reconfigure if editor already exists (not initial mount)
		if (editorView) {
			// Use requestAnimationFrame to ensure CSS custom properties have updated
			// before reconfiguring the editor with new theme extensions
			requestAnimationFrame(() => {
				if (editorView) {
					editorView.dispatch({
						effects: StateEffect.reconfigure.of(buildExtensions())
					});
				}
			});
		}
	});
</script>

<!-- Editor -->
<div class="bg-editor-background h-full overflow-hidden" bind:this={editorElement}></div>
