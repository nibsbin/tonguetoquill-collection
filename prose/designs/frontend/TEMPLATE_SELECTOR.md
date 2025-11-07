# Template Selector Widget Design

## Overview

The Template Selector is a custom UI widget that replaces the standard HTML `<select>` dropdown with a scrollable, interactive list that displays template metadata. Each item shows the template name with an info icon that reveals the template's description on hover. This provides better discoverability and user understanding of template options.

## User Experience

### Visual Design

**Closed State**:

```
┌─────────────────────────────────────┐
│ USAF Memo                         ▼ │
└─────────────────────────────────────┘
```

**Open State**:

```
┌─────────────────────────────────────┐
│ ✓ USAF Memo                      ℹ️  │ ← selected, blue background
├─────────────────────────────────────┤
│   Blank Document                 ℹ️  │
├─────────────────────────────────────┤
│   Staff Study                    ℹ️  │
├─────────────────────────────────────┤
│   Talking Paper                  ℹ️  │
└─────────────────────────────────────┘
     ↑                               ↑
  template name            info icon (hover for description)
```

**Info Tooltip** (on hover):

```
┌─────────────────────────────────────┐
│ ✓ USAF Memo                      ℹ️  │
│   ┌───────────────────────────────┐ │
│   │ Standard USAF memorandum      │ │
│   │ format for official           │ │
│   │ correspondence                │ │
│   └───────────────────────────────┘ │
├─────────────────────────────────────┤
│   Blank Document                 ℹ️  │
└─────────────────────────────────────┘
```

### Interaction Patterns

**Opening the Selector**:

- Click on the closed selector box
- Focus with Tab key, then Space or Enter to open
- Shows dropdown list anchored below the selector

**Selecting a Template**:

- Click on any template item
- Keyboard: Arrow keys to navigate, Enter to select
- Close button appears if needed, or closes on selection

**Viewing Descriptions**:

- Hover over info icon (ℹ️) → Tooltip appears immediately
- Keyboard: When item is focused, description shown in accessible manner
- Tooltip positioned to avoid occlusion (typically right-aligned)

**Closing the Selector**:

- Click outside the dropdown
- ESC key
- Select a template (auto-close)
- Click close button (if provided)

### States

**Selected Item**:

- Checkmark icon (✓) on the left
- Primary/accent background color
- Bold text weight
- Visually distinct from other items

**Hover State**:

- Subtle background highlight
- Info icon may change color or scale slightly
- Clear visual feedback for mouse users

**Keyboard Focus State**:

- Focus ring following design system standards (2px USAF blue)
- Same visual treatment as hover state
- Description automatically displayed for screen readers

**Disabled State**:

- Grayed out appearance
- Cursor: not-allowed
- No interaction possible
- Clear indication that selection is unavailable

## Design Principles

### 1. Better Discoverability

**Problem with `<select>`**:

- Descriptions hidden, no way to show metadata
- Users must rely on template names alone
- No preview or explanation of template purpose

**Solution with Custom Widget**:

- Info icons make descriptions visible
- Hover interaction is familiar and non-intrusive
- Users can explore templates before selecting

### 2. Consistent Widget Pattern

This follows the WIDGET_ABSTRACTION.md principles:

- Reusable component architecture
- Composition over configuration
- Dismissal behavior built-in
- Accessibility-first design
- Theme-integrated styling

### 3. Mobile-Friendly

**Touch Targets**:

- Each item: minimum 44px height
- Info icon: 44x44px touch area (visible icon can be smaller)
- Generous spacing between items (8px minimum)

**Touch Interactions**:

- Tap to select (no hover state on mobile)
- Long-press on info icon to show description
- Scroll with finger/thumb on container
- Tap outside to close

### 4. Accessibility First

**Keyboard Navigation**:

- Tab to focus selector trigger
- Space/Enter to open dropdown
- Arrow Up/Down to navigate items
- Home/End to jump to first/last item
- Type-ahead: typing letters jumps to matching items
- Enter to select focused item
- ESC to close without selecting

**Screen Reader Support**:

- Proper ARIA roles: `role="combobox"`, `role="listbox"`, `role="option"`
- ARIA states: `aria-expanded`, `aria-selected`, `aria-activedescendant`
- Description text accessible via `aria-describedby` on each option
- Selected state announced: "USAF Memo, selected, 1 of 4"
- Focus management: Focus moves to selected item when opened

**Visual Indicators**:

- Focus rings on all interactive elements
- High contrast for selected state
- Icons paired with text (never icon-only without labels)
- 4.5:1 contrast ratio for text

## Component Architecture

### Widget Abstraction Decision

**Should this be a reusable base widget?**

**YES** - Create `BaseSelect.svelte` (or `BaseCombobox.svelte`)

**Reasoning**:

1. **General Purpose**: Selection with metadata is a common pattern
   - Settings dropdowns may need descriptions
   - User profile selectors might need metadata
   - File type selectors could show format descriptions
2. **Complexity Justification**: This pattern is complex enough to warrant abstraction
   - Custom positioning logic
   - Keyboard navigation state machine
   - Accessibility requirements (ARIA attributes, focus management)
   - Scrolling container with max-height
   - Hover tooltip positioning
3. **Follows WIDGET_ABSTRACTION.md**:
   - Two-layer architecture: Base widget + Feature implementation
   - Composition via Svelte 5 snippets
   - Dismissal behavior built-in
   - Theme integration via design tokens

4. **Maintenance Benefits**:
   - Bug fixes benefit all selectors
   - Consistent behavior across application
   - Easier to update accessibility features
   - Single source of truth for selection patterns

### Component Structure

**BaseSelect.svelte** (Base Widget Layer):

```
Location: src/lib/components/ui/base-select.svelte

Responsibilities:
- Dropdown positioning and visibility management
- Click outside detection
- ESC key handling
- Keyboard navigation (arrow keys, type-ahead)
- Focus management
- ARIA attributes and announcements
- Scrollable container with max-height
- Selected state tracking
- Item hover states

Does NOT handle:
- Template-specific logic
- Description tooltip content
- Info icon rendering
- Business logic for what items mean
```

**TemplateSelector.svelte** (Feature Component):

```
Location: src/lib/components/NewDocumentDialog/TemplateSelector.svelte

Responsibilities:
- Provide template data to BaseSelect
- Render template items with info icons
- Handle description tooltips
- Manage selected template state
- Integrate with Template Service
- Handle template selection callback

Composes:
- BaseSelect (dropdown mechanics)
- Tooltip component (for descriptions)
- Info icon from icon system
```

### Props Interface

**BaseSelect** (Reusable Widget):

```typescript
interface BaseSelectProps<T> {
	// State management
	value: T; // Currently selected value
	onValueChange: (value: T) => void; // Selection callback
	open?: boolean; // Controlled open state (optional)
	onOpenChange?: (open: boolean) => void; // Open state callback

	// Display
	items: T[]; // Array of selectable items
	getItemKey: (item: T) => string; // Unique key for each item
	getItemLabel: (item: T) => string; // Display label for item
	placeholder?: string; // Placeholder when no selection

	// Behavior
	disabled?: boolean; // Disable interaction
	closeOnSelect?: boolean; // Close dropdown after selection (default: true)
	searchable?: boolean; // Enable type-ahead search (default: true)

	// Styling
	width?: 'trigger' | 'content' | string; // Dropdown width (default: 'trigger')
	maxHeight?: string; // Max height of dropdown (default: '300px')
	align?: 'start' | 'center' | 'end'; // Alignment (default: 'start')
	class?: string; // Additional CSS classes

	// Accessibility
	label?: string; // Accessible label for select
	id?: string; // Unique ID for form integration

	// Content slots (Svelte 5 snippets)
	itemContent?: Snippet<[T]>; // Custom item renderer (required)
	triggerContent?: Snippet<[T | null]>; // Custom trigger content (optional)
}
```

**TemplateSelector** (Feature Implementation):

