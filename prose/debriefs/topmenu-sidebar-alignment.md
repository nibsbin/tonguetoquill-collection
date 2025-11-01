---
title: Top menu & Sidebar alignment
date: 2025-10-31
status: ✅ Implemented
---

Summary
=======

This debrief documents a small UI adjustment to align the top menu (document title area) with the left sidebar slots and to centralize a stronger top-menu divider for theming.

What changed
============

- Moved the project logo from the sidebar into the top menu and marked it as decorative (aria-hidden="true").
- Ensured the left/document-title area has an explicit height for predictable alignment.
- Centralized a slightly heavier top-menu divider in CSS for easier theming.
- Made sidebar slot heights predictable by switching the slot container to `box-sizing: border-box` and reducing the vertical padding on the first slot to match the top-menu baseline.

Files modified (high level)
===========================

- `src/lib/components/TopMenu/TopMenu.svelte`
  - Logo moved to the left of the document title and marked `aria-hidden="true"`.
  - Left/title area fixed to a 3.1rem height.
  - Applied the `.top-menu-strong-border` utility class.

- `src/lib/components/Sidebar/Sidebar.svelte`
  - Removed the centered logo block previously rendered in the sidebar.
  - Restored the original slot markup and ensured separators align under the hamburger/title area.

- `src/lib/components/Sidebar/SidebarButtonSlot.svelte`
  - Set `.sidebar-button-slot { box-sizing: border-box; }` so the declared slot height includes padding.
  - Added a scoped rule to slightly reduce the vertical padding of the first slot (hamburger) to improve baseline alignment.

- `src/app.css`
  - Added `.top-menu-strong-border { border-bottom-width: 1.5px; }` so the divider weight is controlled centrally (the color and style continue to come from existing variables/classes).

Why
===

These changes make the header and sidebar bottoms align predictably across breakpoints. Centralizing the border weight in `app.css` makes it easier to theme and keep consistent. Using `border-box` for the slot container makes computed heights include padding, removing layout surprises caused by content-box sizing.

Accessibility
=============

- The logo was moved into the top menu and marked as decorative with `aria-hidden="true"`. If the logo conveys important branding for non-sighted users, consider restoring an accessible label elsewhere.

Follow-ups / Recommendations
===========================

1. Consider exposing the first-slot vertical padding as a CSS variable (e.g., `--sidebar-first-slot-vertical-padding`) if designers want to tweak alignment without editing component CSS.
2. Add a short note to `prose/designs/frontend/DESIGN_SYSTEM.md` describing the `--top-menu-height` expectation and `.top-menu-strong-border` utility (I can add this if you want).
3. If you use visual regression tests, add a snapshot for the top-left header/sidebar area to catch regressions.

Done
====

Change implemented: October 31, 2025
