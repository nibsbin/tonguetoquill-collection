# Markdown Editor Design

## Overview

Tonguetoquill uses CodeMirror 6 for its markdown editing experience, with custom extensions to support Quillmark's extended markdown syntax. The editor provides syntax highlighting, code folding, and intelligent editing features for both standard markdown and inline metadata blocks.

**Key Features:**

- Syntax highlighting for standard and extended markdown
- Code folding for YAML frontmatter and inline metadata blocks
- Smart indentation and auto-completion
- Line numbers and active line highlighting
- Keyboard shortcuts for formatting
- Accessibility support (screen readers, keyboard navigation)
- Mobile-responsive touch interactions

## Extended Markdown Support

### Quillmark Extended Syntax

The editor supports Quillmark's Extended YAML Metadata Standard as defined in [prose/designs/quillmark/PARSE.md](../quillmark/PARSE.md):

**Global Frontmatter:**

```markdown
---
title: Document Title
author: John Doe
---
```

**Inline Metadata Blocks with SCOPE:**

```markdown
---
SCOPE: sub_documents
title: First Section
---

Section content here.

---

SCOPE: sub_documents
title: Second Section

---

More content.
```

**QUILL Template Blocks:**

```markdown
---
QUILL: usaf_memo
recipient: Col. Smith
subject: Quarterly Report
---
```

### Metadata Block Rules

Per PARSE.md specifications:

- **SCOPE key**: Creates collections aggregated into arrays
- **QUILL key**: Specifies quill template to use
- **Scope names**: Must match pattern `[a-z_][a-z0-9_]*`
- **Reserved names**: Cannot use `body` as scope name
- **Horizontal rules**: `---` with blank lines above AND below treated as markdown HR, not metadata
- **Single global**: Only one block without SCOPE/QUILL allowed
- **No collisions**: Global field names cannot conflict with scope names

## CodeMirror 6 Architecture

### Core Concepts

**State Management:**

- Immutable editor state model
- Transactions for all state changes
- Undo/redo built on transaction history
- Efficient updates through state effects

**Extension System:**

- Modular architecture via extensions
- Extensions provide behaviors, UI elements, styling
- Facets for configuration values
- State fields for maintaining custom state

**View Layer:**

- Efficient DOM updates through reconciliation
- Handles rendering, input, and user interaction
- Supports decorations for styling text ranges
- Gutter components for line numbers, folding

### Editor Configuration

**Base Extensions:**

- `basicSetup`: Common editing features (line numbers, undo/redo, search)
- `EditorView.lineWrapping`: Soft line wrapping for readability
- `EditorState.tabSize`: Configure tab behavior (2 or 4 spaces)
- `history()`: Undo/redo with keyboard shortcuts
- `drawSelection()`: Visual selection highlighting
- `keymap.of()`: Custom keyboard shortcuts

**Language Support:**

- Custom language mode for extended markdown
- Syntax highlighting via Lezer parser
- Indentation rules
- Auto-completion providers

**Accessibility:**

- ARIA labels and roles
- Keyboard navigation support
- Screen reader announcements
- Focus management

## QuillMark Syntax Highlighting

> **See:** [QUILLMARK_SYNTAX_HIGHLIGHTING.md](../quillmark/QUILLMARK_SYNTAX_HIGHLIGHTING.md) for complete syntax highlighting design

### Approach

The editor uses a **decoration-based highlighting approach** rather than custom Lezer grammar. This provides:

- **Simplicity**: Pattern matching with regular expressions
- **Robustness**: Falls back to standard markdown gracefully
- **Maintainability**: Easy to understand and modify
- **No build overhead**: Pure TypeScript, no grammar compilation

### Implementation

**Architecture:**

```
Standard Markdown Mode (base layer)
    ↓
QuillMark Decorator Plugin (enhancement layer)
    ↓
Custom Highlighting Theme (visual layer)
```

**Pattern Detection:**

- Metadata block detection (via `---` delimiters)
- Horizontal rule disambiguation (blank lines above AND below)
- SCOPE/QUILL keyword recognition
- YAML content detection (keys, values, types)

