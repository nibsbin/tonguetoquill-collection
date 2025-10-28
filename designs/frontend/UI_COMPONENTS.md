# UI Components Specification

## Overview

Component specifications for TongueToQuill, adapted for SvelteKit 5 with mobile support and accessibility. Components follow the VSCode-inspired aesthetic from the legacy design while supporting modern web standards.

## Layout Components

### Sidebar Component

**File**: `lib/components/layout/Sidebar.svelte`

#### Purpose
Collapsible navigation providing file management, user profile, and settings access.

#### States
- **Desktop Expanded**: 224px width, full content visible
- **Desktop Collapsed**: 48px width, icons only
- **Mobile**: Drawer overlay, full width when open

#### Props
```typescript
interface SidebarProps {
  files: FileItem[]
  activeFileId: string
  isExpanded?: boolean
  onNewFile: () => void
  onFileSelect: (fileId: string) => void
  onDeleteFile: (fileId: string) => void
}
```

#### Mobile Behavior
- Renders as drawer/modal overlay
- Swipe right to open, swipe left to close
- Backdrop click to dismiss
- Fixed position, z-index above content

#### Structure
```
┌─────────────────────┐
│ [☰] TongueToQuill  │  ← Header (toggle + branding)
├─────────────────────┤
│ [+] New Document    │  ← Create button
├─────────────────────┤
│ [📄] memo-1.md      │  ← File list (scrollable)
│ [📄] letter-2.md    │
│     ...             │
├─────────────────────┤
│ [👤] Profile        │  ← User profile
│ [⚙️] Settings       │  ← Settings
└─────────────────────┘
```

#### Accessibility
- `<nav role="navigation" aria-label="Main navigation">`
- `aria-expanded` on hamburger button
- `aria-current="page"` on active file
- Keyboard: Tab navigation, Enter to activate
- Focus trap when drawer open on mobile

---

### TopMenu Component

**File**: `lib/components/layout/TopMenu.svelte`

#### Purpose
Header bar with file info and document actions.

#### Props
```typescript
interface TopMenuProps {
  fileName: string
  isDirty?: boolean
  onDownload: () => void
  onShare: () => void
}
```

#### Structure
```
┌────────────────────────────────────────────┐
│ [Logo] memo-1.md *    [Download] [Share] [⋮] │
└────────────────────────────────────────────┘
```

#### Mobile Adaptation
- Logo scales down on small screens
- Filename truncates with ellipsis
- Actions collapse to meatball menu
- Minimum height: 48px (touch target)

#### Accessibility
- `<header role="banner">`
- Action buttons have visible labels on desktop
- Icon-only buttons have `aria-label`
- Unsaved indicator announced by screen reader

---

## Editor Components

### EditorToolbar Component

**File**: `lib/components/editor/Toolbar.svelte`

#### Purpose
Formatting controls and editor mode toggle.

#### Props
```typescript
interface ToolbarProps {
  onFormat: (type: FormatType) => void
  mode: 'markdown' | 'wizard'
  onModeChange: (mode: 'markdown' | 'wizard') => void
  disabled?: boolean
}

type FormatType = 
  | 'bold' | 'italic' | 'strikethrough'
  | 'code' | 'quote'
  | 'unordered-list' | 'ordered-list'
  | 'link'
```

#### Mobile Adaptation
- Horizontal scroll for toolbar overflow
- Groups prioritized: text → blocks → links
- Touch targets: 44x44px minimum
- Sticky positioning on scroll

#### Structure (Desktop)
```
┌──────────────────────────────────────────────┐
│ [B] [I] [S] | [<>] ["] | [•] [1.] | [🔗]  [Markdown ▼] │
└──────────────────────────────────────────────┘
```

#### Structure (Mobile)
```
┌────────────────────────────────────┐
│ [B] [I] [<>] [•] [🔗] → │ [Markdown ▼] │
└────────────────────────────────────┘
```

