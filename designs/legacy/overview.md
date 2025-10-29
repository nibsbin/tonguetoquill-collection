# Tonguetoquill - Design Overview

## Introduction

Tonguetoquill is a modern, VSCode-inspired markdown editor web application that provides a split-screen editing experience with real-time preview capabilities. The application emphasizes clean design, intuitive navigation, and a professional developer-focused aesthetic.

## Design Philosophy

### Core Principles

- **Developer-First**: Interface inspired by VSCode with familiar patterns and workflows
- **Minimal Distraction**: Clean, focused interface that prioritizes content creation
- **Real-Time Feedback**: Live preview that updates as you type
- **Professional Aesthetic**: Dark-themed interface with carefully chosen color palette
- **Responsive Interactions**: Smooth transitions and animations for enhanced UX

### Visual Identity

- **Primary Brand Color**: Blue (#355e93) - Used for accents and interactive elements
- **Base Theme**: Dark mode as default (zinc-900 background)
- **Typography**: Lato for UI elements, monospace for code/markdown editing
- **Logo**: Quillmark brand logo (displayed in top menu); logo.svg in `designs/frontend/visuals/logo.svg`

## Application Architecture

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                       TopMenu                            │
│  [Logo] [Docname]              [Download] [More Menu]  │
├──────┬──────────────────────────┬────────────────────────┤
│      │    EditorToolbar         │                        │
│      │  [Format Tools] [Mode]   │                        │
│ Side ├──────────────────────────┤    Preview Pane        │
│ bar  │                          │                        │
│      │   Markdown Editor        │    (Live Preview)      │
│      │   (Textarea)             │                        │
│      │                          │                        │
└──────┴──────────────────────────┴────────────────────────┘
```

### Component Hierarchy

1. **App** (Root container)
   - **Sidebar** (Left panel, collapsible)
     - Hamburger menu toggle
     - Brand title
     - File list with management
     - User profile button
     - Settings popover
   - **Main Content Area**
     - **TopMenu** (Header bar)
       - Logo
       - Active filename display
       - Download button
       - Meatball menu (Share, Import, Info, Legal)
     - **Split Editor Panel**
       - **Editor Section** (Left half)
         - EditorToolbar (Formatting buttons + mode toggle)
         - MarkdownEditor (Textarea)
       - **Preview Section** (Right half)
         - MarkdownPreview (Rendered HTML)

## Key Features

### File Management

- Create new markdown files
- Switch between multiple open files
- Delete files (with protection for last file)
- Active file highlighting in sidebar
- File list in collapsible sidebar

### Editing Experience

- Real-time markdown preview
- Rich formatting toolbar with common markdown operations:
  - Bold, Italic, Strikethrough
  - Code blocks, Quotes
  - Bullet lists, Numbered lists
  - Links
- Dual editing modes: Markdown (raw) and Wizard (future feature)
- Monospace font for editor clarity

### Theme & Customization

- Dark theme by default
- Theme toggle in settings (future: light mode support)
- Auto-save toggle
- Line numbers toggle
- Settings accessible via gear icon

### Export & Sharing

- Download files as .md format
- Share via native share API or clipboard copy
- Import markdown files (future feature)

## Target Audience

- Developers and technical writers
- Content creators who work with markdown
- Users familiar with VSCode-style interfaces
- Professionals who need clean, distraction-free writing environments

## Technical Stack

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS v4.0 with custom design tokens
- **UI Components**: shadcn/ui component library
- **Icons**: Lucide React
- **Markdown Rendering**: react-markdown with remark-gfm (GitHub Flavored Markdown)
- **Animations**: Motion (formerly Framer Motion)
- **Notifications**: Sonner toast library

## Browser Requirements

- Modern browsers with ES6+ support
- Native Web Share API support (optional, falls back to clipboard)
- LocalStorage for settings persistence (future enhancement)
