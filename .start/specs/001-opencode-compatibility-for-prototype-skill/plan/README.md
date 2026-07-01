---
title: "OpenCode Compatibility for Prototype Skill"
status: draft
version: "1.0"
---

# Implementation Plan

## Validation Checklist

### CRITICAL GATES (Must Pass)

- [x] All `[NEEDS CLARIFICATION: ...]` markers have been addressed
- [x] All specification file paths are correct and exist
- [x] Each phase follows TDD: Prime → Test → Implement → Validate
- [x] Every task has verifiable success criteria
- [x] A developer could follow this plan independently

### QUALITY CHECKS (Should Pass)

- [x] Context priming section is complete
- [x] All implementation phases are defined with linked phase files
- [x] Dependencies between phases are clear (no circular dependencies)
- [x] Parallel work is properly tagged with `[parallel: true]`
- [x] Activity hints provided for specialist selection `[activity: type]`
- [x] Every phase references relevant SDD sections
- [x] Every test references PRD acceptance criteria
- [x] Integration & E2E tests defined in final phase
- [x] Project commands match actual project setup
- [x] All phase files exist and are linked from this manifest as `[Phase N: Title](phase-N.md)`

---

## Specification Compliance Guidelines

### How to Ensure Specification Adherence

1. **Before Each Phase**: Complete the Pre-Implementation Specification Gate
2. **During Implementation**: Reference specific SDD sections in each task
3. **After Each Task**: Run Specification Compliance checks
4. **Phase Completion**: Verify all specification requirements are met

### Deviation Protocol

When implementation requires changes from the specification:
1. Document the deviation with clear rationale
2. Obtain approval before proceeding
3. Update SDD when the deviation improves the design
4. Record all deviations in this plan for traceability

## Metadata Reference

- `[parallel: true]` - Tasks that can run concurrently
- `[ref: document/section; lines: 1, 2-3]` - Links to specifications
- `[activity: type]` - Activity hint for specialist agent selection

---

## Context Priming

*GATE: Read all files in this section before starting any implementation.*

**Specification**:

- `.start/specs/001-opencode-compatibility-for-prototype-skill/requirements.md` — Product Requirements
- `.start/specs/001-opencode-compatibility-for-prototype-skill/solution.md` — Solution Design

**Key Design Decisions**:

- **ADR-1**: Copy to global skills dir — Plugin init copies SKILL.md to `~/.config/opencode/skills/prototype/` for native OpenCode discovery and slash command support.
- **ADR-2**: SKILL.md stays in plugin/skills/ — Source of truth at `plugin/skills/prototype/SKILL.md`. npm `files` field includes it. Zero changes to Claude marketplace structure.
- **ADR-3**: Peer dependency on @opencode-ai/plugin — OpenCode provides this at runtime. Avoids version conflicts.

**Implementation Context**:

```bash
# Build
npx tsc                     # Compile src/index.ts to dist/

# Quality
npx tsc --noEmit            # Type checking

# Publishing
npm publish                  # Publish to npm registry
git push                     # Claude marketplace pulls from GitHub
```

---

## Implementation Phases

Each phase is defined in a separate file. Tasks follow red-green-refactor: **Prime** (understand context), **Test** (red), **Implement** (green), **Validate** (refactor + verify).

> **Tracking Principle**: Track logical units that produce verifiable outcomes. The TDD cycle is the method, not separate tracked items.

- [x] [Phase 1: npm Package & Plugin Implementation](phase-1.md)
- [x] [Phase 2: Documentation & Verification](phase-2.md)

---

## Plan Verification

| Criterion | Status |
|-----------|--------|
| A developer can follow this plan without additional clarification | ✅ |
| Every task produces a verifiable deliverable | ✅ |
| All PRD acceptance criteria map to specific tasks | ✅ |
| All SDD components have implementation tasks | ✅ |
| Dependencies are explicit with no circular references | ✅ |
| Parallel opportunities are marked with `[parallel: true]` | ✅ |
| Each task has specification references `[ref: ...]` | ✅ |
| Project commands in Context Priming are accurate | ✅ |
| All phase files exist and are linked from this manifest as `[Phase N: Title](phase-N.md)` | ✅ |
