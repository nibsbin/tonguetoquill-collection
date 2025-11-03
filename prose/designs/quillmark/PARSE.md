# Quillmark Markdown Syntax

This document details the markdown syntax and Extended YAML Metadata Standard in Quillmark.

## Overview

Quillmark is a **frontmatter-aware markdown format** that separates YAML metadata from document content.

**Key capabilities:**

- YAML frontmatter delimited by `---` markers
- Inline metadata sections with SCOPE/QUILL keys (Extended YAML Metadata Standard)
- Scoped blocks aggregated into collections (arrays of objects)
- Markdown body content preserved separately
- Cross-platform line ending support (`\n` and `\r\n`)
- Horizontal rule disambiguation

## Document Structure

### Separation of Concerns

Quillmark documents consist of:

- **Frontmatter fields**: YAML key-value pairs at the document start
- **Body content**: Raw markdown text stored under the reserved `body` field

### YAML-Only Policy

Only YAML frontmatter is supported. Backends can convert to their native formats via filters.

## Parsing Behavior

### Valid Documents

1. **Empty Frontmatter** - Empty frontmatter with body starting at first blank line
2. **No Frontmatter** - Entire content becomes body
3. **Nested YAML Structures** - Full YAML support including nested maps, arrays, and all scalar types
4. **Line Endings** - Supports both Unix (`\n`) and Windows (`\r\n`) line endings
5. **Horizontal Rules** - `---` with blank lines both above and below is treated as markdown horizontal rule, not metadata delimiter

### Error Conditions

**Strict fail-fast** for malformed YAML:

- **Invalid YAML**: Error with descriptive message
- **Unclosed frontmatter**: Error if `---` opening exists but closing marker is missing
- **No frontmatter**: Gracefully treats entire content as body (not an error)

## Extended YAML Metadata Standard

### Overview

The extended standard allows metadata blocks to appear anywhere in the document using **SCOPE** and **QUILL** special keys.

**Motivation**: Support structured sub-documents, repeated elements, and hierarchical content.

### Syntax

```markdown
---
title: Global Metadata
---

Main document body.

---

SCOPE: sub_documents
title: First Sub-Document

---

Body of first sub-document.

---

SCOPE: sub_documents
title: Second Sub-Document

---

Body of second sub-document.
```

**Resulting structure:**

```json
{
	"title": "Global Metadata",
	"body": "Main document body.",
	"sub_documents": [
		{ "title": "First Sub-Document", "body": "Body of first sub-document." },
		{ "title": "Second Sub-Document", "body": "Body of second sub-document." }
	]
}
```

### Rules

- **SCOPE key**: Creates collections - blocks with same scope name are aggregated into arrays
- **QUILL key**: Specifies which quill template to use
- **Scope names**: Must match `[a-z_][a-z0-9_]*` pattern
- **Reserved names**: Cannot use `body` as scope name
- **Single global**: Only one block without SCOPE/QUILL allowed
- **No collisions**: Global field names cannot conflict with scope names
- **Horizontal rule disambiguation**: `---` with blank lines above AND below is treated as markdown horizontal rule

### Parsing Flow

1. Scan document for all `---` delimiters
2. Parse global frontmatter (if present)
3. Parse scoped metadata blocks
4. Assemble final structure with merged global fields and scoped arrays

### Validation

The parser validates:

- Multiple global frontmatter blocks → error
- Name collisions between global fields and scoped attributes → error
- Reserved field names in scopes → error
- Invalid scope name syntax → warning
- Both SCOPE and QUILL in same block → error
