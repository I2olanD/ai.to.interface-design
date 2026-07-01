---
title: "Phase 8: CI/CD, Documentation & Integration Tests"
status: pending
version: "1.0"
phase: 8
---

# Phase 8: CI/CD, Documentation & Integration Tests

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Deployment View/npm Publish Workflow]` — GitHub Actions workflow
- `[ref: PRD/Feature 7]` — npm distribution requirements
- `[ref: PRD/Feature 8]` — smart output placement
- `[ref: PRD/Feature 12]` — theme variant detection (Could Have)
- `[ref: SDD/Acceptance Criteria]` — all system-level acceptance criteria

**Key Decisions**:
- Auto-publish on push to main, scoped to packages/design-token-extractor/** path changes
- Conventional commit version bumping (same pattern as existing release.yml)

**Dependencies**:
- Phases 1-7 complete (full CLI functional)

---

## Tasks

Establishes CI/CD pipeline, documentation, and comprehensive integration tests that validate the complete system.

- [ ] **T8.1 GitHub Actions npm Publish Workflow** `[activity: build-platform]`

  1. Prime: Read SDD npm Publish Workflow and existing .github/workflows/release.yml for conventions `[ref: SDD/Deployment View/npm Publish Workflow]` `[ref: .github/workflows/release.yml]`
  2. Test: Workflow triggers on push to main with path filter `packages/design-token-extractor/**`; runs install, typecheck, test, build; publishes to npm with NPM_TOKEN secret; version bump follows conventional commits
  3. Implement: Create `.github/workflows/npm-publish.yml` — setup-node with registry-url, working-directory scoped to package, version determination, npm publish --access public
  4. Validate: Workflow YAML is valid; path filter correct; secrets referenced properly
  5. Success: Auto-publish on push to main `[ref: PRD/Feature 7/AC-2]`

- [ ] **T8.2 Package README** `[activity: domain-modeling]`

  1. Prime: Read PRD Product Overview for value proposition and feature list `[ref: PRD/Product Overview]`
  2. Test: README includes: installation (npm/npx), basic usage, all CLI flags, output format examples, security notes
  3. Implement: Create `packages/design-token-extractor/README.md` — install, usage, flags table, DTCG output example, security section, license
  4. Validate: All CLI flags documented; examples are runnable
  5. Success: Package has complete usage documentation `[ref: PRD/Feature 7/AC-1]`

- [ ] **T8.3 End-to-End Integration Tests** `[activity: validate]`

  1. Prime: Read SDD Acceptance Criteria and PRD edge cases `[ref: SDD/Acceptance Criteria]` `[ref: PRD/Detailed Feature Specifications/Edge Cases]`
  2. Test: Full pipeline with mocked HTTP (no real network in tests): valid URL -> DTCG JSON file written; --format css -> CSS file written; --output - -> JSON on stdout only; --quiet suppresses stderr; --min-confidence filters output; --include filters categories; invalid URL -> exit 2; network error -> exit 1; empty CSS -> warning + empty tokens + exit 0; non-TTY without --no-confirm -> exit 2 with guidance
  3. Implement: Create `tests/extractor.test.ts` — mock fetch responses with fixtures, test full CLI behavior via child_process.exec of built CLI
  4. Validate: All PRD acceptance criteria verified; all edge cases covered
  5. Success:
    - [ ] Full extraction pipeline works end-to-end `[ref: PRD/Feature 1]`
    - [ ] DTCG JSON output valid `[ref: PRD/Feature 3/AC-1]`
    - [ ] CSS output valid `[ref: PRD/Feature 3/AC-2]`
    - [ ] Exit codes correct for all scenarios `[ref: PRD/Feature 5]`
    - [ ] SSRF prevention blocks all private IPs `[ref: PRD/Feature 6]`
    - [ ] Path traversal prevented `[ref: PRD/Feature 6/AC-4]`
    - [ ] npx execution works `[ref: PRD/Feature 7/AC-1]`

- [ ] **T8.4 Smart Output Placement** `[activity: backend-api]`

  1. Prime: Read PRD Feature 8 acceptance criteria `[ref: PRD/Feature 8]`
  2. Test: Detects tailwind.config.* and suggests Tailwind theme extension; without framework, defaults to design-tokens.json in cwd
  3. Implement: Add framework detection to `src/writer.ts` — glob for tailwind.config.*, suggest output location
  4. Validate: Detection tests with various project structures
  5. Success: Output placed intelligently based on project context `[ref: PRD/Feature 8/AC-1,2]`

- [ ] **T8.5 Theme Variant Detection (Could Have)** `[activity: domain-modeling]`

  1. Prime: Read PRD Feature 12 acceptance criteria `[ref: PRD/Feature 12]`
  2. Test: Detects @media (prefers-color-scheme: dark) rules; detects .dark / [data-theme="dark"] selectors; extracts dark tokens into separate group
  3. Implement: Add theme detection to `src/tokenizer.ts` — check media queries and selectors for dark mode patterns, group tokens accordingly
  4. Validate: Tests with CSS containing light/dark variants
  5. Success: Dark mode tokens extracted separately `[ref: PRD/Feature 12/AC-1,2]`

- [ ] **T8.6 Phase Validation** `[activity: validate]`

  - Run full test suite. `npm run build` produces working CLI. `npm pack` produces valid tarball. All PRD acceptance criteria verified. Lint and typecheck pass.
