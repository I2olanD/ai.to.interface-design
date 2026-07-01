---
title: "Phase 5: Deduplication & Confidence Scoring"
status: pending
version: "1.0"
phase: 5
---

# Phase 5: Deduplication & Confidence Scoring

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Complex Logic/Algorithm Step 8]` — dedup, clustering, confidence
- `[ref: SDD/Implementation Examples/Confidence Scoring]` — scoring formula with traced walkthrough
- `[ref: PRD/Feature 4]` — deduplication and clustering acceptance criteria
- `[ref: PRD/Feature 11]` — confidence threshold filtering

**Key Decisions**:
- Confidence formula: 1->0.2, 2-5->0.5, 5-10->0.7, 10+->0.9
- Spacing clustering into named scales (xs/sm/md/lg/xl)

**Dependencies**:
- Phase 4 complete (RawToken[] available)

---

## Tasks

Transforms raw token arrays into a clean, deduplicated DesignTokenFile with confidence scores and named scales.

- [ ] **T5.1 Token Deduplication** `[activity: domain-modeling]`

  1. Prime: Read SDD Algorithm Step 8 dedup logic `[ref: SDD/Complex Logic/Algorithm Step 8]`
  2. Test: Identical color values across selectors merge into one token; usage count tracks total occurrences; source files accumulated per unique value; token names derived from CSS variable name (if available) or auto-generated
  3. Implement: Create `src/deduplicator.ts` with `deduplicate()` — group RawTokens by (category + value), merge metadata
  4. Validate: Tests with duplicate colors, multiple sources
  5. Success: One token entry per unique value with merged metadata `[ref: PRD/Feature 4/AC-1]`

- [ ] **T5.2 Confidence Scoring** `[activity: domain-modeling]`

  1. Prime: Read SDD Confidence Scoring example with table `[ref: SDD/Implementation Examples/Confidence Scoring]`
  2. Test: 1 usage -> 0.2; 3 usages -> 0.5; 7 usages -> 0.7; 15 usages -> 0.9; score stored in $extensions
  3. Implement: Add `calculateConfidence()` to `src/deduplicator.ts` — per traced walkthrough
  4. Validate: Exact score values per SDD table
  5. Success: Confidence scores match PRD business rules `[ref: PRD/Feature 4/AC-3]`

- [ ] **T5.3 Spacing Scale Clustering** `[activity: domain-modeling]`

  1. Prime: Read PRD Feature 4 AC-2 for clustering spec `[ref: PRD/Feature 4/AC-2]`
  2. Test: Given spacing values [4px, 8px, 16px, 24px, 32px], produces named scale {xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px}; handles non-uniform scales gracefully; preserves original values
  3. Implement: Add `clusterSpacing()` to `src/deduplicator.ts` — sort numeric values, assign scale names
  4. Validate: Tests with regular and irregular spacing scales
  5. Success: Spacing values organized into named scales `[ref: PRD/Feature 4/AC-2]`

- [ ] **T5.4 Confidence Threshold Filter** `[activity: domain-modeling]`

  1. Prime: Read PRD Feature 11 acceptance criteria `[ref: PRD/Feature 11]`
  2. Test: Given --min-confidence 0.7, tokens with score < 0.7 excluded; given no flag (default 0), all tokens included
  3. Implement: Add `filterByConfidence()` to `src/deduplicator.ts`
  4. Validate: Filter tests with various thresholds
  5. Success: Low-confidence tokens filterable `[ref: PRD/Feature 11/AC-1,2]`

- [ ] **T5.5 Phase Validation** `[activity: validate]`

  - Run all Phase 5 tests. Verify confidence scoring formula exactly. Lint and typecheck pass.
