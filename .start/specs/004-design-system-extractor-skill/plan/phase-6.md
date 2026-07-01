---
title: "Phase 6: Output Formatting & File Writing"
status: pending
version: "1.0"
phase: 6
---

# Phase 6: Output Formatting & File Writing

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Complex Logic/Algorithm Steps 9-12]` — format, sanitize, validate, write
- `[ref: SDD/Interface Specifications/Data Interfaces]` — DTCG JSON and CSS output formats
- `[ref: SECURITY_RESEARCH/Section 2.3]` — output sanitization
- `[ref: SECURITY_RESEARCH/Section 5]` — file path traversal prevention

**Key Decisions**:
- ADR-7: JSON.stringify for output (prevents injection)
- Path traversal prevention: output must not escape cwd
- Sanitize all values: strip null bytes, control chars, max 1000 chars

**Dependencies**:
- Phase 5 complete (DesignTokenFile available)

---

## Tasks

Transforms DesignTokenFile into output strings and writes safely to filesystem or stdout.

- [ ] **T6.1 DTCG JSON Formatter** `[activity: backend-api]` `[parallel: true]`

  1. Prime: Read SDD Data Interfaces for DTCG format and Algorithm Step 9 `[ref: SDD/Interface Specifications/Data Interfaces]` `[ref: SDD/Complex Logic/Algorithm Step 9]`
  2. Test: Produces valid W3C DTCG JSON with $value, $type, $description, $extensions; JSON.parse(output) roundtrips without error; nested token groups render correctly; empty token file produces valid empty JSON
  3. Implement: Create `src/formatter.ts` with `formatJson()` — DesignTokenFile to DTCG JSON string via JSON.stringify with sanitization
  4. Validate: Output validates against DTCG schema structure
  5. Success: Valid DTCG JSON output `[ref: PRD/Feature 1/AC-3]` `[ref: PRD/Feature 3/AC-1]`

- [ ] **T6.2 CSS Custom Properties Formatter** `[activity: backend-api]` `[parallel: true]`

  1. Prime: Read PRD Feature 3 AC-2 for CSS output format `[ref: PRD/Feature 3/AC-2]`
  2. Test: Produces valid CSS with :root declarations; token names become CSS variable names (--color-primary); values are the $value from each token; output is valid CSS parseable by PostCSS
  3. Implement: Add `formatCss()` to `src/formatter.ts` — iterate tokens, generate :root { --name: value; } block
  4. Validate: Output parseable by PostCSS; handles all token types
  5. Success: Valid CSS custom properties output `[ref: PRD/Feature 3/AC-2]`

- [ ] **T6.3 Output Sanitization** `[activity: backend-api]`

  1. Prime: Read SECURITY_RESEARCH Section 2.3 and SDD Algorithm Steps 10-11 `[ref: SECURITY_RESEARCH/Section 2.3]` `[ref: SDD/Complex Logic/Algorithm Steps 10-11]`
  2. Test: Strips null bytes from token values; strips control characters; truncates values > 1000 chars; JSON roundtrip validation passes; malicious.css fixture values sanitized
  3. Implement: Add `sanitizeTokenValue()` to `src/formatter.ts` — regex replacement for null/control chars, length limit, JSON.parse(JSON.stringify()) roundtrip check
  4. Validate: Tests with malicious.css fixture tokens
  5. Success: All output values sanitized `[ref: PRD/Feature 6/AC-5]`

- [ ] **T6.4 File Writer with Path Validation** `[activity: backend-api]`

  1. Prime: Read SECURITY_RESEARCH Section 5 for path traversal prevention `[ref: SECURITY_RESEARCH/Section 5]`
  2. Test: Writes to valid path within cwd; rejects paths with ../ that escape cwd (throws UsageError); writes to stdout when output is '-'; creates parent directories if needed; warns before overwriting existing file (unless --no-confirm)
  3. Implement: Create `src/writer.ts` with `writeOutput()` — path.resolve + startsWith check, fs.writeFile for files, process.stdout.write for '-'
  4. Validate: Path traversal attacks rejected; stdout output clean (no progress mixed in)
  5. Success: Safe file writing with traversal prevention `[ref: PRD/Feature 5/AC-4]` `[ref: PRD/Feature 6/AC-4]`

- [ ] **T6.5 Phase Validation** `[activity: validate]`

  - Run all Phase 6 tests. Verify output sanitization with malicious fixtures. Lint and typecheck pass.
