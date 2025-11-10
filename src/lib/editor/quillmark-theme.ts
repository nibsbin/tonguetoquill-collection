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
				paddingLeft: '12px'
			},

			// Fold placeholder (metadata) - match delimiter color and block background
			'.cm-foldPlaceholder': {
				backgroundColor: getCssVar('--color-syntax-metadata-bg'),
				paddingLeft: '0px',
				border: 'none'
			},

			// SCOPE and QUILL keywords
			'.cm-quillmark-scope-keyword, .cm-quillmark-quill-keyword': {
				color: getCssVar('--color-syntax-keyword'),
				fontWeight: '600'
			},

			// Scope/quill name values
			'.cm-quillmark-scope-name': {
				color: getCssVar('--color-foreground'),
				fontWeight: '500'
			},

			// YAML keys
			'.cm-quillmark-yaml-key': {
				color: getCssVar('--color-syntax-key')
			},

			// YAML string values
			'.cm-quillmark-yaml-string': {
				color: getCssVar('--color-foreground')
			},

			// YAML number values
			'.cm-quillmark-yaml-number': {
				color: getCssVar('--color-foreground')
			},

			// YAML boolean values
			'.cm-quillmark-yaml-bool': {
				color: getCssVar('--color-foreground')
			},

			// YAML comments
			'.cm-quillmark-yaml-comment': {
				color: getCssVar('--color-syntax-comment'),
				fontStyle: 'italic'
			},

			// Markdown bold delimiters (** or __)
			'.cm-markdown-bold-delimiter': {
				color: getCssVar('--color-muted-foreground'),
				opacity: '0.6'
			},

			// Markdown bold content
			'.cm-markdown-bold-content': {
				fontWeight: '600'
			},

			// Markdown italic delimiters (* or _)
			'.cm-markdown-italic-delimiter': {
				color: getCssVar('--color-muted-foreground'),
				opacity: '0.6'
			},

			// Markdown italic content
			'.cm-markdown-italic-content': {
				fontStyle: 'italic'
			},

			// Markdown link text
			'.cm-markdown-link-text': {
				color: getCssVar('--color-primary'),
				textDecoration: 'underline'
			},

			// Markdown link URL/reference
			'.cm-markdown-link-url': {
				color: getCssVar('--color-muted-foreground'),
				opacity: '0.7'
			},

			// Markdown link brackets and parentheses
			'.cm-markdown-link-bracket': {
				color: getCssVar('--color-muted-foreground'),
				opacity: '0.5'
			}
		},
		{ dark: isDark }
	);
}
