# Interaction Patterns & User Flows

## Core Interaction Principles

### 1. Real-Time Feedback
- All text input updates preview immediately
- No save button required (auto-update on keystroke)
- Formatting applies instantly with cursor preservation

### 2. Visual Feedback
- Hover states on all interactive elements
- Active states for selected items
- Smooth transitions for state changes (300ms duration)
- Toast notifications for user actions

### 3. Keyboard-First
- All actions accessible via mouse or keyboard
- Text selection and formatting keyboard-friendly
- Tab navigation follows logical flow
- Future: Keyboard shortcuts for common actions

---

## User Flows

### 1. First-Time User Experience

#### Initial State
```
User opens application
├─ Sidebar expanded (showing brand name)
├─ One default file "welcome.md" loaded
├─ Editor shows welcome content
├─ Preview renders formatted welcome message
└─ No popups or modals
```

#### Exploration Path
1. User reads welcome content in preview
2. Tries clicking text in editor
3. Sees cursor appear, realizes it's editable
4. Types text, sees preview update
5. Explores toolbar formatting buttons
6. Clicks "New File" to start fresh document

### 2. Creating and Editing Documents

#### New Document Flow
```
User clicks [+ New File]
├─ New file created with name "untitled-{n}.md"
├─ File added to sidebar list
├─ File automatically selected (active)
├─ Editor clears for new content
├─ Preview shows placeholder text
├─ Toast: "New file created"
└─ User begins typing
```

#### Editing Flow
```
User types in editor
├─ On every keystroke:
│   ├─ State updates with new content
│   ├─ Preview re-renders markdown
│   └─ File content saved in state
└─ No explicit save action needed
```

#### Formatting Flow
```
User wants to make text bold
├─ Option A: Select text, click [B] button
│   ├─ Selection wrapped with **markers**
│   ├─ Content updates
│   ├─ Selection restored (including markers)
│   └─ Preview shows bold text
│
└─ Option B: Click [B] button, then type
    ├─ Markers inserted at cursor
    ├─ Cursor positioned between markers
    ├─ User types text
    └─ Preview shows bold as user types
```

### 3. File Management

#### Switching Files
```
User wants to switch documents
├─ Ensures sidebar is expanded (clicks hamburger if needed)
├─ Sees list of files
├─ Clicks target file name
├─ Active file changes
│   ├─ Previous file: background changes from zinc-700 to transparent
│   ├─ New file: background changes to zinc-700
│   ├─ Text color brightens (zinc-400 → zinc-100)
├─ Editor loads new file content
├─ Preview updates with new content
└─ TopMenu shows new filename
```

#### Deleting Files
```
User wants to delete a file
├─ Hovers over file in sidebar
├─ Trash icon fades in (opacity 0 → 100%)
├─ Clicks trash icon
├─ App checks file count
│   ├─ If last file: Toast "Cannot delete the last file"
│   └─ If multiple files:
│       ├─ File removed from list
│       ├─ If deleted file was active:
│       │   └─ First remaining file becomes active
│       └─ Toast: "File deleted"
└─ File list updates (deleted item animates out)
```

### 4. Exporting & Sharing

#### Download Flow
```
User clicks [Download]
├─ Browser download triggered
├─ File saves as "{filename}.md"
├─ Toast: "File saved successfully"
└─ No interruption to editing
```

#### Share Flow
```
User clicks meatball menu [...] → Share
├─ App checks for Web Share API
│   ├─ If available:
│   │   ├─ Native share sheet opens
│   │   ├─ User selects destination
│   │   └─ Share completes or cancels
│   └─ If not available:
│       ├─ Content copied to clipboard
│       └─ Toast: "Copied to clipboard"
└─ User continues editing
```

### 5. Settings Management

#### Opening Settings
```
User clicks [⚙️ Settings] in sidebar
├─ Popover opens to the right
├─ Shows current toggle states
├─ User can interact with toggles
└─ Future: Settings persist and affect app behavior
```

#### Changing Settings
```
User toggles "Dark Theme"
├─ Switch animates (off → on or vice versa)
├─ State updates
├─ Future implementation will:
│   ├─ Apply theme change to app
│   ├─ Persist to localStorage
│   └─ Preview background changes accordingly
└─ Current: Visual toggle only, no effect
```

---

## Interaction States

### Button States

#### Default State
```css
Colors: text-zinc-400, transparent background
Cursor: pointer
Opacity: 100%
```

