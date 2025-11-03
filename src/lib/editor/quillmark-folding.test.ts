import { describe, it, expect } from 'vitest';
import { EditorState } from '@codemirror/state';
import { findClosingDelimiter } from './quillmark-folding';

describe('QuillMark Folding', () => {
	describe('findClosingDelimiter', () => {
		it('should find closing delimiter for a simple metadata block', () => {
			const state = EditorState.create({
				doc: '---\ntitle: Test\n---\nContent'
			});

			const closingLine = findClosingDelimiter(1, state);
			expect(closingLine).toBe(3);
		});

		it('should find closing delimiter for frontmatter at document start', () => {
			const state = EditorState.create({
				doc: '---\nSCOPE: intro\ntitle: Welcome\n---\nContent here'
			});

			const closingLine = findClosingDelimiter(1, state);
			expect(closingLine).toBe(4);
		});

		it('should return null for unclosed metadata block', () => {
			const state = EditorState.create({
				doc: '---\ntitle: Test\nContent without closing'
			});

			const closingLine = findClosingDelimiter(1, state);
			expect(closingLine).toBeNull();
		});

		it('should return null when starting line is not a delimiter', () => {
			const state = EditorState.create({
				doc: 'Content\n---\ntitle: Test\n---'
			});

			const closingLine = findClosingDelimiter(1, state);
			expect(closingLine).toBeNull();
		});

		it('should handle multiple metadata blocks', () => {
			const state = EditorState.create({
				doc: '---\nSCOPE: intro\n---\nContent\n---\nSCOPE: main\n---\nMore content'
			});

			// First block
			const firstClosing = findClosingDelimiter(1, state);
			expect(firstClosing).toBe(3);

			// Second block
			const secondClosing = findClosingDelimiter(5, state);
			expect(secondClosing).toBe(7);
		});

		it('should not treat horizontal rule as delimiter', () => {
			const state = EditorState.create({
				doc: 'Content\n\n---\n\nMore content'
			});

			// Line 3 is a horizontal rule (blank lines above and below)
			const closingLine = findClosingDelimiter(3, state);
			expect(closingLine).toBeNull();
		});

		it('should handle metadata block with empty content', () => {
			const state = EditorState.create({
				doc: '---\n---\nContent'
			});

			const closingLine = findClosingDelimiter(1, state);
			expect(closingLine).toBe(2);
		});

		it('should handle nested metadata blocks (inner block)', () => {
			const state = EditorState.create({
				doc: '---\nSCOPE: outer\n---\nContent\n---\nSCOPE: inner\n---\nMore'
			});

			// Inner block starts at line 5
			const innerClosing = findClosingDelimiter(5, state);
			expect(innerClosing).toBe(7);
		});
	});
});
