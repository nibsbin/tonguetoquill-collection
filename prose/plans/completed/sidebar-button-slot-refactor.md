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

#### Task 1.1: Add Slot Support

- [ ] Modify component template to support conditional rendering
- [ ] Check for `$$slots.default` to detect custom trigger mode
- [ ] Render slot content when custom trigger provided
- [ ] Render standard Button when no slot content provided
- [ ] Ensure Layer 1 container (`.sidebar-button-slot`) wraps both modes

**Changes:**

```svelte
<div class="sidebar-button-slot">
	{#if $$slots.default}
		<!-- Custom trigger mode -->
		<slot />
	{:else}
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

- [ ] Verify `$$slots` API available in Svelte 5
- [ ] Test both modes render correctly
- [ ] Confirm CSS classes apply to correct elements

#### Task 1.2: Update TypeScript Types

- [ ] Make `icon` prop optional (not required when using slot)
- [ ] Keep `isExpanded` prop required (needed for both modes)
- [ ] Ensure other props remain optional for backward compatibility

**Type Changes:**

```typescript
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
};
```

**Validation:**

- [ ] TypeScript compilation succeeds
- [ ] No type errors in consuming components
- [ ] IDE autocomplete works for both usage modes

### Phase 2: Refactor Settings Button in Sidebar

**File:** `src/lib/components/Sidebar/Sidebar.svelte`

#### Task 2.1: Refactor Mobile Settings Button

**Location:** Lines 291-342

- [ ] Replace `<div class="sidebar-button-slot">` with `<SidebarButtonSlot>`
- [ ] Move Popover and PopoverTrigger inside SidebarButtonSlot slot
- [ ] Keep all existing classes on PopoverTrigger
- [ ] Preserve bind:open, Settings icon, label, and PopoverContent
- [ ] Ensure isExpanded prop passed to SidebarButtonSlot

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

- [ ] Settings button renders in mobile sheet
- [ ] Popover opens when button clicked
- [ ] Button styling matches previous implementation
- [ ] Icon position identical to other buttons
- [ ] Label shows/hides on expand/collapse

#### Task 2.2: Refactor Desktop Settings Button

**Location:** Lines 445-496

- [ ] Apply identical changes as Task 2.1
- [ ] Replace `<div class="sidebar-button-slot">` with `<SidebarButtonSlot>`
- [ ] Keep all PopoverContent content identical

**Validation:**

- [ ] Settings button renders in desktop sidebar
- [ ] Popover opens when button clicked
- [ ] Button styling matches previous implementation
- [ ] Icon position identical to other buttons
- [ ] Label shows/hides on expand/collapse
- [ ] Behavior identical to mobile implementation

### Phase 3: Verification and Testing

#### Task 3.1: Visual Regression Testing

- [ ] Compare before/after screenshots of collapsed sidebar
- [ ] Compare before/after screenshots of expanded sidebar
- [ ] Verify Settings button in mobile sheet
- [ ] Verify Settings button in desktop sidebar
- [ ] Check icon alignment with other sidebar buttons
- [ ] Verify popover positioning and styling

#### Task 3.2: Functional Testing

- [ ] Click Settings button opens popover (mobile)
- [ ] Click Settings button opens popover (desktop)
- [ ] Toggle switches work in settings popover
- [ ] Popover closes on outside click
- [ ] Popover closes on escape key
- [ ] Settings persist to localStorage
- [ ] Dark mode toggle works
- [ ] Auto-save toggle works
- [ ] Line numbers toggle works

#### Task 3.3: Existing Button Verification

- [ ] Hamburger menu button renders correctly
- [ ] New Document button renders correctly
- [ ] Sign In button renders correctly (guest mode)
- [ ] User Profile button renders correctly (logged-in mode)
- [ ] All buttons maintain identical appearance
- [ ] All buttons respond to clicks
- [ ] All button icons align identically

#### Task 3.4: Responsive Testing

- [ ] Test in desktop viewport (≥1024px)
- [ ] Test in tablet viewport (768px-1023px)
- [ ] Test in mobile viewport (<768px)
- [ ] Verify mobile sheet opens/closes
- [ ] Verify desktop sidebar expands/collapses
- [ ] Test window resize transitions

#### Task 3.5: Keyboard Navigation

- [ ] Tab through all sidebar buttons
- [ ] Verify focus indicators visible
- [ ] Enter/Space activate buttons
- [ ] Escape closes popover
- [ ] Tab order logical
- [ ] Focus trap in mobile sheet

#### Task 3.6: Accessibility Audit

- [ ] Run axe DevTools on sidebar
- [ ] Verify no new accessibility violations
- [ ] Check ARIA attributes preserved
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify focus management
- [ ] Check color contrast ratios

### Phase 4: Code Quality

#### Task 4.1: Code Review

- [ ] Review SidebarButtonSlot changes
- [ ] Review Sidebar.svelte changes
- [ ] Verify no unintended modifications
- [ ] Check for code duplication removal
- [ ] Ensure comments updated if needed

#### Task 4.2: Type Safety

- [ ] TypeScript compiles without errors
- [ ] No new type warnings
- [ ] Props correctly typed
- [ ] Slot usage type-safe

#### Task 4.3: Linting

- [ ] Run Prettier formatter
- [ ] Run ESLint
- [ ] Fix any linting issues
- [ ] Verify code style consistency

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
