# Technical Debt Repair Plan - Post Phase 6.5 UI Rework

## Overview

This document outlines the technical debt incurred during Phase 6.5 UI Rework and provides a structured plan to recover feature parity and fix identified regressions. Phase 6.5 successfully updated the visual design and theming to match the mock project, but introduced several functionality gaps and state management issues.

## Assessment Summary

### What Was Completed in Phase 6.5

✅ **Visual Design Updates**:

- Color palette aligned with zinc-900/800/700 theme
- Typography updated (Lato for UI, Crimson Text for preview)
- Component sizing matches specifications (48px heights, 224px sidebar)
- Border radius and transitions standardized

✅ **Component Structure Updates**:

- Sidebar reworked with hamburger menu, logo, file list, settings footer
- TopMenu simplified with download button and more actions menu
- EditorToolbar updated with icon-only buttons and separators
- Settings popover implemented with switches

✅ **Layout Improvements**:

- Responsive sidebar (collapsed/expanded states)
- Mobile drawer implementation using Sheet component
- Split editor/preview layout

### Identified Regressions and Issues

#### 1. **Auto-Save Functionality Missing** (HIGH PRIORITY)

**Issue**: Phase 6.5 removed auto-save implementation that was specified in Phase 7 of MVP_PLAN.md.

**Impact**: Users can lose work if they don't manually save. No save status indicator, no debounced auto-save.

**Expected Behavior** (per DESIGN_SYSTEM.md and STATE_MANAGEMENT.md):

- 7-second debounce after last keystroke
- Save status indicator (Saving..., Saved, Error)
- Optimistic UI updates
- Manual save via Ctrl/Cmd+S
- Settings toggle for auto-save (UI exists, logic missing)

**Current State**:

- Content updates are tracked in DocumentEditor component
- No auto-save logic implemented
- No save status indicator in TopMenu
- Settings toggle exists but doesn't control anything

#### 2. **Mode Toggle (Markdown/Wizard) Not Functional** (MEDIUM PRIORITY)

**Issue**: EditorToolbar has no mode toggle tabs as specified in UI_REWORK.md and UI_COMPONENTS.md.

**Expected Behavior**:

- Right-aligned tabs: "Markdown" and "Wizard"
- Active tab styling (zinc-700 background, zinc-100 text)
- Tab switching changes editor mode
- Wizard mode provides guided document creation (future feature)

**Current State**:

- Mode toggle completely missing from EditorToolbar
- Only formatting buttons implemented

#### 3. **Document Content Not Persisting** (HIGH PRIORITY)

**Issue**: Content changes in MarkdownEditor are not saved to the document store or backend.

**Impact**: All edits are lost when switching documents or refreshing the page.

**Expected Behavior**:

- Content changes trigger auto-save (with debounce)
- Changes persist to localStorage (guest mode) or API (authenticated mode)
- Switching documents preserves unsaved changes (with warning)
- Manual save option via Ctrl+S

**Current State**:

- `DocumentEditor` tracks content in local state
- `updateDebouncedContent` updates preview only
- No calls to `documentStore.updateDocument()` or API
- Document store has `updateDocument()` method but it's never called

#### 4. **Settings Toggle States Not Applied** (MEDIUM PRIORITY)

**Issue**: Settings popover toggles (Auto-save, Line Numbers) persist to localStorage but don't affect application behavior.

**Impact**: User preferences are ignored.

**Expected Behavior**:

- Auto-save toggle enables/disables auto-save functionality
- Line Numbers toggle shows/hides CodeMirror line numbers gutter
- Settings persist across sessions

**Current State**:

- Sidebar component reads/writes localStorage correctly
- Values stored but never consumed by editor or auto-save logic
- CodeMirror editor doesn't receive line numbers preference

#### 5. **Keyboard Shortcuts Incomplete** (LOW PRIORITY)

**Issue**: Keyboard shortcuts defined in MarkdownEditor (Ctrl+B, Ctrl+I) work, but Ctrl+S manual save is not implemented.

**Expected Behavior**:

- Ctrl/Cmd+S triggers manual save (bypasses debounce)
- Other shortcuts as defined in DESIGN_SYSTEM.md
- Tooltip hints show keyboard shortcuts

**Current State**:

