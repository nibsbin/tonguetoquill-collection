# UI Refinements Design

## Overview

This document defines medium-level design specifications for UI refinements to improve consistency, usability, and component organization in Tonguetoquill.

## More Actions Menu

### Purpose

Provide a centralized location for secondary document actions and application information links.

### Menu Structure

The More Actions menu (accessed via the meatball/kebab menu in TopMenu) organizes items into three logical groups:

**Group 1: Document Actions**

- Import
- Share

**Group 2: Document & Application Information**

- Document Info
- Keyboard Shortcuts

**Group 3: Legal & Information Links**

- About Us
- Terms of Use
- Privacy Policy

### Menu Item Specifications

**Import**

- Icon: Upload (from lucide-svelte)
- Label: "Import"
- Action: Opens file picker for importing documents (stub implementation)
- Purpose: Allow users to import external markdown files

**Share**

- Icon: Share2 (from lucide-svelte)
- Label: "Share"
- Action: Opens share dialog (stub implementation)
- Purpose: Enable document sharing functionality

**Document Info**

- Icon: FileText (from lucide-svelte)
- Label: "Document Info"
- Action: Opens document metadata dialog (stub implementation)
- Purpose: Display document properties (size, created date, word count, etc.)

**Keyboard Shortcuts** (existing)

- Icon: Keyboard (from lucide-svelte)
- Label: "Keyboard Shortcuts"
- Action: Opens keyboard shortcuts reference
- Purpose: Help users discover available shortcuts

**About Us** (existing)

- Icon: Info (from lucide-svelte)
- Label: "About Us"
- External Link Icon: ExternalLink (from lucide-svelte, right-aligned)
- Action: Opens /about in new tab
- Purpose: Provide information about the application

**Terms of Use** (existing)

- Icon: FileText (from lucide-svelte)
- Label: "Terms of Use"
- External Link Icon: ExternalLink (from lucide-svelte, right-aligned)
- Action: Opens /terms in new tab
- Purpose: Display terms of service

**Privacy Policy** (existing)

- Icon: Shield (from lucide-svelte)
- Label: "Privacy Policy"
- External Link Icon: ExternalLink (from lucide-svelte, right-aligned)
- Action: Opens /privacy in new tab
- Purpose: Display privacy policy

### Visual Design

