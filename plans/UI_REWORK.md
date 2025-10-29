# UI Rework Plan

## Overview

This document outlines a plan to rework the current UI implementation to align with the desired UI layout and theming demonstrated in `designs/legacy/mock_project`. The mock project serves as the reference implementation, showcasing the target user experience, visual design, and component structure.

## Background

The `designs/legacy/mock_project` contains a minimal React frontend that demonstrates the desired UI layout and theming for Tonguetoquill. While our target implementation uses SvelteKit 5 instead of React, the visual design, component structure, and user interactions from the mock project should be preserved.

## Key Design Elements from Mock Project

### Visual Design & Theming

**Color Palette:**
- Background: `zinc-900` (main background, `#18181b`)
- Elevated surfaces: `zinc-800` (sidebar, top menu, toolbar, `#27272a`)
- Borders: `zinc-700` (`#3f3f46`)
- Text primary: `zinc-100` (`#f4f4f5`)
- Text secondary: `zinc-300` (`#d4d4d8`)
- Text muted: `zinc-400` (`#a1a1aa`)
- Text hover: `zinc-100` (bright white on hover)
- Hover background: `zinc-700`
- Selected state: `zinc-700` background

**Typography:**
- UI Font: `'Lato', Arial, sans-serif` (sans-serif stack)
- Editor Font: Monospace stack for code editing
- Preview Font: `'Crimson Text'` (serif stack) for professional document rendering
- Base size: 16px
- Weight variations: 400 (normal), 500 (medium), 700 (bold)

**Design Tokens:**
- Border radius: 10px (`--radius: 0.625rem`)
- Transitions: 300ms for state changes
- Spacing: 4px base unit
- Focus indicators: outline on interactive elements

### Layout Structure

**Application Layout:**
```
┌─────────────┬────────────────────────────────────────┐
│   Sidebar   │            Top Menu                    │
│   (48-56px  │  (48px height)                         │
│   collapsed │                                        │
│   224px     │────────────────────────────────────────│
│   expanded) │                                        │
│             │   Editor         │   Preview           │
│             │   (50% width)    │   (50% width)       │
│             │   - Toolbar      │   - White BG        │
│             │   - Editor       │   - Rendered MD     │
│             │                  │                     │
└─────────────┴──────────────────┴─────────────────────┘
```

**Sidebar Layout:**
- Header: Hamburger menu button + "Tonguetoquill" title (centered when expanded)
- Logo: Centered below header
- Separator
- Content: "New File" button + file list (scrollable)
- Footer (sticky bottom): Profile button + Settings button

**Sidebar States:**
- Collapsed: 48px width (icons only, tooltips on hover)
- Expanded: 224px width (icons + text labels)
- Mobile: Full-screen drawer overlay (Sheet component)
- Transition: 300ms smooth animation

**Top Menu:**
- Height: 48px
- Left: Document name display
- Right: Download button (bordered group) + More actions menu (meatball menu)
- Background: `zinc-800`
- Border bottom: `zinc-700`

**Editor Toolbar:**
- Height: 48px
- Left: Formatting buttons (Bold, Italic, Strikethrough, Code, Quote, Lists, Link)
- Separators between button groups
- Right: Mode toggle tabs (Markdown/Wizard)
- Icon-only buttons (28px square)
- Background: `zinc-800`

**Editor Section:**
- Background: `zinc-900`
- Font: Monospace
- Color: `zinc-100`
- Padding: 16px
- Placeholder text in `zinc-500`

**Preview Section:**
- Background: `white` (not dark theme)
- Prose styling with proper typography
- Max width: none (full container)
- Padding: 24px
- Professional document appearance

### Component Patterns

**Buttons:**
- Ghost variant: Transparent background, hover to `zinc-700`
- Icon size: 16px (h-4 w-4) or 20px (h-5 w-5)
- Text color: `zinc-400` default, `zinc-100` on hover
- Height variants: Small (28px, h-7), Medium (32px, h-8), Standard (40px)

**File List Items:**
- Group structure with hover state
- Left: File icon (16px) + filename (truncate with ellipsis)
- Right: Delete button (visible on group hover)
- Active state: `zinc-700` background
- Text: `zinc-100` when active, `zinc-400` when inactive

**Settings Popover:**
- Trigger: Settings gear icon in sidebar footer
- Content: White text on `zinc-800` background
- Border: `zinc-700`
- Switches for: Auto-save, Dark Theme, Line Numbers
- Side placement: "right"
- Align: "end"

**Dropdown Menu (More Actions):**
- Trigger: Meatball (three vertical dots) icon
- Content: Menu items with icons + text
- Hover state: `zinc-700` background
- Icons: 16px
- Separators between groups
- External link indicator for items that open new tabs

