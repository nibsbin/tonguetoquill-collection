import { describe, it, expect } from 'vitest';
import { Text } from '@codemirror/state';
import {
	isMetadataDelimiter,
	findMetadataBlocks,
	findScopeQuillKeywords,
	findYamlPairs
} from './quillmark-patterns';

describe('QuillMark Pattern Detection', () => {
	describe('isMetadataDelimiter', () => {
		it('should identify metadata delimiter at start of document', () => {
			const doc = Text.of(['---', 'title: Test', '---', 'Content']);
			expect(isMetadataDelimiter(1, doc)).toBe(true);
		});

		it('should identify metadata delimiter with content', () => {
			const doc = Text.of(['---', 'title: Test', '---', 'Content']);
			expect(isMetadataDelimiter(3, doc)).toBe(true);
		});

		it('should NOT identify horizontal rule (blank lines above and below)', () => {
			const doc = Text.of(['Content', '', '---', '', 'More content']);
			expect(isMetadataDelimiter(3, doc)).toBe(false);
		});

		it('should identify delimiter without blank line above', () => {
			const doc = Text.of(['Content', '---', '', 'More content']);
			expect(isMetadataDelimiter(2, doc)).toBe(true);
		});

		it('should identify delimiter without blank line below', () => {
			const doc = Text.of(['Content', '', '---', 'More content']);
			expect(isMetadataDelimiter(3, doc)).toBe(true);
		});
	});

	describe('findMetadataBlocks', () => {
		it('should find a simple metadata block', () => {
			const doc = Text.of(['---', 'title: Test', '---', 'Content']);
			const blocks = findMetadataBlocks(doc);
			expect(blocks).toHaveLength(1);
			expect(blocks[0].from).toBe(0);
		});

		it('should find multiple metadata blocks', () => {
			const doc = Text.of([
				'---',
				'SCOPE: intro',
				'---',
				'Content',
				'---',
				'SCOPE: body',
				'---',
				'More content'
			]);
			const blocks = findMetadataBlocks(doc);
			expect(blocks).toHaveLength(2);
		});

		it('should handle unclosed metadata block', () => {
			const doc = Text.of(['---', 'title: Test', 'Content']);
			const blocks = findMetadataBlocks(doc);
			expect(blocks).toHaveLength(1);
			expect(blocks[0].to).toBe(doc.length);
		});

		it('should NOT include horizontal rules', () => {
			const doc = Text.of(['---', 'title: Test', '---', '', '---', '', 'Content']);
			const blocks = findMetadataBlocks(doc);
			expect(blocks).toHaveLength(1); // Only the frontmatter, not the HR
		});
	});

	describe('findScopeQuillKeywords', () => {
		it('should find SCOPE keyword', () => {
			const doc = Text.of(['SCOPE: intro']);
			const keywords = findScopeQuillKeywords(0, doc.length, doc);
			expect(keywords).toHaveLength(1);
			expect(keywords[0].keyword).toBe('SCOPE');
			expect(keywords[0].name).toBe('intro');
		});

		it('should find QUILL keyword', () => {
			const doc = Text.of(['QUILL: test_template']);
			const keywords = findScopeQuillKeywords(0, doc.length, doc);
			expect(keywords).toHaveLength(1);
			expect(keywords[0].keyword).toBe('QUILL');
			expect(keywords[0].name).toBe('test_template');
		});

		it('should find multiple keywords', () => {
			const doc = Text.of(['SCOPE: intro', 'title: Test', 'QUILL: template']);
			const keywords = findScopeQuillKeywords(0, doc.length, doc);
			expect(keywords).toHaveLength(2);
		});

		it('should handle keywords with underscores and numbers', () => {
			const doc = Text.of(['SCOPE: test_scope_123']);
			const keywords = findScopeQuillKeywords(0, doc.length, doc);
			expect(keywords).toHaveLength(1);
			expect(keywords[0].name).toBe('test_scope_123');
		});
	});

	describe('findYamlPairs', () => {
		it('should find simple YAML key-value pair', () => {
			const doc = Text.of(['title: Test Document']);
			const pairs = findYamlPairs(0, doc.length, doc);
			expect(pairs).toHaveLength(1);
			expect(pairs[0].valueType).toBe('string');
		});

		it('should detect number values', () => {
			const doc = Text.of(['count: 42']);
			const pairs = findYamlPairs(0, doc.length, doc);
			expect(pairs).toHaveLength(1);
			expect(pairs[0].valueType).toBe('number');
		});

		it('should detect boolean values', () => {
			const doc = Text.of(['enabled: true', 'disabled: false']);
			const pairs = findYamlPairs(0, doc.length, doc);
			expect(pairs).toHaveLength(2);
			expect(pairs[0].valueType).toBe('boolean');
			expect(pairs[1].valueType).toBe('boolean');
		});

		it('should skip SCOPE and QUILL lines', () => {
			const doc = Text.of(['SCOPE: intro', 'title: Test']);
			const pairs = findYamlPairs(0, doc.length, doc);
			expect(pairs).toHaveLength(1); // Only title, not SCOPE
		});

		it('should correctly position values when key and value are identical', () => {
			const doc = Text.of(['asdf: asdf']);
			const pairs = findYamlPairs(0, doc.length, doc);
			expect(pairs).toHaveLength(1);

			// Key should be at positions 0-4 (asdf)
			expect(pairs[0].keyFrom).toBe(0);
			expect(pairs[0].keyTo).toBe(4);

			// Value should be at positions 6-10 (asdf after ": ")
			expect(pairs[0].valueFrom).toBe(6);
			expect(pairs[0].valueTo).toBe(10);
			expect(pairs[0].valueType).toBe('string');
		});

		it('should handle multiple identical key-value pairs', () => {
			const doc = Text.of(['foo: foo', 'bar: bar']);
			const pairs = findYamlPairs(0, doc.length, doc);
			expect(pairs).toHaveLength(2);

			// First pair: foo: foo
			expect(pairs[0].keyFrom).toBe(0);
			expect(pairs[0].keyTo).toBe(3);
			expect(pairs[0].valueFrom).toBe(5);
			expect(pairs[0].valueTo).toBe(8);

			// Second pair: bar: bar (9 characters offset for "foo: foo\n")
			expect(pairs[1].keyFrom).toBe(9);
			expect(pairs[1].keyTo).toBe(12);
			expect(pairs[1].valueFrom).toBe(14);
			expect(pairs[1].valueTo).toBe(17);
		});
	});
});