- Bold (Ctrl+B) and Italic (Ctrl+I) work
- No Ctrl+S handler
- Tooltips show formatting names but not shortcuts

#### 6. **Mobile Editor/Preview Toggle Missing** (MEDIUM PRIORITY)

**Issue**: Mobile layout (<768px) shows only editor, no way to toggle to preview.

**Expected Behavior** (per DESIGN_SYSTEM.md Navigation Patterns):

- Tabbed interface on mobile: Editor OR Preview
- Tab bar for switching between views
- Preview hidden on desktop in split view

**Current State**:

- Preview hidden on mobile (`lg:block` class)
- No tab switcher implemented
- Comment in code: "TODO: Mobile tabs for editor/preview toggle"

#### 7. **Classification Message Not Displayed** (LOW PRIORITY)

**Issue**: Classification message toast (Phase 9 feature) not implemented.

**Expected Behavior**:

- Toast on app load: "This system is not authorized for controlled information."
- Persistent toast (no auto-dismiss)
- Top-center positioning

**Current State**:

- Sonner toast library integrated
- No classification message trigger

#### 8. **Line Numbers Not Configurable** (LOW PRIORITY)

**Issue**: CodeMirror editor doesn't support line numbers toggle from settings.

**Expected Behavior**:

- Settings toggle controls line numbers display
- Default state configurable
- Immediate visual update when toggled

**Current State**:

- CodeMirror initialized without line numbers extension
- Settings UI exists but not wired to editor

#### 9. **Document Deletion Confirmation Missing** (MEDIUM PRIORITY)

**Issue**: No confirmation dialog when deleting documents.

**Expected Behavior** (per UI_COMPONENTS.md):

- Confirmation dialog before deletion
- Warning if deleting last document
- Cancel and confirm actions
- Optimistic UI with rollback on error

**Current State**:

- `handleDeleteFile()` has check for last document
- No dialog component shown
- Immediate deletion without confirmation

#### 10. **Accessibility Gaps** (MEDIUM PRIORITY)

**Issue**: Some accessibility features specified in ACCESSIBILITY.md are missing.

**Gaps Identified**:

- No skip to main content link
- ARIA labels missing on some icon-only buttons
- Focus trap not verified in dialogs
- Keyboard shortcuts help dialog not implemented

**Current State**:

- Basic keyboard navigation works
- Focus indicators present
- Screen reader testing not documented

## State Management Analysis

### Current State Flow

#### Document Loading:

1. User opens app → `+page.svelte` fetches auth status
2. `documentStore.fetchDocuments()` called
3. Guest mode: loads from localStorage
4. Authenticated: loads from API `/api/documents`
5. Documents displayed in Sidebar

#### Document Selection:

1. User clicks document in Sidebar
2. `handleFileSelect(id)` sets `documentStore.activeDocumentId`
3. `DocumentEditor` component mounts with `documentId` prop
4. `DocumentEditor` calls `documentStore.fetchDocument(id)`
5. Content loaded into local state

#### Content Editing:

1. User types in `MarkdownEditor`
2. CodeMirror triggers `onChange(newContent)`
3. `DocumentEditor.updateDebouncedContent()` called
4. Local `content` state updated
5. Debounced `debouncedContent` updated (50ms delay)
6. Preview re-renders with new content
7. **❌ MISSING: No save to store or backend**

### Broken State Flows

#### Auto-Save Flow (MISSING):

```
Expected:
Content change → 7s debounce → Save API call → Update store → Status indicator

Actual:
Content change → Preview update → [END]
```

#### Settings Application (BROKEN):

```
Expected:
Toggle auto-save → localStorage → Auto-save logic enabled/disabled

Actual:
Toggle auto-save → localStorage → [NOT CONSUMED]
```

#### Document Switch with Unsaved Changes (BROKEN):

```
Expected:
User switches doc → Check dirty flag → Show warning → Save or discard

Actual:
User switches doc → New doc loads → Previous changes lost
```

## Repair Plan Phases

### Phase R1: Auto-Save Implementation (Priority: HIGH)

**Goal**: Restore auto-save functionality as specified in Phase 7 of MVP_PLAN.md.

**Tasks**:

1. **Create Auto-Save Logic**:
   - Add auto-save service/utility module
   - Implement 7-second debounce timer
   - Integrate with document store `updateDocument()` method
   - Handle both guest (localStorage) and authenticated (API) modes

2. **Wire Auto-Save to Editor**:
   - Modify `DocumentEditor` to trigger auto-save on content changes
   - Cancel pending saves on component unmount
   - Respect auto-save setting from localStorage

3. **Add Save Status Indicator**:
   - Update `TopMenu` component to show save status
   - States: Saving (spinner), Saved (checkmark), Error (warning)
   - Position next to filename
   - Auto-hide after success (3 seconds)

4. **Implement Manual Save (Ctrl+S)**:
   - Add keyboard shortcut handler in `MarkdownEditor`
   - Bypass debounce for manual save
   - Show immediate save status feedback

5. **Testing**:
   - Test auto-save triggers after 7 seconds
   - Test manual save (Ctrl+S) works immediately
   - Test save status indicator states
   - Test guest vs authenticated mode saving

**Deliverables**:

- Auto-save functionality working with 7-second debounce
- Save status indicator in TopMenu
- Manual save via Ctrl+S
- Auto-save setting toggle functional
- Tests validating save behavior

**Reference**: `prose/designs/frontend/DESIGN_SYSTEM.md` (Auto-Save Behavior), `prose/plans/MVP_PLAN.md` (Phase 7)

---

### Phase R2: Document Persistence and State Management (Priority: HIGH)

**Goal**: Fix document content persistence and state synchronization.

**Tasks**:

1. **Implement Content Persistence**:
   - Call `documentStore.updateDocument()` from auto-save logic
   - Update document store to persist to localStorage (guest) or API (authenticated)
   - Handle optimistic updates and rollback on errors

2. **Add Dirty State Tracking**:
   - Track unsaved changes flag in DocumentEditor
   - Update UI to show unsaved indicator (asterisk in filename)
   - Clear dirty flag on successful save

3. **Implement Unsaved Changes Warning**:
   - Detect document switch with unsaved changes
   - Show confirmation dialog: "Save changes before switching?"
   - Options: Save, Discard, Cancel
   - Preserve changes if user cancels

4. **Fix Document Store Methods**:
   - Review `updateDocument()` implementation
   - Ensure proper error handling
   - Add loading states for update operations
   - Verify guest mode localStorage persistence

5. **Testing**:
   - Test content persists after saving
   - Test unsaved changes warning on document switch
   - Test error handling (save failures)
   - Test localStorage quota limits (guest mode)

**Deliverables**:

- Content persists to localStorage/API correctly
- Unsaved changes warning dialog
- Dirty state indicator in UI
- Robust error handling for save operations

**Reference**: `prose/designs/frontend/STATE_MANAGEMENT.md`, `prose/designs/frontend/API_INTEGRATION.md`

---

### Phase R3: Settings Integration (Priority: MEDIUM)

**Goal**: Connect settings toggles to application behavior.

**Tasks**:

1. **Auto-Save Toggle**:
   - Read auto-save preference in DocumentEditor
   - Enable/disable auto-save logic based on setting
   - Default to enabled (as specified)

2. **Line Numbers Toggle**:
   - Add line numbers extension to CodeMirror
   - Read preference from localStorage
   - Reconfigure editor when setting changes
   - Update immediately without reload

3. **Settings Store**:
   - Create centralized settings store (optional)
   - Export settings state for components to consume
   - Sync with localStorage automatically

4. **Testing**:
   - Test auto-save enable/disable works
   - Test line numbers show/hide works
   - Test settings persist across sessions

**Deliverables**:

- Auto-save toggle controls auto-save behavior
- Line numbers toggle controls editor display
- Settings properly consumed by components

**Reference**: `prose/designs/frontend/STATE_MANAGEMENT.md`, `prose/designs/frontend/UI_COMPONENTS.md`

---

### Phase R4: Mobile Enhancements (Priority: MEDIUM)

**Goal**: Complete mobile responsiveness with editor/preview toggle.

**Tasks**:

1. **Add Mobile Tab Switcher**:
   - Create tab component for mobile (<768px)
   - Tabs: "Editor" and "Preview"
   - Position below TopMenu, above content
   - Toggle visibility of editor vs preview

