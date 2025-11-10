import {
	ViewPlugin,
	Decoration,
	type DecorationSet,
	type EditorView,
	WidgetType
} from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { foldedRanges, foldEffect, unfoldEffect } from '@codemirror/language';
import {
	findMetadataBlocks,
	findScopeQuillKeywords,
	findYamlPairs,
	findYamlComments,
	findMarkdownBold,
	findMarkdownItalic,
	findMarkdownLinks,
	type MetadataBlock
} from './quillmark-patterns';
import { foldMetadataBlockAtPosition } from './quillmark-fold-utils';

/**
 * Widget for clickable opening delimiter that triggers folding
 */
class FoldableDelimiterWidget extends WidgetType {
	constructor(private lineNumber: number) {
		super();
	}

	toDOM(view: EditorView): HTMLElement {
		const span = document.createElement('span');
		span.className = 'cm-quillmark-delimiter';
		span.textContent = '---';
		span.style.cursor = 'pointer';
		span.onclick = (e) => {
			e.preventDefault();
			const line = view.state.doc.line(this.lineNumber);
			foldMetadataBlockAtPosition(view, line.from);
		};
		return span;
	}
}

/**
 * Widget for non-clickable closing delimiter
 */
class ClosingDelimiterWidget extends WidgetType {
	toDOM(_view: EditorView): HTMLElement {
		const span = document.createElement('span');
		span.className = 'cm-quillmark-delimiter';
		span.textContent = '---';
		return span;
	}
}

/**
 * Decoration marks for QuillMark syntax elements
 */
const blockMark = Decoration.line({ class: 'cm-quillmark-block' });
const scopeKeywordMark = Decoration.mark({ class: 'cm-quillmark-scope-keyword' });
const quillKeywordMark = Decoration.mark({ class: 'cm-quillmark-quill-keyword' });
const scopeNameMark = Decoration.mark({ class: 'cm-quillmark-scope-name' });
const yamlKeyMark = Decoration.mark({ class: 'cm-quillmark-yaml-key' });
const yamlStringMark = Decoration.mark({ class: 'cm-quillmark-yaml-string' });
const yamlNumberMark = Decoration.mark({ class: 'cm-quillmark-yaml-number' });
const yamlBooleanMark = Decoration.mark({ class: 'cm-quillmark-yaml-bool' });
const yamlCommentMark = Decoration.mark({ class: 'cm-quillmark-yaml-comment' });

/**
 * Decoration marks for Markdown syntax elements
 */
const markdownBoldDelimiterMark = Decoration.mark({ class: 'cm-markdown-bold-delimiter' });
const markdownBoldContentMark = Decoration.mark({ class: 'cm-markdown-bold-content' });
const markdownItalicDelimiterMark = Decoration.mark({ class: 'cm-markdown-italic-delimiter' });
const markdownItalicContentMark = Decoration.mark({ class: 'cm-markdown-italic-content' });
const markdownLinkTextMark = Decoration.mark({ class: 'cm-markdown-link-text' });
const markdownLinkUrlMark = Decoration.mark({ class: 'cm-markdown-link-url' });
const markdownLinkBracketMark = Decoration.mark({ class: 'cm-markdown-link-bracket' });

/**
 * QuillMark decorator plugin
 * Provides syntax highlighting for QuillMark metadata blocks
 */
class QuillMarkDecorator {
	decorations: DecorationSet;

	constructor(view: EditorView) {
		this.decorations = this.computeDecorations(view);
	}

	update(update: any) {
		// Check if any fold/unfold effects were applied
		let hasFoldChange = false;
		for (const transaction of update.transactions) {
			for (const effect of transaction.effects) {
				if (effect.is(foldEffect) || effect.is(unfoldEffect)) {
					hasFoldChange = true;
					break;
				}
			}
			if (hasFoldChange) break;
		}

		// Recompute decorations if document changed, viewport changed, or fold state changed
		if (update.docChanged || update.viewportChanged || hasFoldChange) {
			this.decorations = this.computeDecorations(update.view);
		}
	}

	computeDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		const doc = view.state.doc;

		// Find all metadata blocks
		const blocks = findMetadataBlocks(doc);

