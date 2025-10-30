# Sidebar Redesign Implementation Plan

## Overview

This plan outlines the implementation of the redesigned sidebar component based on the Claude AI sidebar design patterns while maintaining existing functionality, color palette, and transition timings.

## References

- **Design Document**: `prose/designs/frontend/SIDEBAR.md`
- **Current Implementation**: `src/lib/components/Sidebar.svelte`
- **Inspiration**: `prose/claude-theme/claude-sidebar.html`
- **Design System**: `prose/designs/frontend/DESIGN_SYSTEM.md`

## Goals

1. ✅ Modernize sidebar proportions and spacing
2. ✅ Enhance interactive behaviors with smooth animations
3. ✅ Improve visual hierarchy and information architecture
4. ✅ Maintain all existing functionality
5. ✅ Keep existing color palette and transition timings
6. ✅ Ensure responsive behavior on mobile and desktop
7. ⏳ Abstract button slot logic into reusable component

## Phase 0: Button Slot Component Abstraction

### Tasks

- [x] **Create semantic CSS tokens for button slots**
  - Add `--sidebar-slot-width-collapsed` token (equals `--sidebar-collapsed-width`)
  - Add `--sidebar-slot-height` token (equals `--sidebar-collapsed-width` for square aspect)
  - Add `--sidebar-button-spacing` derived token for centering calculations
  - Document token relationships and DRY principles

- [x] **Create SidebarButtonSlot component**
  - File: `src/lib/components/SidebarButtonSlot.svelte`
  - Three-layer architecture: Slot → Button → Icon
  - Slot layer: Square container of `--sidebar-collapsed-width` size, expands horizontally when sidebar expands
  - Button layer: Square of `--sidebar-button-size`, centered in slot
  - Icon layer: Square of `--sidebar-icon-size`, centered in button
  - Props: `icon`, `label`, `variant`, `onclick`, `ariaLabel`, `isExpanded`, and standard button props
  - Support both icon-only and icon+label states
  - Maintain consistent padding in collapsed and expanded states

- [x] **Refactor Sidebar.svelte to use SidebarButtonSlot**
  - Replace hamburger/menu button with SidebarButtonSlot
  - Replace New File button with SidebarButtonSlot
  - Replace User Profile button with SidebarButtonSlot
  - Replace Settings button with SidebarButtonSlot (wrapped in slot container)
  - Remove redundant CSS classes from Sidebar.svelte
  - Ensure all button behaviors are preserved

- [x] **Update CSS in app.css**
  - Add new semantic tokens to `:root`
  - Keep existing tokens for backward compatibility
  - Add comments explaining token relationships

### Files to Create/Modify

- Create: `src/lib/components/SidebarButtonSlot.svelte` ✓
- Modify: `src/lib/components/Sidebar.svelte` ✓
- Modify: `src/app.css` ✓

### Acceptance Criteria

- [x] Button slots are perfect squares in collapsed state
- [x] Buttons are centered within slots in both states
- [x] Icons are centered within buttons
- [x] Horizontal expansion works smoothly when sidebar expands
- [x] All existing functionality preserved
- [x] Code is more DRY and maintainable
- [x] No visual regressions

## Phase 1: Update Dimensions and Structure

### Tasks

- [ ] **Update container dimensions**
  - Change expanded width from `w-56` (224px) to `w-72` (288px / 18rem)
  - Keep collapsed width at `w-12` (48px / 3rem)
  - Maintain 300ms transition duration
  - Use `cubic-bezier(0.165, 0.85, 0.45, 1)` easing function

- [ ] **Adjust section heights and spacing**
  - Header section: `h-12` (48px)
  - Primary action buttons: `h-9` (36px)
  - Navigation items: `h-9` (36px)
  - Recent items: `h-8` (32px)
  - Footer (user/settings): `h-9` (36px) + padding

- [ ] **Update padding and margins**
  - Container padding: `px-2` (8px horizontal)
  - Section padding: `p-2` (8px all around)
  - Button padding: `px-4 py-2` for most buttons
  - Item gaps: `gap-px` or `gap-1` between items

### Files to Modify

- `src/lib/components/Sidebar.svelte`

### Acceptance Criteria

- Sidebar expanded width is 288px
- All sections have correct heights
- Spacing matches Claude sidebar patterns
- Transitions remain smooth at 300ms

## Phase 2: Enhance Button Styles and States

### Tasks

