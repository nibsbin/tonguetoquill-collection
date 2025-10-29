# State Management & Data Flow

## Overview

Tonguetoquill uses React's built-in state management (useState hooks) with a centralized state architecture in the root App component. All state flows unidirectionally from parent to child components via props.

---

## State Architecture

### State Location

All application state resides in `/App.tsx` as the single source of truth.

### State Flow Pattern

```
App (State Owner)
├─ State Updates → Re-render
├─ Props Down → Child Components
└─ Callbacks Up → Event Handlers

Child Components (Presentational)
├─ Receive data via props
├─ Trigger actions via callbacks
└─ Maintain minimal local UI state only
```

---

## Application State

### 1. Files State

```typescript
const [files, setFiles] = useState<File[]>([...])

interface File {
  id: string;      // Unique identifier (timestamp-based)
  name: string;    // Display name with .md extension
  content: string; // Raw markdown content
}
```

#### Purpose

- Stores all created markdown documents
- Persists across component re-renders
- Acts as in-memory file system

#### Initial State

```typescript
[
	{
		id: '1',
		name: 'welcome.md',
		content: '# Welcome to Markdown Editor\n...'
	}
];
```

#### Operations

- **Create**: `setFiles([...files, newFile])`
- **Update**: `setFiles(files.map(f => f.id === id ? updated : f))`
- **Delete**: `setFiles(files.filter(f => f.id !== id))`

#### Future Enhancements

- Persist to localStorage
- Sync with cloud storage
- File metadata (created date, modified date, size)

### 2. Active File ID State

```typescript
const [activeFileId, setActiveFileId] = useState('1');
```

#### Purpose

- Tracks which file is currently being edited
- Determines highlighted file in sidebar
- Controls editor and preview content

#### Updates

- On file creation: Set to new file's ID
- On file selection: Set to clicked file's ID
- On file deletion: Set to first remaining file's ID

#### Derived Data

```typescript
const activeFile = files.find((f) => f.id === activeFileId);
const markdown = activeFile?.content || '';
const fileName = activeFile?.name || 'untitled.md';
```

### 3. Selection State

```typescript
const [selectionStart, setSelectionStart] = useState(0);
const [selectionEnd, setSelectionEnd] = useState(0);
```

#### Purpose

- Tracks cursor position and text selection in editor
- Enables toolbar formatting operations
- Allows cursor restoration after content updates

#### Updates

- On selection change in editor
- On click in editor
- On keyup in editor
- Used by formatting handlers to wrap selected text

#### Future Usage

- Display character count for selection
- Enable find/replace functionality
- Support custom keyboard shortcuts

### 4. Editor Mode State

```typescript
const [editorMode, setEditorMode] = useState<'markdown' | 'wizard'>('markdown');
```

#### Purpose

- Controls which editor interface is displayed
- Toggles between raw markdown and WYSIWYG modes

#### Current Implementation

- Always 'markdown' (wizard mode not implemented)
- Toggle UI present but no functional change

#### Future Implementation

- 'wizard' mode: Visual editor with formatting toolbar
- Mode switch: Convert between raw and visual representations
- Persist user preference

---

## Component-Local State

### Sidebar Component State

```typescript
const [isExpanded, setIsExpanded] = useState(false);
const [autoSave, setAutoSave] = useState(false);
const [darkTheme, setDarkTheme] = useState(true);
const [lineNumbers, setLineNumbers] = useState(true);
const [popoverOpen, setPopoverOpen] = useState(false);
```

#### isExpanded

- **Purpose**: Controls sidebar width (48px vs 224px)
- **Updates**: Toggle on hamburger menu click
- **Effects**: Width transition, content fade in/out

#### Settings States (autoSave, darkTheme, lineNumbers)

- **Purpose**: Toggle states for settings popover
- **Current**: Visual only, no functional implementation
- **Future**:
  - autoSave: Enable periodic save to storage
  - darkTheme: Switch between light/dark color schemes
  - lineNumbers: Show/hide line numbers in editor

#### popoverOpen

- **Purpose**: Controls settings popover visibility
- **Updates**: Via Popover component (shadcn/ui)
- **Effects**: Opens/closes settings panel

### MarkdownEditor Component State

```typescript
const textareaRef = useRef<HTMLTextAreaElement>(null);
```

#### Purpose

- Direct DOM reference to textarea element
- Enables programmatic selection after formatting
- Allows focus restoration

#### Usage