#### Hover State
```css
Colors: text-zinc-100, bg-zinc-700 or bg-zinc-800
Transition: 300ms color, background
Cursor: pointer
```

#### Active/Pressed State
- Same as hover (no distinct press state)
- Relies on visual feedback from action result

#### Focus State
```css
Outline: ring color (zinc-439 dark, zinc-708 light)
Outline width: 2px
Outline offset: 2px
```

#### Disabled State
- Not currently implemented
- Future: text-zinc-600, cursor-not-allowed

### File Item States

#### Inactive File
```css
Text: zinc-400
Background: transparent
Hover: text-zinc-100, bg-zinc-800
Transition: 300ms
```

#### Active File
```css
Text: zinc-100
Background: zinc-700
No hover effect (already highlighted)
```

#### Delete Button on File Item
```css
Default: opacity-0
Hover (on parent): opacity-100
Transition: 300ms opacity
Colors: text-zinc-500, hover:text-red-400
```

### Sidebar States

#### Collapsed
```css
Width: 48px
Content opacity: 0 (except hamburger)
Icons: centered
Transition: 300ms width, opacity
```

#### Expanding (transition)
```css
Width: 48px → 224px (over 300ms)
Content: fades in with animate-in
```

#### Expanded
```css
Width: 224px
Content opacity: 100%
Icons: left-aligned with text
```

### Toggle/Switch States

#### Off
```css
Background: switch-background (zinc-400 equivalent)
Thumb: left position, bg-white
```

#### On
```css
Background: primary (zinc-100 in dark mode)
Thumb: right position, bg-white
```

#### Transition
```css
Duration: 200ms (via shadcn default)
Easing: ease-in-out
Animates: background-color, transform
```

---

## Micro-Interactions

### 1. Hover Animations

#### Button Hover
- **Duration**: Instant (no delay)
- **Properties**: Color and background-color
- **Easing**: Default CSS transition

#### File Item Hover
- **Triggered by**: Mouse enter file row
- **Effects**:
  - Text color brightens
  - Background appears
  - Delete icon fades in
- **Duration**: 300ms

### 2. Click Feedback

#### Toolbar Formatting Button
```
User clicks [B]
├─ No visual change to button (instant action)
├─ Editor content updates (markers added)
├─ Cursor/selection shifts
└─ Preview re-renders (bold text appears)
```

#### File Selection
```
User clicks file name
├─ Instant background color change
├─ Previous active: zinc-700 → transparent
├─ New active: transparent → zinc-700
└─ Content loads in editor
```

### 3. Sidebar Toggle Animation

#### Collapse Animation
```
User clicks hamburger menu (when expanded)
├─ Width: 224px → 48px (300ms ease-in-out)
├─ Brand title: opacity 100% → 0% (300ms)
├─ File labels: fade out (300ms)
├─ Button labels: fade out (300ms)
└─ Icons: re-center horizontally
```

#### Expand Animation
```
User clicks hamburger menu (when collapsed)
├─ Width: 48px → 224px (300ms ease-in-out)
├─ Brand title: opacity 0% → 100% (300ms, delayed)
├─ File labels: fade in with animate-in class
├─ Button labels: fade in with animate-in class
└─ Icons: shift to left alignment
```

### 4. Toast Notifications

#### Appearance
```
Toast triggered
├─ Slide in from bottom-right (via Sonner default)
├─ Ease-in animation (~200ms)
├─ Appears above other content
└─ Stacks if multiple toasts
```

#### Dismissal
```
After 3-5 seconds
├─ Fade out animation (~200ms)
├─ Slide out to right
└─ Stack shifts up if multiple toasts
```

#### Manual Dismissal
```
User clicks close icon
├─ Immediate fade out
└─ Removes from DOM
```

### 5. Popover Animations

#### Opening
```
User clicks Settings button
├─ Popover fades in (~150ms, shadcn default)
├─ Slight scale animation (0.95 → 1.0)
├─ Appears to right of sidebar
└─ Backdrop overlay (for mobile, if applicable)
```

#### Closing
```
User clicks outside or presses Esc
├─ Fade out (~150ms)
├─ Scale down slightly (1.0 → 0.95)
└─ Removed from DOM
```

### 6. Dropdown Menu Animations

#### Opening
```
User clicks meatball menu
├─ Menu fades in (~150ms)
├─ Slight scale animation
├─ Aligns to end (right side)
└─ Focus moves to first item
```

