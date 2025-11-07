# Empty State Editor Implementation Plan

## Overview

This plan outlines the implementation steps for refining the empty document state experience. Instead of replacing the entire DocumentEditor layout when no document is selected, we will:

1. Always render the DocumentEditor component (editor and preview panels)
2. Show an empty state message centered in the markdown editor area
3. Dim/overlay the editor to signal it's non-interactive when no document is loaded

## Context

**Current Implementation** (`src/routes/+page.svelte` lines 170-205):

- Conditional rendering: Shows centered empty state OR DocumentEditor
- When `!documentStore.activeDocumentId`: Displays "No Document Selected" message
- When document active: Renders full DocumentEditor component

**Desired Implementation**:

- Always render DocumentEditor component
- Pass document state as props
- Handle empty state internally within DocumentEditor
- Maintain visual continuity across states

## Related Documents

- Design: [EMPTY_STATE_EDITOR.md](../designs/frontend/EMPTY_STATE_EDITOR.md)
- Design System: [DESIGN_SYSTEM.md](../designs/frontend/DESIGN_SYSTEM.md)
- State Management: [STATE_MANAGEMENT.md](../designs/frontend/STATE_MANAGEMENT.md)
- Optimistic Loading: [OPTIMISTIC_PAGE_LOADING.md](../designs/frontend/OPTIMISTIC_PAGE_LOADING.md)

## Implementation Tasks

### Task 1: Update Page Layout to Always Render DocumentEditor

**File:** `src/routes/+page.svelte`

**Current Code (lines 169-206)**:

```svelte
<!-- Editor and Preview Area -->
<div class="flex flex-1 overflow-hidden" role="main" aria-label="Document editor">
	{#if !documentStore.activeDocumentId}
		<div class="flex h-full flex-1 items-center justify-center">
			<div class="text-center">
				<h2 class="text-xl font-semibold text-foreground/80">No Document Selected</h2>
				<p class="mt-2 text-sm text-muted-foreground">
					Select a document from the sidebar or <button
						type="button"
						class="text-primary underline hover:text-primary/80 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
						onclick={handleCreateNewDocument}
					>
						create a new one
					</button>
				</p>
			</div>
		</div>
	{:else}
		<DocumentEditor
			documentId={documentStore.activeDocumentId}
			{autoSave}
			onContentChange={handleContentChange}
			onDocumentLoad={handleDocumentLoad}
			{showDocumentInfo}
			onDocumentInfoChange={(open) => (showDocumentInfo = open)}
			{showImportDialog}
			onImportDialogChange={(open) => (showImportDialog = open)}
			{showShareModal}
			onShareModalChange={(open) => (showShareModal = open)}
			{showAboutModal}
			onAboutModalChange={(open) => (showAboutModal = open)}
			{showTermsModal}
			onTermsModalChange={(open) => (showTermsModal = open)}
			{showPrivacyModal}
			onPrivacyModalChange={(open) => (showPrivacyModal = open)}
			onPreviewStatusChange={handlePreviewStatusChange}
		/>
	{/if}
</div>
```

**New Code**:

```svelte
<!-- Editor and Preview Area -->
<div class="flex flex-1 overflow-hidden" role="main" aria-label="Document editor">
	<DocumentEditor
		documentId={documentStore.activeDocumentId ?? null}
		hasActiveDocument={!!documentStore.activeDocumentId}
		{autoSave}
		onContentChange={handleContentChange}
		onDocumentLoad={handleDocumentLoad}
		{showDocumentInfo}
		onDocumentInfoChange={(open) => (showDocumentInfo = open)}
		{showImportDialog}
		onImportDialogChange={(open) => (showImportDialog = open)}
		{showShareModal}
		onShareModalChange={(open) => (showShareModal = open)}
		{showAboutModal}
		onAboutModalChange={(open) => (showAboutModal = open)}
		{showTermsModal}
		onTermsModalChange={(open) => (showTermsModal = open)}
		{showPrivacyModal}
		onPrivacyModalChange={(open) => (showPrivacyModal = open)}
		onPreviewStatusChange={handlePreviewStatusChange}
		onCreateNewDocument={handleCreateNewDocument}
	/>
</div>
```

**Changes**:

1. Remove `{#if !documentStore.activeDocumentId}...{:else}...{/if}` conditional
2. Always render `<DocumentEditor>`
3. Pass `documentId` as nullable (can be `null` when no document)
4. Add `hasActiveDocument` boolean prop
5. Add `onCreateNewDocument` callback prop for empty state action

**Notes**:

- `documentId` prop can now be `null` - DocumentEditor must handle this
- Remove the standalone empty state message (moves into DocumentEditor)
- No changes to handlers or other logic

### Task 2: Update DocumentEditor Props Interface

**File:** `src/lib/components/Editor/DocumentEditor.svelte`

**Current Props Interface (lines 15-33)**:

```typescript
interface Props {
	documentId: string;
	autoSave: AutoSave;
	onContentChange?: (content: string) => void;
	onDocumentLoad?: (doc: { name: string; content: string }) => void;
	showDocumentInfo?: boolean;
	onDocumentInfoChange?: (open: boolean) => void;
	showImportDialog?: boolean;
	onImportDialogChange?: (open: boolean) => void;
	showShareModal?: boolean;
	onShareModalChange?: (open: boolean) => void;
	showAboutModal?: boolean;
	onAboutModalChange?: (open: boolean) => void;
	showTermsModal?: boolean;
	onTermsModalChange?: (open: boolean) => void;
	showPrivacyModal?: boolean;
	onPrivacyModalChange?: (open: boolean) => void;
	onPreviewStatusChange?: (hasSuccessfulPreview: boolean) => void;
}
```

**Updated Props Interface**:

```typescript
interface Props {
	documentId: string | null; // Changed: now nullable
	hasActiveDocument: boolean; // New: explicit active state
	autoSave: AutoSave;
	onContentChange?: (content: string) => void;
	onDocumentLoad?: (doc: { name: string; content: string }) => void;
	showDocumentInfo?: boolean;
	onDocumentInfoChange?: (open: boolean) => void;
	showImportDialog?: boolean;
	onImportDialogChange?: (open: boolean) => void;
	showShareModal?: boolean;
	onShareModalChange?: (open: boolean) => void;
	showAboutModal?: boolean;
	onAboutModalChange?: (open: boolean) => void;
	showTermsModal?: boolean;
	onTermsModalChange?: (open: boolean) => void;
	showPrivacyModal?: boolean;
	onPrivacyModalChange?: (open: boolean) => void;
	onPreviewStatusChange?: (hasSuccessfulPreview: boolean) => void;
	onCreateNewDocument?: () => void; // New: callback for empty state action
}
```

**Update Props Destructuring (lines 35-53)**:

```typescript
let {
	documentId,
	hasActiveDocument, // New
	autoSave,
	onContentChange,
	onDocumentLoad,
	showDocumentInfo = false,
	onDocumentInfoChange,
	showImportDialog = false,
	onImportDialogChange,
	showShareModal = false,
	onShareModalChange,
	showAboutModal = false,
	onAboutModalChange,
	showTermsModal = false,
	onTermsModalChange,
	showPrivacyModal = false,
	onPrivacyModalChange,
	onPreviewStatusChange,
	onCreateNewDocument // New
}: Props = $props();
```

### Task 3: Update Document Loading Logic

**File:** `src/lib/components/Editor/DocumentEditor.svelte`

**Current Logic** (lines 79-96):

- `$effect` watches for `documentId` changes
- Calls `loadDocument()` when document changes

**Required Changes**:

1. Skip loading when `documentId` is `null`
2. Clear content when no document active
3. Maintain loading state properly

**Update $effect Block (around line 79-96)**:

```typescript
// Watch for document changes and handle unsaved changes
$effect(() => {
	// Skip if no document is active
	if (!hasActiveDocument || documentId === null) {
		// Clear content for empty state
		if (previousDocumentId !== null) {
			content = '';
			initialContent = '';
			debouncedContent = '';
			autoSave.reset();
		}
		previousDocumentId = null;
		loading = false;
		return;
	}

	if (previousDocumentId !== null && previousDocumentId !== documentId && isDirty) {
		// Document is switching with unsaved changes
		// Auto-save the current document before switching
		if (autoSaveEnabled) {
			autoSave.saveNow(previousDocumentId, content).catch(() => {
				// Ignore errors during auto-save on switch
			});
		}
	}

	// Update previous document ID
	if (documentId !== previousDocumentId) {
		previousDocumentId = documentId;
		loadDocument();
	}
});
```

