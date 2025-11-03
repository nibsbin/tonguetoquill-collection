# UI Components Specification

## Overview

Component behavior specifications for Tonguetoquill, defining props, states, interactions, and accessibility requirements. All visual design (colors, typography, spacing, etc.) is defined in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

Components are organized by feature in `src/lib/components/`. See [COMPONENT_ORGANIZATION.md](./COMPONENT_ORGANIZATION.md) for file structure and testing patterns.

Components support mobile-responsive layouts and Section 508 accessibility compliance.

**Phase Status**:

- ✅ Theme unification completed (October 2025) - components now use semantic color tokens
- ✅ Sidebar redesign completed (October 2025) - updated dimensions and visual hierarchy
- ✅ Auto-save implemented (October 2025) - 7-second debounce with status indicator

See debriefs in `prose/debriefs/` for implementation details.

## Component Library: shadcn-svelte

Tonguetoquill uses **shadcn-svelte** as the foundational component library:

**Why shadcn-svelte**:

- Battle-tested, accessible components (WCAG 2.1 AA compliance)
- Built with Svelte 5 and Tailwind CSS
- Includes Lucide icons and Sonner toast notifications
- Highly customizable and composable
- Source code included in project (not external dependency)

**Core Components Used**:

- **Sonner** - Toast notifications (replaces custom toast implementation)
- **Dialog** - Modal dialogs and confirmations
- **Sheet** - Mobile drawer/sidebar
- **Button** - Consistent button styling across app
- **Tooltip** - Contextual help and collapsed sidebar labels
- **Dropdown Menu** - More actions menu in TopMenu
- **Card** - Document list items and containers

**Custom Components**:
Custom components are only created when shadcn-svelte doesn't provide the specific functionality needed:

- **MarkdownEditor** - CodeMirror 6 integration
- **Preview** - Rendered markdown output (in `Preview/Preview.svelte`)
- **DocumentEditor** - Container managing editor/preview state
- **DocumentList** - Document sidebar (uses shadcn Card components)

## Layout Components

## Layout Components

### Sidebar Component

**Implementation**: Uses shadcn-svelte's Sheet component for drawer functionality on mobile, with custom layout structure

**Purpose**: Collapsible navigation for document management, user profile, and settings

**Design Reference**: See [SIDEBAR.md](./SIDEBAR.md) for complete design specification

**States**:

- Desktop Expanded: 288px (w-72) width, full content visible - updated October 2025
- Desktop Collapsed: 48px (w-12) width, icons only
- Mobile: Full-screen drawer overlay at 288px width (see [DESIGN_SYSTEM.md - Navigation Patterns](./DESIGN_SYSTEM.md#navigation-patterns))

**Visual Design**:

- Background: Uses semantic token `bg-background` (CSS var(--color-background))
- Border: Uses semantic token `border-border` (CSS var(--color-border))
- Creates subtle separation between sidebar and main content

**Structure**:

**Header Section (Height: 48px / h-12)**:

- Hamburger menu button: Left-aligned, toggles sidebar collapse/expand
- Title: "Tonguetoquill" text centered (Lato font, medium weight, text-sm)
  - Visible when expanded (opacity: 100%)
  - Hidden when collapsed (opacity: 0%, pointer-events: none)
  - Smooth 300ms opacity transition with custom cubic-bezier easing
- Background: Uses `bg-background`

**Primary Actions (Height: 36px / h-9)**:

- "New Document" button
- Full-width, left-aligned when expanded
- Plus icon + text (when expanded)
- Hover: Uses `hover:bg-accent` with scale effect
- Press effect: `active:scale-[0.985]` on standard buttons

**Section Header**:

- "Recents" header with `text-xs text-muted-foreground`
- Sticky positioning with gradient background for visual hierarchy
- Improves document list scannability

**Content Section (Scrollable)**:

- **"New Document" button**:
  - Full-width, left-aligned
  - Plus icon (h-4 w-4) + "New Document" text (when expanded)
  - Uses semantic tokens: `text-muted-foreground`
  - Hover: `hover:bg-accent hover:text-foreground`
  - Padding: p-2

- **Document List** (when expanded):
  - Separator above list using `border-border`
  - Document items in group containers (h-8 / 32px per item):
    - Group hover reveals delete button
    - Active state: `bg-accent`
    - Hover state: `hover:bg-accent`
    - Document button:
      - FileText icon (h-4 w-4) + filename (truncated with `text-xs`)
      - Active: `text-foreground`
      - Inactive: `text-muted-foreground hover:text-foreground`
    - Delete button (right side):
      - Trash icon (h-4 w-4)
      - Invisible by default (opacity: 0)
      - Visible on group hover (opacity: 100)
      - Uses `text-destructive hover:bg-destructive`

**Footer Section (Sticky Bottom)**:

- Border top: `border-border`
- Padding: p-2
- **Profile Button** (h-9 / 36px):
  - User icon (h-5 w-5) + "Profile" text (when expanded)
  - Uses `text-muted-foreground`
  - Hover: `hover:bg-accent hover:text-foreground`
- **Settings Button** (h-9 / 36px):
  - Settings icon (h-5 w-5) + "Settings" text (when expanded)
  - Uses `text-muted-foreground`
  - Hover: `hover:bg-accent hover:text-foreground`
  - Opens settings popover on click

**Collapsed State**:

- Width: 48px (w-12)
- Icons only (no text labels)
- Text fades out smoothly (300ms transition with cubic-bezier easing)
- Tooltips show labels on hover (using shadcn-svelte's Tooltip component)

**Mobile Behavior**:

- Renders as full-screen drawer overlay using shadcn-svelte's Sheet component
- Backdrop dismissal
- Hamburger menu trigger in TopMenu

**Accessibility**: Navigation landmark, ARIA labels, keyboard navigation, focus trap in drawer mode

**Visual Reference**: See `prose/legacymock_project/components/Sidebar.tsx`

---

### TopMenu Component

**Implementation**: Uses shadcn-svelte's Button components for actions and Dropdown Menu for the more actions menu

**Purpose**: Header bar displaying document information and actions

**Reference**: Visual design matches `prose/legacymock_project/components/TopMenu.tsx`

**Structure (Height: 48px, Background: zinc-900, Border-bottom: zinc-700)**:

**Left Section**:

- Filename display: Current document name (e.g., "welcome.md")
  - Text color: zinc-300
  - No icon prefix
  - Truncation: Ellipsis for long filenames on mobile

**Right Section**:

- **Download Button**:
  - Bordered group (border: zinc-600, rounded padding: 2px)
  - Download icon (16px, h-4 w-4) + "Download" text
  - Ghost button style: zinc-300 text
  - Hover: zinc-700 background, zinc-100 text
  - Height: 28px (h-7)
  - Small size variant

- **More Actions Button** (Meatball/Kebab Menu):
  - MoreVertical icon (16px, h-4 w-4, three vertical dots)
  - Ghost button style: zinc-300 text
  - Hover: zinc-700 background, zinc-100 text
  - Height: 32px (h-8), Width: 32px (w-8)
  - Icon-only, no padding

**More Actions Menu Items** (Background: zinc-800, Border: zinc-700):

- **Share**: Share2 icon + "Share" text
- **Import File**: Upload icon + "Import File" text
- Separator (zinc-700)
- **Document Info**: FileText icon + "Document Info" text
- **Keyboard Shortcuts**: Keyboard icon + "Keyboard Shortcuts" text
- Separator (zinc-700)
- **About Us**: Info icon + "About Us" text + ExternalLink icon (right)
- **Terms of Use**: FileText icon + "Terms of Use" text + ExternalLink icon (right)
- **Privacy Policy**: Shield icon + "Privacy Policy" text + ExternalLink icon (right)

Menu Item Styling:

- Text: zinc-300
- Hover: zinc-700 background, zinc-100 text
- Icon size: 16px (h-4 w-4)
- External link icon: 12px (h-3 w-3) on the right (ml-auto)

**Mobile Adaptation**:

- Filename truncates with ellipsis
- Download button may condense (icon only on very small screens)
- Menu items have 48px minimum height for touch targets

**Accessibility**: Banner landmark, visible labels or ARIA labels, keyboard navigation for menu

**Visual Reference**: See `prose/legacymock_project/components/TopMenu.tsx`

---

## Authentication State Components

### GuestModeBanner Component

**Implementation**: Custom notification banner using Tailwind CSS

**Purpose**: Inform guest users that their work is stored locally and prompt them to sign in for server persistence

**Display Conditions**:

- Shown when user is not authenticated (guest mode)
- Displayed at top of main content area, below header
- Dismissible with option to "Don't show again" (stored in localStorage)

**Content**:

- Icon: Information icon (from Lucide)
- Message: "You're working in guest mode. Your documents are saved locally in this browser."
- Actions:
  - Primary: "Sign in to sync" button (navigates to `/login`)
  - Secondary: "Dismiss" button (hides banner for session)
  - Tertiary: "Don't show again" link (hides permanently)

**States**:

- Visible: Full banner with message and actions
- Dismissed: Hidden (can reappear on new session unless permanently dismissed)

**Mobile Adaptation**:

- Stacks buttons vertically on mobile
- Smaller text size
- Collapsible to save space

**Accessibility**:

- ARIA role="alert" for screen reader announcement
- Clear dismissal options
- Keyboard navigable buttons

### HeaderAuthSection Component

**Implementation**: Custom component with conditional rendering based on auth state

**Purpose**: Display authentication status and actions in the header

**Guest State** (Not Authenticated):

- Shows: "Sign In" button (primary) and "Register" link (secondary)
- Sign In button: Navigates to `/login`
- Register link: Navigates to `/register`
- Both styled according to [DESIGN_SYSTEM.md - Buttons](./DESIGN_SYSTEM.md#buttons)

**Authenticated State**:

- Shows: User email/name and "Logout" button
- User email: Displayed in subdued color (zinc-600)
- Logout button: Secondary style, opens logout confirmation or immediately logs out
- Logout action: Clears session and returns to `/` in guest mode

**Mobile Adaptation**:

- Guest: May show icons only with tooltips
- Authenticated: User email may hide, showing only avatar/icon
- Logout accessible via menu on mobile

**Accessibility**:

- Clear labels for all actions
- Logout confirmation dialog if needed
- Proper focus management on modal

### FeatureGate Component

**Implementation**: Wrapper component that conditionally renders content based on auth state

**Purpose**: Restrict certain features to authenticated users with graceful prompts

**Usage**:

```svelte
<FeatureGate feature="document_sync">
	<DocumentSyncButton />
</FeatureGate>
```

**Behavior**:

- **If Authenticated**: Renders child content normally
- **If Guest**: Shows login prompt overlay/modal instead of feature
  - Prompt message: "Sign in to access [feature name]"
  - Primary action: "Sign In" (navigates to `/login` with return URL)
  - Secondary action: "Cancel" or "Learn More"

**Gated Features** (examples):

- Server document sync
- Document sharing
- Export to certain formats
- Advanced settings

**Modal/Overlay Style**:

- Uses shadcn-svelte Dialog component
- Centered on screen with backdrop
- Clear explanation of why authentication is needed
- Option to create account if they don't have one

**Accessibility**:

- Focus trap in modal
- ESC key to close
- Screen reader friendly explanation

---

## Editor Components

### EditorToolbar Component

**Implementation**: Uses shadcn-svelte's Button components with Lucide icons, Separator component, and Tabs component

**Purpose**: Markdown formatting controls and mode selection

**Reference**: Visual design matches `prose/legacymock_project/components/EditorToolbar.tsx`

**Structure (Height: 48px, Background: zinc-800, Border-bottom: zinc-700)**:

**Left Section - Formatting Tools**:

Button layout with separators between groups:

- **Group 1**: Bold, Italic, Strikethrough
  - Bold icon (16px, h-4 w-4)
  - Italic icon (16px, h-4 w-4)
  - Strikethrough icon (16px, h-4 w-4)
- Separator (vertical, height: 20px, zinc-700)

- **Group 2**: Code, Quote
  - Code icon (16px, h-4 w-4)
  - Quote icon (16px, h-4 w-4)
- Separator (vertical, height: 20px, zinc-700)

- **Group 3**: Lists
  - List icon (16px, h-4 w-4) - Bullet list
  - ListOrdered icon (16px, h-4 w-4) - Numbered list
- Separator (vertical, height: 20px, zinc-700)

- **Group 4**: Link
  - Link icon (16px, h-4 w-4)

**Button Styling**:

- Size: 28px square (h-7 w-7)
- Ghost variant: transparent background
- Padding: 0
- Icon color: zinc-400 default
- Hover: zinc-700 background, zinc-100 text
- Tooltips: Show formatting name on hover

**Right Section - Mode Toggle**:

- Spacer: flex-1 to push mode toggle to the right
- **Tabs Component**:
  - Height: 28px (h-7)
  - Background: zinc-900
  - Padding: 2px (p-0.5)
  - Tab triggers:
    - "Markdown" tab
    - "Wizard" tab
  - Active state: zinc-700 background, zinc-100 text
  - Inactive state: transparent background, zinc-400 text
  - Font size: 0.75rem (text-xs)
  - Height: 24px (h-6)
  - Padding horizontal: 12px (px-3)

**Current Status (Post-Phase 6.5)**: ⚠️ Mode toggle tabs not implemented. See `prose/plans/REPAIR.md` Phase R5 for recovery plan.

**Keyboard Shortcuts**:
Buttons show tooltips with keyboard shortcuts using shadcn-svelte's Tooltip component (see [DESIGN_SYSTEM.md - Keyboard Shortcuts](./DESIGN_SYSTEM.md#keyboard-shortcuts))

**Mobile Adaptation**:

- Horizontal scroll if needed for overflow
- 44px minimum touch targets (buttons scale up on mobile)
- May condense to most-used tools on very small screens

**Accessibility**: Toolbar role, button labels (text + ARIA), keyboard shortcuts announced in tooltips

**Visual Reference**: See `prose/legacymock_project/components/EditorToolbar.tsx`

---

### MarkdownEditor Component

**Purpose**: Text input area for markdown editing

**Implementation**: CodeMirror 6 with custom extensions. See [MARKDOWN_EDITOR.md](./MARKDOWN_EDITOR.md) for complete editor architecture, custom language mode for extended markdown syntax, folding, and accessibility features.

**Reference**: Visual design matches `prose/legacymock_project/components/MarkdownEditor.tsx`

**Structure**:

- Full-height editor area
- Background: zinc-900
- Text color: zinc-100
- Monospace font (see [DESIGN_SYSTEM.md - Typography](./DESIGN_SYSTEM.md#typography))
- Padding: 16px all sides
- Placeholder text: "Start typing your markdown here..." (zinc-500 color)
- Spell check: disabled (spellCheck={false})

**Editor Features** (via CodeMirror 6):

- Syntax highlighting for markdown and metadata blocks
- Code folding for YAML frontmatter and inline metadata
- Line numbers gutter (optional via settings) - ⚠️ Not implemented, see REPAIR.md Phase R3
- Auto-indent on Enter
- Tab key inserts spaces (2 or 4 spaces)
- Undo/redo support
- Auto-completion for SCOPE/QUILL keywords
- Auto-save integration (see [DESIGN_SYSTEM.md - Auto-Save](./DESIGN_SYSTEM.md#auto-save-behavior)) - ⚠️ Not implemented, see REPAIR.md Phase R1

**Current Status (Post-Phase 6.5)**: Basic CodeMirror editor with markdown syntax highlighting and formatting commands. Auto-save and line numbers not yet integrated.

**Cursor & Selection**:

- Visible cursor with branded color
- Text selection highlighting
- Active line subtle background (optional)

**Mobile Optimization**:

- 16px minimum font size (prevents zoom on focus)
- Virtual keyboard handling
- Touch-friendly text selection
- Auto-save on blur (if enabled)

**Accessibility**:

- Labeled editor region with ARIA role
- Keyboard shortcuts work as expected (see [DESIGN_SYSTEM.md - Keyboard Shortcuts](./DESIGN_SYSTEM.md#keyboard-shortcuts))
- Screen reader support
- Status announcements for save operations

**Visual Reference**: See `prose/legacymock_project/components/MarkdownEditor.tsx`

---

### Preview Component

**Implementation**: `Preview/Preview.svelte`

**Purpose**: Rendered markdown output display

**Structure**:

- Background: white (#ffffff) - contrasts with dark theme editor
- Full height in split-view layout
- Padding: 24px all sides
- Max width: none (full container width, max-w-none)
- Overflow: auto (scrollable)

**Document Styling**:
Renders standard markdown with professional typography using prose classes:

- Prose variant: prose-slate
- Max width: none (prose-slate-max-w-none to fill container)
- Crimson Text font for body text (serif)
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

---

### Popover Component

**Implementation**: Uses shadcn-svelte's Popover component for floating panels

**Purpose**: Display contextual information or settings without full modal behavior

**Reference**: Settings popover matches `prose/legacymock_project/components/Sidebar.tsx`

**Settings Popover Structure**:

Triggered from Settings button in Sidebar footer:

- **Trigger**: Settings gear icon button
- **Placement**: Side "right", align "end"
- **Width**: 256px (w-64)
- **Background**: zinc-800
- **Border**: zinc-700
- **Text**: zinc-100
- **Padding**: 0 (p-0)

**Content Section** (Padding: 16px, p-4):

- **Heading**: "Settings" (h3, margin-bottom: 16px, mb-4)
- **Settings Options** (spacing: 16px between, space-y-4):
  1. **Auto-save Toggle**:
     - Label: "Auto-save" (id: "auto-save", zinc-300 text)
     - Switch component aligned right
     - Flex layout with justify-between
  2. **Dark Theme Toggle**:
     - Label: "Dark Theme" (id: "dark-theme", zinc-300 text)
     - Switch component aligned right
     - For MVP: May be disabled/hidden since only dark theme supported
  3. **Line Numbers Toggle**:
     - Label: "Line Numbers" (id: "line-numbers", zinc-300 text)
     - Switch component aligned right
     - Controls CodeMirror line number gutter visibility

**Switch Component Styling**:

- Uses shadcn-svelte's Switch component
- Clear visual on/off states
- Accessible keyboard interaction (Space to toggle)
- Associated with label via htmlFor/id

**Behavior**:

- Opens on Settings button click
- Closes on outside click, ESC key, or selecting trigger again
- Settings changes apply immediately
- Persist to localStorage

**Mobile Adaptation**:

- May use Drawer (sheet) component instead of Popover on mobile
- Full-width on small screens

**Accessibility**:

- Proper labeling for all switches
- Keyboard navigation between switches
- ESC to dismiss
- Focus management

**Visual Reference**: See `prose/legacymock_project/components/Sidebar.tsx` (lines 147-194)

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

**Types**: Success, Error, Warning, Info, Classification Message

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
- **Classification Message**: Special persistent toast for document classification (see [DESIGN_SYSTEM.md - Classification Message](./DESIGN_SYSTEM.md#classification-message))

**Behavior**:

- Auto-dismiss timing: 5 seconds (success/info), 7 seconds (warning/error)
- Classification message: Persistent (no auto-dismiss)
- Manual dismiss: Close button
- Pause auto-dismiss on hover
- Multiple toasts stack vertically

**Positioning**:

- Desktop: Top-right corner
- Mobile: Bottom or top-center
- Classification message: Always top-center

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

_For all visual design specifications (colors, spacing, typography, shadows, animations, interactive states), see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)_
