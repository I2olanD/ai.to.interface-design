---
title: "Phase 3: CSS Parsing & Variable Resolution"
status: pending
version: "1.0"
phase: 3
---

# Phase 3: CSS Parsing & Variable Resolution

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Implementation Examples/CSS Custom Property Resolution]` — resolveValue with traced walkthrough
- `[ref: SDD/Complex Logic/Algorithm Step 6]` — parse and resolve
- `[ref: SECURITY_RESEARCH/Section 2.1]` — CSS parsing safety, dangerous constructs

**Key Decisions**:
- ADR-2: PostCSS for CSS parsing (never regex)
- Resolve var() chains to max depth 10, detect circular references

**Dependencies**:
- Phase 1 complete (types.ts)
- Phase 2 complete (CssSource[] available)

---

## Tasks

Establishes CSS parsing and variable resolution — transforms raw CSS text into structured declarations with resolved values.

- [ ] **T3.1 PostCSS CSS Parsing** `[activity: backend-api]`

  1. Prime: Read SDD Algorithm Step 6 and SECURITY_RESEARCH Section 2.1 `[ref: SDD/Complex Logic/Algorithm Step 6]` `[ref: SECURITY_RESEARCH/Section 2.1]`
  2. Test: Parses valid CSS into declarations; handles malformed CSS gracefully (warn, not crash); collects custom property declarations from :root and other selectors; normalizes browser-prefixed properties (-webkit-, -moz-) to standard equivalents
  3. Implement: Create `src/parser.ts` with `parseCss()` function — PostCSS parse, walkDecls to collect declarations, filter dangerous constructs (behavior, -moz-binding, expression, -ms-filter)
  4. Validate: Tests with sample.css and malicious.css fixtures; dangerous constructs filtered
  5. Success: CSS safely parsed into structured declarations `[ref: PRD/Feature 1/AC-2]`

- [ ] **T3.2 CSS Custom Property Resolution** `[activity: backend-api]`

  1. Prime: Read SDD Custom Property Resolution example with traced walkthrough `[ref: SDD/Implementation Examples/CSS Custom Property Resolution]`
  2. Test: Resolves simple var(--name) to value; resolves chained vars (var(--a) where --a = var(--b)); handles circular references (returns fallback or unresolved); handles fallback values var(--missing, blue); max depth 10
  3. Implement: Add `resolveCustomProperties()` and `resolveValue()` to `src/parser.ts` — two-pass: collect declarations, then resolve var() chains with visited-set cycle detection
  4. Validate: All traced walkthrough cases from SDD pass; circular ref test with variables.css fixture
  5. Success: var() chains fully resolved; circular refs detected and warned `[ref: PRD/Feature 2/AC-1,2,3]`

- [ ] **T3.3 @import Chain Following** `[activity: backend-api]`

  1. Prime: Read PRD Feature 10 acceptance criteria `[ref: PRD/Feature 10]`
  2. Test: Discovers @import url("file.css") declarations; follows chains up to depth 5; stops at depth limit with warning; handles failed @import fetches gracefully; validates import URLs against SSRF deny-list
  3. Implement: Add `followImports()` to `src/parser.ts` — extract @import rules from PostCSS AST, fetch imported CSS (reusing fetcher.fetchCss), recursive with depth counter
  4. Validate: Tests for nested imports, depth limit, failed imports, SSRF on import URLs
  5. Success: @import chains followed within safety limits `[ref: PRD/Feature 10/AC-1,2,3]`

- [ ] **T3.4 Phase Validation** `[activity: validate]`

  - Run all Phase 3 tests. Verify malicious CSS handling from SECURITY_RESEARCH. Lint and typecheck pass.
