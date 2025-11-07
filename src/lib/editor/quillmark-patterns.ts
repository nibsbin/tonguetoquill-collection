import type { Text } from '@codemirror/state';

/**
 * Represents a range in the document
 */
export interface Range {
	from: number;
	to: number;
}

/**
 * Represents a metadata block in the document
 */
export interface MetadataBlock {
	from: number; // Start of opening delimiter
	to: number; // End of closing delimiter (or document end if unclosed)
	contentFrom: number; // Start of content (after opening delimiter line)
	contentTo: number; // End of content (before closing delimiter line)
}

/**
 * Represents a SCOPE or QUILL keyword with its value
 */
export interface ScopeQuillKeyword {
	from: number;
	to: number;
	keyword: 'SCOPE' | 'QUILL';
	keywordFrom: number;
	keywordTo: number;
	nameFrom: number;
	nameTo: number;
	name: string;
}

/**
 * Represents a YAML key-value pair
 */
export interface YamlPair {
	keyFrom: number;
	keyTo: number;
	valueFrom: number;
	valueTo: number;
	valueType: 'string' | 'number' | 'boolean' | 'unknown';
}

/**
 * Represents a YAML comment
 */
export interface YamlComment {
	from: number;
	to: number;
}

/**
 * Check if a line containing `---` is a metadata delimiter or a horizontal rule.
 * A horizontal rule has blank lines both above AND below it.
 * A metadata delimiter does NOT have blank lines both above and below.
 *
 * Special case: If `---` is at line 1, it's always a frontmatter delimiter.
 */
export function isMetadataDelimiter(lineNum: number, doc: Text): boolean {
	if (lineNum < 1 || lineNum > doc.lines) return false;

	const line = doc.line(lineNum);
	const lineText = line.text.trim();

	// Must start with exactly three dashes
	if (!lineText.startsWith('---')) return false;

	// If there's content after the dashes (other than whitespace), it's not a delimiter
	const afterDashes = lineText.slice(3).trim();
	if (afterDashes.length > 0) return false;

	// Special case: If at line 1, it's always frontmatter
	if (lineNum === 1) return true;

	// Check for horizontal rule (blank lines both above AND below)
	const prevLine = lineNum > 1 ? doc.line(lineNum - 1).text.trim() : '';
	const nextLine = lineNum < doc.lines ? doc.line(lineNum + 1).text.trim() : '';

	const hasBlankAbove = prevLine === '';
	const hasBlankBelow = lineNum === doc.lines || nextLine === '';

	// If blank lines both above and below, it's a horizontal rule, not metadata
	return !(hasBlankAbove && hasBlankBelow);
}

/**
 * Find all metadata blocks in the document
 */
export function findMetadataBlocks(doc: Text): MetadataBlock[] {
	const blocks: MetadataBlock[] = [];
	let i = 1;

	while (i <= doc.lines) {
		if (isMetadataDelimiter(i, doc)) {
			const openLine = doc.line(i);
			const from = openLine.from;
			const contentFrom = openLine.to + 1;

			// Find matching closing delimiter
			let closeLine: number | null = null;
			for (let j = i + 1; j <= doc.lines; j++) {
				if (isMetadataDelimiter(j, doc)) {
					closeLine = j;
					break;
				}
			}

			if (closeLine !== null) {
				const closeLineObj = doc.line(closeLine);
				blocks.push({
					from,
					to: closeLineObj.to,
					contentFrom,
					contentTo: closeLineObj.from - 1
				});
				i = closeLine + 1;
			} else {
				// Unclosed block - extends to end of document
				blocks.push({
					from,
					to: doc.length,
					contentFrom,
					contentTo: doc.length
				});
				break;
			}
		} else {
			i++;
		}
	}

	return blocks;
}

/**
 * Find SCOPE and QUILL keywords within a range
 */
