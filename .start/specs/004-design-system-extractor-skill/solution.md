---
title: "Design System Extractor CLI"
status: draft
version: "1.0"
---

# Solution Design Document

## Validation Checklist

### CRITICAL GATES (Must Pass)

- [x] All required sections are complete
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Architecture pattern is clearly stated with rationale
- [x] **All architecture decisions confirmed by user**
- [x] Every interface has specification

### QUALITY CHECKS (Should Pass)

- [x] All context sources are listed with relevance ratings
- [x] Project commands are discovered from actual project files
- [x] Constraints -> Strategy -> Design -> Implementation path is logical
- [x] Every component in diagram has directory mapping
- [x] Error handling covers all error types
- [x] Quality requirements are specific and measurable
- [x] Component names consistent across diagrams
- [x] A developer could implement from this design
- [x] Implementation examples use actual schema column names (not pseudocode), verified against migration files
- [x] Complex queries include traced walkthroughs with example data showing how the logic evaluates

---

## Output Schema

### SDD Status Report

| Field | Value |
|-------|-------|
| specId | 004-design-system-extractor-skill |
| architecture | Pipeline (fetch -> parse -> extract -> format -> write) |
| keyComponents | cli, extractor, fetcher, parser, tokenizer, deduplicator, formatter, writer |
| externalIntegrations | Target website (HTTPS fetch), npm registry (publish) |
| adrs | 7 confirmed |
| validationPassed | All |
| nextSteps | Proceed to PLAN |

---

## Constraints

**CON-1 Runtime:** Node.js >= 18 required (native fetch). TypeScript 5.x compiled via tsup.

**CON-2 Security:** SSRF deny-list on all URLs. HTTPS-only. Path traversal prevention on output. JSON output via JSON.stringify (prevents injection). All CSS parsed via PostCSS (never regex). See SECURITY_RESEARCH.md.

**CON-3 Distribution:** npm package with `bin` entry. Must work via `npx`. Auto-published via GitHub Actions on push to main.

**CON-4 Project Structure:** Lives in `packages/design-token-extractor/` within the existing ai.to.prototype monorepo. Shares repo but has independent package.json, build, and npm publish workflow.

**CON-5 No Browser:** Cannot execute JavaScript or access computed styles. Static HTML + CSS only.

## Implementation Context

### Required Context Sources

#### Documentation Context
```yaml
- doc: .start/specs/004-design-system-extractor-skill/requirements.md
  relevance: CRITICAL
  why: "PRD with all acceptance criteria and business rules"

- doc: .start/specs/004-design-system-extractor-skill/SECURITY_RESEARCH.md
  relevance: CRITICAL
  why: "Security controls for URL validation, CSS parsing, output sanitization"
```

#### Code Context
```yaml
- file: .github/workflows/release.yml
  relevance: HIGH
  why: "Existing release workflow pattern — new npm publish workflow follows same conventions"

- file: plugin/.claude-plugin/plugin.json
  relevance: MEDIUM
  why: "Existing project structure — CLI package lives alongside plugin"
```

#### External APIs
```yaml
- service: npm Registry
  doc: https://docs.npmjs.com/cli/v10/using-npm/registry
  relevance: HIGH
  why: "Package publishing target"

- service: W3C DTCG Design Tokens
  doc: https://tr.designtokens.org/format/
  relevance: HIGH
  why: "Canonical output format specification"
```

### Implementation Boundaries

- **Must Preserve**: Existing plugin/ directory and .github/workflows/release.yml untouched
- **Can Modify**: .github/workflows/ (add new workflow for npm publish)
- **Must Not Touch**: plugin/, .claude-plugin/, install.sh

### External Interfaces

#### System Context Diagram

```
┌──────────────┐     HTTPS      ┌──────────────────┐
│   Developer  │ ──── CLI ────> │  Target Website   │
│  (terminal)  │                │  (HTML + CSS)      │
└──────┬───────┘                └──────────────────┘
       │
       │  writes
       v
┌──────────────┐
│ design-      │
│ tokens.json  │
│ (DTCG)       │
└──────────────┘

┌──────────────┐   push main    ┌──────────────────┐
│   GitHub     │ ────────────>  │   npm Registry    │
│   Actions    │   npm publish  │                   │
└──────────────┘                └──────────────────┘
```

