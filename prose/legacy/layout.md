# Layout Architecture

## Overall Structure

The Tonguetoquill application uses a flex-based layout system to create a responsive, VSCode-inspired interface.

### Root Container

```tsx
<div className="h-screen flex bg-zinc-900">
```

- Full viewport height (`h-screen`)
- Horizontal flex container
- Dark background as base theme
- No scrolling at root level (overflow handled by children)

---

## Layout Breakdown

### High-Level Structure

```
┌────────────────────────────────────────────────────┐
│                   Full Screen                      │
│  ┌──────┬──────────────────────────────────────┐  │
│  │      │        Top Menu (h-12)               │  │
│  │      ├──────────────────┬───────────────────┤  │
│  │ Side │  Editor Section  │  Preview Section  │  │
│  │ bar  │                  │                   │  │
│  │      │  [Toolbar]       │                   │  │
│  │      │  [Editor]        │   [Preview]       │  │
│  │      │                  │                   │  │
│  └──────┴──────────────────┴───────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## 1. Sidebar Layout

### Container Specifications

```tsx
className="h-screen bg-zinc-900 text-zinc-100
           transition-all duration-300
           flex flex-col overflow-hidden
           ${isExpanded ? 'w-56' : 'w-12'}"
```

#### Dimensions

- **Height**: Full screen (`h-screen`)
- **Width**:
  - Expanded: 224px (`w-56`)
  - Collapsed: 48px (`w-12`)
- **Transition**: 300ms all properties

#### Flex Layout

- **Direction**: Column (`flex-col`)
- **Overflow**: Hidden (prevents content from breaking layout during transitions)

### Internal Structure

```
┌─────────────────┐
│   Header        │ ← Fixed height (h-12)
├─────────────────┤
│                 │
│   File List     │ ← Flex-1 (grows to fill space)
│   (scrollable)  │
│                 │
├─────────────────┤
│   Profile       │ ← Fixed height
│   Settings      │
└─────────────────┘
```

#### Section Breakdown

1. **Header Section**

   ```tsx
   <div className="relative flex items-center h-12 p-1">
   ```

   - Fixed height: 48px
   - Contains hamburger menu and brand title
   - Uses relative positioning for centered title overlay

2. **File List Section**

   ```tsx
   <div className="flex-1 p-2 overflow-y-auto">
   ```

   - Fills available space (`flex-1`)
   - Vertical scroll when content overflows
   - Padding: 8px all sides

3. **Bottom Section**

   ```tsx
   <div className="p-2 border-t border-zinc-700 space-y-1">
   ```

   - Fixed at bottom (no flex-grow)
   - Top border as separator
   - Contains Profile and Settings buttons

### Responsive Behavior

#### Collapsed State (48px width)

- Only icons visible
- Content fades out (opacity-0)
- Icons remain centered
- File list hidden entirely
- Maintains all functionality

#### Expanded State (224px width)

- Full content visible
- Text fades in with animation
- Icons align left with text labels
- File list displays with names
- Smooth width transition

---

## 2. Main Content Area

### Container Specifications

```tsx
<div className="flex-1 flex flex-col">
```

- Fills remaining horizontal space after sidebar
- Vertical flex container for stacking TopMenu and editor panel

### Structure

```
┌─────────────────────────────────────┐
│         Top Menu (h-12)             │
├─────────────────────────────────────┤
│                                     │
│        Split Editor Panel           │
│          (flex-1)                   │
│                                     │
└─────────────────────────────────────┘
```

---

## 3. Top Menu Layout

### Container Specifications

```tsx
<div className="h-12 bg-zinc-800 border-b border-zinc-700
                flex items-center justify-between px-4">
