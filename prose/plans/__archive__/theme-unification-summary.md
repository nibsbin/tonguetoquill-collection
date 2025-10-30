# Theme Unification Project Summary

## Quick Reference

This document provides a high-level overview of the theme unification project for tonguetoquill-web.

### Related Documents
- **Design Document**: [`prose/designs/theme-system-design.md`](../designs/theme-system-design.md) - Architecture and technical approach
- **Implementation Plan**: [`prose/plans/theme-unification-plan.md`](./theme-unification-plan.md) - Step-by-step implementation guide

## Problem Statement

Currently, tonguetoquill-web has:
- **Hardcoded colors**: Zinc palette colors (zinc-900, zinc-800, etc.) scattered throughout components
- **Inconsistent theming**: CodeMirror editor uses inline hex values, components use Tailwind classes
- **No theme switching**: Cannot easily toggle between light/dark modes
- **Custom components**: Dialog.svelte could be replaced with more robust shadcn-svelte equivalent
- **Maintenance challenges**: Updating colors requires changes in multiple places

## Solution Overview

Create a centralized theme system using CSS custom properties that:
1. **Defines semantic color tokens** (e.g., `--color-background`, `--color-foreground`)
2. **Supports light and dark themes** with a simple class toggle
3. **Integrates with Tailwind CSS** via `@theme inline` directive
4. **Powers CodeMirror editor** through JavaScript theme utilities
5. **Enables easy maintenance** - change one variable to update everywhere

## Key Design Decisions

### 1. CSS Custom Properties as Foundation
**Why**: Native browser support, runtime theme switching, accessible from both CSS and JavaScript

### 2. Semantic Token Naming
**Why**: `--color-background` is more maintainable than `--color-zinc-900`, allows changing actual colors without renaming

### 3. Keep svelte-sonner for Toasts
**Why**: Already well-integrated, excellent UX, just needs theme token updates

### 4. Replace Dialog with shadcn-svelte
**Why**: Better accessibility, focus management, keyboard navigation, and consistency with other UI components