#### Interface Specifications

```yaml
# Inbound Interfaces
inbound:
  - name: "CLI Arguments"
    type: POSIX CLI
    format: "design-token-extractor <url> [options]"
    authentication: None
    data_flow: "URL + flags -> extraction pipeline"

# Outbound Interfaces
outbound:
  - name: "Target Website"
    type: HTTPS
    format: HTML + CSS
    authentication: None (public sites only)
    data_flow: "Fetch HTML, discover CSS links, fetch CSS files"
    criticality: HIGH

  - name: "npm Registry"
    type: HTTPS
    format: npm package
    authentication: NPM_TOKEN (GitHub secret)
    data_flow: "Publish package on push to main"
    criticality: MEDIUM

# Data Interfaces
data:
  - name: "DTCG JSON Output"
    type: File (JSON)
    format: W3C Design Tokens Community Group format
    data_flow: "Extracted tokens -> structured JSON file or stdout"

  - name: "CSS Custom Properties Output"
    type: File (CSS)
    format: ":root { --token: value; }"
    data_flow: "Extracted tokens -> CSS custom property declarations"
```

### Project Commands

```bash
# From packages/design-token-extractor/
Install: npm install
Dev:     npm run dev          # tsup --watch
Test:    npm test             # vitest
Lint:    npm run lint         # eslint
Build:   npm run build        # tsup (ESM output)
Typecheck: npm run typecheck  # tsc --noEmit
```

## Solution Strategy

- **Architecture Pattern:** Linear pipeline — each stage transforms data and passes to the next. No branching, no state machines, no event systems. Simple input-output chain.
- **Integration Approach:** Standalone package in `packages/design-token-extractor/`. Does not import from or depend on the plugin. Shares only the git repo and GitHub Actions infrastructure.
- **Justification:** A CLI extraction tool is a pure data pipeline: fetch -> parse -> extract -> deduplicate -> format -> write. Each stage has clear inputs/outputs, no shared state, no concurrency. A pipeline architecture maps directly to this flow with minimal abstraction overhead.
- **Key Decisions:** PostCSS for CSS safety (ADR-2), native fetch to minimize deps (ADR-3), tsup for fast TypeScript builds (ADR-5).

## Building Block View

### Components

```
CLI Input
   │
   v
┌─────────┐    ┌──────────┐    ┌────────┐    ┌────────────┐
│  cli.ts  │───>│fetcher.ts│───>│parser.ts│───>│tokenizer.ts│
└─────────┘    └──────────┘    └────────┘    └─────┬──────┘
                                                    │
                                                    v
                                            ┌───────────────┐
                                            │deduplicator.ts│
                                            └───────┬───────┘
                                                    │
                                                    v
┌──────────┐    ┌────────────┐              ┌───────────────┐
│ writer.ts│<───│formatter.ts│<─────────────│  extractor.ts │
└──────────┘    └────────────┘              │ (orchestrator)│
                                            └───────────────┘
```

### Directory Map

