# UX Improvements 2025 - Implementation Plan

## Overview

This plan outlines the implementation steps for UX improvements including a Document Info dialog, keyboard shortcuts removal, and minimal markdown toolbar redesign.

**Design Reference**: [UX_IMPROVEMENTS_2025.md](../designs/frontend/UX_IMPROVEMENTS_2025.md)

## Prerequisites

- Svelte 5 with runes
- shadcn-svelte component library with Dialog components
- lucide-svelte icons
- CodeMirror 6 editor
- Existing document store and metadata types

## Implementation Phases

### Phase 1: Document Info Dialog

**Objective**: Create a dialog displaying document metadata and statistics, accessible from More Actions menu

**Files to Create**:
- `src/lib/components/DocumentInfoDialog.svelte`

**Files to Modify**:
- `src/lib/components/TopMenu.svelte`
- `src/routes/+page.svelte`

**Implementation Steps**:

#### 1.1 Create DocumentInfoDialog Component

**Component Props**:
```typescript
interface DocumentInfoDialogProps {
  open: boolean;
  document: {
    name: string;
    created_at: string;
    updated_at: string;
  } | null;
  content: string;
  onOpenChange: (open: boolean) => void;
}
```

**Component Structure**:
```svelte
<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog';
  import { X } from 'lucide-svelte';
  
  // Props
  let { open, document, content, onOpenChange } = $props();
  
  // Calculate statistics
  let stats = $derived({
    characters: content.length,
    words: content.trim().split(/\s+/).filter(w => w.length > 0).length,
    lines: content.split('\n').length
  });
  
  // Format dates
  function formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleString();
  }
</script>

<Dialog.Root {open} onOpenChange={onOpenChange}>
  <Dialog.Content class="...custom positioning...">
    <!-- Dialog header, content sections -->
  </Dialog.Content>
</Dialog.Root>
```

**Styling Considerations**:
- Desktop: Position on right side, aligned with Preview pane
- Mobile (<1024px): Center on screen
- Use CSS media queries or Tailwind responsive classes

**Date Formatting**:
- Use `Intl.DateTimeFormat` for locale-aware formatting
- Example: `new Date(created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })`

#### 1.2 Integrate Dialog in TopMenu

**Add state for dialog**:
```typescript
let showDocumentInfo = $state(false);
```

**Update handleDocumentInfo handler**:
```typescript
function handleDocumentInfo() {
  showDocumentInfo = true;
}
```

**Pass props to DocumentInfoDialog**:
- Need to receive `document` metadata and `content` from parent
- TopMenu doesn't have access to content, so need to lift state up

#### 1.3 Lift State to +page.svelte

**Add to +page.svelte**:
```svelte
<script lang="ts">
  import DocumentInfoDialog from '$lib/components/DocumentInfoDialog.svelte';
  
  let showDocumentInfo = $state(false);
  let documentContent = $state('');
  
  // Pass to DocumentEditor to get content updates
  function handleContentUpdate(newContent: string) {
    documentContent = newContent;
  }
</script>

<TopMenu 
  onDocumentInfo={() => showDocumentInfo = true}
  ...other props
/>

<DocumentInfoDialog
  open={showDocumentInfo}
  document={documentStore.activeDocument}
  content={documentContent}
  onOpenChange={(open) => showDocumentInfo = open}
/>
```

**Update DocumentEditor to emit content**:
- Add callback prop `onContentUpdate`
- Call when content changes

**Testing**:
- Click "Document Info" in More Actions menu
- Verify dialog opens and displays correct information
- Test dismissal via X, Escape, and clicking outside
- Verify statistics calculate correctly
- Test on mobile and desktop viewports
- Test with screen reader

---

### Phase 2: Remove Keyboard Shortcuts Menu Item

**Objective**: Remove "Keyboard Shortcuts" from More Actions menu and related code

**Files to Modify**:
- `src/lib/components/TopMenu.svelte`

**Changes**:

1. **Remove menu item** (lines 164-172):
```svelte
<!-- REMOVE THIS -->
<DropdownMenuItem
  class="text-foreground/80 focus:bg-accent focus:text-foreground"
  onclick={handleKeyboardShortcuts}
>
  {#snippet children()}
    <Keyboard class="mr-2 h-4 w-4" />
    Keyboard Shortcuts
  {/snippet}
</DropdownMenuItem>
```

2. **Remove handler function** (lines 48-51):
```typescript
// REMOVE THIS
function handleKeyboardShortcuts() {
  // TODO: Open keyboard shortcuts dialog
  console.log('Keyboard shortcuts');
}
```

3. **Remove Keyboard icon import** (line 10):
```typescript
// REMOVE from imports if not used elsewhere
Keyboard
```

**Verification**:
- Check if `Keyboard` icon is used elsewhere
- If not used, remove from import statement
- Verify no console errors
- Verify menu renders correctly without the item

**Testing**:
- Open More Actions menu
- Verify "Keyboard Shortcuts" item is gone
- Verify remaining items display correctly
- Verify no console errors

---

### Phase 3: Update Toolbar Tooltips

**Objective**: Remove keyboard shortcut hints from toolbar button tooltips

**Files to Modify**:
- `src/lib/components/EditorToolbar.svelte`

**Changes**:

1. **Bold button** (line 34):
```svelte
title="Bold (Ctrl+B)"  →  title="Bold"
```

2. **Italic button** (line 46):
```svelte
title="Italic (Ctrl+I)"  →  title="Italic"
```

3. **Save button** (line 142):
```svelte
title="Save (Ctrl+S)"  →  title="Save"
```

**Testing**:
- Hover over Bold, Italic, and Save buttons
- Verify tooltips display without keyboard hints
- Verify buttons still function correctly
- CodeMirror shortcuts (Ctrl+B, Ctrl+I, Ctrl+S) still work

---

### Phase 4: Minimal Markdown Toolbar Redesign

**Objective**: Redesign markdown toolbar with minimal set of formatting buttons

**Files to Modify**:
- `src/lib/components/EditorToolbar.svelte`
- `src/lib/components/MarkdownEditor.svelte`

**Implementation Steps**:

#### 4.1 Add Frontmatter Toggle Button (Stub)

**In EditorToolbar.svelte**:

1. **Add ChevronDown icon import**:
```typescript
import { ChevronDown } from 'lucide-svelte';
```

2. **Add button as first element**:
```svelte
<Button
  variant="ghost"
  size="sm"
  class="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
  onclick={() => onFormat('toggleFrontmatter')}
  title="Toggle Frontmatter"
>
  {#snippet children()}
    <ChevronDown class="h-4 w-4" />
  {/snippet}
</Button>
```

**In MarkdownEditor.svelte**:

Add stub handler:
```typescript
function handleToggleFrontmatter() {
  console.log('Toggle frontmatter folding (not yet implemented)');
}

// Update handleFormat switch
case 'toggleFrontmatter':
  handleToggleFrontmatter();
  break;
```

#### 4.2 Reorder and Remove Buttons

**New button order** (in EditorToolbar.svelte):

1. Frontmatter Toggle
2. Separator
3. Bold
4. Italic
5. Strikethrough
6. Code (inline)
7. Link
8. Separator
9. Numbered List
10. Bullet List
11. (Right) Manual Save

**Remove**:
- Quote button
- Code Block button (replace with inline code)
- One Separator (consolidate)

#### 4.3 Convert Code Block to Inline Code

**In EditorToolbar.svelte**:

Update title attribute:
```svelte
<Button
  ...
  onclick={() => onFormat('inlineCode')}
  title="Inline Code"
>
```

**In MarkdownEditor.svelte**:

1. **Rename handler**:
```typescript
// OLD:
function handleCodeBlock() {
  insertAtCursor('\n```\ncode\n```\n');
}

// NEW:
function handleInlineCode() {
  applyFormatting('`');
}
```

2. **Update handleFormat switch**:
```typescript
case 'code':
  handleInlineCode();
  break;
