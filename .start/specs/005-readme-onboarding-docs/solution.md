---
title: "README Onboarding Documentation - Solution Design"
status: draft
version: "1.0"
---

# Solution Design Document

## Validation Checklist

- [x] Every requirement maps to a design element
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Placement decision resolved (root README, self-contained + cross-linked)
- [x] Section skeletons defined and content sources identified
- [x] No code changes proposed (documentation only)

---

## Design Overview

### Approach
Edit the single file `README.md` at the repository root.
Insert five new sections and cross-link them.
All content is condensed for a landing-page audience, with links down to `packages/design-token-extractor/README.md` for the exhaustive flag reference.
No code, no new files, no changes to the package README.

### Decision: Documentation Home
Root README, self-contained plus cross-linked (confirmed with stakeholder).
The root README is the page users land on, so onboarding must be complete there.
Example Outputs and Troubleshooting are shown in condensed form with a "full reference" link to the package README to avoid drift and duplication.
This resolves the open question logged in requirements.md.

## Current README Structure (baseline)

The existing root README sections, in order:
1. Title and tagline
2. What's in the box (skills table + CLI blurb)
3. Install (Quick / Alternative / Manual: Claude Code, OpenCode, CLI standalone)
4. Usage (`/prototype`, `/extract-tokens`, `application-design-concept`, combined flow)
5. Requirements
6. Security
7. License

## Target README Structure (after change)

Insertions marked NEW. Existing sections keep their content.

1. Title and tagline
2. **Quick Start** (NEW) - top placement, first actionable block
3. What's in the box
4. Install
5. Usage
6. **Example Outputs** (NEW) - immediately after Usage, "what you get"
7. **Real World Use Cases** (NEW)
8. Requirements
9. **Troubleshooting** (NEW) - follows Requirements, since Node 18 / browser binary tie together
10. **Roadmap** (NEW) - near the end, "where it's going"
11. Security
12. License

Rationale for order: land -> succeed fast (Quick Start) -> understand (What's in the box / Install / Usage) -> see the payoff (Example Outputs) -> map to your work (Use Cases) -> prerequisites (Requirements) -> recover from failure (Troubleshooting) -> future (Roadmap).

## Section Skeletons

Each skeleton lists the heading, the content it must contain (per acceptance criteria), and the research-sourced facts to use.

### 1. Quick Start
```
## Quick Start

Extract design tokens from any site in under a minute.

    # 1. Install (Node >= 18)
    npm i -g @ai.to.design/design-token-extractor
    npx playwright install chromium   # one-time, ~200 MB

    # 2. Run
    design-token-extractor extract https://example.com --out tokens.json

You should see a `Extracting design tokens...` spinner, then `✔ Done`,
and a `tokens.json` file written next to you.

New here? Jump to [Example Outputs](#example-outputs) to see what that file looks like,
or [Troubleshooting](#troubleshooting) if the first run failed.
```
Facts: package name, bin, Node >= 18, two-step install, canonical command, `✔ Done` success signal.

### 2. Example Outputs
```
## Example Outputs

Default output is W3C DTCG JSON. A trimmed example:

    { $schema, $metadata, color: { color-1: { $value, $type, $extensions:
      { com.dte.confidence, com.dte.usage: { selectors, count } } } }, typography, ... }

(show a realistic ~20-line JSON snippet with one color token and one typography token)

Every run emits eight top-level categories (empty ones included):
`color`, `typography`, `spacing`, `radius`, `shadow`, `zIndex`, `breakpoint`, `motion`.

Pick a format with `--format`: `json` (default), `css`, `js`, `md`.
See the [full output reference](packages/design-token-extractor/README.md) for css/js/md samples.
```
Facts: DTCG JSON shape, `$value`/`$type`/`$extensions` with `com.dte.confidence` and `com.dte.usage`, eight categories, four formats. Use the real snippet from the package README / test fixtures, not invented values.

### 3. Real World Use Cases
```
## Real World Use Cases

- Audit before a design-system migration - extract a site's tokens, filter noise with
  `--min-confidence 0.5`, commit the JSON as your baseline.
      design-token-extractor extract https://our-site.com --min-confidence 0.5 --out baseline.json

- Match a reference brand, then prototype - pull a reference site's palette, then hand it to
  `/prototype` so generated variants use that design language.
      design-token-extractor extract https://linear.app --format css --out .design-tokens/linear.css
      /prototype "pricing table" --style "match tokens in .design-tokens/linear.css"

- Extract from an auth-walled or bot-blocking site - save the rendered page, extract from the file.
      design-token-extractor extract --file ./page.html --out tokens.json
```
Facts: at least three grounded scenarios, each with concrete commands (per AC). Migration + `/prototype` handoff are mandatory two.

### 4. Troubleshooting
```
## Troubleshooting

Exit codes: `0` success, `1` user error (bad flag/URL/file), `2` extraction/network failure,
`3` internal error.

| Symptom | Fix |
| --- | --- |
| `Executable doesn't exist` / browser error on first run | Run `npx playwright install chromium` (the most common first-run miss). |
| `Extraction timed out after 60s` | Raise `--timeout 120`, or use `--file` on a saved page. |
| `Refusing to navigate to private host ...` | Add `--allow-private-hosts` for localhost / internal IPs. |
| Site blocks headless browsers / needs login | Save the page and use `--file ./page.html`. |
| `ENOENT` / `EACCES` writing output | Ensure the `--out` parent directory exists and is writable. |
```
Facts: exit-code contract, five real failure->fix rows validated against source.

### 5. Roadmap
```
## Roadmap

Planned for v2 (not yet implemented):

- Source-CSS parsing - resolve `var()` chains and populate `breakpoint` tokens from `@media`
  rules (today the extractor reads computed styles only, so `breakpoint` is empty).
- `--fast` static-only mode - skip the Chromium download for simple static pages
  (the flag is accepted today but warns and falls back to the headless renderer).
- `--user-agent` override - currently reserved and ignored.

Both packages (`design-token-extractor` and `prototype`) release in lockstep at the same version.
```
Facts: only real deferred-to-v2 hooks present in code; labelled as planned; consistent with documented v1 limitations.

## Interfaces (Content Contracts)

- Anchor links use GitHub's auto-generated slugs (`#example-outputs`, `#troubleshooting`).
- Package README link is a relative path: `packages/design-token-extractor/README.md`.
- Code blocks use fenced blocks in the final README (indented here only to nest inside this spec).

## Authoring Constraints (apply during implementation)
- One sentence per physical line.
- Plain dashes only, no em dashes.
- Do not edit CHANGELOG or any auto-generated file.
- Keep the JSON snippet faithful to the real shape; prefer copying from the package README / fixtures.
- Do not restate the full flag list; link to the package README instead.

## Verification Plan
- Manual review against every acceptance criterion in requirements.md.
- Render-check the README (GitHub preview or a markdown linter) to confirm anchors, tables, and fenced code blocks render.
- Confirm the two mandatory use cases (migration filtering, `/prototype` handoff) and all five troubleshooting rows are present.
- Confirm no command or exit code contradicts the current CLI source.

## Non-Goals
- No code, flag, or behavior changes.
- No changes to the package README beyond being the cross-link target (no edits required there).
- No external docs site or media assets.