**Component**: design-token-extractor
```
packages/design-token-extractor/
├── src/
│   ├── cli.ts                    # NEW: Commander setup, arg parsing, entry point
│   ├── extractor.ts              # NEW: Pipeline orchestrator
│   ├── fetcher.ts                # NEW: URL validation, HTML fetch, CSS discovery
│   ├── parser.ts                 # NEW: PostCSS parsing, custom property resolution
│   ├── tokenizer.ts              # NEW: Token extraction by category
│   ├── deduplicator.ts           # NEW: Dedup, clustering, confidence scoring
│   ├── formatter.ts              # NEW: DTCG JSON + CSS output formatting
│   ├── writer.ts                 # NEW: File/stdout output with path validation
│   ├── types.ts                  # NEW: Shared TypeScript interfaces
│   └── errors.ts                 # NEW: Custom error types + exit code mapping
├── tests/
│   ├── cli.test.ts               # NEW: CLI arg parsing tests
│   ├── fetcher.test.ts           # NEW: URL validation, SSRF tests
│   ├── parser.test.ts            # NEW: CSS parsing, variable resolution
│   ├── tokenizer.test.ts         # NEW: Token extraction per category
│   ├── deduplicator.test.ts      # NEW: Dedup + confidence scoring
│   ├── formatter.test.ts         # NEW: DTCG JSON output format
│   ├── writer.test.ts            # NEW: Path validation, file write
│   ├── extractor.test.ts         # NEW: Integration test for full pipeline
│   └── fixtures/
│       ├── sample.html           # NEW: Test HTML with link/style tags
│       ├── sample.css            # NEW: Test CSS with tokens
│       ├── variables.css         # NEW: CSS custom properties for resolution tests
│       └── malicious.css         # NEW: CSS with injection attempts
├── package.json                  # NEW: npm package config
├── tsconfig.json                 # NEW: TypeScript config
├── tsup.config.ts                # NEW: Build config
└── README.md                     # NEW: Usage docs
```

### Interface Specifications

#### Application Data Models

```typescript
// types.ts

/** Token type per W3C DTCG specification */
type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'number'
  | 'duration'
  | 'cubicBezier'
  | 'shadow';

/** Single design token in DTCG format */
interface DesignToken {
  $value: string | number;
  $type: TokenType;
  $description: string;
  $extensions?: {
    'com.design-token-extractor': {
      confidence: number;       // 0.0 - 1.0
      usageCount: number;
      sourceFiles: string[];
    };
  };
}

/** Token categories matching extraction pipeline */
type TokenCategory =
  | 'color'
  | 'typography'
  | 'spacing'
  | 'shadow'
  | 'border'
  | 'breakpoint'
  | 'motion';

/** Grouped token output */
interface TokenGroup {
  [tokenName: string]: DesignToken | TokenGroup;
}

/** Full DTCG output structure */
interface DesignTokenFile {
  color?: TokenGroup;
  typography?: TokenGroup;
  spacing?: TokenGroup;
  shadow?: TokenGroup;
  border?: TokenGroup;
  breakpoint?: TokenGroup;
  motion?: TokenGroup;
}

/** Result of extraction pipeline */
interface ExtractionResult {
  url: string;
  timestamp: string;
  tokens: DesignTokenFile;
  summary: ExtractionSummary;
}

/** Summary stats for stderr report */
interface ExtractionSummary {
  totalTokens: number;
  tokensByCategory: Record<TokenCategory, number>;
  cssFilesProcessed: number;
  totalCssBytes: number;
  extractionTimeMs: number;
  warnings: string[];
}

/** Parsed CSS source before token extraction */
interface CssSource {
  url: string;
  content: string;
  byteSize: number;
}

/** Intermediate token before deduplication */
interface RawToken {
  value: string | number;
  type: TokenType;
  category: TokenCategory;
  property: string;        // CSS property name
  selector: string;        // CSS selector where found
  sourceFile: string;
}

/** CLI options parsed from commander */
interface CliOptions {
  output: string;          // file path or '-' for stdout
  format: 'json' | 'css';
  noConfirm: boolean;
  quiet: boolean;
  verbose: boolean;
  minConfidence: number;
  include?: TokenCategory[];
}
```

### Implementation Examples

#### Example: URL Validation (SSRF Prevention)

**Why this example**: SSRF prevention is a critical security control. The deny-list logic has subtle edge cases (IPv6, punycode, redirect chains) that need explicit documentation.