References [UI_COMPONENTS.md - Dropdown Menu Component](./UI_COMPONENTS.md) and [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for styling details.

**Separators**: Use shadcn-svelte DropdownMenuSeparator between groups
**Menu Background**: Uses semantic token `bg-surface-elevated`
**Menu Border**: Uses semantic token `border-border`
**Menu Items**:

- Text color: `text-foreground/80`
- Hover state: `focus:bg-accent focus:text-foreground`
- Icon size: 16px (h-4 w-4)
- External link icon: 12px (h-3 w-3), right-aligned with ml-auto

## Auto-Save Configuration

### Specification Consolidation

Auto-save behavior is centralized in this design to follow DRY (Don't Repeat Yourself) principles.

**Authoritative Specification**: See [DESIGN_SYSTEM.md - Auto-Save Behavior](./DESIGN_SYSTEM.md#auto-save-behavior)

### Auto-Save Debounce Duration

**Value**: 4 seconds (4000ms)

**Rationale**:

- Reduces server load compared to shorter intervals
- Provides timely save without being intrusive
- Balances between user experience and system performance
- Updated from previous 7-second delay for more responsive feedback

**Implementation**: The `AutoSave` class constructor in `src/lib/utils/auto-save.svelte.ts` accepts a `debounceMs` parameter with a default value of 4000ms.

### Settings Integration

The auto-save toggle in Settings (Sidebar popover) controls whether auto-save is enabled. When enabled, it uses the 4-second debounce duration.

**Related Components**:

- `src/lib/utils/auto-save.svelte.ts` - AutoSave class implementation
- `src/lib/components/Sidebar.svelte` - Settings popover with auto-save toggle
- `src/lib/components/DocumentEditor.svelte` - Integration point for auto-save

## Line Numbers Toggle

### Purpose

Allow users to show or hide line numbers in the markdown editor via Settings.

### Current State

The line numbers setting toggle exists in the Sidebar settings popover but currently does not affect the markdown editor display.

### Design Requirements

**Setting Control**: Located in Settings popover (Sidebar footer)

- Label: "Line Numbers"
- Control: Switch component (shadcn-svelte)
- Persistence: localStorage key `line-numbers`

**Editor Integration**: The MarkdownEditor component accepts a `showLineNumbers` prop that:

- Controls the CodeMirror `lineNumbers()` extension
- Defaults to `true` (line numbers shown by default)
- Recreates the editor when the value changes to apply the setting

**Data Flow**:

1. User toggles line numbers switch in Settings
2. Value stored in localStorage
3. Parent component (DocumentEditor) reads localStorage value
4. Parent passes value to MarkdownEditor via `showLineNumbers` prop
5. MarkdownEditor conditionally adds `lineNumbers()` extension
6. Editor recreates when prop changes to apply new setting

### Implementation Notes

The MarkdownEditor component already has the infrastructure to support this feature via the `showLineNumbers` prop and conditional extension loading. The missing piece is connecting the Settings toggle to the prop.

## Sidebar Separators

### Current Implementation Issues

The Sidebar currently uses the shadcn-svelte Separator component but may exhibit layout shifting in some cases.

### Design Requirements

**Component**: Use shadcn-svelte `Separator` component (already implemented in `src/lib/components/ui/separator.svelte`)

**Visual Behavior**: The separator should act as a bottom border of the item above it:

- Zero height impact on layout flow
- No margin or padding that shifts surrounding elements
- Visually appears as a border between sections

**Technical Implementation**:

- Use `h-[1px]` for horizontal separators (already implemented)
- Apply `bg-border` for consistent theming (already implemented)
- Ensure no vertical margin/padding is added by container elements
- Consider using border-bottom on parent elements as an alternative if layout shift persists

**Affected Locations**:

- Between "New File" button and document list
- Before footer section (User Profile and Settings)
- Within Settings popover between setting groups

### Anti-Pattern

Avoid wrapping separators in containers that add padding/margin, as this creates unwanted spacing and layout shifts.

## Document List Component Abstraction

### Purpose

Improve code organization and reusability by abstracting the document list items into a separate component.

### Current Structure

The document list is currently embedded directly in Sidebar.svelte as an inline block with complex markup for each item.

### Proposed Component Structure

**New Component**: `DocumentListItem.svelte`

**Location**: `src/lib/components/DocumentListItem.svelte`

**Props**:

```typescript
{
  document: {
    id: string;
    name: string;
  };
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Features**:

- Encapsulates the group hover behavior
- Manages delete button visibility
- Handles active state styling
- Maintains consistent padding with SidebarButtonSlot

### Padding Consistency

**Requirement**: Document list items should have the same horizontal padding as SidebarButtonSlot.svelte.

**SidebarButtonSlot Padding**:

- Left/Right: `var(--sidebar-button-spacing)` (calculated from sidebar tokens)
- Container uses `.sidebar-button-slot` with fixed padding

**DocumentListItem Padding**:

- Should match SidebarButtonSlot horizontal padding
- Vertical padding: Zero between items for efficient stacking
- Individual item height: 32px (h-8)

**Implementation Strategy**:

- Use the same CSS custom property values as SidebarButtonSlot
- Apply padding to the group container, not individual buttons
- This ensures visual alignment between sidebar button types

### Layout Requirements

**Vertical Spacing**: Zero padding between list item buttons to efficiently stack them
**Height**: Consistent 32px (h-8) per item
**Horizontal Alignment**: Left-aligned with same padding as other sidebar buttons
**Icon Size**: Use `.sidebar-icon-small` class for 60% of standard sidebar icon size
**Text Truncation**: Apply `truncate` class to prevent text overflow

### Migration Path

1. Create DocumentListItem.svelte component
2. Extract item markup from Sidebar.svelte
3. Replace inline items with component instances
4. Verify visual consistency and behavior
5. Consider creating DocumentList.svelte container component for future enhancements

## References

- [UI_COMPONENTS.md](./UI_COMPONENTS.md) - Component specifications
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design tokens and patterns
- [SIDEBAR.md](./SIDEBAR.md) - Sidebar design specifications
- [MARKDOWN_EDITOR.md](./MARKDOWN_EDITOR.md) - Editor architecture

## Future Enhancements

These refinements establish patterns for future improvements:

- Keyboard shortcut dialog with interactive reference
- Document info modal with detailed metadata
- Share functionality with permissions
- Import improvements with format detection
- Document list virtualization for performance
