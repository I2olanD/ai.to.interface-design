---
title: "Phase 2: Documentation & Verification"
status: completed
version: "1.0"
phase: 2
---

# Phase 2: Documentation & Verification

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Deployment View]`
- `[ref: PRD/Feature 4 - Unified README]`
- `[ref: PRD/Feature 3 - Preserved Claude Marketplace]`

**Key Decisions**:
- Two independent publishing channels: git push for Claude marketplace, npm publish for OpenCode
- README must show both install paths clearly

**Dependencies**: Phase 1 must be complete — package.json and plugin code must exist before documentation and verification.

---

## Tasks

Completes documentation with dual install instructions and verifies end-to-end functionality in both tools.

- [ ] **T2.1 README with Dual Install Instructions** `[activity: build-feature]`

  1. Prime: Read current README.md `[ref: SDD/Directory Map]`; Read PRD Feature 4 acceptance criteria `[ref: PRD/Feature 4/AC-1, AC-2]`
  2. Test: README contains Claude Code install section with `claude plugin add --marketplace` command; README contains OpenCode install section with `opencode.json` plugin config example; Both sections are clearly labeled and easy to find
  3. Implement: Update README.md — add OpenCode installation section alongside existing Claude Code section. Include `opencode.json` config snippet. Keep the existing Claude Code instructions unchanged.
  4. Validate: README renders correctly in GitHub markdown preview. Both install paths are clearly documented.
  5. Success:
    - [ ] Claude Code install instructions present and unchanged `[ref: PRD/Feature 3]`
    - [ ] OpenCode install instructions present with one-line config `[ref: PRD/Feature 4/AC-2]`

- [ ] **T2.2 Claude Code Regression Verification** `[activity: validate]`

  1. Prime: Read PRD Feature 3 acceptance criteria `[ref: PRD/Feature 3/AC-1, AC-2, AC-3]`
  2. Test: `git diff` against main shows no changes to `.claude-plugin/marketplace.json`, `plugin/.claude-plugin/plugin.json`, SKILL.md body (below frontmatter), or `plugin/skills/prototype/references/dom-contract-v1.md`
  3. Implement: N/A — this is a verification task
  4. Validate: All Claude Code marketplace files unchanged. Manual test: install via `claude plugin add --marketplace` and invoke `/prototype` — behavior identical to before.
  5. Success:
    - [ ] Marketplace install works identically `[ref: PRD/Feature 3/AC-1]`
    - [ ] Existing installations unaffected `[ref: PRD/Feature 3/AC-2]`
    - [ ] Prototype output identical `[ref: PRD/Feature 3/AC-3]`

- [ ] **T2.3 OpenCode Integration Verification** `[activity: validate]`

  1. Prime: Read SDD Runtime View flow `[ref: SDD/Runtime View]`; Read PRD Feature 1 acceptance criteria `[ref: PRD/Feature 1/AC-1, AC-2, AC-3]`
  2. Test: Add `"ai-to-prototype"` to a test project's `opencode.json`; start OpenCode; verify skill files appear at `~/.config/opencode/skills/prototype/`; invoke `/prototype "test component"` and verify prototypes are generated
  3. Implement: N/A — this is a verification task
  4. Validate: Manual verification in OpenCode:
    - Plugin installs via Bun without errors
    - SKILL.md + references copied to global skills dir
    - `/prototype` appears as a slash command
    - Invoking `/prototype "hero section"` generates multi-variant prototypes
  5. Success:
    - [ ] Plugin auto-installs from opencode.json config `[ref: PRD/Feature 1/AC-1]`
    - [ ] `/prototype` generates prototypes in OpenCode `[ref: PRD/Feature 1/AC-2]`
    - [ ] Agent discovers skill automatically `[ref: PRD/Feature 1/AC-3]`

- [ ] **T2.4 Phase Validation** `[activity: validate]`

  - All PRD acceptance criteria verified:
    - Feature 1 (npm distribution): ✅ via T2.3
    - Feature 2 (cross-compatible SKILL.md): ✅ via T1.3 + T2.2 + T2.3
    - Feature 3 (preserved Claude marketplace): ✅ via T2.2
    - Feature 4 (unified README): ✅ via T2.1
  - No regressions in Claude Code behavior.
  - OpenCode plugin works end-to-end.
  - Ready for npm publish and git push.
