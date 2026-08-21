# AGENTS.md

Guidance for coding agents working in this repository. `CLAUDE.md` is a symlink to this file.

## Repository shape

Three deliverables, one repo, **one shared version number**:

| Deliverable | Path | Published as |
|---|---|---|
| Claude Code / OpenCode plugin (3 skills) | `plugin/`, `.claude-plugin/marketplace.json` | plugin marketplace |
| Browser variant-picker runtime | `packages/prototype/` | `@ai.to.design/prototype` (npm) + served at `https://ai-to-design.com/prototype.min.js` |
| Design-token extractor CLI | `packages/design-token-extractor/` | `@ai.to.design/design-token-extractor` (npm) |

There is **no root `package.json` and no workspace tooling**. Each package installs and builds on its own (`cd packages/<pkg> && bun install`). Bun is the package manager and script runner (`mise.toml`); Node is still installed there because the published CLI targets it (`prototype` requires Node >= 22, the CLI >= 18) and `npm publish --provenance` runs in CI.

## Commands

```bash
# prototype runtime (packages/prototype)
bun install
bun run test                  # vitest, jsdom, tests colocated as src/*.test.ts
bunx vitest run src/toolbar.test.ts          # single file
bunx vitest run src/toolbar.test.ts -t "..." # single test
bun run lint                  # biome check --error-on-warnings src
bun run typecheck
bun run build                 # vite lib build → dist/prototype.min.js (IIFE)
bun run demo                  # build + open demo/index.html (loads ../dist, not the CDN)

# extractor CLI (packages/design-token-extractor)
bun install
bunx playwright install chromium   # one-time; integration tests need it
bun run test                  # vitest, tests/unit/** + tests/integration/**
bunx vitest run tests/unit/dedup.test.ts
bun run lint                  # eslint src/
bun run build                 # tsup → dist/cli.js (ESM, shebang via banner)
node dist/cli.js extract https://example.com --out /tmp/tokens.json
```

CI (`.github/workflows/release.yml`) gates only on `bun run test` for both packages — lint and typecheck are local-only, so run them yourself before pushing.

## Release: fully automatic on push to `main`

Every non-`[skip ci]` push to `main` runs the release job, which:

1. Derives the next version from conventional-commit subjects since the last tag (`feat:` → minor, `BREAKING CHANGE`/`type!:` → major, else patch).
2. Runs both test suites **before** any bump.
3. Writes that one version into `.claude-plugin/marketplace.json`, `plugin/.claude-plugin/plugin.json`, and both `package.json`s.
4. Rebuilds `packages/prototype/dist/prototype.min.js`, recomputes its `sha384` and `sed`-repins it in `plugin/skills/prototype/SKILL.md` and `plugin/skills/prototype/references/dom-contract-v1.md`.
5. Commits `chore: release vX.Y.Z [skip ci]`, tags, publishes both packages with `npm publish --provenance` (`bun publish` has no provenance flag), cuts a GitHub release.

Consequences: never hand-edit versions or SRI hashes (CI owns them), commit subjects decide the bump, and both packages always ship in lockstep even if only one changed.

## The two contracts that couple plugin ↔ runtime

**1. `data-aitd-*` DOM contract.** The `prototype` skill emits markup; the runtime discovers it. Both sides are documented in `plugin/skills/prototype/references/dom-contract-v1.md`. Changing an attribute name means editing that reference, `SKILL.md`, and `packages/prototype/src/{discovery,types}.ts` together.

**2. SRI hash.** The skill tells users to load the runtime from the CDN with a pinned `sha384-…`. Any byte change to `packages/prototype/src/**` invalidates the hashes checked into the skill docs until the release job re-pins them. The hash appears in two files — they must stay identical.

## `packages/prototype` — runtime internals

`prototype.ts` is the IIFE entry: `discovery` (parse `[data-aitd-variants]` containers into `VariantGroup`s) → `switcher` (visibility + crossfade, honours `prefers-reduced-motion`) → `toolbar` (injects a **closed** shadow root with inlined CSS, so host page styles cannot leak in and nothing is queryable from outside) → `accessibility` (arrow keys, digits 1–9, `aria-live` announcements).

It initialises on `DOMContentLoaded` *and* keeps a `MutationObserver` on `document.body`, because framework-hydrated variants (Next.js, Vue, Svelte) appear after first paint. Groups with fewer than 2 variants are skipped.

`source-panel.ts` is currently unreferenced — `toolbar.ts` renders no `.source-btn`, so `createSourcePanel` never runs.

## `packages/design-token-extractor` — pipeline internals

`cli.ts` is a thin commander shell (flag coercion → zod validation → run → confidence filter → format → `writeAtomic`). `extract.ts` is the orchestrator:

```
sources/{url,file} → render/playwright (per theme) → categorize/* (per theme slice)
  → dedup → apply-score → name → buildTokenSet
```

Points that are easy to get wrong:

- **Theme handling.** `--theme auto` renders light *and* dark, then drops the dark pass if the two record sets are structurally identical (avoids phantom dark tokens). Records are categorized *per theme slice*, because categorizers group by canonical value and would otherwise collapse a value that exists in both themes into one light-tagged token.
- **Determinism is a requirement.** Token names are `${prefix}-${i+1}` ordered by usage count DESC with a lexicographic tie-break on the stringified value (`name.ts`); `dedup.ts` keys on `type::value::theme` with sorted-key JSON for object values. Same input must always produce the same file.
- **Deliberate v1 drift.** `resolve/css-vars.ts` and `categorize/breakpoint.ts` are implemented, tested, and **not wired in** — the renderer returns computed styles, so `var()` is already resolved and raw `@media` text is unavailable. `TokenSet.breakpoint` is always `{}`. The reasoning is in the `extract.ts` header comment; don't "fix" this by wiring them up without extending the renderer first.
- **`render/extract-in-page.ts` is intentionally duplicated.** Playwright ships `fn.toString()` into the page, so `extractInPageFromGlobals` must be fully self-contained; its property list is a copy of the exported `PROPERTIES`. Change one, change both.
- **Exit codes are part of the API.** `UserError` → 1, `ExtractionError` → 2, `InternalError` → 3 (`errors.ts`). They are documented in the root README, `packages/design-token-extractor/README.md`, and `plugin/skills/extract-tokens/SKILL.md`.
- **Security posture is deliberate — don't relax it.** http/https scheme allowlist, private/loopback/link-local hosts blocked unless `--allow-private-hosts`, URL userinfo stripped from metadata and error messages, `--file` metadata records the basename only (no filesystem layout disclosure), output written via temp-file + `rename`.

## Skills

`plugin/skills/{prototype,extract-tokens,application-design}/SKILL.md`, each with a `references/` folder that must be copied alongside for OpenCode installs. `prototype` and `extract-tokens` are user-invocable slash commands; `application-design-concept` is auto-invoked by description match.

The skills are the product surface: behaviour changes there (flags, defaults, output paths, exit-code tables) must land in the matching README sections too.

## Specs

Design docs live in `.start/specs/NNN-slug/` (`requirements.md`, `solution.md`, `plan/phase-*.md`, plus a `README.md` status/decision log). Source comments reference them directly (e.g. "ADR-4", "spec 001, T6.2") — read the spec before changing scoring, naming, or dedup semantics. `docs/` is gitignored.
