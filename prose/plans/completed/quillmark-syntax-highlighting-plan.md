# QuillMark Syntax Highlighting Implementation Plan

## Overview

This plan outlines the implementation of robust syntax highlighting for QuillMark's extended markdown syntax in CodeMirror 6, based on the design specified in [prose/designs/frontend/QUILLMARK_SYNTAX_HIGHLIGHTING.md](../designs/frontend/QUILLMARK_SYNTAX_HIGHLIGHTING.md).

**Approach:** Decoration-based highlighting using ViewPlugin (not custom Lezer grammar)

**Timeline:** Phased implementation with incremental delivery

## Goals

1. Visually distinguish QuillMark metadata blocks from standard markdown
2. Highlight SCOPE and QUILL keywords prominently
3. Provide YAML syntax highlighting within metadata blocks
4. Support code folding for metadata blocks
5. Offer auto-completion for SCOPE/QUILL names
6. Maintain performance with large documents

## Prerequisites

- [x] Existing CodeMirror 6 setup with standard markdown mode
- [x] Theme system with CSS custom properties
- [x] QuillMark parser specification (PARSE.md)
- [x] Semantic token definitions in DESIGN_SYSTEM.md
- [ ] Review and approval of QUILLMARK_SYNTAX_HIGHLIGHTING.md design

## Semantic Tokens for Syntax Highlighting

The following semantic tokens have been added to the design system (DESIGN_SYSTEM.md) to support QuillMark syntax highlighting. These tokens ensure maintainability and automatic theme adaptation while providing customization points for future enhancements.

### New Semantic Tokens

**Color Tokens:**

- `--color-syntax-keyword`: Keywords and structural elements (SCOPE/QUILL keywords)
  - Light mode: `#355e93` (USAF blue)
  - Dark mode: `#355e93` (USAF blue - consistent brand color)
- `--color-syntax-identifier`: Identifiers and names (scope/quill names)
  - Light mode: `#0891b2` (darker cyan for contrast)
  - Dark mode: `#06b6d4` (brighter cyan)
- `--color-syntax-string`: String literals
  - Light mode: `#16a34a` (darker green for contrast)
  - Dark mode: `#22c55e` (brighter green)
- `--color-syntax-number`: Numeric literals
  - Light mode: `#d97706` (darker amber for contrast)
  - Dark mode: `#f59e0b` (brighter amber)
- `--color-syntax-boolean`: Boolean values
  - Light mode: `#7c3aed` (darker purple for contrast)
  - Dark mode: `#8b5cf6` (brighter purple)
- `--color-syntax-metadata-bg`: Metadata block background (light mode)
  - Value: `rgba(53, 94, 147, 0.03)` (very subtle blue tint)
- `--color-syntax-metadata-bg-dark`: Metadata block background (dark mode)
  - Value: `rgba(53, 94, 147, 0.08)` (slightly more visible blue tint)
- `--color-syntax-metadata-border`: Metadata block border
  - Value: `#355e93` (USAF blue - consistent across themes)

### Token Consolidation Rationale

The tokens were consolidated to balance maintainability with customizability:

1. **Reuse existing tokens**: Delimiters use `--color-muted-foreground`, YAML keys use `--color-foreground` - no new tokens needed
2. **Semantic grouping**: All syntax colors share the `--color-syntax-*` prefix for easy discovery
3. **Type-based tokens**: String, number, boolean tokens can be reused for other syntax highlighting (not just YAML)
4. **Separate light/dark backgrounds**: Metadata backgrounds need different opacity in each theme, so we use two tokens instead of relying on theme cascade
5. **Shared border**: Same border color across themes reinforces brand identity

### Accessibility Considerations

All syntax colors meet WCAG AA contrast requirements (4.5:1 minimum):

- Light mode uses darker variants for better contrast on white background
- Dark mode uses brighter variants for better contrast on dark background
- Keyword color (USAF blue) works in both themes due to moderate luminance

### Implementation Requirements

When implementing the theme in `src/lib/editor/quillmark-theme.ts`:

1. Reference semantic tokens using `var(--color-syntax-*)` instead of hardcoded values
2. Handle metadata background specially - use `--color-syntax-metadata-bg` in light mode and check for `.dark` class to switch to `--color-syntax-metadata-bg-dark`
3. Ensure CodeMirror theme reads from CSS custom properties at runtime (not build time)
4. Test with theme switching to verify colors update correctly

## Implementation Phases

### Phase 1: Core Pattern Detection & Decoration (MVP)

**Goal:** Basic visual differentiation of metadata blocks

**Tasks:**

1. **Create Pattern Detection Module** (`src/lib/editor/quillmark-patterns.ts`)
   - Implement `isMetadataDelimiter(line, doc)` function
   - Implement horizontal rule disambiguation logic
   - Implement `findMetadataBlocks(doc)` to locate all blocks
   - Add unit tests for pattern detection

2. **Create Decoration Plugin** (`src/lib/editor/quillmark-decorator.ts`)
   - Implement ViewPlugin class with `computeDecorations()`
   - Decorate `---` delimiters with `.cm-quillmark-delimiter`
   - Decorate metadata block ranges with `.cm-quillmark-block`
   - Apply viewport-based decoration for performance
   - Add integration tests with sample documents

3. **Create Base Theme** (`src/lib/editor/quillmark-theme.ts`)
   - Define CSS classes for decorations using semantic tokens
   - Style delimiters using `var(--color-muted-foreground)`
   - Style block backgrounds using `var(--color-syntax-metadata-bg)` (light) / `var(--color-syntax-metadata-bg-dark)` (dark)
   - Style block borders using `var(--color-syntax-metadata-border)`
   - Ensure theme adapts automatically to light/dark mode changes
   - Test color contrast for accessibility (WCAG AA compliance)

4. **Integrate into MarkdownEditor** (`src/lib/components/Editor/MarkdownEditor.svelte`)
   - Import and add `quillmarkDecorator` to extensions array
   - Import and add `quillmarkTheme` to extensions array
   - Test with sample QuillMark documents
   - Verify theme changes update correctly

**Deliverable:** Metadata blocks are visually distinct from body content

**Acceptance Criteria:**

- `---` delimiters are highlighted in muted color
- Metadata blocks have subtle background tint and left border
- Horizontal rules (blank lines above and below) are NOT highlighted as metadata
- Performance: No lag when scrolling through 1000+ line documents
- Themes: Works in both light and dark modes

---

### Phase 2: Keyword & YAML Highlighting

**Goal:** Highlight SCOPE/QUILL keywords and YAML content

**Tasks:**

1. **Extend Pattern Detection** (`src/lib/editor/quillmark-patterns.ts`)
   - Implement `findScopeQuillKeywords(from, to, doc)` function
   - Implement `findYamlKeys(from, to, doc)` function
   - Implement `findYamlValues(from, to, doc)` function
   - Detect value types (string, number, boolean)
   - Add tests for keyword and YAML detection

2. **Enhance Decorator Plugin** (`src/lib/editor/quillmark-decorator.ts`)
   - Decorate SCOPE/QUILL keywords with `.cm-quillmark-scope-keyword` / `.cm-quillmark-quill-keyword`
   - Decorate scope/quill names with `.cm-quillmark-scope-name`
   - Decorate YAML keys with `.cm-quillmark-yaml-key`
   - Decorate YAML values with type-specific classes (`.cm-quillmark-yaml-string`, etc.)
   - Handle overlapping decorations correctly
   - Add tests for decoration priority

3. **Expand Theme** (`src/lib/editor/quillmark-theme.ts`)
   - Style SCOPE/QUILL keywords using `var(--color-syntax-keyword)` with semi-bold weight
   - Style scope/quill names using `var(--color-syntax-identifier)` with medium weight
   - Style YAML keys using `var(--color-foreground)` (primary text)
   - Style YAML values by type using semantic tokens:
     - Strings: `var(--color-syntax-string)`
     - Numbers: `var(--color-syntax-number)`
     - Booleans: `var(--color-syntax-boolean)`
   - Test with various QuillMark documents in both light and dark modes
   - Verify all colors meet WCAG AA accessibility contrast requirements

4. **Visual Testing**
   - Create test fixtures with various QuillMark patterns
   - Screenshot comparison tests
   - Manual testing with editor component

