---
title: "Phase 2: Integration & Distribution"
status: completed
version: "1.0"
phase: 2
---

# Phase 2: Integration & Distribution

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Runtime View/Primary Flow]` — End-to-end sequence diagram
- `[ref: SDD/Runtime View/Error Handling]` — All 7 error scenarios
- `[ref: SDD/Deployment View]` — Distribution URL and deployment approach
- `[ref: SDD/Quality Requirements]` — Idempotency, graceful degradation, output clarity

**Key Decisions**:
- ADR-4: Exit code semantics — 0 if any succeeds, 1 if all fail
- Distribution via `curl -fsSL https://raw.githubusercontent.com/I2olanD/ai.to.prototype/main/install.sh | bash`

**Dependencies**:
- Phase 1 must be complete — all functions implemented and individually verified.

---

## Tasks

Delivers end-to-end validation of the script across all scenarios, and updates the README with the one-liner install command.

- [x] **T2.1 End-to-End Integration Testing** `[activity: integration-testing]`

  1. Prime: Read SDD/Runtime View full sequence `[ref: SDD/Runtime View/Primary Flow]`; read SDD/Error Handling matrix `[ref: SDD/Runtime View/Error Handling]`; read all PRD acceptance criteria `[ref: PRD/Feature Requirements]`
  2. Test: Verify all 7 error scenarios from SDD error handling matrix:
     - Both tools detected → both install, exit 0
     - Only Claude Code → installs for Claude only, exit 0
     - Only OpenCode → installs for OpenCode only, exit 0
     - Neither tool → prints manual instructions, exit 1
     - Claude fails, OpenCode succeeds → mixed summary, exit 0
     - Claude succeeds, OpenCode fails → mixed summary, exit 0
     - Both fail → failure summary, exit 1
  3. Implement: Run script in each scenario. For "tool not found" scenarios, temporarily adjust PATH or rename config directories. Verify output and exit codes.
  4. Validate: All 7 scenarios produce expected output and exit codes; idempotent re-run produces no errors `[ref: SDD/Quality Requirements]`
  5. Success:
     - [ ] Environment detection works for all combinations `[ref: PRD/Feature 1/AC-1, AC-2, AC-3]`
     - [ ] Claude Code installation uses CLI commands `[ref: PRD/Feature 2/AC-1, AC-2]`
     - [ ] OpenCode installation places files correctly `[ref: PRD/Feature 3/AC-1, AC-2]`
     - [ ] Per-tool failure isolation works `[ref: PRD/Feature 2/AC-3, Feature 3/AC-3]`
     - [ ] Idempotent re-run succeeds `[ref: PRD/Feature 4/AC-1, AC-2]`
     - [ ] Result summary is clear `[ref: PRD/Feature 5/AC-1]`

- [x] **T2.2 README Update** `[activity: documentation]`

  1. Prime: Read current `README.md` `[ref: README.md]`; read SDD/Deployment View for distribution URL `[ref: SDD/Deployment View]`
  2. Test: Verify README contains a curl | bash one-liner before the tool-specific sections; verify the URL points to the correct raw GitHub path
  3. Implement: Add a "Quick Install" section at the top of the Install section in `README.md` with: `curl -fsSL https://raw.githubusercontent.com/I2olanD/ai.to.prototype/main/install.sh | bash`. Keep existing tool-specific sections as manual alternatives.
  4. Validate: README renders correctly; URL is syntactically valid; existing content preserved
  5. Success: README contains shareable one-liner `[ref: PRD/Value Proposition]`; manual instructions preserved as fallback `[ref: PRD/Risks and Mitigations/curl|bash security concerns]`

- [x] **T2.3 Phase Validation** `[activity: validate]`

  Run full end-to-end script execution. Verify README changes render correctly. Cross-check all PRD acceptance criteria (14 total) are satisfied. Verify SDD quality requirements (execution time < 30s, idempotency, no leftover artifacts, graceful degradation, output clarity).
