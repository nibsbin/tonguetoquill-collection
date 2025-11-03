# Design-Codebase Maintainability Guide

## Overview

This document establishes processes and guidelines for keeping design documentation synchronized with the codebase going forward, preventing technical debt accumulation.

## Purpose

After completing several major implementation phases (Phase 6.6 Technical Debt Repair, Theme Unification, Sidebar Redesign), we need a sustainable process to:

1. Keep design documents current with code changes
2. Ensure new features are designed before implementation
3. Maintain consistency between plans, designs, and implementation
4. Prevent future technical debt accumulation

## Documentation Structure

### Current Organization

```
prose/
├── designs/           # Authoritative design documents (desired state)
│   ├── backend/      # Backend architecture and schemas
│   ├── frontend/     # Frontend architecture and components
│   └── quillmark/    # Quillmark integration (post-MVP)
├── plans/            # Implementation plans (current → desired)
│   └── __archive__/  # Completed plans
├── debriefs/         # Post-implementation summaries
└── claude-theme/     # Reference materials
```

### Document Types

1. **Design Documents** (`prose/designs/`)
   - **Purpose**: Define the desired state of the system
   - **Audience**: Developers, architects, stakeholders
   - **Lifecycle**: Living documents, updated as designs evolve
   - **Level**: Medium to high level, minimal code samples
   - **Examples**: ARCHITECTURE.md, DESIGN_SYSTEM.md, UI_COMPONENTS.md

2. **Plan Documents** (`prose/plans/`)
   - **Purpose**: Bridge current state to desired state
   - **Audience**: Implementers
   - **Lifecycle**: Active until implementation complete, then archived
   - **Level**: Tactical, phase-by-phase implementation steps
   - **Examples**: theme-unification-plan.md, sidebar-redesign.md

3. **Debrief Documents** (`prose/debriefs/`)
   - **Purpose**: Document actual implementation, decisions, deviations
   - **Audience**: Future maintainers, team members
   - **Lifecycle**: Created after implementation, rarely updated
   - **Level**: Detailed, includes code snippets and file lists

## Change Management Process

### For New Features

**Phase 1: Design**

1. Create or update design document in `prose/designs/`
   - Define desired behavior and architecture
   - Specify component interfaces and interactions
   - Document accessibility and responsive requirements
   - Get review/approval before implementation

**Phase 2: Planning** 2. Create implementation plan in `prose/plans/`

- Reference relevant design documents
- Break work into phases
- Identify files to modify
- Estimate effort
- Define success criteria

**Phase 3: Implementation** 3. Implement according to plan

- Reference both design and plan documents
- Note any deviations in commit messages
- Update plan if approach changes

**Phase 4: Documentation** 4. Create debrief document in `prose/debriefs/`

- Summarize what was implemented
- Document decisions and deviations
- List modified files
- Note any outstanding work

5. Update affected design documents
   - Mark features as implemented
   - Update status notes
   - Add cross-references to debriefs
6. Archive completed plan
   - Move to `prose/plans/__archive__/`
   - Add completion date to filename

### For Bug Fixes and Minor Changes

**Small Changes** (< 3 files, no architectural impact):

- Update code
- Update relevant design doc if behavior changed
- Note change in commit message

**Medium Changes** (3-10 files, minor architectural impact):

- Create short plan or checklist
- Update affected design documents
- Consider creating brief debrief if complex

**Large Changes** (> 10 files, architectural impact):

- Follow full change management process above

## Design Document Maintenance

### Update Triggers

Design documents should be updated when:

1. ✅ New features are implemented
2. ✅ Architecture changes significantly
3. ✅ Component interfaces change
4. ✅ Design patterns evolve
5. ✅ Technology stack updates
6. ✅ Accessibility requirements change
7. ✅ Performance characteristics change

### Update Checklist

When updating design documents:

- [ ] Update status markers (⚠️, ✅, ❌)
- [ ] Add cross-references to debriefs
- [ ] Update code samples if included
- [ ] Check cross-references to other docs
- [ ] Update "Last Updated" date at bottom
- [ ] Verify consistency with related docs

### Design Document Review Schedule

**Quarterly Review**: Every 3 months

- Review all design documents for accuracy
- Update outdated sections
- Archive obsolete documents
- Identify gaps in documentation

**Pre-Release Review**: Before major releases

- Verify design docs match implementation
- Update all status markers
- Create summary of changes since last release

## Cross-Referencing Guidelines

### Best Practices

1. **Use Relative Paths**:

   ```markdown
   See [DESIGN_SYSTEM.md](../frontend/DESIGN_SYSTEM.md) for colors
   ```

2. **Link to Specific Sections**:

   ```markdown
   See [Auto-Save Behavior](./DESIGN_SYSTEM.md#auto-save-behavior)
   ```

3. **Bidirectional References**:
   - If document A references document B, consider adding reference from B to A
   - Helps maintain consistency

4. **DRY Principle**:
   - Define concepts once in most appropriate document
   - Reference from other locations
   - Avoids duplication and inconsistency

### Cross-Reference Patterns

**Design → Design**:

```markdown
For color tokens, see [DESIGN_SYSTEM.md - Theme System](./DESIGN_SYSTEM.md#theme-system)
```

**Plan → Design**:

```markdown
This plan implements [SIDEBAR.md](../designs/frontend/SIDEBAR.md)
```

**Debrief → Design**:

```markdown
Implementation documented in [sidebar-redesign.md](../../debriefs/sidebar-redesign.md)
```

