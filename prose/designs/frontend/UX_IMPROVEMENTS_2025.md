# UX Improvements 2025

## Overview

This document specifies UX improvements to enhance usability, accessibility, and streamline the user interface. These changes focus on providing better document information visibility, removing unnecessary complexity, and simplifying the markdown toolbar.

**Related Documents**:
- [UI_COMPONENTS.md](./UI_COMPONENTS.md) - Component specifications
- [MARKDOWN_EDITOR.md](./MARKDOWN_EDITOR.md) - Editor design
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Visual design tokens
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Accessibility requirements

## Changes Summary

### 1. Document Info Dialog

A new dialog that displays document metadata and statistics, accessible from the More Actions menu.

### 2. Keyboard Shortcuts Removal

Remove custom keyboard shortcut logic to rely on semantic HTML, default OS accessibility features, and CodeMirror's built-in shortcuts.

### 3. Minimal Markdown Toolbar

Simplify the markdown toolbar to focus on essential formatting options.

---

## 1. Document Info Dialog

### Purpose

Provide users with quick access to document metadata and statistics without leaving the editor context.

### UI Specification

**Trigger**: "Document Info" menu item in More Actions (meatball menu)

**Dialog Type**: shadcn-svelte Dialog component

**Positioning**: 
- Overlays the Preview pane only (right side of screen)
- Does not obstruct the editor pane
- On mobile/tablet (< 1024px), centers on screen

**Behavior**:
- **Persistent**: Remains visible until explicitly dismissed
- **Dismissible**: 
  - Click X button in dialog header
  - Click on Preview pane background (outside dialog)
  - Press Escape key
- **Non-modal on desktop**: User can continue editing while dialog is visible
- **Modal on mobile**: Dialog blocks interaction with editor

**Content**:

```
┌─────────────────────────────────────┐
│  Document Info                   ✕  │
├─────────────────────────────────────┤
│                                     │
│  Document Name                      │
│  [Current document name]            │
│                                     │
│  Created                            │
│  [ISO date, human-readable]         │
│                                     │
│  Modified                           │
│  [ISO date, human-readable]         │
│                                     │
│  Statistics                         │
│  • Characters: [count]              │
│  • Words: [count]                   │
│  • Lines: [count]                   │
│                                     │
└─────────────────────────────────────┘
```

### Data Sources

**From DocumentMetadata** (see `src/lib/services/documents/types.ts`):
- `name` - Document name
- `created_at` - ISO 8601 timestamp
- `updated_at` - ISO 8601 timestamp

**From Editor Content** (calculated in real-time):
- **Characters**: Total character count including whitespace
- **Words**: Count of word-separated tokens (split by whitespace)
- **Lines**: Count of newline characters + 1

### Styling

**Dialog**:
- Width: `max-w-md` (448px)
- Background: `bg-background`
- Border: `border border-border`
- Padding: `p-6`
- Shadow: `shadow-lg`

**Typography**:
- Title: `text-lg font-semibold`
- Section labels: `text-sm font-medium text-muted-foreground`
- Values: `text-base text-foreground`
- Statistics list: `text-sm`

**Layout**:
- Vertical spacing between sections: `gap-4`
- Label-value pairing: `gap-1`

### Accessibility

- Dialog must have `role="dialog"` and `aria-labelledby` pointing to title
- Focus trap when dialog is open
- Escape key dismisses dialog
- Focus returns to trigger element when closed
- Statistics presented as list with `role="list"`

### Implementation Notes

**Component Structure**:
- Use shadcn-svelte Dialog components (Root, Content, Header, Title)
- Bind dialog open state to component prop
- Include custom positioning classes for desktop layout

**Custom Positioning** (Desktop only):
- Override default center positioning
- Position on right side of viewport
- Align with Preview pane boundaries
- Use CSS custom properties or Tailwind positioning

**Date Formatting**:
- Use JavaScript `Intl.DateTimeFormat` for locale-aware dates
- Format: Medium date style with short time

**Statistics Calculation**:
- Calculate on dialog open based on current editor content
- Characters: Total character count including whitespace
- Words: Split by whitespace, filter empty strings
- Lines: Count newline characters + 1

---

## 2. Keyboard Shortcuts Removal

### Rationale

