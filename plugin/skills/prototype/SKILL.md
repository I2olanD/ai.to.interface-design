---
name: prototype
description: Generate multiple visually distinct UI component prototypes with an in-browser variant picker to flip through them. Scans your project's design dependencies to match your design language.
user-invocable: true
argument-hint: "[component description] [--variants N] [--style direction] [--framework name]"
metadata:
  contract-version: "1.0"
  author: ai.to.design
---

# /prototype

Generate multiple visually distinct prototypes of a UI component, wrapped in a variant picker that lets you flip through them in the browser.

## Arguments

- `$ARGUMENTS` — the component description (e.g., "hero section", "pricing table", "testimonial cards")
- `--variants N` — number of variants to generate (default: 4, min: 2, max: 9)
- `--style [direction]` — style constraint (e.g., "minimalist", "bold", "corporate", "playful")
- `--framework [name]` — force a CSS framework (e.g., "tailwind", "plain-css")

## Before Generating

**Scan the project to determine the rendering framework and design language:**

1. Read `package.json` — identify the rendering framework (Next.js, React, Vue, Svelte, Astro, etc.) and UI libraries (shadcn/ui, @radix-ui, @mui/material, @chakra-ui, antd, daisyui, etc.)
2. Check for `tailwind.config.*` — if present, use Tailwind CSS utility classes
3. Look for CSS variables, design tokens, or theme files in `src/` or `styles/`
4. Check for existing component patterns in the project to match naming and structure conventions
5. Identify the project's routing convention (e.g., `app/` for Next.js App Router, `pages/` for Pages Router, `src/routes/` for SvelteKit)

Use what you find. Match the project's framework, styling approach, and component patterns. If you can't determine the stack, fall back to a standalone HTML file with scoped CSS.

## Generation Rules

Generate the requested number of visually distinct prototypes following the [DOM Contract v1](references/dom-contract-v1.md):

1. **Structurally distinct**: Each variant MUST use a fundamentally different layout approach — not just color or typography changes. For example: centered stack, split layout, card grid, full-width hero.

2. **Self-contained**: No shared CSS between variants — follow the [DOM Contract](references/dom-contract-v1.md) scoping and prefix rules.

3. **Descriptive labels**: Each variant gets a `data-aitd-label` with a design-direction name like "Minimal", "Card Grid", "Split Layout".

4. **Responsive**: All variants MUST be mobile-first and responsive unless the user explicitly requests desktop-only.

5. **Consistent content**: Use the same text, images, and data across all variants so comparison is fair.

6. **Production quality**: Every variant should be something a developer could ship. Proper semantic HTML, accessible markup, thoughtful spacing.

## Output Format

Build the prototype **natively in the project's framework**. The variant picker script discovers variants via `data-aitd-*` attributes (see [DOM Contract v1](references/dom-contract-v1.md)) and works in any rendered page.

**CRITICAL — Where to place the prototype:**

- If the user specifies a target (e.g., "put it in the pricing page"), add the variants **to that existing file**. Do NOT create a new page.
- If no target is specified, add the variants to the **homepage / root page** (e.g., `app/page.tsx`, `pages/index.tsx`, `src/routes/+page.svelte`, `index.html`).
- If no framework is detected, create a standalone HTML file (see below).

**CRITICAL — Variant picker script:**

Every prototype MUST include the variant picker script. This is non-negotiable — without it, the toolbar won't appear and the user can't flip through variants.

Add a script tag loading the picker from `https://ai-to-design.com/prototype.min.js` as the LAST element after the variants container:

| Framework        | Script tag                                                        |
| ---------------- | ----------------------------------------------------------------- |
| Next.js          | `<Script src="https://ai-to-design.com/prototype.min.js" strategy="afterInteractive" />` (import from `next/script`) |
| React (Vite/CRA) | `<script src="https://ai-to-design.com/prototype.min.js"></script>` in `index.html`, or use a `useEffect` to inject it |
| Vue/Svelte/Astro | `<script src="https://ai-to-design.com/prototype.min.js"></script>` in the component or page |
| Plain HTML       | `<script src="https://ai-to-design.com/prototype.min.js"></script>` before `</body>` |

### Framework example (Next.js + Tailwind)

```tsx
import Script from "next/script";

export default function PrototypeHeroSection() {
  return (
    <>
      <div data-aitd-variants>
        <div data-aitd-variant="1" data-aitd-label="Minimal">
          {/* variant 1 — native JSX + Tailwind */}
        </div>
        <div data-aitd-variant="2" data-aitd-label="Split Layout">
          {/* variant 2 — native JSX + Tailwind */}
        </div>
      </div>
      <Script src="https://ai-to-design.com/prototype.min.js" strategy="afterInteractive" />
    </>
  );
}
```

### Plain HTML fallback

When no framework is detected, generate a standalone HTML file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{Component Name} Prototype</title>
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
      }
      img {
        display: block;
        max-width: 100%;
      }
    </style>
  </head>
  <body>
    <div data-aitd-variants>
      <!-- variant divs per DOM Contract v1 -->
    </div>

    <script src="https://ai-to-design.com/prototype.min.js"></script>
  </body>
</html>
```

## Save & Preview

Tell the user the file path and how to open it in their browser.

## After Generation

**Before anything else**: verify that the variant picker script tag (`https://ai-to-design.com/prototype.min.js`) is present in the output. If it's missing, fix it immediately. The prototype is broken without it.

Ask the user which variant they prefer. Then offer two options:

1. **Refine** — iterate on the chosen variant in the existing prototype page. Keep the variant picker structure (all variants, `data-aitd-variants` wrapper, and script tag) so the user can still compare.

2. **Finalize** — extract only the chosen variant into a clean, standalone component/page. Remove: the variant picker script tag, all other variants, the `data-aitd-variants` wrapper, and all `data-aitd-*` attributes. The result is a production-ready component with no variant picker dependencies.