**Toast Notifications:**
- Uses Sonner library
- Appears top-right or bottom-right
- Auto-dismiss timing
- Success/error variants

### Interactive Behaviors

**Sidebar Toggle:**
- Smooth 300ms transition
- Icons fade in/out during transition
- Text labels appear/disappear
- Tooltips show on collapsed state hover
- State persists in localStorage

**File Operations:**
- New file: Immediate creation with default name
- Select file: Change active state, load content
- Delete file: Show confirmation (only if not last file)
- Toast notification on success/error

**Formatting Toolbar:**
- Icon-only buttons for space efficiency
- Tooltips show keyboard shortcuts
- Apply formatting to selected text or at cursor
- Visual feedback on button click

**Mode Toggle (Markdown/Wizard):**
- Tab-based selection
- Active tab: `zinc-700` background, `zinc-100` text
- Inactive tab: Transparent background, `zinc-400` text
- Small compact tabs (height: 24px)

## Migration Strategy

### Phase 1: Design Token Updates

**Objective:** Update design tokens to match mock project exactly

**Tasks:**
1. Update color palette in Tailwind config and CSS variables
   - Ensure zinc-900, zinc-800, zinc-700 match mock values
   - Update text colors to zinc-100, zinc-300, zinc-400
   - Verify contrast ratios still meet WCAG AA (4.5:1)

2. Update typography tokens
   - Change UI font to Lato (with fallback stack)
   - Change preview font to Crimson Text (with fallback stack)
   - Keep editor font as monospace stack
   - Add font import from Google Fonts

3. Update component sizing
   - Top menu: 48px height
   - Toolbar: 48px height
   - Sidebar collapsed: 48px width
   - Sidebar expanded: 224px width (reduced from current 256px)
   - Button heights: 28px (small), 32px (medium), 40px (standard)

4. Update border radius
   - Set `--radius` to 0.625rem (10px)
   - Update all derived radius values

**Deliverable:** Updated `tailwind.config.js`, CSS variables, and font imports

### Phase 2: Sidebar Component Rework

**Objective:** Match sidebar structure and behavior to mock project

**Tasks:**
1. Update sidebar header
   - Position hamburger menu on left
   - Add "Tonguetoquill" text (centered, fades on collapse)
   - Add logo image below header (centered)

2. Update sidebar content
   - "New File" button with Plus icon
   - File list with proper hover/active states
   - Delete button (visible on hover)
   - Truncate long filenames with ellipsis

3. Update sidebar footer
   - Add Profile button (User icon)
   - Keep Settings button (Gear icon)
   - Sticky positioning at bottom

4. Update collapse behavior
   - 48px collapsed width (not 64px)
   - Smooth 300ms transition
   - Tooltips on collapsed icons
   - Persist state to localStorage

5. Mobile drawer implementation
   - Full-screen overlay
   - Backdrop dismissal
   - Proper focus management

**Deliverable:** Updated Sidebar component matching mock design

### Phase 3: Top Menu Rework

**Objective:** Simplify top menu to match mock project

**Tasks:**
1. Update layout
   - Left: Document name only (no icon)
   - Right: Download button + More menu

2. Style download button
   - Bordered group (subtle border)
   - Download icon + "Download" text
   - Ghost button style

3. Update more actions menu
   - Meatball icon (three vertical dots)
   - Menu items with icons
   - Proper separators
   - External link indicators

4. Remove save status indicator (if present)
   - Auto-save happens silently in background
   - Only show errors via toast

**Deliverable:** Updated TopMenu component matching mock design

### Phase 4: Editor Toolbar Update

**Objective:** Match toolbar structure and styling

**Tasks:**
1. Update button layout
   - Icon-only buttons (28px square)
   - Proper separators between groups
   - Left-aligned formatting buttons
   - Right-aligned mode toggle

2. Add mode toggle tabs
   - Markdown/Wizard tabs
   - Compact tab design (24px height)
   - Active state styling

3. Update button styling
   - Icon size: 16px
   - Colors: `zinc-400` default, `zinc-100` hover
   - Hover background: `zinc-700`
   - Tooltips with keyboard shortcuts

**Deliverable:** Updated EditorToolbar component matching mock design

### Phase 5: Editor and Preview Styling

**Objective:** Match editor and preview appearance

**Tasks:**
1. Update editor styling
   - Background: `zinc-900`
   - Text: `zinc-100`
   - Monospace font
   - Proper padding (16px)
   - Remove line numbers (can be re-added via settings)

2. Update preview styling
   - White background (not dark)
   - Proper prose styling
   - Crimson Text font for body
   - Full-width (no max-width constraint)
   - Proper padding (24px)

3. Update split layout
   - 50/50 split between editor and preview
   - Vertical border between panes
   - No resizer for MVP (can be added later)