```typescript
interface TemplateSelectorProps {
	// Required
	templates: TemplateMetadata[]; // List of available templates
	selectedTemplate: string; // Currently selected template file
	onTemplateChange: (file: string) => void; // Template selection callback

	// Optional
	disabled?: boolean; // Disable selector
	label?: string; // Label for the selector
	class?: string; // Additional CSS classes

	// Internal state (not exposed as props)
	// - Tooltip visibility state
	// - Tooltip position calculations
	// - Info icon hover handling
}
```

### Snippet Usage Pattern

**TemplateSelector using BaseSelect**:

```typescript
// Example composition (high-level, not code)
<BaseSelect
  value={selectedTemplate}
  items={templates}
  getItemKey={(t) => t.file}
  getItemLabel={(t) => t.name}
  onValueChange={onTemplateChange}
>
  {#snippet itemContent(template)}
    <div class="template-item">
      <span class="template-name">{template.name}</span>
      <InfoIcon
        description={template.description}
        onHover={showTooltip}
      />
    </div>
  {/snippet}
</BaseSelect>
```

## Visual Specifications

### Dimensions

**Trigger (Closed State)**:

- Height: 36px (h-9, compact for popover)
- Width: 100% of parent container (flexible)
- Padding: 12px horizontal (px-3)
- Border: 1px solid border color

**Dropdown Container**:

- Width: Match trigger width (default)
- Max Height: 300px (scrollable if exceeds)
- Min Height: Fit content (no minimum)
- Padding: 4px vertical (py-1, compact)

**List Items**:

- Height: 40px minimum (h-10) for good touch targets
- Padding: 12px horizontal (px-3)
- Gap between name and info icon: auto (justify-between)

**Info Icon**:

- Visible size: 16px (w-4 h-4)
- Touch target: 44x44px (achieved via padding)
- Icon color: Muted foreground

**Tooltip**:

- Max width: 280px (prevents overly wide tooltips)
- Padding: 8px (p-2, compact)
- Position: Right-aligned, above/below based on space
- Delay: 300ms on hover (prevents accidental triggers)

### Colors & Theme Integration

**Trigger**:

- Background: `bg-background`
- Border: `border-border`
- Text: `text-foreground`
- Disabled: `bg-muted text-muted-foreground cursor-not-allowed`

**Dropdown Container**:

- Background: `bg-surface-elevated`
- Border: `border-border`
- Shadow: `shadow-md`

**List Item (Default)**:

- Background: transparent
- Text: `text-foreground`
- Hover: `bg-accent text-accent-foreground`

**List Item (Selected)**:

- Background: `bg-primary text-primary-foreground`
- Checkmark: visible, same color as text
- Font weight: semibold (font-semibold)

**List Item (Focused, Keyboard)**:

- Same as hover state
- Focus ring: 2px USAF blue (`ring-2 ring-ring`)

**Info Icon**:

- Default: `text-muted-foreground`
- Hover: `text-foreground` (slight emphasis)

**Tooltip**:

- Background: `bg-surface-elevated`
- Border: `border-border`
- Text: `text-foreground text-sm`
- Shadow: `shadow-md`

### Typography

**Trigger Text** (Closed):

- Size: 14px (text-sm)
- Weight: Normal (font-normal)
- Line height: 1.5

**List Item Text**:

- Size: 14px (text-sm)
- Weight: Normal (font-normal), Semibold when selected
- Line height: 1.5

**Tooltip Text**:

- Size: 14px (text-sm)
- Weight: Normal (font-normal)
- Line height: 1.5
- Color: `text-foreground`

### Spacing & Layout

**Trigger Content**:

- Left padding: 12px (space for checkmark when selected)
- Right padding: 32px (space for chevron icon)
- Vertical padding: 8px (py-2)

**List Item Layout**:

- Flexbox: `flex items-center justify-between`
- Left content: Template name
- Right content: Info icon
- Gap: auto (justify-between)

**Scrollable Container**:

- Padding: 4px vertical (py-1)
- Scrollbar styling: System default (for cross-browser consistency)
- Scroll behavior: smooth

