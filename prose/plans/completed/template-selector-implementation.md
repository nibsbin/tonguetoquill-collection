# Template Selector Implementation Plan

## Overview

Implement a custom template selector widget to replace the standard HTML `<select>` dropdown in NewDocumentDialog. The selector will display templates as a scrollable list with info icons that reveal descriptions on hover, improving template discoverability and user experience.

## Goals

1. Create reusable BaseSelect widget following WIDGET_ABSTRACTION.md patterns
2. Implement TemplateSelector component using BaseSelect
3. Integrate TemplateSelector into NewDocumentDialog
4. Ensure WCAG AA accessibility compliance
5. Provide excellent keyboard navigation and screen reader support
6. Support mobile/touch interactions

## Prerequisites

- Template Service initialized and providing template metadata
- NewDocumentDialog component functional
- Design system tokens available (colors, spacing, typography)
- Icon system available (Lucide icons via shadcn-svelte)

## Implementation Phases

### Phase 1: BaseSelect Widget Foundation

**Objective**: Create reusable base select component with core functionality

**Tasks**:

1. **Create BaseSelect component skeleton**
   - Location: `src/lib/components/ui/base-select.svelte`
   - Define TypeScript props interface
   - Set up component structure (trigger, dropdown, item list)
   - Add basic styling using design tokens

2. **Implement dropdown mechanics**
   - Click trigger to open/close dropdown
   - Position dropdown below trigger (anchored)
   - Handle dropdown width (match trigger by default)
   - Add max-height and scrolling for overflow
   - Implement click-outside-to-close behavior
   - Implement ESC-to-close behavior

3. **Add basic item rendering**
   - Render list of items using `itemContent` snippet
   - Display item labels using `getItemLabel`
   - Track selected item using `value` prop
   - Highlight selected item with checkmark and styling
   - Call `onValueChange` when item clicked

4. **Style trigger and dropdown**
   - Trigger: Input-like appearance, chevron icon, proper spacing
   - Dropdown: Elevated surface, border, shadow, proper z-index
   - Items: Hover state, selected state, focus state
   - Use design system color tokens throughout
   - Ensure 44px minimum height for items (touch targets)

**Acceptance Criteria**:

- BaseSelect renders with basic props
- Dropdown opens/closes on click
- Items display correctly with custom content
- Selected item is visually distinct
- Click outside closes dropdown
- ESC key closes dropdown
- Basic mouse interaction works

### Phase 2: Keyboard Navigation & Accessibility

**Objective**: Implement comprehensive keyboard support and ARIA attributes

**Tasks**:

1. **Implement keyboard navigation**
   - Arrow Up/Down: Navigate items
   - Home/End: Jump to first/last item
   - Enter/Space on trigger: Open dropdown
   - Enter/Space on item: Select item and close
   - ESC: Close dropdown without selection
   - Tab: Close dropdown and move focus forward
   - Shift+Tab: Close dropdown and move focus backward

2. **Add focus management**
   - Focus moves to selected item when dropdown opens
   - Focused item scrolls into view automatically
   - Focus returns to trigger when dropdown closes
   - Visible focus indicators (2px USAF blue ring)
   - Maintain focus state during navigation

