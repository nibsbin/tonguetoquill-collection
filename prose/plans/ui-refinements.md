# UI Refinements Implementation Plan

## Overview

This plan outlines the implementation steps for UI refinements including More Actions menu updates, auto-save configuration changes, line numbers toggle integration, separator improvements, and document list abstraction.

**Design Reference**: [UI_REFINEMENTS.md](../designs/frontend/UI_REFINEMENTS.md)

## Prerequisites

- Svelte 5 with runes
- shadcn-svelte component library
- lucide-svelte icons
- Existing auto-save infrastructure
- CodeMirror 6 editor with line numbers support

## Implementation Phases

### Phase 1: More Actions Menu Enhancement

**Objective**: Add Import, Share, and Document Info items with proper grouping

**Files to Modify**:
- `src/lib/components/TopMenu.svelte`

**Changes**:

1. Add new handler functions:
   - `handleImport()` - Opens file picker (stub: console.log for now)
   - `handleShare()` - Opens share dialog (stub: console.log for now)
   - `handleDocumentInfo()` - Opens document info dialog (stub: console.log for now)

2. Add new icons to imports:
   - `Share2` (for Share menu item)

3. Update menu structure in DropdownMenuContent:
   ```
   Group 1: Document Actions
   - Import (Upload icon)
   - Share (Share2 icon)
   
   Separator
   
   Group 2: Info & Help
   - Document Info (FileText icon)
   - Keyboard Shortcuts (Keyboard icon)
   
   Separator
   
   Group 3: Legal & About
   - About Us (Info icon + ExternalLink)
   - Terms of Use (FileText icon + ExternalLink)
   - Privacy Policy (Shield icon + ExternalLink)
   ```

4. Maintain existing styling:
   - `text-foreground/80 focus:bg-accent focus:text-foreground`
   - Icon size: `h-4 w-4`
   - External link icon: `ml-auto h-3 w-3`

**Testing**:
- Verify menu items appear in correct order
- Verify separators display between groups
- Verify icons display correctly
- Verify hover states work
- Verify stub handlers log to console
- Verify external links open in new tabs

**Validation**:
- Take screenshot of More Actions menu in expanded state
- Verify grouping matches specification

---

### Phase 2: Auto-Save Debounce Update

**Objective**: Change auto-save debounce from 7 seconds to 4 seconds and consolidate specification

**Files to Modify**:
- `src/lib/utils/auto-save.svelte.ts`
- `prose/designs/frontend/DESIGN_SYSTEM.md` (already updated)

**Changes**:

1. Update AutoSave class constructor default:
   ```typescript
   constructor(debounceMs: number = 4000) {  // Changed from 7000
     this.saveDebounceMs = debounceMs;
   }
   ```

2. Add JSDoc comment documenting the 4-second default:
   ```typescript
   /**
    * AutoSave class to manage document saving with debounce
    * 
    * @param debounceMs - Debounce delay in milliseconds (default: 4000ms)
    *                     See DESIGN_SYSTEM.md Auto-Save Behavior for rationale
    */
   ```

**Testing**:
- Enable auto-save in settings
- Make changes to a document
- Verify save triggers 4 seconds after last keystroke
- Verify save status indicator shows "Saving..." then "Saved"
- Verify multiple rapid edits reset the 4-second timer

**Validation**:
- Time the auto-save delay with a stopwatch
- Verify it's approximately 4 seconds (±200ms tolerance)

---

### Phase 3: Line Numbers Toggle Integration

**Objective**: Make line numbers toggle in Settings apply to the markdown editor

**Files to Modify**:
- `src/lib/components/DocumentEditor.svelte`

**Changes**:

1. Import line numbers setting from localStorage on mount:
   ```typescript
   let showLineNumbers = $state(true);
   
   onMount(() => {
     const savedLineNumbers = localStorage.getItem('line-numbers');
     if (savedLineNumbers !== null) {
       showLineNumbers = savedLineNumbers === 'true';
     }
   });
   ```

2. Listen for storage events to react to settings changes:
   ```typescript
   function handleStorageChange(e: StorageEvent) {
     if (e.key === 'line-numbers' && e.newValue !== null) {
       showLineNumbers = e.newValue === 'true';
     }
   }
   
   onMount(() => {
     window.addEventListener('storage', handleStorageChange);
     return () => {
       window.removeEventListener('storage', handleStorageChange);
     };
   });
   ```

3. Pass showLineNumbers prop to MarkdownEditor:
   ```svelte
   <MarkdownEditor
     value={content}
     onChange={handleContentChange}
     onSave={handleManualSave}
     {showLineNumbers}
   />
   ```

**Note**: The MarkdownEditor component already supports the `showLineNumbers` prop and will automatically recreate the editor when the value changes.

**Testing**:
- Open Settings popover
- Toggle line numbers ON
- Verify line numbers appear in editor
- Toggle line numbers OFF
- Verify line numbers disappear from editor
- Refresh page and verify setting persists
- Verify editor content is preserved when toggling

**Validation**:
- Take screenshot with line numbers ON
- Take screenshot with line numbers OFF
- Verify no layout shift or content loss

---

### Phase 4: Separator Layout Fix

**Objective**: Ensure separators don't shift layout and act as bottom borders

**Files to Modify**:
- `src/lib/components/Sidebar.svelte`

**Analysis**:
The current separator implementation uses the shadcn-svelte Separator component, which is correct. Need to verify there's no extra margin/padding causing layout shift.

**Changes**:

1. Review separator usage in Sidebar:
   - After logo (line 171)
   - After "New File" button (lines 186, 190)
   - Before footer section (line 245)

2. Ensure no extra spacing around separators:
   ```svelte
   <Separator class="bg-border" />
   <!-- No margin classes, no wrapper divs with padding -->
   ```

