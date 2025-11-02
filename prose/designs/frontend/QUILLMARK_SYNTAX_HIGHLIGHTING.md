# QuillMark Syntax Highlighting Design

## Overview

This document specifies a **robust, maintainable approach** to syntax highlighting for QuillMark's extended markdown syntax in CodeMirror 6. The design prioritizes simplicity and reliability over complex custom grammar generation, while still providing clear visual differentiation for QuillMark's special constructs.

> **Related Documents:**
> - [PARSE.md](../quillmark/PARSE.md) - QuillMark syntax specification
> - [MARKDOWN_EDITOR.md](./MARKDOWN_EDITOR.md) - Overall editor design

## Problem Statement

QuillMark extends standard markdown with:
- YAML frontmatter blocks (delimited by `---`)
- Inline metadata blocks with `SCOPE` and `QUILL` keywords
- Horizontal rule disambiguation (blank lines above and below)
- Scoped body content between metadata blocks

The existing MARKDOWN_EDITOR.md design proposes a custom Lezer grammar approach, but this has proven **complex, fragile, and difficult to maintain**. We need a simpler, more robust solution.

## Design Principles

1. **Leverage Existing Tools**: Use CodeMirror 6's built-in capabilities and existing language modes
2. **Incremental Enhancement**: Build on top of standard markdown mode rather than replacing it
3. **Pattern-Based Detection**: Use simple pattern matching for QuillMark constructs
4. **Maintainability**: Prefer simple, understandable code over complex parsers
5. **Graceful Degradation**: If highlighting fails, standard markdown still works

## Approach: Decoration-Based Highlighting

Instead of creating a custom Lezer grammar, we use **CodeMirror decorations** to add syntax highlighting on top of the standard markdown mode.

### Architecture

```
Standard Markdown Mode (base layer)
    ↓
QuillMark Decorator Plugin (enhancement layer)
    ↓
Custom Highlighting Theme (visual layer)
```

### How It Works

1. **Base Parsing**: Standard `@codemirror/lang-markdown` handles all markdown syntax
2. **Pattern Detection**: A ViewPlugin scans the document for QuillMark patterns
3. **Decoration Application**: Detected patterns are decorated with custom CSS classes
4. **Theme Styling**: Custom theme applies colors to the decoration classes

## QuillMark Pattern Detection

### Metadata Block Detection

A metadata block is identified by:
- Line starts with `---`
- NOT a horizontal rule (no blank lines both above and below)
- Contains YAML-like content or SCOPE/QUILL keywords

**Detection Algorithm:**

```typescript
function isMetadataDelimiter(line: number, doc: Text): boolean {
    const lineText = doc.line(line).text;
    if (!lineText.trim().startsWith('---')) return false;
    
    // Check for horizontal rule (blank lines above AND below)
    const prevLine = line > 1 ? doc.line(line - 1).text : '';
    const nextLine = line < doc.lines ? doc.line(line + 1).text : '';
    
    const hasBlankAbove = prevLine.trim() === '';
    const hasBlankBelow = nextLine.trim() === '';
    
    // If blank lines both above and below, it's an HR, not metadata
    return !(hasBlankAbove && hasBlankBelow);
}
```

### SCOPE/QUILL Keyword Detection

Within metadata blocks, detect special keywords:

**Pattern:** `SCOPE: scope_name` or `QUILL: quill_name`

**Detection:**

```typescript
function findScopeQuillKeywords(from: number, to: number, doc: Text): Range[] {
    const text = doc.sliceString(from, to);
    const regex = /^(SCOPE|QUILL):\s*([a-z_][a-z0-9_]*)/gm;
    const ranges = [];
    
    for (const match of text.matchAll(regex)) {
        ranges.push({
            from: from + match.index,
            to: from + match.index + match[0].length,
            keyword: match[1],
            value: match[2]
        });
    }
    
    return ranges;
}
```

### YAML Content Detection

Within metadata blocks, detect YAML key-value pairs:

**Pattern:** `key: value`

For simplicity, we detect common patterns without full YAML parsing:
- Property names (keys before `:`)
- String values (after `:`)
- Numbers, booleans, dates (basic types)

## Decoration Strategy

### Decoration Types

CodeMirror decorations are applied to text ranges with CSS classes:

**Metadata Structure:**
- `.cm-quillmark-delimiter`: `---` markers
- `.cm-quillmark-block`: Background for entire metadata blocks

**Keywords:**
- `.cm-quillmark-scope-keyword`: `SCOPE` keyword
- `.cm-quillmark-quill-keyword`: `QUILL` keyword
- `.cm-quillmark-scope-name`: Scope/quill name values

