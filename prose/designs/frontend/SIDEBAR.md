# Sidebar Design

## Overview

This document describes the redesigned sidebar component for Tonguetoquill, inspired by the Claude AI sidebar design patterns while maintaining our existing functionality, color palette, and transition timings.

## Design Inspiration

The new sidebar design is inspired by `prose/claude-theme/claude-sidebar.html`, incorporating:
- Modern proportions and spacing
- Smooth interactive behaviors
- Icon hover effects and transitions
- Hierarchical information architecture
- Better visual feedback on interactions

## Core Principles

1. **Maintain Existing Functionality**: All current features (document management, settings, user profile) remain intact
2. **Keep Color Palette**: Continue using our zinc-based dark theme colors
3. **Preserve Transition Timings**: Maintain our 300ms transition duration
4. **Enhance Proportions**: Adopt Claude's spacing and sizing patterns
5. **Improve Behaviors**: Add subtle hover effects and visual feedback

## Layout & Proportions

### Dimensions

**Desktop (≥1024px)**:
- **Expanded width**: 18rem (288px) - increased from current 14rem (224px)
- **Collapsed width**: 3rem (48px) - same as current
- **Transition**: 300ms duration with cubic-bezier(0.165, 0.85, 0.45, 1) easing

**Mobile (<1024px)**:
- Full-screen drawer overlay
- Width: 18rem (288px) when open
- Slides in from left with shadow

### Structure

```
┌─────────────────────────────┐
│  Toggle Button              │  h-12 (48px) - Header
│  + App Branding             │
├─────────────────────────────┤
│  Primary Actions            │  
│  (New chat/file button)     │  h-9 (36px) per action
├─────────────────────────────┤
│  Navigation Items           │
│  (Chats, Projects, etc.)    │  h-9 (36px) per item
├─────────────────────────────┤
│                             │
│  Recent Items List          │  h-8 (32px) per item
│  (Scrollable)               │
│                             │
│  ↓ Scrollable Area ↓        │
├─────────────────────────────┤
│  User Profile               │  h-9 (36px) + padding
│  Settings                   │
└─────────────────────────────┘
```

## Visual Hierarchy

### Spacing

**Padding & Margins** (based on Claude patterns):
- Container padding: `px-2` (8px horizontal)
- Item gaps: `gap-px` or `gap-1` (1px or 4px between items)
- Section padding: `p-2` (8px all around)
- Inner content padding: `px-4 py-2` for buttons

**Item Heights**:
- Primary actions (New File): `h-9` (36px)
- Navigation items: `h-9` (36px)
- Recent items: `h-8` (32px)
- User/Settings: `h-9` (36px)

### Typography

**Text Sizes**:
- App title: `text-sm` font-medium (14px)
- Navigation items: `text-sm` (14px)
- Recent items: `text-xs` (12px)
- Section headers: `text-xs` text-text-300 (muted)

**Font Weights**:
- Headings/Primary: font-medium (500)
- Regular items: font-normal (400)
- Active items: font-medium (500)

## Color Scheme

Maintain our existing zinc-based palette with semantic tokens:

