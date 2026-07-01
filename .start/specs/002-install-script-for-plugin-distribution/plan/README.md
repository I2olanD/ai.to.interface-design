---
title: "Unified Install Script for Plugin Distribution"
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
---

## Output Schema

### PLAN Status Report

| Field | Value |
|-------|-------|
| specId | 002-install-script-for-plugin-distribution |
| title | Unified Install Script for Plugin Distribution |
| status | COMPLETE |
| phases | 2 |
| totalTasks | 7 |
| parallelTasks | 2 |
| specReferences | 14 |
| clarificationsRemaining | 0 |

---

## Context Priming

*GATE: Read all files in this section before starting any implementation.*

**Specification**:

- `.start/specs/002-install-script-for-plugin-distribution/requirements.md` - Product Requirements
- `.start/specs/002-install-script-for-plugin-distribution/solution.md` - Solution Design
- `plugin/skills/prototype/SKILL.md` - File to be downloaded for OpenCode
- `plugin/skills/prototype/references/dom-contract-v1.md` - Reference file to accompany SKILL.md

**Key Design Decisions**:

- **ADR-1**: Single-file bash script with functions — all logic in `install.sh` using named functions
- **ADR-2**: GitHub raw URLs for OpenCode downloads — `https://raw.githubusercontent.com/I2olanD/ai.to.prototype/main/plugin/skills/prototype/...`
- **ADR-3**: Colored output with TTY fallback — ANSI codes when interactive, plain when piped
- **ADR-4**: Exit 0 if any tool succeeds — partial success is still success

**Implementation Context**:

```bash
# Testing (manual — shell script, no test framework)
bash install.sh                    # Run locally from repo root
curl -fsSL <url> | bash            # Test curl|bash distribution

# Quality
shellcheck install.sh              # Shell linting (if available)
bash -n install.sh                 # Syntax check

# Validation
echo $?                            # Check exit code
ls ~/.config/opencode/skills/prototype/  # Verify OpenCode files
claude plugin list                 # Verify Claude Code installation
```

---

## Implementation Phases

Each phase is defined in a separate file. Tasks follow red-green-refactor: **Prime** (understand context), **Test** (red), **Implement** (green), **Validate** (refactor + verify).

> **Tracking Principle**: Track logical units that produce verifiable outcomes. The TDD cycle is the method, not separate tracked items.

- [x] [Phase 1: Core Install Script](phase-1.md)
- [x] [Phase 2: Integration & Distribution](phase-2.md)

---

## Plan Verification

Before this plan is ready for implementation, verify:

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