**YAML Content:**
- `.cm-quillmark-yaml-key`: Property names
- `.cm-quillmark-yaml-value`: Values
- `.cm-quillmark-yaml-string`: String values
- `.cm-quillmark-yaml-number`: Numeric values
- `.cm-quillmark-yaml-bool`: Boolean values

### ViewPlugin Implementation

```typescript
const quillmarkDecorator = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;
        
        constructor(view: EditorView) {
            this.decorations = this.computeDecorations(view);
        }
        
        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = this.computeDecorations(update.view);
            }
        }
        
        computeDecorations(view: EditorView): DecorationSet {
            const builder = new RangeSetBuilder<Decoration>();
            
            // Scan visible viewport only for performance
            for (let { from, to } of view.visibleRanges) {
                this.decorateRange(builder, from, to, view.state.doc);
            }
            
            return builder.finish();
        }
        
        decorateRange(builder, from, to, doc) {
            // 1. Find metadata blocks
            // 2. Decorate delimiters
            // 3. Decorate SCOPE/QUILL keywords
            // 4. Decorate YAML content
        }
    },
    { decorations: v => v.decorations }
);
```

## Styling Theme

### Color Palette

Following [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) theme tokens:

**Metadata Delimiters:**
- Color: `var(--color-muted-foreground)` (subtle gray)
- Font weight: normal

**SCOPE/QUILL Keywords:**
- Color: `#355e93` (USAF blue brand color)
- Font weight: 600 (semi-bold)

**Scope/Quill Names:**
- Color: `#06b6d4` (cyan - high contrast)
- Font weight: 500 (medium)

**YAML Keys:**
- Color: `var(--color-foreground)` (primary text)
- Font style: normal

**YAML Values:**
- Strings: `#22c55e` (green)
- Numbers: `#f59e0b` (amber)
- Booleans: `#8b5cf6` (purple)

**Metadata Block Background:**
- Light theme: `rgba(53, 94, 147, 0.03)` (very subtle blue tint)
- Dark theme: `rgba(53, 94, 147, 0.08)` (slightly more visible blue tint)
- Left border: `2px solid #355e93` (USAF blue accent)

### Theme Definition

```typescript
const quillmarkTheme = EditorView.theme({
    '.cm-quillmark-delimiter': {
        color: 'var(--color-muted-foreground)',
    },
    '.cm-quillmark-block': {
        backgroundColor: 'rgba(53, 94, 147, 0.05)',
        borderLeft: '2px solid #355e93',
        paddingLeft: '12px',
        marginLeft: '-14px',
    },
    '.cm-quillmark-scope-keyword, .cm-quillmark-quill-keyword': {
        color: '#355e93',
        fontWeight: '600',
    },
    '.cm-quillmark-scope-name': {
        color: '#06b6d4',
        fontWeight: '500',
    },
    '.cm-quillmark-yaml-key': {
        color: 'var(--color-foreground)',
    },
    '.cm-quillmark-yaml-string': {
        color: '#22c55e',
    },
    '.cm-quillmark-yaml-number': {
        color: '#f59e0b',
    },
    '.cm-quillmark-yaml-bool': {
        color: '#8b5cf6',
    },
}, { dark: document.documentElement.classList.contains('dark') });
```

## Code Folding Support

### Folding Strategy

Use CodeMirror's `foldService` to detect foldable metadata blocks:

```typescript
const quillmarkFolding = foldService.of((state, from, to) => {
    const doc = state.doc;
    const line = doc.lineAt(from);
    
    // Check if this line is a metadata delimiter
    if (!isMetadataDelimiter(line.number, doc)) return null;
    
    // Find matching closing delimiter
    const closingLine = findClosingDelimiter(line.number, doc);
    if (!closingLine) return null;
    
    // Return fold range
    return {
        from: line.to,
        to: doc.line(closingLine).from
    };
});
```

### Fold Indicators

Use CodeMirror's built-in folding gutter:

```typescript
import { foldGutter } from '@codemirror/language';

const extensions = [
    // ... other extensions
    foldGutter({
        markerDOM: (open) => {
            const icon = document.createElement('span');
            icon.className = open ? 'fold-icon-open' : 'fold-icon-closed';
            icon.textContent = open ? '▼' : '▶';
            return icon;
        }
    }),
    quillmarkFolding
];
```

## Auto-Completion Support

### SCOPE Name Completion

When user types `SCOPE: `, suggest existing scope names:

