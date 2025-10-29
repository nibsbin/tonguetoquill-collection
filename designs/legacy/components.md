# Component Specifications

## 1. Sidebar Component

**File**: `/components/Sidebar.tsx`

### Purpose

Collapsible navigation panel providing file management, user profile access, and application settings.

### States

- **Expanded**: 224px width (w-56), shows full content
- **Collapsed**: 48px width (w-12), shows icons only

### Structure

```
┌─────────────────────┐
│ [☰] Tonguetoquill  │  ← Header section
├─────────────────────┤
│ [+] New File        │  ← New file button
├─────────────────────┤
│ [📄] welcome.md     │  ← File list (when expanded)
│ [📄] document.md    │
│     ...             │
├─────────────────────┤
│ [👤] Profile        │  ← User profile
│ [⚙️] Settings       │  ← Settings popover trigger
└─────────────────────┘
```

### Visual Specifications

#### Colors

- Background: `bg-zinc-900`
- Text: `text-zinc-100` (primary), `text-zinc-400` (secondary)
- Hover: `hover:bg-zinc-800`
- Active file: `bg-zinc-700`
- Border/Separator: `border-zinc-700`

#### Typography

- Brand title: Lato 700 (bold), 1.2rem
- Menu items: Default UI font
- File names: Default with truncate for overflow

#### Spacing

- Container padding: `p-2`
- Header height: `h-12`
- Item spacing: `space-y-1`
- Icon margins: `mr-2` when expanded

#### Transitions

- Width change: `transition-all duration-300`
- Opacity fade: `transition-opacity duration-300`
- Content animations: `animate-in fade-in`

### Components Within

#### Hamburger Toggle Button

- Icon: `Menu` from Lucide (20px)
- Size: Icon button (default)
- Colors: `text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800`
- Action: Toggles sidebar expanded/collapsed state

#### Brand Title

- Text: "Tonguetoquill"
- Font: Lato 700, 1.2rem
- Color: `text-zinc-100`
- Alignment: Centered
- Behavior: Fades out when collapsed (opacity-0)

#### New File Button

- Icon: `Plus` from Lucide (16px)
- Label: "New File" (when expanded)
- Colors: `text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800`
- Centering: Icon centered when collapsed, left-aligned when expanded
- Action: Creates new untitled markdown file

#### File List

- Visibility: Only shown when sidebar is expanded
- Items: Dynamic list from state
- Spacing: `space-y-1` between items

##### File Item

- **Structure**: Button + Delete icon
- **Icon**: `FileText` from Lucide (16px)
- **Label**: File name with truncate
- **States**:
  - Inactive: `text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800`
  - Active: `text-zinc-100 bg-zinc-700`
- **Delete Button**:
  - Icon: `Trash2` from Lucide (16px)
  - Visibility: `opacity-0 group-hover:opacity-100`
  - Color: `text-zinc-500 hover:text-red-400`
  - Behavior: Deletes file with protection for last file

#### User Profile Button

- Icon: `User` from Lucide (20px)
- Label: "Profile" (when expanded)
- Colors: `text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800`
- Action: Placeholder for future user profile feature

#### Settings Button

- Icon: `Settings` from Lucide (20px)
- Label: "Settings" (when expanded)
- Colors: `text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800`
- Action: Opens settings popover

### Settings Popover

**Trigger**: Settings button
**Position**: Right side, end alignment
**Width**: 256px (w-64)

#### Colors

- Background: `bg-zinc-800`
- Border: `border-zinc-700`
- Text: `text-zinc-100`
- Labels: `text-zinc-300`

#### Content Structure

```
Settings
├─ Auto-save        [Toggle]
├─ Dark Theme       [Toggle]
└─ Line Numbers     [Toggle]
```

#### Settings Options

1. **Auto-save**
   - Type: Switch toggle
   - Default: Off
   - Future: Implement auto-save functionality

2. **Dark Theme**
   - Type: Switch toggle
   - Default: On
   - Future: Toggle between light/dark modes