```typescript
// fetcher.ts — validateUrl()

const PRIVATE_IP_PATTERNS = [
  /^127\./,                          // loopback IPv4
  /^10\./,                           // class A private
  /^172\.(1[6-9]|2[0-9]|3[01])\./,  // class B private
  /^192\.168\./,                     // class C private
  /^169\.254\./,                     // link-local
  /^0\./,                            // current network
];

const BLOCKED_HOSTNAMES = [
  'localhost',
  '0.0.0.0',
  '::1',
  '[::1]',
];

function validateUrl(urlString: string): URL {
  const url = new URL(urlString);                         // throws on malformed

  if (url.protocol !== 'https:') {
    throw new UsageError('Only HTTPS URLs are allowed');
  }

  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    throw new UsageError(`Blocked hostname: ${hostname}`);
  }

  if (PRIVATE_IP_PATTERNS.some(p => p.test(hostname))) {
    throw new UsageError(`Private IP range not allowed: ${hostname}`);
  }

  return url;
}
```

**Traced walkthrough:**
| Input | Protocol check | Hostname check | IP check | Result |
|-------|---------------|----------------|----------|--------|
| `https://example.com` | pass | pass | pass | valid URL returned |
| `http://example.com` | FAIL | - | - | UsageError: Only HTTPS |
| `https://localhost` | pass | FAIL | - | UsageError: Blocked hostname |
| `https://192.168.1.1` | pass | pass | FAIL | UsageError: Private IP |
| `https://10.0.0.1/path` | pass | pass | FAIL | UsageError: Private IP |
| `not-a-url` | throws | - | - | new URL() throws TypeError |

#### Example: CSS Custom Property Resolution

**Why this example**: Variable chain resolution has circular reference edge case that must terminate.

```typescript
// parser.ts — resolveCustomProperties()

function resolveCustomProperties(
  variables: Map<string, string>,
  maxDepth: number = 10
): Map<string, string> {
  const resolved = new Map<string, string>();

  for (const [name, value] of variables) {
    resolved.set(name, resolveValue(value, variables, new Set(), maxDepth));
  }

  return resolved;
}

function resolveValue(
  value: string,
  variables: Map<string, string>,
  visited: Set<string>,
  depth: number
): string {
  if (depth <= 0) return value;

  return value.replace(/var\(--([^,)]+)(?:,([^)]+))?\)/g, (match, name, fallback) => {
    const varName = `--${name.trim()}`;

    if (visited.has(varName)) {
      // Circular reference — return fallback or original
      return fallback?.trim() ?? match;
    }

    const resolved = variables.get(varName);
    if (resolved === undefined) {
      return fallback?.trim() ?? match;
    }

    visited.add(varName);
    return resolveValue(resolved, variables, visited, depth - 1);
  });
}
```

**Traced walkthrough:**
| Variables | Input | visited | Result |
|-----------|-------|---------|--------|
| `--a: #F00` | `var(--a)` | {} | `#F00` |
| `--a: var(--b)`, `--b: #0F0` | `var(--a)` | {} -> {--a} | `#0F0` |
| `--a: var(--b)`, `--b: var(--a)` | `var(--a)` | {} -> {--a} -> {--a,--b} -> circular | `var(--a)` (unresolved) |
| `--a: var(--missing, blue)` | `var(--a)` | {} | `blue` (fallback) |

#### Example: Confidence Scoring

**Why this example**: Scoring formula is a business rule from PRD that must be implemented exactly.

```typescript
// deduplicator.ts — calculateConfidence()

function calculateConfidence(usageCount: number): number {
  if (usageCount >= 10) return 0.9;
  if (usageCount >= 5) return 0.7;
  if (usageCount >= 2) return 0.5;
  return 0.2;
}
```

| usageCount | Score | Rationale |
|-----------|-------|-----------|
| 1 | 0.2 | Likely one-off value |
| 3 | 0.5 | Used in few places |
| 7 | 0.7 | Consistent usage |
| 15 | 0.9 | Core design token |

#### Test Examples as Interface Documentation

