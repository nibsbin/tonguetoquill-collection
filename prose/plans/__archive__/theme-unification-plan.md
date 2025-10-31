# Theme Unification Implementation Plan

> **Cross-reference**: This plan implements the architecture defined in [`prose/designs/theme-system-design.md`](../designs/theme-system-design.md)

## Objective

Unify CSS colors and spacing tokens across the tonguetoquill-web application to enable:

- Centralized theme management
- Easy light/dark mode switching
- Consistent theming between Tailwind CSS components and CodeMirror editor
- Replace custom components with shadcn-svelte equivalents where beneficial

## Prerequisites

- Current dependencies are already sufficient (mode-watcher, shadcn-svelte, tailwindcss 4.x)
- No additional npm packages required
- Existing shadcn-svelte components: button, dropdown-menu, popover, sheet, switch, separator, label

## Implementation Phases

### Phase 1: Define Core Theme Tokens

**Estimated Effort**: 2-3 hours  
**Files to Modify**:

- `src/app.css`

**Tasks**:

1.1. **Define semantic color tokens in `:root`** (light theme)

- Map current zinc palette to semantic meanings
- Create tokens for surfaces, interactive elements, semantic colors
- Define editor-specific color tokens
- Include all required foreground/background pairs for accessibility

  1.2. **Define dark theme variant in `.dark` selector**

- Mirror all tokens from light theme
- Map zinc colors to dark theme equivalents:
  - `--color-background`: #18181b (zinc-900)
  - `--color-surface-elevated`: #27272a (zinc-800)
  - `--color-border`: #3f3f46 (zinc-700)
  - `--color-muted-foreground`: #71717a (zinc-500)
  - `--color-foreground`: #f4f4f5 (zinc-100)
  - Editor tokens matching current CodeMirror inline styles

    1.3. **Extend existing spacing tokens**

- Keep `--radius` and variants (already defined)
- Add any additional spacing if needed

**Expected Output**: Complete CSS custom property definitions for both light and dark themes

**Validation**:

- All tokens defined in both `:root` and `.dark`
- Color contrast ratios meet WCAG 2.1 AA standards (use browser dev tools or contrast checker)
- No hardcoded color values in token definitions (except the actual color values themselves)

---

### Phase 2: Integrate Theme Tokens with Tailwind CSS

**Estimated Effort**: 1-2 hours  
**Files to Modify**:

- `src/app.css`

**Tasks**:

2.1. **Add `@theme inline` directive**

- Map all CSS custom properties to Tailwind color classes
- Follow pattern from `prose/legacy/mock_project/styles/globals.css`
- Create mappings like:

  ```css
  @theme inline {
  	--color-background: var(--color-background);
  	--color-foreground: var(--color-foreground);
  	/* ... all tokens */
  }
  ```

  2.2. **Test Tailwind integration**

- Verify classes like `bg-background`, `text-foreground` work in components
- Check that theme switching updates Tailwind classes

**Expected Output**: Tailwind CSS classes available for all semantic tokens

**Validation**:

- Can use `bg-background`, `text-foreground`, etc. in class attributes
- Running `npm run dev` shows no Tailwind errors
- Browser inspector shows CSS variables resolved correctly

---

### Phase 3: Create CodeMirror Theme Utilities

**Estimated Effort**: 2-3 hours  
**Files to Create**:

- `src/lib/utils/editor-theme.ts`

**Files to Modify**:

- `src/lib/components/MarkdownEditor.svelte`

**Tasks**:

3.1. **Create theme utility module**

- Implement `createEditorTheme()` function
- Read CSS custom properties using `getComputedStyle()`
- Return CodeMirror `EditorView.theme()` configuration
- Map editor-specific tokens to CodeMirror classes:
  - `&` (root)
  - `.cm-content`
  - `.cm-cursor`
  - `.cm-activeLine`
  - `.cm-selectionBackground`
  - `.cm-gutters`
  - `.cm-line`
  - `.cm-scroller`

    3.2. **Add theme refresh capability**

