# Specification: 003-auto-release-workflow

## Status

| Field | Value |
|-------|-------|
| **Created** | 2026-04-15 |
| **Current Phase** | Ready |
| **Last Updated** | 2026-04-15 |

## Documents

| Document | Status | Notes |
|----------|--------|-------|
| requirements.md | completed | PRD drafted |
| solution.md | completed | SDD approved, 5 ADRs confirmed |
| plan/ | completed | 1 phase, 1 task |

**Status values**: `pending` | `in_progress` | `completed` | `skipped`

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-15 | Created specification | User wants GitHub Actions workflow for auto-release on main push with version tagging, GH release, and version file updates |
| 2026-04-15 | PRD approved | Requirements complete, transitioning to SDD |
| 2026-04-15 | ADR-1: Git tags as version source of truth | Immutable, atomic, avoids canonical file confusion |
| 2026-04-15 | ADR-2: [skip ci] loop prevention | Defense-in-depth alongside GITHUB_TOKEN default behavior |
| 2026-04-15 | ADR-3: Conventional commit parsing | Matches existing commit style, bash grep, patch fallback |
| 2026-04-15 | ADR-4: sed for JSON updates | No dependencies, unambiguous version field pattern |
| 2026-04-15 | ADR-5: gh CLI for releases | Pre-installed, --generate-notes for auto release notes |
| 2026-04-15 | SDD approved | Solution design complete, transitioning to PLAN |
| 2026-04-15 | PLAN complete | 1 phase, 1 task, ready for implementation |

## Context

GitHub Actions workflow that triggers on push to main, auto-increments version, creates a git tag and GitHub Release, and updates version strings in `.claude-plugin/marketplace.json` and `plugin/.claude-plugin/plugin.json`.

---
*This file is managed by the specify-meta skill.*
