# Design System

## Overview

The Tonguetoquill design system provides a consistent visual language across desktop and mobile platforms, maintaining the professional VSCode-inspired aesthetic while ensuring accessibility and mobile-friendliness.

## Color Palette

### Theme Philosophy

- **Dark Theme Only**: Professional VSCode-inspired aesthetic with reduced eye strain
- **Accessibility**: Built-in support for high contrast via CSS media queries (`prefers-contrast`)
- **Reference**: Color values aligned with `prose/legacymock_project`

### Color Scheme

**Background Layers**:

- Primary: zinc-900 (#18181b) - main background
- Secondary: zinc-800 (#27272a) - elevated surfaces (sidebar, top menu, toolbar)
- Tertiary: zinc-700 (#3f3f46) - active/hover states, borders
- Overlay: zinc-900 with transparency (modals/drawers)

**Text Colors**:

- Primary: zinc-100 (#f4f4f5) - main text, hover state
- Secondary: zinc-300 (#d4d4d8) - secondary text, labels
- Tertiary: zinc-400 (#a1a1aa) - muted text, inactive icons
- Disabled: zinc-500 (#71717a) - disabled state, placeholder text

**Interactive Colors**:

- Default: zinc-400 - default state for icons and secondary text
- Hover: zinc-100 - hover state for text and icons
- Active: zinc-700 background - active/selected state
- Hover Background: zinc-700 - hover state for interactive elements

**Semantic Colors**:

- Success: Green tones
- Error: Red tones (#d4183d for destructive actions)
- Warning: Yellow tones
- Info: Blue tones

**Brand**: USAF Blue (#355e93) for accents and primary actions (preserved from legacy)

**Preview Section**: White background (#ffffff) for professional document rendering (not dark theme)

### High Contrast Support

Automatically adapts to system `prefers-contrast: high` media query:

- Increased contrast ratios (7:1 minimum)
- Stronger border visibility
- Enhanced focus indicators (3px vs 2px)

### Color Usage Guidelines

- Use semantic colors for status messages
- Maintain 4.5:1 contrast minimum for normal text
- Never rely on color alone for information
- Test with color blindness simulators

## Typography

### Font Families

**UI Font**: Lato with fallback stack for native appearance

- Primary: 'Lato', Arial, sans-serif
- Weights: 400 (normal), 500 (medium), 700 (bold), 900 (black)
- Import from Google Fonts

**Editor Font**: Monospace stack for code editing

- Stack: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, 'Courier New', monospace

**Preview Font**: Crimson Text with serif fallback for professional document rendering

- Primary: 'Crimson Text', Georgia, 'Times New Roman', serif
- Weights: 400 (normal), 600 (semibold), 700 (bold)
- Import from Google Fonts

**Reference**: Font choices match `prose/legacymock_project/styles/globals.css`

### Type Scale

**Desktop**:

- Base: 16px
- Range: 12px (xs) to 36px (4xl)

**Mobile**:

- Base: 16px (prevents zoom on input focus)
- Fluid scaling for larger devices

### Font Weights

- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Line Heights

- Tight: 1.25 (headings)
- Normal: 1.5 (body text)
- Relaxed: 1.75 (long-form content)

### Typography Guidelines

**Accessibility**:

- Minimum 16px for body text
- 1.5 line height for readability
- Support text resize up to 200%

**Mobile**:

- Larger minimum sizes
- Generous line heights
- Shorter line lengths (60-80 characters)

## Spacing System

### Base Unit

4px (0.25rem)

### Spacing Scale

0px, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

### Layout Spacing

**Component Heights**:

- Top bar: 48px (matches mock project)
- Toolbar: 48px (matches mock project)
- Sidebar expanded: 224px (matches mock project)
- Sidebar collapsed: 48px (matches mock project)
- Small buttons: 28px (h-7, icon-only toolbar buttons)
- Medium buttons: 32px (h-8)
- Standard buttons: 40px

**Reference**: Component dimensions match `prose/legacymock_project`

**Padding Standards**:

- Tight: 4px
- Compact: 8px
- Standard: 16px
- Generous: 24px
- Spacious: 32px

**Mobile Touch Targets**:

- Minimum: 44px
- Spacing: 8px minimum between targets

### Responsive Spacing

Use mobile-first approach with increasing spacing at larger breakpoints

## Border Radius

### Border Scale

- Small: 4px
- Medium: 8px
- Large: 10px (base radius, `--radius: 0.625rem`)
- XL: 14px (base + 4px)
- Full: 9999px (circular/pill)

**Reference**: Base radius value (10px / 0.625rem) matches `prose/legacymock_project`

### Usage

- Buttons: Medium
- Cards: Large
- Modals: Large
- Images: Medium
- Pills/badges: Full

## Shadows & Elevation

### Shadow Scale

- Small: Subtle depth
- Medium: Standard elevation
- Large: Prominent elevation
- XL: Maximum elevation

### Elevation Layers

- Base: 0 (content)
- Dropdowns: 10
- Sticky: 20
- Modals: 30
- Toasts: 40

### Mobile Shadows

Reduced for performance, rely more on borders

## Icons

### Icon System

shadcn-svelte provides Lucide icons through its component library for consistent, optimized icons

### Icon Sizes

- XS: 12px
- SM: 16px (default)
- MD: 20px
- LG: 24px
- XL: 32px

### Icon Guidelines

- Inherit text color by default
- Consistent stroke width
- Accessible labels for icon-only buttons

## Transitions & Animations

### Duration Scale

- Fast: 150ms (micro-interactions)
- Base: 300ms (standard transitions)
- Slow: 500ms (complex animations)

### Easing Functions

- Ease-in: Entry animations
- Ease-out: Exit animations
- Ease-in-out: State changes
- Spring: Playful interactions

### Reduced Motion

Honor `prefers-reduced-motion` system setting, reduce or eliminate animations

### Animation Patterns

- Fade in/out for content
- Slide for panels and drawers
- Scale for modals
- Bottom sheet slide-up for mobile

## Responsive Design

### Breakpoint System

- **sm: 640px** - Mobile landscape
- **md: 768px** - Tablet portrait
- **lg: 1024px** - Desktop
- **xl: 1280px** - Large desktop
- **2xl: 1536px** - Extra large

### Container Widths

Full width with max-width constraints at each breakpoint

### Mobile-First Approach

Base styles for mobile, enhance at larger breakpoints

## Accessibility Features

### Focus Indicators

- Visible outline: 2px solid USAF blue
- Offset: 2px
- High contrast mode: 3px solid (via `prefers-contrast: high`)
- Never remove focus styles

### Text Contrast

- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum
- High contrast mode: 7:1 minimum (via `prefers-contrast: high`)
- WCAG AA compliance (AAA in high contrast mode)

### Skip Links

Hidden by default, visible on focus for keyboard navigation

## Breakpoint Behavior

### Breakpoint System

- **Mobile**: < 640px - Single column, stacked layouts
- **sm: 640px** - Mobile landscape, may show dual panes on larger phones
- **md: 768px** - Tablet portrait, split layouts start to appear
- **lg: 1024px** - Desktop, full feature set with sidebar
- **xl: 1280px** - Large desktop, generous spacing
- **2xl: 1536px** - Extra large, maximum content width

### Breakpoint Implementation

- Use **mobile-first** approach with `min-width` media queries
- At exact breakpoint values (e.g., 640px width), the larger breakpoint's styles apply
- Example: At exactly 640px width, `sm` breakpoint styles are active
- Transitions between breakpoints should be instant (no gradual transformations)

### Mobile-First Approach

Base styles target mobile devices, progressively enhanced at larger breakpoints

## Component Sizing

### Button Sizes

- Small: 32px height, 12px horizontal padding, 14px font
- Medium: 40px height, 16px horizontal padding, 16px font
- Large: 48px height, 24px horizontal padding, 18px font
- Icon-only: Square dimensions matching height

### Input Fields

- Desktop: 40px height, 16px font
- Mobile: 48px height, 16px font (prevents zoom on focus)

### Interactive Element Sizing

- Minimum touch target: 44x44px (mobile)
- Minimum spacing between targets: 8px
- Desktop interactive elements: Minimum 32px height

## Loading States

### Loading Delay Thresholds

- Show loading indicator only if operation takes > 300ms
- Prevents loading flashes for fast operations
- Use skeleton loaders for initial page loads
- Use spinners for in-progress operations

### Loading Patterns

- **Skeleton Loaders**: Use for initial content load (document list, preview)
- **Spinners**: Use for user-initiated actions (save, delete, create)
- **Progress Bars**: Use for file operations (upload, download)
- **Preserve Previous State**: If preview already rendered, keep showing it during updates to avoid flashes

### Component-Specific Loading

- **Document List**: Skeleton cards during initial load
- **Preview Pane**: Keep last rendered version during updates
- **Forms**: Disable inputs and show spinner on submit button
- **Dialogs**: Spinner in button during async operations

## Classification Message

### Display Pattern

Classification level displayed as a **toast notification** on page load based on deployment environment. For now, only "UNRESTRICTED" is shown in development and staging.

## Keyboard Shortcuts

### Document Editing

- **Ctrl/Cmd+Z**: Undo
- **Ctrl/Cmd+Y**: Redo
- **Ctrl/Cmd+S**: Save document
- **Ctrl/Cmd+F**: Find in document

### Text Formatting

- **Ctrl/Cmd+B**: Bold
- **Ctrl/Cmd+I**: Italic
- **Ctrl/Cmd+Shift+X**: Strikethrough
- **Ctrl/Cmd+K**: Insert link

### Headings

- **Ctrl/Cmd+1**: Heading 1
- **Ctrl/Cmd+2**: Heading 2
- **Ctrl/Cmd+3**: Heading 3
- **Ctrl/Cmd+4**: Heading 4
- **Ctrl/Cmd+5**: Heading 5
- **Ctrl/Cmd+6**: Heading 6

### Display

Keyboard shortcuts displayed in:

- Help dialog (accessible via menu or ? key)
- Tooltips on toolbar buttons (e.g., "Bold (Ctrl+B)")
- Menu items (when applicable)

## Theme System

### Implementation

- Dark theme only (no theme toggle in UI)
- CSS custom properties for all design tokens
- Automatic high contrast support via `prefers-contrast` media query

## Design Tokens

All design values defined as CSS variables for consistency:

- Colors (backgrounds, text, borders, semantic)
- Spacing (padding, margins, gaps)
- Typography (families, sizes, weights, line heights)
- Borders (radius, widths)
- Shadows (elevation levels)
- Transitions (durations, easing functions)
- Breakpoints (responsive design)

Synced with Tailwind configuration for unified system.

---

## Navigation Patterns

### Desktop Navigation (≥1024px)

- **Sidebar**: Persistent, collapsible (224px expanded, 48px collapsed)
- **Top Menu**: Fixed header with document actions
- **Main Content**: Split editor/preview panes

### Tablet Navigation (768px - 1023px)

- **Sidebar**: Drawer overlay (activated by hamburger menu)
- **Top Menu**: Persistent header, condensed actions
- **Main Content**: Split editor/preview or tabbed view

### Mobile Navigation (<768px)

- **Sidebar**: Full-screen drawer overlay
- **Top Menu**: Sticky header with essential actions only
- **Main Content**: Tabbed interface (Editor OR Preview, not both)
- **Navigation Trigger**: Hamburger menu icon in top-left

### Pattern Selection Rules

- Use **drawer** for sidebar at <1024px (overlay that slides in from left)
- Use **bottom sheet** for mobile dialogs at <640px (slide up from bottom)
- Use **modal** for dialogs at ≥640px (centered overlay)
- Use **tabs** for mobile content switching at <768px
- Use **split panes** for desktop content at ≥768px

---

## Auto-Save Behavior

### Save Triggers

- **Manual Save**: Ctrl/Cmd+S keyboard shortcut
- **Auto-Save**: 7 seconds after last keystroke (when auto-save enabled in settings)
- **Blur Event**: When editor loses focus (optional, based on user preference)

### Auto-Save Implementation

- Debounce delay: 7 seconds from last keystroke
- Only trigger if document has unsaved changes
- Show save status indicator (saving/saved/unsaved/error)
- Network request timeout: 30 seconds

### Error Handling

- Display error message in toast notification
- Keep local changes in editor (don't discard)
- Provide retry button in error toast
- Maintain "unsaved" status indicator

### Conflict Resolution

- **Strategy**: Last write wins (always overwrite server version)
- No conflict detection for MVP
- User changes always take precedence
- Document timestamp updated on successful save

### User Feedback

- **Saving**: Spinner icon next to document name
- **Saved**: Checkmark icon, "Saved" text (brief display)
- **Unsaved**: Dot indicator, asterisk in document name
- **Error**: Red error icon, error message in toast

---

## Form Validation Strategy

### Validation Layers

1. **Client-Side Validation**: Progressive enhancement, immediate feedback
2. **Server-Side Validation**: Authoritative, security boundary

### Client Validation

- **Purpose**: Improve UX with immediate feedback
- **Scope**: Format validation, required fields, basic constraints
- **Timing**: On blur (field exit), on submit
- **Display**: Inline error messages below fields
- **Never Replace**: Server validation (client is untrusted)

### Server Validation

- **Purpose**: Enforce business rules, ensure data integrity
- **Scope**: All validation rules, security checks, database constraints
- **Response**: Return validation errors in structured format
- **Display**: Inline errors (field-specific) + error summary (top of form)

### Validation Rules

- Required fields marked with red asterisk (\*)
- Error messages specific and actionable (e.g., "Email must include @")
- Invalid state: Red border (2px), red error text, error icon
- Valid state: Return to normal styling (no explicit green/"valid" state)
- Preserve user input on error (don't clear fields)

### Error Display Pattern

- **Inline Errors**: Below each field, red text, 14px, with alert icon
- **Error Summary**: Top of form (if multiple errors), list all field errors
- **Toast Notification**: For non-field errors (network, server errors)
- **Focus Management**: Move focus to first error field on submit

### Progressive Enhancement

- Forms work without JavaScript (standard POST to server actions)
- Client validation enhances UX but isn't required
- Server always validates, regardless of client validation
- Client mirrors server rules to minimize round-trips
