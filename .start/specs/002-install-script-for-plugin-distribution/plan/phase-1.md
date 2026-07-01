---
title: "Phase 1: Core Install Script"
status: completed
version: "1.0"
phase: 1
---

# Phase 1: Core Install Script

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Solution Strategy]` — Architecture: single-file bash with functions
- `[ref: SDD/Building Block View]` — Function decomposition: detect_tools, install_claude, install_opencode, summarize, main
- `[ref: SDD/Runtime View]` — Primary flow sequence and error handling matrix
- `[ref: SDD/Architecture Decisions]` — ADR-1 through ADR-4

**Key Decisions**:
- ADR-1: All functions in a single `install.sh` file
- ADR-2: Use `https://raw.githubusercontent.com/I2olanD/ai.to.prototype/main/plugin/skills/prototype/...` for downloads
- ADR-3: ANSI colors when `[ -t 1 ]` (stdout is TTY), plain otherwise
- ADR-4: Exit 0 if any tool succeeds; exit 1 if all fail or none detected

**Dependencies**:
- None — this is the first phase.

---

## Tasks

Delivers the complete `install.sh` script with all functions: detection, installation for both tools, output formatting, and orchestration.

- [x] **T1.1 Environment Detection** `[activity: shell-scripting]`

  1. Prime: Read SDD/Building Block View `detect_tools()` specification `[ref: SDD/Building Block View]`
  2. Test: Verify `command -v claude` detects Claude CLI presence; verify `[ -d ~/.config/opencode ]` detects OpenCode; verify both-absent case prints manual instructions and exits 1 `[ref: PRD/Feature 1/AC]`
  3. Implement: Create `install.sh` with shebang, color setup (TTY detection per ADR-3), and `detect_tools()` function that sets `HAS_CLAUDE` and `HAS_OPENCODE` flags
  4. Validate: `bash -n install.sh` passes; function sets correct flags in all three scenarios (both, one, neither)
  5. Success: Script detects Claude CLI in PATH `[ref: PRD/Feature 1/AC-1]`; detects OpenCode directory `[ref: PRD/Feature 1/AC-2]`; prints error and exits 1 when neither found `[ref: PRD/Feature 1/AC-3]`

- [x] **T1.2 Claude Code Installation** `[activity: shell-scripting]` `[parallel: true]`

  1. Prime: Read SDD/Runtime View Claude Code sequence `[ref: SDD/Runtime View/Primary Flow steps 4-6]`; read SDD/Error Handling for Claude failure scenarios `[ref: SDD/Runtime View/Error Handling]`
  2. Test: Verify `install_claude()` calls `claude plugin marketplace add I2olanD/ai.to.prototype` then `claude plugin install ai-to-prototype@ai-to-prototype`; verify failure is recorded but does not abort script
  3. Implement: `install_claude()` function that runs both CLI commands, captures exit codes, prints per-step status, and returns success/failure
  4. Validate: Function runs without error when `claude` is available; function records failure gracefully when commands fail
  5. Success: Runs marketplace add command `[ref: PRD/Feature 2/AC-1]`; runs plugin install command `[ref: PRD/Feature 2/AC-2]`; continues on failure `[ref: PRD/Feature 2/AC-3]`

- [x] **T1.3 OpenCode Installation** `[activity: shell-scripting]` `[parallel: true]`

  1. Prime: Read SDD/Runtime View OpenCode sequence `[ref: SDD/Runtime View/Primary Flow steps 7-10]`; read SDD/Implementation Gotchas for empty file detection `[ref: SDD/Risks and Technical Debt/Implementation Gotchas]`
  2. Test: Verify `install_opencode()` creates `~/.config/opencode/skills/prototype/references/` directory; downloads both files via curl; validates downloads are non-empty; verify failure records but does not abort
  3. Implement: `install_opencode()` function that runs `mkdir -p`, downloads `SKILL.md` and `references/dom-contract-v1.md` via curl from GitHub raw URLs, checks file sizes, and returns success/failure
  4. Validate: Function creates correct directory structure; files match source content; empty download detected as failure
  5. Success: Downloads SKILL.md and dom-contract-v1.md `[ref: PRD/Feature 3/AC-1]`; places files in correct directory `[ref: PRD/Feature 3/AC-2]`; continues on failure `[ref: PRD/Feature 3/AC-3]`

- [x] **T1.4 Result Summary and Main Orchestration** `[activity: shell-scripting]`

  1. Prime: Read SDD/Building Block View `summarize()` and `main()` specifications `[ref: SDD/Building Block View]`; read SDD/Architecture Decisions ADR-4 for exit code semantics `[ref: SDD/Architecture Decisions/ADR-4]`
  2. Test: Verify `summarize()` prints colored status per tool; verify `main()` calls detect → install → summarize in sequence; verify exit 0 when at least one succeeds; verify exit 1 when all fail
  3. Implement: `summarize()` function with green checkmark / red X per tool. `main()` function that orchestrates the full flow. Call `main` at script end.
  4. Validate: Full script runs end-to-end; output is readable and colored in terminal; output is clean when piped
  5. Success: Per-tool status summary printed `[ref: PRD/Feature 5/AC-1]`; idempotent re-run `[ref: PRD/Feature 4/AC-1, AC-2]`

- [x] **T1.5 Phase Validation** `[activity: validate]`

  Run `bash -n install.sh` for syntax check. Run `shellcheck install.sh` if available. Execute script locally and verify all functions work. Verify against SDD patterns and PRD acceptance criteria.