**Update loadDocument Function (around line 175-208)**:

Add guard at the beginning:

```typescript
async function loadDocument() {
	// Guard: Don't load if no document active
	if (!hasActiveDocument || documentId === null) {
		loading = false;
		return;
	}

	loading = true;
	try {
		// ... existing loading logic
	} catch {
		toastStore.error('Failed to load document');
	} finally {
		loading = false;
	}
}
```

### Task 4: Add Empty State UI in Editor Area

**File:** `src/lib/components/Editor/DocumentEditor.svelte`

**Location**: Inside the editor section (around line 292-306)

**Current Structure**:

```svelte
<!-- Editor Section -->
<div
	class="flex flex-1 flex-col border-r border-border {isMobile && mobileView !== 'editor'
		? 'hidden'
		: ''}"
>
	<EditorToolbar onFormat={handleFormat} {isDirty} onManualSave={handleManualSave} />
	<MarkdownEditor
		bind:this={editorRef}
		value={content}
		onChange={updateDebouncedContent}
		onSave={handleManualSave}
		{showLineNumbers}
	/>
</div>
```

**Updated Structure**:

```svelte
<!-- Editor Section -->
<div
	class="relative flex flex-1 flex-col border-r border-border {isMobile && mobileView !== 'editor'
		? 'hidden'
		: ''}"
>
	<!-- Toolbar and Editor (dimmed when no document) -->
	<div
		class="flex h-full flex-1 flex-col {!hasActiveDocument ? 'pointer-events-none opacity-50' : ''}"
	>
		<EditorToolbar onFormat={handleFormat} {isDirty} onManualSave={handleManualSave} />
		<MarkdownEditor
			bind:this={editorRef}
			value={content}
			onChange={updateDebouncedContent}
			onSave={handleManualSave}
			{showLineNumbers}
		/>
	</div>

	<!-- Empty State Overlay (shown when no document) -->
	{#if !hasActiveDocument}
		<div
			class="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[1px]"
		>
			<div class="px-4 text-center">
				<h2 class="text-xl font-semibold text-foreground/80">No Document Selected</h2>
				<p class="mt-2 text-sm text-muted-foreground">
					Select a document from the sidebar or {#if onCreateNewDocument}<button
							type="button"
							class="text-primary underline hover:text-primary/80 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
							onclick={onCreateNewDocument}
						>
							create a new one
						</button>{:else}create a new one{/if}
				</p>
			</div>
		</div>
	{/if}
</div>
```

**Styling Details**:

- `relative` on container for absolute positioning of overlay
- `pointer-events-none opacity-50` dims the editor/toolbar
- `absolute inset-0` makes overlay cover full editor area
- `bg-background/30` creates semi-transparent overlay
- `backdrop-blur-[1px]` adds subtle blur effect
- Empty state content centered with flexbox
- Maintains same message and button from original +page.svelte
- Conditional rendering of button only if callback provided

### Task 5: Update Preview Panel for Empty State

**File:** `src/lib/components/Editor/DocumentEditor.svelte`

**Current Preview Section** (around line 308-356):

```svelte
<!-- Preview Section (Desktop: always visible, Mobile: toggled) -->
<div
	class="relative flex-1 overflow-auto {isMobile ? (mobileView === 'preview' ? '' : 'hidden') : ''}"
>
	<Preview markdown={debouncedContent} onPreviewStatusChange={handlePreviewStatusChange} />

	<!-- Modal dialogs... -->
</div>
```

**Changes**:

- No structural changes needed
- Preview component already handles empty content gracefully
- When `debouncedContent` is empty string, Preview shows blank panel

**Optional Enhancement** (if desired):
Add subtle message in preview when no document:

```svelte
<!-- Preview Section -->
<div
	class="relative flex-1 overflow-auto {isMobile ? (mobileView === 'preview' ? '' : 'hidden') : ''}"
>
	{#if hasActiveDocument}
		<Preview markdown={debouncedContent} onPreviewStatusChange={handlePreviewStatusChange} />
	{:else}
		<div class="flex h-full items-center justify-center">
			<p class="text-sm text-muted-foreground">Preview will appear here</p>
		</div>
	{/if}

	<!-- Modal dialogs... -->
</div>
```

