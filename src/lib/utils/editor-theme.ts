import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';

/**
 * Creates a CodeMirror theme using CSS custom properties
 * from the document's computed styles
 */
export function createEditorTheme(): Extension {
	// Get computed CSS custom properties at runtime
	const styles = getComputedStyle(document.documentElement);
	const isDark = document.documentElement.classList.contains('dark');

	return EditorView.theme(
		{
			'&': {
				height: '100%',
				fontSize: '14px',
				backgroundColor: styles.getPropertyValue('--color-background').trim()
			},
			'.cm-scroller': {
				overflow: 'auto',
				fontFamily: 'ui-monospace, monospace'
			},
			'.cm-content': {
				padding: '8px 0',
				color: styles.getPropertyValue('--color-foreground').trim()
			},
			'.cm-line': {
				padding: '0 8px'
			},
			'.cm-cursor, .cm-dropCursor': {
				borderLeftColor: styles.getPropertyValue('--color-foreground').trim()
			},
			'&.cm-focused .cm-cursor': {
				borderLeftColor: styles.getPropertyValue('--color-foreground').trim()
			},
			'.cm-activeLine': {
				backgroundColor: styles.getPropertyValue('--color-surface').trim()
			},
			'.cm-selectionBackground, .cm-focused .cm-selectionBackground': {
				backgroundColor: styles.getPropertyValue('--color-accent').trim()
			},
			'.cm-gutters': {
				backgroundColor: styles.getPropertyValue('--color-background').trim(),
				color: styles.getPropertyValue('--color-muted-foreground').trim(),
				border: 'none'
			}
		},
		{ dark: isDark }
	);
}