3. **Line Numbers**
   - Type: Switch toggle
   - Default: On
   - Future: Show/hide line numbers in editor

#### Spacing

- Container padding: `p-4`
- Items spacing: `space-y-4`
- Toggle label spacing: `justify-between`

---

## 2. TopMenu Component

**File**: `/components/TopMenu.tsx`

### Purpose

Header bar displaying current file information and providing access to file operations and application information.

### Structure

```
┌───────────────────────────────────────────────────┐
│ [Logo] welcome.md         [Download] [⋮]          │
└───────────────────────────────────────────────────┘
```

### Visual Specifications

#### Colors

- Background: `bg-zinc-800`
- Border: `border-b border-zinc-700`
- Text: `text-zinc-300`
- Button hover: `hover:text-zinc-100 hover:bg-zinc-700`

#### Layout

- Height: `h-12` (48px)
- Padding: `px-4` (horizontal)
- Alignment: Space between (flex justify-between)
- Items alignment: Center vertically

### Components Within

#### Logo

- Source: Imported from Sidebar component export
- Alt text: "Quillmark Logo"
- Height: `h-6` (24px)
- Flex: Shrink-0 (maintains aspect ratio)

#### Filename Display

- Text: Current active file name
- Color: `text-zinc-300`
- Gap from logo: `gap-2`

#### Download Button

- Icon: `Download` from Lucide (16px)
- Label: "Download"
- Colors: `text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700`
- Size: `size-sm`, `h-7`
- Border: Wrapped in `border border-zinc-600 rounded-md`
- Icon spacing: `mr-1`
- Action: Downloads current file as .md

#### Meatball Menu (More Options)

- Icon: `MoreVertical` from Lucide (16px)
- Size: `h-8 w-8` icon button
- Colors: `text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700`

### Meatball Dropdown Menu

**Trigger**: More options button
**Alignment**: End
**Width**: 224px (w-56)

#### Colors

- Background: `bg-zinc-800`
- Border: `border-zinc-700`
- Text: `text-zinc-100`
- Item default: `text-zinc-300`
- Item hover: `focus:text-zinc-100 focus:bg-zinc-700`

#### Menu Structure

```
Share                    [Share icon]
Import File              [Upload icon]
─────────────────────────
Document Info            [FileText icon]
Keyboard Shortcuts       [Keyboard icon]
─────────────────────────
About Us                 [Info icon] [External]
Terms of Use             [FileText icon] [External]
Privacy Policy           [Shield icon] [External]
```

#### Menu Items

1. **Share**
   - Icon: `Share2` (16px)
   - Action: Share via native API or copy to clipboard
   - Toast on success/failure

2. **Import File**
   - Icon: `Upload` (16px)
   - Action: Placeholder for future file import
   - Future: Open file picker dialog

3. **Document Info**
   - Icon: `FileText` (16px)
   - Action: Placeholder for document metadata
   - Future: Show word count, character count, etc.

4. **Keyboard Shortcuts**
   - Icon: `Keyboard` (16px)
   - Action: Placeholder for shortcuts help
   - Future: Display modal with keyboard shortcuts

5. **About Us**
   - Icon: `Info` (16px)
   - External indicator: `ExternalLink` (12px, `ml-auto`)
   - Action: Opens /about in new tab

6. **Terms of Use**
   - Icon: `FileText` (16px)
   - External indicator: `ExternalLink` (12px, `ml-auto`)
   - Action: Opens /terms in new tab

7. **Privacy Policy**
   - Icon: `Shield` (16px)
   - External indicator: `ExternalLink` (12px, `ml-auto`)
   - Action: Opens /privacy in new tab

---

## 3. EditorToolbar Component

**File**: `/components/EditorToolbar.tsx`

### Purpose

Provides quick access to markdown formatting tools and editor mode switching.

### Structure

```
┌─────────────────────────────────────────────────────────┐
│ [B] [I] [S] | [<>] ["] | [•] [1.] | [🔗]    [Markdown ▼]│
└─────────────────────────────────────────────────────────┘
```

