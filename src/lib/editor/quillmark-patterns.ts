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
 * Represents a markdown bold element
 */
export interface MarkdownBold {
	from: number; // Start of opening delimiter
	to: number; // End of closing delimiter
	delimiterType: '**' | '__';
	openDelimiterFrom: number;
	openDelimiterTo: number;
	contentFrom: number;
	contentTo: number;
	closeDelimiterFrom: number;
	closeDelimiterTo: number;
}

/**
 * Represents a markdown italic element
 */
export interface MarkdownItalic {
	from: number; // Start of opening delimiter
	to: number; // End of closing delimiter
	delimiterType: '*' | '_';
	openDelimiterFrom: number;
	openDelimiterTo: number;
	contentFrom: number;
	contentTo: number;
	closeDelimiterFrom: number;
	closeDelimiterTo: number;
}

/**
 * Represents a markdown link element
 */
export interface MarkdownLink {
	from: number; // Start of opening bracket
	to: number; // End of closing parenthesis or reference bracket
	textFrom: number;
	textTo: number;
	urlFrom: number;
	urlTo: number;
	linkType: 'inline' | 'reference';
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

/**
 * Find markdown bold patterns within a range, excluding metadata blocks
 * Matches both **text** and __text__ patterns
 */
export function findMarkdownBold(from: number, to: number, doc: Text): MarkdownBold[] {
	const text = doc.sliceString(from, to);
	const bold: MarkdownBold[] = [];

	// Get metadata blocks to exclude them
	const metadataBlocks = findMetadataBlocks(doc);

	// Helper to check if a position is inside a metadata block
	const isInMetadataBlock = (pos: number): boolean => {
		return metadataBlocks.some((block) => pos >= block.from && pos < block.to);
	};

	// Match **text** pattern (must have content, not just **)
	const doubleAsterisk = /\*\*([^*\n]+?)\*\*/g;
	let match;
	while ((match = doubleAsterisk.exec(text)) !== null) {
		const matchStart = from + match.index;
		const matchEnd = matchStart + match[0].length;

		// Skip if inside metadata block
		if (isInMetadataBlock(matchStart)) continue;

		bold.push({
			from: matchStart,
			to: matchEnd,
			delimiterType: '**',
			openDelimiterFrom: matchStart,
			openDelimiterTo: matchStart + 2,
			contentFrom: matchStart + 2,
			contentTo: matchEnd - 2,
			closeDelimiterFrom: matchEnd - 2,
			closeDelimiterTo: matchEnd
		});
	}

	// Match __text__ pattern (must have content, not just __)
	const doubleUnderscore = /__([^_\n]+?)__/g;
	while ((match = doubleUnderscore.exec(text)) !== null) {
		const matchStart = from + match.index;
		const matchEnd = matchStart + match[0].length;

		// Skip if inside metadata block
		if (isInMetadataBlock(matchStart)) continue;

		bold.push({
			from: matchStart,
			to: matchEnd,
			delimiterType: '__',
			openDelimiterFrom: matchStart,
			openDelimiterTo: matchStart + 2,
			contentFrom: matchStart + 2,
			contentTo: matchEnd - 2,
			closeDelimiterFrom: matchEnd - 2,
			closeDelimiterTo: matchEnd
		});
	}

	return bold;
}

/**
 * Find markdown italic patterns within a range, excluding metadata blocks
 * Matches both *text* and _text_ patterns
 * Note: Must distinguish from bold patterns (**text** and __text__)
 */
export function findMarkdownItalic(from: number, to: number, doc: Text): MarkdownItalic[] {
	const text = doc.sliceString(from, to);
	const italic: MarkdownItalic[] = [];

	// Get metadata blocks to exclude them
	const metadataBlocks = findMetadataBlocks(doc);

	// Helper to check if a position is inside a metadata block
	const isInMetadataBlock = (pos: number): boolean => {
		return metadataBlocks.some((block) => pos >= block.from && pos < block.to);
	};

	// Match *text* pattern (single asterisk, not double)
	// Use negative lookbehind/lookahead to avoid matching ** patterns
	const singleAsterisk = /(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g;
	let match;
	while ((match = singleAsterisk.exec(text)) !== null) {
		const matchStart = from + match.index;
		const matchEnd = matchStart + match[0].length;

		// Skip if inside metadata block
		if (isInMetadataBlock(matchStart)) continue;

		italic.push({
			from: matchStart,
			to: matchEnd,
			delimiterType: '*',
			openDelimiterFrom: matchStart,
			openDelimiterTo: matchStart + 1,
			contentFrom: matchStart + 1,
			contentTo: matchEnd - 1,
			closeDelimiterFrom: matchEnd - 1,
			closeDelimiterTo: matchEnd
		});
	}

	// Match _text_ pattern (single underscore, not double)
	// Use negative lookbehind/lookahead to avoid matching __ patterns
	const singleUnderscore = /(?<!_)_(?!_)([^_\n]+?)(?<!_)_(?!_)/g;
	while ((match = singleUnderscore.exec(text)) !== null) {
		const matchStart = from + match.index;
		const matchEnd = matchStart + match[0].length;

		// Skip if inside metadata block
		if (isInMetadataBlock(matchStart)) continue;

		italic.push({
			from: matchStart,
			to: matchEnd,
			delimiterType: '_',
			openDelimiterFrom: matchStart,
			openDelimiterTo: matchStart + 1,
			contentFrom: matchStart + 1,
			contentTo: matchEnd - 1,
			closeDelimiterFrom: matchEnd - 1,
			closeDelimiterTo: matchEnd
		});
	}

	return italic;
}

/**
 * Find markdown link patterns within a range, excluding metadata blocks
 * Matches both [text](url) and [text][ref] patterns
 */
export function findMarkdownLinks(from: number, to: number, doc: Text): MarkdownLink[] {
	const text = doc.sliceString(from, to);
	const links: MarkdownLink[] = [];

	// Get metadata blocks to exclude them
	const metadataBlocks = findMetadataBlocks(doc);

	// Helper to check if a position is inside a metadata block
	const isInMetadataBlock = (pos: number): boolean => {
		return metadataBlocks.some((block) => pos >= block.from && pos < block.to);
	};

	// Match [text](url) pattern (inline links)
	const inlineLink = /\[([^\]]+)\]\(([^)]+)\)/g;
	let match;
	while ((match = inlineLink.exec(text)) !== null) {
		const matchStart = from + match.index;
		const matchEnd = matchStart + match[0].length;

		// Skip if inside metadata block
		if (isInMetadataBlock(matchStart)) continue;

		const textStart = matchStart + 1; // After [
		const textEnd = textStart + match[1].length;
		const urlStart = textEnd + 2; // After ](
		const urlEnd = urlStart + match[2].length;

		links.push({
			from: matchStart,
			to: matchEnd,
			textFrom: textStart,
			textTo: textEnd,
			urlFrom: urlStart,
			urlTo: urlEnd,
			linkType: 'inline'
		});
	}

	// Match [text][ref] pattern (reference links)
	const referenceLink = /\[([^\]]+)\]\[([^\]]+)\]/g;
	while ((match = referenceLink.exec(text)) !== null) {
		const matchStart = from + match.index;
		const matchEnd = matchStart + match[0].length;

		// Skip if inside metadata block
		if (isInMetadataBlock(matchStart)) continue;

		const textStart = matchStart + 1; // After [
		const textEnd = textStart + match[1].length;
		const refStart = textEnd + 2; // After ][
		const refEnd = refStart + match[2].length;

		links.push({
			from: matchStart,
			to: matchEnd,
			textFrom: textStart,
			textTo: textEnd,
			urlFrom: refStart,
			urlTo: refEnd,
			linkType: 'reference'
		});
	}

	return links;
}