3. **Implement ARIA attributes**
   - Trigger: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`
   - Dropdown: `role="listbox"`, `aria-labelledby`
   - Items: `role="option"`, `aria-selected`
   - Labels: `aria-label` or associated `<label>` element
   - Descriptions: `aria-describedby` for additional info

4. **Add screen reader announcements**
   - Announce open/close state changes
   - Announce navigation (e.g., "Item 2 of 5")
   - Announce selection changes
   - Use `aria-live="polite"` region for dynamic updates

5. **Test keyboard navigation**
   - Manual testing with keyboard only
   - Test with NVDA/JAWS/VoiceOver screen readers
   - Verify tab order and focus management
   - Verify ARIA announcements

**Acceptance Criteria**:

- All keyboard shortcuts work correctly
- Focus management works (opens, navigates, closes)
- Focus indicators are visible and clear
- ARIA attributes are present and correct
- Screen reader announces state and navigation
- Can use component entirely with keyboard
- Passes basic accessibility audit (axe, WAVE)

### Phase 3: Type-Ahead Search (Optional Enhancement)

**Objective**: Add type-ahead search for faster navigation

**Tasks**:

1. **Implement type-ahead logic**
   - Capture keypress events on dropdown
   - Build search buffer (accumulate typed characters)
   - Clear buffer after 1 second of no typing
   - Find first item matching search buffer
   - Move focus to matching item
   - Scroll matching item into view

2. **Add visual feedback**
   - Optional: Display current search term
   - Highlight matching portion of item label
   - Clear visual indicator of type-ahead mode

3. **Test type-ahead**
   - Test with various search terms
   - Test buffer clearing behavior
   - Test with no matches (should not change focus)
   - Test rapid typing

**Acceptance Criteria**:

- Typing letters jumps to matching item
- Search buffer clears after 1 second
- Focus moves to first match
- Works with keyboard navigation (arrow keys still work)
- No matches = no focus change

**Note**: This phase is optional and can be deferred to post-MVP if time is limited.

### Phase 4: Tooltip Component

**Objective**: Create reusable tooltip component for info icon descriptions

**Tasks**:

1. **Create Tooltip component**
   - Location: `src/lib/components/ui/tooltip.svelte`
   - Props: `content`, `position`, `delay`, `maxWidth`
   - Position: Top, bottom, left, right (with auto-flip)
   - Delay: Show after N milliseconds (default 300ms)
   - Hide immediately on mouse leave
   - Style: Small padding, background, border, shadow

2. **Implement positioning logic**
   - Calculate trigger element position (getBoundingClientRect)
   - Calculate tooltip position based on `position` prop
   - Flip to opposite side if insufficient space
   - Ensure tooltip stays within viewport bounds
   - Use `position: absolute` or `position: fixed`

3. **Add ARIA support**
   - Tooltip content: `role="tooltip"`, `id="tooltip-{unique-id}"`
   - Trigger element: `aria-describedby="tooltip-{unique-id}"`
   - Ensure tooltip content is always in DOM (not conditionally rendered)
   - Use `.sr-only` class to hide visually but keep accessible

4. **Style tooltip**
   - Background: `bg-surface-elevated`
   - Border: `border-border`
   - Text: `text-sm text-foreground`
   - Shadow: `shadow-md`
   - Max width: 280px
   - Padding: 8px (p-2)
   - Border radius: Medium (8px)

**Acceptance Criteria**:

- Tooltip appears on hover after delay
- Tooltip hides on mouse leave
- Tooltip positions correctly (flips if needed)
- Tooltip content is accessible to screen readers
- Tooltip styling matches design system
- Works on both desktop (hover) and mobile (tap)

### Phase 5: TemplateSelector Feature Component

**Objective**: Create template-specific selector using BaseSelect

**Tasks**:

1. **Create TemplateSelector component**
   - Location: `src/lib/components/NewDocumentDialog/TemplateSelector.svelte`
   - Props: `templates`, `selectedTemplate`, `onTemplateChange`, `disabled`, `label`
   - Integrate with BaseSelect component
   - Render template items with info icons
   - Handle tooltip visibility state

2. **Implement template item rendering**
   - Use `itemContent` snippet to customize item appearance
   - Layout: Flex row, justify-between
   - Left: Template name (text-sm)
   - Right: Info icon (16px, muted color)
   - Apply hover/selected styles from BaseSelect

3. **Add info icon with tooltip**
   - Render info icon (Lucide Info icon)
   - Wrap icon in Tooltip component
   - Tooltip content: Template description
   - Tooltip position: Right-aligned (fallback to left)
   - Stop event propagation on icon click (don't select item)

4. **Handle touch interactions**
   - Tap template name: Select template
   - Tap info icon: Toggle tooltip (don't select)
   - Clear distinction between tap targets
   - Ensure 44px touch target for info icon

5. **Style template items**
   - Default: Transparent background, normal text
   - Hover: Accent background, accent foreground
   - Selected: Primary background, primary foreground, bold text, checkmark
   - Focus: Same as hover + focus ring
   - Info icon: Muted foreground, hover to foreground

**Acceptance Criteria**:

- TemplateSelector renders with template list
- Template items display correctly with info icons
- Info icon tooltips show template descriptions
- Hovering info icon doesn't select template
- Clicking template name selects template
- Selected template is visually distinct
- Works on desktop (mouse) and mobile (touch)
- Integrates smoothly with BaseSelect behavior

### Phase 6: NewDocumentDialog Integration

**Objective**: Replace HTML `<select>` with TemplateSelector in NewDocumentDialog

**Tasks**:

1. **Update NewDocumentDialog component**
   - Remove existing `<select>` element (lines 222-231)
   - Import TemplateSelector component
   - Replace select with TemplateSelector
   - Pass templates, selectedTemplate, onTemplateChange props
   - Maintain existing label layout (in-line label)

2. **Verify state management**
   - Ensure selectedTemplate state updates on selection
   - Verify template change triggers document name update
   - Test disabled state (when templates not ready or creating)
   - Ensure template selection persists across popover open/close

3. **Test layout integration**
   - Verify in-line label alignment (Template label + TemplateSelector)
   - Ensure dropdown doesn't overflow popover boundaries
   - Test with various numbers of templates (1, 5, 10, 20+)
   - Verify scrolling behavior with many templates
   - Check responsive behavior (mobile, tablet, desktop)

4. **Test interaction flow**
   - Open NewDocumentDialog
   - Open TemplateSelector
   - Navigate with keyboard
   - Select template
   - Verify document name updates
   - Close and reopen dialog
   - Verify selection persists

**Acceptance Criteria**:

- TemplateSelector replaces `<select>` successfully
- Template selection works as before
- Document name auto-populates correctly
- Layout is clean and matches design
- No regressions in existing functionality
- Works across all breakpoints

### Phase 7: Polish & Refinement

**Objective**: Final refinements, performance, and polish

**Tasks**:

1. **Performance optimization**
   - Lazy-render dropdown (only when open)
   - Use single tooltip instance (reposition, not recreate)
   - Debounce tooltip hover (300ms delay)
   - Verify no unnecessary re-renders
   - Test with large template lists (20+ items)

2. **Visual polish**
   - Fine-tune spacing and alignment
   - Ensure consistent icon sizes
   - Verify focus indicators are crisp
   - Check color contrast ratios (use WCAG contrast checker)
   - Test in light and dark themes (if applicable)
   - Ensure smooth animations (dropdown open/close, tooltip fade)

3. **Cross-browser testing**
   - Chrome (primary)
   - Firefox
   - Safari (macOS)
   - Edge
   - Mobile Safari (iOS)
   - Mobile Chrome (Android)

4. **Accessibility audit**
   - Run axe DevTools audit
   - Run WAVE browser extension
   - Manual keyboard navigation test
   - Manual screen reader test (NVDA, VoiceOver)
   - Verify WCAG 2.1 Level AA compliance

5. **Documentation**
   - Add JSDoc comments to BaseSelect props
   - Add JSDoc comments to TemplateSelector props
   - Document keyboard shortcuts (in component and/or help dialog)
   - Update README if applicable

**Acceptance Criteria**:

- Component performs well with large lists
- Visual appearance is polished and professional
- Works across all supported browsers
- Passes accessibility audits (no critical issues)
- Code is documented with clear comments
- Ready for production use

### Phase 8: Testing & Validation

**Objective**: Comprehensive testing and validation

**Tasks**:

1. **Unit tests for BaseSelect**
   - Test rendering with various props
   - Test open/close behavior
   - Test item selection
   - Test keyboard navigation
   - Test ARIA attributes
   - Test focus management
   - Mock user interactions (click, keyboard, focus)

2. **Unit tests for TemplateSelector**
   - Test rendering with template data
   - Test info icon tooltips
   - Test template selection callback
   - Test disabled state
   - Mock BaseSelect integration

3. **Integration tests**
   - Test NewDocumentDialog with TemplateSelector
   - Test template selection flow end-to-end
   - Test document name auto-population
   - Test error states (no templates, load failure)

4. **Manual testing checklist**
   - [ ] Open TemplateSelector, verify dropdown appears
   - [ ] Click template, verify selection
   - [ ] Hover info icon, verify tooltip
   - [ ] Navigate with keyboard, verify focus
   - [ ] Select with Enter key, verify selection
   - [ ] Close with ESC, verify no selection change
   - [ ] Scroll long list, verify scrolling works
   - [ ] Test on mobile, verify touch interactions
   - [ ] Test with screen reader, verify announcements
   - [ ] Test disabled state, verify no interaction
   - [ ] Verify no console errors or warnings

5. **Regression testing**
   - Verify existing NewDocumentDialog functionality still works
   - Verify document creation flow is unchanged
   - Verify template loading and error handling
   - Verify popover behavior (open, close, position)

**Acceptance Criteria**:

- All unit tests pass
- All integration tests pass
- Manual testing checklist complete
- No regressions in existing functionality
- Component is production-ready

## Implementation Notes

### Styling Approach

**Use Tailwind CSS utility classes**: Leverage design system tokens via Tailwind
**No hardcoded colors**: Always use semantic tokens (e.g., `bg-background`, `text-foreground`)
**Responsive utilities**: Use responsive prefixes (sm:, md:, lg:) where needed
**Component classes**: Add custom classes in component `<style>` block only for complex styling

### Event Handling

**Click outside**: Use click listener on document, check event.target
**Keyboard events**: Attach to dropdown container, not individual items
**Focus events**: Use native focus management where possible
**Touch events**: Use standard click events (they work on touch), add touch-specific enhancements if needed

### State Management

**BaseSelect state**: Internal state (open, focusedIndex, searchBuffer)
**TemplateSelector state**: Internal tooltip state, pass-through selection state
**NewDocumentDialog state**: Owns selectedTemplate, passes to TemplateSelector

### Error Handling

**No templates**: Show placeholder message in dropdown ("No templates available")
**Template load error**: Show error state in dropdown, disable interaction
**Selection error**: Log error, show toast notification, keep dropdown open

### Mobile Considerations

**Touch targets**: Minimum 44x44px for all interactive elements
**Tooltip behavior**: Tap to toggle (not hover)
**Scrolling**: Native touch scrolling (no custom scroll)
**Viewport handling**: Ensure dropdown doesn't overflow viewport on small screens

## Design Document Reference

See [TEMPLATE_SELECTOR.md](../designs/frontend/TEMPLATE_SELECTOR.md) for:

- Detailed visual specifications
- Comprehensive UX patterns
- Accessibility requirements
- Integration details
- Testing strategy

## Success Criteria

### Functionality

- ✅ TemplateSelector replaces HTML `<select>` in NewDocumentDialog
- ✅ Template selection works via mouse, keyboard, and touch
- ✅ Info icons show descriptions on hover/tap
- ✅ Selected template is visually distinct
- ✅ Dropdown scrolls when templates exceed max height
- ✅ Keyboard navigation is smooth and intuitive

### Accessibility

- ✅ WCAG 2.1 Level AA compliant
- ✅ Full keyboard navigation support
- ✅ Screen reader compatible (ARIA attributes)
- ✅ Visible focus indicators
- ✅ Proper color contrast (4.5:1 for text, 3:1 for UI)
- ✅ Touch targets minimum 44px

### User Experience

- ✅ Fast and responsive (no lag or jank)
- ✅ Intuitive interaction patterns
- ✅ Clear visual feedback for all actions
- ✅ Works on desktop and mobile
- ✅ Consistent with design system and existing patterns

### Code Quality

- ✅ Reusable BaseSelect component (can be used elsewhere)
- ✅ Clean separation of concerns (base widget vs feature component)
- ✅ Well-documented props and behavior
- ✅ Follows project patterns (WIDGET_ABSTRACTION.md)
- ✅ No console errors or warnings
- ✅ Unit and integration tests passing

## Timeline Estimate

**Phase 1**: BaseSelect Foundation - 4-6 hours
**Phase 2**: Keyboard & Accessibility - 4-6 hours
**Phase 3**: Type-Ahead Search - 2-3 hours (optional)
**Phase 4**: Tooltip Component - 3-4 hours
**Phase 5**: TemplateSelector - 3-4 hours
**Phase 6**: Dialog Integration - 2-3 hours
**Phase 7**: Polish & Refinement - 3-4 hours
**Phase 8**: Testing & Validation - 3-4 hours

**Total**: 24-34 hours (excluding optional type-ahead search)

**Note**: These are rough estimates. Actual time may vary based on:

- Complexity of edge cases discovered
- Accessibility testing and refinement
- Cross-browser compatibility issues
- Unexpected design or UX revisions

## Risks & Mitigations

### Risk: Complex Positioning Logic

**Mitigation**: Use existing popover positioning logic as reference, or use established library (floating-ui) if needed

### Risk: Cross-Browser Inconsistencies

**Mitigation**: Test early and often on target browsers, use standard APIs, avoid bleeding-edge features

### Risk: Accessibility Gaps

**Mitigation**: Reference ARIA Authoring Practices Guide for combobox pattern, test with real screen readers

### Risk: Mobile Touch Interactions

**Mitigation**: Test on real devices (iOS, Android), follow platform conventions, use standard events

### Risk: Performance with Large Lists

**Mitigation**: Start with simple approach (render all items), add virtual scrolling only if needed

### Risk: Scope Creep

**Mitigation**: Follow plan strictly, defer enhancements to future phases, maintain focus on MVP

## Related Documents

- **Design**: [TEMPLATE_SELECTOR.md](../designs/frontend/TEMPLATE_SELECTOR.md)
- **Widget Patterns**: [WIDGET_ABSTRACTION.md](../designs/frontend/WIDGET_ABSTRACTION.md)
- **Dialog Context**: [NEW_DOCUMENT.md](../designs/frontend/NEW_DOCUMENT.md)
- **Design System**: [DESIGN_SYSTEM.md](../designs/frontend/DESIGN_SYSTEM.md)
- **Accessibility**: [ACCESSIBILITY.md](../designs/frontend/ACCESSIBILITY.md)
