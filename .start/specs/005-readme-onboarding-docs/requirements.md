---
title: "README Onboarding Documentation"
status: draft
version: "1.0"
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
- [x] Context to Problem to Solution flow makes sense
- [x] Every persona has at least one user journey
- [x] All MoSCoW categories addressed (Must/Should/Could/Won't)
- [x] No technical implementation details included
- [x] A new team member could understand this PRD
- [x] MECE: Personas, Journeys, Features, Acceptance Criteria

---

## Product Overview

### Vision
A newcomer landing on the `ai.to.prototype` README can go from "never heard of it" to a successful first token extraction in under a minute, and can self-serve past the common first-run failures without opening an issue.

### Problem Statement
The current README documents the toolkit but does not optimize for first-time onboarding.
A new user cannot answer five practical questions quickly:
1. What is the single fastest path to a working result?
2. What does the tool actually produce before I install it?
3. Where does this fit in my real workflow?
4. My first run failed, now what?
5. Is this project alive, and where is it going?

The consequences are avoidable drop-off at install time, avoidable support questions for known failure modes (missing Chromium binary, timeouts, private-host blocks), and lower contributor confidence without a visible direction.

### Value Proposition
The five additions turn the README from a reference document into an onboarding funnel.
Every claim is grounded in the real CLI surface, real output shape, real exit-code contract, and real deferred-to-v2 work already present in the codebase, so the docs stay accurate and do not overpromise.

## User Personas

### Primary Persona: The Evaluating Developer
- **Demographics:** Frontend or full-stack developer, comfortable with a terminal and npm, evaluating the tool in a few minutes.
- **Goals:** Confirm the tool does what they need and get a working extraction fast.
- **Pain Points:** Does not want to read the whole README or install a 200 MB browser binary before seeing whether the output is useful.

### Secondary Personas
- **The Blocked First-Run User:** Already installed, hit an error (missing Chromium, timeout, blocked host, bad output path), needs a fix without filing an issue.
- **The Prospective Contributor:** Wants to know the project is active and where help is most valuable before investing.

### MECE Check: Personas
- [x] Each persona has distinct goals and pain points (evaluate vs. unblock vs. contribute).
- [x] All user types who read the README for onboarding are represented.

## User Journey Maps

### Primary User Journey: First Extraction in 60 Seconds
1. **Awareness:** User finds the repo or npm package.
2. **Consideration:** User skims Example Outputs to see the token JSON shape before committing.
3. **Adoption:** User runs the two-line install and one example command from Quick Start.
4. **Usage:** User sees `✔ Done` and a valid `tokens.json`.
5. **Retention:** User reads Real World Use Cases and sees how extraction feeds `/prototype`.

### Secondary User Journeys
- **Unblock Journey:** First run fails, user matches the symptom in Troubleshooting, applies the fix, succeeds.
- **Contributor Journey:** User reads the Roadmap, picks a v2 item, and knows where to contribute.

### MECE Check: Journeys
- [x] Each journey is a distinct path (succeed fast / recover from failure / decide to contribute).
- [x] Happy path and error-recovery path are both mapped.
- [x] Every persona has at least one journey.

## Feature Requirements

Each "feature" below is a README section to add. Acceptance criteria are testable against the rendered README content.

### Must Have Features

#### Feature 1: 60-Second Quick Start
- **User Story:** As an evaluating developer, I want a minimal install-and-run block so that I get a working extraction immediately without reading the full docs.
- **Acceptance Criteria:**
  - [ ] Given a new user reads Quick Start, When they follow it top to bottom, Then it shows exactly the install step `npm i -g @ai.to.design/design-token-extractor` and the browser step `npx playwright install chromium`.
  - [ ] Given the install steps, When the user runs the one example command, Then the documented command is `design-token-extractor extract https://example.com --out tokens.json`.
  - [ ] Given a successful run, When the user looks at "expected output", Then the README shows the terminal success signal (`✔ Done`) and that `tokens.json` is written.
  - [ ] Given the Node requirement, When the user checks prerequisites, Then Node >= 18 is stated.
  - [ ] Given the section title, When measured, Then the whole Quick Start is scannable in roughly 60 seconds (install + one command + expected output, no digressions).

#### Feature 2: Example Outputs
- **User Story:** As an evaluating developer, I want to see a real sample of generated tokens so that I can judge usefulness before installing.
- **Acceptance Criteria:**
  - [ ] Given the Example Outputs section, When the user reads it, Then it includes a realistic W3C DTCG JSON snippet with `$schema`, `$metadata`, and at least one `color` and one `typography` token.
  - [ ] Given a shown token, When the user inspects it, Then it displays the `$value` / `$type` / `$extensions` shape including `com.dte.confidence` and `com.dte.usage`.
  - [ ] Given the four output formats, When the user reads the section, Then `json`, `css`, `js`, and `md` are each represented (at minimum named, with json shown as the canonical example).
  - [ ] Given the eight token categories, When the user reads the section, Then the always-present top-level categories are listed (`color`, `typography`, `spacing`, `radius`, `shadow`, `zIndex`, `breakpoint`, `motion`).

#### Feature 3: Real World Use Cases
- **User Story:** As an evaluating developer, I want concrete scenarios so that I understand where this fits in my workflow.
- **Acceptance Criteria:**
  - [ ] Given the Use Cases section, When the user reads it, Then it contains at least three grounded scenarios drawn from actual capability.
  - [ ] Given the scenarios, When the user reads them, Then they include (a) extracting tokens before a design-system migration using `--min-confidence` filtering and (b) matching a reference site's tokens then feeding them into `/prototype`.
  - [ ] Given each scenario, When the user reads it, Then it names the concrete command(s) involved, not just prose.

#### Feature 4: Troubleshooting
- **User Story:** As a blocked first-run user, I want a symptom-to-fix table so that I can self-serve past common errors.
- **Acceptance Criteria:**
  - [ ] Given Troubleshooting, When the user reads it, Then the exit-code contract is stated: `0` success, `1` user error, `2` extraction/network failure, `3` internal error.
  - [ ] Given the most common failure, When the user looks it up, Then "missing Chromium binary" maps to the fix `npx playwright install chromium`.
  - [ ] Given a slow SPA, When extraction times out, Then the docs point to `--timeout <seconds>` (default 60) and/or `--file`.
  - [ ] Given a localhost/internal target, When navigation is refused, Then the docs point to `--allow-private-hosts`.
  - [ ] Given a bot-blocking or auth-walled site, When extraction fails, Then the docs point to saving the page and using `--file`.
  - [ ] Given an output write failure, When it occurs, Then the docs note the parent directory must exist and be writable.

#### Feature 5: Roadmap
- **User Story:** As a prospective contributor, I want to see planned direction so that I know the project is active and where to help.
- **Acceptance Criteria:**
  - [ ] Given the Roadmap, When the user reads it, Then it lists the real deferred-to-v2 items: source-CSS parsing (unlocking `breakpoint` tokens and `var()` chain resolution), `--fast` static-only mode, and `--user-agent` override.
  - [ ] Given the Roadmap, When the user reads it, Then items are described honestly as planned/not-yet-implemented, consistent with the current v1 limitations already documented.
  - [ ] Given a roadmap item, When a contributor reads it, Then it is specific enough to act on (names the capability, not vague aspiration).

### Should Have Features
- Cross-links between sections (Quick Start links down to Troubleshooting; Use Cases links to the `/prototype` skill).
- A one-line note that both packages publish in lockstep at the same version.

### Could Have Features
- A short animated/gif or screenshot of a run (deferred; text-first is sufficient).
- A comparison line vs. manually reading computed styles.

### Won't Have (This Phase)
- Rewriting existing README sections beyond what is needed to slot the five additions in cleanly.
- New tool features, flags, or code changes. This is documentation only.
- Per-format exhaustive output samples for css/js/md (json is the canonical example; others are named/linked).
- A published external docs site.

### MECE Check: Features
- [x] No two sections cover the same job (start / see output / apply / recover / future).
- [x] All five requested additions are present and each has testable criteria.
- [x] "Won't Have" separates documentation scope from code changes.

## Detailed Feature Specifications

### Feature: Troubleshooting (most complex)
**Description:** A symptom-to-fix reference keyed to the tool's real exit-code contract, so a blocked user maps what they see to a concrete action.

**User Flow:**
1. User runs an extraction and it fails with a nonzero exit and a stderr message.
2. User scans the Troubleshooting table for the matching symptom.
3. User applies the documented fix and re-runs.

**Business Rules:**
- Every documented fix must correspond to a real code path (validated in research), no invented remedies.
- Exit codes documented must match the source contract (0/1/2/3).

**Edge Cases:**
- Symptom overlaps two causes (e.g., timeout could be network or heavy SPA) -> list both likely fixes in priority order.
- Error only reproducible with a browser binary absent -> call out the one-time `npx playwright install chromium` step explicitly, since it is the single most common first-run failure.

## Success Metrics

### Key Performance Indicators
- **Adoption:** A new user can complete a first extraction from Quick Start alone, without other docs.
- **Deflection:** Common first-run failures (missing browser, timeout, private host) each have a self-serve fix in the README.
- **Accuracy:** Zero claims in the new sections contradict the actual CLI surface or exit-code contract.

### Tracking Requirements
Not applicable. This is static repository documentation with no telemetry. Success is verified by review against acceptance criteria, not runtime events.

---

## Constraints and Assumptions

### Constraints
- Documentation only. No code, flags, or behavior changes.
- Must not manually edit auto-generated files (e.g., CHANGELOG). README is hand-maintained and in scope.
- Markdown style: one sentence per physical line, plain dashes only, no em dashes (per repo authoring conventions).
- Must stay consistent with the existing v1 limitations already stated in the package README.

### Assumptions
- The current CLI surface, output shape, and exit-code contract from the research remain accurate at write time (v1.5.1).
- The root README is the right home for these onboarding sections (as opposed to the per-package README).

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Docs drift from CLI as flags evolve | Medium | Medium | Ground every claim in current source; keep examples minimal; note v1 vs v2 explicitly. |
| Roadmap overpromises unbuilt features | Medium | Low | Only list items already present as deferred hooks in code; label as planned. |
| Duplication with per-package README | Low | Medium | Root README focuses on onboarding; link to package README for exhaustive reference. |

## Open Questions
- [ ] Root README vs. package README as the home for these sections. Assumption: root README. Confirm during Solution.

---

## Supporting Research

### Competitive Analysis
Comparable tools (e.g., Project Wallace, CSS analyzers, Style Dictionary as a consumer of tokens) typically show sample output and a quick start prominently. This confirms Example Outputs and Quick Start are table-stakes onboarding sections.

### User Research
Not formally conducted. Requested sections come directly from stakeholder feedback (the five items in the task). Failure modes in Troubleshooting are derived from real error paths in the source, not surveys.

### Market Data
Not applicable for this documentation change.
