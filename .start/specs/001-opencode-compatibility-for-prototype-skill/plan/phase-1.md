---
title: "Phase 1: npm Package & Plugin Implementation"
status: completed
version: "1.0"
phase: 1
---

# Phase 1: npm Package & Plugin Implementation

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Constraints; lines: CON-1 through CON-5]`
- `[ref: SDD/Directory Map]`
- `[ref: SDD/Interface Specifications]`
- `[ref: SDD/Implementation Examples]`

**Key Decisions**:
- ADR-1: Plugin copies SKILL.md to `~/.config/opencode/skills/prototype/`
- ADR-2: SKILL.md stays at `plugin/skills/prototype/SKILL.md`
- ADR-3: `@opencode-ai/plugin` as peer dependency

**Dependencies**: None — this is the first phase.

---

## Tasks

Establishes the npm package structure and OpenCode plugin entry point with version-aware skill file synchronization.

- [ ] **T1.1 npm Package Manifest** `[activity: build-feature]` `[parallel: true]`

  1. Prime: Read SDD npm package.json specification `[ref: SDD/Interface Specifications/npm package.json]`
  2. Test: `npm pack --dry-run` lists expected files (`dist/`, `plugin/skills/`); `npm pkg get name` returns `ai-to-prototype`; package.json validates against npm schema
  3. Implement: Create `package.json` at repo root with name, version, main, types, files, peer/dev dependencies per SDD spec. Create `tsconfig.json` targeting ES2022/ESNext modules with `outDir: dist/` and `rootDir: src/`.
  4. Validate: `npm pack --dry-run` shows correct file list. `npx tsc --noEmit` passes.
  5. Success: Package manifest is valid and includes `plugin/skills/` in files array `[ref: PRD/Feature 1]`; TypeScript compiles without errors

- [ ] **T1.2 OpenCode Plugin Entry Point** `[activity: build-feature]`

  1. Prime: Read SDD plugin entry point specification `[ref: SDD/Interface Specifications/OpenCode Plugin Entry Point]`; Read OpenCode plugin docs at https://opencode.ai/docs/plugins/
  2. Test: Plugin module exports `AiToInterfaceDesign` as a named export; calling the export with mock context copies files to a temp directory; version marker prevents re-copy on subsequent calls; re-copy occurs when version changes
  3. Implement: Create `src/index.ts` per SDD specification — Plugin type import, version-aware `syncSkillFiles()`, idempotent copy to `~/.config/opencode/skills/prototype/`, version marker file `.ai-to-prototype-version`
  4. Validate: `npx tsc` compiles to `dist/index.js`. Manual test: import module, call with mock context, verify files copied to target. Call again, verify no re-copy (version check).
  5. Success:
    - [ ] Plugin compiles without errors `[ref: SDD/Constraints/CON-1]`
    - [ ] SKILL.md + references copied to `~/.config/opencode/skills/prototype/` `[ref: PRD/Feature 1/AC-1]`
    - [ ] Version marker prevents redundant copies `[ref: SDD/Runtime View]`
    - [ ] Errors are caught and logged, never thrown `[ref: SDD/Error Handling]`

- [ ] **T1.3 SKILL.md Frontmatter Update** `[activity: build-feature]` `[parallel: true]`

  1. Prime: Read current SKILL.md frontmatter `[ref: SDD/Interface Specifications/SKILL.md Frontmatter]`; Read OpenCode skill docs at https://opencode.ai/docs/skills
  2. Test: SKILL.md YAML frontmatter parses without errors; contains `license: MIT` field; retains all existing fields (`name`, `description`, `user-invocable`, `argument-hint`, `metadata`)
  3. Implement: Add `license: MIT` to SKILL.md frontmatter between `argument-hint` and `metadata`. No changes to the body.
  4. Validate: Parse frontmatter with a YAML parser — all fields present. Diff shows only the `license` line added.
  5. Success: Frontmatter valid for both Claude Code and OpenCode `[ref: PRD/Feature 2/AC-1, AC-2]`

- [ ] **T1.4 Gitignore Update** `[activity: build-feature]` `[parallel: true]`

  1. Prime: Read current `.gitignore` `[ref: SDD/Directory Map]`
  2. Test: `.gitignore` includes `dist/` and `node_modules/`
  3. Implement: Add `dist/` and `node_modules/` entries to `.gitignore`
  4. Validate: `git status` does not show `dist/` or `node_modules/` as untracked after build
  5. Success: Build artifacts excluded from git `[ref: SDD/Directory Map]`

- [ ] **T1.5 Phase Validation** `[activity: validate]`

  - `npx tsc` compiles `src/index.ts` to `dist/index.js` without errors.
  - `npm pack --dry-run` lists: `dist/index.js`, `plugin/skills/prototype/SKILL.md`, `plugin/skills/prototype/references/dom-contract-v1.md`, `package.json`.
  - SKILL.md frontmatter parses with all required fields for both tools.
  - Claude Code marketplace structure (`.claude-plugin/`) unchanged — `git diff` shows no modifications to these files.
