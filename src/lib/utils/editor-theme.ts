import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';

/**
 * Creates a CodeMirror theme using CSS custom properties
 * from the document's computed styles
 */
export function createEditorTheme(): Extension {
	// Get computed CSS custom properties at runtime
	const styles = getComputedStyle(document.documentElement);

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
		'.cm-cursor': {
			borderLeftColor: styles.getPropertyValue('--color-editor-cursor').trim()
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
	});
}
