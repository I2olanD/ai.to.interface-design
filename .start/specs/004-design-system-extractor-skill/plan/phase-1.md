---
title: "Phase 1: Project Scaffold + Types + Errors"
status: in_progress
version: "1.0"
phase: 1
---

# Phase 1: Project Scaffold + Types + Errors

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Directory Map]` — full project structure
- `[ref: SDD/Application Data Models]` — TypeScript interfaces
- `[ref: SDD/Error Handling]` — error hierarchy and exit codes
- `[ref: SDD/Deployment View]` — package.json, tsconfig, tsup config

**Key Decisions**:
- ADR-1: Project in `packages/design-token-extractor/`
- ADR-5: tsup for build with shebang injection

**Dependencies**:
- None — this is the foundation phase

---

## Tasks

Establishes project infrastructure, shared types, and error handling foundation that all subsequent phases depend on.

- [ ] **T1.1 Project Scaffold** `[activity: build-platform]`

  1. Prime: Read SDD Directory Map and Deployment View for package.json, tsconfig.json, tsup.config.ts structure `[ref: SDD/Directory Map]` `[ref: SDD/Deployment View]`
  2. Test: `npm install` succeeds; `npm run build` produces `dist/cli.js` with shebang; `npm run typecheck` passes
  3. Implement: Create `packages/design-token-extractor/` with package.json (bin entry, engines node>=18, dependencies), tsconfig.json (strict, ESM), tsup.config.ts (ESM, node18 target, shebang banner), minimal src/cli.ts placeholder
  4. Validate: Build output exists at `dist/cli.js`; first line is `#!/usr/bin/env node`; package.json bin points to `./dist/cli.js`
  5. Success: Project builds and produces executable CLI entry point `[ref: PRD/Feature 7]`

- [ ] **T1.2 Shared Type Definitions** `[activity: domain-modeling]`

  1. Prime: Read SDD Application Data Models for all TypeScript interfaces `[ref: SDD/Application Data Models]`
  2. Test: Types compile without errors; DesignToken, TokenCategory, CliOptions, ExtractionResult all importable
  3. Implement: Create `src/types.ts` with TokenType, DesignToken, TokenCategory, TokenGroup, DesignTokenFile, ExtractionResult, ExtractionSummary, CssSource, RawToken, CliOptions interfaces
  4. Validate: `npm run typecheck` passes; types are exported and usable from other modules
  5. Success: All pipeline stages can import shared types `[ref: SDD/Application Data Models]`

- [ ] **T1.3 Error Hierarchy** `[activity: domain-modeling]`

  1. Prime: Read SDD Error Handling section for error types and exit code mapping `[ref: SDD/Error Handling]`
  2. Test: UsageError has exitCode 2; RuntimeError has exitCode 1; both extend ExtractorError; both include message
  3. Implement: Create `src/errors.ts` with ExtractorError base class, UsageError (exit 2), RuntimeError (exit 1)
  4. Validate: Unit tests pass; error instances carry correct exit codes
  5. Success: Error types map to exit codes per PRD specification `[ref: PRD/Feature 5]`

- [ ] **T1.4 Test Fixtures** `[activity: domain-modeling]`

  1. Prime: Read SDD Directory Map for fixture requirements `[ref: SDD/Directory Map]`
  2. Test: Fixtures load correctly in test environment
  3. Implement: Create `tests/fixtures/` with sample.html (page with link and style tags), sample.css (colors, typography, spacing, shadows), variables.css (custom properties with var() chains and circular ref), malicious.css (injection attempts, dangerous constructs)
  4. Validate: All fixture files parseable by their respective parsers
  5. Success: Test infrastructure ready for all subsequent phases `[ref: SDD/Directory Map]`

- [ ] **T1.5 Phase Validation** `[activity: validate]`

  - Run all Phase 1 tests. Verify against SDD patterns and PRD acceptance criteria. Lint and typecheck pass.