- Accessed by formatting handlers in App
- Used to restore cursor position
- Sets selection range after text insertion

---

## Data Flow Diagrams

### File Creation Flow

```
User clicks "New File" button
    ↓
Sidebar → onNewFile() callback
    ↓
App.handleNewFile()
    ├─ Generate new file ID (timestamp)
    ├─ Create file object with default name
    ├─ setFiles([...files, newFile])
    ├─ setActiveFileId(newFileId)
    └─ toast.success()
    ↓
State Update triggers re-render
    ├─ Sidebar receives updated files prop
    │   └─ New file appears in list
    ├─ TopMenu receives updated fileName prop
    │   └─ Shows new filename
    ├─ Editor receives empty content
    │   └─ Clears textarea
    └─ Preview receives empty content
        └─ Shows placeholder
```

### Content Editing Flow

```
User types in editor
    ↓
MarkdownEditor → onChange(e.target.value)
    ↓
App.updateActiveFileContent(content)
    ├─ setFiles(files.map(f =>
    │       f.id === activeFileId ? {...f, content} : f))
    └─ No toast (silent update)
    ↓
State Update triggers re-render
    ├─ MarkdownEditor receives updated value
    │   └─ Displays new text (controlled input)
    └─ MarkdownPreview receives updated content
        └─ Re-renders markdown to HTML
```

### Formatting Flow

```
User clicks Bold button
    ↓
EditorToolbar → onFormat('bold')
    ↓
App.handleFormat('bold')
    ├─ Query textarea DOM element
    ├─ Get current selection (start, end)
    ├─ Extract selected text
    ├─ Wrap with **markers**
    ├─ Build new content string
    ├─ Call updateActiveFileContent()
    └─ setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(...)
        })
    ↓
State Update triggers re-render
    ├─ Editor shows formatted text
    ├─ Cursor repositioned (includes markers in selection)
    └─ Preview shows bold text
```

### File Switching Flow

```
User clicks file in sidebar
    ↓
Sidebar → onFileSelect(fileId)
    ↓
App.handleFileSelect(fileId)
    └─ setActiveFileId(fileId)
    ↓
State Update triggers re-render
    ├─ Sidebar receives activeFileId
    │   ├─ Previous file loses bg-zinc-700
    │   └─ New file gets bg-zinc-700
    ├─ Derived data updates
    │   ├─ activeFile = files.find(...)
    │   ├─ markdown = activeFile.content
    │   └─ fileName = activeFile.name
    ├─ TopMenu receives fileName
    │   └─ Updates display
    ├─ Editor receives markdown
    │   └─ Shows new content
    └─ Preview receives markdown
        └─ Renders new content
```

### File Deletion Flow

```
User clicks trash icon on file
    ↓
Sidebar → onDeleteFile(fileId)
    ↓
App.handleDeleteFile(fileId)
    ├─ Check: if (files.length === 1)
    │   └─ toast.error() and return
    ├─ const updatedFiles = files.filter(f => f.id !== fileId)
    ├─ setFiles(updatedFiles)
    ├─ Check: if (activeFileId === fileId)
    │   └─ setActiveFileId(updatedFiles[0].id)
    └─ toast.success()
    ↓
State Update triggers re-render
    ├─ Sidebar receives updated files
    │   └─ Deleted file removed from list
    └─ If active file changed:
        ├─ TopMenu shows new filename
        ├─ Editor shows new content
        └─ Preview shows new content
```

---

## Props Interface

### Sidebar Props

```typescript
interface SidebarProps {
	files: FileItem[]; // List of files for display
	activeFileId: string; // Highlight active file
	onNewFile: () => void; // Create new file
	onFileSelect: (fileId: string) => void; // Switch files
	onDeleteFile: (fileId: string) => void; // Delete file
}

interface FileItem {
	id: string;
	name: string;
}
```

### TopMenu Props

```typescript
interface TopMenuProps {
	fileName: string; // Display in header
	onShare: () => void; // Share action
	onDownload: () => void; // Download action
}
```

### EditorToolbar Props

```typescript
interface EditorToolbarProps {
	onFormat: (type: string) => void; // Apply formatting
	mode?: 'markdown' | 'wizard'; // Current editor mode
	onModeChange?: (mode: 'markdown' | 'wizard') => void; // Toggle mode
}
```

### MarkdownEditor Props