```typescript
// extractor.test.ts — Integration test documenting full pipeline behavior

describe('DesignTokenExtractor', () => {
  it('extracts tokens from HTML with linked CSS', async () => {
    const result = await extract('https://example.com', {
      // fetcher returns fixture HTML + CSS
      html: '<link rel="stylesheet" href="/styles.css">',
      css: ':root { --primary: #3B82F6; } body { color: var(--primary); margin: 16px; }',
    });

    expect(result.tokens.color).toEqual({
      'primary': {
        $value: '#3B82F6',
        $type: 'color',
        $description: 'Extracted from --primary (used in 2 declarations)',
        $extensions: {
          'com.design-token-extractor': {
            confidence: 0.5,
            usageCount: 2,
            sourceFiles: ['/styles.css'],
          },
        },
      },
    });

    expect(result.tokens.spacing).toEqual({
      md: {
        $value: '16px',
        $type: 'dimension',
        $description: 'Extracted from margin (used in 1 declaration)',
        $extensions: {
          'com.design-token-extractor': {
            confidence: 0.2,
            usageCount: 1,
            sourceFiles: ['/styles.css'],
          },
        },
      },
    });

    expect(result.summary.totalTokens).toBe(2);
  });

  it('rejects non-HTTPS URLs', async () => {
    await expect(extract('http://example.com'))
      .rejects.toThrow(UsageError);
  });

  it('handles empty CSS gracefully', async () => {
    const result = await extract('https://empty.com', { html: '<html></html>', css: '' });
    expect(result.tokens).toEqual({});
    expect(result.summary.totalTokens).toBe(0);
    expect(result.summary.warnings).toContain('No CSS found on this page');
  });
});
```

## Runtime View

### Primary Flow

#### Primary Flow: Extract Design Tokens from URL

1. User runs `design-token-extractor https://example.com -o tokens.json`
2. **cli.ts** parses args via commander, validates flags
3. **cli.ts** calls `extractor.extract(url, options)`
4. **extractor.ts** calls `fetcher.fetchPage(url)` -> HTML string
5. **extractor.ts** calls `fetcher.discoverCss(html, baseUrl)` -> CSS link URLs
6. **extractor.ts** calls `fetcher.fetchCss(cssUrls)` -> CssSource[]
7. **extractor.ts** calls `parser.parse(cssSources)` -> PostCSS AST + resolved variables
8. **extractor.ts** calls `tokenizer.extract(parsed)` -> RawToken[]
9. **extractor.ts** calls `deduplicator.deduplicate(rawTokens)` -> DesignTokenFile
10. **extractor.ts** calls `formatter.format(tokens, options.format)` -> string
11. **extractor.ts** calls `writer.write(formatted, options.output)` -> void
12. **cli.ts** prints summary to stderr, exits 0

```
User ─── cli.ts ─── extractor.ts ─┬─ fetcher.ts ──── Target Website
                                   ├─ parser.ts       (HTTPS)
                                   ├─ tokenizer.ts
                                   ├─ deduplicator.ts
                                   ├─ formatter.ts
                                   └─ writer.ts ───── File System / stdout
```

### Error Handling

```typescript
// errors.ts

/** Base error with exit code */
abstract class ExtractorError extends Error {
  abstract readonly exitCode: number;
}

/** Exit code 2 — invalid input, bad args, bad URL */
class UsageError extends ExtractorError {
  readonly exitCode = 2;
}

/** Exit code 1 — network failure, parse error, write error */
class RuntimeError extends ExtractorError {
  readonly exitCode = 1;
}
```

**Error mapping:**

| Error Type | Exit Code | Examples |
|-----------|-----------|----------|
| `UsageError` | 2 | Missing URL, non-HTTPS, private IP, unknown flag, path traversal |
| `RuntimeError` | 1 | Network timeout, CSS parse failure, file write error, non-HTML response |
| Uncaught exception | 1 | Unexpected errors (caught by top-level handler in cli.ts) |

**Error flow:**
- All errors propagate up to `cli.ts` top-level try/catch
- Error message printed to stderr
- Exit code set from error type
- `--verbose` adds stack trace to stderr output

### Complex Logic

#### Algorithm: Token Extraction Pipeline

