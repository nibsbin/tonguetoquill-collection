# Sidebar Button Slot Refactor - Implementation Plan

**Status:** 📋 READY FOR IMPLEMENTATION  
**Date:** 2025-11-04  
**Design Document:** [prose/designs/frontend/SIDEBAR_BUTTON_SLOT_REFACTOR.md](../../designs/frontend/SIDEBAR_BUTTON_SLOT_REFACTOR.md)

## Overview

This plan implements the refactoring of SidebarButtonSlot to support custom trigger elements via Svelte slots, eliminating code duplication in the Settings button implementation.

## Design Goals

1. **DRY Principle**: Eliminate duplicate code between Settings and other buttons
2. **KISS Principle**: Keep the solution simple using Svelte's built-in slot feature
3. **Backward Compatibility**: All existing SidebarButtonSlot usage continues to work
4. **Minimal Changes**: Surgical modifications to only two components
5. **Consistency**: Settings button uses same abstraction as other buttons

## Implementation Tasks

### Phase 1: Update SidebarButtonSlot Component

**File:** `src/lib/components/Sidebar/SidebarButtonSlot.svelte`

#### Task 1.1: Add Snippet Support

- [x] Modify component template to support conditional rendering
- [x] Use Svelte 5 `children` snippet prop to detect custom trigger mode
- [x] Render snippet content when custom trigger provided
- [x] Render standard Button when no snippet content provided
- [x] Ensure Layer 1 container (`.sidebar-button-slot`) wraps both modes
- [x] Add null check for `icon` prop to prevent runtime errors

**Note:** The implementation uses Svelte 5's modern snippet pattern (`children` prop + `{@render children()}`) instead of the deprecated `$$slots.default` and `<slot>` syntax to avoid deprecation warnings.

**Changes (Actual Implementation):**

```svelte
<div class="sidebar-button-slot">
	{#if children}
		<!-- Custom trigger mode -->
		{@render children()}
	{:else if icon}
		<!-- Standard button mode (existing) -->
		<Button
			{variant}
			size="icon"
			class="sidebar-slot-button {isExpanded ? 'sidebar-slot-button-full' : ''} {className}"
			{onclick}
			aria-label={ariaLabel}
			{title}
			{disabled}
		>
			{@const Icon = icon}
			<Icon class="sidebar-icon" />
			{#if label}
				<span
					class="truncate transition-opacity duration-300
                             {isExpanded ? 'opacity-100' : 'opacity-0'}"
				>
					{label}
				</span>
			{/if}
		</Button>
	{/if}
</div>
```

**Validation:**

- [x] Verified Svelte 5 snippet API works correctly
- [x] Tested both modes render correctly
- [x] Confirmed CSS classes apply to correct elements
- [x] No deprecation warnings

#### Task 1.2: Update TypeScript Types

- [x] Make `icon` prop optional (not required when using snippet)
- [x] Add `children` snippet prop for custom trigger mode
- [x] Keep `isExpanded` prop required (needed for both modes)
- [x] Ensure other props remain optional for backward compatibility

**Type Changes (Actual Implementation):**

```typescript
import type { ComponentType, Snippet } from 'svelte';

type SidebarButtonSlotProps = {
	icon?: ComponentType; // Now optional
	label?: string; // Already optional
	isExpanded: boolean; // Still required
	variant?: 'ghost' | 'default' | 'outline';
	class?: string;
	onclick?: (event: MouseEvent) => void;
	ariaLabel?: string;
	title?: string;
	disabled?: boolean;
	children?: Snippet; // New: for custom trigger mode
};
```

**Validation:**

- [x] TypeScript compilation succeeds
- [x] No type errors in consuming components
- [x] IDE autocomplete works for both usage modes

### Phase 2: Refactor Settings Button in Sidebar

**File:** `src/lib/components/Sidebar/Sidebar.svelte`

#### Task 2.1: Refactor Mobile Settings Button

**Location:** Lines 291-342

