# DocumentEditor Responsive Layout Fix - Implementation Plan

## Objective

Fix the responsive layout gap in DocumentEditor where the Preview panel disappears between 768px-1023px without showing mobile tab switcher.

## Current State Analysis

### File: `src/lib/components/Editor/DocumentEditor.svelte`

**Mobile Detection (lines 193-198):**
```typescript
const checkMobile = () => {
    isMobile = window.innerWidth < 768;
};
```
- Switches to desktop mode at ≥768px ✓

**Preview Panel Visibility (lines 273-301):**
```svelte
<div
    class="relative flex-1 overflow-auto {isMobile
        ? mobileView === 'preview'
            ? ''
            : 'hidden'
        : 'hidden lg:block'}"
>
```
- **Problem**: Desktop mode uses `'hidden lg:block'` ✗
- This hides Preview until 1024px (`lg:` breakpoint)
- Creates gap from 768px-1023px where Preview is hidden but mobile tabs don't show

## Implementation Steps

### Step 1: Fix Preview Panel Visibility
**File**: `src/lib/components/Editor/DocumentEditor.svelte`
**Location**: Line 276 (Preview div classes)

**Change From:**
```svelte
class="relative flex-1 overflow-auto {isMobile
    ? mobileView === 'preview'
        ? ''
        : 'hidden'
    : 'hidden lg:block'}"
```

**Change To:**
```svelte
class="relative flex-1 overflow-auto {isMobile
    ? mobileView === 'preview'
        ? ''
        : 'hidden'
    : ''}"
```

**Rationale:**
- Remove `'hidden lg:block'` in desktop mode
- Replace with empty string `''` so Preview is always visible when not in mobile mode
- Mobile mode visibility logic remains unchanged
- Aligns visibility with the 768px mobile detection breakpoint

### Step 2: Verify Editor Panel Visibility
**File**: `src/lib/components/Editor/DocumentEditor.svelte`
**Location**: Line 260 (Editor div classes)

**Current Implementation:**
```svelte
class="flex flex-1 flex-col border-r border-border {isMobile && mobileView !== 'editor'
    ? 'hidden'
    : ''}"
```

**Status**: ✓ Already correct
- Shows Editor in desktop mode (all widths ≥768px)
- Hides Editor in mobile mode when Preview tab is active
- No changes needed

### Step 3: Verify Tab Switcher
**File**: `src/lib/components/Editor/DocumentEditor.svelte`
**Location**: Lines 233-253

**Current Implementation:**
```svelte
{#if isMobile}
    <div class="flex border-b border-border bg-surface-elevated">
        <!-- Tab buttons -->
    </div>
{/if}
```

**Status**: ✓ Already correct
- Only shows when `isMobile` is true (< 768px)
- No changes needed

## Testing Plan

### Manual Testing at Key Breakpoints

1. **< 768px (Mobile)**:
   - [ ] Tab switcher visible
   - [ ] Editor tab shows editor, hides preview
   - [ ] Preview tab shows preview, hides editor
   - [ ] Toggle between tabs works smoothly

2. **768px (Breakpoint)**:
   - [ ] Tab switcher disappears
   - [ ] Both panels become visible
   - [ ] Split-screen layout activates

3. **768px - 1023px (Previously Broken)**:
   - [ ] Both panels visible side-by-side
   - [ ] No tab switcher
   - [ ] Editor on left, Preview on right
   - [ ] Both panels flex to fill space

4. **≥ 1024px (Large Desktop)**:
   - [ ] Both panels visible side-by-side
   - [ ] No tab switcher
   - [ ] Layout remains consistent with 768px+ behavior

### Responsive Resize Testing

1. Start at 600px width
2. Slowly resize to 1200px
3. Verify smooth transition at 768px
4. Ensure no flickering or layout jumps
5. Verify no intermediate broken states

## Risk Assessment

**Risk Level**: Low

**Risks:**
- Minimal - Single line change to CSS classes
- No logic changes to mobile detection or state management
- No changes to component structure or lifecycle

**Mitigation:**
- Change only affects desktop mode visibility
- Mobile mode logic completely unchanged
- Easy to revert if issues arise

## Success Criteria

1. Preview panel visible at all widths ≥768px
2. Mobile tab switcher only shows at widths <768px
3. No broken intermediate states at any viewport width
4. Smooth transition from mobile to desktop mode at 768px breakpoint
5. All existing functionality preserved (editing, preview, saving, etc.)

## Rollback Plan

If issues occur:
```svelte
<!-- Revert to: -->
class="... {isMobile ? ... : 'hidden lg:block'}"
```

## References

- Design: [EDITOR_RESPONSIVE_LAYOUT.md](../designs/frontend/EDITOR_RESPONSIVE_LAYOUT.md)
- Component: `src/lib/components/Editor/DocumentEditor.svelte`
- Tailwind Config: `tailwind.config.js`