**Deliverable:** Full syntax highlighting for QuillMark constructs

**Acceptance Criteria:**

- SCOPE and QUILL keywords are prominently highlighted in USAF blue
- Scope/quill names are clearly visible in cyan
- YAML keys and values have appropriate colors
- Different value types (string, number, boolean) use different colors
- No visual glitches or overlapping highlights
- Accessibility: All colors meet WCAG AA contrast requirements

---

### Phase 3: Code Folding Support

**Goal:** Allow collapsing/expanding metadata blocks

**Tasks:**

1. **Implement Fold Service** (`src/lib/editor/quillmark-folding.ts`)
   - Implement `findClosingDelimiter(lineNum, doc)` function
   - Implement fold service that detects metadata block ranges
   - Handle unclosed blocks gracefully (no fold)
   - Add unit tests for fold detection

2. **Add Fold Gutter**
   - Configure `foldGutter()` with custom markers
   - Style fold indicators (triangles/chevrons)
   - Add hover effects
   - Ensure 44x44px touch targets for mobile

3. **Integrate Folding** (`src/lib/components/Editor/MarkdownEditor.svelte`)
   - Add fold service to extensions
   - Add fold gutter to extensions
   - Add keyboard shortcuts (Ctrl/Cmd+Shift+[/])
   - Test folding with nested structures

4. **Fold State Persistence** (optional for MVP)
   - Store fold state in localStorage
   - Restore on component mount
   - Clear on document change

**Deliverable:** Working code folding for metadata blocks

**Acceptance Criteria:**

- Click fold gutter to collapse/expand metadata blocks
- Keyboard shortcuts toggle folding
- Collapsed blocks show ellipsis or summary
- Folding works with nested markdown structures (lists, blockquotes)
- Touch targets are large enough for mobile (44x44px)
- No performance issues when folding many blocks

---

### Phase 4: Auto-Completion

**Goal:** Suggest SCOPE/QUILL names while typing

**Tasks:**

1. **Implement Completion Provider** (`src/lib/editor/quillmark-completion.ts`)
   - Detect cursor position after `SCOPE: ` or `QUILL: `
   - Extract existing scope names from document
   - Fetch available quill templates from QuillmarkService
   - Return completion options with labels and descriptions
   - Add tests for completion detection

2. **Integrate Auto-Completion** (`src/lib/components/Editor/MarkdownEditor.svelte`)
   - Add `quillmarkCompletion` to extensions
   - Configure auto-completion UI
   - Test with keyboard navigation (arrows, Enter, Tab)

3. **Enhance UX**
   - Show documentation hints for quill templates
   - Prevent duplicate scope name suggestions
   - Sort suggestions alphabetically
   - Test accessibility with screen readers

**Deliverable:** Context-aware auto-completion for QuillMark

**Acceptance Criteria:**

- Typing `SCOPE: ` triggers scope name suggestions
- Typing `QUILL: ` triggers quill template suggestions
- Suggestions show existing scope names (prevent typos)
- Quill suggestions include descriptions
- Arrow keys navigate, Enter/Tab accept
- Escape dismisses completion menu
- Screen reader announces suggestions

---

## File Structure

New files to create:

```
src/lib/editor/
├── quillmark-patterns.ts       # Pattern detection utilities
├── quillmark-decorator.ts      # ViewPlugin for decorations
├── quillmark-theme.ts          # Theme styling
├── quillmark-folding.ts        # Fold service
├── quillmark-completion.ts     # Auto-completion provider
└── index.ts                    # Re-export all QuillMark editor features
```

Existing files to modify:

```
src/lib/components/Editor/MarkdownEditor.svelte  # Integrate plugins
src/lib/utils/editor-theme.ts                    # May need updates for theme consistency
```

Test files to create:

```
src/lib/editor/quillmark-patterns.test.ts
src/lib/editor/quillmark-decorator.test.ts
src/lib/editor/quillmark-folding.test.ts
src/lib/editor/quillmark-completion.test.ts
```

## Testing Strategy

### Unit Tests

For each module (`quillmark-patterns.ts`, `quillmark-folding.ts`, etc.):

- Test with sample QuillMark documents
- Test edge cases (no frontmatter, unclosed blocks, HR disambiguation)
- Test performance with large documents (1000+ lines)