```typescript
interface MarkdownEditorProps {
	value: string; // Current markdown content
	onChange: (value: string) => void; // Content updates
	onSelectionChange?: (start: number, end: number) => void; // Track cursor
}
```

### MarkdownPreview Props

```typescript
interface MarkdownPreviewProps {
	content: string; // Markdown to render
}
```

---

## State Persistence

### Current Implementation

**No Persistence**: All state is in-memory only

- Refreshing page resets to initial state
- Closing tab loses all work
- No cross-device sync

### Future Implementation Options

#### LocalStorage (Simple)

```typescript
// On state change
useEffect(() => {
	localStorage.setItem('tonguetoquill-files', JSON.stringify(files));
}, [files]);

// On mount
const savedFiles = localStorage.getItem('tonguetoquill-files');
const initialFiles = savedFiles ? JSON.parse(savedFiles) : defaultFiles;
```

#### IndexedDB (Large Files)

```typescript
// For handling large documents
// Better performance than localStorage
// Supports binary data (future: image uploads)
```

#### Cloud Sync (Advanced)

```typescript
// Supabase or Firebase integration
// Real-time sync across devices
// User authentication required
// Conflict resolution needed
```

---

## Performance Considerations

### Re-render Optimization

#### Current Approach

- Minimal state in App
- Pure components (no unnecessary renders)
- Controlled inputs prevent double-renders

#### Potential Optimizations

```typescript
// Memoize derived data
const activeFile = useMemo(() => files.find((f) => f.id === activeFileId), [files, activeFileId]);

// Memoize expensive callbacks
const handleFormat = useCallback(
	(type: string) => {
		// ... formatting logic
	},
	[markdown, activeFileId, files]
);

// Memoize child components
const MemoizedSidebar = React.memo(Sidebar);
```

### Large Document Handling

#### Current Limitations

- Preview re-renders on every keystroke
- Can slow down with very large documents (>50,000 chars)

#### Future Solutions

```typescript
// Debounce preview updates
const debouncedContent = useDebounce(markdown, 300);

// Virtual scrolling for large previews
// Code splitting for preview component
// Web Worker for markdown parsing
```

---

## State Testing Considerations

### Testable State Transitions

1. **File CRUD Operations**
   - Create: Adds file, switches active
   - Read: Derives active file data
   - Update: Modifies content
   - Delete: Removes file, handles active switch

2. **Edge Cases**
   - Delete last file (blocked)
   - Switch to deleted active file
   - Format with no selection
   - Format at document boundaries

3. **State Consistency**
   - activeFileId always points to existing file
   - files array never empty
   - File IDs are unique
   - Content updates don't affect other files

---

## Future State Additions

### Proposed State

```typescript
// Undo/Redo
const [history, setHistory] = useState<string[]>([]);
const [historyIndex, setHistoryIndex] = useState(0);

// UI Preferences
const [fontSize, setFontSize] = useState(16);
const [theme, setTheme] = useState<'light' | 'dark'>('dark');
const [previewSync, setPreviewSync] = useState(true);

// File Metadata
interface FileMetadata {
	created: Date;
	modified: Date;
	wordCount: number;
	readingTime: number;
}

// Search/Filter
const [searchQuery, setSearchQuery] = useState('');
const [filteredFiles, setFilteredFiles] = useState<File[]>([]);

// Collaboration (future)
const [collaborators, setCollaborators] = useState<User[]>([]);
const [currentUser, setCurrentUser] = useState<User | null>(null);
```

---

## State Migration Strategy

### Version 1.0 (Current)

```typescript
// Simple in-memory state
files: File[]
activeFileId: string
```

### Version 2.0 (With Persistence)

```typescript
// Add versioning to stored data
interface StoredState {
	version: number;
	files: File[];
	activeFileId: string;
	preferences: UserPreferences;
}

// Migration function
function migrateState(oldState: any): StoredState {
	if (oldState.version === 1) {
		return {
			version: 2,
			files: oldState.files,
			activeFileId: oldState.activeFileId,
			preferences: defaultPreferences
		};
	}
	return oldState;
}
```

---

## Conclusion

The current state management is simple and effective for a client-side-only application. As features are added (persistence, collaboration, advanced editing), consider:

1. **State Management Library**: Redux, Zustand, or Jotai for complex state
2. **Server State**: React Query or SWR for API data
3. **Form State**: React Hook Form for settings and metadata
4. **URL State**: React Router for navigation and deep linking
5. **Context**: For theme and preferences (avoid prop drilling)