**Decision**: Start with no changes (let Preview handle empty content), add enhancement only if user feedback indicates confusion.

### Task 6: Add Accessibility Attributes

**File:** `src/lib/components/Editor/DocumentEditor.svelte`

**Update Root Container** (around line 261):

Current:

```svelte
<div class="relative flex h-full flex-1 flex-col" aria-busy={loading}>
```

Updated:

```svelte
<div
  class="relative flex h-full flex-1 flex-col"
  aria-busy={loading}
  aria-disabled={!hasActiveDocument}
>
```

**Add Role to Empty State** (in Task 4's empty state div):

```svelte
{#if !hasActiveDocument}
	<div
		class="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[1px]"
		role="status"
		aria-live="polite"
	>
		<div class="px-4 text-center">
			<h2 class="text-xl font-semibold text-foreground/80">No Document Selected</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Select a document from the sidebar or {#if onCreateNewDocument}<button
						type="button"
						class="text-primary underline hover:text-primary/80 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
						onclick={onCreateNewDocument}
						aria-label="Create a new document"
					>
						create a new one
					</button>{:else}create a new one{/if}
			</p>
		</div>
	</div>
{/if}
```

**Attributes Added**:

- `aria-disabled` on root container when no document
- `role="status"` on empty state overlay
- `aria-live="polite"` for screen reader announcements
- `aria-label` on create document button

### Task 7: Add Smooth Transitions

**File:** `src/lib/components/Editor/DocumentEditor.svelte`

**Update Dimming Container** (from Task 4):

Add transition classes:

```svelte
<div class="flex h-full flex-1 flex-col transition-opacity duration-300 ease-in-out {!hasActiveDocument ? 'pointer-events-none opacity-50' : ''}">
```

**Update Empty State Overlay**:

Add fade transition:

```svelte
{#if !hasActiveDocument}
  <div
    class="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[1px] transition-opacity duration-300 ease-in-out"
    role="status"
    aria-live="polite"
  >
```

**Transition Details**:

- `transition-opacity` - Smooth fade for opacity changes
- `duration-300` - 300ms duration (standard from DESIGN_SYSTEM.md)
- `ease-in-out` - Smooth easing function
- Applies to both dimming and overlay appearance

### Task 8: Handle Mobile View

**File:** `src/lib/components/Editor/DocumentEditor.svelte`

**Current Mobile Tabs** (around line 268-287):

```svelte
{#if isMobile}
	<div class="flex border-b border-border bg-surface-elevated">
		<button
			class="flex-1 px-4 py-2 text-sm font-medium transition-colors {mobileView === 'editor'
				? 'bg-accent text-foreground'
				: 'text-muted-foreground hover:text-foreground/80'}"
			onclick={() => (mobileView = 'editor')}
		>
			Editor
		</button>
		<button
			class="flex-1 px-4 py-2 text-sm font-medium transition-colors {mobileView === 'preview'
				? 'bg-accent text-foreground'
				: 'text-muted-foreground hover:text-foreground/80'}"
			onclick={() => (mobileView = 'preview')}
		>
			Preview
		</button>
	</div>
{/if}
```

**Changes**:

- No changes needed for mobile tabs
- Empty state works identically on mobile
- Tab switching remains functional
- Empty state message shown in editor tab when selected

**Verification**:

- Test on mobile viewport (<768px)
- Verify empty state appears in "Editor" tab
- Verify "Preview" tab shows empty preview
- Verify tab switching works with empty state

## Testing Strategy

### Manual Testing Checklist

**Empty State Display**:

- [ ] Open app with no documents
- [ ] Verify DocumentEditor renders (editor + preview panels visible)
- [ ] Verify empty state message appears in editor area
- [ ] Verify message is centered and readable
- [ ] Verify editor is dimmed (reduced opacity)
- [ ] Verify editor is not interactive (clicks don't focus)

**Empty State Actions**:

- [ ] Click "create a new one" link in empty state
- [ ] Verify new document dialog opens
- [ ] Create document and verify editor becomes active
- [ ] Verify dimming is removed and editor is interactive

**Document Selection**:

- [ ] From empty state, select document from sidebar
- [ ] Verify smooth transition (fade out empty state)
- [ ] Verify editor loads with content
- [ ] Verify toolbar becomes enabled
- [ ] Verify preview renders

**Document Deselection**:

- [ ] With document open, somehow trigger no document state (if possible)
- [ ] Verify smooth transition back to empty state
- [ ] Verify content clears
- [ ] Verify editor dims

**Accessibility**:

- [ ] Tab through empty state with keyboard
- [ ] Verify focus moves to "create a new one" button
- [ ] Verify button has visible focus indicator
- [ ] Test with screen reader (should announce "No Document Selected")
- [ ] Verify ARIA attributes present in DOM

**Theme Compatibility**:

- [ ] Test in dark mode (default)
- [ ] Verify empty state text is readable
- [ ] Verify dimming effect is visible
- [ ] Verify overlay has appropriate opacity
- [ ] If light mode exists, test there too

**Mobile**:

- [ ] Test on mobile viewport (<768px)
- [ ] Verify empty state appears in "Editor" tab
- [ ] Verify tab switching works
- [ ] Verify touch interactions with "create new" button

**Edge Cases**:

- [ ] Start app, create document, then delete all documents (if possible)
- [ ] Verify empty state reappears correctly
- [ ] Test rapid document selection/deselection
- [ ] Verify no UI glitches during transitions

### Browser Testing

Test in:

- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)

### Responsive Testing

Test at breakpoints:

- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1024px width
- Large desktop: 1440px width

## Implementation Order

### Phase 1: Core Functionality (Priority: High)

1. Update DocumentEditor props interface (Task 2)
2. Update page layout to always render DocumentEditor (Task 1)
3. Update document loading logic (Task 3)
4. Add empty state UI (Task 4)

**Test After Phase 1**: Basic empty state should work

### Phase 2: Polish (Priority: Medium)

5. Add accessibility attributes (Task 6)
6. Add smooth transitions (Task 7)
7. Handle mobile view (Task 8)

**Test After Phase 2**: Full functionality with accessibility

### Phase 3: Optional Enhancements (Priority: Low)

8. Update preview panel for empty state (Task 5 optional enhancement)

**Test After Phase 3**: Complete feature

## Success Criteria

### Must Have

- ✅ DocumentEditor always renders (no conditional at page level)
- ✅ Empty state message appears when no document selected
- ✅ Editor is dimmed/overlaid when no document
- ✅ Editor is non-interactive when no document
- ✅ Smooth transitions between states
- ✅ "Create new document" button works from empty state
- ✅ Works on desktop and mobile viewports
- ✅ Maintains visual continuity (no jarring layout shifts)

### Should Have

- Accessibility attributes (ARIA)
- Screen reader support
- Keyboard navigation
- Theme compatibility (dark mode)

### Nice to Have

- Preview panel empty state message
- Additional visual polish
- Animation refinements

## Risk Assessment

**Low Risk**:

- Visual changes only (no data model changes)
- No API changes
- No breaking changes to existing functionality
- Easy to revert if issues arise

**Medium Risk**:

- Null handling for `documentId` prop
- State management edge cases
- Loading state interactions

**Mitigation**:

- Thorough testing of null handling
- Test edge cases (rapid switching, loading failures)
- Monitor for console errors
- User acceptance testing

## Deployment Notes

- No backend changes required
- No database migrations needed
- No environment variable changes
- Frontend-only changes
- No breaking changes to existing features
- Can be deployed independently

## Post-Implementation

### Documentation Updates

- Update component documentation for DocumentEditor
- Add screenshots to EMPTY_STATE_EDITOR.md design doc
- Update any relevant user documentation

### Monitoring

- Monitor for user feedback on empty state experience
- Track error rates (shouldn't change)
- Watch for console errors related to null handling

### Future Enhancements

- Rich empty state with illustrations
- Quick actions in empty state (templates, recent documents)
- Onboarding flow for first-time users
- Customizable empty state message

## Estimated Impact

**User Experience**:

- Improved visual continuity (no jarring layout changes)
- Better spatial awareness (interface structure always visible)
- Clearer affordances (dimmed editor signals disabled state)
- More professional appearance

**Technical**:

- Cleaner component hierarchy (less conditional rendering at top level)
- Better separation of concerns (empty state logic in DocumentEditor)
- Easier to maintain and extend
- No performance impact

**Code Quality**:

- Reduced complexity in +page.svelte
- More cohesive DocumentEditor component
- Better prop interface design
