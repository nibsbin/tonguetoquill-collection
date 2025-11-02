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
		// Decorate opening delimiter
		const openLine = doc.lineAt(block.from);
		builder.add(openLine.from, openLine.from, delimiterMark);
		builder.add(openLine.from, openLine.to, blockMark);

		// Decorate all lines in the block
		let pos = openLine.to;
		while (pos < block.contentTo) {
			const line = doc.lineAt(pos + 1);
			if (line.from >= block.contentTo) break;
			builder.add(line.from, line.from, blockMark);
			pos = line.to;
		}

		// Decorate closing delimiter if it exists
		if (block.contentTo < block.to) {
			const closeLine = doc.lineAt(block.to);
			builder.add(closeLine.from, closeLine.from, delimiterMark);
			builder.add(closeLine.from, closeLine.to, blockMark);
		}

		// Decorate SCOPE/QUILL keywords within the block
		const keywords = findScopeQuillKeywords(block.contentFrom, block.contentTo, doc);
		for (const keyword of keywords) {
			const keywordMark = keyword.keyword === 'SCOPE' ? scopeKeywordMark : quillKeywordMark;
			builder.add(keyword.keywordFrom, keyword.keywordTo, keywordMark);
			builder.add(keyword.nameFrom, keyword.nameTo, scopeNameMark);
		}

		// Decorate YAML key-value pairs
		const yamlPairs = findYamlPairs(block.contentFrom, block.contentTo, doc);
		for (const pair of yamlPairs) {
			builder.add(pair.keyFrom, pair.keyTo, yamlKeyMark);

			const valueMark =
				pair.valueType === 'string'
					? yamlStringMark
					: pair.valueType === 'number'
						? yamlNumberMark
						: pair.valueType === 'boolean'
							? yamlBooleanMark
							: yamlStringMark; // Default to string for unknown types

			builder.add(pair.valueFrom, pair.valueTo, valueMark);
		}
	}
}

/**
 * QuillMark decorator view plugin
 */
export const quillmarkDecorator = ViewPlugin.fromClass(QuillMarkDecorator, {
	decorations: (v) => v.decorations
});
