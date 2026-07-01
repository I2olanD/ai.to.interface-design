---
title: "Phase 1: Release Workflow"
status: pending
---

# Phase 1: Release Workflow

## Overview

Create the GitHub Actions workflow file that auto-releases on push to main. Single task — the entire workflow is one atomic deliverable.

## Tasks

### T1.1: Create release workflow

- **ref**: SDD/Implementation: Complete Workflow
- **activity**: ci-cd
- **parallel**: false

**Prime:**
- Read SDD `solution.md` section "Implementation: Complete Workflow" for full YAML spec
- Read `.claude-plugin/marketplace.json` to confirm current version field format
- Read `plugin/.claude-plugin/plugin.json` to confirm current version field format
- Verify no `.github/workflows/` directory exists yet

**Test:**
- Validate YAML syntax: `yamllint .github/workflows/release.yml` or manual review
- Verify workflow triggers on `push` to `main` only
- Verify `if` condition filters out `[skip ci]` commits
- Verify `permissions` is minimal (`contents: write`)
- Verify `concurrency` group is set with `cancel-in-progress: false`
- Verify `fetch-depth: 0` on checkout step
- Verify version calculation handles: no tags (fallback to v0.0.0), patch bump (default), minor bump (feat:), major bump (BREAKING CHANGE)
- Verify `sed` pattern matches actual JSON file format (`"version": "1.0.6"`)
- Verify commit message contains `[skip ci]`
- Verify `gh release create` uses `--generate-notes`

**Implement:**
- Create `.github/workflows/release.yml` with the complete workflow from SDD
- Workflow steps:
  1. Checkout with full history
  2. Configure git user (github-actions[bot])
  3. Determine next version from tags + conventional commits
  4. Update version in both JSON files via sed
  5. Commit with `[skip ci]`, create tag, push
  6. Create GitHub Release with `--generate-notes`

**Validate:**
- Push a test commit to main and verify:
  - Workflow triggers and completes successfully
  - New tag exists (e.g., `v1.1.0` if commit was `feat:`)
  - Both JSON files have updated version
  - GitHub Release exists with auto-generated notes
  - No second workflow run triggered by version bump commit
