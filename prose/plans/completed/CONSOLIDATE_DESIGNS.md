# Design Documentation Consolidation Plan

**Problem**: 35 design documents (12,808 total lines) mixing patterns, component specs, and implementation details.

**Unifying Insight**: Design docs should describe patterns, not implementations.

**Solution**: Consolidate to 8 pattern documents + move component/service specs to code READMEs.

---

## Target Structure

### Pattern Documents (prose/designs/)

**Keep as-is (already good patterns)**:

1. `ARCHITECTURE.md` (259 lines) - Overall app structure
2. `OVERLAY_SYSTEM.md` (309 lines) - Unified overlay pattern (Cascade 2)
3. `ERROR_SYSTEM.md` (1,105 lines → split to ~400 lines) - Error handling pattern (Cascade 3)
4. `STATE_PATTERNS.md` (371 lines) - Store patterns (Cascade 4)
5. `AUTHENTICATION.md` (194 lines) - OAuth/JWT flow
6. `ACCESSIBILITY.md` (80 lines) - A11y standards

**Create/consolidate**:

7. `SERVICE_FRAMEWORK.md` - Consolidate CLIENT_SERVICE_FRAMEWORK.md + backend/SERVICES.md
8. `DESIGN_TOKENS.md` - Extract from DESIGN_SYSTEM.md (color/typography/spacing system)

**Total**: 8 pattern documents

---

## Migration Mapping

### Backend (8 docs → 1 pattern + 6 READMEs)

**Pattern**:

- `SERVICE_FRAMEWORK.md` ← merge CLIENT_SERVICE_FRAMEWORK.md + SERVICES.md

**Move to code READMEs**:

- `backend/DOCUMENT_SERVICE.md` (399 lines) → `src/lib/services/documents/README.md`
- `backend/LOGIN_SERVICE.md` (510 lines) → `src/lib/services/login/README.md`
- `backend/TEMPLATE_SERVICE.md` (430 lines) → `src/lib/services/templates/README.md`
- `backend/USER_SERVICE.md` (193 lines) → `src/lib/services/user/README.md`
- `backend/SUPABASE_AUTH_ADAPTER.md` (366 lines) → `src/lib/adapters/supabase/auth/README.md`
- `backend/SUPABASE_DATABASE_ADAPTER.md` (696 lines) → `src/lib/adapters/supabase/database/README.md`

**Delete**:

- `backend/SCHEMAS.md` (83 lines) - Implementation detail, belongs in DB migration files

---

### Frontend (15 docs → 3 patterns + 12 READMEs)

**Patterns** (keep/consolidate):

- `ARCHITECTURE.md` - Already good
- `DESIGN_TOKENS.md` - Extract pattern from DESIGN_SYSTEM.md
- `ACCESSIBILITY.md` - Already good

**Component Organization patterns** (consolidate into ARCHITECTURE.md):

- `STATE_MANAGEMENT.md` (421 lines) → merge into STATE_PATTERNS.md (cross-cutting pattern)
- `API_INTEGRATION.md` (295 lines) → merge into SERVICE_FRAMEWORK.md
- `COMPONENT_ORGANIZATION.md` (242 lines) → merge into ARCHITECTURE.md

**Move to code READMEs**:

- `frontend/SIDEBAR.md` (500 lines) → `src/lib/components/Sidebar/README.md`
- `frontend/NEW_DOCUMENT.md` (209 lines) → `src/lib/components/NewDocumentDialog/README.md`
- `frontend/TEMPLATE_SELECTOR.md` (927 lines → ~300) → `src/lib/components/TemplateSelector/README.md`
- `frontend/LOGIN_PROFILE_UI.md` (386 lines) → `src/lib/components/LoginProfile/README.md`
- `frontend/LOGO_SIDEBAR.md` (221 lines) → `src/lib/components/LogoSidebar/README.md`
- `frontend/MARKDOWN_EDITOR.md` (831 lines → ~300) → `src/lib/components/MarkdownEditor/README.md`
- `frontend/EMPTY_STATE_EDITOR.md` (358 lines) → `src/lib/components/EmptyStateEditor/README.md`
- `frontend/SHARE_MODAL.md` (161 lines) → `src/lib/components/ShareModal/README.md`

**Move to appropriate patterns**:

- `frontend/ERROR_DISPLAY.md` - Delete (redundant with ERROR_SYSTEM.md)
- `frontend/ZINDEX_STRATEGY.md` (328 lines) → merge into DESIGN_TOKENS.md (z-index is a design token)

---

### QuillMark (6 docs → 0 patterns + 6 READMEs)

**All are implementation-specific, move to code**:

- `quillmark/SERVICE.md` (347 lines) → `src/lib/services/quillmark/README.md`
- `quillmark/INTEGRATION.md` (199 lines) → `src/lib/quillmark/README.md`
- `quillmark/PREVIEW.md` (247 lines) → `src/lib/components/QuillmarkPreview/README.md`
- `quillmark/DIAGNOSTICS.md` (266 lines) → merge into `src/lib/services/quillmark/README.md`
- `quillmark/PARSE.md` (127 lines) → merge into `src/lib/quillmark/README.md`
- `quillmark/QUILLMARK_SYNTAX_HIGHLIGHTING.md` (516 lines) → `src/lib/components/MarkdownEditor/quillmark-syntax/README.md`

---

