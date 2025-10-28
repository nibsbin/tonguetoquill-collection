# UI Components Specification

## Overview

Component specifications for TongueToQuill, adapted for SvelteKit 5 with mobile support and accessibility. Components follow the VSCode-inspired aesthetic while supporting modern responsive design patterns.

## Visual Design Language

### Color Scheme

**Primary Dark Theme**:
- **Background**: zinc-900 (#18181b) - Main application background
- **Elevated Surfaces**: zinc-800 (#27272a) - Cards, modals, sidebar
- **Borders**: zinc-700 (#3f3f46) - Subtle separators
- **Hover States**: zinc-700 background
- **Active States**: zinc-600 background

**Text Colors**:
- **Primary**: zinc-100 (#f4f4f5) - Main text, high contrast
- **Secondary**: zinc-200 (#e4e4e7) - Body text
- **Tertiary**: zinc-300 (#d4d4d8) - Labels
- **Muted**: zinc-400 (#a1a1aa) - Placeholder, disabled
- **Subtle**: zinc-500 (#71717a) - Very subtle text

**Accent Color**:
- **USAF Blue**: #355e93 - Primary actions, links, selected states, focus indicators
- **USAF Blue Hover**: #2a4a74 - Darker for hover states
- **USAF Blue Active**: #1f3555 - Even darker for active states

**Semantic Colors**:
- **Success**: Green-500 (#22c55e) - Success messages, confirmations
- **Error**: Red-500 (#ef4444) - Errors, destructive actions
- **Warning**: Yellow-500 (#eab308) - Warnings, cautions
- **Info**: Blue-500 (#3b82f6) - Information, neutral notices

**Preview/Document Colors**:
- **Background**: White (#ffffff) - Professional document background
- **Text**: Near-black (#1a1a1a) - High readability
- **Secondary Text**: Dark gray (#2a2a2a) - Body content

### Typography System

**Font Families**:
- **UI**: System font stack (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)
- **Editor**: Monospace (JetBrains Mono, Fira Code, Consolas, monospace)
- **Preview**: Serif (Georgia, "Times New Roman", serif)

**Font Sizes**:
- **xs**: 12px - Small labels, metadata
- **sm**: 14px - Secondary text, menu items
- **base**: 16px - Body text, inputs
- **lg**: 18px - Emphasized text
- **xl**: 20px - Headings, titles
- **2xl**: 24px - Large headings
- **3xl**: 32px - Page titles

**Font Weights**:
- **Regular**: 400 - Body text
- **Medium**: 500 - Buttons, emphasized text
- **Semibold**: 600 - Subheadings
- **Bold**: 700 - Headings

### Spacing & Sizing

**Base Unit**: 4px (0.25rem)

**Common Spacing**:
- 2px - Minimal gaps
- 4px - Tight spacing
- 8px - Standard gap between related items
- 12px - Medium spacing
- 16px - Standard padding
- 24px - Generous padding
- 32px - Section spacing
- 48px - Large section spacing

**Component Heights**:
- **Top Menu**: 48px
- **Toolbar**: 40px
- **Button Small**: 32px
- **Button Medium**: 40px
- **Button Large**: 48px
- **Input Field**: 40px (48px on mobile)
- **Sidebar Expanded**: 224px width
- **Sidebar Collapsed**: 48px width

### Border & Radius

**Border Widths**:
- **Default**: 1px - Standard borders
- **Thick**: 2px - Focus indicators, selected states
- **Accent**: 4px - Left accent borders (blockquotes, toasts)

**Border Radius**:
- **Small**: 4px - Small buttons, inner elements
- **Medium**: 6px - Buttons, inputs
- **Large**: 8px - Cards, dropdowns
- **XL**: 12px - Modals, dialogs
- **Full**: 9999px - Pills, circles

### Shadows & Elevation

**Shadow Levels**:
- **None**: No shadow - Flat elements
- **Small**: Subtle depth - Hovered elements
- **Medium**: Standard elevation - Dropdowns, tooltips
- **Large**: Prominent - Modals, toasts
- **XL**: Maximum - Critical overlays

**Z-Index Layers**:
- **Base**: 0 - Content
- **Dropdown**: 10 - Menus
- **Sticky**: 20 - Fixed headers
- **Modal**: 30 - Dialogs
- **Toast**: 40 - Notifications
- **Tooltip**: 50 - Tooltips

### Icons

**Icon System**: Lucide icon set (outline style)

**Icon Sizes**:
- **XS**: 12px - Inline indicators
- **SM**: 16px - Menu items, small buttons
- **MD**: 20px - Standard buttons, toolbar
- **LG**: 24px - Large buttons, headers
- **XL**: 32px - Features, empty states

**Icon Colors**:
- Inherit text color by default
- zinc-400 for inactive/muted
- zinc-100 for active/hover
- Semantic colors for status icons

**Icon Usage**:
- Stroke width: 2px (consistent)
- Always paired with accessible labels
- Aligned with text baseline
- Consistent spacing (8px gap to text)

## Layout Components

### Sidebar Component

**Purpose**: Collapsible navigation for file management, user profile, and settings

**States**:
- Desktop Expanded: 224px width, full content visible
- Desktop Collapsed: 48px width, icons only
- Mobile: Full-screen drawer overlay

**Visual Design**:
- Background: Dark zinc-900 (#18181b) matching VSCode aesthetic
- Subtle border: Right edge separator in zinc-800
- Rounded corners: None (full-height panel)
- Typography: System font, 14px for labels, 16px for file names

**Header Section**:
- Branding: "Tonguetoquill" text logo with feather icon
- Logo styling: White text with brand icon, left-aligned
- Collapse toggle: Hamburger menu icon (three horizontal lines)
- Height: 48px, consistent with TopMenu
- Border: Bottom border in zinc-800 for separation

**File List Section**:
- "New File" button: Full-width, left-aligned with plus (+) icon
- Button styling: Ghost/subtle button with zinc-700 background on hover
- File items: Full-width, left-aligned with file icon + filename
- Selected state: zinc-800 background, subtle left border accent in USAF blue
- Hover state: zinc-800 background
- Icon: Document icon (16px) before filename
- Filename: Truncates with ellipsis if too long
- Scrolling: Vertical scroll for overflow, custom scrollbar in zinc-700

**Footer Section**:
- Position: Sticky bottom, always visible
- Border: Top border in zinc-800
- Profile button: User icon + "Profile" label, full-width
- Settings button: Gear icon + "Settings" label, full-width
- Button styling: Ghost style, zinc-700 background on hover
- Icon size: 20px
- Spacing: 8px between icon and label

**Collapsed State**:
- Width: 48px
- Shows: Icons only (no text labels)
- Icon centering: Icons centered horizontally
- Tooltip: Shows label on hover
- Profile/Settings: Icon-only at bottom

**Mobile Behavior**:
- Renders as drawer/modal overlay
- Backdrop dismissal
- Fixed position over content

**Accessibility**: Navigation landmark, ARIA labels, keyboard navigation, focus trap in drawer mode

See ![page design screenshot](visuals/sidebar_expanded.png) and ![sidebar expanded screenshot](visuals/sidebar_expanded.png) for visual references of the sidebar in collapsed and expanded states.

See ![settings popover screenshot](visuals/settings.png) for settings options.

---

### TopMenu Component

**Purpose**: Header bar displaying file information and document actions

**Visual Design**:
- Background: Dark zinc-900, matches sidebar
- Height: 48px minimum for touch targets
- Border: Bottom border in zinc-800 for separation
- Layout: Flexbox with space-between alignment

**Left Section**:
- Feather/pen icon: Brand icon, 20px size
- Filename display: Current file name (e.g., "welcome.md")
- Filename styling: White text, 16px, medium weight
- Truncation: Ellipsis for long filenames on mobile
- Spacing: 12px gap between icon and filename

**Right Section - Action Buttons**:
- Download button: Download icon (20px) with "Download" label or icon-only
- More actions button: Three-dot vertical menu icon (meatball/kebab menu)
- Button styling: Ghost style, zinc-700 background on hover
- Icon color: zinc-400 default, zinc-100 on hover
- Button spacing: 8px gap between buttons
- Padding: 8px horizontal, 8px vertical for touch targets

**More Actions Popover Menu**:
- Position: Anchored to more actions button, right-aligned
- Background: zinc-800 with subtle shadow/elevation
- Border: 1px solid zinc-700
- Border radius: 8px (medium)
- Width: ~200px minimum
- Padding: 4px vertical

**Menu Items**:
- Share: Share icon + "Share" label
- Import File: Upload/folder icon + "Import File" label
- Download Info: Info icon + "Download Info" label (separator after)
- Keyboard Shortcuts: Keyboard icon + "Keyboard Shortcuts" label
- About Us: Info/circle icon + "About Us" label
- Terms of Use: Document icon + "Terms of Use" label
- Privacy Policy: Shield/lock icon + "Privacy Policy" label

**Menu Item Styling**:
- Full width with 8px padding vertical, 12px horizontal
- Text: zinc-100, 14px
- Icons: 16px, left-aligned with 8px gap to text
- Hover: zinc-700 background
- Separator: Thin line in zinc-700 between groups
- Cursor: Pointer

**Mobile Adaptation**:
- Logo scales appropriately
- Filename truncates with ellipsis
- Download label may hide, showing icon only
- Minimum 48px height for touch
- Menu items have 48px height minimum

**Accessibility**: Banner landmark, visible labels or ARIA labels, announced unsaved state

See ![more actions screenshot](visuals/more_actions.png) for visual reference of the top menu and expanded "more actions" popover menu. We should have feature parity.

---

## Editor Components

### EditorToolbar Component

**Purpose**: Formatting controls and editor mode selection

**Visual Design**:
- Background: zinc-800 (slightly elevated from editor)
- Height: 40px
- Border: Bottom border in zinc-700
- Layout: Horizontal row with button groups

**Formatting Tools**:
- Text formatting: Bold, Italic, Strikethrough
- Blocks: Code, Quote
- Lists: Bullet, Numbered
- Links: Insert link

**Button Groups**:
- Group 1 (Text): Bold (B), Italic (I), Strikethrough (S)
- Group 2 (Format): Code blocks icon, Quote icon
- Group 3 (Lists): Bullet list icon, Numbered list icon
- Group 4 (Links): Link icon
- Separators: 1px vertical line in zinc-700 between groups

**Button Styling**:
- Size: 32x32px with 20px icons
- Background: Transparent default, zinc-700 on hover, zinc-600 active
- Icon color: zinc-400 default, zinc-100 on hover/active
- Border radius: 4px (small)
- Spacing: 2px gap between buttons in group, 8px gap between groups
- Active state: zinc-600 background for currently applied formatting

**Mode Toggle Section**:
- Position: Right side of toolbar
- Modes: "Markdown" | "Wizard" (future)
- Toggle style: Segmented control / button group
- Active mode: USAF blue (#355e93) background
- Inactive mode: Transparent with zinc-400 text
- Border radius: 6px for group, 4px for individual buttons
- Font size: 14px

**Icons**:
- Style: Lucide icon set, outline style
- Size: 20px for all toolbar icons
- Stroke width: 2px
- Color: Inherits from button state

**Mobile Adaptation**:
- Horizontal scroll for overflow
- Priority grouping
- 44px minimum touch targets
- Sticky positioning

**Accessibility**: Toolbar role, button labels, keyboard shortcuts announced

---

### MarkdownEditor Component

**Purpose**: Text input area for raw markdown editing

**Visual Design**:
- Background: zinc-900 (main editor background)
- Text color: zinc-100 (high contrast for readability)
- Font: Monospace (JetBrains Mono, Fira Code, or system monospace)
- Font size: 14px (16px on mobile to prevent zoom)
- Line height: 1.6 for comfortable reading
- Padding: 16px all sides
- Border: None (seamless with layout)

**Line Numbers** (when enabled):
- Position: Left gutter, 40px width
- Background: zinc-800
- Text color: zinc-500
- Font: Same monospace as editor
- Alignment: Right-aligned numbers
- Padding: 4px right
- Border: 1px right border in zinc-700

**Syntax Highlighting** (optional):
- Headings: Bold, slightly larger, USAF blue (#355e93)
- Bold text: Bold weight
- Italic text: Italic style
- Code inline: zinc-700 background, zinc-300 text
- Links: USAF blue, underlined on hover
- Lists: Bullet/number in zinc-400
- Blockquotes: Left border accent in zinc-600

**Cursor & Selection**:
- Cursor: 2px width, USAF blue color
- Selection: USAF blue with 30% opacity background
- Active line: Subtle zinc-800 background highlight

**Features**:
- Syntax highlighting (optional)
- Line numbers (toggleable)
- Auto-indent
- Tab handling
- Undo/redo support

**Mobile Optimization**:
- 18px minimum font (prevents zoom)
- Virtual keyboard handling
- Touch selection
- Auto-save on blur

**Scrolling**:
- Custom scrollbar: zinc-700 track, zinc-600 thumb
- Smooth scrolling
- Scroll sync with preview (optional)

**Accessibility**: Labeled editor region, keyboard shortcuts, status announcements

---

### MarkdownPreview Component

**Purpose**: Rendered document output display

**Visual Design**:
- Background: White (#ffffff) for professional document appearance
- Container: Full height, right panel in split view
- Padding: 40px horizontal, 48px vertical (generous margins like printed page)
- Max width: 800px (optimal reading width), centered
- Shadow: Subtle shadow if on dark background

**Typography**:
- Font: Serif stack (Georgia, Times New Roman, serif) for professional look
- Base size: 16px
- Line height: 1.75 for long-form readability
- Headings: Scaled type scale (h1: 32px, h2: 24px, h3: 20px, h4: 18px)
- Heading color: Near-black (#1a1a1a)
- Body text: Dark gray (#2a2a2a)

**Document Styling**:
- Headings: Bold weight, generous margin (24px top, 12px bottom)
- Paragraphs: 16px bottom margin
- Lists: 8px item spacing, 16px left indent
- Blockquotes: Left border (4px USAF blue), 16px left padding, italic
- Code inline: Light gray background (#f5f5f5), rounded corners
- Code blocks: Dark background (#2a2a2a), light text, syntax highlighting
- Links: USAF blue (#355e93), underline on hover
- Images: Max width 100%, centered, 16px margin
- Tables: Full width, bordered cells, alternating row colors
- Horizontal rules: 1px solid light gray (#e5e5e5)

**Quillmark Enhancements**:
- Letterhead: Top section with official formatting
- Signature blocks: Properly spaced and aligned
- Classification markings: Header/footer styling
- Date formatting: Aligned per military standards

**Rendering**:
- Quillmark for professional output
- Markdown fallback renderer
- Debounced updates
- Scroll preservation

**Mobile Optimization**:
- Touch scrolling
- Responsive typography
- Zoom enabled
- Horizontal scroll for tables
- Reduced padding (16px) on mobile

**Scrolling**:
- Smooth scrolling
- Custom scrollbar on desktop
- Native scrolling on mobile

**Accessibility**: Document landmark, heading hierarchy, image alt text, color contrast

---

## UI Component Library

### Button Component

**Variants**: Primary, Secondary, Ghost, Destructive
**Sizes**: Small, Medium, Large, Icon-only
**States**: Default, Hover, Active, Focus, Disabled, Loading

**Visual Design**:

**Primary Variant**:
- Background: USAF blue (#355e93)
- Text: White
- Hover: Darker blue (#2a4a74)
- Active: Even darker (#1f3555)
- Border: None
- Shadow: Subtle on hover

**Secondary Variant**:
- Background: zinc-700
- Text: zinc-100
- Hover: zinc-600
- Active: zinc-500
- Border: None

**Ghost Variant**:
- Background: Transparent
- Text: zinc-300
- Hover: zinc-800 background
- Active: zinc-700 background
- Border: None

**Destructive Variant**:
- Background: Red-600
- Text: White
- Hover: Red-700
- Active: Red-800
- Border: None

**Size Specifications**:
- Small: 32px height, 12px horizontal padding, 14px font
- Medium: 40px height, 16px horizontal padding, 16px font
- Large: 48px height, 24px horizontal padding, 18px font
- Icon-only: Square (32px, 40px, or 48px), centered icon

**Common Styling**:
- Border radius: 6px (medium)
- Font weight: 500 (medium)
- Transition: All properties 150ms ease
- Cursor: Pointer (default/hover), not-allowed (disabled)

**Icon Integration**:
- Icon size: 20px (medium button), 16px (small), 24px (large)
- Icon position: Left or right of text, 8px gap
- Icon-only: Centered, no text

**States**:
- Focus: 2px solid outline in USAF blue, 2px offset
- Disabled: 50% opacity, no hover effects, not-allowed cursor
- Loading: Spinner icon, disabled interaction, preserve button width

**Loading State**:
- Spinner: Animated circular spinner
- Color: Inherits text color
- Size: 20px
- Position: Replaces icon or shows before text
- Text: Optional "Loading..." or keeps original text

**Mobile**: 44x44px minimum touch size
**Accessibility**: Focus indicators, disabled state communicated, loading announced

---

### Dialog Component

**Purpose**: Modal dialogs for confirmations, forms, and alerts

**Visual Design**:
- Background: zinc-800 (elevated surface)
- Border: 1px solid zinc-700
- Border radius: 12px (large, modern feel)
- Shadow: Large elevation shadow for prominence
- Max width: 500px (desktop), full-width minus margins (mobile)
- Padding: 24px

**Header**:
- Title: 20px, semibold weight, zinc-100 text
- Close button: X icon, top-right, 32x32px touch target
- Border: Bottom border in zinc-700
- Padding: 16px bottom

**Content Area**:
- Padding: 24px vertical
- Typography: 16px body text, zinc-200
- Form elements: Full width with 16px bottom margin
- Scrollable if content exceeds viewport

**Footer** (when present):
- Border: Top border in zinc-700
- Padding: 16px top
- Layout: Right-aligned buttons with 8px gap
- Primary action: USAF blue button
- Secondary action: Ghost/outline button

**Settings Dialog Example** (from visual reference):
- Title: "Settings"
- Content: Toggle switches in vertical list
- Options shown:
  - Auto-save (toggle switch)
  - Dark Theme (toggle switch)
  - Line Numbers (toggle switch)
- Each option: Label on left, toggle on right
- Toggle styling: Modern switch, USAF blue when on
- Spacing: 16px between options
- No explicit footer (close via X or backdrop)

**Toggle Switch Design**:
- Width: 48px, Height: 24px
- Track: zinc-600 off, USAF blue (#355e93) on
- Handle: White circle, 20px diameter
- Transition: 200ms smooth slide
- States: Off (left), On (right)

**Backdrop**:
- Background: Black with 60% opacity
- Blur effect: Optional subtle blur on content behind
- Click to dismiss: Closes dialog

**Mobile Adaptation**:
- Full-screen on small devices (<640px)
- Bottom sheet on medium devices (640px-1024px)
- Centered modal on desktop (>1024px)
- Swipe to dismiss (mobile)

**Animation**:
- Enter: Fade in backdrop (150ms), scale up dialog (200ms ease-out)
- Exit: Scale down dialog (150ms), fade out backdrop (150ms)
- Spring animation on mobile bottom sheet

**Accessibility**: Dialog role, modal attribute, focus trap, ESC/backdrop dismissal, focus return

---

### Dropdown Menu Component

**Purpose**: Contextual menus for actions and options

**Visual Design**:
- Background: zinc-800 (elevated, same as dialog)
- Border: 1px solid zinc-700
- Border radius: 8px (medium)
- Shadow: Medium elevation shadow
- Min width: 200px, max width: 320px
- Padding: 4px vertical

**Menu Items**:
- Height: 36px (desktop), 48px (mobile)
- Padding: 8px horizontal, 8px vertical
- Layout: Icon (16px) + text with 8px gap
- Font: 14px, regular weight
- Color: zinc-200 default, zinc-100 on hover
- Background: Transparent default, zinc-700 on hover
- Cursor: Pointer
- Border radius: 4px (subtle inner rounding)

**Item Types**:
- Standard: Icon + label
- Destructive: Red text/icon for dangerous actions
- Disabled: zinc-500 text, no hover, no cursor
- Checkbox: Checkmark icon when selected
- Separator: 1px line in zinc-700, 4px margin vertical

**Icon Styling**:
- Size: 16px
- Color: Inherits from text color
- Position: Left-aligned with 8px left padding
- Gap: 8px to text

**Keyboard Shortcuts** (when shown):
- Position: Right side of menu item
- Font: 12px, monospace
- Color: zinc-500
- Background: zinc-700
- Padding: 2px 6px
- Border radius: 4px

**Positioning**:
- Anchored to trigger element
- Smart positioning: Flips if near viewport edge
- Offset: 4px from trigger
- Animation: Fade in with subtle slide (150ms)

**Mobile Adaptation**:
- Bottom sheet presentation
- Larger touch targets (48px)
- Native-feeling interactions
- Full-width items
- Swipe down to dismiss

**States**:
- Open: Visible with animation
- Closed: Hidden
- Focus: Highlight current item (keyboard navigation)

**Accessibility**: Menu role, arrow navigation, type-ahead, focus management

---

### Toast Component

**Purpose**: Temporary notification messages

**Types**: Success, Error, Warning, Info

**Visual Design**:

**Container**:
- Background: zinc-800
- Border: 1px solid zinc-700
- Border radius: 8px (medium)
- Shadow: Large elevation shadow
- Min width: 300px, max width: 500px
- Padding: 16px
- Layout: Horizontal flex (icon + content + close)

**Success Toast**:
- Accent: Left border (4px) in green-500
- Icon: Checkmark circle, green-500
- Background: Optional subtle green tint on zinc-800

**Error Toast**:
- Accent: Left border (4px) in red-500
- Icon: X circle or alert circle, red-500
- Background: Optional subtle red tint on zinc-800

**Warning Toast**:
- Accent: Left border (4px) in yellow-500
- Icon: Alert triangle, yellow-500
- Background: Optional subtle yellow tint on zinc-800

**Info Toast**:
- Accent: Left border (4px) in blue-500
- Icon: Info circle, blue-500
- Background: Optional subtle blue tint on zinc-800

**Content Layout**:
- Icon: 24px, left side, 12px right margin
- Title: 16px, semibold, zinc-100
- Message: 14px, regular, zinc-300
- Close button: X icon, 24x24px, right side

**Typography**:
- Title: 16px, medium weight
- Description: 14px, regular weight
- Color: zinc-100 (title), zinc-300 (description)

**Close Button**:
- Size: 24x24px
- Icon: X or close icon
- Color: zinc-400, zinc-100 on hover
- Position: Top-right corner
- Padding: 4px

**Positioning**:
- Desktop: Top-right corner, 16px from edges
- Mobile: Bottom of screen, full width or centered
- Stacking: Vertical, 8px gap between toasts
- Z-index: Very high (40+ in elevation scale)

**Animation**:
- Enter: Slide in from right (desktop) or bottom (mobile), 300ms ease-out
- Exit: Slide out and fade, 200ms ease-in
- Hover: Pause auto-dismiss timer

**Mobile Optimization**:
- Bottom positioning
- Swipe to dismiss (horizontal swipe gesture)
- Vertical stacking
- Auto-dismiss timing
- Full-width or 90% width with centered position

**Behavior**:
- Auto-dismiss: 5 seconds (success/info), 7 seconds (warning/error)
- Manual dismiss: Via close button or swipe
- Pause on hover: Stops auto-dismiss timer
- Queue: Multiple toasts stack, dismiss in order

**Accessibility**: Status/alert roles, live regions, screen reader announcements

---

## Document Components

### TemplateSelector Component

Keep it simple for now. 

**Purpose**: Choose document template (quill)

**Visual Design**:
- Container: Full width, centered content
- Background: zinc-900 (dark theme)
- Padding: 24px

**Template Card**:
- Background: zinc-800 (elevated)
- Border: 1px solid zinc-700
- Border radius: 8px (medium)
- Padding: 16px
- Hover: zinc-700 background, subtle shadow
- Selected: USAF blue border (2px), zinc-700 background
- Cursor: Pointer

**Card Content**:
- Preview: Small thumbnail or icon (64px-128px)
- Title: 18px, semibold, zinc-100
- Description: 14px, regular, zinc-400
- Layout: Vertical stack, center-aligned

**Template Options** (example):
- Blank: Empty document
- Official Memo: USAF memo template
- Letter: Formal letter format
- Report: Technical report structure

**Layout**:
- Desktop: Grid (3 columns), 16px gap
- Mobile: List (1 column), 12px gap
- Tablet: Grid (2 columns), 16px gap

**Selection Indicator**:
- Checkmark icon: Top-right corner of selected card
- Color: USAF blue
- Size: 24px
- Background: White circle for contrast

**Accessibility**: Radio group, keyboard navigation, preview descriptions

---

### DocumentMetadata Component

**Purpose**: Display and edit document metadata

**Fields**: Title, Subject, Letterhead, Date, Classification

**Visual Design**:
- Container: Form layout with vertical stack
- Background: zinc-900 or zinc-800 (depending on context)
- Padding: 24px
- Spacing: 16px between fields

**Form Field Layout**:
- Label: 14px, medium weight, zinc-300, 8px bottom margin
- Input: Full width, 40px height (48px on mobile)
- Required indicator: Red asterisk (*) after label

**Input Field Styling**:
- Background: zinc-800
- Border: 1px solid zinc-700
- Border radius: 6px
- Text color: zinc-100
- Font size: 16px
- Padding: 12px horizontal
- Focus: USAF blue border (2px), subtle glow
- Error: Red border, error message below

**Input Types**:
- Text fields: Title, Subject (single line)
- Dropdown: Letterhead options, Classification levels
- Date picker: Date field with calendar icon
- All fields: Full width

**Dropdown Styling**:
- Same as text input with chevron-down icon on right
- Icon: 20px, zinc-400
- Opens: Dropdown menu with options
- Selected: Check mark next to selected option

**Date Picker**:
- Input: Text field with calendar icon button on right
- Icon button: 32x32px, zinc-400 icon
- Calendar popup: Styled modal with month/year navigation
- Date selection: USAF blue highlight
- Today: Outlined, selected: filled

**Validation States**:
- Valid: Default zinc-700 border
- Invalid: Red-500 border, red error text below
- Required but empty: Yellow-500 border on blur

**Error Messages**:
- Position: Below input field
- Font: 14px, regular
- Color: Red-400
- Icon: Alert circle, 16px
- Spacing: 4px top margin

**Helper Text**:
- Position: Below input or error
- Font: 12px, regular
- Color: zinc-500
- Examples: "Classification levels: U, C, S, TS"

**Mobile Optimization**: 
- Full-width fields
- Native pickers (date, select)
- Touch-optimized dropdowns
- 48px minimum field height
- Larger touch targets for picker buttons

**Field Examples**:
- Title: "Memorandum for Record"
- Subject: "Updated Security Procedures"
- Letterhead: Dropdown (HQ USAF, Wing, Squadron, etc.)
- Date: Date picker (defaults to today)
- Classification: Dropdown (Unclassified, Confidential, Secret, Top Secret)

**Accessibility**: Form labels, required indicators, validation errors, error summary

---

## Responsive Patterns

### Breakpoint Strategy

- **sm: 640px** - Mobile landscape
- **md: 768px** - Tablet portrait
- **lg: 1024px** - Desktop
- **xl: 1280px** - Large desktop

### Layout Adaptations

**Desktop**: Sidebar (224px/48px) + split editor/preview (50/50)
**Tablet**: Drawer sidebar + split view (60/40)
**Mobile**: Full drawer + tabbed editor OR preview

### Component State

- Use Svelte 5 runes for component-local state
- Use stores for cross-component state
- Context API for dependency injection

## Touch Interactions

### Gestures
- Swipe right/left: Sidebar open/close
- Pull down: Refresh document list
- Pinch zoom: Adjust preview size

### Touch Targets
- Minimum: 44x44px
- Spacing: 8px minimum between targets
- Extended active area beyond visible bounds

## Animation Guidelines

### Transitions
- Standard duration: 300ms
- Sidebar: 300ms ease-in-out
- Modal: 150ms ease-out
- Respect `prefers-reduced-motion`

### Mobile Considerations
- Native-feeling animations
- 60fps performance target
- Reduced animations on low-end devices

## Interactive States & Patterns

### Standard Interactive States

**Button/Clickable Elements**:
1. **Default**: Base styling, neutral appearance
2. **Hover**: Background darkens (zinc-700), cursor pointer
3. **Active**: Background darker (zinc-600), visual press feedback
4. **Focus**: 2px USAF blue outline, 2px offset, visible on keyboard navigation
5. **Disabled**: 50% opacity, no interaction, not-allowed cursor
6. **Loading**: Spinner, disabled interaction, width preserved

**Input Fields**:
1. **Empty**: Placeholder text in zinc-500
2. **Filled**: User content in zinc-100
3. **Focus**: USAF blue border (2px), optional subtle glow
4. **Error**: Red border, error icon, error message below
5. **Success**: Green border (optional), success icon
6. **Disabled**: 50% opacity, zinc-600 background, no interaction

**Transitions**:
- Color changes: 150ms ease
- Transform (scale, translate): 200ms ease-out
- Opacity: 150ms ease
- All transitions honor `prefers-reduced-motion`

### Hover Effects

**Subtle Hover** (Ghost buttons, menu items):
- Background: Transparent → zinc-700
- No border change
- Cursor: pointer

**Standard Hover** (Secondary buttons):
- Background: zinc-700 → zinc-600
- Slight shadow increase (optional)
- Cursor: pointer

**Accent Hover** (Primary buttons, links):
- Background: USAF blue → Darker USAF blue
- Slight shadow
- Cursor: pointer

**Icon Hover**:
- Color: zinc-400 → zinc-100
- Scale: 1.0 → 1.05 (subtle, optional)
- Cursor: pointer

### Focus Indicators

**Keyboard Navigation Focus**:
- Outline: 2px solid USAF blue (#355e93)
- Offset: 2px from element
- Border radius: Matches element (4px typical)
- Always visible, never removed
- High contrast mode: 3px solid, higher contrast

**Focus Visible Strategy**:
- Mouse clicks: No visible focus ring
- Keyboard navigation: Visible focus ring
- Touch: No visible focus ring
- Use :focus-visible CSS pseudo-class

### Active/Pressed States

**Visual Feedback**:
- Background: Slightly darker than hover
- Optional: Subtle scale down (0.98) for "press" feel
- Shadow: Reduced or removed
- Transition: Fast (100ms) for responsive feel

**Touch Feedback (Mobile)**:
- Immediate visual response on touch
- Ripple effect (optional, material-design style)
- Active state until release
- Haptic feedback (where supported)

### Loading States

**Button Loading**:
- Spinner replaces icon or shows before text
- Width preserved (no layout shift)
- Interaction disabled
- Cursor: default or wait
- ARIA live region announces "Loading"

**Page Loading**:
- Top progress bar (thin, USAF blue)
- Skeleton screens for content areas
- Fade in when loaded

**Content Loading**:
- Spinner: Centered, USAF blue, 32px-48px
- Skeleton: Animated gradient shimmer
- Progressive: Show available content immediately

### Selection States

**Selected Item** (Lists, cards):
- Background: zinc-700 or zinc-800
- Left accent border: 3px USAF blue
- Optional checkmark icon
- Text: zinc-100 (brighter)

**Multi-Select**:
- Checkbox: Visible on hover or always shown
- Selected: Checkbox checked, background highlight
- Partial selection: Indeterminate state for parent items

### Disabled States

**Visual Treatment**:
- Opacity: 50% for entire element
- Cursor: not-allowed
- No hover effects
- No focus (not in tab order)

**Communication**:
- ARIA disabled attribute
- Tooltip explaining why disabled (optional)
- Never use only color to indicate disabled

### Empty States

**Visual Design**:
- Icon: Large (64px), zinc-500
- Heading: "No items yet" or similar
- Description: Brief explanation
- Action: Primary button to resolve (e.g., "Create first document")
- Centered layout, generous padding

**Examples**:
- Empty file list: "No documents yet. Create your first document to get started."
- Empty search: "No results found. Try different keywords."
