# ai.to.prototype

A toolkit for AI-assisted UI design — concept work, design-token extraction, and rapid component prototyping with an in-browser variant picker.

Ships as a Claude Code / OpenCode plugin bundling three skills, plus a standalone CLI for design-token extraction.

## What's in the box

### Skills (plugin)

| Skill | Slash command | What it does |
|-------|---------------|--------------|
| `prototype` | `/prototype` | Generates multiple structurally distinct prototypes of a UI component, wrapped in an in-browser variant picker so you can flip through them. Scans your project to match framework and design language. |
| `extract-tokens` | `/extract-tokens` | Extracts design tokens (colors, typography, spacing, radius, shadow, motion) from any public URL or local HTML file into W3C DTCG JSON, CSS variables, JS, or Markdown. Wraps the `design-token-extractor` CLI under headless Chromium. |
| `application-design-concept` | (auto-invoked) | Develops design concepts, visual identities, and design systems with a real point of view. Moves through brief → position → system → audit → showcase to counter generic AI design output. |

### CLI (`packages/design-token-extractor`)

A standalone Node CLI (`design-token-extractor`) that produces a W3C DTCG-compatible token set from any public website or local HTML file. The `extract-tokens` skill wraps it; you can also use it directly. See [`packages/design-token-extractor/README.md`](packages/design-token-extractor/README.md).

## Install

### Quick Install

```bash
npx skills add I2olanD/ai.to.prototype
```

### Alternative Install

```bash
git clone https://github.com/I2olanD/ai.to.prototype.git
cd ai.to.prototype
./install.sh
```

Auto-detects Claude Code and OpenCode, installs for all found tools.

### Manual Install

#### Claude Code

```bash
claude plugin marketplace add I2olanD/ai.to.prototype
claude plugin install ai-to-prototype@ai-to-prototype
```

#### OpenCode

Copy the skill folders you want from `plugin/skills/` into one of OpenCode's [skill directories](https://opencode.ai/docs/skills/):

**Project-local** (scoped to one project):
```
.opencode/skills/<skill-name>/
```

**Global** (available in all projects):
```
~/.config/opencode/skills/<skill-name>/
```

Each skill folder must contain `SKILL.md`; `prototype` and `application-design-concept` also include a `references/` subfolder that must be copied alongside.

### CLI (standalone)

```bash
npm i -g @ai.to.design/design-token-extractor
npx playwright install chromium
```

The `extract-tokens` skill will fall back to `npx @ai.to.design/design-token-extractor` if the CLI is not installed globally.

## Usage

### `/prototype` — generate UI variants

```
/prototype "hero section"
/prototype "pricing table" --variants 6 --style minimalist
/prototype "testimonial cards" --framework tailwind
```

Flags: `--variants N` (2–9, default 4), `--style <direction>`, `--framework <name>`.

What it does:

1. Scans your project for framework and design language (Next.js, React, Vue, Svelte, Astro, Tailwind, shadcn/ui, MUI, Chakra, etc.)
2. Generates structurally distinct variants — different layouts, not just color swaps
3. Adds a variant picker toolbar so you can flip through them in the browser
4. After you pick a winner, finalizes by extracting just that variant and stripping all picker scaffolding

### `/extract-tokens` — pull a design token set

```
/extract-tokens https://linear.app
/extract-tokens https://stripe.com --format css --out .design-tokens/stripe.css
/extract-tokens --file ./reference.html --theme dark --min-confidence 0.5
```

Flags: `--format json|css|js|md` (default `json`), `--out <path>`, `--min-confidence 0..1`, `--theme auto|light|dark`, `--timeout <seconds>`.

Output covers `color`, `typography`, `spacing`, `radius`, `shadow`, `zIndex`, `breakpoint`, `motion`, each token wrapped in W3C DTCG `$value` / `$type` / `$extensions` envelopes with usage count, confidence score, and detected theme.

### `application-design-concept` — concept and system work

Auto-invoked when you ask for a design concept, visual direction, design system, brand language, mood, aesthetic direction, theme, design tokens, style guide, art direction, or visual identity — anything upstream of writing components.

Walks through five stages: **Brief** (who, what, why, what feeling) → **Position** (one anchor, what we reject) → **System** (typography, color, spacing, motion, voice, components) → **Audit** (anti-slop sweep + human-touch check) → **Showcase** (optional proof artifact). References include an aesthetic-lineages catalog, a concept-brief template, an anti-slop checklist, and a design-system spec template.

### Combined flow

```
/extract-tokens https://linear.app --format css --out .design-tokens/linear.css
/prototype "pricing table" --style "match tokens in .design-tokens/linear.css"
```

## Requirements

- [Claude Code](https://claude.com/claude-code) CLI, or
- [OpenCode](https://opencode.ai)
- Node.js >= 18 (for the `design-token-extractor` CLI used by `/extract-tokens`)

## Security

The `/prototype` variant picker script is loaded from `https://ai-to-design.com/prototype.min.js` with a Subresource Integrity hash. If your project uses a Content Security Policy, add `https://ai-to-design.com` to `script-src` while prototyping. Remove it after finalizing your chosen variant.

See [SECURITY.md](SECURITY.md) for the vulnerability disclosure policy.

## License

MIT