- [ ] **Update button variants**
  - Ensure ghost buttons use transparent background by default
  - Add hover state: `hover:bg-bg-400` (zinc-800/50)
  - Add active/press effect: `active:scale-[0.985]`
  - Selected items: `bg-bg-400` with `active:scale-[1.0]`

- [ ] **Implement primary action button styling**
  - Create New File button with rounded pill style
  - Add icon container: `w-6 h-6 rounded-full`
  - Background: `bg-accent-main-000` (USAF Blue)
  - Text: `text-accent-main-100 font-medium text-sm`
  - Hover: `hover:bg-accent-main-000/[0.08]`

- [ ] **Add hover scale effects**
  - Icon buttons: `active:scale-95`
  - List items: `active:scale-[0.985]`
  - Active items: no scale effect (`active:!scale-100`)

### Files to Modify

- `src/lib/components/Sidebar.svelte`
- `src/lib/components/ui/button.svelte` (if needed for new variants)

### Acceptance Criteria

- Buttons have proper hover and active states
- Press animations work smoothly
- Primary action button stands out visually
- All transitions use 300ms duration

## Phase 3: Add Icon Animations

### Tasks

- [ ] **Implement toggle button dual-icon animation**
  - Create container with relative positioning
  - Add two icon layers (default and hover)
  - Default: `scale-100 opacity-100`
  - Hover: default fades to `scale-80 opacity-0`, hover icon fades in
  - Smooth transition between states

- [ ] **Add navigation icon hover effects**
  - Plus icon: `group-hover:scale-105 transition`
  - File/document icons: subtle translate effects
  - Settings icon: potential rotation on hover
  - User icon: no transform (keep stable)

- [ ] **Implement recent items icon behaviors**
  - Keep icons simple for recent items
  - Focus on text truncation and masking
  - Options button fade-in on hover

### Files to Modify

- `src/lib/components/Sidebar.svelte`

### Acceptance Criteria

- Icons animate smoothly on hover
- Toggle button shows dual icons with smooth transition
- All animations complete within 200-300ms
- No janky or delayed animations

## Phase 4: Improve Visual Hierarchy

### Tasks

- [ ] **Add section headers**
  - Create "Recents" header: `text-xs text-text-300`
  - Sticky positioning: `sticky top-0 z-10`
  - Gradient background: `bg-gradient-to-b from-bg-200 from-50% to-bg-200/40`
  - Padding: `pb-2 mt-1 pl-2`

- [ ] **Implement scrollable recent items list**
  - Container: `overflow-y-auto overflow-x-hidden`
  - Add bottom gradient fade
  - Gradient: `bg-gradient-to-t from-bg-200 to-transparent`
  - Height: `h-4` sticky at bottom

- [ ] **Update typography**
  - App title: `text-sm font-medium` (increased from current)
  - Navigation: `text-sm` font-normal
  - Recent items: `text-xs` 
  - Section headers: `text-xs text-text-300`

- [ ] **Implement text truncation with gradient mask**
  - Recent items: base truncation with ellipsis
  - On hover: gradient mask for smooth fade
  - Mask: `[mask-image:linear-gradient(to_right,hsl(var(--always-black))_78%,transparent_95%)]`

### Files to Modify

- `src/lib/components/Sidebar.svelte`
- `src/app.css` (for gradient mask CSS custom properties if needed)

### Acceptance Criteria

- Section headers clearly separate content
- Recent items scroll smoothly
- Text truncates properly
- Gradient masks work on hover
- Typography hierarchy is clear

## Phase 5: Enhance List Item Interactions

### Tasks

- [ ] **Update recent items structure**
  - Use group pattern for hover states
  - Base height: `h-8` with `px-3` padding
  - Text size: `text-xs`
  - Hover background: `hover:bg-bg-400`

- [ ] **Implement options button reveal**
  - Position: `absolute right-0 top-1/2 -translate-y-1/2`
  - Default: `hidden`
  - On hover: `group-hover:block` or `group-focus-within:block`
  - Size: `h-8 w-8`
  - Icon: three-dot menu (More icon)

- [ ] **Add delete button interaction**
  - Position on right side of item
  - Fade in on group hover: `opacity-0 group-hover:opacity-100`
  - Color: `text-muted-foreground hover:text-red-400`
  - Size: `h-8 w-8`
  - Confirmation dialog on click (already implemented)

