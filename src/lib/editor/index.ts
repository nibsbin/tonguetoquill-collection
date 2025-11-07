/**
 * QuillMark editor features for CodeMirror
 * Provides syntax highlighting, folding, and auto-completion for QuillMark syntax
 */

export { quillmarkDecorator } from './quillmark-decorator';
export { createQuillmarkTheme } from './quillmark-theme';
export { quillmarkFoldService, findClosingDelimiter } from './quillmark-folding';
export { isMetadataDelimiter, findMetadataBlocks } from './quillmark-patterns';
export { foldMetadataBlockAtPosition, toggleAllMetadataBlocks } from './quillmark-fold-utils';
export type * from './quillmark-patterns';