#### Hover on Item
```
User hovers menu item
├─ Background: transparent → zinc-700 (instant)
├─ Text: zinc-300 → zinc-100
└─ Icons maintain color
```

---

## Keyboard Interactions

### Current Implementation

#### Text Editing
- **Standard shortcuts**: Ctrl+C, Ctrl+V, Ctrl+Z, etc. (native browser)
- **Selection**: Shift + Arrow keys
- **Navigation**: Arrow keys move cursor

#### Tab Navigation
```
Tab Order:
1. Sidebar hamburger menu
2. New File button
3. File items (when expanded)
4. Profile button
5. Settings button
6. Download button
7. Meatball menu button
8. Toolbar formatting buttons (left to right)
9. Mode toggle tabs
10. Editor textarea
```

#### Esc Key
- Closes open popover (Settings)
- Closes open dropdown menu

#### Enter/Space on Buttons
- Triggers button action
- Same as click

### Future Keyboard Shortcuts

#### Proposed (Not Implemented)
```
Ctrl/Cmd + B         → Bold
Ctrl/Cmd + I         → Italic
Ctrl/Cmd + K         → Insert Link
Ctrl/Cmd + S         → Save/Download
Ctrl/Cmd + N         → New File
Ctrl/Cmd + O         → Open File (future)
Ctrl/Cmd + W         → Close File (future)
Ctrl/Cmd + Shift + P → Command Palette (future)
```

---

## Error States & Edge Cases

### Deletion Protection
```
User tries to delete last file
├─ Action blocked
├─ Toast: "Cannot delete the last file"
└─ No state change
```

### Share Failure
```
Native share API fails
├─ Fallback to clipboard copy
├─ Toast: "Copied to clipboard"
└─ User can manually paste
```

### Empty Content
```
Editor is empty
├─ Preview shows: "*Preview will appear here...*"
├─ No error state
└─ User can start typing
```

### Very Long Filename
```
Filename exceeds TopMenu width
├─ Text truncates with ellipsis (CSS truncate)
├─ Full name visible in sidebar file list
└─ No tooltip (future enhancement)
```

### Very Long File List
```
File list exceeds sidebar height
├─ Scrollbar appears in file list section
├─ Header and footer remain fixed
└─ Smooth scroll behavior
```

---

## Loading States

### Current Implementation
- **No loading states**: App is instant (client-side only)
- State changes are synchronous
- No async operations currently

### Future Considerations
If persistence/sync added:
- Loading spinner for file operations
- Skeleton screens for file list
- "Saving..." indicator for auto-save
- Progress bar for large file imports

---

## Accessibility Interactions

### Screen Reader Announcements
**Current**: Limited (relies on native browser behavior)

**Future Improvements**:
- Announce file creation/deletion
- Announce file switches
- Announce formatting application
- Live region for preview updates

### Focus Management
- Focus remains in editor after formatting
- Focus trapped in popovers when open
- Focus returns to trigger button when popover closes

### Keyboard Navigation
- All interactive elements keyboard accessible
- Tab order is logical
- No keyboard traps
- Skip links not implemented (single-page app)

### ARIA Labels
**Current**: Minimal (relies on title attributes)

**Future**:
- aria-label for icon-only buttons when sidebar collapsed
- aria-current for active file
- aria-expanded for sidebar state
- role="region" with labels for major sections

---

## Performance Interactions

### Typing Performance
- Preview updates on every keystroke
- React-markdown re-renders efficiently
- No noticeable lag up to ~10,000 characters
- Future: Debounce preview updates for very large documents

### Sidebar Toggle Performance
- CSS transition on width property
- No JavaScript animation
- 60fps smooth animation
- No layout thrashing

### File Switching Performance
- Instant (synchronous state update)
- No loading delay
- Content swap is immediate

---

## Touch Interactions (Future)

### Mobile Considerations
Currently desktop-focused. Future touch interactions:

#### Tap Targets
- Minimum 44x44px for all buttons
- Increased spacing for fat-finger friendliness

#### Gestures
- Swipe right: Open sidebar
- Swipe left: Close sidebar
- Pinch zoom: Adjust preview text size
- Pull to refresh: Reload file list (if synced)

#### Mobile Layout
- Single-pane view (toggle between editor/preview)
- Floating action button for new file
- Bottom sheet for file list
- Native share sheet integration