```

#### Dimensions

- Height: 48px (fixed, `h-12`)
- Padding: 16px horizontal

#### Flex Layout

- Direction: Row (default)
- Justify: Space between
- Align: Center vertically

### Internal Structure

```
┌────────────────────────────────────────────────┐
│ [Logo] [Filename]           [Download] [Menu] │
└────────────────────────────────────────────────┘
```

#### Left Section

```tsx
<div className="flex items-center gap-2">
```

- Logo + filename grouping
- Gap: 8px between elements
- Aligned center vertically

#### Right Section

```tsx
<div className="flex items-center gap-2">
```

- Download button + meatball menu
- Gap: 8px between elements
- Aligned center vertically

---

## 4. Split Editor Panel

### Container Specifications

```tsx
<div className="flex-1 flex">
```

- Fills remaining vertical space
- Horizontal flex container
- Creates 50/50 split by default

### Structure

```
┌──────────────────────┬───────────────────────┐
│   Editor Section     │   Preview Section     │
│      (flex-1)        │      (flex-1)         │
│                      │                       │
│  ┌────────────────┐  │  ┌─────────────────┐  │
│  │   Toolbar      │  │  │                 │  │
│  ├────────────────┤  │  │                 │  │
│  │                │  │  │                 │  │
│  │   Editor       │  │  │    Preview      │  │
│  │                │  │  │                 │  │
│  └────────────────┘  │  └─────────────────┘  │
└──────────────────────┴───────────────────────┘
```

---

## 5. Editor Section Layout

### Container Specifications

```tsx
<div className="flex-1 flex flex-col border-r border-zinc-700">
```

#### Flex Layout

- Takes 50% of horizontal space (`flex-1`)
- Vertical flex direction (`flex-col`)
- Right border as visual separator

### Internal Structure

```
┌────────────────────┐
│   Toolbar (h-10)   │ ← Fixed height
├────────────────────┤
│                    │
│   Editor (flex-1)  │ ← Fills remaining space
│                    │
└────────────────────┘
```

#### Toolbar

- Fixed height: 40px (`h-10`)
- Contains formatting buttons and mode toggle
- Sticky at top of editor section

#### Editor Area

- Fills remaining space (`flex-1`)
- Contains MarkdownEditor component
- Scrollable textarea inside

---

## 6. Preview Section Layout

### Container Specifications

```tsx
<div className="flex-1 overflow-auto">
```

#### Flex Layout

- Takes 50% of horizontal space (`flex-1`)
- Allows vertical scrolling (`overflow-auto`)

### Internal Structure

- Single child: MarkdownPreview component
- Preview component fills available space
- Content scrolls vertically when needed

---

## Responsive Considerations

### Current Implementation

The application is designed primarily for desktop use with a minimum recommended width to accommodate the split-panel layout.

### Breakpoint Behavior

#### Minimum Usable Width

- Sidebar collapsed: 48px
- Editor section: ~400px minimum recommended
- Preview section: ~400px minimum recommended
- **Total minimum**: ~850px for comfortable use

#### Mobile/Tablet Considerations (Future)

Potential responsive improvements for smaller screens:

- Switch to tabbed view (Editor OR Preview, not both)
- Sidebar becomes drawer/overlay
- TopMenu condensed/hamburger menu
- Full-width editor and preview

### Overflow Handling

#### Vertical Overflow

- **Sidebar File List**: Scrollable (`overflow-y-auto`)
- **Editor**: Textarea with natural scroll
- **Preview**: Container scrollable (`overflow-auto`)

#### Horizontal Overflow

- **Sidebar**: Hidden (`overflow-hidden`)
- **TopMenu**: Text truncation on filename if very long
- **File Names**: Truncate with ellipsis (`.truncate`)
- **Editor**: Wraps text (no horizontal scroll by default)
- **Preview**: Prose max-width prevents excessive line length

---

## Z-Index Layers

### Stacking Order (Implicit)

1. **Base Layer**: Main layout (Sidebar, Editor, Preview)
2. **Overlay Layer**: Popovers, Dropdowns
3. **Toast Layer**: Notification toasts (highest)

### Managed by Components

- Popovers and dropdowns use shadcn/ui defaults
- Toaster component manages toast z-index
- No custom z-index values in application code

---

## Spacing & Gutters

### Component Gaps

```
Sidebar to Main Content: 0 (adjacent, no gap)
Editor to Preview: 0 (border only, no gap)
TopMenu Internal: 8px (gap-2)
Toolbar Items: 4px (gap-1)
Sidebar Items: 4px vertical (space-y-1)
```

### Content Padding

```
Sidebar Container: 8px (p-2)
Sidebar Header: 4px (p-1)
TopMenu: 16px horizontal (px-4)
Toolbar: 8px horizontal (px-2)
Editor: 16px all sides (p-4)
Preview: 24px all sides (p-6)
Popover Content: 16px all sides (p-4)
```

### Border Widths

- All borders: 1px (default Tailwind)
- Border colors vary by component (see Design System)

---

## Performance Considerations

### Layout Optimization

- Fixed heights where possible (TopMenu, Toolbar, Sidebar header)
- Flex-grow for dynamic content areas
- Overflow auto only where needed (prevents unnecessary scroll containers)
- Will-change not used (transitions are simple enough)

### Reflow Prevention

- Sidebar width transition isolated to sidebar container
- Content areas use flex-1 to adapt naturally
- No layout shifts on interaction

### Rendering

- Virtual scrolling not needed (file lists typically small)
- Preview renders on every keystroke (acceptable with react-markdown optimization)
- No unnecessary nested scrolling containers

---

## Accessibility Layout Features

### Focus Management

- Logical tab order: Sidebar → TopMenu → Toolbar → Editor
- All interactive elements keyboard accessible
- Focus visible on all controls

### Semantic Structure

- Div-based layout (functional, not semantic)
- Future: Consider adding landmark regions (nav, main, aside)

### Screen Reader Considerations

- Current: Relies on visual layout
- Future: Add ARIA labels for regions
- Future: Add screen reader announcements for file switching

---

## Layout Constraints

### Fixed Elements

- Sidebar width: 48px or 224px (no in-between)
- TopMenu height: 48px
- Toolbar height: 40px
- All fixed values use Tailwind spacing scale

### Flexible Elements

- Main content width: Adapts to sidebar state
- Editor/Preview width: Always equal (both flex-1)
- Content height: Fills available vertical space

### Immutable Proportions

- Editor:Preview ratio is always 1:1 horizontally
- Sidebar never grows vertically (always full height)
- TopMenu never wraps (assumes sufficient horizontal space)
