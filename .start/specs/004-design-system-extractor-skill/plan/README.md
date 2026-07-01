---
title: "Design System Extractor CLI"
status: draft
version: "1.0"
---

# Implementation Plan

## Validation Checklist

### CRITICAL GATES (Must Pass)

- [x] All `[NEEDS CLARIFICATION: ...]` markers have been addressed
- [x] All specification file paths are correct and exist
- [x] Each phase follows TDD: Prime -> Test -> Implement -> Validate
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

## Output Schema

### PLAN Status Report

| Field | Value |
|-------|-------|
| specId | 004-design-system-extractor-skill |
| title | Design System Extractor CLI |
| status | DRAFT |
| phases | 8 |
| totalTasks | 28 |
| parallelTasks | 6 |
| specReferences | 42 |
| clarificationsRemaining | 0 |

---

## Context Priming

*GATE: Read all files in this section before starting any implementation.*

**Specification**:
- `.start/specs/004-design-system-extractor-skill/requirements.md` - Product Requirements (v2.0, CLI architecture)
- `.start/specs/004-design-system-extractor-skill/solution.md` - Solution Design (pipeline architecture, 7 ADRs)
- `.start/specs/004-design-system-extractor-skill/SECURITY_RESEARCH.md` - Security controls (SSRF, sanitization)

**Key Design Decisions**:
- **ADR-1**: Project lives in `packages/design-token-extractor/` within existing repo
- **ADR-2**: PostCSS for CSS parsing (security requirement — never regex)
- **ADR-3**: Native fetch (Node 18+) — no HTTP library dependency
- **ADR-4**: commander for CLI framework
- **ADR-5**: tsup for TypeScript build with shebang injection
- **ADR-6**: cheerio for HTML parsing
- **ADR-7**: JSON.stringify for output (prevents injection)

**Implementation Context**:
```bash
# From packages/design-token-extractor/
npm install             # Install dependencies
npm test                # vitest run
npm run test:watch      # vitest (watch mode)
npm run lint            # eslint src/
npm run typecheck       # tsc --noEmit
npm run build           # tsup
```

---

## Implementation Phases

Each phase is defined in a separate file. Tasks follow red-green-refactor: **Prime** (understand context), **Test** (red), **Implement** (green), **Validate** (refactor + verify).

> **Tracking Principle**: Track logical units that produce verifiable outcomes. The TDD cycle is the method, not separate tracked items.

- [ ] [Phase 1: Project Scaffold + Types + Errors](phase-1.md)
- [ ] [Phase 2: URL Validation & Fetching](phase-2.md)
- [ ] [Phase 3: CSS Parsing & Variable Resolution](phase-3.md)
- [ ] [Phase 4: Token Extraction by Category](phase-4.md)
- [ ] [Phase 5: Deduplication & Confidence Scoring](phase-5.md)
- [ ] [Phase 6: Output Formatting & File Writing](phase-6.md)
- [ ] [Phase 7: Pipeline Orchestration & CLI](phase-7.md)
- [ ] [Phase 8: CI/CD, Documentation & Integration Tests](phase-8.md)

---

## Plan Verification

| Criterion | Status |
|-----------|--------|
| A developer can follow this plan without additional clarification | :white_check_mark: |
| Every task produces a verifiable deliverable | :white_check_mark: |
| All PRD acceptance criteria map to specific tasks | :white_check_mark: |
| All SDD components have implementation tasks | :white_check_mark: |
| Dependencies are explicit with no circular references | :white_check_mark: |
| Parallel opportunities are marked with `[parallel: true]` | :white_check_mark: |
| Each task has specification references `[ref: ...]` | :white_check_mark: |
| Project commands in Context Priming are accurate | :white_check_mark: |
| All phase files exist and are linked from this manifest as `[Phase N: Title](phase-N.md)` | :white_check_mark: |