### Patterns (4 docs → keep all but consolidate)

- `CLIENT_SERVICE_FRAMEWORK.md` → rename to `SERVICE_FRAMEWORK.md`, consolidate with SERVICES.md
- `STATE_PATTERNS.md` → keep, merge in STATE_MANAGEMENT.md content
- `AUTHENTICATION.md` → keep as-is
- `ERROR_SYSTEM.md` → keep but split out examples to error READMEs

---

## Final Structure Summary

**prose/designs/** (8 pattern docs):

```
prose/designs/
├── INDEX.md
├── ARCHITECTURE.md           (consolidate COMPONENT_ORGANIZATION content)
├── SERVICE_FRAMEWORK.md      (CLIENT_SERVICE_FRAMEWORK + SERVICES + API_INTEGRATION)
├── OVERLAY_SYSTEM.md         (already done - Cascade 2)
├── ERROR_SYSTEM.md           (split to ~400 lines, move examples to code)
├── STATE_PATTERNS.md         (merge STATE_MANAGEMENT content)
├── AUTHENTICATION.md         (keep as-is)
├── DESIGN_TOKENS.md          (extract from DESIGN_SYSTEM + ZINDEX_STRATEGY)
└── ACCESSIBILITY.md          (keep as-is)
```

**Component READMEs** (follow standard template from DESIGNS_CASCADE.md):

```
src/lib/
├── components/
│   ├── EmptyStateEditor/README.md
│   ├── LoginProfile/README.md
│   ├── LogoSidebar/README.md
│   ├── MarkdownEditor/
│   │   ├── README.md
│   │   └── quillmark-syntax/README.md
│   ├── NewDocumentDialog/README.md (already exists)
│   ├── QuillmarkPreview/README.md
│   ├── ShareModal/README.md
│   ├── Sidebar/README.md
│   └── TemplateSelector/README.md
├── services/
│   ├── documents/README.md
│   ├── login/README.md
│   ├── quillmark/README.md
│   ├── templates/README.md (already exists)
│   └── user/README.md
├── adapters/supabase/
│   ├── auth/README.md
│   └── database/README.md
└── quillmark/README.md
```

---

## Size Constraints

**Pattern docs** (target: 200-400 lines, max: 600 lines):

- `ERROR_SYSTEM.md`: 1,105 → ~400 (split examples to code READMEs)
- `TEMPLATE_SELECTOR.md`: 927 → ~300 (move to component README)
- `MARKDOWN_EDITOR.md`: 831 → ~300 (move to component README)
- `DESIGN_SYSTEM.md`: 815 → extract to DESIGN_TOKENS.md ~300

**Component/Service READMEs** (target: 100-300 lines, max: 400 lines):

- Use standard templates from DESIGNS_CASCADE.md
- Link to pattern docs for architectural context
- Focus on API, usage, and component-specific behavior

---

## Implementation Steps

1. **Create new pattern docs**:
   - SERVICE_FRAMEWORK.md (consolidate CLIENT_SERVICE_FRAMEWORK + SERVICES + API_INTEGRATION)
   - DESIGN_TOKENS.md (extract from DESIGN_SYSTEM + ZINDEX_STRATEGY)

2. **Update existing patterns**:
   - ARCHITECTURE.md (merge COMPONENT_ORGANIZATION)
   - STATE_PATTERNS.md (merge STATE_MANAGEMENT)
   - ERROR_SYSTEM.md (trim to ~400 lines, move examples out)

3. **Create code READMEs** (24 files):
   - Backend services (4)
   - Backend adapters (2)
   - Frontend components (8)
   - QuillMark (3)
   - Use standard templates

4. **Update INDEX.md**:
   - Remove subdirectories (backend/, frontend/, quillmark/, patterns/)
   - Flat structure with 8 pattern docs
   - Add "Component Documentation" section pointing to code READMEs

5. **Delete obsolete design docs** (27 files):
   - All backend/\*.md except keep for reference during migration
   - All frontend/\*.md except ARCHITECTURE, ACCESSIBILITY
   - All quillmark/\*.md
   - patterns/CLIENT_SERVICE_FRAMEWORK.md (renamed)
   - Delete entire backend/, frontend/, quillmark/, patterns/ directories

---

## Cross-References

**Pattern docs cross-reference each other**:

- SERVICE_FRAMEWORK.md → ERROR_SYSTEM.md (error handling)
- OVERLAY_SYSTEM.md → STATE_PATTERNS.md (store integration)
- ARCHITECTURE.md → all other patterns (overview)

**Code READMEs link to patterns**:

```markdown
> **Pattern**: This service follows the [Service Framework](../../../prose/designs/SERVICE_FRAMEWORK.md)
```

---

## Success Metrics

**Before**: 35 design docs, 12,808 lines, max 1,105 lines/doc

**After**:

- 8 pattern docs in prose/designs/ (~2,400-3,200 lines total)
- 24 code READMEs (~4,800-7,200 lines total)
- All pattern docs under 600 lines
- All component READMEs under 400 lines
- Single source of truth for each pattern
- Documentation lives next to code

---

## References

- [DESIGNS_CASCADE.md](DESIGNS_CASCADE.md) - Problem statement and standards
- [Architect.md](../.github/agents/Architect.md) - Design principles
- [Programmer.md](../.github/agents/Programmer.md) - Implementation guidelines