2. **Update DocumentEditor Layout**:
   - Conditional rendering based on active tab (mobile)
   - Preserve split view on desktop
   - Smooth transitions between tabs

3. **Mobile Touch Optimization**:
   - Verify 44px minimum touch targets
   - Test virtual keyboard handling
   - Ensure proper scrolling on mobile

4. **Testing**:
   - Test tab switching on mobile
   - Test editor and preview functionality on mobile devices
   - Test touch interactions

**Deliverables**:

- Mobile tab switcher for editor/preview
- Proper mobile layout at all breakpoints
- Touch-optimized interactions

**Reference**: `prose/designs/frontend/DESIGN_SYSTEM.md` (Navigation Patterns, Breakpoint Behavior)

---

### Phase R5: Mode Toggle and Additional Features (Priority: MEDIUM)

**Goal**: Implement missing UI features and polish.

**Tasks**:

1. **Add Mode Toggle Tabs**:
   - Add Markdown/Wizard tabs to EditorToolbar (right side)
   - Implement tab styling (active/inactive states)
   - Stub out Wizard mode (future implementation)
   - Default to Markdown mode

2. **Document Deletion Confirmation**:
   - Create confirmation dialog component
   - Show dialog before delete action
   - Prevent deleting last document
   - Handle optimistic delete with rollback

3. **Keyboard Shortcuts Enhancements**:
   - Add keyboard shortcuts to tooltips
   - Implement Ctrl+S manual save
   - Update DESIGN_SYSTEM.md with complete shortcut list

4. **Classification Message**:
   - Add toast on app load
   - Message: "This system is not authorized for controlled information."
   - Persistent toast (no auto-dismiss)
   - Dismissible by user

5. **Testing**:
   - Test mode toggle UI (functionality stubbed for MVP)
   - Test delete confirmation dialog
   - Test keyboard shortcuts
   - Test classification message display

**Deliverables**:

- Mode toggle tabs in EditorToolbar (UI only)
- Delete confirmation dialog
- Enhanced keyboard shortcuts
- Classification message toast

**Reference**: `prose/designs/frontend/UI_COMPONENTS.md`, `prose/designs/frontend/DESIGN_SYSTEM.md`

---

### Phase R6: Accessibility Fixes (Priority: MEDIUM)

**Goal**: Address accessibility gaps to meet Section 508 compliance.

**Tasks**:

1. **Add Skip to Main Content Link**:
   - Implement skip link at top of page
   - Visible on keyboard focus
   - Jumps to main editor area

2. **ARIA Labels Audit**:
   - Add ARIA labels to all icon-only buttons
   - Verify ARIA roles on landmarks
   - Add ARIA live regions for dynamic content

3. **Keyboard Shortcuts Help Dialog**:
   - Create help dialog component
   - List all keyboard shortcuts
   - Trigger via "?" key or menu item
   - Include in More Actions menu

4. **Focus Management**:
   - Verify focus trap in dialogs
   - Test keyboard navigation throughout app
   - Ensure logical tab order

5. **Testing**:
   - Screen reader testing (NVDA/JAWS)
   - Keyboard-only navigation testing
   - Automated accessibility scan (axe-core)
   - Color contrast verification

**Deliverables**:

- Skip to main content link
- Complete ARIA labeling
- Keyboard shortcuts help dialog
- Verified focus management
- Accessibility testing documentation

**Reference**: `prose/designs/frontend/ACCESSIBILITY.md`, `prose/designs/frontend/DESIGN_SYSTEM.md`

---

### Phase R7: Testing and Documentation (Priority: LOW)

**Goal**: Validate repairs and update documentation.

**Tasks**:

1. **End-to-End Testing**:
   - Test complete document lifecycle
   - Test auto-save flows
   - Test mobile responsiveness
   - Test guest vs authenticated modes

2. **Update Design Documents**:
   - Update STATE_MANAGEMENT.md with actual implementation
   - Update UI_COMPONENTS.md with Phase 6.5 changes
   - Document any deviations from original plan
   - Add troubleshooting section

3. **Code Quality**:
   - Remove TODOs from code
   - Add inline documentation
   - Refactor any technical debt introduced
   - Run linter and fix warnings