### Background Colors
- **Sidebar background**: `bg-bg-200` → zinc-900 (#18181b)
- **Hover state**: `hover:bg-bg-400` → zinc-800/50 (rgba(39, 39, 42, 0.5))
- **Active/Selected**: `bg-bg-400` → zinc-800 (#27272a)
- **Border**: `border-border-300` → zinc-700 (#3f3f46)

### Text Colors
- **Primary text**: `text-text-100` → zinc-100 (#f4f4f5)
- **Secondary text**: `text-text-200` → zinc-300 (#d4d4d8)
- **Muted text**: `text-text-300` → zinc-400 (#a1a1aa)
- **Hover text**: `hover:text-text-100` → zinc-100 (#f4f4f5)

### Accent Colors
- **Primary action background**: `bg-accent-main-000` → USAF Blue or branded color
- **Primary action text**: `text-always-white` → #ffffff
- **Accent hover**: `hover:bg-accent-main-000/[0.08]` → USAF Blue with 8% opacity

## Interactive Behaviors

### Button States

**Ghost Buttons** (most sidebar items):
```css
/* Default */
- Background: transparent
- Text: text-text-300 (muted)
- Transition: all 300ms cubic-bezier(0.165, 0.85, 0.45, 1)

/* Hover */
- Background: bg-bg-400
- Text: text-text-100
- Scale: active:scale-[0.985] (subtle press effect)

/* Active/Selected */
- Background: bg-bg-400
- Text: text-text-100
- Scale: active:scale-[1.0] (no press effect when already active)
```

**Primary Action Button** (New File/Chat):
```css
/* Default */
- Background: bg-accent-main-000 (USAF Blue or brand color)
- Text: text-always-white
- Icon container: rounded-full with shadow
- Transition: all ease-in-out

/* Hover */
- Icon: -rotate-3 scale-110 with shadow-md
- Text: no change

/* Active */
- Icon: rotate-6 scale-[0.98] (playful bounce)
- Background: bg-accent-brand/15
```

### Icon Animations

**Toggle/Navigation Icons**:
```css
/* Default */
- Scale: scale-100
- Opacity: opacity-100
- Transition: all properties

/* Hover */
- Scale: scale-80 (shrink slightly)
- Opacity: opacity-0 (fade out)
- Secondary icon fades in: scale-100 opacity-100
```

**Action Icons** (from Claude):
```css
/* Chats icon on hover */
- Inner paths: translate-x-[0.5px] or -translate-x-[0.5px]

/* Projects icon on hover */
- Top layer: -translate-y-[1.4px] translate-x-[0.5px] rotate-3
- Middle layer: -translate-y-[2.8px] translate-x-px rotate-6

/* Artifacts icon on hover */
- Specific elements rotate or transform
```

### List Item Behaviors

**Recent Items**:
```css
/* Default */
- Height: h-8 (32px)
- Text: truncate with ellipsis
- Options button: opacity-0

/* Hover */
- Options button: opacity-100
- Text mask: gradient fade on right edge
  [mask-image:linear-gradient(to_right,hsl(var(--always-black))_78%,transparent_95%)]

/* Selected */
- Background: bg-bg-400
- Text: full opacity
- Show delete icon on hover
```

### Scroll Behavior

**Recents List**:
```css
/* Container */
- overflow-y-auto
- overflow-x-hidden
- Gradient fade at bottom:
  bg-gradient-to-t from-bg-200 to-transparent
  sticky h-4 bottom-0
```

## Component Structure

### Header Section

```svelte
<div class="flex w-full items-center gap-px p-2">
  <!-- Toggle button with dual-icon animation -->
  <Button variant="ghost" size="icon" class="h-8 w-8">
    <div class="relative">
      <!-- Default icon -->
      <Icon class="group-hover:scale-80 transition scale-100 group-hover:opacity-0" />
      <!-- Hover icon -->
      <Icon class="opacity-0 scale-75 absolute inset-0 group-hover:scale-100 group-hover:opacity-100" />
    </div>
  </Button>
  
  <!-- App branding/logo -->
  <a class="flex flex-col justify-start items-top">
    <svg class="ml-[3px] h-4 flex-shrink-0" />
  </a>
</div>
```

### Primary Actions

```svelte
<div class="flex flex-col px-2 pt-1 gap-px mb-6">
  <!-- New File/Chat Button with animated icon -->
  <Button class="h-9 px-4 py-2 rounded-lg hover:bg-accent-main-000/[0.08]">
    <div class="flex flex-row items-center gap-2">
      <div class="w-6 h-6 rounded-full bg-accent-main-000 
                  group-hover:-rotate-3 group-hover:scale-110 
                  group-hover:shadow-md transition-all">
        <PlusIcon class="text-always-white group-hover:scale-105" />
      </div>
      <div class="text-accent-main-100 font-medium text-sm">New File</div>
    </div>
  </Button>
</div>
```

### Navigation Items

```svelte
<div class="relative group">
  <Button variant="ghost" class="h-9 px-4 py-2 w-full hover:bg-bg-400">
    <div class="flex flex-row items-center justify-start gap-3">
      <div class="size-4 flex items-center justify-center">
        <!-- Animated icon on hover -->
        <Icon class="group-hover:translate-effect" />
      </div>
      <span class="truncate text-sm">{label}</span>
    </div>
  </Button>
  
  <!-- Options menu (hidden by default, shown on hover) -->
  <div class="absolute right-0 top-1/2 -translate-y-1/2 
              hidden group-hover:block group-focus-within:block">
    <Button size="icon" variant="ghost">
      <MoreIcon />
    </Button>
  </div>
</div>
```

### Recent Items List

```svelte
<div class="flex flex-col overflow-y-auto overflow-x-hidden px-2">
  <!-- Section header with gradient background -->
  <h3 class="text-text-300 pb-2 text-xs pl-2 sticky top-0 z-10 
             bg-gradient-to-b from-bg-200 from-50% to-bg-200/40">
    Recents
  </h3>
  
  <ul class="flex flex-col gap-px">
    {#each items as item}
      <li class="relative group">
        <Button variant="ghost" class="h-8 px-3 text-xs w-full hover:bg-bg-400">
          <span class="truncate w-full
                       group-hover:[mask-image:linear-gradient(to_right,hsl(var(--always-black))_78%,transparent_95%)]">
            {item.name}
          </span>
        </Button>
        
        <!-- Options button (fades in on hover) -->
        <Button class="absolute right-0 top-1/2 -translate-y-1/2 
                       hidden group-hover:block">
          <MoreIcon />
        </Button>
      </li>
    {/each}
  </ul>
  
  <!-- Bottom gradient fade -->
  <div class="bg-gradient-to-t from-bg-200 to-transparent 
              sticky h-4 bottom-0"></div>
</div>
```

### Footer Section

```svelte
<div class="px-2 pb-1 transition">
  <Button class="h-9 px-1.5 py-6 gap-3 w-full hover:bg-bg-400">
    <div class="flex flex-row flex-grow items-center justify-between">
      <!-- User avatar -->
      <div class="size-8 rounded-full bg-text-200 text-bg-100">
        {initials}
      </div>
      
      <!-- User info (expanded only) -->
      <div class="flex flex-col items-start w-full overflow-hidden pr-4">
        <span class="truncate w-full text-sm">{name}</span>
        <span class="truncate w-full text-xs text-text-300">{plan}</span>
      </div>
      
      <!-- Dropdown arrow -->
      <ChevronDown class="flex-shrink-0 w-3.5 h-3.5" />
    </div>
  </Button>
</div>
```

## Responsive Behavior

### Desktop (≥1024px)
- Sidebar persistent and fixed/sticky
- Width transitions smoothly between collapsed (48px) and expanded (288px)
- Border on right edge: `border-r-0.5` or `border-r`
- Shadow: `shadow-lg` on desktop (optional)

### Tablet/Mobile (<1024px)
- Sidebar becomes full-screen drawer overlay
- Activated by hamburger menu button (top-left)
- Width: 18rem (288px) when open
- Overlay background with opacity
- Slides in from left with transition
- Shadow: `shadow-lg` for depth
- Z-index: `z-sidebar` (high value)

## Accessibility

### Keyboard Navigation
- All interactive elements focusable
- Visible focus indicators (ring)
- Logical tab order
- Escape key closes mobile drawer

### ARIA Attributes
- `aria-label` on icon-only buttons
- `aria-expanded` on toggle button
- `aria-current` on active navigation item
- `role="navigation"` on sidebar
- `aria-hidden` on decorative elements

### Screen Reader Support
- Meaningful button labels
- Status announcements for state changes
- Skip to main content link
- Proper heading hierarchy

## Animation Details

### Transition Timing
```css
/* Standard transitions */
transition: all 300ms cubic-bezier(0.165, 0.85, 0.45, 1);

/* Duration variants */
duration-100  /* 100ms - very fast micro-interactions */
duration-200  /* 200ms - fast transitions */
duration-300  /* 300ms - standard (our default) */
duration-500  /* 500ms - slow, deliberate */

/* Easing function */
ease-[cubic-bezier(0.165,0.85,0.45,1)]  /* Claude's custom easing */
ease-in-out                              /* Standard alternative */
```

### Scale Effects
```css
/* Button press */
active:scale-[0.985]  /* Slight shrink on click */
active:scale-95       /* More pronounced shrink */
active:!scale-100     /* No scale when already active */

/* Hover grow */
hover:scale-105       /* Slight grow */
hover:scale-110       /* More pronounced grow */
```

### Icon Transformations
```css
/* Rotation */
hover:-rotate-3       /* Subtle counter-clockwise */
hover:rotate-6        /* Clockwise tilt */

/* Translation */
hover:translate-x-[0.5px]    /* Micro movement */
hover:-translate-y-[1.4px]   /* Upward lift */

/* Combined */
hover:-translate-y-[2.8px] hover:translate-x-px hover:rotate-6
```

## Implementation Notes

### Collapse/Expand Logic

When sidebar is collapsed (48px):
- Show only icons, hide all text labels
- Maintain icon button sizes (h-8 w-8)
- Hide user info, show only avatar
- Hide recent items section
- Tooltips on hover (optional enhancement)

When sidebar is expanded (288px):
- Show icons + text labels
- Full user info display
- Show recent items with scrolling
- Full section headers

### Mobile Considerations

- Hamburger menu button: fixed position, z-40
- Drawer: full height, 288px width
- Overlay: semi-transparent background
- Close on: backdrop click, escape key, navigation
- Prevent scroll on body when open

### Performance

- Use CSS transforms for animations (GPU-accelerated)
- Avoid layout thrashing
- Debounce resize events
- Virtual scrolling for long lists (if needed)
- Lazy load icons/images

## Design Tokens Reference

Map to our existing design system:

```css
/* Background tokens */
--bg-200: zinc-900 (#18181b)
--bg-300: zinc-850 (between 900 and 800)
--bg-400: zinc-800 (#27272a)

/* Text tokens */
--text-100: zinc-100 (#f4f4f5)
--text-200: zinc-300 (#d4d4d8)
--text-300: zinc-400 (#a1a1aa)

/* Border tokens */
--border-300: zinc-700 (#3f3f46)

/* Accent tokens */
--accent-main-000: USAF Blue (#355e93) or brand primary
--accent-main-100: lighter variant
--accent-brand: same as main-000

/* Special */
--always-white: #ffffff
--always-black: #000000 (used in masks/gradients)
```

## Migration Path

1. **Phase 1**: Update dimensions and spacing
   - Change expanded width to 18rem
   - Adjust item heights (h-9 for nav, h-8 for recents)
   - Update padding/margin values

2. **Phase 2**: Enhance button styles
   - Add hover scale effects
   - Implement icon animations
   - Add gradient text masks

3. **Phase 3**: Improve visual hierarchy
   - Add section headers with sticky positioning
   - Implement gradient fades
   - Update typography weights

4. **Phase 4**: Polish interactions
   - Smooth transitions
   - Hover state improvements
   - Focus indicators

5. **Phase 5**: Mobile refinements
   - Adjust drawer behavior
   - Optimize touch targets
   - Test gestures

## Future Enhancements

1. **Contextual Actions**: Show relevant actions based on current view
2. **Quick Search**: Add search/filter for documents
3. **Drag & Drop**: Reorder documents in list
4. **Keyboard Shortcuts**: Display shortcut hints
5. **Customization**: User-configurable sidebar width
6. **Pinned Items**: Pin frequently used documents
7. **Groups/Folders**: Organize documents into categories

## References

- Source inspiration: `prose/claude-theme/claude-sidebar.html`
- Current implementation: `src/lib/components/Sidebar.svelte`
- Design system: `prose/designs/frontend/DESIGN_SYSTEM.md`
- Component library: shadcn-svelte
- Icon library: lucide-svelte