```typescript
const quillmarkCompletion = autocompletion({
    override: [
        (context) => {
            const line = context.state.doc.lineAt(context.pos);
            const before = line.text.slice(0, context.pos - line.from);
            
            // Check if we're after "SCOPE: "
            if (before.match(/SCOPE:\s*$/)) {
                // Extract existing scope names from document
                const scopes = extractScopeNames(context.state.doc);
                
                return {
                    from: context.pos,
                    options: scopes.map(name => ({
                        label: name,
                        type: 'keyword',
                        info: 'Existing scope name'
                    }))
                };
            }
            
            // Similar for QUILL: with available quill templates
            if (before.match(/QUILL:\s*$/)) {
                const quills = getAvailableQuills();
                return {
                    from: context.pos,
                    options: quills.map(q => ({
                        label: q.name,
                        type: 'keyword',
                        info: q.description
                    }))
                };
            }
            
            return null;
        }
    ]
});
```

## Performance Considerations

### Viewport-Based Decoration

Only decorate visible content:
- ViewPlugin only processes `view.visibleRanges`
- Large documents (1000+ lines) remain performant
- Scrolling triggers incremental updates

### Debounced Updates

For typing performance:
- Decorations update on `docChanged` event
- Natural debouncing through CodeMirror's update cycle
- No manual debouncing needed

### Caching Strategy

Cache metadata block positions:
- Recompute only on document changes
- Store block boundaries in StateField
- Decorations reference cached positions

## Testing Strategy

### Unit Tests

**Pattern Detection:**
- Correctly identifies `---` as metadata delimiter vs HR
- Detects SCOPE and QUILL keywords
- Extracts scope/quill names
- Handles edge cases (no frontmatter, unclosed blocks)

**Decoration Application:**
- Applies correct CSS classes to ranges
- Handles overlapping ranges
- Updates on document changes

**Folding:**
- Finds matching delimiter pairs
- Creates correct fold ranges
- Handles unclosed blocks gracefully

### Integration Tests

**Editor Component:**
- Decorations appear on mount
- Updates when content changes
- Theme changes update colors
- Folding works correctly

**Visual Tests:**
- Screenshot comparison for highlighted code
- Verify colors in light and dark themes
- Check accessibility contrast ratios

## Migration from Current Design

### Deprecate Lezer Grammar Approach

The MARKDOWN_EDITOR.md design proposed custom Lezer grammar. This approach is **deprecated** in favor of decoration-based highlighting for:

**Reasons:**
1. **Complexity**: Lezer grammars require specialized knowledge and tooling
2. **Fragility**: Custom grammars break easily with syntax edge cases
3. **Maintenance**: Hard to debug and modify
4. **Build overhead**: Requires grammar compilation step

**Benefits of New Approach:**
1. **Simplicity**: Pattern matching with regular expressions
2. **Robustness**: Falls back to standard markdown gracefully
3. **Maintainability**: Easy to understand and modify
4. **No build step**: Pure TypeScript, no grammar compilation

### Update MARKDOWN_EDITOR.md

The MARKDOWN_EDITOR.md document should be updated to:
1. Remove Lezer grammar sections (lines 125-180)
2. Reference this document for syntax highlighting
3. Keep other sections (folding, shortcuts, accessibility) that remain valid

## Dependencies

### Required Packages (Already Installed)

- `@codemirror/state`: State management and decorations
- `@codemirror/view`: ViewPlugin and decorations
- `@codemirror/lang-markdown`: Base markdown mode
- `@codemirror/language`: Folding service
- `@codemirror/autocomplete`: Auto-completion support

### No New Dependencies

This approach requires **no additional packages** beyond what's already installed.

## Implementation Phases

### Phase 1: Core Decoration Plugin (MVP)

- Implement metadata block detection
- Apply basic decorations (delimiters, blocks)
- Add SCOPE/QUILL keyword highlighting
- Basic theme styling

### Phase 2: Enhanced Styling

- YAML content detection (keys, values)
- Type-specific value coloring (strings, numbers, booleans)
- Metadata block background and border
- Light/dark theme support

### Phase 3: Folding Support

- Implement fold service
- Add fold gutter
- Fold range detection for metadata blocks
- Keyboard shortcuts for folding

### Phase 4: Auto-Completion

- SCOPE name suggestions
- QUILL template suggestions
- Completion UI integration
- Documentation hints

## Future Enhancements

### Post-MVP Features

**Enhanced Folding:**
- Fold summaries (show first line when collapsed)
- Fold all metadata blocks at once
- Remember fold state per document

## References

- [CodeMirror 6 Decorations Guide](https://codemirror.net/docs/guide/#decorating-the-document)
- [ViewPlugin Documentation](https://codemirror.net/docs/ref/#view.ViewPlugin)
- [Fold Service Documentation](https://codemirror.net/docs/ref/#language.foldService)
- [QuillMark Syntax Specification](../quillmark/PARSE.md)
- [Editor Theme System](./DESIGN_SYSTEM.md)

---

_Document Status: Final Design - Ready for Implementation_
_Last Updated: 2025-11-02_