Modern web applications should leverage:
1. **Semantic HTML** - Provides native keyboard navigation
2. **OS Accessibility Features** - Screen readers, keyboard navigation built into OS
3. **CodeMirror Built-in Shortcuts** - Editor already handles Ctrl+B, Ctrl+I, Ctrl+S, etc.

Custom keyboard shortcut implementations add complexity and can conflict with OS-level shortcuts or assistive technologies.

### Changes Required

#### Remove from TopMenu.svelte

**Menu Item to Remove**:
- "Keyboard Shortcuts" dropdown menu item with Keyboard icon

**Handler to Remove**:
- `handleKeyboardShortcuts()` function (currently logs to console)

**Icon Import to Remove** (if unused elsewhere):
- Keyboard icon from lucide-svelte

#### Preserve CodeMirror Shortcuts

**Keep in MarkdownEditor.svelte**:
- CodeMirror's `defaultKeymap` (undo/redo, selection, navigation)
- CodeMirror's `historyKeymap` (undo/redo history)
- Custom keymaps for:
  - `Mod-b` - Bold
  - `Mod-i` - Italic  
  - `Mod-s` - Save

These are essential editor functions and are scoped to the editor component.

#### Documentation Updates

**Update Tooltip Text**:
- Change `"Bold (Ctrl+B)"` to `"Bold"` in EditorToolbar.svelte
- Change `"Italic (Ctrl+I)"` to `"Italic"` in EditorToolbar.svelte
- Change `"Save (Ctrl+S)"` to `"Save"` in EditorToolbar.svelte
- Tooltips will still appear on hover but won't advertise shortcuts

**Remove from Comments**:
- Search for "Ctrl+" and "keyboard" in comments
- Update or remove references to keyboard shortcuts in documentation

### Accessibility Benefits

- Reduces confusion for screen reader users
- Prevents conflicts with OS-level shortcuts
- Allows users to rely on familiar OS navigation patterns
- Simplifies codebase and reduces maintenance burden

---

## 3. Minimal Markdown Toolbar

### Rationale

Simplify the markdown toolbar to focus on the most commonly used formatting options. Remove less-used features to reduce visual clutter and cognitive load.

### Current Toolbar (EditorToolbar.svelte)

**Current buttons**:
1. Bold
2. Italic
3. Strikethrough
4. Separator
5. Code (block)
6. Quote (blockquote)
7. Separator
8. Bullet List
9. Numbered List
10. Separator
11. Link
12. (Right side) Manual Save

### New Minimal Toolbar

**Desired buttons**:
1. Toggle Frontmatter Folding (stub - not yet functional)
2. Separator
3. Bold
4. Italic
5. Strikethrough
6. Code (inline code with backticks)
7. Hyperlink
8. Separator
9. Numbered List (ordered list: 1. 2. 3.)
10. Bullet List (unordered list: - • *)
11. (Right side) Manual Save (keep existing)

### Button Specifications

#### 1. Toggle Frontmatter Folding (Stub)

**Icon**: `ChevronDown` from lucide-svelte (rotates when folded/unfolded)

**Behavior** (stub implementation):
- Click handler: `console.log('Toggle frontmatter folding')`
- Visual state: No active state initially
- Future: Will integrate with CodeMirror folding extension

**Tooltip**: "Toggle Frontmatter"

**Positioning**: First button, left side

#### 2. Bold

**Keep existing implementation**

**Changes**: 
- Remove tooltip keyboard hint: `"Bold (Ctrl+B)"` → `"Bold"`

#### 3. Italic

**Keep existing implementation**

**Changes**: 
- Remove tooltip keyboard hint: `"Italic (Ctrl+I)"` → `"Italic"`

#### 4. Strikethrough

**Keep existing implementation**

**Tooltip**: "Strikethrough"

#### 5. Code (Inline)

**Change behavior from block to inline**

**Previous behavior**: Inserted code block with triple backticks
**New behavior**: Wraps selection with single backticks for inline code

**Icon**: Keep `Code` icon from lucide-svelte

**Tooltip**: "Inline Code"

#### 6. Hyperlink

**Keep existing implementation**

**Tooltip**: "Hyperlink"

#### 7. Numbered List

**Keep existing implementation**

**Tooltip**: "Numbered List"

