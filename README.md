# ai.to.interface-design

A Claude Code marketplace plugin that generates multiple structurally distinct UI component prototypes with an in-browser variant picker.

## Install

```bash
claude plugin add --marketplace github:I2olanD/ai.to.interface-design
```

## Usage

```
/prototype "hero section"
/prototype "pricing table" --variants 6 --style minimalist
/prototype "testimonial cards" --framework tailwind
```

### Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `[description]` | Component to prototype (e.g., "hero section") | required |
| `--variants N` | Number of variants to generate (2–9) | 4 |
| `--style [direction]` | Style constraint (minimalist, bold, corporate, playful) | — |
| `--framework [name]` | Force a CSS framework (tailwind, plain-css) | auto-detected |

### What it does

1. Scans your project for framework and design language (Next.js, React, Vue, Svelte, Astro, Tailwind, etc.)
2. Generates N structurally distinct variants — different layouts, not just color swaps
3. Copies the variant picker script into your project
4. Opens in your browser with a floating toolbar to flip through variants

### After generation

Pick a variant, then choose:

- **Refine** — iterate on the chosen variant while keeping all others for comparison
- **Finalize** — extract only the chosen variant as a clean, production-ready component

## Requirements

- [Claude Code](https://claude.com/claude-code) CLI

## License

MIT