		// Collect all decorations from all visible blocks first
		const allDecorations: Array<{
			from: number;
			to: number;
			decoration: Decoration;
			isLine: boolean;
		}> = [];

		// Only process visible blocks for performance
		// Note: For documents with many blocks, this could be optimized with
		// binary search or spatial indexing to find intersecting blocks more efficiently
		for (const { from, to } of view.visibleRanges) {
			for (const block of blocks) {
				// Skip blocks outside visible range
				if (block.to < from || block.from > to) continue;

				this.collectBlockDecorations(allDecorations, block, doc, view);
			}

			// Collect markdown decorations for visible ranges
			// These are applied to content outside metadata blocks
			this.collectMarkdownDecorations(allDecorations, from, to, doc);
		}

		// Sort all decorations by position before adding to builder
		allDecorations.sort((a, b) => {
			if (a.from !== b.from) return a.from - b.from;
			if (a.to !== b.to) return a.to - b.to;
			// Line decorations (isLine=true) should come before mark decorations (isLine=false)
			if (a.isLine !== b.isLine) return a.isLine ? -1 : 1;
			return 0;
		});

		// Add all decorations in sorted order
		for (const { from, to, decoration } of allDecorations) {
			builder.add(from, to, decoration);
		}

		return builder.finish();
	}

	collectBlockDecorations(
		decorations: Array<{
			from: number;
			to: number;
			decoration: Decoration;
			isLine: boolean;
		}>,
		block: MetadataBlock,
		doc: import('@codemirror/state').Text,
		view: EditorView
	) {
		// Collect all decorations for this block
		// We need to track the type to ensure line decorations come before mark decorations

		// Check if this block is currently folded
		const folded = foldedRanges(view.state);
		let isFolded = false;
		folded.between(block.from, block.to, (from) => {
			if (from === block.from) {
				isFolded = true;
				return false;
			}
		});

		// Decorate opening delimiter line
		const openLine = doc.lineAt(block.from);
		decorations.push({
			from: openLine.from,
			to: openLine.from,
			decoration: blockMark,
			isLine: true
		});

		// Only replace the opening delimiter with a clickable widget if not folded
		if (!isFolded) {
			decorations.push({
				from: openLine.from,
				to: openLine.to,
				decoration: Decoration.replace({
					widget: new FoldableDelimiterWidget(openLine.number)
				}),
				isLine: false
			});
		}

		// Decorate all content lines in the block
		let pos = openLine.to;
		while (pos < block.contentTo) {
			const line = doc.lineAt(pos + 1);
			if (line.from >= block.contentTo) break;
			decorations.push({ from: line.from, to: line.from, decoration: blockMark, isLine: true });
			pos = line.to;
		}

		// Decorate closing delimiter line if it exists
		if (block.contentTo < block.to) {
			const closeLine = doc.lineAt(block.to);
			decorations.push({
				from: closeLine.from,
				to: closeLine.from,
				decoration: blockMark,
				isLine: true
			});
			decorations.push({
				from: closeLine.from,
				to: closeLine.to,
				decoration: Decoration.replace({
					widget: new ClosingDelimiterWidget()
				}),
				isLine: false
			});
		}

		// Decorate SCOPE/QUILL keywords within the block
		const keywords = findScopeQuillKeywords(block.contentFrom, block.contentTo, doc);
		for (const keyword of keywords) {
			const keywordMark = keyword.keyword === 'SCOPE' ? scopeKeywordMark : quillKeywordMark;
			decorations.push({
				from: keyword.keywordFrom,
				to: keyword.keywordTo,
				decoration: keywordMark,
				isLine: false
			});
			decorations.push({
				from: keyword.nameFrom,
				to: keyword.nameTo,
				decoration: scopeNameMark,
				isLine: false
			});
		}

		// Decorate YAML key-value pairs
		const yamlPairs = findYamlPairs(block.contentFrom, block.contentTo, doc);
		for (const pair of yamlPairs) {
			decorations.push({
				from: pair.keyFrom,
				to: pair.keyTo,
				decoration: yamlKeyMark,
				isLine: false
			});

			// Only add value decoration if there's actually a value (not zero-width)
			if (pair.valueFrom < pair.valueTo) {
				const valueMark =
					pair.valueType === 'string'
						? yamlStringMark
						: pair.valueType === 'number'
							? yamlNumberMark
							: pair.valueType === 'boolean'
								? yamlBooleanMark
								: yamlStringMark; // Default to string for unknown types

				decorations.push({
					from: pair.valueFrom,
					to: pair.valueTo,
					decoration: valueMark,
					isLine: false
				});
			}
		}

		// Decorate YAML comments
		const yamlComments = findYamlComments(block.contentFrom, block.contentTo, doc);
		for (const comment of yamlComments) {
			decorations.push({
				from: comment.from,
				to: comment.to,
				decoration: yamlCommentMark,
				isLine: false
			});
		}
	}

	collectMarkdownDecorations(
		decorations: Array<{
			from: number;
			to: number;
			decoration: Decoration;
			isLine: boolean;
		}>,
		from: number,
		to: number,
		doc: import('@codemirror/state').Text
	) {
		// Find and decorate bold patterns
		const boldPatterns = findMarkdownBold(from, to, doc);
		for (const bold of boldPatterns) {
			// Opening delimiter
			decorations.push({
				from: bold.openDelimiterFrom,
				to: bold.openDelimiterTo,
				decoration: markdownBoldDelimiterMark,
				isLine: false
			});

			// Content
			decorations.push({
				from: bold.contentFrom,
				to: bold.contentTo,
				decoration: markdownBoldContentMark,
				isLine: false
			});

			// Closing delimiter
			decorations.push({
				from: bold.closeDelimiterFrom,
				to: bold.closeDelimiterTo,
				decoration: markdownBoldDelimiterMark,
				isLine: false
			});
		}

		// Find and decorate italic patterns
		const italicPatterns = findMarkdownItalic(from, to, doc);
		for (const italic of italicPatterns) {
			// Opening delimiter
			decorations.push({
				from: italic.openDelimiterFrom,
				to: italic.openDelimiterTo,
				decoration: markdownItalicDelimiterMark,
				isLine: false
			});

			// Content
			decorations.push({
				from: italic.contentFrom,
				to: italic.contentTo,
				decoration: markdownItalicContentMark,
				isLine: false
			});

			// Closing delimiter
			decorations.push({
				from: italic.closeDelimiterFrom,
				to: italic.closeDelimiterTo,
				decoration: markdownItalicDelimiterMark,
				isLine: false
			});
		}

		// Find and decorate link patterns
		const linkPatterns = findMarkdownLinks(from, to, doc);
		for (const link of linkPatterns) {
			// Opening bracket
			decorations.push({
				from: link.from,
				to: link.from + 1,
				decoration: markdownLinkBracketMark,
				isLine: false
			});

			// Link text
			decorations.push({
				from: link.textFrom,
				to: link.textTo,
				decoration: markdownLinkTextMark,
				isLine: false
			});

			// Closing bracket
			decorations.push({
				from: link.textTo,
				to: link.textTo + 1,
				decoration: markdownLinkBracketMark,
				isLine: false
			});

			if (link.linkType === 'inline') {
				// Opening parenthesis
				decorations.push({
					from: link.textTo + 1,
					to: link.textTo + 2,
					decoration: markdownLinkBracketMark,
					isLine: false
				});

				// URL
				decorations.push({
					from: link.urlFrom,
					to: link.urlTo,
					decoration: markdownLinkUrlMark,
					isLine: false
				});

				// Closing parenthesis
				decorations.push({
					from: link.to - 1,
					to: link.to,
					decoration: markdownLinkBracketMark,
					isLine: false
				});
			} else {
				// Reference link: [text][ref]
				// Opening bracket for reference
				decorations.push({
					from: link.textTo + 1,
					to: link.textTo + 2,
					decoration: markdownLinkBracketMark,
					isLine: false
				});

				// Reference
				decorations.push({
					from: link.urlFrom,
					to: link.urlTo,
					decoration: markdownLinkUrlMark,
					isLine: false
				});

				// Closing bracket for reference
				decorations.push({
					from: link.to - 1,
					to: link.to,
					decoration: markdownLinkBracketMark,
					isLine: false
				});
			}
		}
	}
}

/**
 * QuillMark decorator view plugin
 */
export const quillmarkDecorator = ViewPlugin.fromClass(QuillMarkDecorator, {
	decorations: (v) => v.decorations
});