- Create mechanism to re-create editor theme when CSS variables change
- Options:
  - MutationObserver watching class changes on `<html>`
  - Manual refresh function called after theme toggle
  - Svelte reactive statement

    3.3. **Update MarkdownEditor component**

- Replace inline color values (currently hardcoded hex values)
- Use `createEditorTheme()` utility
- Remove duplicate theme definition in `$effect` block
- Factor out theme creation into a single function

**Expected Output**:

- Reusable CodeMirror theme utility
- MarkdownEditor using CSS custom properties instead of hardcoded colors

**Validation**:

- Editor renders with correct colors
- No hardcoded hex color values in MarkdownEditor.svelte
- Editor updates when theme changes (test by toggling theme)

---

### Phase 4: Setup Theme Switching Infrastructure

**Estimated Effort**: 1-2 hours  
**Files to Create**:

- `src/lib/stores/theme.svelte.ts` (optional, if needed)

**Files to Modify**:

- `src/routes/+layout.svelte`

**Tasks**:

4.1. **Initialize mode-watcher**

- Import `ModeWatcher` component
- Add to root layout
- Configure default mode (system preference)

  4.2. **Create theme store wrapper (optional)**

- Wrap mode-watcher's exports for easier consumption
- Export typed helper functions
- This is optional - can use mode-watcher directly

**Expected Output**: Theme switching infrastructure ready to use

**Validation**:

- `mode-watcher` initializes on app load
- User's theme preference persists in localStorage
- System theme preference is respected by default

---

### Phase 5: Migrate Components to Semantic Tokens

**Estimated Effort**: 4-6 hours  
**Files to Modify**:

- All `.svelte` files in `src/lib/components/`
- All `.svelte` files in `src/lib/components/ui/`
- All `.svelte` files in `src/routes/`

**Component Migration Order**:

5.1. **shadcn-svelte UI components** (priority: high)

- `button.svelte`
- `dropdown-menu-content.svelte`
- `dropdown-menu-item.svelte`
- `separator.svelte`
- `sheet-content.svelte`
- `label.svelte`
- `popover-content.svelte`
- `switch.svelte`

  5.2. **Custom components** (priority: high)

- `TopMenu.svelte` - Replace all `zinc-*` references
- `Sidebar.svelte` - Replace all `zinc-*` references
- `MarkdownEditor.svelte` - Already done in Phase 3
- `Dialog.svelte` - Will be replaced in Phase 6, but update for now

  5.3. **Route components** (priority: medium)

- `src/routes/+page.svelte`
- `src/routes/(auth)/login/+page.svelte`
- `src/routes/(auth)/register/+page.svelte`

  5.4. **Other components** (priority: low)

- `DocumentEditor.svelte`
- `DocumentList.svelte`
- `EditorToolbar.svelte`
- `MarkdownPreview.svelte`

**Color Migration Mapping** (for reference during migration):

| Current Class     | New Semantic Class      | Notes                        |
| ----------------- | ----------------------- | ---------------------------- |
| `bg-zinc-900`     | `bg-background`         | Main background (dark mode)  |
| `bg-zinc-800`     | `bg-surface-elevated`   | Elevated surfaces            |
| `bg-zinc-700`     | `bg-accent`             | Hover states, selected items |
| `text-zinc-100`   | `text-foreground`       | Primary text                 |
| `text-zinc-300`   | `text-foreground/80`    | Secondary text               |
| `text-zinc-400`   | `text-muted-foreground` | Muted text                   |
| `text-zinc-500`   | `text-muted-foreground` | Very muted text              |
| `border-zinc-700` | `border-border`         | Borders                      |
| `border-zinc-600` | `border-border-hover`   | Hover borders                |
| `bg-white`        | `bg-background`         | Main background (light mode) |
| `text-zinc-900`   | `text-foreground`       | Primary text (light mode)    |
| `text-zinc-600`   | `text-muted-foreground` | Muted text (light mode)      |

**Migration Process** (per file):

