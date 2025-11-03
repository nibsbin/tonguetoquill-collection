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

	// Helper function to get CSS custom property with fallback
	const getCssVar = (name: string, lightFallback: string, darkFallback?: string): string => {
		const value = styles.getPropertyValue(name).trim();
		if (value) return value;
		return isDark && darkFallback ? darkFallback : lightFallback;
	};

	// Get the appropriate metadata background color based on theme
	const metadataBg = getCssVar(
		'--color-syntax-metadata-bg',
		'rgba(53, 94, 147, 0.03)',
		'rgba(53, 94, 147, 0.08)'
	);

	return EditorView.theme(
		{
			// Metadata block delimiters (---)
			'.cm-quillmark-delimiter': {
				color: getCssVar('--color-muted-foreground', '#71717a')
			},

			// Metadata block background and border
			'.cm-quillmark-block': {
				backgroundColor: metadataBg,
				borderLeft: `2px solid ${getCssVar('--color-syntax-metadata-border', '#355e93')}`,
				paddingLeft: '12px',
				marginLeft: '-14px'
			},

			// SCOPE and QUILL keywords
			'.cm-quillmark-scope-keyword, .cm-quillmark-quill-keyword': {
				color: getCssVar('--color-syntax-keyword', '#355e93'),
				fontWeight: '600'
			},

			// Scope/quill name values
			'.cm-quillmark-scope-name': {
				color: getCssVar('--color-syntax-identifier', '#0891b2', '#06b6d4'),
				fontWeight: '500'
			},

			// YAML keys
			'.cm-quillmark-yaml-key': {
				color: getCssVar('--color-foreground', '#09090b', '#f4f4f5')
			},

			// YAML string values
			'.cm-quillmark-yaml-string': {
				color: getCssVar('--color-syntax-string', '#16a34a', '#22c55e')
			},

			// YAML number values
			'.cm-quillmark-yaml-number': {
				color: getCssVar('--color-syntax-number', '#d97706', '#f59e0b')
			},

			// YAML boolean values
			'.cm-quillmark-yaml-bool': {
				color: getCssVar('--color-syntax-boolean', '#7c3aed', '#8b5cf6')
			}
		},
		{ dark: isDark }
	);
}
