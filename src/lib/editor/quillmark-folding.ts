import type { EditorState } from '@codemirror/state';
import { foldService } from '@codemirror/language';
import { isMetadataDelimiter } from './quillmark-patterns';

/**
 * Find the closing delimiter for a metadata block starting at the given line number
 * @param lineNum - The line number of the opening delimiter (1-based)
 * @param state - The editor state
 * @returns The line number of the closing delimiter, or null if not found
 */
export function findClosingDelimiter(lineNum: number, state: EditorState): number | null {
	const doc = state.doc;

	// Validate that the starting line is indeed a metadata delimiter
	if (!isMetadataDelimiter(lineNum, doc)) {
		return null;
	}

	// Search for the closing delimiter
	for (let i = lineNum + 1; i <= doc.lines; i++) {
		if (isMetadataDelimiter(i, doc)) {
			return i;
		}
	}

	// No closing delimiter found
	return null;
}

/**
 * CodeMirror fold service for QuillMark metadata blocks
 * This allows metadata blocks to be collapsed/expanded
 */
export const quillmarkFoldService = foldService.of((state, from, to) => {
	const doc = state.doc;
	const line = doc.lineAt(from);
	const lineNum = line.number;

	// Check if this line is a metadata delimiter
	if (!isMetadataDelimiter(lineNum, doc)) {
		return null;
	}

	// Find the closing delimiter
	const closingLineNum = findClosingDelimiter(lineNum, state);
	if (closingLineNum === null) {
		// No closing delimiter - don't allow folding unclosed blocks
		return null;
	}

	const closingLine = doc.line(closingLineNum);

	// Fold entire metadata block including both delimiters and trailing newline
	const foldTo = closingLine.to < doc.length ? closingLine.to + 1 : closingLine.to;

	return {
		from: line.from,
		to: foldTo
	};
});