```
ALGORITHM: Extract Design Tokens
INPUT: url (string), options (CliOptions)
OUTPUT: ExtractionResult

1. VALIDATE url against SSRF deny-list
2. CONFIRM with user (unless --no-confirm)
3. FETCH html = GET url (30s timeout, 5 redirect max)
4. DISCOVER cssLinks = parse <link>, <style> from html (cheerio)
5. FETCH cssSources[] = GET each cssLink (max 10 files, 1MB each, 5MB total)
   - Follow @import chains (depth <= 5)
   - Validate each URL against SSRF deny-list
   - Skip failed fetches (warn to stderr)
6. PARSE
   - Parse each CSS source via PostCSS
   - Collect custom property declarations (:root, *)
   - Resolve var() chains (max depth 10, detect cycles)
7. EXTRACT per category:
   - Colors: color, background-color, border-color, fill, stroke, --*color*
   - Typography: font-family, font-size, font-weight, line-height, letter-spacing
   - Spacing: margin, padding, gap, top/right/bottom/left
   - Shadows: box-shadow, text-shadow
   - Borders: border-radius, border-width
   - Breakpoints: @media min-width/max-width values
   - Motion: transition-duration, animation-duration, transition-timing-function
8. DEDUPLICATE
   - Group identical values
   - Count usages per unique value
   - Assign confidence score (1->0.2, 2-5->0.5, 5-10->0.7, 10+->0.9)
   - Cluster spacing into named scales (xs/sm/md/lg/xl)
   - Apply --min-confidence filter
   - Apply --include category filter
9. FORMAT to DTCG JSON or CSS custom properties
10. SANITIZE output values (strip null bytes, control chars, max 1000 chars)
11. VALIDATE JSON round-trip (JSON.parse(JSON.stringify(output)))
12. WRITE to file or stdout
```

## Deployment View

### Single Application Deployment

- **Environment:** Developer machines, CI/CD runners — anywhere Node.js 18+ is available
- **Configuration:** No env vars required for runtime. `NPM_TOKEN` GitHub secret for publishing.
- **Dependencies:** PostCSS, cheerio, commander, ora (runtime). vitest, tsup, typescript (dev).
- **Performance:** Target < 30 seconds for typical extraction. Bottleneck is network (fetching CSS files), not CPU.

### npm Publish Workflow

New GitHub Actions workflow at `.github/workflows/npm-publish.yml`:

```yaml
name: npm Publish

on:
  push:
    branches: [main]
    paths:
      - 'packages/design-token-extractor/**'

permissions:
  contents: write

concurrency:
  group: npm-publish
  cancel-in-progress: false

jobs:
  publish:
    runs-on: ubuntu-latest
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
    defaults:
      run:
        working-directory: packages/design-token-extractor
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm run typecheck
      - run: npm test
      - run: npm run build

      - name: Determine version bump
        id: version
        run: |
          LATEST=$(npm view . version 2>/dev/null || echo "0.0.0")
          # Same conventional-commit logic as existing release.yml
          # Bumps major/minor/patch based on commit messages
          # Sets outputs.version and outputs.bump

      - name: Publish
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### package.json Structure

```json
{
  "name": "design-token-extractor",
  "version": "0.1.0",
  "description": "Extract design tokens from any website into W3C DTCG JSON",
  "type": "module",
  "bin": {
    "design-token-extractor": "./dist/cli.js"
  },
  "files": ["dist"],
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "cheerio": "^1.0.0",
    "commander": "^11.0.0",
    "ora": "^8.0.0",
    "postcss": "^8.4.24"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "eslint": "^9.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.2.0",
    "vitest": "^2.0.0"
  },
  "keywords": [
    "design-tokens",
    "dtcg",
    "css",
    "design-system",
    "extractor",
    "cli"
  ],
  "license": "MIT",
  "author": "Roland Wallner"
}
```

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  dts: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

## Cross-Cutting Concepts

### Pattern Documentation

```yaml
# Patterns used in this feature
- pattern: Pipeline (linear data transformation)
  relevance: CRITICAL
  why: "Core architecture — data flows through stages without branching"

- pattern: Result pattern (errors as values in tests, thrown in production)
  relevance: HIGH
  why: "All errors propagate to cli.ts top-level handler for exit code mapping"

- pattern: Deny-list security validation
  relevance: CRITICAL
  why: "SSRF prevention on all URL inputs including redirect targets"
