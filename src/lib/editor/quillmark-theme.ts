import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';

/**
 * Creates a CodeMirror theme for QuillMark syntax highlighting
 * Uses CSS custom properties from the design system
 */
export function createQuillmarkTheme(): Extension {
	// Get computed CSS custom properties at runtime
	const styles = getComputedStyle(document.documentElement);
	const isDark = document.documentElement.classList.contains('dark');

	// Helper function to get CSS custom property without fallback
	const getCssVar = (name: string): string => {
		return styles.getPropertyValue(name).trim();
	};

	return EditorView.theme(
		{
			// Metadata block delimiters (---)
			'.cm-quillmark-delimiter': {
				color: getCssVar('--color-muted-foreground')
			},

			// Metadata block background and border
			'.cm-quillmark-block': {
				backgroundColor: getCssVar('--color-syntax-metadata-bg'),
				borderLeft: `2px solid ${getCssVar('--color-syntax-metadata-border')}`,
				paddingLeft: '12px',
			},

			// Fold placeholder (metadata) - match delimiter color and block background
			'.cm-foldPlaceholder': {
				display: 'inline-block',
				color: getCssVar('--color-muted-foreground'),
				backgroundColor: getCssVar('--color-syntax-metadata-bg'),
				borderLeft: `2px solid ${getCssVar('--color-syntax-metadata-border')}`,
				paddingLeft: '12px',
			},

			// SCOPE and QUILL keywords
			'.cm-quillmark-scope-keyword, .cm-quillmark-quill-keyword': {
				color: getCssVar('--color-syntax-keyword'),
				fontWeight: '600'
			},

			// Scope/quill name values
			'.cm-quillmark-scope-name': {
				color: getCssVar('--color-syntax-identifier'),
				fontWeight: '500'
			},

			// YAML keys
			'.cm-quillmark-yaml-key': {
				color: getCssVar('--color-foreground')
			},

			// YAML string values
			'.cm-quillmark-yaml-string': {
				color: getCssVar('--color-syntax-string')
			},

			// YAML number values
			'.cm-quillmark-yaml-number': {
				color: getCssVar('--color-syntax-number')
			},

			// YAML boolean values
			'.cm-quillmark-yaml-bool': {
				color: getCssVar('--color-syntax-boolean')
			}
		},
		{ dark: isDark }
	);
}
