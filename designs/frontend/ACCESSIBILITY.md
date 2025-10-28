# Accessibility & Section 508 Compliance

## Overview

TongueToQuill is designed to meet U.S. Section 508 standards and WCAG 2.1 Level AA compliance, ensuring accessibility for users with disabilities across all devices and assistive technologies.

## Section 508 Requirements

### § 1194.21 Software Applications

**Keyboard Access**:
- All functionality accessible via keyboard
- No keyboard traps
- Logical tab order
- Visible focus indicators

**Visual Information**:
- Text alternatives for images and icons
- Information not conveyed by color alone
- Sufficient color contrast (4.5:1 minimum)

**Timed Responses**:
- Auto-save provides adequate time
- User can disable/extend timeouts
- Warning before session expiration

### § 1194.22 Web-Based Information

**Text Equivalents**:
- Alt text for all images
- ARIA labels for icon-only buttons
- Accessible names for form controls

**Multimedia**:
- Captions for video (if implemented)
- Transcripts for audio (if implemented)

**Color Independence**:
- Status indicated by text + icons + color
- Links distinguishable without color
- Form validation not color-only

**Page Organization**:
- Proper heading hierarchy (H1-H6)
- Semantic HTML elements
- Landmark regions (nav, main, aside)

**Client-Side Image Maps**:
- Not applicable (no image maps used)

## WCAG 2.1 Level AA Compliance

### Perceivable

#### Text Alternatives (1.1.1)
```svelte
<!-- Images -->
<img src="/logo.svg" alt="TongueToQuill logo" />

<!-- Icon buttons -->
<button aria-label="Save document">
  <Save />
</button>

<!-- Decorative images -->
<img src="/decoration.svg" alt="" role="presentation" />
```

#### Time-Based Media (1.2)
- No audio-only or video-only content currently
- If added: provide alternatives (captions, transcripts)

#### Adaptable (1.3)

**Info and Relationships (1.3.1)**:
```svelte
<!-- Proper heading hierarchy -->
<h1>Document Editor</h1>
<h2>Document List</h2>
<h3>Recent Documents</h3>

<!-- Form labels -->
<label for="doc-title">Document Title</label>
<input id="doc-title" type="text" />

<!-- Semantic structure -->
<nav aria-label="Main navigation">...</nav>
<main id="main-content">...</main>
<aside aria-label="Settings">...</aside>
```

**Meaningful Sequence (1.3.2)**:
- Content order makes sense when linearized
- CSS doesn't reorder content illogically
- Reading order follows visual order

**Sensory Characteristics (1.3.3)**:
- Instructions don't rely solely on shape/color/position
- "Click the Save button" not "Click the blue button"

**Orientation (1.3.4)**:
- Content works in portrait and landscape
- No orientation lock (except where essential)

**Identify Input Purpose (1.3.5)**:
```html
<input 
  type="email" 
  autocomplete="email"
  name="email"
/>
```

#### Distinguishable (1.4)

**Use of Color (1.4.1)**:
```svelte
<!-- Bad: Color only -->
<span class="text-red-500">Error</span>

<!-- Good: Color + icon + text -->
<div class="text-red-500 flex items-center gap-2">
  <AlertCircle aria-hidden="true" />
  <span>Error: Invalid format</span>
</div>
```

**Contrast (1.4.3)**:
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

```css
/* Dark theme */
--bg-primary: oklch(0.145 0 0);      /* zinc-900 */
--text-primary: oklch(0.985 0 0);    /* zinc-100 */
/* Contrast ratio: 15.8:1 ✓ */

/* Light theme */
--bg-primary: oklch(1.0 0 0);        /* white */
--text-primary: oklch(0.20 0 0);     /* near-black */
/* Contrast ratio: 16.5:1 ✓ */
```

**Resize Text (1.4.4)**:
- Support 200% zoom without loss of functionality
- Use relative units (rem, em)
- Test at different zoom levels

**Images of Text (1.4.5)**:
- Prefer real text over images
- Use SVG for logos (scalable)
- Only use text images for brand/logo

**Reflow (1.4.10)**:
- Content reflows at 320px width
- No horizontal scrolling (except code blocks)
- Mobile-responsive layouts

**Non-Text Contrast (1.4.11)**:
- UI components have 3:1 contrast
- Focus indicators visible
- Interactive boundaries clear

**Text Spacing (1.4.12)**:
Support user style overrides:
```css
* {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
  paragraph-spacing: 2em !important;
}
```

**Content on Hover/Focus (1.4.13)**:
- Tooltips dismissible (Esc key)
- Tooltips hoverable (can move cursor to them)
- Tooltips persistent until dismissed

### Operable

#### Keyboard Accessible (2.1)

**Keyboard (2.1.1)**:
```svelte
<!-- All interactive elements keyboard accessible -->
<button onclick={handleClick}>Save</button>
<a href="/documents">Documents</a>

<!-- Custom interactions need keyboard handlers -->
<div 
  role="button" 
  tabindex="0"
  onclick={handleClick}
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Custom Button
</div>
```

