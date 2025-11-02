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

	// Get the appropriate metadata background color based on theme
	const metadataBg = isDark
		? styles.getPropertyValue('--color-syntax-metadata-bg').trim() || 'rgba(53, 94, 147, 0.08)'
		: styles.getPropertyValue('--color-syntax-metadata-bg').trim() || 'rgba(53, 94, 147, 0.03)';

	return EditorView.theme(
		{
			// Metadata block delimiters (---)
			'.cm-quillmark-delimiter': {
				color: styles.getPropertyValue('--color-muted-foreground').trim() || '#71717a'
			},

			// Metadata block background and border
			'.cm-quillmark-block': {
				backgroundColor: metadataBg,
				borderLeft: `2px solid ${styles.getPropertyValue('--color-syntax-metadata-border').trim() || '#355e93'}`,
				paddingLeft: '12px',
				marginLeft: '-14px'
			},

			// SCOPE and QUILL keywords
			'.cm-quillmark-scope-keyword, .cm-quillmark-quill-keyword': {
				color: styles.getPropertyValue('--color-syntax-keyword').trim() || '#355e93',
				fontWeight: '600'
			},

			// Scope/quill name values
			'.cm-quillmark-scope-name': {
				color: styles.getPropertyValue('--color-syntax-identifier').trim() || '#0891b2',
				fontWeight: '500'
			},

			// YAML keys
			'.cm-quillmark-yaml-key': {
				color: styles.getPropertyValue('--color-foreground').trim() || '#09090b'
			},

			// YAML string values
			'.cm-quillmark-yaml-string': {
				color: styles.getPropertyValue('--color-syntax-string').trim() || '#16a34a'
			},

			// YAML number values
			'.cm-quillmark-yaml-number': {
				color: styles.getPropertyValue('--color-syntax-number').trim() || '#d97706'
			},

			// YAML boolean values
			'.cm-quillmark-yaml-bool': {
				color: styles.getPropertyValue('--color-syntax-boolean').trim() || '#7c3aed'
			}
		},
		{ dark: isDark }
	);
}