4. **Performance Testing**:
   - Test auto-save performance with large documents
   - Verify debounce timing
   - Check for memory leaks
   - Optimize re-renders if needed

**Deliverables**:

- Comprehensive E2E test suite
- Updated design documentation
- Clean codebase with no TODOs
- Performance validation report

---

## Success Criteria

### Functional Requirements

- [ ] Auto-save works with 7-second debounce
- [ ] Manual save via Ctrl+S works
- [ ] Save status indicator shows correct states
- [ ] Content persists to localStorage (guest) and API (authenticated)
- [ ] Unsaved changes warning on document switch
- [ ] Settings toggles control application behavior
- [ ] Mobile editor/preview toggle works
- [ ] Delete confirmation dialog prevents accidental deletions
- [ ] Keyboard shortcuts complete and documented
- [ ] Classification message displays on load

### Technical Requirements

- [ ] No data loss on document switching
- [ ] Optimistic UI updates with proper rollback
- [ ] Error handling for all save operations
- [ ] localStorage quota handling (guest mode)
- [ ] Proper state synchronization between components
- [ ] No memory leaks from timers or subscriptions

### Accessibility Requirements

- [ ] Section 508 compliant
- [ ] Full keyboard navigation
- [ ] Screen reader compatible
- [ ] ARIA labels on all interactive elements
- [ ] Focus management in dialogs
- [ ] Skip to main content link

### Quality Requirements

- [ ] All unit tests passing
- [ ] E2E tests cover critical flows
- [ ] Code linted and formatted
- [ ] Documentation updated
- [ ] No console errors or warnings

## Risk Assessment

### High Risk Items

**Risk**: Auto-save implementation introduces performance issues with large documents  
**Mitigation**: Implement content size checks, optimize debounce timing, test with max size documents (524KB limit)

**Risk**: State management bugs cause data loss  
**Mitigation**: Thorough testing of save flows, localStorage fallback, user warnings before destructive actions

**Risk**: Guest mode localStorage quota exceeded  
**Mitigation**: Implement quota checking, user warnings, document size limits, migration to authenticated mode prompt

### Medium Risk Items

**Risk**: Mobile implementation breaks desktop functionality  
**Mitigation**: Incremental testing at all breakpoints, separate mobile/desktop code paths where needed

**Risk**: Settings changes require editor reinitializing (jarring UX)  
**Mitigation**: Use CodeMirror reconfigure API for live updates without destroying editor

## Timeline Estimate

- **Phase R1**: Auto-Save Implementation - 8 hours
- **Phase R2**: Document Persistence - 8 hours
- **Phase R3**: Settings Integration - 4 hours
- **Phase R4**: Mobile Enhancements - 6 hours
- **Phase R5**: Additional Features - 6 hours
- **Phase R6**: Accessibility Fixes - 6 hours
- **Phase R7**: Testing and Documentation - 8 hours

**Total Estimated Time**: 46 hours (~1 week for full-time development)

## References

### Design Documents

- `prose/designs/frontend/STATE_MANAGEMENT.md`: State management patterns and auto-save specification
- `prose/designs/frontend/UI_COMPONENTS.md`: Component specifications and behavior
- `prose/designs/frontend/DESIGN_SYSTEM.md`: Visual design, auto-save behavior, navigation patterns
- `prose/designs/frontend/ACCESSIBILITY.md`: Section 508 compliance requirements
- `prose/designs/frontend/API_INTEGRATION.md`: Backend integration patterns

### Plan Documents

- `prose/plans/MVP_PLAN.md`: Overall MVP phases and requirements
- `prose/plans/UI_REWORK.md`: Phase 6.5 implementation details

### Mock Project Reference

- `prose/legacy/mock_project/`: Reference implementation for visual design

---

## Conclusion

Phase 6.5 successfully updated the visual design and component structure to match the desired UI, but several critical features were removed or left incomplete. This repair plan provides a structured approach to recover feature parity while maintaining the improved visual design. The phased approach prioritizes high-impact functionality (auto-save, persistence) before polish features (mode toggle, accessibility enhancements).

**Next Steps**:

1. Review and approve this repair plan
2. Insert as Phase 6.6 in MVP_PLAN.md
3. Begin implementation with Phase R1 (Auto-Save)
4. Update design documents as implementation progresses