**Deliverable:** Updated editor and preview components with correct styling

### Phase 6: Settings Implementation

**Objective:** Add settings popover matching mock design

**Tasks:**
1. Create settings popover
   - Trigger from Settings button in sidebar
   - Side placement: right
   - Align: end

2. Add settings options
   - Auto-save toggle switch
   - Dark theme toggle (disabled/hidden for MVP since only dark theme)
   - Line numbers toggle
   - Other preferences as needed

3. Implement switch component
   - Proper styling to match mock
   - Accessible keyboard interaction
   - Persist settings to localStorage

**Deliverable:** Settings popover component with toggle switches

### Phase 7: Responsive Behavior

**Objective:** Ensure mobile/tablet behavior matches design system

**Tasks:**
1. Mobile layout (< 768px)
   - Sidebar as full-screen drawer
   - Tabbed editor/preview (not split)
   - Condensed top menu

2. Tablet layout (768px - 1023px)
   - Sidebar as drawer overlay
   - Split or tabbed view based on available space

3. Desktop layout (≥ 1024px)
   - Persistent sidebar
   - Split editor/preview

**Deliverable:** Responsive layouts at all breakpoints

### Phase 8: Polish and Refinement

**Objective:** Final polish to match mock project feel

**Tasks:**
1. Animation refinement
   - Ensure all transitions are 300ms
   - Smooth fade-in/fade-out effects
   - Respect prefers-reduced-motion

2. Interaction polish
   - Hover states consistent
   - Focus indicators visible
   - Active states clear

3. Accessibility verification
   - Keyboard navigation works
   - Screen reader labels correct
   - ARIA attributes proper
   - Color contrast verified

4. Testing
   - Visual comparison with mock project
   - Cross-browser testing
   - Mobile device testing
   - Accessibility testing

**Deliverable:** Polished UI matching mock project in look and feel

## Success Criteria

### Visual Match
- [ ] Color palette matches mock project exactly
- [ ] Typography (fonts, sizes, weights) matches
- [ ] Spacing and sizing matches
- [ ] Component styling matches

### Functional Match
- [ ] Sidebar collapse/expand behavior matches
- [ ] File list interactions match
- [ ] Settings popover behavior matches
- [ ] Toolbar formatting buttons match
- [ ] Mode toggle works as expected

### Responsive Behavior
- [ ] Mobile layout matches design system
- [ ] Tablet layout matches design system
- [ ] Desktop layout matches mock project

### Accessibility
- [ ] All WCAG AA requirements met
- [ ] Keyboard navigation complete
- [ ] Screen reader compatible
- [ ] Focus indicators visible

### Quality
- [ ] No regressions in existing functionality
- [ ] Performance maintained or improved
- [ ] Code quality maintained
- [ ] Documentation updated

## Dependencies

- shadcn-svelte components (Button, Sheet, Popover, Switch, etc.)
- Tailwind CSS 4.0 configuration
- Google Fonts (Lato, Crimson Text)
- Lucide icons
- Sonner toast library

## Timeline Estimate

- Phase 1: Design Token Updates - 4 hours
- Phase 2: Sidebar Component Rework - 8 hours
- Phase 3: Top Menu Rework - 4 hours
- Phase 4: Editor Toolbar Update - 4 hours
- Phase 5: Editor and Preview Styling - 4 hours
- Phase 6: Settings Implementation - 6 hours
- Phase 7: Responsive Behavior - 8 hours
- Phase 8: Polish and Refinement - 8 hours

**Total Estimated Time:** 46 hours (~1 week for full-time development)

## Risks and Mitigations

**Risk:** Breaking existing functionality during UI updates
**Mitigation:** Incremental updates with testing after each phase; maintain existing component contracts

**Risk:** Accessibility regression
**Mitigation:** Test keyboard navigation and screen reader compatibility after each phase

**Risk:** Performance degradation
**Mitigation:** Monitor bundle size and runtime performance; avoid unnecessary re-renders

**Risk:** Design inconsistencies between components
**Mitigation:** Strict adherence to design tokens; regular visual comparison with mock project

## Notes

- The mock project uses React, but we're implementing in SvelteKit. Focus on visual design and user experience, not implementation details.
- Maintain Section 508 compliance throughout the rework.
- Preserve all existing functionality; this is a visual/UX update, not a feature change.
- Document all significant deviations from mock project with justification.

## References

- **Mock Project**: `designs/legacy/mock_project/`
- **Design System**: `designs/frontend/DESIGN_SYSTEM.md`
- **UI Components**: `designs/frontend/UI_COMPONENTS.md`
- **Architecture**: `designs/frontend/ARCHITECTURE.md`
- **MVP Plan**: `plans/MVP_PLAN.md`
