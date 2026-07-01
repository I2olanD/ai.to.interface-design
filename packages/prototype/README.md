# @ai.to.design/prototype

In-browser variant-picker runtime for the [`ai-to-prototype`](https://github.com/I2olanD/ai.to.prototype) Claude Code plugin.

It renders a carousel toolbar that lets you flip through generated UI component variants.
The `prototype` skill injects the built bundle into a page temporarily while you pick variants, then strips it out on cleanup.

## What it is

A single self-contained IIFE (`dist/prototype.min.js`, ~8 KB, no dependencies) that scans the DOM for `data-aitd-*` attributes and mounts a variant picker.

## Contract

The runtime discovers variants via data attributes on the page:

- Container: `data-aitd-variants`
- Per variant: `data-aitd-variant` (1-based index), `data-aitd-label`, optional `data-aitd-description`
- Optional container config: `data-aitd-transition`, `data-aitd-theme`, `data-aitd-position`, `data-aitd-branding`
- Managed at runtime: `data-aitd-active` on the visible variant

See the [DOM contract](https://github.com/I2olanD/ai.to.prototype/blob/main/plugin/skills/prototype/references/dom-contract-v1.md) for the full spec.

## License

MIT
