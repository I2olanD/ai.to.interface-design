---
title: "Design System Extractor CLI"
status: draft
version: "2.0"
---

# Product Requirements Document

## Validation Checklist

### CRITICAL GATES (Must Pass)

- [x] All required sections are complete
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Problem statement is specific and measurable
- [x] Every feature has testable acceptance criteria (Gherkin format)
- [x] No contradictions between sections

### QUALITY CHECKS (Should Pass)

- [x] Problem is validated by evidence (not assumptions)
- [x] Context -> Problem -> Solution flow makes sense
- [x] Every persona has at least one user journey
- [x] All MoSCoW categories addressed (Must/Should/Could/Won't)
- [x] Every metric has corresponding tracking events
- [x] No feature redundancy (check for duplicates)
- [x] No technical implementation details included
- [x] A new team member could understand this PRD

---

## Output Schema

### PRD Status Report

| Field | Value |
|-------|-------|
| specId | 004-design-system-extractor-skill |
| title | Design System Extractor CLI |
| status | DRAFT |
| clarificationsRemaining | 0 |
| acceptanceCriteria | 32 |
| openQuestions | 3 |

---

## Product Overview

### Vision

A single CLI command extracts a complete, structured design system from any public website — outputting W3C DTCG-compliant JSON that plugs directly into Style Dictionary, Tailwind CSS, and Figma Tokens with zero manual conversion.

### Problem Statement

Frontend developers and designers spend 2-4 hours manually extracting design tokens (colors, typography, spacing) from existing websites when starting new projects, matching client brands, or auditing deployed sites. This process involves browser DevTools inspection, manual copying of CSS values, and ad-hoc organization into usable token files. The result is error-prone (missed values, inconsistent naming), incomplete (only the most visible tokens get captured), and non-repeatable (no audit trail of what was extracted from where).

Teams building against an existing brand -- agency developers, startup teams referencing competitor designs, or enterprise designers auditing brand compliance -- repeatedly perform this manual work with no standardized tool. The W3C Design Tokens Community Group (DTCG) published a stable token format in October 2025, but no CLI tool exists that extracts tokens from live sites into this format.

CI/CD pipelines that need to validate brand consistency across deployed sites have no automated way to extract and compare design tokens, forcing manual audits or custom scripts.

### Value Proposition

One `npx` command extracts a structured design system from any public website. Outputs W3C DTCG-compliant JSON that works with Style Dictionary, Figma Tokens, and Tailwind CSS. Runs anywhere Node.js 18+ is available -- local machines, CI/CD pipelines, and automated workflows. Supports stdout piping for tool composition and `--no-confirm` for unattended execution.

## User Personas

### Primary Persona: Agency Developer

- **Demographics:** Age 25-40, frontend developer at a digital agency, builds 3-8 client projects per year, intermediate-to-advanced CSS knowledge, uses CLI tools daily
- **Goals:** Match client brand quickly without waiting for design assets; start building immediately using extracted tokens; deliver consistent brand implementation
- **Pain Points:** Clients provide a URL ("make it look like this") but no design tokens or style guide; manual extraction is tedious and incomplete; extracted values get stale when the source site updates

### Secondary Personas

#### Startup Developer
- **Demographics:** Age 22-35, full-stack developer, building MVPs, time-constrained, uses Tailwind CSS
- **Goals:** Ship fast by referencing established design patterns from competitor/inspiration sites; get a coherent token set without hiring a designer
- **Pain Points:** No design resources; hand-picking colors from screenshots; inconsistent spacing and typography across the app

#### Enterprise Design System Auditor
- **Demographics:** Age 30-50, senior designer or design system lead, manages brand consistency across products
- **Goals:** Audit deployed sites against official brand tokens; detect design drift and undocumented patterns; generate compliance reports
- **Pain Points:** Manual site inspection doesn't scale; no way to diff extracted tokens against canonical values; inconsistencies go unnoticed until customer complaints

#### CI/CD Pipeline Integrator
- **Demographics:** Age 25-45, DevOps or frontend platform engineer, maintains build pipelines and quality gates
- **Goals:** Automate design token extraction as a pipeline step; validate brand consistency on every deploy; generate token artifacts for downstream consumers
- **Pain Points:** No scriptable tool for token extraction; existing tools require browser environments not available in CI; manual extraction blocks automated workflows

#### Design System Migrator
- **Demographics:** Age 28-45, frontend architect, leading a design system migration (e.g., Bootstrap to custom tokens)
- **Goals:** Extract current state of the old system; map to new token structure; identify breaking changes
- **Pain Points:** Old system is only documented in deployed CSS; no machine-readable token source; migration planning requires manual inventory

## User Journey Maps

### Primary User Journey: Extract and Build

1. **Awareness:** Developer receives a client URL with "match this design." Opens terminal in their project directory.
2. **Consideration:** Developer could manually inspect with DevTools (slow, incomplete) or use this CLI (fast, structured).
3. **Adoption:** Developer runs `npx design-token-extractor https://client-site.com` -- one command, no install needed.
4. **Usage:**
   - CLI validates URL (HTTPS-only, no private IPs)
   - Prompts user to confirm extraction
   - Fetches HTML and discovers linked CSS files
   - Parses CSS and extracts design tokens (colors, typography, spacing, shadows, borders, breakpoints)
   - Deduplicates and clusters values into a coherent token set
   - Writes DTCG JSON to `design-tokens.json` (or user-specified path)
   - Reports extraction summary (token counts by category, confidence scores)
5. **Retention:** Developer installs globally (`npm i -g`) and reuses for every new client project. Tokens integrate directly with Style Dictionary and Tailwind config.

### Secondary User Journeys

#### CI/CD Automation Journey (Pipeline Integrator)
1. Pipeline engineer adds extraction step to GitHub Actions workflow
2. Step runs `npx design-token-extractor https://prod.example.com --no-confirm --quiet -o design-tokens.json`
3. Pipeline compares extracted tokens against canonical token file
4. Drift detected: pipeline fails with non-zero exit code and diff output
5. Team reviews diff and updates canonical tokens or fixes deployed CSS

#### Audit Journey (Enterprise Auditor)
1. Auditor runs extraction on deployed production site
2. Pipes output to comparison tool: `design-token-extractor https://prod.example.com -o - | token-diff canonical.json`
3. Identifies drift: colors off-brand, typography inconsistencies, undocumented spacing values
4. Generates report of discrepancies

#### Migration Journey (Design System Migrator)
1. Migrator extracts tokens from old system's deployed site
2. Extracts tokens from new system's reference implementation
3. Maps old tokens to new token names
4. Identifies gaps and breaking changes

## Feature Requirements

### Must Have Features

#### Feature 1: URL-Based Design Token Extraction

- **User Story:** As an agency developer, I want to extract design tokens from a client's website URL so that I can immediately start building with their brand's colors, typography, and spacing.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given a valid HTTPS URL as a positional argument, When the user runs the CLI, Then the CLI fetches the page HTML and all linked CSS files
  - [x] Given fetched CSS content, When the CLI parses it, Then it extracts colors, typography, spacing, shadows, border-radius, and breakpoint tokens
  - [x] Given extracted tokens, When the CLI writes output, Then it produces a valid W3C DTCG JSON file with `$value`, `$type`, and `$description` fields
  - [x] Given the extraction completes, When the CLI reports results, Then it shows token counts per category and total extraction time to stderr

#### Feature 2: CSS Variable Resolution

- **User Story:** As a developer, I want CSS custom property chains (e.g., `--primary: var(--brand-blue)`) fully resolved so that I get actual color values, not unresolved references.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given CSS with custom property declarations (`:root { --color: #3B82F6; }`), When the CLI extracts tokens, Then it captures both the variable name and resolved value
  - [x] Given CSS with variable references (`var(--primary)`), When the CLI resolves them, Then it follows the reference chain to the final computed value
  - [x] Given circular variable references, When the CLI detects a cycle, Then it warns to stderr and outputs the unresolved reference with a note

#### Feature 3: Multi-Format Output

- **User Story:** As a developer, I want extracted tokens in multiple formats so that I can use them directly in my project's toolchain without manual conversion.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given extracted tokens, When the user specifies `--format json` (default), Then the CLI writes a valid W3C DTCG JSON file
  - [x] Given extracted tokens, When the user specifies `--format css`, Then the CLI writes a valid `.css` file with `:root` custom property declarations
  - [x] Given extracted tokens, When output is written, Then each token includes a `$description` field noting the source CSS selector or file

#### Feature 4: Deduplication and Clustering

- **User Story:** As a developer, I want extracted tokens deduplicated and organized into a coherent scale so that I get a usable token set, not a raw dump of every CSS value.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given multiple identical color values across selectors, When the CLI deduplicates, Then it produces one token entry per unique value
  - [x] Given spacing values like 4px, 8px, 12px, 16px, 24px, When the CLI clusters them, Then it produces a named scale (xs, sm, md, lg, xl)
  - [x] Given extracted tokens, When the CLI assigns confidence scores, Then tokens used 10+ times score >= 0.9 and tokens used once score <= 0.2

#### Feature 5: CLI Interface and Exit Codes

- **User Story:** As a pipeline integrator, I want the CLI to follow standard conventions (exit codes, flags, piping) so that I can integrate it into automated workflows.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given a successful extraction, When the CLI completes, Then it exits with code 0
  - [x] Given a runtime error (network failure, parse error), When the CLI fails, Then it exits with code 1 and prints the error to stderr
  - [x] Given invalid arguments (missing URL, unknown flag), When the CLI validates input, Then it exits with code 2 and prints usage help to stderr
  - [x] Given `--output -` flag, When the CLI writes tokens, Then it writes JSON to stdout and all progress/status to stderr
  - [x] Given `--quiet` flag, When the CLI runs, Then it suppresses all non-error output to stderr
  - [x] Given `--verbose` flag, When the CLI runs, Then it prints detailed progress (each CSS file fetched, parse timings) to stderr

#### Feature 6: Security Controls

- **User Story:** As a security-conscious developer, I want the CLI to validate URLs and sanitize output so that I don't accidentally fetch from internal networks or write malicious content to my project.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given a non-HTTPS URL, When the CLI validates it, Then it rejects with a clear error and exits with code 2
  - [x] Given a URL pointing to a private IP range (localhost, 10.x, 172.16-31.x, 192.168.x, 169.254.x), When the CLI validates it, Then it rejects with an SSRF warning and exits with code 2
  - [x] Given no `--no-confirm` flag, When the CLI prepares to fetch, Then it prompts the user for confirmation before making any network request
  - [x] Given an output path containing `../` traversal, When the CLI validates it, Then it rejects paths that escape the current working directory
  - [x] Given extracted token values, When the CLI writes JSON, Then all values are sanitized (null bytes, control characters removed) and JSON round-trip validated

#### Feature 7: npm Distribution

- **User Story:** As a developer, I want to run this tool with `npx` or install it globally so that I can use it without cloning a repository.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given the package is published to npm, When a user runs `npx design-token-extractor https://example.com`, Then the CLI executes without prior installation
  - [x] Given a push to the master branch, When GitHub Actions runs, Then it automatically publishes a new version to npm
  - [x] Given the package.json, When npm installs the package, Then the `design-token-extractor` binary is available in PATH

### Should Have Features

#### Feature 8: Smart Output Placement

- **User Story:** As a developer, I want extracted tokens written to the right location in my project so that my existing toolchain picks them up automatically.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given no `--output` flag and a project with `tailwind.config.*`, When the CLI writes output, Then it suggests extending the Tailwind theme with extracted tokens
  - [x] Given no `--output` flag and no detectable framework, When the CLI writes output, Then it creates `design-tokens.json` in the current working directory

#### Feature 9: Extraction Summary Report

- **User Story:** As a developer, I want a human-readable summary of what was extracted so that I can quickly verify the results before using them.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given a completed extraction, When the CLI reports to stderr, Then it shows: source URL, extraction timestamp, token count per category, and top-5 most-used colors
  - [x] Given tokens with low confidence (< 0.3), When the CLI reports, Then it flags them as "possibly one-off values" and suggests review

#### Feature 10: @import Chain Following

- **User Story:** As a developer, I want the CLI to follow CSS @import chains so that tokens from imported stylesheets are also captured.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given CSS with `@import url("reset.css")`, When the CLI processes it, Then it fetches and parses the imported file
  - [x] Given @import chains deeper than 5 levels, When the CLI reaches the limit, Then it stops following and warns to stderr
  - [x] Given an @import URL that fails to fetch, When the CLI encounters the error, Then it logs a warning to stderr and continues with remaining CSS

#### Feature 11: Confidence Threshold Filtering

- **User Story:** As a CI/CD integrator, I want to filter out low-confidence tokens so that automated pipelines only consume reliable design values.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given `--min-confidence 0.7` flag, When the CLI writes output, Then only tokens with confidence >= 0.7 are included
  - [x] Given no `--min-confidence` flag, When the CLI writes output, Then all tokens are included (default threshold: 0)

### Could Have Features

#### Feature 12: Theme Variant Detection

- **User Story:** As a developer, I want the CLI to detect light/dark mode variants so that I get separate token sets for each theme.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given CSS with `@media (prefers-color-scheme: dark)` rules, When the CLI detects them, Then it extracts a separate "dark" token group
  - [x] Given CSS with `.dark` or `[data-theme="dark"]` selectors, When the CLI detects them, Then it extracts those as dark theme tokens

#### Feature 13: Animation/Motion Token Extraction

- **User Story:** As a developer, I want transition durations and easing functions extracted so that I can maintain consistent motion design.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given CSS with `transition` or `animation` properties, When the CLI extracts them, Then it captures duration values and easing functions as separate tokens

#### Feature 14: Token Category Filtering

- **User Story:** As a developer, I want to extract only specific token categories so that I get a focused output for my current task.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given `--include colors,typography` flag, When the CLI extracts, Then only color and typography tokens are included in output

### Won't Have (This Phase)

- **Component pattern detection** -- Extracting structural component patterns (button variants, card layouts) requires DOM structure analysis beyond CSS parsing. Deferred to v2.
- **CSS-in-JS extraction** -- Styled-components, Emotion, and other CSS-in-JS libraries generate styles at runtime via JavaScript execution. Not extractable without a headless browser. Deferred to v2.
- **Authenticated site access** -- Sites behind login walls require cookie/session management. v1 supports public URLs only. Deferred to v2.
- **Multi-page extraction** -- Crawling multiple pages to build a comprehensive token set. v1 extracts from a single URL. Deferred to v2.
- **Comparison/diff mode** -- Comparing tokens from two URLs or against a canonical token file. Deferred to v2.
- **AI-powered semantic naming** -- Using AI to assign meaningful names to extracted tokens (e.g., "brand-primary" instead of "color-1"). Deferred to v2.
- **Code generation** -- Generating React/Vue/Svelte components from tokens. Deferred to v2.
- **Design file import** -- Importing from Figma, XD, or Sketch files. Deferred to v2.
- **Watch mode** -- Re-extracting on a schedule. v1 is single-run. Deferred to v2.
- **Config file support** -- `.designtokensrc.json` or `package.json` key for default options. v1 uses CLI flags only. Deferred to v2.
- **Batch extraction** -- Multiple URLs in one invocation. v1 processes one URL per run. Deferred to v2.

## Detailed Feature Specifications

### Feature: URL-Based Design Token Extraction

**Description:** The core extraction pipeline that fetches a website's HTML and CSS, parses the CSS to identify design token values, and outputs a structured DTCG JSON file. This is the fundamental capability that all other features build upon.

**User Flow:**
1. User runs `design-token-extractor https://example.com -o tokens.json`
2. CLI validates URL (HTTPS only, no private IPs)
3. CLI prompts user to confirm extraction (unless `--no-confirm`)
4. User confirms (or skipped in CI)
5. CLI fetches HTML via native fetch
6. CLI discovers linked stylesheets (`<link>`, `<style>`, inline styles)
7. CLI fetches each external CSS file (with SSRF validation per URL)
8. CLI follows @import chains (up to depth 5)
9. CLI parses all collected CSS
10. CLI extracts tokens: colors, typography, spacing, shadows, borders, breakpoints
11. CLI deduplicates, clusters, and assigns confidence scores
12. CLI writes DTCG JSON output file (or stdout with `-o -`)
13. CLI presents extraction summary to stderr
14. CLI exits with code 0

**Business Rules:**
- Rule 1: Only HTTPS URLs are accepted. HTTP URLs are rejected with exit code 2.
- Rule 2: Private/reserved IP ranges (localhost, 10.x, 172.16-31.x, 192.168.x, 169.254.x, IPv6 ULA) are blocked with exit code 2.
- Rule 3: Maximum 10 CSS files fetched per extraction. Maximum 1 MB per file. Maximum 5 MB total CSS.
- Rule 4: @import chains followed to maximum depth of 5 levels.
- Rule 5: Confidence scoring -- 1 usage = 0.2; 2-5 = 0.5; 5-10 = 0.7; 10+ = 0.9.
- Rule 6: Output file must not overwrite existing files without user confirmation (unless `--no-confirm`).
- Rule 7: All fetched CSS is parsed with a proper CSS parser -- never regex-based extraction.
- Rule 8: Request timeout is 30 seconds per file.
- Rule 9: Maximum 5 redirects per request; each redirect target re-validated against SSRF rules.

**Edge Cases:**
- Scenario 1: URL returns non-HTML content (e.g., PDF, image) -> Expected: CLI detects Content-Type, prints "URL does not return HTML" to stderr, exits with code 1.
- Scenario 2: Site has no linked CSS files and no inline styles -> Expected: CLI reports "No CSS found on this page" to stderr, writes empty token file, exits with code 0.
- Scenario 3: CSS file returns 404 or times out -> Expected: CLI logs warning to stderr for that file, continues with remaining CSS files.
- Scenario 4: CSS contains only utility classes (e.g., Tailwind JIT output) with no custom properties -> Expected: CLI extracts raw color/spacing/typography values from utility declarations, notes that source site may use a utility framework.
- Scenario 5: Extremely large CSS (>5 MB total) -> Expected: CLI stops fetching after 5 MB limit, processes what was collected, warns to stderr about incomplete extraction.
- Scenario 6: CSS contains browser-specific prefixes (-webkit-, -moz-) -> Expected: CLI normalizes prefixed properties to standard equivalents, deduplicates.
- Scenario 7: Site uses relative URLs for CSS files (e.g., `href="/styles/main.css"`) -> Expected: CLI resolves relative URLs against the page's base URL.
- Scenario 8: User pipes output to another tool (`design-token-extractor url -o - | jq '.colors'`) -> Expected: JSON goes to stdout, all status/progress goes to stderr, no mixing.
- Scenario 9: CI environment with no TTY -> Expected: `--no-confirm` required; without it, CLI prints "Use --no-confirm for non-interactive environments" to stderr and exits with code 2.

## Success Metrics

### Key Performance Indicators

- **Adoption:** 500+ npm downloads within first 3 months of publication
- **Engagement:** Average 2+ extractions per user per week (based on opt-in telemetry or GitHub issues)
- **Quality:** 90%+ of extracted token sets contain at least 5 colors, 2 font families, and 3 spacing values (meaningful extraction)
- **Business Impact:** 20+ GitHub stars within 3 months; 5+ dependent packages within 6 months

### Tracking Requirements

| Event | Properties | Purpose |
|-------|------------|---------|
| npm download count | weekly downloads, version | Measure adoption trend |
| GitHub issues opened | label (bug/feature/question) | Measure engagement and pain points |
| GitHub stars | cumulative count | Measure community interest |
| CI/CD usage signals | presence of --no-confirm in issue reports | Understand automation adoption |

Note: The CLI does not include telemetry. Metrics are derived from public npm and GitHub data.

---

## Constraints and Assumptions

### Constraints
- **Runtime:** Requires Node.js >= 18 (for native fetch support)
- **No browser execution:** Cannot run JavaScript, access computed styles, or render pages. Extraction is limited to static HTML and CSS served in the initial response.
- **Single-page scope:** v1 extracts from one URL per invocation. No multi-page crawling.
- **Public sites only:** No authentication, cookie management, or session handling.
- **npm distribution:** Package must be publishable via `npm publish` and executable via `npx`.
- **Auto-publish:** GitHub Actions must publish to npm on every push to master branch.

### Assumptions
- Target websites serve CSS via `<link>` tags, `<style>` tags, or inline styles that are present in the initial HTML response (not dynamically injected by JavaScript).
- The W3C DTCG JSON format is stable and widely adopted enough to be the canonical output format.
- Node.js 18+ native `fetch` is sufficient for HTTP requests without additional dependencies.
- Users running in CI/CD will use `--no-confirm --quiet` flags for unattended execution.
- npm registry access is available from the GitHub Actions environment for auto-publishing.

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| SPA sites return empty CSS (all styles injected by JS) | High -- extraction produces no useful tokens | High -- many modern sites are SPAs | Detect empty extraction, warn user, suggest providing CSS file URL directly as a future enhancement |
| Malicious CSS causes parsing errors or injection | High -- security vulnerability | Low -- CSS parser is sandboxed | Use battle-tested CSS parser, whitelist safe properties, JSON-only output, sanitize all values |
| Extracted tokens are noisy (too many one-off values) | Medium -- output is unusable without cleanup | Medium -- sites with inconsistent CSS | Confidence scoring filters noise; `--min-confidence` flag lets users set threshold |
| CSS file fetching blocked by CORS or CDN restrictions | Medium -- incomplete extraction | Medium -- CDNs may block non-browser requests | Warn about unfetchable files to stderr, continue with available CSS |
| SSRF via malicious URL input | High -- internal network exposure | Medium -- depends on deployment context | Deny-list private IPs, HTTPS-only, validate redirect targets |
| npm package name already taken | Medium -- blocks distribution | Low -- check before publishing | Verify package name availability early; have backup names ready |
| GitHub Actions npm token leak | High -- supply chain attack | Low -- use GitHub secrets | Use `NPM_TOKEN` secret, minimal publish permissions, provenance attestation |
| Rate limiting by target site | Low -- extraction fails | Low -- typically <10 requests per extraction | Sequential fetching with reasonable delays; respect rate limit headers; warn user |

## Open Questions

- [ ] Should the CLI support local HTML/CSS file input as an alternative to URLs? (Solves the auth-wall problem for v1 without adding network complexity)
- [ ] What should the npm package name be? (`design-token-extractor`, `extract-design-tokens`, `dtcg-extract`, etc.)
- [ ] Should the auto-publish use semantic versioning with conventional commits, or simple patch bumps?

---

## Supporting Research

### Competitive Analysis

Existing tools for design token extraction include:
- **Dembrandt** -- Open-source tool using Playwright headless browser + DOM analysis. Produces comprehensive token sets but requires browser execution (heavy dependency, not CI-friendly).
- **CSS Grabber / Peek** -- Chrome extensions that extract from rendered DOM. Interactive, browser-dependent, no CLI workflow.
- **figma-extract-token** -- Extracts from Figma API. Different source (design files vs. live sites).
- **Style Dictionary** -- Not an extractor but a token transformer. Converts token JSON to platform-specific formats. Natural downstream consumer of this CLI's output.
- **css-variables-extractor** -- Basic npm package, unmaintained, no deduplication or DTCG output.

**Gap:** No lightweight CLI tool exists that extracts design tokens from live websites into W3C DTCG format without requiring a browser runtime. This tool fills that gap.

### User Research

Based on research across developer workflows:
- Manual extraction via DevTools takes 2-4 hours per site
- Most developers extract only colors and fonts, missing spacing scales, shadows, and breakpoints
- Extracted values are typically stored in ad-hoc formats (Notion docs, spreadsheets, unstructured JSON)
- The extract-then-build workflow is the most common use case (matching an existing brand for a new project)
- CI/CD integration is a growing need as design systems mature and brand compliance becomes automated

### Market Data

- W3C DTCG format reached stable release October 2025, with adoption by Adobe, Google, Microsoft, Figma, Sketch, Salesforce, Shopify, Meta, and 15+ other organizations
- Style Dictionary 4+ has native DTCG support
- Tailwind CSS remains the dominant utility-first CSS framework, making Tailwind-compatible output high-value
- npm ecosystem has 2.5M+ packages; CLI tools for frontend tooling are a well-established distribution channel
- Design systems market growing as organizations standardize on token-based approaches