- [ ] **Update active state styling**
  - Active item: `bg-bg-400`
  - Active text: `text-text-100 font-medium`
  - No hover scale on active items

### Files to Modify

- `src/lib/components/Sidebar.svelte`

### Acceptance Criteria

- Recent items show options button on hover
- Delete button appears on hover
- Active item is clearly highlighted
- Hover states don't interfere with click targets

## Phase 6: Polish Footer Section

### Tasks

- [ ] **Redesign user profile button**
  - Layout: `flex flex-row items-center justify-between`
  - Avatar: `size-8 rounded-full bg-text-200 text-bg-100`
  - User info: flex column with name and plan
  - Name: `text-sm` truncate
  - Plan/email: `text-xs text-text-300` truncate
  - Chevron: `w-3.5 h-3.5 flex-shrink-0 mr-2`

- [ ] **Update settings button**
  - Keep settings in popover/menu
  - Match navigation button style
  - Proper icon and text alignment

- [ ] **Add bottom padding**
  - Container: `px-2 pb-1`
  - Button: `px-1.5 py-6` (increased vertical padding)
  - Gap between avatar and text: `gap-3`

### Files to Modify

- `src/lib/components/Sidebar.svelte`

### Acceptance Criteria

- User profile shows avatar, name, and plan
- Text truncates properly when sidebar is expanded
- Settings button remains accessible
- Footer has proper spacing from content

## Phase 7: Mobile Responsive Refinements

### Tasks

- [ ] **Update mobile drawer width**
  - Change from `w-56` to `w-72` (288px)
  - Ensure smooth slide-in animation
  - Maintain shadow: `shadow-lg`

- [ ] **Verify hamburger menu button**
  - Position: `fixed top-2 left-2 z-40`
  - Size: icon size `h-5 w-5`
  - Show only on mobile: `lg:hidden`
  - Proper ARIA labels

- [ ] **Test drawer overlay**
  - Backdrop click closes drawer
  - Escape key closes drawer
  - Proper z-index layering
  - Body scroll lock when open

- [ ] **Optimize touch targets**
  - All buttons minimum 44x44px on mobile
  - Proper spacing between interactive elements
  - Easy to tap without mis-clicks

### Files to Modify

- `src/lib/components/Sidebar.svelte`
- `src/lib/components/ui/sheet.svelte` (if needed)

### Acceptance Criteria

- Mobile drawer is 288px wide
- Hamburger menu is easily accessible
- Drawer opens and closes smoothly
- Touch targets are appropriately sized
- No layout issues on small screens

## Phase 8: Accessibility Improvements

### Tasks

- [ ] **Add ARIA labels**
  - Toggle button: `aria-label` with expanded state
  - Navigation items: `aria-current="page"` for active
  - Icon-only buttons: descriptive `aria-label`
  - Sidebar: `role="navigation"` or `role="complementary"`

- [ ] **Implement keyboard navigation**
  - Proper focus order
  - Visible focus indicators
  - Escape closes mobile drawer
  - Tab navigation through all interactive elements

- [ ] **Test with screen readers**
  - Meaningful announcements
  - Button purposes clear
  - State changes announced
  - No confusion with icon-only buttons

- [ ] **Ensure color contrast**
  - All text meets WCAG AA standards
  - Focus indicators are visible
  - Interactive states are distinguishable

### Files to Modify

- `src/lib/components/Sidebar.svelte`

### Acceptance Criteria

- All interactive elements have proper ARIA attributes
- Keyboard navigation works smoothly
- Screen reader announces changes correctly
- Color contrast ratios meet WCAG AA
- Focus indicators are clearly visible

## Phase 9: Testing and Validation

### Tasks

- [ ] **Visual regression testing**
  - Compare with design mockups
  - Test all states (expanded, collapsed, mobile)
  - Verify animations and transitions
  - Check alignment and spacing

- [ ] **Functional testing**
  - Create new file
  - Select documents
  - Delete documents
  - Toggle sidebar
  - Open settings
  - Mobile drawer interactions

- [ ] **Responsive testing**
  - Test at breakpoints: 320px, 768px, 1024px, 1920px
  - Verify mobile drawer behavior
  - Check desktop sidebar transitions
  - Test landscape and portrait orientations

- [ ] **Performance testing**
  - Check animation frame rates
  - Verify no layout thrashing
  - Test with long document lists
  - Monitor memory usage

