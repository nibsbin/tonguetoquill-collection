# Validation Extraction Implementation Plan

**Design Document**: `prose/designs/validation-extraction.md`

## Overview

Extract duplicate validation logic from three document storage implementations into a single shared validator module.

## Current State Analysis

### Duplication Identified

**File: `src/lib/server/services/documents/document-mock-service.ts`**

- Lines 27-30: Constants (MAX_CONTENT_SIZE, MAX_NAME_LENGTH, MIN_NAME_LENGTH)
- Lines 43-44: `getByteLength()` method
- Lines 50-72: `validateName()` method (23 lines)
- Lines 77-87: `validateContent()` method (11 lines)

**File: `src/lib/server/services/documents/document-supabase-service.ts`**

- Lines 30-32: Constants (identical to mock)
- Lines 89-91: `calculateContentSize()` method (identical logic to mock's `getByteLength`)
- Lines 47-69: `validateName()` method (23 lines, identical to mock)
- Lines 74-84: `validateContent()` method (11 lines, identical to mock)

**File: `src/lib/services/documents/document-browser-storage.ts`**

- Line 9: MAX_STORAGE_SIZE constant (different: 5MB for localStorage quota)
- Lines 51, 115: Partial validation (`.trim() || 'Untitled Document'`)
- Line 53, 101: Size calculation using `new Blob([content]).size`
- Missing: max length validation, whitespace validation

## Implementation Steps

### Step 1: Create DocumentValidator Module

**Action**: Create `src/lib/services/documents/document-validator.ts`

**Content**:

- Export validation constants
- Export `validateName()` static method
- Export `validateContent()` static method
- Export `getByteLength()` static method
- Import and use `DocumentError` from types

**Dependencies**:

- Imports `DocumentError` from `./types`
- Uses Node.js `Buffer` API (available in server and browser via polyfill)

### Step 2: Update MockDocumentService

**Action**: Refactor `src/lib/server/services/documents/document-mock-service.ts`

**Changes**:

- Import `DocumentValidator` at top
- Remove constants (lines 27-30)
- Remove `getByteLength()` method (lines 42-45)
- Remove `validateName()` method (lines 50-72)
- Remove `validateContent()` method (lines 77-87)
- Replace calls:
  - `this.validateName(params.name)` → `DocumentValidator.validateName(params.name)`
  - `this.validateContent(params.content)` → `DocumentValidator.validateContent(params.content)`
  - `this.getByteLength(content)` → `DocumentValidator.getByteLength(content)`

**Lines to delete**: ~40 lines
**Lines to add**: ~1 import + updated method calls

### Step 3: Update SupabaseDocumentService

**Action**: Refactor `src/lib/server/services/documents/document-supabase-service.ts`

**Changes**:

- Import `DocumentValidator` at top
- Remove constants (lines 30-32, keep PGRST_NO_ROWS_ERROR)
- Remove `calculateContentSize()` method (lines 89-91)
- Remove `validateName()` method (lines 47-69)
- Remove `validateContent()` method (lines 74-84)
- Replace calls:
  - `this.validateName(name)` → `DocumentValidator.validateName(name)`
  - `this.validateContent(content)` → `DocumentValidator.validateContent(content)`
  - `this.calculateContentSize(content)` → `DocumentValidator.getByteLength(content)`

**Lines to delete**: ~48 lines
**Lines to add**: ~1 import + updated method calls

### Step 4: Update DocumentBrowserStorage

**Action**: Refactor `src/lib/services/documents/document-browser-storage.ts`

**Changes**:

- Import `DocumentValidator` at top
- Keep MAX_STORAGE_SIZE constant (it's localStorage-specific, not document validation)
- Add validation to `createDocument()`:
  - After line 47, before creating newDoc: `DocumentValidator.validateName(name)`
  - After line 47: `DocumentValidator.validateContent(content)`
- Add validation to `updateDocumentContent()`:
  - After line 94: `DocumentValidator.validateContent(content)`
- Add validation to `updateDocumentName()`:
  - After line 110: `DocumentValidator.validateName(name)`
- Update size calculation:
  - Replace `new Blob([content]).size` with `DocumentValidator.getByteLength(content)`
  - Locations: lines 53, 101

**Lines to delete**: 0 (browser storage didn't have validation)
**Lines to add**: ~1 import + 5 validation calls + 2 method replacements

**Note**: Keep the `.trim() || 'Untitled Document'` logic as default value assignment - this is separate from validation.

### Step 5: Run Tests

**Action**: Execute test suite to verify behavior

**Commands**:

```bash
npm test
```

**Expected**: All tests pass with no changes to test files needed

**If tests fail**:

- Check that validation errors are thrown correctly
- Verify error messages match original implementation
- Ensure `DocumentError` instances are constructed identically

### Step 6: Verify Build

**Action**: Build project to check for TypeScript errors

**Commands**:

```bash
npm run build
```

**Expected**: Clean build with no type errors

### Step 7: Manual Verification

**Action**: Spot-check validation behavior

**Test cases**:

1. Create document with empty name → should throw `invalid_name`
2. Create document with 256-char name → should throw `invalid_name`
3. Create document with leading/trailing whitespace → should throw `invalid_name`
4. Create document with >0.5MB content → should throw `content_too_large`
5. Valid document creation → should succeed

**Verification method**: Run dev server and test through UI or API

## Rollback Plan

If issues arise:

1. Revert commits: `git reset --hard HEAD~1`
2. Each step is isolated and can be rolled back individually
3. No database schema changes, so data is safe

## Risk Assessment

**Low Risk**:

- Pure refactoring, no logic changes
- No API signature changes
- No database modifications
- Existing tests provide safety net

**Potential Issues**:

- Import path errors (easily fixed)
- Method call signature mismatches (caught by TypeScript)
- Missing validation calls (caught by tests)

## Success Verification

After completion, verify:

- [ ] `DocumentValidator` module exists and exports all methods
- [ ] `MockDocumentService` has no validation methods
- [ ] `SupabaseDocumentService` has no validation methods
- [ ] `DocumentBrowserStorage` uses validator for all operations
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No duplicate validation code remains
- [ ] Grep for `validateName` shows only DocumentValidator and call sites
- [ ] Grep for `validateContent` shows only DocumentValidator and call sites

## Estimated Impact

**Code Reduction**:

- MockDocumentService: -36 lines
- SupabaseDocumentService: -44 lines
- DocumentBrowserStorage: +8 lines (adds validation)
- DocumentValidator: +50 lines (new module)
- **Net**: -22 lines, but more importantly: 1 source of truth vs 3

**Maintenance Impact**:

- Changes to validation: 1 file instead of 3
- Testing validation: Independent unit tests possible
- Consistency: Guaranteed identical behavior