**No Keyboard Trap (2.1.2)**:
- Modal dialogs trap focus but can be dismissed (Esc)
- Tab cycles through modal content
- Focus returns to trigger on close

```svelte
<script>
  let dialogOpen = $state(false)
  let triggerButton: HTMLButtonElement
  
  function openDialog() {
    triggerButton = document.activeElement
    dialogOpen = true
  }
  
  function closeDialog() {
    dialogOpen = false
    triggerButton?.focus()
  }
</script>
```

**Keyboard (No Exception) (2.1.3)**:
- All functionality available via keyboard
- No keyboard-only deadends

**Character Key Shortcuts (2.1.4)**:
- Single-key shortcuts can be turned off
- Or only active when component focused
- Or remappable

```svelte
<script>
  let editorFocused = $state(false)
  
  function handleKeydown(e: KeyboardEvent) {
    if (!editorFocused) return
    
    // Only handle shortcuts when editor focused
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      saveDocument()
    }
  }
</script>
```

#### Enough Time (2.2)

**Timing Adjustable (2.2.1)**:
```svelte
<script>
  let sessionTimeout = $state(30 * 60 * 1000) // 30 minutes
  let warningTime = $state(5 * 60 * 1000)      // 5 minutes before
  
  function extendSession() {
    // Reset timeout
    clearTimeout(timeoutId)
    startSessionTimer()
  }
</script>

<!-- Warning dialog -->
{#if showWarning}
  <Dialog>
    <p>Session will expire in 5 minutes</p>
    <button onclick={extendSession}>Extend Session</button>
  </Dialog>
{/if}
```

**Pause, Stop, Hide (2.2.2)**:
- Auto-updating content can be paused
- Animations respect prefers-reduced-motion

#### Seizures (2.3)

**Three Flashes or Below (2.3.1)**:
- No flashing content
- If added: max 3 flashes per second
- Or below general flash threshold

#### Navigable (2.4)

**Bypass Blocks (2.4.1)**:
```svelte
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<nav aria-label="Main navigation">
  <!-- Sidebar navigation -->
</nav>

<main id="main-content" tabindex="-1">
  <!-- Main content -->
</main>
```

**Page Titled (2.4.2)**:
```svelte
<svelte:head>
  <title>{fileName} - TongueToQuill</title>
</svelte:head>
```

**Focus Order (2.4.3)**:
- Logical tab order
- Follows visual order
- No unexpected focus jumps

**Link Purpose (2.4.4)**:
```svelte
<!-- Bad -->
<a href="/docs/123">Click here</a>

<!-- Good -->
<a href="/docs/123">View memo-2024-01.md</a>

<!-- Good with context -->
<article>
  <h3>Annual Report</h3>
  <p>Annual report for 2024</p>
  <a href="/reports/2024">Read more about Annual Report</a>
</article>
```

**Multiple Ways (2.4.5)**:
- Navigation menu (sidebar)
- Search functionality
- Recent documents list

**Headings and Labels (2.4.6)**:
```svelte
<!-- Descriptive headings -->
<h2>Recent Documents</h2>
<h2>Document Editor</h2>

<!-- Clear labels -->
<label for="subject">Memo Subject</label>
<input id="subject" type="text" />
```

**Focus Visible (2.4.7)**:
```css
:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

/* Never remove focus entirely */
:focus:not(:focus-visible) {
  outline: none;
}
```

#### Input Modalities (2.5)

**Pointer Gestures (2.5.1)**:
- All multipoint gestures have single-pointer alternative
- Swipe to open sidebar: also available via button

**Pointer Cancellation (2.5.2)**:
- Click completes on mouseup, not mousedown
- Can cancel by moving away before release

**Label in Name (2.5.3)**:
```svelte
<!-- Visible label matches accessible name -->
<button aria-label="Save document">
  <Save />
  <span>Save</span>
</button>
```

**Motion Actuation (2.5.4)**:
- Device motion (shake, tilt) has alternative
- Not currently used

**Target Size (2.5.5)**:
```css
/* Minimum 44x44px on mobile */
.button-mobile {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* Spacing between targets */
.button-group {
  gap: 8px; /* Minimum */
}
```

### Understandable

#### Readable (3.1)

**Language of Page (3.1.1)**:
```html
<html lang="en">
```

**Language of Parts (3.1.2)**:
```svelte
<!-- Different language content -->
<blockquote lang="es">
  Hola mundo
</blockquote>
```

#### Predictable (3.2)

**On Focus (3.2.1)**:
- Focus doesn't trigger context change
- No automatic navigation on focus

**On Input (3.2.2)**:
- Input doesn't automatically submit
- Changes require explicit action

```svelte
<!-- Bad: Auto-submit on change -->
<select onchange={submitForm}>...</select>

<!-- Good: Explicit submit -->
<select bind:value={selection}>...</select>
<button onclick={submitForm}>Apply</button>
```