1. Open file
2. Find all instances of `zinc-*` color classes using regex: `(bg|text|border)-zinc-\d+`
3. Replace with appropriate semantic token based on usage context
4. Consider opacity modifiers: `/80`, `/50` for variations
5. Save file
6. Test component visually in both light and dark modes

**Expected Output**: All components use semantic color tokens

**Validation**:

- No `zinc-*` color references remain (verify with `grep -r "zinc-" src --include="*.svelte"`)
- All components render correctly in light mode
- All components render correctly in dark mode
- No visual regressions compared to current design

---

### Phase 6: Install shadcn-svelte Dialog Component

**Estimated Effort**: 2-3 hours  
**Files to Create**:

- `src/lib/components/ui/dialog.svelte`
- `src/lib/components/ui/dialog-content.svelte`
- `src/lib/components/ui/dialog-header.svelte`
- `src/lib/components/ui/dialog-title.svelte`
- `src/lib/components/ui/dialog-description.svelte`
- `src/lib/components/ui/dialog-footer.svelte` (optional)

**Files to Modify**:

- All files that import `Dialog.svelte` from `$lib/components`

**Files to Remove**:

- `src/lib/components/Dialog.svelte` (after migration)

**Tasks**:

6.1. **Install shadcn-svelte dialog component**

```bash
npx shadcn-svelte@latest add dialog
```

- Follow prompts to install in `src/lib/components/ui/`
- Component should auto-configure with existing theme tokens

  6.2. **Customize dialog styling** (if needed)

- Ensure dialog backdrop, content match current design aesthetic
- Verify border-radius uses `--radius` variable
- Check colors use semantic tokens

  6.3. **Update Dialog consumers**

- Find all usages: `grep -r "Dialog" src --include="*.svelte"`
- Replace custom Dialog imports with shadcn-svelte Dialog
- Update component API usage:
  - Old: `<Dialog open={open} title={title} onClose={handleClose}>`
  - New: Use Dialog trigger/content pattern

    6.4. **Test dialog functionality**

- Verify keyboard navigation (Escape to close, Tab focus trap)
- Test backdrop click to close
- Verify ARIA attributes for screen readers
- Check animations and transitions

  6.5. **Remove old Dialog component**

- Delete `src/lib/components/Dialog.svelte`
- Update `src/lib/components/index.ts` if exists

**Expected Output**: shadcn-svelte Dialog component fully integrated

**Validation**:

- All dialogs work correctly
- Improved accessibility (better keyboard navigation, focus management)
- No references to old Dialog component remain
- Visual consistency maintained

---

### Phase 7: Add Theme Toggle UI

**Estimated Effort**: 1-2 hours  
**Files to Modify**:

- `src/lib/components/TopMenu.svelte` OR
- `src/lib/components/Sidebar.svelte` (in settings sheet)

**Tasks**:

7.1. **Add theme toggle to settings**

- Use existing Settings sheet in Sidebar
- Add radio group or select for theme preference:
  - Light
  - Dark
  - System (default)
- Use mode-watcher's `setMode()` function
- Display current theme state

  7.2. **Optional: Quick toggle in TopMenu**

- Add moon/sun icon button to TopMenu
- Toggle between light/dark on click
- Use `lucide-svelte` icons: `Moon`, `Sun`, `SunMoon`
- Show appropriate icon based on current theme

  7.3. **Style theme toggle controls**

- Use semantic tokens
- Ensure accessibility (labels, focus indicators)

**Expected Output**: User-accessible theme switching controls

**Validation**:

- Can switch between light, dark, and system modes
- Preference persists after page reload
- All components update correctly when theme changes
- Theme toggle is accessible via keyboard

---

### Phase 8: Optional Enhancements

**Estimated Effort**: 2-4 hours  
**Priority**: Low (nice to have)

**Tasks**:

8.1. **Add shadcn-svelte Input component**

- Install: `npx shadcn-svelte@latest add input`
- Update login/register forms to use Input component
- More consistent styling with rest of app

  8.2. **Create type-safe theme utilities**

