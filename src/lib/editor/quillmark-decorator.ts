import { ViewPlugin, Decoration, type DecorationSet, type EditorView } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import {
	findMetadataBlocks,
	findScopeQuillKeywords,
	findYamlPairs,
	type MetadataBlock
} from './quillmark-patterns';

/**
 * Decoration marks for QuillMark syntax elements
 */
const delimiterMark = Decoration.mark({ class: 'cm-quillmark-delimiter' });
const blockMark = Decoration.line({ class: 'cm-quillmark-block' });
const scopeKeywordMark = Decoration.mark({ class: 'cm-quillmark-scope-keyword' });
const quillKeywordMark = Decoration.mark({ class: 'cm-quillmark-quill-keyword' });
const scopeNameMark = Decoration.mark({ class: 'cm-quillmark-scope-name' });
const yamlKeyMark = Decoration.mark({ class: 'cm-quillmark-yaml-key' });
const yamlStringMark = Decoration.mark({ class: 'cm-quillmark-yaml-string' });
const yamlNumberMark = Decoration.mark({ class: 'cm-quillmark-yaml-number' });
const yamlBooleanMark = Decoration.mark({ class: 'cm-quillmark-yaml-bool' });

/**
 * QuillMark decorator plugin
 * Provides syntax highlighting for QuillMark metadata blocks
 */
class QuillMarkDecorator {
	decorations: DecorationSet;

	constructor(view: EditorView) {
		this.decorations = this.computeDecorations(view);
	}

	update(update: { docChanged: boolean; viewportChanged: boolean; view: EditorView }) {
		if (update.docChanged || update.viewportChanged) {
			this.decorations = this.computeDecorations(update.view);
		}
	}

	computeDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		const doc = view.state.doc;

		// Find all metadata blocks
		const blocks = findMetadataBlocks(doc);

		// Only process visible blocks for performance
		// Note: For documents with many blocks, this could be optimized with
		// binary search or spatial indexing to find intersecting blocks more efficiently
		for (const { from, to } of view.visibleRanges) {
			for (const block of blocks) {
				// Skip blocks outside visible range
				if (block.to < from || block.from > to) continue;

				this.decorateBlock(builder, block, doc);
			}
		}

		return builder.finish();
	}

	decorateBlock(
		builder: RangeSetBuilder<Decoration>,
		block: MetadataBlock,
		doc: import('@codemirror/state').Text
	) {
		// Collect all decorations to sort them before adding to builder
		// We need to track the type to ensure line decorations come before mark decorations
		const decorations: Array<{
			from: number;
			to: number;
			decoration: Decoration;
			isLine: boolean;
		}> = [];

		// Decorate opening delimiter line
		const openLine = doc.lineAt(block.from);
		decorations.push({
			from: openLine.from,
			to: openLine.from,
			decoration: blockMark,
			isLine: true
		});
		decorations.push({
			from: openLine.from,
			to: openLine.to,
			decoration: delimiterMark,
			isLine: false
		});

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
				decoration: delimiterMark,
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

		// Sort decorations by position (from, then to, then line decorations first)
		// Line decorations must come before mark decorations at the same position
		decorations.sort((a, b) => {
			if (a.from !== b.from) return a.from - b.from;
			if (a.to !== b.to) return a.to - b.to;
			// Line decorations (isLine=true) should come before mark decorations (isLine=false)
			if (a.isLine !== b.isLine) return a.isLine ? -1 : 1;
			return 0;
		});

		// Add all decorations in sorted order
		for (const { from, to, decoration } of decorations) {
			builder.add(from, to, decoration);
		}
	}
}

/**
 * QuillMark decorator view plugin
 */
export const quillmarkDecorator = ViewPlugin.fromClass(QuillMarkDecorator, {
	decorations: (v) => v.decorations
});