### Visual Specifications

#### Colors

- Background: `bg-zinc-800`
- Border: `border-b border-zinc-700`
- Button default: `text-zinc-400`
- Button hover: `hover:text-zinc-100 hover:bg-zinc-700`
- Separator: `bg-zinc-700`

#### Layout

- Height: `h-10` (40px)
- Padding: `px-2`
- Item gap: `gap-1`
- Alignment: Space between (formatting tools left, mode toggle right)

### Formatting Buttons

All formatting buttons share these specifications:

- Size: `h-7 w-7 p-0` (icon-only buttons)
- Icon size: 16px (h-4 w-4)
- Variant: Ghost
- Tooltip: Title attribute for accessibility

#### Button List

1. **Bold** - `Bold` icon
   - Shortcut: (Future implementation)
   - Format: Wraps selection with `**text**`

2. **Italic** - `Italic` icon
   - Shortcut: (Future implementation)
   - Format: Wraps selection with `*text*`

3. **Strikethrough** - `Strikethrough` icon
   - Shortcut: (Future implementation)
   - Format: Wraps selection with `~~text~~`

4. **Code** - `Code` icon (after separator)
   - Shortcut: (Future implementation)
   - Format: Wraps selection with `` `text` ``

5. **Quote** - `Quote` icon
   - Shortcut: (Future implementation)
   - Format: Prepends `> ` to selection

6. **Bullet List** - `List` icon (after separator)
   - Shortcut: (Future implementation)
   - Format: Prepends `- ` to selection

7. **Numbered List** - `ListOrdered` icon
   - Shortcut: (Future implementation)
   - Format: Prepends `1. ` to selection

8. **Link** - `Link` icon (after separator)
   - Shortcut: (Future implementation)
   - Format: Wraps selection with `[text](url)`

#### Separators

- Orientation: Vertical
- Height: `h-5`
- Color: `bg-zinc-700`
- Margins: `mx-1`
- Placement: Between tool groups

### Mode Toggle (Tabs)

**Component**: shadcn/ui Tabs
**Position**: Right side of toolbar (after flex-1 spacer)

#### Visual Specifications

- Container background: `bg-zinc-900`
- Container height: `h-7`
- Container padding: `p-0.5`
- Tab height: `h-6`
- Tab padding: `px-3`
- Tab font size: `text-xs`

#### States

- **Inactive Tab**:
  - Color: `text-zinc-400`
  - Background: Transparent
- **Active Tab**:
  - Color: `text-zinc-100`
  - Background: `bg-zinc-700`

#### Tab Options

1. **Markdown** (default)
   - Shows raw markdown editor
2. **Wizard** (future)
   - Placeholder for WYSIWYG-style editor
   - Currently non-functional

---

## 4. MarkdownEditor Component

**File**: `/components/MarkdownEditor.tsx`

### Purpose

Text input area for writing raw markdown content with real-time update capabilities.

### Visual Specifications

#### Element

- Type: `<textarea>`
- Width: `w-full`
- Height: `h-full`
- Resize: `resize-none` (fills container)

#### Colors

- Background: `bg-zinc-900`
- Text: `text-zinc-100`
- Outline: `outline-none` (removes default focus outline)

#### Typography

- Font: `font-mono` (system monospace)
- Size: Default (16px)
- Line height: 1.5

#### Spacing

- Padding: `p-4`

#### Behavior

- Spell check: Disabled (`spellCheck={false}`)
- Placeholder: "Start typing your markdown here..."
- Auto-focus: No (manual focus control)

### Functionality

#### Text Input

- Controlled component (value from parent state)
- onChange handler updates parent state in real-time
- Supports all standard keyboard shortcuts (copy, paste, undo, etc.)

#### Selection Tracking

- Monitors selection changes via multiple events:
  - `select` - When user selects text
  - `click` - When cursor position changes
  - `keyup` - When typing moves cursor
- Reports selectionStart and selectionEnd to parent
- Used for formatting operations from toolbar

#### Reference

