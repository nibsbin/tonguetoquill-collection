# Markdown Syntax Highlighting Plan

**Problem**: The markdown editor currently only highlights QuillMark metadata blocks. Standard markdown syntax elements (bold, italics, links) have no visual distinction, making it harder for users to recognize formatting at a glance.

**Unifying Insight**: The existing quillmark decorator pattern already provides the architecture for syntax highlighting. We can extend this pattern to recognize and decorate standard markdown syntax elements.

**Solution**: Extend the existing decorator system to identify and highlight bold (`**text**`, `__text__`), italic (`*text*`, `_text_`), and link (`[text](url)`) markdown patterns outside of metadata blocks.

---

## Current State

### Existing Decorator Architecture

The editor already implements syntax highlighting for QuillMark metadata blocks using:

- **Pattern Recognition** (`src/lib/editor/quillmark-patterns.ts`): Functions that find specific patterns in the document (metadata blocks, SCOPE/QUILL keywords, YAML pairs, comments)
- **Decoration Application** (`src/lib/editor/quillmark-decorator.ts`): ViewPlugin that applies visual decorations to matched patterns
- **Theme Styling** (`src/lib/editor/quillmark-theme.ts`): CSS-in-JS theme that defines colors and styles for decorations

### Current Limitations

- Only metadata blocks (content between `---` delimiters) receive syntax highlighting
- Regular markdown content appears as plain text
- Users cannot visually distinguish formatted text from unformatted text while editing

---

## Desired State

### Extended Pattern Recognition

Add markdown pattern detection functions to `quillmark-patterns.ts`:

- Detect bold syntax: `**text**` and `__text__`
- Detect italic syntax: `*text*` and `_text_`
- Detect link syntax: `[text](url)` and `[text][ref]`

### Enhanced Decorator

Extend `quillmark-decorator.ts` to:

- Apply decorations to markdown patterns found outside metadata blocks
- Handle overlapping patterns (e.g., bold within italics)
- Maintain performance for large documents (only process visible ranges)

### Expanded Theme

Add new decoration styles to `quillmark-theme.ts`:

- Bold markers: Dimmed delimiter color
- Bold text: Preserved text weight, subtle visual distinction
- Italic markers: Dimmed delimiter color
- Italic text: Preserved text style, subtle visual distinction
- Link text: Distinct color for clickable text
- Link URL: Dimmed color for URL portion

---

## Design Decisions

### Pattern Recognition Strategy

**Outside Metadata Blocks Only**: Apply markdown syntax highlighting only to content outside QuillMark metadata blocks. This prevents conflicts with YAML content inside metadata blocks where `*` and `_` have different meanings.

**Regex Patterns**:

- Bold: `/\*\*([^*]+)\*\*/g` and `/__([^_]+)__/g`
- Italic: `/\*([^*]+)\*/g` and `/_([^_]+)_/g`
- Links: `/\[([^\]]+)\]\(([^)]+)\)/g` and `/\[([^\]]+)\]\[([^\]]+)\]/g`

**Pattern Precedence**: Process patterns in order (bold → italic → links) to handle overlapping syntax correctly.

### Decoration Strategy

**Mark Decorations**: Use `Decoration.mark()` for inline syntax elements (consistent with existing YAML highlighting).

**Separate Marks for Delimiters vs Content**:

- Delimiter marks: Style the `**`, `*`, `[`, `]`, `(`, `)` characters
- Content marks: Style the text between delimiters

This separation allows different styling for markers (dimmed) and content (preserved weight/style + subtle color).

### Theme Strategy

**Design Tokens**: Use existing CSS custom properties where possible:

- Delimiters: `--color-muted-foreground` (consistent with metadata delimiters)
- Content: Inherit editor foreground with subtle modifications

**New Token Needs**:

- `--color-syntax-link`: For link text (distinct from regular text)
- No new tokens needed for bold/italic (use existing foreground with modifications)