export function findScopeQuillKeywords(from: number, to: number, doc: Text): ScopeQuillKeyword[] {
	const text = doc.sliceString(from, to);
	const regex = /^(SCOPE|QUILL):\s*([a-z_][a-z0-9_]*)/gm;
	const keywords: ScopeQuillKeyword[] = [];

	let match;
	while ((match = regex.exec(text)) !== null) {
		const keywordStart = from + match.index;
		const keywordEnd = keywordStart + match[1].length;
		const nameStart = from + match.index + match[0].lastIndexOf(match[2]);
		const nameEnd = nameStart + match[2].length;

		keywords.push({
			from: keywordStart,
			to: from + match.index + match[0].length,
			keyword: match[1] as 'SCOPE' | 'QUILL',
			keywordFrom: keywordStart,
			keywordTo: keywordEnd,
			nameFrom: nameStart,
			nameTo: nameEnd,
			name: match[2]
		});
	}

	return keywords;
}

/**
 * Find YAML key-value pairs within a range
 *
 * Note: This is a simplified YAML parser that handles common patterns only.
 * Limitations:
 * - Does not support nested structures (lists, objects)
 * - Does not support multi-line values
 * - Does not support YAML anchors or references
 * - Does not support complex data types (dates, null, etc.)
 * - Boolean detection is limited to 'true' and 'false' (lowercase only)
 */
export function findYamlPairs(from: number, to: number, doc: Text): YamlPair[] {
	const text = doc.sliceString(from, to);
	const pairs: YamlPair[] = [];

	// Simple YAML key-value pattern: key: value
	// This is a basic implementation - not a full YAML parser
	const lines = text.split('\n');
	let currentPos = from;

	for (const line of lines) {
		// Skip SCOPE/QUILL lines as they're handled separately
		if (line.trim().match(/^(SCOPE|QUILL):/)) {
			currentPos += line.length + 1; // +1 for newline
			continue;
		}

		// Match YAML key: value pattern (value is optional for multi-line structures)
		const match = line.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/);
		if (match) {
			const indent = match[1];
			const key = match[2];
			const value = match[3];

			const keyStart = currentPos + indent.length;
			const keyEnd = keyStart + key.length;

			// Only add decoration if there's a value on the same line
			if (value.trim().length > 0) {
				// Search for the value starting AFTER the colon to avoid finding the key
				// when key and value are identical (e.g., "asdf: asdf")
				const colonIndex = indent.length + key.length;
				const valueStartInLine = line.indexOf(value, colonIndex + 1);
				const valueStart = currentPos + valueStartInLine;
				const valueEnd = valueStart + value.length;

				// Determine value type
				let valueType: 'string' | 'number' | 'boolean' | 'unknown' = 'unknown';
				const trimmedValue = value.trim();

				if (trimmedValue === 'true' || trimmedValue === 'false') {
					valueType = 'boolean';
				} else if (/^-?\d+(\.\d+)?$/.test(trimmedValue)) {
					valueType = 'number';
				} else if (trimmedValue.length > 0) {
					// Default to string for non-empty values
					// This handles quoted strings and unquoted text
					valueType = 'string';
				}

				pairs.push({
					keyFrom: keyStart,
					keyTo: keyEnd,
					valueFrom: valueStart,
					valueTo: valueEnd,
					valueType
				});
			} else {
				// Key with no value (e.g., parent of a list) - just highlight the key
				pairs.push({
					keyFrom: keyStart,
					keyTo: keyEnd,
					valueFrom: keyEnd, // No value, so use keyEnd
					valueTo: keyEnd, // Zero-width value
					valueType: 'unknown'
				});
			}
		}

		currentPos += line.length + 1; // +1 for newline
	}

	return pairs;
}

/**
 * Find YAML comments within a range
 * Comments start with # and continue to the end of the line
 */
export function findYamlComments(from: number, to: number, doc: Text): YamlComment[] {
	const text = doc.sliceString(from, to);
	const comments: YamlComment[] = [];

	// Match # character followed by any content to end of line
	const regex = /#[^\n]*/g;

	let match;
	while ((match = regex.exec(text)) !== null) {
		const commentStart = from + match.index;
		const commentEnd = commentStart + match[0].length;

		comments.push({
			from: commentStart,
			to: commentEnd
		});
	}

	return comments;
}