**Note**: Creates ordered lists (1. 2. 3.)

#### 8. Bullet List

**Keep existing implementation**

**Tooltip**: "Bullet List"

**Note**: Creates unordered lists (- • *)

#### Remove:

- **Quote** button - Users can type `>` manually
- **Code Block** - Replaced with inline code

### Layout

**Structure**:
```
[Frontmatter Toggle] | [Bold] [Italic] [Strikethrough] [Code] [Link] | [1.] [•] [Save*]
                     ↑ Separator                                      ↑ Separator  ↑ Right aligned
```

**Spacing**: Keep existing gap and padding from current toolbar

**Visual consistency**: Maintain existing button styles and hover states

### Implementation Changes

**EditorToolbar.svelte**:
1. Add ChevronDown icon import
2. Add frontmatter toggle button (stub)
3. Reorder buttons to match specification
4. Remove Quote button
5. Change Code button from block to inline
6. Update tooltips to remove keyboard hints
7. Update separator placement

**MarkdownEditor.svelte**:
1. Rename `handleCodeBlock` to `handleInlineCode`
2. Update implementation to use backticks for inline code
3. Update `handleFormat` switch statement to match new button names
4. Keep existing bold, italic, strikethrough, link, and list handlers

### Future Enhancements

**Frontmatter Folding**:
- Will integrate with CodeMirror's `foldGutter` extension
- Detect YAML frontmatter blocks (`---` at start of document)
- Toggle fold state on frontmatter region
- Update button visual state (rotate chevron)

**Code Block**:
- May be re-added as a separate feature later
- Could be part of a "More Formatting" dropdown
- Not in scope for minimal toolbar

---

## Migration Notes

### Breaking Changes

None. All changes are additive or simplifications.

### User Impact

**Positive**:
- Clearer document information access
- Simpler, less cluttered toolbar
- Fewer conflicting keyboard shortcuts
- Better accessibility for keyboard and screen reader users

**Neutral**:
- Users who relied on Quote and Code Block buttons must use markdown syntax directly
- Users who memorized keyboard shortcuts from tooltips will need to discover CodeMirror's built-in shortcuts

### Training/Documentation

**Update user documentation** (if exists):
- Document Info dialog usage
- Markdown syntax for quote (`>`) and code blocks (`` ``` ``)
- CodeMirror keyboard shortcuts (link to official docs)

---

## Testing Requirements

### Document Info Dialog

- [ ] Dialog opens when "Document Info" is clicked in More Actions menu
- [ ] Dialog displays correct document name
- [ ] Created and Modified dates format correctly
- [ ] Statistics (characters, words, lines) calculate accurately
- [ ] Dialog can be dismissed via X button
- [ ] Dialog can be dismissed by clicking Preview pane
- [ ] Dialog can be dismissed with Escape key
- [ ] Focus returns to trigger element on close
- [ ] Dialog positions correctly on desktop (right side, over Preview)
- [ ] Dialog centers correctly on mobile/tablet
- [ ] Screen reader announces dialog correctly

### Keyboard Shortcuts Removal

- [ ] "Keyboard Shortcuts" menu item removed from More Actions
- [ ] Tooltip hints removed from toolbar buttons
- [ ] CodeMirror shortcuts still work (Ctrl+B, Ctrl+I, Ctrl+S)
- [ ] No console errors or warnings
- [ ] No unused icon imports

### Minimal Markdown Toolbar

- [ ] Frontmatter toggle button appears (stub logs to console)
- [ ] Bold, Italic, Strikethrough buttons work correctly
- [ ] Code button applies inline code (backticks)
- [ ] Hyperlink button works correctly
- [ ] Numbered List button works correctly
- [ ] Bullet List button works correctly
- [ ] Quote and Code Block buttons removed
- [ ] Separators positioned correctly
- [ ] Manual Save button remains on right side
- [ ] Toolbar layout looks clean and balanced

---

## References

- **shadcn-svelte Dialog**: https://shadcn-svelte.com/docs/components/dialog
- **bits-ui Dialog**: https://bits-ui.com/docs/components/dialog
- **CodeMirror Keymaps**: https://codemirror.net/docs/ref/#commands
- **WCAG 2.1 Dialog Pattern**: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
