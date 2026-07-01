# Specification: 005-readme-onboarding-docs

## Status

| Field | Value |
|-------|-------|
| **Created** | 2026-07-01 |
| **Current Phase** | Ready |
| **Last Updated** | 2026-07-01 |

## Documents

| Document | Status | Notes |
|----------|--------|-------|
| requirements.md | completed | 5 doc sections, each with testable acceptance criteria. Grounded in codebase research. |
| solution.md | completed | Root README, self-contained + cross-linked. Target order + section skeletons defined. |

**Status values**: `pending` | `in_progress` | `completed` | `skipped`

## Decomposition

| Field | Value |
|-------|-------|
| **Tier** | Direct |
| **Status** | completed |

**Tier values**: `Direct` (no artifacts) | `Incremental` (plan/) | `Factory` (manifest.md + units/ + scenarios/) | `None` (not yet chosen)

For Incremental tier, see `plan/README.md`.
For Factory tier, see `manifest.md`, `units/`, `scenarios/`.
For Direct tier, no decomposition artifacts are produced — implement-direct reads requirements.md and solution.md directly.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-01 | Created spec | Add five onboarding-focused documentation sections to the README (Quick Start, Example Outputs, Real World Use Cases, Troubleshooting, Roadmap). |
| 2026-07-01 | Start phase = Requirements, mode = Standard | User choice at initialization. |
| 2026-07-01 | Requirements complete | 3 parallel research agents grounded all acceptance criteria in the real CLI surface, output shape, exit-code contract, and deferred-to-v2 code. |
| 2026-07-01 | Doc home = root README, self-contained + cross-linked | Landing page must be complete for onboarding; condensed Example Outputs/Troubleshooting link to package README to avoid drift. Resolves the open question. |
| 2026-07-01 | Solution complete | Target section order and per-section skeletons defined; documentation-only, no code changes. |
| 2026-07-01 | Decomposition tier = Direct | Classifier recommendation: single-file Markdown edit, 1 component, no code, no parallel workstreams. Implement straight from requirements + solution. |
| 2026-07-01 | Spec finalized, readiness HIGH | Ready for implementation via implement-direct. |
| 2026-07-01 | Implemented (Direct) | All five sections added to root README.md (121 insertions). Validated against every acceptance criterion. |
| 2026-07-01 | Fixed drift | Subagent invented a composite typography token; replaced with the real nested `typography.size.font-size-1` (dimension) shape per source. |
| 2026-07-01 | Fixed 6 pre-existing em dashes | Repo/authoring convention forbids em dashes; converted to plain dashes. Left uncommitted for review. |

## Context

Target: improve README onboarding for the `ai.to.prototype` toolkit (plugin + `design-token-extractor` CLI). Five requested additions: (1) 60-second Quick Start, (2) Example Outputs, (3) Real World Use Cases, (4) Troubleshooting, (5) Roadmap.

---
*This file is managed by the specify-meta skill.*