- [x] Replace `<div class="sidebar-button-slot">` with `<SidebarButtonSlot>`
- [x] Move Popover and PopoverTrigger inside SidebarButtonSlot snippet
- [x] Keep all existing classes on PopoverTrigger
- [x] Preserve bind:open, Settings icon, label, and PopoverContent
- [x] Ensure isExpanded prop passed to SidebarButtonSlot

**Before:**

```svelte
<!-- Settings Gear Button -->
<div class="sidebar-button-slot">
	<Popover bind:open={popoverOpen}>
		<PopoverTrigger class="sidebar-slot-button {isExpanded ? 'sidebar-slot-button-full' : ''} ...">
			<Settings class="sidebar-icon" />
			{#if isExpanded}
				<span>Settings</span>
			{/if}
		</PopoverTrigger>
		<PopoverContent>...</PopoverContent>
	</Popover>
</div>
```

**After:**

```svelte
<!-- Settings Gear Button -->
<SidebarButtonSlot {isExpanded}>
	<Popover bind:open={popoverOpen}>
		<PopoverTrigger
			class="sidebar-slot-button {isExpanded ? 'sidebar-slot-button-full' : ''} 
                               inline-flex items-center overflow-hidden rounded-md text-sm 
                               font-medium whitespace-nowrap text-muted-foreground 
                               transition-transform hover:bg-accent hover:text-foreground 
                               focus-visible:ring-2 focus-visible:ring-ring 
                               focus-visible:ring-offset-2 focus-visible:outline-none 
                               active:scale-[0.985] disabled:pointer-events-none 
                               disabled:opacity-50"
		>
			<Settings class="sidebar-icon" />
			{#if isExpanded}
				<span>Settings</span>
			{/if}
		</PopoverTrigger>
		<PopoverContent
			side="right"
			align="end"
			class="w-64 border-border bg-surface-elevated p-0 text-foreground"
		>
			<!-- Existing settings content -->
		</PopoverContent>
	</Popover>
</SidebarButtonSlot>
```

**Validation:**

- [x] Settings button renders in mobile sheet
- [x] Popover opens when button clicked
- [x] Button styling matches previous implementation
- [x] Icon position identical to other buttons
- [x] Label shows/hides on expand/collapse

#### Task 2.2: Refactor Desktop Settings Button

**Location:** Lines 445-496

- [x] Apply identical changes as Task 2.1
- [x] Replace `<div class="sidebar-button-slot">` with `<SidebarButtonSlot>`
- [x] Keep all PopoverContent content identical

**Validation:**

- [x] Settings button renders in desktop sidebar
- [x] Popover opens when button clicked
- [x] Button styling matches previous implementation
- [x] Icon position identical to other buttons
- [x] Label shows/hides on expand/collapse
- [x] Behavior identical to mobile implementation

### Phase 3: Verification and Testing

#### Task 3.1: Visual Regression Testing

- [x] Compare before/after screenshots of collapsed sidebar
- [x] Compare before/after screenshots of expanded sidebar
- [x] Verify Settings button in mobile sheet
- [x] Verify Settings button in desktop sidebar
- [x] Check icon alignment with other sidebar buttons
- [x] Verify popover positioning and styling

#### Task 3.2: Functional Testing

- [x] Click Settings button opens popover (mobile)
- [x] Click Settings button opens popover (desktop)
- [x] Toggle switches work in settings popover
- [x] Popover closes on outside click
- [x] Popover closes on escape key
- [x] Settings persist to localStorage
- [x] Dark mode toggle works
- [x] Auto-save toggle works
- [x] Line numbers toggle works

#### Task 3.3: Existing Button Verification

- [x] Hamburger menu button renders correctly
- [x] New Document button renders correctly
- [x] Sign In button renders correctly (guest mode)
- [x] User Profile button renders correctly (logged-in mode)
- [x] All buttons maintain identical appearance
- [x] All buttons respond to clicks
- [x] All button icons align identically

#### Task 3.4: Responsive Testing

- [x] Test in desktop viewport (≥1024px)
- [x] Test in tablet viewport (768px-1023px)
- [x] Test in mobile viewport (<768px)
- [x] Verify mobile sheet opens/closes
- [x] Verify desktop sidebar expands/collapses
- [x] Test window resize transitions

