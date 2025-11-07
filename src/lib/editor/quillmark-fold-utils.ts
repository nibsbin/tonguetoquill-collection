import type { EditorView } from '@codemirror/view';
import { foldEffect, unfoldEffect, foldedRanges } from '@codemirror/language';
import { findMetadataBlocks } from './quillmark-patterns';

/**
 * Fold a single metadata block at the given position
 */
export function foldMetadataBlockAtPosition(view: EditorView, pos: number): boolean {
	const doc = view.state.doc;
	const blocks = findMetadataBlocks(doc);

	// Find the block that contains this position
	const block = blocks.find((b) => pos >= b.from && pos <= b.to);

	if (block) {
		view.dispatch({
			effects: foldEffect.of({ from: block.from, to: block.to })
		});
		return true;
	}

	return false;
}

/**
 * Toggle all metadata blocks (fold if any are expanded, unfold if all are folded)
 */
export function toggleAllMetadataBlocks(view: EditorView): void {
	const state = view.state;
	const doc = state.doc;
	const effects = [];

	// Get currently folded ranges
	const folded = foldedRanges(state);

	// Find all metadata blocks
	const metadataBlocks = findMetadataBlocks(doc);

	// Check if ALL metadata blocks are currently folded
	let allFolded = metadataBlocks.length > 0;
	for (const block of metadataBlocks) {
		let isFolded = false;
		folded.between(block.from, block.to, (from, to) => {
			// Check for overlapping fold
			if (from <= block.from && to >= block.to) {
				isFolded = true;
				return false;
			}
		});
		if (!isFolded) {
			allFolded = false;
			break;
		}
	}

	// Toggle: if ALL are folded, unfold all. Otherwise, fold all.
	if (allFolded) {
		// Unfold all metadata blocks - use exact fold ranges to avoid duplicates
		for (const block of metadataBlocks) {
			folded.between(block.from, block.to, (from, to) => {
				effects.push(unfoldEffect.of({ from, to }));
			});
		}
	} else {
		// First unfold any existing folds in the metadata regions to prevent duplicates
		for (const block of metadataBlocks) {
			folded.between(block.from, block.to, (from, to) => {
				effects.push(unfoldEffect.of({ from, to }));
			});
		}
		// Then fold all metadata blocks
		for (const block of metadataBlocks) {
			effects.push(foldEffect.of({ from: block.from, to: block.to }));
		}
	}

	// Apply all effects at once
	if (effects.length > 0) {
		view.dispatch({ effects });
	}

	view.focus();
}
