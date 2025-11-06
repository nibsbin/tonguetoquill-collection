# New Document Dialog Enhancements Plan

This plan outlines enhancements to the existing New Document Dialog as described in [../designs/frontend/NEW_DOCUMENT_DIALOG.md](../designs/frontend/NEW_DOCUMENT_DIALOG.md).

## Overview

Enhance the existing New Document Dialog with the following improvements:

1. **Remove "Blank Document" option** - Template selection becomes required
2. **Default to "USAF Memo"** - Show USAF Memo as the default template
3. **Reorder fields** - Move Template input above Document Name input
4. **Auto-populate Document Name** - Reactively populate name based on selected template
5. **Collision detection** - Append "(n)" to resolve name collisions with existing documents

**Key Goals:**

- Improve UX by reducing steps (auto-naming)
- Ensure template-first workflow (no blank option)
- Prevent naming conflicts automatically
- Maintain existing validation and error handling

## Prerequisites

### Existing Components (Already Implemented)

- ✅ NewDocumentDialog component (`src/lib/components/NewDocumentDialog/`)
- ✅ Template Service (`src/lib/services/templates/`)
- ✅ Document Store (`src/lib/stores/documents.svelte.ts`)
- ✅ Sidebar integration

### Components to Modify

- 🔄 NewDocumentDialog component (implement enhancements)
- 🔄 Sidebar component (pass existing document names)

## Implementation Plan

### Phase 1: Update NewDocumentDialog Component

**Goal**: Implement template-first workflow with auto-naming

#### Step 1.1: Remove Blank Document Option

- [ ] Remove "Blank Document" option from template dropdown
- [ ] Change `selectedTemplate` from `string | null` to `string`
- [ ] Set default template to first production template (USAF Memo)
- [ ] Update validation to ensure template is always selected

**File**: `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte`

**Changes**:
- Line 24: Change type to `let selectedTemplate = $state<string>('')`
- Remove "Blank Document" option from select element (line ~142)
- Initialize with first template when dialog opens

#### Step 1.2: Reorder Form Fields

- [ ] Move Template field above Document Name field in the form
- [ ] Update autofocus to focus Template dropdown (or keep on Document Name)
- [ ] Update tab order comments/documentation

**File**: `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte`

**Changes**:
- Swap order of template and document name fields in markup (lines ~117-154)

#### Step 1.3: Implement Auto-Naming with Collision Detection

- [ ] Add `hasUserEditedName` state to track manual edits
- [ ] Add `existingDocumentNames` prop for collision detection
- [ ] Create helper function to generate unique name from template
- [ ] Add effect to auto-populate name when template changes
- [ ] Prevent auto-population if user has edited name

**File**: `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte`

**New state**:
```typescript
let hasUserEditedName = $state(false);
```

**New props**:
```typescript
let { 
  open, 
  onOpenChange, 
  onCreate,
  existingDocumentNames = [] 
}: NewDocumentDialogProps & { existingDocumentNames?: string[] } = $props();
```

**New functions**:
```typescript
/**
 * Generate unique document name from template
 * Format: "{Template Name}" or "{Template Name} (n)"
 */
function generateUniqueNameFromTemplate(templateName: string): string {
  let baseName = templateName;
  let counter = 1;
  let candidateName = baseName;
  
  // Check for collision and append (n) if needed
  while (existingDocumentNames.includes(candidateName)) {
    candidateName = `${baseName} (${counter})`;
    counter++;
  }
  
  return candidateName;
}
```

**New effect**:
```typescript
// Auto-populate document name when template changes (if user hasn't edited)
$effect(() => {
  if (!hasUserEditedName && selectedTemplate && templatesReady) {
    const template = templates.find(t => t.file === selectedTemplate);
    if (template) {
      documentName = generateUniqueNameFromTemplate(template.name);
    }
  }
});
```

**Track user edits**:
```typescript
// Add oninput handler to document name input
<Input
  id="doc-name"
  type="text"
  bind:value={documentName}
  oninput={() => { hasUserEditedName = true; }}
  placeholder="Enter document name"
  disabled={isCreating}
  class="mt-2 w-full"
/>
```

#### Step 1.4: Initialize with Default Template

- [ ] Set selectedTemplate to first production template when dialog opens
- [ ] Trigger auto-naming when dialog opens with default template

**New effect**:
```typescript
// Initialize with first production template when dialog opens
$effect(() => {
  if (open && templatesReady && templates.length > 0 && !selectedTemplate) {
    // Find USAF Memo or use first template
    const usafMemo = templates.find(t => t.file === 'usaf_template.md');
    selectedTemplate = usafMemo ? usafMemo.file : templates[0].file;
  }
});
```

#### Step 1.5: Reset State on Dialog Close

- [ ] Reset `hasUserEditedName` flag when dialog closes
- [ ] Reset `selectedTemplate` when form resets

**Update resetForm()**:
```typescript
function resetForm() {
  documentName = '';
  selectedTemplate = ''; // Will be re-initialized when dialog opens
  isCreating = false;
  nameError = null;
  creationError = null;
  hasUserEditedName = false;
}
```

### Phase 2: Update Sidebar Integration

**Goal**: Pass existing document names for collision detection

#### Step 2.1: Update Sidebar to Pass Document Names

- [ ] Import document store in Sidebar
- [ ] Extract document names from store
- [ ] Pass to NewDocumentDialog component

**File**: `src/lib/components/Sidebar/Sidebar.svelte`

