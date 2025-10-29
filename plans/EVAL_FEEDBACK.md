# Iterate design docs

## 1. Unnecessary Features

1.1: Great point! I removed light and contrast modes from design docs--but ensure I didn't miss anything.

1.2: Agree. Remove the wizard for now.

1.3: Agree. Remove this feature from MVP.

1.4: Agreed. Remove this feature from MVP.

1.5: Agree. We will never need this.

## 2. Missing Features

2.1: Good catch. I do not plan on implementing collaborative editing any time soon. Remove all references to this feature.

2.2: Remove all references to offline support for the MVP.

2.3: Remove all designs and references for the document version history feature in design documents. Not relevant for MVP.

2.4: For the MVP, we will not offer any templates. Just a blank markdown document. Remove all designs and references regarding markdown templates.

2.5: No plans to implement this. Remove all designs and references to search & filter functionality.

2.6: Rework the UNCLASSIFIED classification banner design to be a toast message instead.

2.7: We don't need error recovery or data loss prevention for MVP.

2.8: Here are the keyboard shortcuts to display:
- Ctrl/Cmd+Z: undo
- Ctrl/Cmd+Y: redo
- Ctrl/Cmd+B: bold
- Ctrl/Cmd+I: italic
- Ctrl/Cmd+Shift+X: strikethrough
- Ctrl/Cmd+K: insert link
- Ctrl/Cmd + 1-6: heading levels 1-6
- Ctrl/Cmd+S: save
- Ctrl/Cmd+F: find

2.9: Do not worry about mobile gestures for MVP. Remove all designs and references to mobile gestures.

## 3. Poor Organization Choices

3.1: Good points:
- Make DESIGN_SYSTEM.md the single source of truth for all design-related decisions and design tokens. Remove redundant design info from other docs.
- UI_COMPONENTS.md should reference DESIGN_SYSTEM.md rather than repeating values
- Use statements like "See DESIGN_SYSTEM.md for color palette" instead of duplicating values

3.2: Agreed. Focus on Props, states, interactions, and accessibility in UI_COMPONENTS.md and put visual design details in DESIGN_SYSTEM.md. Keep only component-specific styling details in component docs

3.3: Agreed. Replace repeated information with cross-references to follow DRY principles.

3.4: Keep svelte-based design patterns. You may reduce the granularity of constraints by specifying them as high-level requirements instead of exact values.

3.5: Agreed. Establish a consistent UI component documentation system that followed KISS principles.

3.6: Agreed. Remove all future feature designs to keep us laser focused on the MVP.

## 4. Ambiguous Specifications

4.1: Use your discretion to improve the breakpoint behavior design specification.

4.2: Here are more detailed specifications for auto-saving: 
- When auto-save is enabled, save 7 seconds after last keystroke.
- Save triggers manually or via debounced auto-save.
- When there is an error, just display the message for the user. Keep it simple for the MVP.
- Upon conflict, always overwrite server version.

4.3: Good points. Use your discretion to better specify the form validation strategy.

4.4: Reference [AUTH.md](../designs/backend/AUTH.md) for specific values to follow DRY principles.

4.5: Each document is owned by a single user, the user that created the document. We will not support sharing for the MVP. Remove all designs and references for sharing.

4.6: Specific design choices are described in UI_COMPONENTS.md and DESIGN_SYSTEM.md. If there is ambiguity in the term "VSCode-inspired", reference those documents.

4.7: Use your discretion to better specify navigation patterns.

4.8: The loading page should only be shown if a preview document hasn't already been rendered to Preview. If one exists, just show the last rendered Preview document to avoid flashes. Use your discretion to better specify loading states.

4.9: Ignore

4.10: Ignore; I will design and implement Quillmark integration after initial layout has been implemented.