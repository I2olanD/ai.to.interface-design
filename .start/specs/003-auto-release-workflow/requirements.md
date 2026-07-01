---
title: "Auto-Release Workflow on Main Push"
status: draft
version: "1.0"
---

# Product Requirements Document

## Validation Checklist

### CRITICAL GATES (Must Pass)

- [x] All required sections are complete
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Problem statement is specific and measurable
- [x] Every feature has testable acceptance criteria (Gherkin format)
- [x] No contradictions between sections

### QUALITY CHECKS (Should Pass)

- [x] Problem is validated by evidence (not assumptions)
- [x] Context -> Problem -> Solution flow makes sense
- [x] Every persona has at least one user journey
- [x] All MoSCoW categories addressed (Must/Should/Could/Won't)
- [x] Every metric has corresponding tracking events
- [x] No feature redundancy (check for duplicates)
- [x] No technical implementation details included
- [x] A new team member could understand this PRD

---

## Product Overview

### Vision

Every push to `main` automatically produces a versioned release — tagged, published on GitHub, with version strings in plugin config files always in sync.

### Problem Statement

Releases are currently manual. The maintainer must: (1) decide the next version, (2) update version in both `.claude-plugin/marketplace.json` and `plugin/.claude-plugin/plugin.json`, (3) commit the version bump, (4) create a git tag, (5) create a GitHub Release. This is error-prone — version strings can drift between files, tags can be forgotten, and releases can lag behind code changes. There are 7 tags (v1.0.0–v1.0.6) and all were created manually.

### Value Proposition

An automated release workflow eliminates manual version bookkeeping. Every merge to main produces a consistent release: version files updated, tag created, GitHub Release published. The maintainer focuses on code, not release mechanics.

## User Personas

### Primary Persona: Plugin Maintainer

- **Demographics:** Solo developer maintaining the ai-to-prototype plugin. Pushes code to main directly or via merged PRs.
- **Goals:** Ship changes without manual release steps. Trust that version strings, tags, and GitHub Releases stay in sync.
- **Pain Points:** Forgetting to bump version in one of two JSON files. Forgetting to create a tag or GitHub Release. Manual steps slow down the release cadence.

### Secondary Persona: Plugin Consumer

- **Demographics:** Developer who installs the plugin via Claude Code marketplace or discovers it on GitHub.
- **Goals:** See clear release history with changelogs. Know which version they're running and what changed.
- **Pain Points:** No structured release notes. Hard to tell what changed between versions without reading commit history.

## User Journey Maps

### Primary Journey: Maintainer Pushes to Main

1. **Develop:** Maintainer works on a feature or fix on a branch (or directly on main).
2. **Push:** Maintainer pushes/merges to main.
3. **Automated:** Workflow triggers, determines next version (patch bump), updates version in both JSON files, creates tag and GitHub Release.
4. **Verify:** Maintainer sees the new release on GitHub Releases page with auto-generated notes.
5. **Done:** No manual steps needed.

### Secondary Journey: Consumer Checks Releases

1. **Visit:** Consumer visits the GitHub repository.
2. **Browse:** Sees structured releases with version numbers and change summaries.
3. **Decide:** Knows whether to update based on release notes.

## Feature Requirements

### Must Have Features

#### Feature 1: Auto Version Bump on Main Push

- **User Story:** As the plugin maintainer, I want the version to auto-increment on every push to main so that I never manually edit version strings.
- **Acceptance Criteria:**
  - Given a push to main with latest tag `v1.0.6`, When the workflow runs, Then the next version is `v1.0.7`.
  - Given both `.claude-plugin/marketplace.json` and `plugin/.claude-plugin/plugin.json` contain version `1.0.6`, When the workflow bumps to `1.0.7`, Then both files are updated to `1.0.7` and committed.
  - Given the workflow commits a version bump, When that commit is pushed, Then the workflow does NOT trigger again (no infinite loop).

#### Feature 2: Git Tag Creation

- **User Story:** As the plugin maintainer, I want a git tag created for every release so that versions are traceable in git history.
- **Acceptance Criteria:**
  - Given version `1.0.7` is the new version, When the workflow completes, Then tag `v1.0.7` exists on the version bump commit.
  - Given tag `v1.0.7` already exists, When the workflow runs, Then it skips or errors gracefully (no duplicate tags).

#### Feature 3: GitHub Release Creation

- **User Story:** As the plugin maintainer, I want a GitHub Release created for every version so that consumers can see structured release history.
- **Acceptance Criteria:**
  - Given tag `v1.0.7` is created, When the workflow completes, Then a GitHub Release for `v1.0.7` exists.
  - Given the release is created, When a consumer views it, Then it contains auto-generated release notes (commit list since last tag).

### Should Have Features

#### Feature 4: Conventional Commit-Based Version Strategy

- **User Story:** As the plugin maintainer, I want the version bump level (patch/minor/major) to be determined by commit message prefixes so that version numbers reflect the nature of changes.
- **Acceptance Criteria:**
  - Given commits since last tag all start with `fix:`, When the workflow runs, Then version bumps patch (e.g., 1.0.6 -> 1.0.7).
  - Given at least one commit since last tag starts with `feat:`, When the workflow runs, Then version bumps minor (e.g., 1.0.6 -> 1.1.0).
  - Given at least one commit since last tag contains `BREAKING CHANGE` in body or `!` after type, When the workflow runs, Then version bumps major (e.g., 1.0.6 -> 2.0.0).
  - Given no conventional commit prefixes are found, When the workflow runs, Then it defaults to patch bump.

### Could Have Features

#### Feature 5: Release Notes Categorization

- **User Story:** As a plugin consumer, I want release notes grouped by category (features, fixes, etc.) so that I can quickly see what changed.
- **Acceptance Criteria:**
  - Given the release is created with conventional commits, When viewing release notes, Then commits are grouped under headings like "Features", "Bug Fixes".

### Won't Have (This Phase)

- **npm publishing** — No package.json exists; npm distribution is out of scope for this workflow.
- **Pre-release/RC versions** — Always releases stable versions.
- **Manual version override** — Version is always auto-calculated from tags and commits.
- **Changelog file** — GitHub Releases serve as the changelog; no CHANGELOG.md generated.
- **Multi-branch releases** — Only main branch triggers releases.

## Detailed Feature Specifications

### Feature: Auto Version Bump

**Description:** On push to main, the workflow reads the latest git tag, determines the next version based on commits since that tag, updates both JSON config files, and commits the version bump.

**Business Rules:**
- Rule 1: Version source of truth is the latest git tag, not the JSON files.
- Rule 2: Both JSON files must always have identical version strings after a release.
- Rule 3: Version bump commits must not re-trigger the workflow (loop prevention).
- Rule 4: If no tags exist, start from `v0.0.0` and bump accordingly.

**Edge Cases:**
- Two pushes to main in rapid succession -> Expected: Workflow runs sequentially (GitHub Actions concurrency control), each produces its own release.
- Push contains only non-code files (README, docs) -> Expected: Still triggers a release (every push to main = release).
- Merge commit with multiple conventional commit messages -> Expected: Highest bump level wins (major > minor > patch).

### Feature: GitHub Release

**Description:** After tagging, the workflow creates a GitHub Release using auto-generated notes from commits since the previous tag.

**Business Rules:**
- Rule 1: Release title format: `v{version}` (e.g., `v1.0.7`).
- Rule 2: Release is not marked as pre-release or draft.
- Rule 3: Release notes generated automatically by GitHub's release notes generator or from commit history.

## Success Metrics

### Key Performance Indicators

- **Reliability:** 100% of pushes to main produce a release within 2 minutes.
- **Consistency:** Version strings in both JSON files match the git tag on every release.
- **Adoption:** Maintainer stops creating manual tags and releases entirely.

### Tracking Requirements

| Event | Properties | Purpose |
|-------|------------|---------|
| Workflow run | status, duration, version | Monitor reliability and speed |
| Version drift | file versions vs tag | Detect sync failures |
| Release creation | version, commit count | Track release cadence |

## Constraints and Assumptions

### Constraints

- Must use GitHub Actions (repo hosted on GitHub).
- Must use `GITHUB_TOKEN` (no PATs required for basic operation).
- Version bump commit must not trigger another workflow run.
- Only two files need version updates: `.claude-plugin/marketplace.json` and `plugin/.claude-plugin/plugin.json`.

### Assumptions

- **Assumption:** `GITHUB_TOKEN` has sufficient permissions to push commits, create tags, and create releases. (Verified: `contents: write` scope covers all three.)
- **Assumption:** No branch protection rules block workflow commits to main. If branch protection exists, a PAT with bypass permissions would be needed.
- **Assumption:** Conventional commit messages are used consistently (fallback: default to patch if not).

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Infinite workflow loop (version commit triggers re-run) | High | Medium | Use `[skip ci]` in version bump commit message |
| Version drift between JSON files and tag | Medium | Low | Single atomic step updates both files before committing |
| Branch protection blocks workflow push | High | Low | Document PAT requirement if branch protection is enabled |
| Concurrent pushes create version conflicts | Medium | Low | Use GitHub Actions concurrency group to serialize runs |
| `GITHUB_TOKEN` permissions insufficient | High | Low | Explicitly declare `permissions: contents: write` in workflow |

## Open Questions

None — scope is well-defined for this infrastructure task.

---

## Supporting Research

### Release Workflow Patterns

- **Version source:** Git tags as source of truth, JSON files as derived state. Avoids "which file is canonical?" confusion.
- **Loop prevention:** `[skip ci]` in commit message is the simplest and most widely used approach. Alternative: filter on `github.actor` or commit author.
- **Action pinning:** Pin third-party actions by SHA, not tag, to prevent supply chain attacks.
- **Tooling:** `gh release create` (GitHub CLI, pre-installed on runners) is simpler than REST API calls. Bash-based version bumping avoids dependency on Node/semantic-release for a non-Node project.

### Security Considerations

- Use minimal `GITHUB_TOKEN` permissions (`contents: write`).
- Pin all third-party actions by commit SHA.
- `GITHUB_TOKEN` commits do not trigger subsequent workflow runs by default (built-in loop prevention), but `[skip ci]` provides defense-in-depth.