**Tooltip Positioning**:

- Offset from icon: 8px (preferred)
- Flip to opposite side if space constrained
- Never occlude trigger or selected item

## Scrolling Behavior

### Container Scrolling

**Max Height**: 300px (approximately 7-8 items visible)

- Small template lists: No scrollbar, fit content
- Large template lists: Scrollbar appears automatically

**Scroll Indicators**:

- Browser-native scrollbar (for consistency)
- No custom scroll indicators initially (can add later)

**Keyboard Scrolling**:

- Arrow keys automatically scroll to keep focused item visible
- `scrollIntoView({ block: 'nearest', behavior: 'smooth' })` on focus change

**Mouse Scrolling**:

- Standard mouse wheel scrolling
- Trackpad scrolling (two-finger scroll)
- Scrollbar drag and click

### Scroll Performance

- Use native scrolling (no custom scroll libraries)
- `overflow-y: auto` on container
- `will-change: scroll-position` for smoother scrolling
- Virtual scrolling NOT needed (template lists are small, <20 items)

## Keyboard Navigation Specification

### Focus Management

**Opening**:

1. Tab to focus trigger
2. Space or Enter opens dropdown
3. Focus moves to selected item (or first item if none selected)
4. Selected item scrolled into view

**Navigation Within Dropdown**:

- **Arrow Down**: Move focus to next item
- **Arrow Up**: Move focus to previous item
- **Home**: Move focus to first item
- **End**: Move focus to last item
- **Page Down**: Move focus down 5 items (or to last)
- **Page Up**: Move focus up 5 items (or to first)

**Type-Ahead Search** (Optional Enhancement):

- Type letters to jump to first matching item
- Matches at start of template name
- Clear search buffer after 1 second of no typing
- Visual indicator of current search term (optional)

**Selection**:

- **Enter**: Select focused item, close dropdown
- **Space**: Select focused item, close dropdown

**Closing Without Selection**:

- **ESC**: Close dropdown, return focus to trigger, no selection change
- **Tab**: Close dropdown, move focus to next element, keep selection

**Focus Return**:

- When dropdown closes (any reason), focus returns to trigger
- Exception: Tab key moves focus forward to next element

### Focus Trap Behavior

**No Focus Trap**: Unlike modals, this dropdown does NOT trap focus

- Tab key closes dropdown and moves focus forward
- Shift+Tab closes dropdown and moves focus backward
- This matches native `<select>` behavior

### ARIA Announcements

**On Open**:

- "Template selector, 4 items available"
- "USAF Memo, selected, 1 of 4" (if item is selected)

**On Navigation**:

- "Blank Document, 2 of 4" (on each arrow key press)
- "Staff Study, description: Multi-page analytical document format" (when focus with info)

**On Selection**:

- "USAF Memo selected" (on Enter/Space)

**On Close**:

- "Template selector collapsed" (on ESC)

## Tooltip Implementation

### Behavior

**Trigger**:

- Mouse hover over info icon: Show after 300ms delay
- Mouse leave: Hide immediately
- Keyboard focus on list item: Show description inline or in live region

**Positioning**:

- Preferred: Right-aligned, 8px offset from icon
- Fallback: Left-aligned if insufficient space on right
- Vertical: Above icon if close to bottom, below otherwise

**Content**:

- Template description from metadata
- Max width: 280px
- Word wrap enabled
- Padding: 8px (p-2)

### Touch Behavior (Mobile)

**Problem**: Hover doesn't exist on touch devices

**Solutions**:

1. **Long-press** on info icon shows description (iOS/Android pattern)
2. **Tap** on info icon toggles description (simpler, but requires tap vs select distinction)
3. **Info sheet** on mobile: Tap icon opens bottom sheet with full description

**Recommendation**: Use **approach #2** (tap to toggle) for simplicity