// Remove 'quote' case
```

#### 4.4 Update Tooltips

Remove keyboard hints from all tooltips (already done in Phase 3 for Bold, Italic, Save)

**Remaining tooltips**:
- "Strikethrough" (already correct)
- "Inline Code" (updated in 4.3)
- "Hyperlink" (update from "Link")
- "Numbered List" (already correct)
- "Bullet List" (already correct)

**Testing**:
- Verify all 10 buttons display correctly
- Test each button's functionality
- Verify frontmatter toggle logs to console
- Verify inline code wraps selection with backticks
- Verify Quote and Code Block buttons removed
- Verify separators positioned correctly
- Verify layout is clean and balanced

---

## Implementation Order

1. **Phase 2: Remove Keyboard Shortcuts Menu Item** (lowest risk, quick win)
2. **Phase 3: Update Toolbar Tooltips** (low risk, documentation cleanup)
3. **Phase 4: Minimal Markdown Toolbar Redesign** (medium risk, requires testing)
4. **Phase 1: Document Info Dialog** (higher complexity, new component)

**Rationale**: Start with simple removals and updates to build confidence, then tackle more complex toolbar redesign, and finish with the new dialog feature.

## Testing Strategy

### Manual Testing Checklist

**Document Info Dialog**:
- [ ] Opens from More Actions menu
- [ ] Displays correct document name
- [ ] Formats created/modified dates correctly
- [ ] Calculates statistics accurately (characters, words, lines)
- [ ] Dismisses via X button
- [ ] Dismisses via Escape key
- [ ] Dismisses by clicking outside (on Preview pane)
- [ ] Focus returns to trigger on close
- [ ] Positions correctly on desktop (right side)
- [ ] Centers correctly on mobile
- [ ] Accessible via keyboard
- [ ] Announced correctly by screen reader

**Keyboard Shortcuts Removal**:
- [ ] "Keyboard Shortcuts" menu item removed
- [ ] No console errors
- [ ] Remaining menu items display correctly
- [ ] CodeMirror shortcuts still work (Ctrl+B, Ctrl+I, Ctrl+S)

**Minimal Toolbar**:
- [ ] Frontmatter toggle button appears and logs to console
- [ ] Bold button works
- [ ] Italic button works
- [ ] Strikethrough button works
- [ ] Inline code button wraps with backticks
- [ ] Hyperlink button works
- [ ] Numbered list button works
- [ ] Bullet list button works
- [ ] Quote button removed
- [ ] Code block button removed
- [ ] Separators positioned correctly (2 total)
- [ ] Manual save button on right side
- [ ] All tooltips display without keyboard hints

### Browser Testing

Test on:
- Chrome/Edge (primary)
- Firefox
- Safari (if available)

### Viewport Testing

- Desktop (>1024px)
- Tablet (768px - 1023px)
- Mobile (<768px)

### Accessibility Testing

- Keyboard navigation (Tab, Shift+Tab, Enter, Escape)
- Screen reader (NVDA, JAWS, or VoiceOver)
- High contrast mode
- Focus indicators visible

## Success Criteria

- [ ] Document Info dialog displays and functions correctly
- [ ] Keyboard Shortcuts menu item removed
- [ ] Toolbar tooltips updated (no keyboard hints)
- [ ] Markdown toolbar simplified to 10 buttons (plus Save)
- [ ] All existing functionality preserved
- [ ] No console errors or warnings
- [ ] Passes accessibility testing
- [ ] Design specifications match implementation

## Rollback Plan

If issues arise:
1. Revert specific commits using git
2. Phases are independent and can be reverted separately
3. No database migrations or breaking changes

## References

- [UX_IMPROVEMENTS_2025.md](../designs/frontend/UX_IMPROVEMENTS_2025.md) - Design specifications
- [UI_COMPONENTS.md](../designs/frontend/UI_COMPONENTS.md) - Component patterns
- [MARKDOWN_EDITOR.md](../designs/frontend/MARKDOWN_EDITOR.md) - Editor architecture
- [DESIGN_SYSTEM.md](../designs/frontend/DESIGN_SYSTEM.md) - Visual design tokens
- [ACCESSIBILITY.md](../designs/frontend/ACCESSIBILITY.md) - Accessibility requirements
