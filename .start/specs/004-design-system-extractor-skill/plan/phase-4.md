---
title: "Phase 4: Token Extraction by Category"
status: pending
version: "1.0"
phase: 4
---

# Phase 4: Token Extraction by Category

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Complex Logic/Algorithm Step 7]` — extraction per category
- `[ref: PRD/Feature 1/AC-2]` — extracts colors, typography, spacing, shadows, border-radius, breakpoints
- `[ref: PRD/Feature 13]` — animation/motion token extraction (Could Have)

**Key Decisions**:
- Extract 7 categories: color, typography, spacing, shadow, border, breakpoint, motion
- CSS property-to-category mapping defined in SDD Algorithm Step 7

**Dependencies**:
- Phase 3 complete (parsed CSS declarations with resolved variables)

---

## Tasks

Establishes token extraction — maps CSS declarations to categorized RawToken entries. Each extractor is independent and can be developed in parallel.

- [ ] **T4.1 Color Token Extraction** `[activity: domain-modeling]` `[parallel: true]`

  1. Prime: Read SDD Algorithm Step 7 color properties list `[ref: SDD/Complex Logic/Algorithm Step 7]`
  2. Test: Extracts from color, background-color, border-color, fill, stroke properties; extracts from --*color* custom properties; captures hex, rgb(), rgba(), hsl(), hsla(), named colors; ignores non-color values (inherit, transparent handled as valid)
  3. Implement: Create `src/tokenizer.ts` with `extractColors()` — property matching, color value validation
  4. Validate: Tests with sample.css; various color formats
  5. Success: Color tokens extracted from all color-related CSS properties `[ref: PRD/Feature 1/AC-2]`

- [ ] **T4.2 Typography Token Extraction** `[activity: domain-modeling]` `[parallel: true]`

  1. Prime: Read SDD Algorithm Step 7 typography properties `[ref: SDD/Complex Logic/Algorithm Step 7]`
  2. Test: Extracts font-family, font-size, font-weight, line-height, letter-spacing; handles multi-value font-family (e.g., "'Inter', sans-serif"); categorizes each as correct TokenType (fontFamily, dimension, fontWeight, number)
  3. Implement: Add `extractTypography()` to `src/tokenizer.ts`
  4. Validate: Tests with various font declarations
  5. Success: Typography tokens correctly typed and extracted `[ref: PRD/Feature 1/AC-2]`

- [ ] **T4.3 Spacing, Shadow, Border, Breakpoint, Motion Extraction** `[activity: domain-modeling]` `[parallel: true]`

  1. Prime: Read SDD Algorithm Step 7 for remaining categories `[ref: SDD/Complex Logic/Algorithm Step 7]`
  2. Test: Spacing: margin, padding, gap, top/right/bottom/left; Shadows: box-shadow, text-shadow; Borders: border-radius, border-width; Breakpoints: @media min-width/max-width values; Motion: transition-duration, animation-duration, timing functions
  3. Implement: Add `extractSpacing()`, `extractShadows()`, `extractBorders()`, `extractBreakpoints()`, `extractMotion()` to `src/tokenizer.ts`
  4. Validate: Tests for each category with sample CSS
  5. Success: All 7 token categories extracted `[ref: PRD/Feature 1/AC-2]` `[ref: PRD/Feature 13/AC-1]`

- [ ] **T4.4 Category Filter (--include flag)** `[activity: domain-modeling]`

  1. Prime: Read PRD Feature 14 acceptance criteria `[ref: PRD/Feature 14]`
  2. Test: Given --include colors,typography, only color and typography extractors run; given no --include, all categories extracted
  3. Implement: Add `extractTokens()` orchestrator to `src/tokenizer.ts` — calls individual extractors based on include filter
  4. Validate: Filter tests with various --include combinations
  5. Success: Token extraction filtered by category `[ref: PRD/Feature 14/AC-1]`

- [ ] **T4.5 Phase Validation** `[activity: validate]`

  - Run all Phase 4 tests. Verify all token categories. Lint and typecheck pass.