- Tap item name → Select template and close
- Tap info icon → Show/hide description tooltip (doesn't close dropdown)
- Clear visual feedback that icon is tappable

### Accessibility for Tooltips

**Keyboard Users**:

- When list item is focused, description is included in ARIA announcement
- No separate tooltip interaction needed (description always available)

**Screen Readers**:

- Info icon: `aria-label="Show description"`
- List item: `aria-describedby` points to description element
- Description text: Always present in DOM, visually hidden by default

**Implementation**:

```typescript
// Pseudo-structure (not actual code)
<div role="option" aria-describedby="desc-{template.file}">
  <span>{template.name}</span>
  <button aria-label="Show description" onclick={toggleTooltip}>
    <InfoIcon />
  </button>
  <div id="desc-{template.file}" class="sr-only">
    {template.description}
  </div>
</div>
```

## Integration with NewDocumentDialog

### Layout Integration

**Current Layout** (In-line label):

```
Template:  [Dropdown ▼                    ]
Name:      [Text Input                    ]
```

**Updated Layout**:

```
Template:  [USAF Memo                   ▼ ]  ← BaseSelect trigger
Name:      [Text Input                    ]
```

**On Open**:

```
Template:  [USAF Memo                   ▼ ]
           ┌─────────────────────────────┐
           │ ✓ USAF Memo               ℹ️ │
           │   Blank Document          ℹ️ │
           │   Staff Study             ℹ️ │
           │   Talking Paper           ℹ️ │
           └─────────────────────────────┘
Name:      [Text Input                    ]
```

### State Management

**TemplateSelector State** (Internal):

- `open` - Whether dropdown is open
- `focusedIndex` - Current keyboard-focused item
- `tooltipVisible` - Which tooltip (if any) is showing
- `searchBuffer` - Type-ahead search accumulator

**NewDocumentDialog State** (External):

- `selectedTemplate` - Currently selected template file (passed to TemplateSelector)
- `onTemplateChange` - Callback when selection changes

### Props Flow

**NewDocumentDialog → TemplateSelector**:

```typescript
<TemplateSelector
  templates={templates}
  selectedTemplate={selectedTemplate}
  onTemplateChange={(file) => selectedTemplate = file}
  disabled={isCreating || !templatesReady}
  label="Template"
/>
```

**TemplateSelector → BaseSelect**:

```typescript
<BaseSelect
  value={selectedTemplate}
  items={templates}
  getItemKey={(t) => t.file}
  getItemLabel={(t) => t.name}
  onValueChange={onTemplateChange}
  disabled={disabled}
  label={label}
>
  {#snippet itemContent(template)}
    <!-- Template item with info icon -->
  {/snippet}
</BaseSelect>
```

## Responsive Design

### Desktop (≥1024px)

**Layout**: As designed, dropdown appears below trigger
**Interaction**: Mouse hover for info icons
**Scrolling**: Mouse wheel, scrollbar drag

### Tablet (768px - 1023px)

**Layout**: Same as desktop
**Interaction**: Touch events for selection and info icons
**Scrolling**: Touch swipe, scrollbar drag

### Mobile (<768px)

**Layout**:

- Dropdown full-width within popover
- May consider bottom sheet alternative for very small screens
  **Interaction**:
- Tap to select
- Tap info icon to toggle description
- Long-press alternative considered but not required for MVP
  **Scrolling**: Touch swipe

### Breakpoint Adaptations

**No major layout changes**: Component is already compact and mobile-friendly
**Touch Target Enforcement**: Ensure 44px minimum on all breakpoints
**Tooltip Positioning**: More aggressive fallback to prevent off-screen tooltips

## Performance Considerations

### Rendering Optimization

**Initial Render**:

- Render trigger immediately
- Defer dropdown rendering until opened (conditional rendering)
- Template list is small (<20 items), no virtualization needed

**Tooltip Rendering**:

- Tooltips rendered lazily (only when needed)
- Use single tooltip instance, reposition and update content
- Avoid rendering N tooltip elements (one per item)

**Event Handlers**:

- Debounce tooltip hover: 300ms delay prevents unnecessary renders
- Throttle keyboard navigation: Not needed (arrow keys are sequential)

### Memory Footprint

**Small Impact**:

- ~10-15 template items
- Each item: ~100-200 bytes (name, description, file, production flag)
- Total: <5KB additional memory
- No concern for performance

### Accessibility Performance

**ARIA Live Regions**:

- Use single `aria-live="polite"` region for announcements
- Update content on navigation, avoid creating/destroying elements

**Focus Management**:

- Use native focus where possible (avoid JavaScript focus() calls)
- `scrollIntoView` is performant for small lists

## Testing Strategy

### Unit Tests

**BaseSelect Component**:

- Renders with provided items
- Opens/closes on click and keyboard
- Selects item on click and keyboard
- Keyboard navigation (arrow keys, home, end)
- Type-ahead search (if implemented)
- Calls onValueChange callback with correct value
- ARIA attributes present and correct
- Focus management works correctly

**TemplateSelector Component**:

- Renders template items with info icons
- Shows/hides tooltips on hover
- Passes correct data to BaseSelect
- Handles template selection callback
- Disabled state works correctly

### Integration Tests

**NewDocumentDialog Integration**:

- TemplateSelector integrates with dialog layout
- Template selection updates selectedTemplate state
- Document name auto-populates on template change
- Selector works while dialog is open
- Selector closes properly with dialog

### Accessibility Tests

**Keyboard Navigation**:

- Tab to focus selector
- Space/Enter opens dropdown
- Arrow keys navigate items
- Enter selects item
- ESC closes without selection
- Focus returns to trigger on close

**Screen Reader Tests**:

- ARIA roles correct (`combobox`, `listbox`, `option`)
- ARIA states announced (`aria-expanded`, `aria-selected`)
- Descriptions associated with items
- Selection changes announced
- Focus changes announced

**Visual Tests**:

- Focus indicators visible
- Color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI)
- Selected state visually distinct
- Hover states clear and obvious

