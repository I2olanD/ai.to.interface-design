# Specification: 002-install-script-for-plugin-distribution

## Status

| Field | Value |
|-------|-------|
| **Created** | 2026-04-10 |
| **Current Phase** | Ready |
| **Last Updated** | 2026-04-10 |

## Documents

| Document | Status | Notes |
|----------|--------|-------|
| requirements.md | completed | PRD approved via brainstorm |
| solution.md | completed | 4 ADRs confirmed |
| plan/ | completed | 2 phases, 7 tasks |

**Status values**: `pending` | `in_progress` | `completed` | `skipped`

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-10 | Unified onboarding as primary goal | Single command for users who don't know which tool they have |
| 2026-04-10 | Install for both tools when both detected | No reason to limit — install everywhere available |
| 2026-04-10 | User-global only (no --local flag) | Keep scope tight; project-local is future enhancement |
| 2026-04-10 | curl \| bash distribution | Shareable one-liner; script self-downloads plugin files |
| 2026-04-10 | CLI-native for Claude Code, file-copy for OpenCode | Respects each tool's native install mechanism |
| 2026-04-10 | ADR-1: Single-file bash with functions | Simplest curl \| bash distribution |
| 2026-04-10 | ADR-2: GitHub raw URLs for file downloads | No git dependency, curl already available |
| 2026-04-10 | ADR-3: Colored output with TTY fallback | Visual clarity + CI safety |
| 2026-04-10 | ADR-4: Exit 0 if any tool succeeds | Partial success is still valuable |
| 2026-04-10 | 2-phase plan: Core Script + Integration & Distribution | Proportional to scope (~100-line script) |

## Context

Unified install.sh script for the ai.to.prototype plugin. Auto-detects Claude Code and OpenCode, installs for all detected tools. User-global scope only. Distributed via curl | bash.

---
*This file is managed by the specify-meta skill.*