**Accessibility**: Ensure 4.5:1 contrast ratio for WCAG Level AA compliance.

---

## Implementation Transition

### Phase 1: Pattern Recognition

Extend `src/lib/editor/quillmark-patterns.ts`:

- Add interfaces for markdown pattern results
- Add `findMarkdownBold()` function
- Add `findMarkdownItalic()` function
- Add `findMarkdownLinks()` function
- Add helper to exclude metadata block ranges

### Phase 2: Decorator Extension

Extend `src/lib/editor/quillmark-decorator.ts`:

- Collect markdown patterns from visible ranges
- Apply decorations for bold delimiters and content
- Apply decorations for italic delimiters and content
- Apply decorations for link components (text, brackets, url, parens)
- Sort all decorations before adding to builder (maintain existing pattern)

### Phase 3: Theme Enhancement

Extend `src/lib/editor/quillmark-theme.ts`:

- Add styles for `.cm-markdown-bold-delimiter`
- Add styles for `.cm-markdown-bold-content`
- Add styles for `.cm-markdown-italic-delimiter`
- Add styles for `.cm-markdown-italic-content`
- Add styles for `.cm-markdown-link-text`
- Add styles for `.cm-markdown-link-url`
- Add styles for `.cm-markdown-link-bracket`

### Phase 4: Design Tokens (if needed)

If existing tokens are insufficient, extend design system:

- Add `--color-syntax-link` to light theme
- Add `--color-syntax-link` to dark theme
- Document in `prose/designs/DESIGN_TOKENS.md`

---

## Technical Considerations

### Performance

- **Incremental Processing**: Only process visible ranges (existing pattern)
- **Efficient Regex**: Use non-backtracking patterns
- **Decoration Caching**: Recompute only on document or viewport changes (existing pattern)

### Edge Cases

- **Nested Patterns**: Bold within italic (`*__text__*`)
- **Escaped Characters**: `\*` should not trigger italic detection
- **Incomplete Patterns**: Unclosed bold/italic should not highlight
- **URLs with Markdown**: Link URLs may contain `*` or `_` characters

### Testing Strategy

- Add unit tests to `quillmark-patterns.test.ts`
- Test pattern detection for all markdown variations
- Test exclusion of metadata block content
- Test edge cases (nested, escaped, incomplete)
- Manual testing in DocumentEditor with various markdown documents

---

## Success Criteria

- [ ] Bold syntax (`**text**` and `__text__`) visually highlighted
- [ ] Italic syntax (`*text*` and `_text_`) visually highlighted
- [ ] Link syntax (`[text](url)`) visually highlighted
- [ ] Markdown patterns not highlighted within metadata blocks
- [ ] All existing tests passing
- [ ] New pattern detection tests passing
- [ ] No performance degradation for large documents
- [ ] WCAG Level AA contrast compliance
- [ ] No conflicts with existing QuillMark highlighting

---

## Benefits

**User Experience**:

- Visual feedback while typing formatted text
- Easier to spot formatting mistakes
- Reduced cognitive load when editing

**Consistency**:

- Consistent with how metadata blocks are already highlighted
- Follows existing decorator pattern architecture
- Uses existing design tokens and theme system

**Maintainability**:

- Extends existing pattern without major refactoring
- Reuses proven decorator architecture
- Clear separation of concerns (patterns, decorations, themes)

---

## Cross-References

- **Architecture**: See `prose/designs/ARCHITECTURE.md` for component organization
- **Design Tokens**: See `prose/designs/DESIGN_TOKENS.md` for color system
- **Existing Editor**: See `src/lib/components/Editor/MarkdownEditor.svelte`
- **Decorator Pattern**: See `src/lib/editor/quillmark-decorator.ts`
- **Pattern Recognition**: See `src/lib/editor/quillmark-patterns.ts`
- **Theme System**: See `src/lib/editor/quillmark-theme.ts`

---

_Created: 2025-11-10_
_Status: Planned_
_Category: Feature Enhancement / Editor UX_