- Create `src/lib/types/theme.ts`
- Export `ColorToken` type
- Export `getThemeValue()` helper function
- Useful for any JavaScript code needing theme values

  8.3. **Optimize theme switching transition**

- Add smooth color transitions: `transition-colors duration-200`
- Apply to root element and key components
- Avoid jarring theme changes

  8.4. **Add theme to toast configuration**

- Update `Toast.svelte` wrapper
- Pass theme prop to svelte-sonner: `<Toaster theme={$mode} />`
- Ensures toasts match app theme

**Expected Output**: Enhanced theme system with better UX

**Validation**:

- Smooth transitions when switching themes
- Type safety when accessing theme values
- Toast notifications match current theme

---

## Component Replacement Summary

### Components to Replace

| Custom Component | Replacement          | Reason                                      | Priority |
| ---------------- | -------------------- | ------------------------------------------- | -------- |
| `Dialog.svelte`  | shadcn-svelte Dialog | Better accessibility, features, consistency | High     |

### Components to Keep

| Component                   | Reason                                               |
| --------------------------- | ---------------------------------------------------- |
| `Toast.svelte`              | svelte-sonner already excellent, just a thin wrapper |
| All other custom components | Domain-specific, no direct shadcn equivalent needed  |

### shadcn-svelte Components to Add

| Component | Purpose                      | Priority | Phase        |
| --------- | ---------------------------- | -------- | ------------ |
| Dialog    | Replace custom dialog        | High     | 6            |
| Input     | Form inputs (login/register) | Medium   | 8 (optional) |
| Textarea  | Multi-line inputs            | Low      | Future       |
| Card      | Content containers           | Low      | Future       |

---

## Migration Strategy & Best Practices

### 1. Backward Compatibility

- Make changes incrementally, file by file
- Test each component after migration
- Keep old and new patterns side-by-side temporarily if needed

### 2. Testing Approach

For each migrated component:

1. Visual inspection in light mode
2. Visual inspection in dark mode
3. Toggle theme while viewing component
4. Check keyboard navigation
5. Verify no console errors
6. Test on different screen sizes

### 3. Git Commit Strategy

Recommended commit structure:

- Phase 1: "feat: define core theme tokens in CSS"
- Phase 2: "feat: integrate theme tokens with Tailwind CSS"
- Phase 3: "feat: create CodeMirror theme utilities"
- Phase 4: "feat: setup theme switching with mode-watcher"
- Phase 5: "refactor: migrate UI components to semantic tokens" (may be multiple commits)
- Phase 6: "feat: replace custom Dialog with shadcn-svelte"
- Phase 7: "feat: add theme toggle UI"
- Phase 8: "feat: optional theme enhancements"

### 4. Rollback Plan

If issues arise:

- Each phase is relatively independent
- Can roll back individual commits
- Keep old Dialog component until new one is fully tested
- CSS custom properties are additive - won't break existing code until components are migrated

---

## Dependencies

### Existing Dependencies (No Changes Needed)

```json
{
	"mode-watcher": "^1.1.0", // Theme switching
	"shadcn-svelte": "^1.0.10", // UI components
	"tailwindcss": "^4.1.13", // Styling
	"svelte-sonner": "^1.0.5", // Toast (keep as-is)
	"lucide-svelte": "^0.548.0" // Icons (for theme toggle)
}
```

### No New Dependencies Required

All functionality can be achieved with existing packages.

---

## Testing Checklist

### Automated Tests

- [ ] No new automated tests required (visual/integration testing)
- [ ] Existing tests should still pass

### Manual Testing

**Theme System**:

- [ ] Light theme displays correctly
- [ ] Dark theme displays correctly
- [ ] System theme preference is respected
- [ ] Theme preference persists after refresh
- [ ] Theme toggle works from UI controls

**Components**:

- [ ] All components render in light mode
- [ ] All components render in dark mode
- [ ] No visual regressions compared to current design
- [ ] Color contrast meets WCAG 2.1 AA standards

**CodeMirror Editor**:

- [ ] Editor colors update when theme changes
- [ ] Cursor, selection, active line visible in both themes
- [ ] Gutter colors match editor background
- [ ] Line numbers readable in both themes

**Accessibility**:

- [ ] Focus indicators visible in both themes
- [ ] Color contrast ratios meet standards
- [ ] Keyboard navigation works in all components
- [ ] Screen reader announcements appropriate
- [ ] Dialog focus trap works correctly

**shadcn-svelte Dialog**:

- [ ] Dialog opens and closes correctly
- [ ] Backdrop click closes dialog
- [ ] Escape key closes dialog
- [ ] Focus trapped inside dialog when open
- [ ] Focus returns to trigger on close
- [ ] Multiple dialogs work correctly

---

## Risk Assessment

### Low Risk

- Adding CSS custom properties (additive, non-breaking)
- Installing shadcn-svelte components (isolated)
- Adding theme toggle UI (new feature)

### Medium Risk

- Migrating component colors (many files to update, potential for mistakes)
- Updating CodeMirror theme (complex editor, could affect editing experience)

### Mitigation Strategies

- Thorough testing after each phase
- Visual regression testing (manual)
- Incremental rollout (one component at a time)
- Keep old Dialog component until new one is fully validated
- Use git branches for experimental changes

---

## Success Criteria

### Functional Requirements

- ✅ All components use semantic color tokens (no hardcoded zinc-\* classes)
- ✅ Light and dark themes both work correctly
- ✅ Theme preference persists across sessions
- ✅ CodeMirror editor themes dynamically with CSS variables
- ✅ shadcn-svelte Dialog replaces custom Dialog
- ✅ Theme toggle accessible from UI

### Non-Functional Requirements

- ✅ No performance degradation
- ✅ Maintains Section 508 accessibility compliance
- ✅ WCAG 2.1 AA color contrast ratios
- ✅ No breaking changes to existing functionality
- ✅ Code is maintainable and well-documented

### Quality Metrics

- ✅ Zero hardcoded color values in component files
- ✅ All theme tokens documented
- ✅ Type-safe theme access (TypeScript)
- ✅ Consistent design aesthetic maintained

---

## Timeline Estimate

| Phase                          | Estimated Time  | Complexity  |
| ------------------------------ | --------------- | ----------- |
| Phase 1: Core tokens           | 2-3 hours       | Medium      |
| Phase 2: Tailwind integration  | 1-2 hours       | Low         |
| Phase 3: CodeMirror utilities  | 2-3 hours       | Medium      |
| Phase 4: Theme switching setup | 1-2 hours       | Low         |
| Phase 5: Component migration   | 4-6 hours       | Medium-High |
| Phase 6: shadcn Dialog         | 2-3 hours       | Medium      |
| Phase 7: Theme toggle UI       | 1-2 hours       | Low         |
| Phase 8: Optional enhancements | 2-4 hours       | Low         |
| **Total**                      | **15-25 hours** | -           |

**Recommended Approach**: Complete phases 1-6 as MVP, then phases 7-8 as enhancements.

---

## Future Considerations

### Theme Variants

- High contrast mode for accessibility
- Custom color schemes (beyond light/dark)
- User-customizable themes

### Advanced Features

- CSS variable animation/interpolation
- Theme-aware images and assets
- Per-component theme overrides
- Theme presets gallery

### Performance

- Lazy load theme-specific assets
- Optimize CSS custom property lookups
- Cache computed theme values in JavaScript

### Developer Experience

- Theme preview tool
- Design tokens documentation site
- Storybook integration for component previews
- Auto-generate theme from design system

---

## Conclusion

This plan provides a comprehensive, phased approach to unifying the theme system in tonguetoquill-web. By following these phases, the codebase will have:

1. **Centralized theme management** via CSS custom properties
2. **Consistent theming** across Tailwind and CodeMirror
3. **Light/dark mode support** with user preference persistence
4. **Improved component library** with shadcn-svelte Dialog
5. **Better maintainability** for future theme iterations

The phased approach minimizes risk while delivering incremental value at each step.
