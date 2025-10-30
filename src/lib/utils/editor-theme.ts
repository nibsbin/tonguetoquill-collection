import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';

/**
 * Creates a CodeMirror theme using CSS custom properties
 * from the document's computed styles
 */
export function createEditorTheme(): Extension {
	// Get computed CSS custom properties at runtime
	const styles = getComputedStyle(document.documentElement);
	const cursorColor = styles.getPropertyValue('--color-editor-cursor').trim() || '#09090b';
	const isDark = document.documentElement.classList.contains('dark');

	// Debug: log the cursor color value
	console.log('Editor cursor color:', cursorColor, 'isEmpty:', !styles.getPropertyValue('--color-editor-cursor').trim());

	return EditorView.theme({
		'&': {
			height: '100%',
			fontSize: '14px',
			backgroundColor: styles.getPropertyValue('--color-editor-background').trim()
		},
		'.cm-scroller': {
			overflow: 'auto',
			fontFamily: 'ui-monospace, monospace'
		},
		'.cm-content': {
			padding: '16px 0',
			color: styles.getPropertyValue('--color-editor-foreground').trim()
		},
		'.cm-line': {
			padding: '0 16px'
		},
		'.cm-cursor, .cm-dropCursor': {
			borderLeftColor: cursorColor
		},
		'&.cm-focused .cm-cursor': {
			borderLeftColor: cursorColor
		},
		'.cm-activeLine': {
			backgroundColor: styles.getPropertyValue('--color-editor-line-active').trim()
		},
		'.cm-selectionBackground, .cm-focused .cm-selectionBackground': {
			backgroundColor: styles.getPropertyValue('--color-editor-selection').trim()
		},
		'.cm-gutters': {
			backgroundColor: styles.getPropertyValue('--color-editor-gutter-background').trim(),
			color: styles.getPropertyValue('--color-editor-gutter-foreground').trim(),
			border: 'none'
		}
	}, { dark: isDark });
}
