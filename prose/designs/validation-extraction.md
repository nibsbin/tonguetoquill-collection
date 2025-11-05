# Document Validation Extraction Design

## Problem Statement

Document validation logic is currently duplicated across three storage implementations:
- `MockDocumentService` (297 lines)
- `SupabaseDocumentService` (352 lines)
- `DocumentBrowserStorage` (166 lines)

This duplication creates:
- ~80 lines of identical validation code
- Risk of validation rules diverging between implementations
- Multiple locations to update when business rules change
- Inconsistent validation (browser storage uses different patterns)

## Core Principle

**"Validation is domain logic, not infrastructure logic"**

The rules for what constitutes a valid document name or content are business requirements, not implementation details. These rules should be centralized regardless of where documents are stored.

## Desired State

### Single Source of Truth
A centralized `DocumentValidator` module that:
- Defines all document validation constraints as constants
- Provides validation methods that all storage implementations use
- Throws consistent `DocumentError` instances
- Calculates content size using a single standardized method

### Unified Interface
All three storage implementations (Mock, Supabase, Browser) will:
- Import and use `DocumentValidator` methods
- Remove their duplicate validation code
- Enforce identical business rules
- Use consistent error messages

### Validation Rules (Existing Business Requirements)
- **Name constraints:**
  - Minimum length: 1 character
  - Maximum length: 255 characters
  - No leading or trailing whitespace
  - Cannot be empty after trimming

- **Content constraints:**
  - Maximum size: 524,288 bytes (0.5 MB)
  - Size calculated as UTF-8 byte length

## Architecture

```
┌─────────────────────────────────────┐
│     DocumentValidator (NEW)         │
│  ────────────────────────────────   │
│  + validateName(name: string)       │
│  + validateContent(content: string) │
│  + getByteLength(str: string)       │
│  + Constants (MAX_*, MIN_*)         │
└────────────┬────────────────────────┘
             │ imports & uses
             │
    ┌────────┴────────┬───────────────┐
    │                 │               │
┌───▼──────┐  ┌──────▼────┐  ┌──────▼────────┐
│   Mock   │  │  Supabase │  │    Browser    │
│ Document │  │  Document │  │    Storage    │
│ Service  │  │  Service  │  │               │
└──────────┘  └───────────┘  └───────────────┘
```

## Benefits

1. **Consistency**: One definition of valid documents across all storage mechanisms
2. **Maintainability**: Changes to validation rules require updates in one place
3. **Testability**: Validation logic can be tested independently
4. **Clarity**: Explicit separation between domain rules and storage implementation
5. **Code Reduction**: Eliminates ~80 lines of duplicate code

## Non-Goals

- Changing validation rules or constraints
- Adding new validation requirements
- Modifying the `DocumentServiceContract` interface
- Altering external APIs or client behavior
- Performance optimization

## Success Criteria

- ✅ Single `DocumentValidator` module created
- ✅ All three storage implementations use the validator
- ✅ Zero duplicate validation code remains
- ✅ All existing tests pass
- ✅ Identical validation behavior across all implementations
- ✅ No changes to public APIs or external behavior
