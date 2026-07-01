# Specification: 004-design-system-extractor-skill

## Status

| Field | Value |
|-------|-------|
| **Created** | 2026-04-15 |
| **Current Phase** | Ready |
| **Last Updated** | 2026-04-16 |

## Documents

| Document | Status | Notes |
|----------|--------|-------|
| requirements.md | completed | v2.0 rewritten for CLI architecture (was skill-based) |
| solution.md | completed | v1.0 — pipeline architecture, 7 ADRs confirmed |
| plan/ | completed | 8 phases, 28 tasks, TDD throughout |

**Status values**: `pending` | `in_progress` | `completed` | `skipped`

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-15 | Created spec 004 | New skill for extracting design systems from websites |
| 2026-04-15 | Rewrite PRD v2.0 | Changed from Claude Code skill to standalone Node.js TypeScript CLI with npm distribution and GitHub Actions auto-publish |

## Context

Create a new Claude Code skill (plugin) that extracts design systems from websites — design tokens (colors, typography, spacing, shadows, borders, etc.), component patterns, and generates structured output usable by other tools/skills.

---
*This file is managed by the specify-meta skill.*
