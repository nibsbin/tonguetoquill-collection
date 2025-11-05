# Sidebar Button Slot Refactor - Design Document

**Status:** 📋 DESIGN PHASE  
**Date:** 2025-11-04  
**Related:** [SIDEBAR.md](./SIDEBAR.md)

## Overview

This document describes a refactoring of the SidebarButtonSlot component to support custom trigger elements (like PopoverTrigger) as children, eliminating code duplication and inconsistency in the Sidebar component.

## Problem Statement

The Sidebar component has an inconsistency in how buttons are implemented:

**Consistent Buttons** (using SidebarButtonSlot):

- Hamburger menu button
- New Document button
- Sign In button
- User Profile button

**Inconsistent Button** (custom implementation):

- Settings button (lines 291-342 and 445-496 in Sidebar.svelte)

The Settings button uses a custom `<div class="sidebar-button-slot">` wrapper containing a Popover with PopoverTrigger, duplicating the styling classes and layout logic that SidebarButtonSlot provides. This violates DRY (Don't Repeat Yourself) principles and creates maintenance burden.

### Code Duplication

**Current Settings Button (duplicated in mobile and desktop sections):**

```svelte
<div class="sidebar-button-slot">
	<Popover bind:open={popoverOpen}>
		<PopoverTrigger
			class="sidebar-slot-button {isExpanded ? 'sidebar-slot-button-full' : ''} 
                   inline-flex items-center overflow-hidden rounded-md text-sm font-medium 
                   whitespace-nowrap text-muted-foreground transition-transform 
                   hover:bg-accent hover:text-foreground focus-visible:ring-2 
                   focus-visible:ring-ring focus-visible:ring-offset-2 
                   focus-visible:outline-none active:scale-[0.985] 
                   disabled:pointer-events-none disabled:opacity-50"
		>
			<Settings class="sidebar-icon" />
			{#if isExpanded}
				<span>Settings</span>
			{/if}
		</PopoverTrigger>
		<PopoverContent>...</PopoverContent>
	</Popover>
</div>
```

**Issues:**

1. Duplicates `.sidebar-button-slot` container logic
2. Duplicates `.sidebar-slot-button` styling classes
3. Manually handles expanded/collapsed state
4. Manually handles icon and label rendering
5. Same code repeated in two places (mobile and desktop)

## Design Goals

1. **DRY Principle**: Eliminate code duplication between Settings button and other buttons
2. **KISS Principle**: Keep the solution simple and maintainable
3. **Consistency**: All sidebar buttons should use the same abstraction
4. **Flexibility**: Support both standard buttons and custom trigger elements
5. **Minimal Changes**: Require minimal modifications to existing code
6. **Backward Compatibility**: Maintain existing SidebarButtonSlot API

## Core Design Concept

### The "Slot Pattern" Approach

Use Svelte's slot system to allow SidebarButtonSlot to accept custom child elements while maintaining the perfect container styling and layout logic.

**Key Insight:** SidebarButtonSlot already provides the perfect 3-layer architecture (see [SIDEBAR.md § Button Slot Architecture](./SIDEBAR.md#button-slot-architecture)):

1. **Layer 1**: Button Slot Container (48px × 48px, 4px padding)
2. **Layer 2**: Button Element (40px × 40px, 8px padding)
3. **Layer 3**: Icon Element (24px × 24px)

The Settings button needs the same Layer 1 container and styling, but Layer 2 needs to be a PopoverTrigger instead of a Button.

## Proposed Solution

### Option A: Default Slot for Custom Triggers (RECOMMENDED)

Enhance SidebarButtonSlot to support two modes:

**Mode 1: Standard Button** (current behavior, no changes)

```svelte
<SidebarButtonSlot icon={Plus} label="New Document" {isExpanded} onclick={handleClick} />
```

**Mode 2: Custom Trigger** (new capability)

```svelte
<SidebarButtonSlot {isExpanded}>
	<PopoverTrigger class="...">
		<Settings class="sidebar-icon" />
		{#if isExpanded}
			<span>Settings</span>
		{/if}
	</PopoverTrigger>
</SidebarButtonSlot>
```

### Implementation Strategy

**Component Signature:**

```typescript
type SidebarButtonSlotProps = {
	// Existing props (optional when using slot)
	icon?: ComponentType;
	label?: string;
	isExpanded: boolean; // Always required
	variant?: 'ghost' | 'default' | 'outline';
	class?: string;
	onclick?: (event: MouseEvent) => void;
	ariaLabel?: string;
	title?: string;
	disabled?: boolean;
};
```

**Component Structure:**

```svelte
<div class="sidebar-button-slot">
	{#if $$slots.default}
		<!-- Custom trigger mode: Render slot content -->
		<slot />
	{:else}
		<!-- Standard button mode: Render Button component -->
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

**Key Benefits:**

- Maintains backward compatibility (all existing usage continues to work)
- Provides Layer 1 container styling automatically
- Slot content gets proper `.sidebar-button-slot` wrapper
- Consumers responsible for applying `.sidebar-slot-button` classes to custom triggers
- Simple, minimal API change

### Usage in Sidebar Component

**Before (Settings Button):**

```svelte
<div class="sidebar-button-slot">
	<Popover bind:open={popoverOpen}>
		<PopoverTrigger class="sidebar-slot-button {isExpanded ? 'sidebar-slot-button-full' : ''} ...">
			<Settings class="sidebar-icon" />
			{#if isExpanded}<span>Settings</span>{/if}
		</PopoverTrigger>
		<PopoverContent>...</PopoverContent>
	</Popover>
</div>
```

**After (Settings Button):**

```svelte
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
			{#if isExpanded}<span>Settings</span>{/if}
		</PopoverTrigger>
		<PopoverContent>...</PopoverContent>
	</Popover>
</SidebarButtonSlot>
```

**Improvements:**

- Removes manual `.sidebar-button-slot` container div
- Maintains all existing styling and behavior
- Consistent with other sidebar buttons
- Reduces duplication (one less manual container)

## Alternative Options Considered

### Option B: Separate Component for Popover Buttons

Create a new `SidebarPopoverButtonSlot` component specifically for popover triggers.

**Rejected Because:**

- Creates more components to maintain
- Doesn't address the fundamental flexibility issue
- Less flexible for future custom trigger types
- Violates KISS principle

### Option C: Render Props Pattern

Use a render prop to pass button content.

**Rejected Because:**

- More complex API
- Less idiomatic in Svelte (slots are the standard pattern)
- Harder to understand for developers

### Option D: Extract Shared Styling to CSS/Utility Classes

Move all `.sidebar-slot-button` styles to shared utility class or mixin.

**Rejected Because:**

- Doesn't eliminate structural duplication (still need wrapper div)
- Doesn't solve layout/architecture duplication
- Only addresses styling, not component structure

## Design Rationale

### Why Slots?

Svelte slots are the idiomatic way to allow component composition. They provide:

- **Flexibility**: Consumers can render any content
- **Simplicity**: Familiar pattern for Svelte developers
- **Type Safety**: TypeScript supports slot checking
- **Performance**: No runtime overhead

### Why Not More Abstraction?

We deliberately avoid over-abstracting:

- Custom trigger consumers still apply `.sidebar-slot-button` classes
- Component doesn't try to automatically style all possible children
- Maintains clear separation of concerns
- Keeps component simple and predictable

### Backward Compatibility

The design maintains 100% backward compatibility:

- Existing SidebarButtonSlot usage works unchanged
- No breaking API changes
- Optional new capability via slots

## CSS Architecture

The component leverages the existing 3-layer architecture defined in [SIDEBAR.md § Button Slot Architecture](./SIDEBAR.md#button-slot-architecture):

**Layer 1: Container** (provided by SidebarButtonSlot)

- CSS class: `.sidebar-button-slot`
- Size: 48px × 48px (var(--sidebar-slot-height))
- Padding: 4px all sides (var(--sidebar-button-spacing))
- Purpose: Consistent spacing and layout

**Layer 2: Button/Trigger** (provided by Button component OR custom trigger)

- CSS class: `.sidebar-slot-button`
- Size: 40px × 40px (var(--sidebar-button-size))
- Padding: 8px all sides (var(--sidebar-padding))
- Purpose: Interactive element with consistent sizing

**Layer 3: Icon** (handled by global styles in Sidebar.svelte)

- CSS class: `.sidebar-icon`
- Size: 24px × 24px (var(--sidebar-icon-size))
- Purpose: Visual indicator

### CSS Variables

No new CSS variables needed. Reuses existing semantic tokens from [SIDEBAR.md § Semantic Tokens](./SIDEBAR.md#semantic-tokens):

```css
--sidebar-collapsed-width: 3rem; /* 48px */
--sidebar-button-size: 2.5rem; /* 40px */
--sidebar-icon-size: 1.5rem; /* 24px */
--sidebar-padding: 0.5rem; /* 8px */
--sidebar-slot-height: var(--sidebar-collapsed-width);
--sidebar-button-spacing: calc(
	(var(--sidebar-collapsed-width) - var(--sidebar-button-size)) / 2
); /* 4px */
```

## Component API

### SidebarButtonSlot Props

```typescript
type SidebarButtonSlotProps = {
	// Mode detection: If icon is provided, use standard button mode
	icon?: ComponentType;
	label?: string;

	// Always required for both modes
	isExpanded: boolean;

	// Standard button mode props (ignored when using slot)
	variant?: 'ghost' | 'default' | 'outline';
	class?: string;
	onclick?: (event: MouseEvent) => void;
	ariaLabel?: string;
	title?: string;
	disabled?: boolean;
};
```

### SidebarButtonSlot Slots

```typescript
interface SidebarButtonSlotSlots {
	default?: {}; // Custom trigger content
}
```

### Usage Modes

**Standard Button Mode:**

```svelte
<SidebarButtonSlot icon={IconComponent} label="Label Text" isExpanded={true} onclick={handler} />
```

**Custom Trigger Mode:**

```svelte
<SidebarButtonSlot isExpanded={true}>
	<CustomTrigger class="sidebar-slot-button ...">
		<!-- Custom content -->
	</CustomTrigger>
</SidebarButtonSlot>
```

## Migration Impact

### Files to Modify

1. **SidebarButtonSlot.svelte**
   - Add slot support with conditional rendering
   - No breaking changes to existing props

2. **Sidebar.svelte**
   - Refactor Settings button to use SidebarButtonSlot with slot
   - Update both mobile (lines 291-342) and desktop (lines 445-496) sections
   - No changes to other buttons

### Lines of Code Impact

**Before:**

- Settings button (mobile): 52 lines
- Settings button (desktop): 52 lines
- Total: 104 lines

**After:**

- Settings button (mobile): ~45 lines
- Settings button (desktop): ~45 lines
- SidebarButtonSlot changes: ~10 lines
- Total: 100 lines

**Net Change:** -4 lines, significantly improved maintainability

### Risk Assessment

**Low Risk:**

- Backward compatible change
- Isolated to two components
- Well-defined scope
- Existing tests should pass without modification

## Accessibility Considerations

No accessibility impact:

- ARIA labels handled by trigger components
- Focus management unchanged
- Keyboard navigation preserved
- Screen reader behavior consistent

## Testing Strategy

### Manual Testing

1. Verify all existing buttons render correctly
2. Verify Settings button renders in collapsed state
3. Verify Settings button renders in expanded state
4. Verify popover opens/closes correctly
5. Test in mobile and desktop layouts
6. Test keyboard navigation
7. Verify icon positioning matches other buttons

### Visual Regression

Compare before/after screenshots:

- Collapsed sidebar with Settings button
- Expanded sidebar with Settings button
- Popover open state
- Mobile sheet layout

## Future Extensions

This design enables future custom trigger types:

1. **Dropdown Menu Triggers**: Similar to popover pattern
2. **Dialog Triggers**: Modal launchers
3. **Link Buttons**: Navigation with custom styling
4. **Command Palette Triggers**: Search/command interfaces

All can use the same slot pattern without additional component changes.

## References

- [SIDEBAR.md](./SIDEBAR.md) - Parent design document
- [SIDEBAR.md § Button Slot Architecture](./SIDEBAR.md#button-slot-architecture) - 3-layer architecture
- [SIDEBAR.md § Semantic Tokens](./SIDEBAR.md#semantic-tokens) - CSS variable definitions
- Current implementation: `src/lib/components/Sidebar/Sidebar.svelte`
- Current button slot: `src/lib/components/Sidebar/SidebarButtonSlot.svelte`
- Svelte Slots Documentation: https://svelte.dev/docs/special-elements#slot
