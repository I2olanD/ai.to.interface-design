# Specification: 001-opencode-compatibility-for-prototype-skill

## Status

| Field | Value |
|-------|-------|
| **Created** | 2026-04-10 |
| **Current Phase** | Ready |
| **Last Updated** | 2026-04-10 |

## Documents

| Document | Status | Notes |
|----------|--------|-------|
| requirements.md | completed | PRD approved |
| solution.md | completed | SDD approved, 3 ADRs confirmed |
| plan/ | completed | 2 phases, 9 tasks |

**Status values**: `pending` | `in_progress` | `completed` | `skipped`

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-10 | Created specification | User wants the prototype skill to work with OpenCode in addition to Claude Code |
| 2026-04-10 | Distribution: npm plugin | User chose npm package using @opencode-ai/plugin over shared-dir or monorepo |
| 2026-04-10 | Architecture: single repo, dual entry | User chose single repo with dual entry points over monorepo or skill-only package |
| 2026-04-10 | PRD approved | Requirements complete, transitioning to SDD |
| 2026-04-10 | ADR-1: Copy to global skills dir | Plugin copies SKILL.md to ~/.config/opencode/skills/prototype/ |
| 2026-04-10 | ADR-2: SKILL.md stays in plugin/skills/ | Zero changes to Claude marketplace structure |
| 2026-04-10 | SDD approved | Solution design complete, transitioning to PLAN |
| 2026-04-10 | PLAN complete | 2 phases, 9 tasks, ready for implementation |

## Context

The ai.to.prototype:prototype skill currently generates UI component prototypes with an in-browser variant picker. It needs to be extended to also work with OpenCode (an alternative AI coding assistant). This specification will define the requirements, solution design, and implementation plan for achieving cross-tool compatibility.

---
*This file is managed by the specify-meta skill.*