3. If layout shift persists, consider using border-bottom on parent elements instead:
   ```svelte
   <div class="border-b border-border">
     <!-- Content -->
   </div>
   ```

**Testing**:
- Expand/collapse sidebar
- Verify separator position remains stable
- Verify no layout jump when separator renders
- Measure heights before/after separator in DevTools
- Verify separator is exactly 1px tall

**Validation**:
- Take screenshot highlighting separator positions
- Measure element heights in DevTools to confirm no shift

---

### Phase 5: Document List Component Abstraction

**Objective**: Abstract document list items to a separate component with consistent padding

**Files to Create**:
- `src/lib/components/DocumentListItem.svelte`

**Files to Modify**:
- `src/lib/components/Sidebar.svelte`

**Implementation**:

1. Create DocumentListItem.svelte:

```svelte
<script lang="ts">
  import { FileText, Trash2 } from 'lucide-svelte';
  import Button from '$lib/components/ui/button.svelte';
  
  type DocumentListItemProps = {
    document: {
      id: string;
      name: string;
    };
    isActive: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
  };
  
  let { document, isActive, onSelect, onDelete }: DocumentListItemProps = $props();
  
  function handleSelect() {
    onSelect(document.id);
  }
  
  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    onDelete(document.id);
  }
</script>

<div
  class="group flex h-8 items-center gap-1 rounded pr-2 transition-transform {isActive ? 'bg-accent active:scale-100' : 'hover:bg-accent/50 active:scale-[0.985]'}"
>
  <Button
    variant="ghost"
    class="flex-1 overflow-hidden justify-start p-2 text-xs transition-colors hover:bg-transparent {isActive
      ? 'font-medium text-foreground'
      : 'text-muted-foreground hover:text-foreground'}"
    onclick={handleSelect}
  >
    {#snippet children()}
      <FileText class="sidebar-icon sidebar-icon-small" />
      <span class="truncate transition-opacity duration-300">
        {document.name}
      </span>
    {/snippet}
  </Button>
  <Button
    variant="ghost"
    size="icon"
    class="h-5 w-5 shrink-0 p-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-transparent hover:text-red-400 active:scale-95"
    onclick={handleDelete}
    aria-label="Delete {document.name}"
  >
    {#snippet children()}
      <Trash2 class="h-5 w-5" />
    {/snippet}
  </Button>
</div>
```

2. Update Sidebar.svelte to use DocumentListItem:

```svelte
<script lang="ts">
  // Add import
  import DocumentListItem from '$lib/components/DocumentListItem.svelte';
  
  // ... existing code ...
</script>

<!-- Replace the document list section (lines 199-233) -->
<div class="space-y-px overflow-x-hidden overflow-y-auto" style="max-height: calc(100vh - 300px);">
  {#each documentStore.documents as doc (doc.id)}
    <DocumentListItem
      document={doc}
      isActive={doc.id === documentStore.activeDocumentId}
      onSelect={handleFileSelect}
      onDelete={handleDeleteFile}
    />
  {/each}
  
  <!-- Bottom gradient fade -->
  <div
    class="pointer-events-none sticky bottom-0 h-4 bg-gradient-to-t from-background to-transparent"
  ></div>
</div>
```

**Padding Consistency Verification**:
- DocumentListItem uses same `p-2` padding as SidebarButtonSlot
- Icon uses `.sidebar-icon` and `.sidebar-icon-small` classes
- Container has zero vertical margin for efficient stacking
- Height fixed at `h-8` (32px) matching specification

**Testing**:
- Verify document list items render correctly
- Verify hover state reveals delete button
- Verify active state highlights correctly
- Verify click on item selects document
- Verify delete button triggers confirmation
- Verify padding matches SidebarButtonSlot visually
- Verify no vertical gaps between items

**Validation**:
- Take screenshot of document list
- Measure padding in DevTools and compare to SidebarButtonSlot
- Verify visual alignment between document items and other sidebar buttons

---

## Implementation Order

1. Phase 1: More Actions Menu Enhancement (low risk, additive)
2. Phase 2: Auto-Save Debounce Update (low risk, configuration change)
3. Phase 3: Line Numbers Toggle Integration (medium risk, requires testing)
4. Phase 4: Separator Layout Fix (low risk, visual polish)
5. Phase 5: Document List Abstraction (medium risk, refactoring)

## Testing Strategy

### Manual Testing
- Test each phase individually before proceeding
- Verify UI screenshots match specifications
- Test on different viewport sizes (mobile, tablet, desktop)
- Test with sidebar expanded and collapsed
- Test with multiple documents in the list

### Browser Testing
- Chrome/Edge (primary)
- Firefox (secondary)
- Safari (if available)

### Regression Testing
- Verify existing functionality still works
- Test document creation, selection, deletion
- Test settings persistence across page refreshes
- Test auto-save functionality
- Test manual save (Ctrl/Cmd+S)

## Success Criteria

- [ ] More Actions menu displays all items in correct order with proper grouping
- [ ] Auto-save triggers at 4-second intervals
- [ ] Line numbers toggle in Settings controls editor display
- [ ] Separators don't cause layout shift
- [ ] Document list items are abstracted to reusable component
- [ ] Document list items have consistent padding with other sidebar buttons
- [ ] All existing functionality remains intact
- [ ] Design specifications are consolidated in design docs

## References

- [UI_REFINEMENTS.md](../designs/frontend/UI_REFINEMENTS.md) - Design specifications
- [DESIGN_SYSTEM.md](../designs/frontend/DESIGN_SYSTEM.md) - Auto-save specification
- [UI_COMPONENTS.md](../designs/frontend/UI_COMPONENTS.md) - Component specifications
- [SIDEBAR.md](../designs/frontend/SIDEBAR.md) - Sidebar design