- [ ] **Accessibility testing**
  - WAVE or axe browser extension
  - Keyboard-only navigation
  - Screen reader testing (NVDA/JAWS)
  - Color contrast validation

### Files to Test

- `src/lib/components/Sidebar.svelte`
- All pages that include the sidebar

### Acceptance Criteria

- All visual elements match design
- All functionality works as expected
- Responsive behavior is correct at all breakpoints
- Performance is smooth (60fps animations)
- Passes accessibility audits

## Phase 10: Documentation and Cleanup

### Tasks

- [ ] **Update component documentation**
  - Add JSDoc comments to complex functions
  - Document props and their types
  - Explain state management
  - Note any gotchas or edge cases

- [ ] **Clean up code**
  - Remove commented-out code
  - Consolidate duplicate styles
  - Simplify complex conditionals
  - Ensure consistent formatting

- [ ] **Update design system docs**
  - Document new patterns used
  - Add sidebar to component examples
  - Update color token usage
  - Note animation patterns

- [ ] **Create migration notes**
  - Document breaking changes (if any)
  - Note new dependencies
  - Explain new features
  - Provide upgrade path

### Files to Update

- `src/lib/components/Sidebar.svelte`
- `prose/designs/frontend/SIDEBAR.md`
- `README.md` or component docs

### Acceptance Criteria

- Code is well-documented
- No unnecessary code remains
- Design docs are up to date
- Migration path is clear

## Implementation Order

Recommended sequence to minimize disruption:

1. **Phase 1** → Update dimensions (low risk, visual change only)
2. **Phase 2** → Button styles (builds on Phase 1)
3. **Phase 4** → Visual hierarchy (can be done in parallel with Phase 3)
4. **Phase 3** → Icon animations (polish, can be iterated)
5. **Phase 5** → List interactions (builds on Phase 4)
6. **Phase 6** → Footer polish (independent)
7. **Phase 7** → Mobile refinements (test earlier phases on mobile)
8. **Phase 8** → Accessibility (can be done throughout)
9. **Phase 9** → Testing (comprehensive validation)
10. **Phase 10** → Documentation (final step)

## Risks and Mitigation

### Risk: Animations cause performance issues
**Mitigation**: 
- Use CSS transforms (GPU-accelerated)
- Avoid animating layout properties
- Test on low-end devices
- Provide reduced motion option

### Risk: Breaking existing functionality
**Mitigation**:
- Maintain all existing props and events
- Test each phase thoroughly
- Keep git history clean for easy rollback
- Feature flags for gradual rollout (if applicable)

### Risk: Mobile responsiveness issues
**Mitigation**:
- Test early and often on real devices
- Use mobile-first approach
- Ensure touch targets are large enough
- Test landscape and portrait modes

### Risk: Accessibility regressions
**Mitigation**:
- Run automated accessibility tests
- Manual keyboard testing
- Screen reader validation
- Maintain ARIA attributes throughout

## Success Metrics

- [ ] Sidebar expanded width is 288px
- [ ] All animations complete in 200-300ms
- [ ] No visual regressions from current design
- [ ] All functionality preserved
- [ ] Passes WCAG AA accessibility standards
- [ ] Smooth 60fps animations
- [ ] Mobile drawer works on all devices
- [ ] No console errors or warnings

## Timeline Estimate

- **Phase 1-2**: 2-3 hours (structure and buttons)
- **Phase 3-4**: 2-3 hours (animations and hierarchy)
- **Phase 5-6**: 2-3 hours (interactions and footer)
- **Phase 7**: 1-2 hours (mobile refinements)
- **Phase 8**: 1-2 hours (accessibility)
- **Phase 9**: 2-3 hours (testing)
- **Phase 10**: 1 hour (documentation)

**Total**: 11-17 hours

## Notes

- This is an **iterative** process; phases can be adjusted based on findings
- **Keep commits atomic** - one phase per commit when possible
- **Test frequently** - don't wait until the end to validate
- **Get feedback early** - share progress with stakeholders
- **Document decisions** - note why certain approaches were chosen
- **Stay flexible** - adjust plan as needed based on implementation learnings

## References

- Sidebar Design: `prose/designs/frontend/SIDEBAR.md`
- Current Component: `src/lib/components/Sidebar.svelte`
- Design System: `prose/designs/frontend/DESIGN_SYSTEM.md`
- Claude Sidebar: `prose/claude-theme/claude-sidebar.html`