**Design → Debrief**:

```markdown
**Status**: ✅ Implemented (October 2025). See `prose/debriefs/sidebar-redesign.md`
```

## Status Markers

Use consistent status markers in design documents:

- ✅ **Implemented**: Feature is complete and working
- ⚠️ **Partial**: Feature partially implemented or has known issues
- 🚧 **In Progress**: Currently being implemented
- 📝 **Planned**: Designed but not yet implemented
- ❌ **Deferred**: Designed but intentionally not implemented yet
- 🔮 **Future**: Post-MVP or aspirational feature

## File Naming Conventions

### Design Documents

- Use UPPERCASE names for major documents: `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`
- Use lowercase for specific features: `sidebar.md`, `auth.md`
- Be descriptive but concise

### Plan Documents

- Use lowercase with hyphens: `theme-unification-plan.md`
- Include "-plan" suffix for implementation plans
- Include "-summary" suffix for overview documents

### Debrief Documents

- Use lowercase with hyphens: `sidebar-redesign.md`
- Include phase number if part of structured plan: `phase-6-6-technical-debt-repair.md`
- Use descriptive names matching the work completed

### Archived Plans

- Move to `__archive__/` subdirectory
- Consider adding completion date: `MVP_PLAN_2025-10.md` (optional)
- Keep original name for traceability

## Documentation Quality Standards

### Design Documents Should:

- [ ] Be clear and unambiguous
- [ ] Include rationale for major decisions
- [ ] Reference authoritative sources
- [ ] Use consistent terminology
- [ ] Include visual diagrams where helpful
- [ ] Be technology-agnostic where possible
- [ ] Have clear ownership/last updated date
- [ ] Cross-reference related documents

### Plan Documents Should:

- [ ] Reference design documents
- [ ] Define clear phases
- [ ] Estimate effort for each phase
- [ ] Identify affected files
- [ ] Define success criteria
- [ ] Include validation steps
- [ ] Note dependencies
- [ ] Specify what's out of scope

### Debrief Documents Should:

- [ ] Summarize what was implemented
- [ ] Document key decisions
- [ ] List modified files
- [ ] Note deviations from plan
- [ ] Include validation results
- [ ] Reference design documents
- [ ] Identify outstanding work
- [ ] Provide recommendations

## Code Review Checklist

When reviewing PRs, check:

- [ ] Are affected design docs updated?
- [ ] Is a debrief needed for this change?
- [ ] Should a plan be archived?
- [ ] Are cross-references still valid?
- [ ] Do status markers need updating?
- [ ] Is there a design doc for new features?

## Tooling and Automation

### Current Tools

- **Markdown**: All documentation in Markdown for git-friendly diffs
- **Git**: Version control for documentation alongside code
- **grep/find**: Search for outdated references

### Potential Future Tools

- **Documentation linter**: Check for broken links, missing sections
- **Status dashboard**: Visual overview of design vs implementation status
- **Auto-linking**: Generate cross-reference suggestions
- **Change tracking**: Alert when code changes affect documented APIs

## Team Responsibilities

### Developers

- Read relevant design docs before starting work
- Follow established patterns and conventions
- Update design docs when changing behavior
- Create debriefs for significant work
- Archive completed plans

### Architects

- Review and approve design documents
- Ensure consistency across documents
- Conduct quarterly documentation reviews
- Identify documentation gaps
- Maintain this maintainability plan

### Product Owners

- Ensure features are designed before implementation
- Approve architectural changes
- Prioritize documentation updates

## Success Metrics

Track these metrics to measure documentation health:

1. **Consistency Score**: % of design docs marked as current
2. **Coverage Score**: % of features with design documentation
3. **Freshness Score**: % of docs updated in last 90 days
4. **Reference Integrity**: % of cross-references that resolve correctly
5. **Plan Completion**: % of plans with corresponding debriefs

**Target Metrics**:

- Consistency: > 90%
- Coverage: > 85%
- Freshness: > 60%
- Reference Integrity: 100%
- Plan Completion: 100%

## Common Pitfalls to Avoid

1. ❌ **Implementing without design docs**: Creates technical debt
2. ❌ **Not updating docs after changes**: Docs become outdated quickly
3. ❌ **Over-documenting**: Too much detail in designs makes them brittle
4. ❌ **Under-documenting**: Too little detail makes them useless
5. ❌ **Duplicating information**: Violates DRY, causes inconsistency
6. ❌ **Broken cross-references**: Makes navigation difficult
7. ❌ **Keeping stale plans active**: Clutters plans directory
8. ❌ **No debriefs**: Loses context about why decisions were made

## Action Items for Current Cleanup

Based on recent implementations, the following design documents have been updated:

- [x] DESIGN_SYSTEM.md - Updated color palette for theme system
- [x] DESIGN_SYSTEM.md - Updated sidebar dimensions
- [x] STATE_MANAGEMENT.md - Updated auto-save status
- [x] SIDEBAR.md - Updated with implementation status and color tokens

## Conclusion

This maintainability plan establishes processes to keep design documentation synchronized with the codebase. By following these guidelines, we can:

- Prevent technical debt accumulation
- Maintain clear communication about system design
- Enable efficient onboarding of new team members
- Support informed decision-making
- Preserve institutional knowledge

**Review and Update**: This plan should be reviewed quarterly and updated as processes evolve.

---

**Created**: October 30, 2025  
**Owner**: Architecture Team  
**Next Review**: January 30, 2026