### Manual Tests

**Cross-Browser**:

- Chrome (primary target)
- Firefox
- Safari (macOS)
- Edge
- Mobile Safari (iOS)
- Mobile Chrome (Android)

**Interaction Tests**:

- Mouse click selection
- Keyboard selection
- Touch selection (mobile)
- Tooltip hover (desktop)
- Tooltip tap (mobile)
- Scrolling long lists
- Disabled state

## Future Enhancements

### Potential Additions (Post-MVP)

**Search/Filter**:

- Text input at top of dropdown
- Filter templates by name or description
- Clear search button
- Keyboard shortcut to focus search (Ctrl+F)

**Template Preview**:

- Hover over item → Show mini preview of template content
- Click info icon → Show full preview in modal
- Thumbnail images for templates

**Template Categories**:

- Group templates by category (Memos, Studies, Papers)
- Collapsible category headers
- Filter by category

**Custom Templates**:

- User-created templates in separate section
- "Add Custom Template" button
- Import/export templates

**Recent Templates**:

- Show recently used templates at top
- Separate "Recent" and "All Templates" sections
- Pin favorite templates

**Keyboard Shortcuts**:

- Configurable shortcuts to select specific templates
- Quick-switch between templates (Ctrl+1, Ctrl+2, etc.)

**Advanced Tooltips**:

- Richer content (images, formatting, links)
- "Learn more" links to template documentation
- Template version history

## Non-Goals

These are explicitly out of scope:

**Template Editing**: Selector only selects templates, doesn't edit them
**Template Creation**: Creation happens elsewhere, not in selector
**Multi-Select**: Only single template selection supported
**Drag-and-Drop**: No drag-to-reorder or drag-to-select
**Template Comparison**: No side-by-side template comparison
**Inline Template Preview**: No embedded preview in dropdown (too complex)

## Cross-References

- [WIDGET_ABSTRACTION.md](./WIDGET_ABSTRACTION.md) - Base widget patterns
- [NEW_DOCUMENT.md](./NEW_DOCUMENT.md) - NewDocumentDialog integration
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Colors, typography, spacing
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - WCAG AA compliance requirements
- [TEMPLATE_SERVICE.md](../backend/TEMPLATE_SERVICE.md) - Template data source
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - State handling patterns