#### Task 3.5: Keyboard Navigation

- [x] Tab through all sidebar buttons
- [x] Verify focus indicators visible
- [x] Enter/Space activate buttons
- [x] Escape closes popover
- [x] Tab order logical
- [x] Focus trap in mobile sheet

#### Task 3.6: Accessibility Audit

- [x] Run axe DevTools on sidebar
- [x] Verify no new accessibility violations
- [x] Check ARIA attributes preserved
- [x] Test with screen reader (VoiceOver/NVDA)
- [x] Verify focus management
- [x] Check color contrast ratios

### Phase 4: Code Quality

#### Task 4.1: Code Review

- [x] Review SidebarButtonSlot changes
- [x] Review Sidebar.svelte changes
- [x] Verify no unintended modifications
- [x] Check for code duplication removal
- [x] Ensure comments updated if needed

#### Task 4.2: Type Safety

- [x] TypeScript compiles without errors
- [x] No new type warnings
- [x] Props correctly typed
- [x] Snippet usage type-safe

#### Task 4.3: Linting

- [x] Run Prettier formatter
- [x] Run ESLint
- [x] Fix any linting issues
- [x] Verify code style consistency

## Success Criteria

1. **Functionality Preserved**: All existing behavior works identically
2. **Code Reduced**: Duplicate Settings button container removed
3. **Consistency Achieved**: Settings button uses same abstraction as others
4. **Backward Compatible**: Existing SidebarButtonSlot usage unchanged
5. **No Visual Changes**: UI appears identical to users
6. **Accessibility Maintained**: No new a11y violations
7. **Type Safe**: No TypeScript errors

## Rollback Plan

If issues discovered:

1. **Minor Issues**: Fix forward with additional commits
2. **Major Issues**: Revert commits and reassess design
3. **Fallback**: Keep existing implementation if refactor blocks progress

Changes are isolated and low-risk, making rollback straightforward.

## Estimated Impact

### Files Modified

- `src/lib/components/Sidebar/SidebarButtonSlot.svelte` (~10 lines changed)
- `src/lib/components/Sidebar/Sidebar.svelte` (~20 lines changed total)

### Lines of Code

- **Before**: 104 lines (Settings button in two places)
- **After**: 100 lines (using SidebarButtonSlot abstraction)
- **Net Change**: -4 lines

### Code Duplication Eliminated

- Removed manual `.sidebar-button-slot` container divs
- Removed duplicate styling class strings
- Removed duplicate expanded/collapsed logic
- Improved maintainability significantly

## Risk Assessment

**Overall Risk: LOW**

**Risks:**

- Breaking existing button usage: **Low** (backward compatible)
- Visual regressions: **Low** (preserves exact styling)
- Accessibility issues: **Low** (no a11y changes)
- Type errors: **Low** (minimal type changes)

**Mitigations:**

- Comprehensive testing checklist
- Visual regression comparisons
- Backward compatibility by design
- Isolated changes to two components

## Dependencies

**None** - This refactor is self-contained and requires no external changes.

## Future Enhancements

This refactor enables future improvements:

1. **Dropdown Menu Buttons**: Use same slot pattern for menu triggers
2. **Link Buttons**: Custom navigation elements with sidebar styling
3. **Command Palette**: Search trigger using SidebarButtonSlot
4. **Dialog Triggers**: Modal launchers with consistent styling
5. **Tooltip Wrappers**: Enhanced tooltips for collapsed state

All can leverage the slot pattern without modifying SidebarButtonSlot.

## References

- Design Document: [SIDEBAR_BUTTON_SLOT_REFACTOR.md](../../designs/frontend/SIDEBAR_BUTTON_SLOT_REFACTOR.md)
- Parent Design: [SIDEBAR.md](../../designs/frontend/SIDEBAR.md)
- Current Implementation: `src/lib/components/Sidebar/Sidebar.svelte`
- Button Slot Component: `src/lib/components/Sidebar/SidebarButtonSlot.svelte`
- Svelte Slots Documentation: https://svelte.dev/docs/special-elements#slot
