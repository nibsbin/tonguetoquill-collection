# Tonguetoquill Design Documentation

## Overview

This directory contains comprehensive design documentation for the Tonguetoquill markdown editor application. These documents capture the complete UI design, architecture, and interaction patterns of the application.

## Documentation Structure

### [01-overview.md](./01-overview.md)

**Project Overview & Architecture**

- Introduction and design philosophy
- Application architecture and component hierarchy
- Key features and capabilities
- Target audience
- Technical stack
- Browser requirements

### [02-design-system.md](./02-design-system.md)

**Design System & Visual Language**

- Complete color palette (light and dark themes)
- Typography specifications (fonts, sizes, weights)
- Spacing system and layout measurements
- Border radius and visual effects
- Icons and their specifications
- Interactive states and transitions
- Design tokens reference

### [03-components.md](./03-components.md)

**Component Specifications**

- Detailed specs for each component:
  - Sidebar (collapsible navigation)
  - TopMenu (header bar)
  - EditorToolbar (formatting controls)
  - MarkdownEditor (text input)
  - MarkdownPreview (rendered output)
- Component interactions and flows
- Toast notification system

### [04-layout.md](./04-layout.md)

**Layout Architecture**

- Overall layout structure and breakdown
- Detailed specifications for each section:
  - Root container
  - Sidebar layout
  - Main content area
  - Split editor panel
- Responsive considerations
- Overflow handling
- Z-index layers
- Spacing and gutters

### [05-interactions.md](./05-interactions.md)

**Interaction Patterns & User Flows**

- Core interaction principles
- Complete user flows:
  - First-time user experience
  - Document creation and editing
  - File management
  - Export and sharing
  - Settings management
- Interaction states (buttons, files, sidebar, toggles)
- Micro-interactions and animations
- Keyboard interactions
- Error states and edge cases
- Accessibility interactions

### [06-state-management.md](./06-state-management.md)

**State Management & Data Flow**

- State architecture and flow patterns
- Application state specifications:
  - Files state
  - Active file tracking
  - Selection state
  - Editor mode state
- Component-local state
- Data flow diagrams for all major operations
- Props interfaces
- State persistence strategies
- Performance considerations
- Future state additions

## Using These Documents

### For Designers

- Reference color palette and typography in **02-design-system.md**
- Understand component structure in **03-components.md**
- Review interaction patterns in **05-interactions.md**
- Ensure consistency with established design system

### For Developers

- Understand architecture in **01-overview.md**
- Reference component specs in **03-components.md**
- Follow layout guidelines in **04-layout.md**
- Implement state management per **06-state-management.md**
- Follow interaction patterns in **05-interactions.md**

### For Product Managers

- Review features and capabilities in **01-overview.md**
- Understand user flows in **05-interactions.md**
- Plan future features based on documented future considerations
- Ensure feature requests align with design principles

### For QA/Testing

- Test against interaction specifications in **05-interactions.md**
- Verify component states per **03-components.md**
- Check edge cases documented in **05-interactions.md**
- Validate state transitions per **06-state-management.md**

## Design Principles Summary

### 1. Developer-First Design

Interface inspired by VSCode with familiar patterns that developers recognize and appreciate.

### 2. Minimal Distraction

Clean, focused interface that prioritizes content creation over UI chrome.

### 3. Real-Time Feedback

Live preview updates as you type, with instant visual feedback for all actions.

### 4. Professional Aesthetic

Dark-themed interface with carefully chosen color palette emphasizing readability and focus.

### 5. Smooth Interactions

300ms transitions, fade animations, and responsive hover states create a polished experience.

## Key Color Reference

### Dark Theme (Current)

```css
Background:        zinc-900 (#18181b)
Secondary BG:      zinc-800 (#27272a)
Active/Hover:      zinc-700 (#3f3f46)
Primary Text:      zinc-100 (#f4f4f5)
Secondary Text:    zinc-400 (#a1a1aa)
Borders:           zinc-700 (#3f3f46)
Primary Blue:      #355e93 (brand color, future use)
```

### Light Theme (Future)

```css
Background:        #ffffff
Primary Blue:      #355e93 (brand accent)
Grays:             Various (to be specified)
```

## Typography Reference

### Fonts

- **UI Font**: Lato (weights: 100, 300, 400, 700, 900)
- **Editor Font**: System monospace
- **Preview Font**: Crimson Text (400, 600, 700)

### Key Sizes

- Base: 16px
- Brand Title: 1.2rem (19.2px)
- Small: 0.875rem (14px)
- XS: 0.75rem (12px)

## Layout Measurements

### Heights

- TopMenu: 48px (h-12)
- Toolbar: 40px (h-10)
- Sidebar (collapsed): 48px (w-12)
- Sidebar (expanded): 224px (w-56)

### Spacing Scale

- Base: 0.25rem (4px)
- Standard: 0.5rem (8px)
- Comfortable: 1rem (16px)
- Spacious: 1.5rem (24px)

## Implementation Status

### ✅ Implemented

- Complete dark theme
- File management (create, switch, delete)
- Real-time markdown editing and preview
- Collapsible sidebar
- Formatting toolbar
- Download functionality
- Share functionality
- Settings UI (non-functional toggles)

### 🚧 Partial Implementation

- Editor mode toggle (UI only, wizard mode not implemented)
- Settings toggles (visual only, no actual functionality)
- Light theme (defined in CSS, no toggle implementation)

### 📋 Planned

- Actual settings functionality (auto-save, theme toggle, line numbers)
- Wizard/WYSIWYG editor mode
- File persistence (localStorage/cloud)
- Import file functionality
- Keyboard shortcuts
- Document metadata (word count, reading time)
- Responsive mobile layout
- User authentication and profiles

## Contributing to Documentation

When updating these design documents:

1. **Maintain Consistency**: Use the same formatting and structure
2. **Be Specific**: Include exact measurements, colors, and timing
3. **Include Code Examples**: Show TypeScript interfaces and CSS when relevant
4. **Document Changes**: Note implementation status (implemented/planned/future)
5. **Cross-Reference**: Link between documents when referencing related concepts
6. **Update README**: Reflect any new documents or major changes here

## Version History

### v1.0 - Initial Documentation (Current)

- Complete documentation of existing application
- 6 comprehensive design documents
- Covers all implemented features
- Documents future enhancements
- Establishes design system foundation

## Contact & Feedback

For questions about the design system or to propose changes:

- Review the relevant document first
- Consider the design principles
- Ensure consistency with existing patterns
- Document your proposal with specifics

## External Resources

### Tools & Libraries Used

- [Tailwind CSS v4.0](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Lucide React](https://lucide.dev/) - Icon library
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering
- [Motion](https://motion.dev/) - Animation library
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

### Design Inspiration

- [Visual Studio Code](https://code.visualstudio.com/) - Layout and navigation patterns
- [GitHub](https://github.com/) - Markdown preview styling
- [Notion](https://notion.so/) - Editor interactions

### Typography Resources

- [Google Fonts - Lato](https://fonts.google.com/specimen/Lato)
- [Google Fonts - Crimson Text](https://fonts.google.com/specimen/Crimson+Text)

---

_Last Updated: October 27, 2025_