**Changes**:
```typescript
// Get existing document names for collision detection
const existingNames = $derived(documentStore.documents.map(d => d.name));
```

```svelte
<NewDocumentDialog
  open={newDocDialogOpen}
  onOpenChange={(open) => (newDocDialogOpen = open)}
  onCreate={handleCreateDocument}
  existingDocumentNames={existingNames}
/>
```

#### Step 2.2: Update onCreate Handler

- [ ] Update to expect templateFilename as required parameter
- [ ] Remove optional handling for blank document

**File**: `src/lib/components/Sidebar/Sidebar.svelte`

**Changes**:
```typescript
const handleCreateDocument = async (name: string, templateFilename: string) => {
  let content = '';

  // Load template content
  try {
    const template = await templateService.getTemplate(templateFilename);
    content = template.content;
  } catch (error) {
    console.error('Failed to load template:', error);
    // Show error to user or fallback
    throw error;
  }

  await documentStore.createDocument(name, content);
};
```

### Phase 3: Update Documentation

**Goal**: Document the enhancements

#### Step 3.1: Update Component README

- [ ] Update `src/lib/components/NewDocumentDialog/README.md`
- [ ] Document auto-naming behavior
- [ ] Document collision detection
- [ ] Update usage examples

**File**: `src/lib/components/NewDocumentDialog/README.md`

**Changes**:
- Update "Features" section with auto-naming
- Update "Props" section with existingDocumentNames
- Update "Behavior" section with auto-population logic
- Update usage example

### Phase 4: Testing

**Goal**: Verify all enhancements work correctly

#### Test Case 4.1: Default Template Selection

- [ ] Open dialog
- [ ] Verify "USAF Memo" is selected by default
- [ ] Verify document name is auto-populated as "USAF Memo"
- [ ] Verify no "Blank Document" option exists

#### Test Case 4.2: Template Change Auto-Naming

- [ ] Open dialog
- [ ] Change template to "USSF Memo"
- [ ] Verify document name changes to "USSF Memo"
- [ ] Change back to "USAF Memo"
- [ ] Verify document name changes back to "USAF Memo"

#### Test Case 4.3: Manual Edit Prevents Auto-Naming

- [ ] Open dialog
- [ ] Verify default name is "USAF Memo"
- [ ] Manually edit name to "My Custom Name"
- [ ] Change template to "USSF Memo"
- [ ] Verify name stays as "My Custom Name" (no auto-population)

#### Test Case 4.4: Collision Detection

- [ ] Create a document named "USAF Memo"
- [ ] Open dialog again
- [ ] Verify default name is "USAF Memo (1)"
- [ ] Create another with that name
- [ ] Open dialog again
- [ ] Verify default name is "USAF Memo (2)"

#### Test Case 4.5: Field Order

- [ ] Open dialog
- [ ] Verify Template field appears first
- [ ] Verify Document Name field appears second
- [ ] Verify tab order is correct

#### Test Case 4.6: Form Reset

- [ ] Open dialog
- [ ] Change template and edit name
- [ ] Cancel dialog
- [ ] Open dialog again
- [ ] Verify state is reset (default template, auto-populated name, no manual edit flag)

### Phase 5: Build and Verify

**Goal**: Ensure code quality and no regressions

#### Step 5.1: Type Checking

- [ ] Run `npm run check`
- [ ] Fix any TypeScript errors

#### Step 5.2: Build

- [ ] Run `npm run build`
- [ ] Verify no build errors

## Success Criteria

- [ ] "Blank Document" option removed from template dropdown
- [ ] "USAF Memo" selected by default when dialog opens
- [ ] Template field appears above Document Name field
- [ ] Document Name auto-populates from template name
- [ ] Manual edits to name prevent further auto-population
- [ ] Collision detection appends "(n)" for duplicate names
- [ ] Dialog state resets properly when closed
- [ ] All existing functionality continues to work
- [ ] Type checking passes
- [ ] Production build succeeds

## Implementation Notes

### Auto-Naming Logic

1. When dialog opens or template changes
2. Check if user has manually edited the name
3. If no manual edit, generate name from template
4. Check for collisions with existing documents
5. Append "(n)" if collision exists, incrementing until unique

### State Management

- `hasUserEditedName`: Tracks whether user has modified the document name
- Reset this flag when dialog closes/resets
- Once set to true, auto-naming stops until dialog is closed

### Collision Detection

- Parent component (Sidebar) passes list of existing document names
- Dialog checks this list when generating auto-populated name
- Uses simple counter approach: "Name", "Name (1)", "Name (2)", etc.

### Template Default

- First check for "usaf_template.md" specifically
- Fall back to first production template if USAF Memo not found
- This ensures consistent default even if template order changes

## Files Modified

1. `src/lib/components/NewDocumentDialog/NewDocumentDialog.svelte`
   - Remove blank option
   - Reorder fields
   - Add auto-naming logic
   - Add collision detection

2. `src/lib/components/Sidebar/Sidebar.svelte`
   - Pass existing document names
   - Update onCreate handler signature

3. `src/lib/components/NewDocumentDialog/README.md`
   - Document new behavior

4. `prose/designs/frontend/NEW_DOCUMENT_DIALOG.md`
   - Update design to reflect changes

## Related Documents

- [Design Document](../designs/frontend/NEW_DOCUMENT_DIALOG.md)
- [Original Implementation Plan](./new-document-dialog-implementation.md)
