---
title: "Phase 2: URL Validation & Fetching"
status: pending
version: "1.0"
phase: 2
---

# Phase 2: URL Validation & Fetching

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Implementation Examples/URL Validation]` — SSRF deny-list logic with traced walkthrough
- `[ref: SDD/Complex Logic/Algorithm Step 1-6]` — fetch pipeline
- `[ref: SECURITY_RESEARCH/Section 1]` — SSRF, protocol restrictions, URL validation
- `[ref: SECURITY_RESEARCH/Section 2.2]` — HTML parsing safety
- `[ref: SECURITY_RESEARCH/Section 4]` — rate limiting, fetch limits

**Key Decisions**:
- ADR-3: Native fetch (Node 18+)
- ADR-6: cheerio for HTML parsing
- HTTPS-only, SSRF deny-list on all URLs including redirect targets

**Dependencies**:
- Phase 1 complete (types.ts, errors.ts)

---

## Tasks

Establishes the security-critical network layer. This is the highest-risk module — SSRF prevention must be correct before any other fetching logic.

- [ ] **T2.1 URL Validation with SSRF Prevention** `[activity: backend-api]`

  1. Prime: Read SDD URL Validation example and SECURITY_RESEARCH Section 1 `[ref: SDD/Implementation Examples/URL Validation]` `[ref: SECURITY_RESEARCH/Section 1]`
  2. Test: Rejects HTTP URLs; rejects localhost/127.x/10.x/172.16-31.x/192.168.x/169.254.x/::1; rejects file:/data:/ftp: protocols; accepts valid HTTPS URLs; throws UsageError with exit code 2
  3. Implement: Create `src/fetcher.ts` with `validateUrl()` function — PRIVATE_IP_PATTERNS deny-list, BLOCKED_HOSTNAMES list, protocol check
  4. Validate: All SSRF test cases pass per traced walkthrough in SDD
  5. Success: No private IP or non-HTTPS URL passes validation `[ref: PRD/Feature 6/AC-1,2]`

- [ ] **T2.2 HTML Fetching & CSS Discovery** `[activity: backend-api]`

  1. Prime: Read SDD Algorithm Steps 3-5 for fetch and discovery logic `[ref: SDD/Complex Logic/Algorithm Steps 3-5]`
  2. Test: Fetches HTML with 30s timeout; discovers `<link rel="stylesheet">` hrefs; extracts `<style>` tag content; resolves relative URLs against base URL; handles missing CSS links gracefully
  3. Implement: Add `fetchPage()` and `discoverCss()` to `src/fetcher.ts` — native fetch with AbortController timeout, cheerio for `<link>` and `<style>` extraction, URL resolution
  4. Validate: Unit tests with fixture HTML; edge cases (no CSS, relative URLs, non-HTML response)
  5. Success: HTML fetched and CSS sources discovered `[ref: PRD/Feature 1/AC-1]`

- [ ] **T2.3 CSS File Fetching with Limits** `[activity: backend-api]`

  1. Prime: Read SDD Business Rules 3, 8, 9 and SECURITY_RESEARCH Section 4 `[ref: SDD/Runtime View/Business Rules]` `[ref: SECURITY_RESEARCH/Section 4]`
  2. Test: Fetches CSS files with 30s timeout; enforces 1MB per file limit; enforces 10 file max; enforces 5MB total cap; validates each CSS URL against SSRF deny-list; follows max 5 redirects with re-validation; skips failed fetches with warning; returns CssSource[]
  3. Implement: Add `fetchCss()` to `src/fetcher.ts` — sequential fetching, Content-Length check, byte counting, redirect validation
  4. Validate: Tests for size limits, redirect chains, failed fetches, SSRF on redirect targets
  5. Success: CSS fetched within safety limits `[ref: PRD/Feature 1/AC-1]` `[ref: PRD/Feature 6/AC-3,4]`

- [ ] **T2.4 Phase Validation** `[activity: validate]`

  - Run all Phase 2 tests. Verify all SSRF scenarios from SECURITY_RESEARCH. Lint and typecheck pass.