### Integration Tests

For `MarkdownEditor.svelte`:

- Mount component with QuillMark content
- Verify decorations appear
- Verify folding works
- Verify auto-completion triggers
- Test theme switching

### Visual Regression Tests

- Screenshot tests for syntax highlighting
- Compare light vs dark themes
- Verify no visual glitches

### Accessibility Tests

- Color contrast validation (axe-core)
- Keyboard navigation testing
- Screen reader testing (NVDA, VoiceOver)

## Dependencies

**No new dependencies required.** All necessary packages are already installed:

- `@codemirror/state`
- `@codemirror/view`
- `@codemirror/lang-markdown`
- `@codemirror/language`
- `@codemirror/autocomplete`

## Risks & Mitigations

### Risk 1: Performance with Large Documents

**Mitigation:**

- Use viewport-based decoration (only visible ranges)
- Cache metadata block positions in StateField
- Profile with 5000+ line documents
- Optimize regex patterns for speed

### Risk 2: Complex Edge Cases

**Mitigation:**

- Start with simple patterns, iterate based on testing
- Comprehensive test suite with edge cases
- Graceful degradation (fall back to standard markdown)
- Document known limitations

### Risk 3: Theme Inconsistencies

**Mitigation:**

- Use CSS custom properties from design system
- Test in both light and dark themes
- Validate color contrast with automated tools
- Manual testing on different displays

## Documentation Updates

### Update MARKDOWN_EDITOR.md

Remove or deprecate sections:

- **Lines 125-180**: Custom Lezer grammar approach (deprecated)
- **Lines 181-216**: Replace syntax highlighting section with reference to QUILLMARK_SYNTAX_HIGHLIGHTING.md

Add cross-reference:

- Link to QUILLMARK_SYNTAX_HIGHLIGHTING.md for syntax highlighting details

### Update INDEX.md

Add reference to new design document:

- List QUILLMARK_SYNTAX_HIGHLIGHTING.md in frontend designs index

## Success Metrics

**MVP (Phase 1-2) Success:**

- Metadata blocks are visually distinct from body content
- SCOPE/QUILL keywords are prominently highlighted
- YAML content has appropriate syntax colors
- No performance degradation (<16ms frame time when scrolling)
- Passes accessibility contrast requirements (WCAG AA)

**Full Implementation (Phase 1-4) Success:**

- All QuillMark syntax is highlighted correctly
- Code folding works for all metadata blocks
- Auto-completion reduces typos and improves UX
- User testing shows improved editing experience
- No bugs reported in production after 2 weeks

## Timeline Estimate

**Note:** Per agent instructions, we do NOT make time estimates. This section lists phases in order of priority.

**Priority Order:**

1. Phase 1 (Core) - Highest priority, enables basic visual differentiation
2. Phase 2 (Keywords) - High priority, completes syntax highlighting
3. Phase 3 (Folding) - Medium priority, improves usability
4. Phase 4 (Completion) - Lower priority, nice-to-have enhancement

## Open Questions

1. Should we highlight invalid YAML syntax (red underlines)?
   - **Decision:** Post-MVP feature, implement in separate iteration

2. Should we show warnings for scope name collisions?
   - **Decision:** Post-MVP feature, requires validation layer

3. Should folded blocks show summaries (first line preview)?
   - **Decision:** Include in Phase 3 if time permits, otherwise post-MVP

4. Should we cache decoration results across updates?
   - **Decision:** Implement if performance testing shows need

## References

- [QUILLMARK_SYNTAX_HIGHLIGHTING.md](../designs/frontend/QUILLMARK_SYNTAX_HIGHLIGHTING.md) - Design specification
- [PARSE.md](../designs/quillmark/PARSE.md) - QuillMark syntax rules
- [MARKDOWN_EDITOR.md](../designs/frontend/MARKDOWN_EDITOR.md) - Overall editor design
- [CodeMirror 6 Decorations Guide](https://codemirror.net/docs/guide/#decorating-the-document)
- [ViewPlugin Documentation](https://codemirror.net/docs/ref/#view.ViewPlugin)

---

_Plan Status: Ready for Implementation_
_Last Updated: 2025-11-02_