**Decoration Strategy:**

- ViewPlugin scans visible viewport
- Applies CSS classes to detected patterns
- Theme defines colors for each class
- Updates incrementally on document changes

**Visual Design:**

Follows [DESIGN_SYSTEM.md - Theme System](./DESIGN_SYSTEM.md#theme-system):

- Metadata delimiters: Muted text using `var(--color-muted-foreground)`
- SCOPE/QUILL keywords: Brand color using `var(--color-syntax-keyword)` (USAF blue)
- Scope/quill names: Identifier color using `var(--color-syntax-identifier)` (cyan)
- YAML keys: Primary text color using `var(--color-foreground)`
- YAML values: Type-specific semantic colors:
  - Strings: `var(--color-syntax-string)` (green)
  - Numbers: `var(--color-syntax-number)` (amber)
  - Booleans: `var(--color-syntax-boolean)` (purple)
- Metadata blocks: Subtle background tint using `var(--color-syntax-metadata-bg)` with border using `var(--color-syntax-metadata-border)`

**Note**: All colors use semantic tokens that automatically adapt to light/dark themes with appropriate contrast adjustments.

---

### Deprecated: Lezer Grammar Approach

**Note:** An earlier version of this document proposed a custom Lezer grammar for QuillMark syntax. This approach has been **deprecated** due to:

- High complexity and fragility
- Difficult maintenance and debugging
- Specialized knowledge required
- Additional build tooling overhead

The decoration-based approach (see [QUILLMARK_SYNTAX_HIGHLIGHTING.md](../quillmark/QUILLMARK_SYNTAX_HIGHLIGHTING.md)) supersedes the Lezer grammar approach.

## Code Folding

### Folding Strategy

**Foldable Regions:**

- Global frontmatter (opening `---` to closing `---`)
- Each scoped metadata block (opening `---` to closing `---`)
- QUILL template blocks (opening `---` to closing `---`)
- Standard markdown elements (headings, code blocks, lists)

**Fold Indicators:**

Gutter widgets show fold state:

- **Collapsed**: Right-pointing triangle `▶` or chevron
- **Expanded**: Down-pointing triangle `▼` or chevron
- **Hoverable**: Highlight on hover
- **Clickable**: Toggle on click

**Folding Behavior:**

- Click fold indicator to collapse/expand
- Keyboard shortcut: Ctrl/Cmd+Shift+[ to fold, Ctrl/Cmd+Shift+] to unfold
- Fold all metadata: Custom command to fold all `---` blocks
- Preserve fold state across editor sessions (via localStorage)

### Fold Range Detection

**Metadata Block Ranges:**

Detect foldable regions by identifying matched `---` pairs:

1. Scan document for `---` at line start
2. Classify as metadata delimiter (not HR)
3. Match opening `---` with corresponding closing `---`
4. Create fold range from opening line to closing line
5. Show summary when collapsed: first line of YAML or "Metadata..."

**Summary Display:**

When collapsed, show:

- Global frontmatter: `--- title: "..." ...`
- Scoped block: `--- SCOPE: sub_documents ...`
- QUILL block: `--- QUILL: usaf_memo ...`
- Truncate with ellipsis if too long

**Nested Folding:**

CodeMirror supports nested folds naturally:

- Fold entire document sections (headings)
- Independently fold metadata blocks within sections
- Nested markdown structures (lists, blockquotes)

## Editor Features

### Formatting Toolbar Integration

The toolbar provides markdown formatting controls.

**Toolbar Actions:**

Each toolbar button triggers an editor transaction:

- **Bold**: Wrap selection in `**` or insert `**text**`
- **Italic**: Wrap selection in `*` or insert `*text*`
- **Strikethrough**: Wrap selection in `~~` or insert `~~text~~`
- **Code Block**: Insert triple backticks with language hint
- **Quote**: Prefix lines with `> `
- **Bullet List**: Prefix lines with `- `
- **Numbered List**: Prefix lines with `1. `, `2. `, etc.
- **Link**: Insert `[text](url)` or wrap selection

**Implementation Approach:**

- Toolbar button dispatches transaction
- Transaction modifies editor state
- State change triggers view update
- Cursor repositions appropriately

### Auto-Indentation

**Markdown-Aware Indentation:**

- Lists: Maintain indent level on Enter
- Blockquotes: Continue `> ` prefix on Enter
- Code blocks: Maintain indentation within blocks
- Metadata blocks: YAML indentation rules

**YAML Indentation:**

Within metadata blocks:

- Nested objects: 2-space indent per level
- Arrays: Align dashes at same level
- Smart dedent on closing delimiter

### Auto-Completion

**Context-Aware Suggestions:**

Based on cursor position and context:

- **After `SCOPE: `**: Suggest existing scope names (prevent typos)
- **After `QUILL: `**: Suggest available quill template names
- **YAML keys**: Suggest common frontmatter fields (title, author, date)
- **Markdown syntax**: Suggest headings, lists, code blocks
- **Links**: Suggest recently used URLs (optional)

**Completion UI:**

- Dropdown menu below cursor
- Arrow keys to navigate
- Enter/Tab to accept
- Escape to dismiss
- Shows documentation hint for quill templates

### Keyboard Shortcuts

Per [DESIGN_SYSTEM.md - Keyboard Shortcuts](./DESIGN_SYSTEM.md):

**Formatting:**

- Ctrl/Cmd+B: Bold
- Ctrl/Cmd+I: Italic
- Ctrl/Cmd+K: Insert link

**Editor:**

- Ctrl/Cmd+S: Save (triggers auto-save immediately)
- Ctrl/Cmd+Z: Undo
- Ctrl/Cmd+Shift+Z: Redo
- Ctrl/Cmd+F: Find
- Ctrl/Cmd+H: Find and replace

**Folding:**

- Ctrl/Cmd+Shift+[: Fold current block
- Ctrl/Cmd+Shift+]: Unfold current block
- Ctrl/Cmd+K Ctrl/Cmd+0: Fold all
- Ctrl/Cmd+K Ctrl/Cmd+J: Unfold all

**Navigation:**

- Ctrl/Cmd+G: Go to line
- Ctrl/Cmd+Home: Jump to document start
- Ctrl/Cmd+End: Jump to document end

## Accessibility

### Screen Reader Support

**ARIA Annotations:**

- Editor region labeled: `aria-label="Markdown editor"`
- Status announcements: Save state, error messages
- Live regions for transient messages
- Proper role attributes

**Keyboard Navigation:**

- All features accessible via keyboard
- No keyboard traps
- Visible focus indicators
- Tab navigation within editor and to toolbar

**Semantic Structure:**

- Editor wrapped in `<div role="textbox" aria-multiline="true">`
- Toolbar has `role="toolbar"`
- Buttons have descriptive `aria-label` attributes

### Visual Accessibility

**Color Contrast:**

All syntax colors meet WCAG AA requirements:

- Normal text: 4.5:1 minimum contrast
- Large text: 3:1 minimum contrast
- UI components: 3:1 minimum contrast
- High contrast mode: 7:1 via `prefers-contrast: high`

**Focus Indicators:**

Per [DESIGN_SYSTEM.md - Focus Indicators](./DESIGN_SYSTEM.md):

- 2px solid outline using `var(--color-ring)` (adapts to theme)
- 3px in high contrast mode
- Visible on all interactive elements
- Never removed via CSS

**Font Sizing:**

Minimum 16px font size on mobile to prevent zoom on focus. Desktop: 14px monospace for code editing comfort.

## Mobile Optimization

### Touch Interactions

**Touch Targets:**

- Fold indicators: 44x44px minimum
- Toolbar buttons: 44px height, 48px on mobile
- Gutter: 48px width on mobile for comfortable tapping

**Gestures:**

- Long press: Select word, show context menu
- Double tap: Select word
- Pinch zoom: Disabled for editor area (stable layout)
- Swipe: Scroll editor content

**Virtual Keyboard:**

- 16px minimum font size prevents iOS zoom
- Toolbar remains visible above keyboard
- Auto-save on blur when keyboard dismisses
- Scroll active line into view when typing

### Responsive Behavior

**Tablet/Mobile Adaptations:**

- Line numbers: Optional on narrow screens (<640px)
- Fold gutter: Always visible (essential for managing metadata)
- Toolbar: Horizontal scroll if needed, most-used buttons first
- Editor padding: Reduced to 12px on mobile (vs 16px desktop)

**Layout Integration:**

Per [DESIGN_SYSTEM.md - Navigation Patterns](./DESIGN_SYSTEM.md):

- **Desktop (≥1024px)**: Split editor/preview side-by-side
- **Tablet (768-1023px)**: Collapsible preview or tabs
- **Mobile (<768px)**: Tabbed interface, full-screen editor OR preview

## Performance Considerations

### Efficient Rendering

**Viewport-Based Rendering:**

CodeMirror 6 only renders visible lines:

- Scrolling loads/unloads content dynamically
- Handles large documents (thousands of lines) efficiently
- Minimal DOM manipulation
- Smooth scrolling performance

**Incremental Parsing:**

Lezer parser updates incrementally:

- Only re-parse changed regions
- Cache parse results for unchanged content
- Fast syntax highlighting updates during typing

### Debounced Operations

**Auto-Save Integration:**

Per [DESIGN_SYSTEM.md - Auto-Save Behavior](./DESIGN_SYSTEM.md):

- 4-second debounce after last keystroke (configurable)
- Editor content changes trigger auto-save timer
- Manual save (Ctrl/Cmd+S) bypasses debounce
- Save status indicator updates in TopMenu

**Preview Updates:**

Coordinate with Preview component:

- Debounced preview rendering (50-300ms)
- Editor emits content change events
- Preview subscribes and debounces updates
- Preserve scroll position during updates

## State Management Integration

### Document Content Synchronization

**Svelte Store Integration:**

Per [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md):

- Global document store holds current document content
- Editor initializes from store value
- Editor changes update store via transactions
- Store changes update editor state (external edits)

**Two-Way Binding:**

- Store → Editor: Initialize and external updates
- Editor → Store: User edits trigger store updates
- Avoid infinite update loops via change origin tracking

### Undo/Redo Coordination

**Editor-Level Undo:**

CodeMirror's built-in history tracks document edits:

- Local undo/redo within editing session
- Transaction-based history
- Merge similar changes (typing)

**Document-Level History:**

Post-MVP: Coordinate with backend version history:

- Editor undo/redo operates on local session
- Save points create backend versions
- Restore from backend loads new editor state

## Integration Architecture

### Component Structure

**Editor Component Hierarchy:**

```
MarkdownEditor (Svelte component)
  ├─ CodeMirror EditorView (initialized in onMount)
  ├─ Custom extensions array
  │   ├─ Extended markdown language mode
  │   ├─ Folding extension
  │   ├─ Syntax highlighting theme
  │   ├─ Keyboard shortcuts
  │   ├─ Auto-completion
  │   └─ Accessibility features
  └─ Event handlers (onChange, onSave)
```

**Component Props:**

- `value`: Initial markdown content (string)
- `onChange`: Callback for content changes (string) => void
- `onSave`: Callback for manual save (Ctrl/Cmd+S)
- `readOnly`: Boolean for read-only mode
- `autofocus`: Boolean to focus on mount

**Component State:**

- Editor view instance (CodeMirror)
- Current content (synced with store)
- Fold state (persisted to localStorage)

### Extension Loading

**Modular Extension Loading:**

Extensions loaded conditionally based on configuration:

- Base extensions: Always loaded
- Extended markdown: Always loaded (core feature)
- Folding: Configurable (default: enabled)
- Auto-completion: Configurable (default: enabled)
- Debugging extensions: Development only

**Extension Configuration:**

Use facets for runtime configuration:

- Syntax theme: Dark (default) or light
- Tab size: 2 or 4 spaces
- Line wrapping: Enabled (default) or disabled
- Accessibility mode: Enhanced screen reader support

### Theme Integration

**Theme Integration:**

Per [DESIGN_SYSTEM.md - Theme System](./DESIGN_SYSTEM.md#theme-system):

- Editor uses CSS custom properties from theme system
- Background: `var(--color-editor-background)`
- Text: `var(--color-editor-foreground)`
- Selection: `var(--color-editor-selection)`
- Active line: `var(--color-editor-line-active)`
- Cursor: `var(--color-editor-cursor)`
- Gutter: `var(--color-editor-gutter-background)` and `var(--color-editor-gutter-foreground)`
- Syntax colors: Use semantic syntax color tokens (see [DESIGN_SYSTEM.md - Syntax Highlighting Colors](./DESIGN_SYSTEM.md#semantic-color-tokens))

**Note on Theme Values:**

All editor and syntax highlighting colors are defined as semantic tokens in DESIGN_SYSTEM.md and automatically adapt to light and dark themes. The tokens ensure consistent contrast ratios (WCAG AA compliant) across both themes.

**Implementation:**

- Theme utility in `src/lib/utils/editor-theme.ts` reads CSS variables at runtime
- Editor theme updates automatically when app theme changes
- See `prose/debriefs/theme-unification-implementation.md` for details

## Testing Strategy

### Unit Tests

**Language Mode Tests:**

- Parse global frontmatter correctly
- Recognize SCOPE and QUILL keywords
- Distinguish metadata delimiters from horizontal rules
- Handle edge cases (no frontmatter, unclosed blocks)
- Validate scope name pattern matching
- Detect collisions and reserved names

**Folding Tests:**

- Identify foldable metadata block ranges
- Match opening/closing delimiters correctly
- Generate appropriate fold summaries
- Persist and restore fold state

**Highlighting Tests:**

- Apply correct token types
- Render expected colors
- Handle nested structures
- Performance with large documents

### Integration Tests

**Editor Component Tests:**

- Initialize with content from props
- Emit onChange events on user input
- Respond to external content updates
- Save on Ctrl/Cmd+S
- Maintain undo/redo history
- Preserve fold state across remounts

**Toolbar Integration:**

- Format commands modify editor content
- Editor state reflects formatting changes
- Cursor positioning after formatting
- Undo/redo includes toolbar changes

### Accessibility Tests

**Automated:**

- ARIA attribute presence and correctness
- Color contrast validation (axe-core)
- Keyboard navigation paths
- Focus indicator visibility

**Manual:**

- Screen reader announcements (NVDA, JAWS, VoiceOver)
- Keyboard-only workflow completion
- High contrast mode rendering
- Reduced motion preference

### Performance Tests

**Large Document Handling:**

- 10,000+ line documents
- Scrolling performance (60fps target)
- Syntax highlighting latency
- Memory usage monitoring

**Typing Responsiveness:**

- Input latency < 50ms
- No visible lag during fast typing
- Smooth cursor movement

## Implementation Phases

### Phase 1: Base Editor Setup

- Initialize CodeMirror 6 in Svelte component
- Configure base extensions (basic setup, line wrapping)
- Integrate with document store
- Implement onChange and onSave handlers

### Phase 2: Standard Markdown Support

- Configure standard markdown language mode
- Basic syntax highlighting (headings, lists, emphasis)
- Standard markdown folding (headings, code blocks)
- Toolbar integration for formatting commands

### Phase 3: Extended Markdown Language Mode

- Develop Lezer grammar for metadata blocks
- Implement horizontal rule disambiguation logic
- Add SCOPE and QUILL keyword recognition
- Parse YAML content within blocks
- Token generation for custom syntax

### Phase 4: Custom Syntax Highlighting

- Define highlight tags for metadata tokens
- Create theme with extended markdown colors
- Visual differentiation for metadata blocks
- Test color contrast compliance

### Phase 5: Metadata Block Folding

- Implement fold range detection for metadata
- Add fold gutter with indicators
- Generate fold summaries (first line preview)
- Persist fold state to localStorage
- Keyboard shortcuts for fold/unfold

### Phase 6: Auto-Completion

- SCOPE/QUILL name suggestions
- Common YAML field suggestions
- Markdown syntax suggestions
- Completion UI styling

### Phase 7: Mobile Optimization

- Touch target sizing
- Virtual keyboard handling
- Responsive toolbar
- Gesture support

### Phase 8: Accessibility & Polish

- ARIA annotations
- Screen reader testing and fixes
- Keyboard navigation verification
- Focus indicator validation
- High contrast mode support
- Reduced motion support

## Dependencies

### Core (Required)

Essential CodeMirror 6 packages for basic editor functionality:

- `@codemirror/state`: State management primitives (required for all CodeMirror functionality)
- `@codemirror/view`: View layer and DOM handling (required for rendering)
- `@codemirror/commands`: Common editing commands (undo/redo, indentation, etc.)
- `@codemirror/language`: Language support infrastructure (required for syntax highlighting)

### Language Support (Required)

Packages for markdown and extended syntax support:

- `@codemirror/lang-markdown`: Base markdown language mode (standard markdown highlighting)
- `@codemirror/lang-yaml`: YAML syntax support (for metadata blocks)
- `@lezer/markdown`: Markdown parser base (required for custom grammar)
- `@lezer/generator`: Parser generator (development dependency for building custom Lezer grammar)

### Feature Extensions (Required)

Additional functionality for complete editor experience:

- `@codemirror/autocomplete`: Auto-completion system (SCOPE/QUILL suggestions)
- `@codemirror/search`: Find and replace functionality (Ctrl/Cmd+F)

### Optional Extensions

Can be added later or omitted from MVP:

- `@codemirror/lint`: Linting infrastructure (future: YAML validation, scope name conflict detection)
- `@codemirror/legacy-modes`: Fallback mode support (only if custom Lezer grammar fails)
- `@uiw/codemirror-themes`: Theme inspiration reference (for custom theme development)

### Build Tools

Development and build dependencies:

- TypeScript for type safety
- Vite for bundling (already part of SvelteKit)

## Future Enhancements

### Post-MVP Features

**Advanced Folding:**

- Fold multiple blocks simultaneously
- Fold by scope name (all `sub_documents` blocks)
- Custom fold summaries with metadata preview
- Remember fold preferences per document

**Smart Editing:**

- Auto-close YAML blocks (insert closing `---`)
- Validate YAML syntax in metadata blocks
- Linting for scope name conflicts
- Quick fixes for common errors

**Collaboration:**

- Multiplayer cursors and selections
- Conflict resolution UI
- Change tracking decorations

**Templates:**

- Snippet library for common metadata patterns
- Quill template scaffolding
- Custom user snippets

**Enhanced Accessibility:**

- Voice commands integration
- Screen reader verbosity controls
- Customizable keyboard shortcuts

## References

### CodeMirror 6 Documentation

- [CodeMirror 6 System Guide](https://codemirror.net/docs/guide/)
- [Language Packages](https://codemirror.net/docs/ref/#language)
- [Lezer Parser System](https://lezer.codemirror.net/)
- [Writing a Language Package](https://codemirror.net/examples/lang-package/)
- [Decoration and Styling](https://codemirror.net/docs/ref/#view.Decoration)
- [Folding](https://codemirror.net/docs/ref/#language.foldService)

### Related Design Documents

- [prose/designs/quillmark/PARSE.md](../quillmark/PARSE.md): Extended markdown specification
- [prose/designs/frontend/DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md): Visual design tokens
- [prose/designs/frontend/STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md): State patterns
- [prose/designs/frontend/ACCESSIBILITY.md](./ACCESSIBILITY.md): Section 508 compliance

### External Resources

- [YAML Specification](https://yaml.org/spec/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

_Last Updated: October 29, 2025_