- Uses React ref for direct DOM access
- Needed for programmatic selection after formatting
- Enables focus restoration after toolbar operations

---

## 5. MarkdownPreview Component

**File**: `/components/MarkdownPreview.tsx`

### Purpose

Renders markdown content as formatted HTML in real-time as the user types.

### Visual Specifications

#### Container

- Width: `w-full`
- Height: `h-full`
- Overflow: `overflow-auto` (scrollable)

#### Colors

- Background: `bg-white`
- Text: Inherits from prose (typically black/dark gray)

#### Typography

- Prose styling: `prose prose-slate`
- Max width: `max-w-none` (uses full container width)
- Font: Crimson Text (serif, for readability)

#### Spacing

- Padding: `p-6`

### Markdown Rendering

#### Library

**react-markdown** with **remark-gfm** plugin

#### Features Supported

- **GitHub Flavored Markdown (GFM)**:
  - Tables
  - Strikethrough
  - Task lists
  - Autolinks
- **Standard Markdown**:
  - Headings (H1-H6)
  - Bold, italic, code
  - Links and images
  - Blockquotes
  - Ordered and unordered lists
  - Code blocks with syntax highlighting (basic)
  - Horizontal rules

#### Prose Styling

Uses Tailwind Typography plugin (`@tailwindcss/typography`):

- Automatic styling for all markdown elements
- Proper heading hierarchy
- Code block formatting
- Link colors and hover states
- List indentation and spacing
- Table formatting

#### Placeholder

When no content: Displays "_Preview will appear here..._" in italic

---

## Component Interactions

### File Creation Flow

1. User clicks "New File" in Sidebar
2. App creates new file with unique ID
3. File added to files array
4. Active file switches to new file
5. Sidebar shows new file in list (if expanded)
6. Editor clears for new content
7. Toast notification: "New file created"

### File Switching Flow

1. User clicks file name in Sidebar
2. App updates activeFileId
3. Editor loads selected file's content
4. Preview updates with new content
5. TopMenu updates filename display

### File Deletion Flow

1. User hovers over file item (delete icon appears)
2. User clicks delete icon
3. App checks if it's the last file (protection)
4. If multiple files: removes file from array
5. If deleted file was active: switches to first remaining file
6. Toast notification: "File deleted"

### Formatting Flow

1. User selects text in editor (or places cursor)
2. User clicks format button in toolbar
3. Toolbar handler:
   - Gets current selection
   - Wraps/prepends with markdown syntax
   - Updates content
   - Restores selection (with new formatting included)
4. Editor re-renders with formatted text
5. Preview updates with rendered formatting

### Share Flow

1. User clicks meatball menu → Share
2. App checks for native Web Share API support
3. If supported: Opens native share dialog with content
4. If not supported: Copies content to clipboard
5. Toast notification: Success or error message

### Download Flow

1. User clicks Download button in TopMenu
2. App creates Blob from markdown content
3. Creates temporary download URL
4. Triggers download with current filename
5. Cleans up URL
6. Toast notification: "File saved successfully"

### Settings Toggle Flow

1. User clicks Settings icon in Sidebar
2. Popover opens to the right
3. User toggles switches for:
   - Auto-save (future feature)
   - Dark Theme (future feature)
   - Line Numbers (future feature)
4. State updates but features not yet implemented
5. Popover can be dismissed by clicking outside

---

## Toast Notifications

**Library**: Sonner (`sonner@2.0.3`)
**Component**: `<Toaster />` in App.tsx

### Notification Types

- **Success**: Green background, checkmark icon
  - "New file created"
  - "File saved successfully"
  - "Copied to clipboard" (share fallback)
  - "File deleted"
- **Error**: Red background, error icon
  - "Cannot delete the last file"
  - "Sharing failed"

### Positioning

- Default position (typically bottom-right)
- Auto-dismiss after 3-5 seconds
- Stackable (multiple toasts can appear)

### Visual Integration

- Matches dark theme aesthetic
- Minimal, non-intrusive design
- Clear, concise messages