**Consistent Navigation (3.2.3)**:
- Navigation in same order across pages
- Sidebar always in same location

**Consistent Identification (3.2.4)**:
- Same icons mean same thing throughout
- Save icon always means save

#### Input Assistance (3.3)

**Error Identification (3.3.1)**:
```svelte
<script>
  let errors = $state<string[]>([])
</script>

{#if errors.length > 0}
  <div role="alert" aria-live="assertive">
    <h3>Form contains errors:</h3>
    <ul>
      {#each errors as error}
        <li>{error}</li>
      {/each}
    </ul>
  </div>
{/if}

<label for="title">
  Document Title
  {#if titleError}
    <span class="error" id="title-error">{titleError}</span>
  {/if}
</label>
<input 
  id="title"
  aria-invalid={!!titleError}
  aria-describedby={titleError ? "title-error" : undefined}
/>
```

**Labels or Instructions (3.3.2)**:
```svelte
<label for="date">
  Memo Date
  <span class="hint">Format: YYYY-MM-DD</span>
</label>
<input 
  id="date"
  type="date"
  aria-describedby="date-hint"
/>
<span id="date-hint" class="sr-only">
  Enter date in year-month-day format
</span>
```

**Error Suggestion (3.3.3)**:
```svelte
{#if error === 'invalid-email'}
  <p role="alert">
    Please enter a valid email address (e.g., user@example.com)
  </p>
{/if}
```

**Error Prevention (3.3.4)**:
- Confirm before delete
- Review before submit
- Undo capability for destructive actions

### Robust

#### Compatible (4.1)

**Parsing (4.1.1)**:
- Valid HTML
- Properly nested elements
- No duplicate IDs

**Name, Role, Value (4.1.2)**:
```svelte
<!-- Native elements have implicit roles -->
<button>Save</button>

<!-- Custom elements need explicit ARIA -->
<div 
  role="button"
  tabindex="0"
  aria-pressed={isActive}
  onclick={toggle}
>
  Toggle
</div>
```

**Status Messages (4.1.3)**:
```svelte
<!-- Success message -->
<div role="status" aria-live="polite">
  Document saved successfully
</div>

<!-- Error message -->
<div role="alert" aria-live="assertive">
  Failed to save document
</div>

<!-- Loading state -->
<div 
  role="status" 
  aria-live="polite"
  aria-busy="true"
>
  Loading documents...
</div>
```

## Assistive Technology Support

### Screen Readers

**Tested with**:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS, iOS)
- TalkBack (Android)

**Patterns**:
```svelte
<!-- Visually hidden but screen reader accessible -->
<span class="sr-only">
  New notifications available
</span>

<!-- Hide decorative elements -->
<Icon aria-hidden="true" />

<!-- Dynamic content announcements -->
<div aria-live="polite" aria-atomic="true">
  {#if saving}
    Saving document...
  {:else if saved}
    Document saved
  {/if}
</div>
```

### Keyboard Navigation

**Tab Order**:
1. Skip to main content link
2. Sidebar toggle
3. Navigation items
4. Main content
5. Toolbar
6. Editor
7. Preview controls

**Keyboard Shortcuts**:
```svelte
<script>
  function handleGlobalKeydown(e: KeyboardEvent) {
    // Ctrl/Cmd + S: Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      saveDocument()
    }
    
    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      focusSearch()
    }
    
    // Esc: Close modal/drawer
    if (e.key === 'Escape') {
      closeModal()
    }
  }
</script>

<svelte:window onkeydown={handleGlobalKeydown} />
```

## Testing Procedures

### Manual Testing

**Keyboard Navigation**:
- [ ] Tab through all interactive elements
- [ ] Verify focus visible at all times
- [ ] No keyboard traps
- [ ] Logical tab order

**Screen Reader**:
- [ ] All content announced correctly
- [ ] Headings navigate properly
- [ ] Forms labeled correctly
- [ ] Errors announced
- [ ] Status updates announced

**Color/Contrast**:
- [ ] Information not conveyed by color alone
- [ ] Sufficient contrast ratios
- [ ] Test with grayscale
- [ ] Test with color blindness simulators

**Zoom/Text Resize**:
- [ ] Content readable at 200% zoom
- [ ] No horizontal scrolling at 400% zoom
- [ ] Text spacing adjustable

### Automated Testing

```typescript
// Vitest + axe-core
import { axe } from 'vitest-axe'

test('has no accessibility violations', async () => {
  const { container } = render(Component)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Compliance Checklist

- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA
- [ ] Forms have proper labels
- [ ] Keyboard accessible
- [ ] Focus indicators visible
- [ ] Headings properly structured
- [ ] ARIA used correctly
- [ ] Text resizable to 200%
- [ ] Content reflows on mobile
- [ ] No keyboard traps
- [ ] Skip navigation present
- [ ] Page titles descriptive
- [ ] Error messages helpful
- [ ] Status messages announced
- [ ] Touch targets adequate (44px min)