### 5. Use mode-watcher for Theme Management
**Why**: Already a dependency, handles system preferences, localStorage persistence, and provides Svelte stores

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      app.css                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ :root { --color-background: #fff; }                  │   │
│  │ .dark { --color-background: #18181b; }              │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ├──────────────┬──────────────┐   │
│                           ▼              ▼              ▼   │
│  ┌────────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ @theme inline  │  │ Components  │  │ CodeMirror  │     │
│  │ (Tailwind)     │  │ (CSS vars)  │  │ (JS theme)  │     │
│  └────────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                 ┌─────────────────┐
                 │  mode-watcher   │
                 │ (Theme toggle)  │
                 └─────────────────┘
```

## Token Structure Preview

### Color Tokens (Semantic)
```css
/* Surface colors */
--color-background
--color-foreground
--color-surface-elevated

/* Interactive states */
--color-primary
--color-primary-foreground
--color-accent
--color-accent-foreground

/* Semantic */
--color-muted
--color-muted-foreground
--color-border
--color-destructive

/* Editor-specific */
--color-editor-background
--color-editor-foreground
--color-editor-selection
--color-editor-cursor
```

### Usage Examples

**Tailwind CSS**:
```html
<div class="bg-background text-foreground border-border">
```

**CodeMirror**:
```typescript
import { createEditorTheme } from '$lib/utils/editor-theme';

const theme = createEditorTheme(); // Reads CSS variables
```

## Implementation Phases (Summary)

| Phase | What | Duration | Priority |
|-------|------|----------|----------|
| 1 | Define CSS custom properties | 2-3h | Critical |
| 2 | Tailwind integration | 1-2h | Critical |
| 3 | CodeMirror theme utils | 2-3h | Critical |
| 4 | Theme switching setup | 1-2h | High |
| 5 | Migrate components | 4-6h | High |
| 6 | Install shadcn Dialog | 2-3h | Medium |
| 7 | Add theme toggle UI | 1-2h | Medium |
| 8 | Optional enhancements | 2-4h | Low |

**Total**: 15-25 hours  
**MVP**: Phases 1-6 (13-19 hours)

## Component Changes Summary

### To Replace
- ❌ `Dialog.svelte` → ✅ shadcn-svelte Dialog

### To Keep (with token updates)
- ✅ `Toast.svelte` (svelte-sonner wrapper)
- ✅ All other custom components (domain-specific)

### To Update
- 📝 All 28 `.svelte` files using `zinc-*` colors
- 📝 MarkdownEditor.svelte (remove inline hex colors)
- 📝 All shadcn-svelte UI components (use semantic tokens)

## Migration Mapping

| Old Class | New Class | Context |
|-----------|-----------|---------|
| `bg-zinc-900` | `bg-background` | Dark backgrounds |
| `bg-zinc-800` | `bg-surface-elevated` | Elevated surfaces |
| `bg-zinc-700` | `bg-accent` | Hover states |
| `text-zinc-100` | `text-foreground` | Primary text (dark) |
| `text-zinc-400` | `text-muted-foreground` | Secondary text |
| `border-zinc-700` | `border-border` | Borders |

## Testing Strategy

### For Each Component
1. ✅ Visual check in light mode
2. ✅ Visual check in dark mode
3. ✅ Toggle theme while viewing
4. ✅ Keyboard navigation
5. ✅ Color contrast (WCAG AA)

### Critical Tests
- [ ] Editor colors update on theme change
- [ ] No hardcoded colors remain (`grep -r "zinc-" src`)
- [ ] Theme preference persists
- [ ] Dialog keyboard navigation works
- [ ] All components maintain design aesthetic

## Benefits

### For Developers
- 🎯 **Single source of truth** for colors
- 🔧 **Easy maintenance** - update one variable, not 50+ files
- 🎨 **Theme iterations** quick and safe
- 📖 **Better code readability** with semantic names

### For Users
- 🌓 **Light/dark mode** support
- ♿ **Better accessibility** with consistent contrast ratios
- 💾 **Persistent preferences** across sessions
- 🎭 **Consistent design** throughout the app

### For the Project
- 📊 **Maintainable codebase** easier to onboard new developers
- 🚀 **Extensible system** ready for new themes
- ✅ **Standards compliance** WCAG 2.1 AA
- 🎁 **Modern practices** CSS custom properties, semantic tokens

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Visual regressions | Manual testing after each component |
| Breaking editor | Keep CodeMirror changes isolated, test extensively |
| Accessibility issues | Contrast checker validation, keyboard testing |
| Migration errors | Incremental approach, one component at a time |

## Success Metrics

- ✅ Zero `zinc-*` color classes in codebase
- ✅ Light and dark themes fully functional
- ✅ Theme switching works seamlessly
- ✅ All WCAG 2.1 AA contrast requirements met
- ✅ No performance degradation
- ✅ No breaking changes to functionality

## Next Steps

1. Review design document for architecture understanding
2. Review implementation plan for detailed steps
3. Set up development environment
4. Start with Phase 1 (CSS custom properties)
5. Progress through phases sequentially
6. Test thoroughly after each phase

## Questions & Answers

**Q: Why not use Tailwind's built-in dark mode?**  
A: We are! But we need semantic tokens to work with CodeMirror and for better maintainability.

**Q: Why replace Dialog but keep Toast?**  
A: Dialog benefits from shadcn's better accessibility. Toast (svelte-sonner) is already excellent.

**Q: Can we add more themes later?**  
A: Yes! The architecture supports multiple themes - just add new CSS classes like `.high-contrast`.

**Q: Will this break existing functionality?**  
A: No. Changes are additive until component migration, which is done incrementally with testing.

**Q: How long before we see benefits?**  
A: After Phase 4, theme switching works. After Phase 5, maintenance becomes easier.

## Resources

- [Tailwind CSS 4.0 Docs](https://tailwindcss.com/docs)
- [shadcn-svelte](https://www.shadcn-svelte.com/)
- [mode-watcher](https://mode-watcher.svecosystem.com/)
- [CodeMirror Theming](https://codemirror.net/examples/styling/)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Last Updated**: 2025-10-29  
**Status**: Planning Complete  
**Next**: Begin Implementation (Phase 1)
