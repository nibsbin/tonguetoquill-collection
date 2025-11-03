<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, keymap, lineNumbers } from '@codemirror/view';
	import { EditorState } from '@codemirror/state';
	import { markdown } from '@codemirror/lang-markdown';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
	import {
		foldKeymap,
		foldEffect,
		foldState,
		unfoldEffect,
		foldedRanges,
		codeFolding
	} from '@codemirror/language';
	import { createEditorTheme } from '$lib/utils/editor-theme';
	import {
		quillmarkDecorator,
		createQuillmarkTheme,
		quillmarkFoldService,
		isMetadataDelimiter
	} from '$lib/editor';

	interface Props {
		value: string;
		onChange: (value: string) => void;
		onSave?: () => void;
		showLineNumbers?: boolean;
	}

	let { value, onChange, onSave, showLineNumbers = true }: Props = $props();

	let editorElement: HTMLDivElement;
	let editorView: EditorView | null = null;
	let isDarkTheme = $state(false);

	// Extract editor creation logic to follow DRY principles
	function createEditor(content: string) {
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
				preparePlaceholder: (state, range) => range,
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

		const startState = EditorState.create({
			doc: content,
			extensions
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

	// insertAtCursor removed: previously unused utility for inserting text at the
	// editor cursor. Kept formatting helpers above; if insertion is needed later
	// we can reintroduce a focused implementation then.

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

		const state = editorView.state;
		const doc = state.doc;
		const effects = [];

		// Get currently folded ranges
		const folded = foldedRanges(state);
		const metadataBlocks = [];

		// Find all metadata blocks
		for (let lineNum = 1; lineNum <= doc.lines; lineNum++) {
			if (isMetadataDelimiter(lineNum, doc)) {
				const line = doc.line(lineNum);

				// Find the closing delimiter
				let closingLineNum = null;
				for (let j = lineNum + 1; j <= doc.lines; j++) {
					if (isMetadataDelimiter(j, doc)) {
						closingLineNum = j;
						break;
					}
				}

				if (closingLineNum !== null) {
					const closingLine = doc.line(closingLineNum);
					const foldTo = closingLine.to < doc.length ? closingLine.to + 1 : closingLine.to;
					metadataBlocks.push({ from: line.from, to: foldTo });
					lineNum = closingLineNum;
				}
			}
		}

		// Check if ALL metadata blocks are currently folded
		let allFolded = metadataBlocks.length > 0;
		for (const block of metadataBlocks) {
			let isFolded = false;
			folded.between(block.from, block.to, (from, to) => {
				if (from === block.from && to === block.to) {
					isFolded = true;
					return false;
				}
			});
			if (!isFolded) {
				allFolded = false;
				break;
			}
		}

		// Toggle: if ALL are folded, unfold all. Otherwise (if any are expanded), fold all.
		if (allFolded) {
			// Unfold all metadata blocks
			for (const block of metadataBlocks) {
				effects.push(unfoldEffect.of({ from: block.from, to: block.to }));
			}
		} else {
			// Fold all metadata blocks
			for (const block of metadataBlocks) {
				effects.push(foldEffect.of({ from: block.from, to: block.to }));
			}
		}

		// Apply all effects at once
		if (effects.length > 0) {
			editorView.dispatch({ effects });
		}

		editorView.focus();
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
			editorView.dispatch({
				changes: {
					from: 0,
					to: editorView.state.doc.length,
					insert: value
				}
			});
		}
	});

	// Recreate editor when showLineNumbers or theme changes
	$effect(() => {
		// Track both showLineNumbers and isDarkTheme for reactivity
		// use `void` to satisfy linters that disallow unused expressions
		void showLineNumbers;
		void isDarkTheme;

		// Only recreate if editor already exists (not initial mount)
		if (editorView && editorElement) {
			const currentValue = editorView.state.doc.toString();
			editorView.destroy();

			// Use requestAnimationFrame to ensure CSS custom properties have updated
			// before creating the new editor with theme extensions
			requestAnimationFrame(() => {
				editorView = createEditor(currentValue);
			});
		}
	});
</script>

<!-- Editor -->
<div class="bg-editor-background h-full overflow-hidden" bind:this={editorElement}></div>