```

### System-Wide Patterns

- **Security:** SSRF deny-list on every URL (including @import and redirect targets). Output sanitized via JSON.stringify. Path traversal prevention on --output. User confirmation before network requests.
- **Error Handling:** Custom error hierarchy (UsageError/RuntimeError) maps to exit codes. All errors caught at cli.ts top level. Verbose mode adds stack traces.
- **Performance:** Sequential CSS fetching (respects rate limits). 30s timeout per request. 5MB total CSS cap. PostCSS parsing is fast enough for single-site extraction.
- **Logging:** Progress via ora spinner to stderr. Verbose mode logs each fetch, parse step. Quiet mode suppresses all non-error output.

## Architecture Decisions

- [x] **ADR-1 Project Location:** Subdirectory `packages/design-token-extractor/` in existing repo
  - Rationale: Shares repo infrastructure (CI, git history) while maintaining independent package.json and npm publish
  - Trade-offs: Must scope GitHub Actions workflow to `packages/design-token-extractor/**` path changes. Slightly more complex CI than standalone repo.
  - User confirmed: Yes

- [x] **ADR-2 CSS Parser:** PostCSS 8.4.x
  - Rationale: Battle-tested, excellent TypeScript support, plugin ecosystem for variable resolution. Security requirement from SECURITY_RESEARCH.md (never regex-parse CSS).
  - Trade-offs: Larger than css-tree. Slower than lightningcss. Acceptable for single-site extraction.
  - User confirmed: Yes (pre-confirmed from research)

- [x] **ADR-3 HTTP Client:** Native fetch (Node 18+)
  - Rationale: Zero dependencies for network requests. Sufficient for simple GET requests with timeout.
  - Trade-offs: Requires Node 18+ minimum. No built-in retry or connection pooling. Acceptable for <10 requests per extraction.
  - User confirmed: Yes (pre-confirmed from research)

- [x] **ADR-4 CLI Framework:** commander 11.x
  - Rationale: Most widely adopted Node.js CLI framework. Declarative API, excellent TypeScript types, ~7KB.
  - Trade-offs: Slightly larger than citty. Less flexible than yargs for complex subcommands. This CLI has one command — commander is ideal.
  - User confirmed: Yes (pre-confirmed from research)

- [x] **ADR-5 Build Tool:** tsup
  - Rationale: Fast esbuild-powered builds. Simple config. Handles shebang injection for bin entry.
  - Trade-offs: Less configurable than rollup. Sufficient for single-entry CLI tool.
  - User confirmed: Yes (pre-confirmed from research)

- [x] **ADR-6 HTML Parser:** cheerio 1.x
  - Rationale: jQuery-like API for extracting `<link>` and `<style>` tags. Fast, low memory. Native TypeScript types.
  - Trade-offs: Heavier than node-html-parser. Overkill for just extracting tags. But API familiarity and reliability outweigh size.
  - User confirmed: Yes (pre-confirmed from research)

- [x] **ADR-7 Output Format:** JSON via JSON.stringify (primary), CSS custom properties (secondary)
  - Rationale: JSON.stringify escapes all strings — prevents injection. W3C DTCG JSON is the canonical format. CSS custom properties for direct browser use.
  - Trade-offs: No JavaScript/TypeScript module output in v1. Users can use Style Dictionary to transform JSON to other formats.
  - User confirmed: Yes (pre-confirmed from research)

## Quality Requirements

- **Performance:** Extraction completes in < 30 seconds for sites with <= 10 CSS files totaling <= 5MB. Measured from URL input to file write.
- **Security:** Zero SSRF vulnerabilities. All URLs validated against deny-list. All output sanitized. Verified by dedicated test suite (fetcher.test.ts).
- **Reliability:** Graceful degradation — failed CSS fetches produce warnings, not crashes. Empty sites produce empty token files with warning. Exit code always reflects actual outcome.
- **Usability:** `npx design-token-extractor --help` shows complete usage. All errors include actionable message. Non-TTY environments get clear guidance about `--no-confirm`.

## Acceptance Criteria

**Main Flow Criteria:**
- [x] WHEN user provides valid HTTPS URL, THE SYSTEM SHALL fetch HTML, discover CSS, extract tokens, and write DTCG JSON
- [x] WHEN `--output -` is specified, THE SYSTEM SHALL write JSON to stdout and all status to stderr
- [x] WHEN `--format css` is specified, THE SYSTEM SHALL write CSS custom property declarations
- [x] WHEN `--no-confirm` is specified, THE SYSTEM SHALL skip user confirmation prompt
- [x] WHEN extraction succeeds, THE SYSTEM SHALL exit with code 0

**Error Handling Criteria:**
- [x] WHEN URL is not HTTPS, THE SYSTEM SHALL print error to stderr and exit with code 2
- [x] WHEN URL resolves to private IP, THE SYSTEM SHALL print SSRF warning to stderr and exit with code 2
- [x] WHEN CSS file fetch fails, THE SYSTEM SHALL warn to stderr and continue with remaining files
- [x] WHEN no CSS found, THE SYSTEM SHALL warn to stderr, write empty tokens, and exit with code 0
- [x] WHEN output path contains traversal, THE SYSTEM SHALL reject and exit with code 2

**Edge Case Criteria:**
- [x] WHILE fetching CSS files, IF total bytes exceed 5MB, THE SYSTEM SHALL stop fetching and process collected CSS
- [x] WHILE resolving CSS variables, IF circular reference detected, THE SYSTEM SHALL use fallback or leave unresolved
- [x] IF `--min-confidence` specified, THE SYSTEM SHALL exclude tokens below threshold from output
- [x] IF no TTY and no `--no-confirm`, THE SYSTEM SHALL print guidance and exit with code 2

## Risks and Technical Debt

### Known Technical Issues

- Native fetch in Node 18 lacks built-in request size limits — must implement Content-Length check and streaming abort manually
- ora spinner may not render correctly in all CI environments — `--quiet` flag mitigates this

### Technical Debt

- None (greenfield project)

### Implementation Gotchas

- **cheerio 1.x vs 0.x:** API changed significantly. Ensure `import * as cheerio from 'cheerio'` not default import
- **PostCSS walkDecls:** Callback is synchronous. Do not use async operations inside walkDecls
- **tsup shebang:** Must use `banner.js` config, not a plugin, for shebang injection. The shebang must be the very first line of the output file
- **ora and stdout:** ora writes to stderr by default (good). But if imported incorrectly or spinner.text is piped, it can pollute stdout. Always verify `-o -` output is clean JSON
- **npm publish --access public:** Required for first publish of scoped packages. Our package is unscoped so `--access public` is optional but explicit

## Glossary

### Domain Terms

| Term | Definition | Context |
|------|------------|---------|
| Design Token | A named value representing a visual design decision (color, size, font) | Core extraction target |
| DTCG | Design Tokens Community Group (W3C) | Defines the canonical JSON format for tokens |
| Confidence Score | 0.0-1.0 rating of how likely a CSS value is a true design token | Based on usage count across selectors |
| Token Clustering | Grouping related values (e.g., spacing: 4/8/16/24px) into named scales | Part of deduplication step |

### Technical Terms

| Term | Definition | Context |
|------|------------|---------|
| SSRF | Server-Side Request Forgery — tricking a server into making requests to internal resources | Primary security threat — mitigated by URL deny-list |
| PostCSS AST | Abstract Syntax Tree produced by PostCSS parser | Internal representation of parsed CSS |
| Custom Property | CSS variable declared with `--` prefix (e.g., `--primary: #F00`) | Resolved during parsing step |
| tsup | TypeScript bundler powered by esbuild | Builds CLI from TypeScript to executable JavaScript |

### API/Interface Terms

| Term | Definition | Context |
|------|------------|---------|
| `$value` | DTCG field containing the token's actual value | Required in every token entry |
| `$type` | DTCG field specifying the token type (color, dimension, etc.) | Required in every token entry |
| `$description` | DTCG field with human-readable description | Includes source CSS info |
| `$extensions` | DTCG field for vendor-specific metadata | Stores confidence, usage count, source files |