#### Accessibility
- `<toolbar role="toolbar" aria-label="Formatting options">`
- Each button has `aria-label` describing action
- Keyboard shortcuts announced in labels
- Mode toggle uses radio group semantics

---

### MarkdownEditor Component

**File**: `lib/components/editor/MarkdownEditor.svelte`

#### Purpose
Text input for raw markdown editing.

#### Props
```typescript
interface EditorProps {
  value: string
  onChange: (value: string) => void
  onSelectionChange?: (start: number, end: number) => void
  disabled?: boolean
  placeholder?: string
}
```

#### Features
- Syntax highlighting (optional)
- Line numbers (toggleable)
- Auto-indent
- Tab key inserts spaces
- Undo/redo support

#### Mobile Optimization
- Larger font size (18px) to prevent zoom
- Optimized virtual keyboard handling
- Touch-friendly selection handles
- Auto-save on blur

#### Accessibility
- `<textarea aria-label="Markdown editor">`
- `aria-describedby` for editor instructions
- Keyboard shortcuts don't conflict with assistive tech
- Status messages via `aria-live` region

---

### MarkdownPreview Component

**File**: `lib/components/editor/Preview.svelte`

#### Purpose
Rendered markdown output display.

#### Props
```typescript
interface PreviewProps {
  content: string
  quill?: string
  isLoading?: boolean
}
```

#### Rendering
- Uses Quillmark for professional output
- Fallback to basic markdown renderer
- Debounced updates (50ms)
- Preserves scroll position on update

#### Mobile Optimization
- Touch-friendly scrolling
- Responsive typography
- Zoom enabled for accessibility
- Horizontal scroll for wide tables

#### Accessibility
- `<article role="document" aria-label="Document preview">`
- Heading hierarchy maintained
- Alt text for images
- Color contrast meets WCAG AA

---

## UI Component Library

### Button Component

**File**: `lib/components/ui/Button.svelte`

#### Variants
```typescript
type ButtonVariant = 
  | 'primary' | 'secondary' | 'ghost' | 'destructive'

type ButtonSize = 
  | 'sm' | 'md' | 'lg' | 'icon'
```

#### Usage
```svelte
<Button variant="primary" size="md" onclick={handleClick}>
  Save Document
</Button>

<Button variant="ghost" size="icon" aria-label="Close">
  <X />
</Button>
```

#### States
- Default, Hover, Active, Focus, Disabled
- Loading state with spinner
- Icon-only with accessible label

#### Accessibility
- Minimum 44x44px on mobile
- Focus visible indicator
- Disabled state communicated to screen readers
- Loading state announced

---

### Dialog Component

**File**: `lib/components/ui/Dialog.svelte`

#### Purpose
Modal dialogs for confirmations, forms, and alerts.

#### Props
```typescript
interface DialogProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: Snippet
}
```

#### Mobile Adaptation
- Full-screen on small devices
- Bottom sheet on medium devices
- Centered modal on desktop
- Swipe down to dismiss (mobile)

#### Accessibility
- `role="dialog" aria-modal="true"`
- Focus trap inside dialog
- Focus returns to trigger on close
- ESC key to dismiss
- Backdrop click to dismiss (configurable)

---

### Dropdown Menu Component

**File**: `lib/components/ui/DropdownMenu.svelte`

#### Purpose
Contextual menus for actions and navigation.

#### Mobile Adaptation
- Bottom sheet presentation on mobile
- Larger touch targets (48px height)
- Native-feeling interactions

#### Accessibility
- `role="menu"` with `role="menuitem"` children
- Arrow key navigation
- Type-ahead search
- Focus management

---

### Toast Component

**File**: `lib/components/ui/Toast.svelte`

#### Purpose
Temporary notification messages.

#### Types
- Success, Error, Warning, Info

#### Mobile Optimization
- Positioned at bottom on mobile
- Swipe to dismiss
- Stack vertically
- Auto-dismiss after 5 seconds

