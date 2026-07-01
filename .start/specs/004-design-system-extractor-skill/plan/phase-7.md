---
title: "Phase 7: Pipeline Orchestration & CLI"
status: pending
version: "1.0"
phase: 7
---

# Phase 7: Pipeline Orchestration & CLI

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Runtime View/Primary Flow]` — full pipeline sequence
- `[ref: SDD/Building Block View/Components]` — component wiring
- `[ref: PRD/Feature 5]` — CLI interface and exit codes
- `[ref: PRD/Feature 6]` — security controls (user confirmation)
- `[ref: PRD/Feature 8]` — smart output placement

**Key Decisions**:
- ADR-4: commander for CLI framework
- Exit codes: 0=success, 1=runtime, 2=usage
- Progress via ora to stderr; JSON to stdout when -o -
- User confirmation before fetch (unless --no-confirm)

**Dependencies**:
- Phases 2-6 complete (all pipeline stages available)

---

## Tasks

Wires all pipeline stages together and exposes them via the CLI interface. This is the integration layer.

- [ ] **T7.1 Pipeline Orchestrator** `[activity: backend-api]`

  1. Prime: Read SDD Runtime View Primary Flow steps 1-12 `[ref: SDD/Runtime View/Primary Flow]`
  2. Test: Orchestrates full pipeline: fetchPage -> discoverCss -> fetchCss -> parse -> extract -> deduplicate -> format -> write; passes options through pipeline; collects summary stats (token counts, CSS bytes, timing); handles partial failures (some CSS files fail, pipeline continues)
  3. Implement: Create `src/extractor.ts` with `extract()` function — calls each module in sequence, aggregates ExtractionResult
  4. Validate: Integration test with fixture data through full pipeline
  5. Success: Full extraction pipeline produces ExtractionResult `[ref: PRD/Feature 1/AC-1,2,3,4]`

- [ ] **T7.2 Commander CLI Setup** `[activity: backend-api]`

  1. Prime: Read PRD Feature 5 for all CLI flags and exit codes `[ref: PRD/Feature 5]`
  2. Test: Parses positional URL argument; parses --output/-o (default: design-tokens.json); parses --format/-f (default: json, accepts: json, css); parses --no-confirm, --quiet, --verbose, --min-confidence, --include; --help shows usage; --version shows package version; missing URL exits with code 2
  3. Implement: Update `src/cli.ts` — commander program with argument, options, action handler that calls extractor.extract()
  4. Validate: Arg parsing tests for all flag combinations
  5. Success: All CLI flags parsed correctly `[ref: PRD/Feature 5/AC-1,2,3,4,5,6]`

- [ ] **T7.3 User Confirmation Prompt** `[activity: backend-api]`

  1. Prime: Read PRD Feature 6 AC-3 and edge case 9 (non-TTY) `[ref: PRD/Feature 6/AC-3]` `[ref: PRD/Detailed Feature Specifications/Edge Cases/Scenario 9]`
  2. Test: Prompts user before fetching (displays URL); --no-confirm skips prompt; user denial aborts with exit 0; non-TTY without --no-confirm exits with code 2 and guidance message
  3. Implement: Add confirmation logic to `src/cli.ts` — readline interface for TTY, process.stdin.isTTY check
  4. Validate: Tests for confirm/deny/non-TTY scenarios
  5. Success: User controls network requests `[ref: PRD/Feature 6/AC-3]`

- [ ] **T7.4 Progress and Summary Output** `[activity: backend-api]`

  1. Prime: Read PRD Feature 9 for summary report format `[ref: PRD/Feature 9]`
  2. Test: Progress spinner shows during fetch/parse (stderr); summary shows URL, timestamp, token counts, top-5 colors (stderr); --quiet suppresses all non-error output; --verbose adds per-file fetch details; -o - keeps stdout clean JSON
  3. Implement: Add ora spinner and summary reporter to `src/cli.ts` — all output to process.stderr
  4. Validate: Verify stderr/stdout separation; quiet mode silence; verbose extra detail
  5. Success: Clear progress and summary reporting `[ref: PRD/Feature 5/AC-4,5,6]` `[ref: PRD/Feature 9/AC-1,2]`

- [ ] **T7.5 Top-Level Error Handler** `[activity: backend-api]`

  1. Prime: Read SDD Error Handling section `[ref: SDD/Error Handling]`
  2. Test: UsageError -> exit 2 with message to stderr; RuntimeError -> exit 1 with message to stderr; uncaught exception -> exit 1; --verbose adds stack trace
  3. Implement: Add try/catch in `src/cli.ts` action handler — map ExtractorError.exitCode to process.exit(), print error.message to stderr
  4. Validate: Error handling tests for each error type
  5. Success: All errors produce correct exit codes `[ref: PRD/Feature 5/AC-2,3]`

- [ ] **T7.6 Phase Validation** `[activity: validate]`

  - Run all Phase 7 tests. Run full pipeline end-to-end with fixture data. Lint and typecheck pass.
