# UI Components Specification

## Overview

Component behavior specifications for Tonguetoquill, defining props, states, interactions, and accessibility requirements. All visual design (colors, typography, spacing, etc.) is defined in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

Components support mobile-responsive layouts and Section 508 accessibility compliance.

## Layout Components

## Layout Components

### Sidebar Component

**Implementation**: Uses shadcn-svelte's Sheet component for drawer functionality on mobile, with custom layout structure

**Purpose**: Collapsible navigation for document management, user profile, and settings

**States**:
- Desktop Expanded: 224px width, full content visible
- Desktop Collapsed: 48px width, icons only
- Mobile: Full-screen drawer overlay (see [DESIGN_SYSTEM.md - Navigation Patterns](./DESIGN_SYSTEM.md#navigation-patterns))

**Structure**:

**Header Section**:
- Branding: "Tonguetoquill" text logo with feather icon (from shadcn-svelte's Lucide icons)
- Collapse toggle: Hamburger menu icon
- Height: 48px (matches TopMenu)

**Document List Section**:
- "New Document" button: Full-width, left-aligned with plus (+) icon
- Document items: Full-width, left-aligned with document icon + filename
- Selected state: Highlighted background with left border accent
- Filename: Truncates with ellipsis if too long
- Vertical scroll for overflow

**Footer Section**:
- Position: Sticky bottom, always visible
- Profile button: User icon + "Profile" label
- Settings button: Gear icon + "Settings" label

**Collapsed State**:
- Width: 48px
- Icons only (no text labels)
- Tooltips show labels on hover (using shadcn-svelte's Tooltip component)

**Mobile Behavior**:
- Renders as full-screen drawer overlay using shadcn-svelte's Sheet component
- Backdrop dismissal
- Hamburger menu trigger in TopMenu

**Accessibility**: Navigation landmark, ARIA labels, keyboard navigation, focus trap in drawer mode

**Visual Reference**: See `visuals/sidebar_expanded.png` and `visuals/settings.png`

---

### TopMenu Component

**Implementation**: Uses shadcn-svelte's Button components for actions and Dropdown Menu for the more actions menu

**Purpose**: Header bar displaying document information and actions

**Structure**:

**Left Section**:
- Brand icon: Feather/pen icon (20px, from shadcn-svelte's Lucide icons)
- Filename display: Current document name (e.g., "welcome.md")
- Unsaved indicator: Asterisk (*) or dot when document has unsaved changes
- Truncation: Ellipsis for long filenames on mobile

**Right Section - Action Buttons**:
- Download button: Download icon with optional label
- More actions button: Three-dot vertical menu icon (kebab menu)

**More Actions Menu Items**:
- Keyboard Shortcuts: Opens keyboard shortcuts dialog (see [DESIGN_SYSTEM.md - Keyboard Shortcuts](./DESIGN_SYSTEM.md#keyboard-shortcuts))
- About: Application information
- Terms of Use: Legal terms
- Privacy Policy: Privacy information

**Mobile Adaptation**:
- Filename truncates with ellipsis
- Download label may hide (icon only)
- Minimum 48px height for touch targets
- Menu items have 48px minimum height

**Accessibility**: Banner landmark, visible labels or ARIA labels, save status announced to screen readers

**Visual Reference**: See `visuals/more_actions.png`

---

## Editor Components

### EditorToolbar Component

**Implementation**: Uses shadcn-svelte's Button components with Lucide icons and Tooltip components for keyboard shortcuts

**Purpose**: Markdown formatting controls

**Formatting Tools**:
- **Text**: Bold, Italic, Strikethrough
- **Blocks**: Code block, Quote
- **Lists**: Bullet list, Numbered list
- **Links**: Insert/edit link

**Button Groups** (separated by dividers using shadcn-svelte's Separator component):
- Group 1: Bold, Italic, Strikethrough
- Group 2: Code block, Quote
- Group 3: Bullet list, Numbered list
- Group 4: Link

**Button States**:
- Default: Transparent background
- Hover: Highlighted background
- Active: Highlighted when formatting is applied at cursor position
- Disabled: Reduced opacity

**Keyboard Shortcuts**:
Buttons show tooltips with keyboard shortcuts using shadcn-svelte's Tooltip component (see [DESIGN_SYSTEM.md - Keyboard Shortcuts](./DESIGN_SYSTEM.md#keyboard-shortcuts))

**Mobile Adaptation**:
- Horizontal scroll if needed for overflow
- 44px minimum touch targets (buttons scale from 32px on desktop)
- May condense to most-used tools on very small screens

**Accessibility**: Toolbar role, button labels (text + ARIA), keyboard shortcuts announced in tooltips

---

### MarkdownEditor Component

**Purpose**: Text input area for markdown editing

**Implementation**: CodeMirror 6 with custom extensions. See [MARKDOWN_EDITOR.md](./MARKDOWN_EDITOR.md) for complete editor architecture, custom language mode for extended markdown syntax, folding, and accessibility features.

**Structure**:
- Full-height editor area
- Monospace font (see [DESIGN_SYSTEM.md - Typography](./DESIGN_SYSTEM.md#typography))
- Padding: 16px all sides
- Line numbers gutter
- Code folding gutter

**Cursor & Selection**:
- Visible cursor with branded color
- Text selection highlighting
- Active line subtle background

**Features**:
- Syntax highlighting for markdown and metadata blocks
- Code folding for YAML frontmatter and inline metadata
- Auto-indent on Enter
- Tab key inserts spaces (2 or 4 spaces)
- Undo/redo support
- Auto-completion for SCOPE/QUILL keywords
- Auto-save integration (see [DESIGN_SYSTEM.md - Auto-Save](./DESIGN_SYSTEM.md#auto-save-behavior))

**Mobile Optimization**:
- 16px minimum font size (prevents zoom on focus)
- Virtual keyboard handling
- Touch-friendly text selection
- 44px minimum touch targets for fold indicators
- Auto-save on blur (if enabled)

**Accessibility**: 
- Labeled editor region with ARIA role
- Keyboard shortcuts work as expected (see [DESIGN_SYSTEM.md - Keyboard Shortcuts](./DESIGN_SYSTEM.md#keyboard-shortcuts))
- Screen reader support
- Status announcements for save operations

---

### MarkdownPreview Component

**Purpose**: Rendered markdown output display

**Structure**:
- White background for professional document appearance
- Full height in split-view layout
- Generous padding (40px horizontal, 48px vertical on desktop; 16px on mobile)
- Max width: 800px for optimal readability, centered

**Document Styling**:
Renders standard markdown with professional typography:
- Headings with hierarchy
- Paragraphs with appropriate spacing
- Lists (bullet and numbered)
- Blockquotes with left border accent
- Inline code and code blocks
- Links
- Images (responsive, max-width 100%)
- Tables (full width, bordered)
- Horizontal rules

For specific typography, see [DESIGN_SYSTEM.md - Typography](./DESIGN_SYSTEM.md#typography)

**Rendering**:
- Debounced updates (renders after user stops typing)
- Scroll position preservation during updates
- Loading state: Shows previous render to avoid flashes (see [DESIGN_SYSTEM.md - Loading States](./DESIGN_SYSTEM.md#loading-states))

**Mobile Optimization**:
- Touch scrolling
- Responsive typography scaling
- Zoom enabled for accessibility
- Horizontal scroll for wide tables
- Reduced padding (16px)

**Accessibility**: 
- Document landmark role
- Proper heading hierarchy
- Image alt text required
- Color contrast compliance
- Keyboard navigation support

---

## UI Component Library

All UI components are built using [shadcn-svelte](https://www.shadcn-svelte.com/), a component library that provides accessible, customizable components built on Radix UI primitives. The library includes built-in icon support (via Lucide) and toast notifications, eliminating the need for separate icon and notification packages.

### Button Component

**Variants**: Primary, Secondary, Ghost, Destructive  
**Sizes**: Small, Medium, Large, Icon-only  
**States**: Default, Hover, Active, Focus, Disabled, Loading

For sizing details, see [DESIGN_SYSTEM.md - Component Sizing](./DESIGN_SYSTEM.md#component-sizing)

**Variant Purposes**:
- **Primary**: Main actions (save, submit, create)
- **Secondary**: Supporting actions
- **Ghost**: Subtle actions (cancel, tertiary options)
- **Destructive**: Dangerous actions (delete, discard)

**Icon Integration**:
- Icons provided by shadcn-svelte's built-in Lucide icon support
- Icon can be placed left or right of text
- Icon-only buttons for compact spaces (must have ARIA label)
- Icon sizes scale with button size

**States**:
- **Focus**: Visible outline for keyboard navigation (see [DESIGN_SYSTEM.md - Focus Indicators](./DESIGN_SYSTEM.md#focus-indicators))
- **Disabled**: Reduced opacity, not interactive, cursor indicates not-allowed
- **Loading**: Spinner replaces icon, preserves button width to prevent layout shift

**Accessibility**: Focus indicators, disabled state communicated to assistive tech, loading state announced

---

### Dialog Component

**Implementation**: Uses shadcn-svelte's Dialog component with built-in accessibility features

**Purpose**: Modal dialogs for confirmations, forms, and alerts

**Structure**:

**Header**:
- Title (clear, descriptive)
- Close button (X icon in top-right corner)

**Content Area**:
- Main dialog content
- Form fields (if applicable)
- Scrollable if content exceeds viewport height

**Footer** (optional):
- Action buttons (right-aligned)
- Primary action button (typically Primary variant)
- Secondary/cancel button (typically Ghost variant)

**Settings Dialog**:
The settings dialog contains user preferences:
- **Auto-save**: Toggle to enable/disable auto-save (see [DESIGN_SYSTEM.md - Auto-Save](./DESIGN_SYSTEM.md#auto-save-behavior))

**Toggle Switch Component**:
- Uses shadcn-svelte's Switch component
- Clear on/off states
- Label describes what the toggle controls

**Backdrop**:
- Semi-transparent overlay
- Click to dismiss (unless dialog requires explicit action)

**Mobile Adaptation**:
See [DESIGN_SYSTEM.md - Navigation Patterns](./DESIGN_SYSTEM.md#navigation-patterns) for breakpoint-specific behavior:
- Mobile (<640px): Full-screen or bottom sheet using shadcn-svelte's Drawer component
- Tablet/Desktop (≥640px): Centered modal with backdrop

**Animation**:
- See [DESIGN_SYSTEM.md - Transitions & Animations](./DESIGN_SYSTEM.md#transitions--animations) for timing and easing
- Respect `prefers-reduced-motion` setting

**Accessibility**: Dialog role, modal attribute, focus trap when open, ESC key dismissal, focus returns to trigger on close

---

### Dropdown Menu Component

**Implementation**: Uses shadcn-svelte's Dropdown Menu component with built-in keyboard navigation and accessibility

**Purpose**: Contextual menus for actions and options

**Structure**:
- Anchored to trigger element (button, icon, etc.)
- Appears on click/tap
- Dismisses on selection, click outside, or ESC key

**Menu Items**:
- **Standard**: Icon + label (icons from shadcn-svelte's Lucide icon support)
- **Destructive**: For dangerous actions (uses destructive styling)
- **Disabled**: Not interactive, reduced opacity
- **Separator**: Divider between groups

**Keyboard Shortcuts Display**:
Menu items can show keyboard shortcuts aligned to the right (e.g., "Save" with "Ctrl+S")

**Positioning**:
- Smart positioning: Flips if near viewport edge to stay in viewport
- Mobile: May use bottom sheet pattern at small breakpoints (see [DESIGN_SYSTEM.md - Navigation Patterns](./DESIGN_SYSTEM.md#navigation-patterns))

**Accessibility**: Menu role, arrow key navigation, type-ahead search, focus management

---

### Toast Component

**Implementation**: Uses shadcn-svelte's Sonner toast component with built-in accessibility and stacking

**Purpose**: Temporary notification messages

**Types**: Success, Error, Warning, Info, Classification Banner

**Structure**:
- Icon indicating message type (from shadcn-svelte's Lucide icon support)
- Title (brief, clear)
- Optional message (additional context)
- Optional close button (for persistent toasts)

**Variants**:
- **Success**: Positive actions (save successful, document created)
- **Error**: Failed operations, validation errors
- **Warning**: Important notices, potential issues
- **Info**: General information
- **Classification Banner**: Special persistent toast for document classification (see [DESIGN_SYSTEM.md - Classification Banner](./DESIGN_SYSTEM.md#classification-banner))

**Behavior**:
- Auto-dismiss timing: 5 seconds (success/info), 7 seconds (warning/error)
- Classification banner: Persistent (no auto-dismiss)
- Manual dismiss: Close button
- Pause auto-dismiss on hover
- Multiple toasts stack vertically

**Positioning**:
- Desktop: Top-right corner
- Mobile: Bottom or top-center
- Classification banner: Always top-center

**Accessibility**: Status/alert roles, ARIA live regions, screen reader announcements

---

## Responsive Patterns

See [DESIGN_SYSTEM.md - Navigation Patterns](./DESIGN_SYSTEM.md#navigation-patterns) and [Breakpoint Behavior](./DESIGN_SYSTEM.md#breakpoint-behavior) for complete responsive specifications.

### Layout Adaptations

**Desktop (≥1024px)**: Persistent sidebar + split editor/preview  
**Tablet (768px-1023px)**: Drawer sidebar + split or tabbed view  
**Mobile (<768px)**: Drawer sidebar + tabbed editor OR preview

### Component State Management

- Use Svelte 5 runes for component-local state
- Use global stores for cross-component state  
- Context API for dependency injection

See [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) for detailed patterns.

---

## Accessibility Summary

All components must meet Section 508 and WCAG 2.1 Level AA requirements. See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for complete requirements.

**Key Requirements**:
- Keyboard accessible (no mouse required)
- Screen reader compatible (proper ARIA, semantic HTML)
- Sufficient color contrast (see [DESIGN_SYSTEM.md - Text Contrast](./DESIGN_SYSTEM.md#text-contrast))
- Focus indicators visible (see [DESIGN_SYSTEM.md - Focus Indicators](./DESIGN_SYSTEM.md#focus-indicators))
- Touch targets 44px minimum (see [DESIGN_SYSTEM.md - Component Sizing](./DESIGN_SYSTEM.md#component-sizing))
- Forms properly labeled (see [DESIGN_SYSTEM.md - Form Validation](./DESIGN_SYSTEM.md#form-validation-strategy))
- Error messages clear and actionable
- Respect `prefers-reduced-motion` (see [DESIGN_SYSTEM.md - Reduced Motion](./DESIGN_SYSTEM.md#reduced-motion))

---

*For all visual design specifications (colors, spacing, typography, shadows, animations, interactive states), see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)*
