// T7.4 — Markdown formatter with swatches.
//
// Renders a TokenSet as human-readable Markdown documentation for PRD Story 7
// (docs generation). Flat categories become `## <Category>` sections with a
// table of tokens; typography/motion are nested with `### <Subcategory>`
// sub-sections. Color tokens get an inline HTML swatch next to the name.
//
// Empty categories (and empty sub-categories) are omitted entirely so the
// output only shows what was actually extracted.

import type {
  SubcategoryCollection,
  Token,
  TokenCollection,
  TokenSet,
} from '../types.ts';

type FlatCategoryKey =
  | 'color'
  | 'spacing'
  | 'radius'
  | 'shadow'
  | 'zIndex'
  | 'breakpoint';

type NestedCategoryKey = 'typography' | 'motion';

const FLAT_CATEGORIES: ReadonlyArray<FlatCategoryKey> = [
  'color',
  'spacing',
  'radius',
  'shadow',
  'zIndex',
  'breakpoint',
];

const NESTED_CATEGORIES: ReadonlyArray<NestedCategoryKey> = [
  'typography',
  'motion',
];

/**
 * Public entry point — renders a TokenSet as Markdown.
 */
export function formatMarkdown(tokenSet: TokenSet): string {
  const sections: string[] = [];
  sections.push(renderIntro(tokenSet));

  for (const key of FLAT_CATEGORIES) {
    const section = renderFlatSection(key, tokenSet[key]);
    if (section !== null) {
      sections.push(section);
    }
  }

  for (const key of NESTED_CATEGORIES) {
    const section = renderNestedSection(key, tokenSet[key]);
    if (section !== null) {
      sections.push(section);
    }
  }

  return sections.join('\n') + '\n';
}

function renderIntro(tokenSet: TokenSet): string {
  const { extractedAt } = tokenSet.$metadata;
  return `# Design Tokens\n\nExtracted at ${extractedAt}.\n`;
}

function renderFlatSection(key: FlatCategoryKey, tokens: TokenCollection): string | null {
  const entries = Object.entries(tokens);
  if (entries.length === 0) {
    return null;
  }
  const heading = `## ${capitalize(key)}`;
  const table = key === 'color' ? renderColorTable(entries) : renderPlainTable(entries);
  return `${heading}\n\n${table}`;
}

function renderNestedSection(
  key: NestedCategoryKey,
  subcategories: SubcategoryCollection,
): string | null {
  const nonEmptySubcategories = Object.entries(subcategories).filter(
    ([, collection]) => Object.keys(collection).length > 0,
  );
  if (nonEmptySubcategories.length === 0) {
    return null;
  }

  const parts: string[] = [`## ${capitalize(key)}`, ''];
  for (const [subKey, collection] of nonEmptySubcategories) {
    const entries = Object.entries(collection);
    parts.push(`### ${capitalize(subKey)}`);
    parts.push('');
    parts.push(renderPlainTable(entries));
    parts.push('');
  }
  // Trim the trailing empty string so joining doesn't produce a double blank line
  while (parts.length > 0 && parts[parts.length - 1] === '') {
    parts.pop();
  }
  return parts.join('\n') + '\n';
}

function renderColorTable(entries: ReadonlyArray<[string, Token]>): string {
  const header = '| Name | Swatch | Value | Count | Confidence |';
  const separator = '| --- | --- | --- | --- | --- |';
  const rows = entries.map(([name, token]) => {
    const value = formatValue(token.$value);
    const swatch = renderSwatch(value);
    const count = token.$extensions['com.dte.usage'].count;
    const confidence = token.$extensions['com.dte.confidence'];
    return `| ${escapeMdCell(name)} | ${swatch} | ${escapeMdCell(value)} | ${count} | ${confidence} |`;
  });
  return [header, separator, ...rows].join('\n') + '\n';
}

function renderPlainTable(entries: ReadonlyArray<[string, Token]>): string {
  const header = '| Name | Value | Count | Confidence |';
  const separator = '| --- | --- | --- | --- |';
  const rows = entries.map(([name, token]) => {
    const value = formatValue(token.$value);
    const count = token.$extensions['com.dte.usage'].count;
    const confidence = token.$extensions['com.dte.confidence'];
    return `| ${escapeMdCell(name)} | ${escapeMdCell(value)} | ${count} | ${confidence} |`;
  });
  return [header, separator, ...rows].join('\n') + '\n';
}

function renderSwatch(value: string): string {
  // HTML-escape to neutralize attacker-controlled CSS values that could
  // break out of the style attribute into arbitrary HTML when the Markdown
  // output is rendered (GitHub, VSCode, etc.).
  return `<span style="display:inline-block;width:16px;height:16px;background:${escapeHtml(value)};border:1px solid #ccc;"></span>`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeMdCell(input: string): string {
  return input.replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatValue(value: Token['$value']): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return JSON.stringify(value);
}

function capitalize(input: string): string {
  if (input.length === 0) {
    return input;
  }
  return input.charAt(0).toUpperCase() + input.slice(1);
}