#### Accessibility
- `role="status"` or `role="alert"`
- `aria-live="polite"` or `"assertive"`
- Screen reader announces message
- Persists until dismissed by user or timeout

---

## Document Components

### TemplateSelector Component

**File**: `lib/components/document/TemplateSelector.svelte`

#### Purpose
Choose document template (quill).

#### Props
```typescript
interface TemplateSelectorProps {
  templates: Template[]
  selected?: string
  onSelect: (templateId: string) => void
}
```

#### Mobile Adaptation
- Grid on desktop (3 columns)
- List on mobile (1 column)
- Large preview thumbnails
- Horizontal scroll on tablet

#### Accessibility
- Radio group semantics
- Keyboard navigation (arrow keys)
- Template previews have alt text

---

### DocumentMetadata Component

**File**: `lib/components/document/Metadata.svelte`

#### Purpose
Display and edit document metadata.

#### Fields
- Title
- Subject (for memos)
- Letterhead title
- Date
- Classification

#### Mobile Optimization
- Full-width form fields
- Native date pickers
- Dropdown selects optimized for touch

#### Accessibility
- Form labels associated with inputs
- Required fields marked
- Validation errors announced
- Error summary at top

---

## Responsive Patterns

### Breakpoint Strategy

```typescript
// Tailwind breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet portrait
lg: 1024px  // Tablet landscape / Small desktop
xl: 1280px  // Desktop
2xl: 1536px // Large desktop
```

### Layout Adaptations

**Desktop (lg+)**:
- Sidebar: 224px fixed, collapsible to 48px
- Split view: Editor 50% | Preview 50%
- Toolbar: All buttons visible

**Tablet (md-lg)**:
- Sidebar: Drawer overlay
- Split view: Editor 60% | Preview 40%
- Toolbar: Horizontal scroll

**Mobile (sm)**:
- Sidebar: Full-screen drawer
- Single view: Tabs for Editor/Preview
- Toolbar: Essential tools only, scroll for more
- Bottom navigation for mode switching

### Component Patterns

```svelte
<script>
  let innerWidth = $state(0)
  let isMobile = $derived(innerWidth < 768)
</script>

<svelte:window bind:innerWidth />

{#if isMobile}
  <MobileLayout />
{:else}
  <DesktopLayout />
{/if}
```

## Touch Interactions

### Gestures
- Swipe right: Open sidebar
- Swipe left: Close sidebar
- Pull down: Refresh document list
- Pinch zoom: Adjust preview size

### Touch Targets
- Minimum size: 44x44px
- Spacing between targets: 8px minimum
- Active area extends beyond visible bounds

## Animation Guidelines

### Transitions
```css
/* Standard duration */
transition: all 300ms ease-in-out;

/* Sidebar expand/collapse */
transition: width 300ms, opacity 200ms;

/* Modal appearance */
transition: opacity 150ms, transform 150ms;
```

### Mobile Considerations
- Respect `prefers-reduced-motion`
- Native-feeling animations
- 60fps performance on low-end devices

## Component State Management

### Local State
Use Svelte 5 runes for component-specific state:

```svelte
<script>
  let isExpanded = $state(false)
  let files = $state<File[]>([])
  
  let activeFile = $derived(
    files.find(f => f.id === activeFileId)
  )
  
  $effect(() => {
    if (autoSave && content !== lastSaved) {
      saveDocument()
    }
  })
</script>
```

### Shared State
Use stores for cross-component state:

```svelte
<script>
  import { user } from '$lib/stores/auth'
  import { preferences } from '$lib/stores/settings'
</script>
```

## Testing Considerations

### Component Tests
- Render without errors
- Handle all prop combinations
- Respond to user interactions
- Emit expected events
- Meet accessibility standards

### Responsive Tests
- Test at all breakpoints
- Touch vs mouse interactions
- Portrait and landscape orientations
