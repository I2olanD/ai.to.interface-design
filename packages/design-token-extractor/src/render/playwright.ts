/**
 * Playwright-backed renderer (T3.2).
 *
 * Launches a headless Chromium, navigates to the target URL (or local HTML
 * file), emulates the requested `prefers-color-scheme`, runs the in-page
 * walker (`extractInPageFromGlobals`) via `page.evaluate()`, and returns the
 * resulting `RawStyleRecord[]`.
 *
 * Invariants:
 *   1. `browser.close()` is called in `finally`, so a zombie process cannot
 *      survive a timeout, a `goto` failure, or an evaluate crash.
 *   2. A `SIGINT` handler is installed for the duration of each render and
 *      removed in `finally` — Ctrl+C during extraction closes the browser
 *      before propagating.
 *   3. Every thrown error bubbles up as an `ExtractionError` (mapped to
 *      exit code 2 per SDD §"Error Handling"); original errors are preserved
 *      via the ES2022 `{ cause }` option.
 *   4. Timeout is enforced around the ENTIRE operation (launch + navigate +
 *      evaluate) via `Promise.race`, matching the SDD's "Extraction timed out
 *      after <N>s" error message verbatim.
 */

import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { chromium, type Browser } from 'playwright';

import { ExtractionError } from '../errors';
import type { Input, RawStyleRecord, ThemeTag } from '../types';

import { extractInPageFromGlobals } from './extract-in-page';

export type RenderOptions = {
  /**
   * Test-only hook: receives the `Browser` handle as soon as it is launched,
   * BEFORE navigation or evaluation. Used by the integration suite to assert
   * that the browser is properly closed on both success and failure paths.
   *
   * Production callers should not need this.
   */
  onBrowser?: (browser: Browser) => void;

  /**
   * When true, the renderer allows navigation and sub-resource requests to
   * RFC-1918 / loopback / link-local addresses. Off by default: a page on an
   * untrusted domain can otherwise pivot into internal networks (SSRF)
   * via XHR / fetch / images / iframes executed by the headless browser.
   *
   * Opt in when extracting from localhost, LAN design systems, or internal
   * docs. `file://` URLs are never affected by this flag.
   */
  allowPrivateHosts?: boolean;
};

/**
 * Returns true for hostnames that resolve to addresses the renderer refuses
 * to hit when `allowPrivateHosts` is false. Matches the common SSRF-pivot
 * ranges: IPv4 loopback / link-local / RFC-1918, plus IPv6 loopback and
 * unique-local (fc00::/7). DNS-based bypass (hostname resolving to a private
 * IP) is NOT handled here — defense is host-string only; pair with a network
 * policy if you need stronger guarantees.
 */
const isPrivateHost = (hostname: string): boolean => {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (h === 'localhost' || h === 'ip6-localhost' || h === 'ip6-loopback') {
    return true;
  }
  // IPv6 loopback / link-local / unique-local
  if (h === '::1' || h.startsWith('fe80:') || /^f[cd][0-9a-f]{2}:/i.test(h)) {
    return true;
  }
  // IPv4 dotted quad
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (a === 10) return true;               // 10.0.0.0/8
  if (a === 127) return true;              // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 0) return true;                // 0.0.0.0/8
  return false;
};

/**
 * Resolves the navigation target for Playwright's `page.goto()`.
 *
 * - `kind: 'url'`  → passed through verbatim (caller is responsible for
 *   having already validated the scheme via `sources/url.ts`).
 * - `kind: 'file'` → converted to a `file://` URL via `pathToFileURL`. We
 *   ALSO stat the file first: navigating to a non-existent `file://` URL in
 *   Playwright produces a confusing `ERR_FILE_NOT_FOUND` DevTools error that
 *   is hard to map back to a clean user-facing message. Failing fast here
 *   gives a clearer `ExtractionError`.
 */
const resolveTargetUrl = async (input: Input): Promise<string> => {
  if (input.kind === 'url') {
    return input.url;
  }

  const absolute = resolve(input.path);
  try {
    await stat(absolute);
  } catch (err) {
    throw new ExtractionError(`File not found: ${absolute}`, { cause: err });
  }
  return pathToFileURL(absolute).href;
};

/**
 * Wraps `operation` so it rejects with an `ExtractionError` if it does not
 * settle before `timeoutMs` elapses. The message matches the SDD §"Error
 * Handling" table.
 *
 * The returned cleanup handle cancels the pending timer — callers MUST
 * invoke it in a `finally` to avoid a dangling `setTimeout` keeping the
 * event loop alive after the operation resolves.
 */
const withTimeout = <T>(
  operation: Promise<T>,
  timeoutMs: number,
): { result: Promise<T>; cancel: () => void } => {
  let timer: NodeJS.Timeout | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const seconds = timeoutMs / 1000;
      reject(
        new ExtractionError(
          `Extraction timed out after ${seconds}s — consider --file or --fast`,
        ),
      );
    }, timeoutMs);
  });

  return {
    result: Promise.race([operation, timeout]),
    cancel: (): void => {
      if (timer !== undefined) clearTimeout(timer);
    },
  };
};

/**
 * Wraps any non-`ExtractionError` thrown value in an `ExtractionError` so the
 * CLI top-level always sees a typed error it knows the exit code for.
 */
const asExtractionError = (err: unknown): ExtractionError => {
  if (err instanceof ExtractionError) return err;
  const message = err instanceof Error ? err.message : String(err);
  return new ExtractionError(`Render failed: ${message}`, { cause: err });
};

export const render = async (
  input: Input,
  theme: ThemeTag,
  timeoutMs: number,
  opts?: RenderOptions,
): Promise<RawStyleRecord[]> => {
  const targetUrl = await resolveTargetUrl(input);

  let browser: Browser | undefined;

  // Install a SIGINT handler for the duration of this render. Using `once`
  // means we do not leak subscribers if the user Ctrl+Cs mid-extraction —
  // Node's default SIGINT behavior (exit) kicks in immediately after our
  // handler runs. We ALSO remove it in `finally` so successful renders do
  // not leave stray listeners on the process.
  const onSigint = (): void => {
    if (browser && browser.isConnected()) {
      // Fire-and-forget; we're about to exit anyway. Intentional void.
      void browser.close();
    }
  };
  process.once('SIGINT', onSigint);

  const allowPrivate = opts?.allowPrivateHosts === true;

  // For URL inputs, pre-check the target host. `file://` is allowed through
  // because local file rendering is a deliberate feature (auth-wall bypass).
  if (input.kind === 'url' && !allowPrivate) {
    const hostname = new URL(targetUrl).hostname;
    if (isPrivateHost(hostname)) {
      throw new ExtractionError(
        `Refusing to navigate to private host ${hostname} — pass --allow-private-hosts to override`,
      );
    }
  }

  const operation = (async (): Promise<RawStyleRecord[]> => {
    browser = await chromium.launch({ headless: true });
    opts?.onBrowser?.(browser);

    const context = await browser.newContext();

    // Block sub-resource requests (XHR, fetch, iframe, img, etc.) to private
    // addresses unless the user opted in. This limits SSRF pivot surface when
    // rendering untrusted public pages.
    if (!allowPrivate) {
      await context.route('**/*', async (route) => {
        try {
          const hostname = new URL(route.request().url()).hostname;
          if (hostname && isPrivateHost(hostname)) {
            await route.abort('blockedbyclient');
            return;
          }
        } catch {
          // Malformed URL — fall through and let the browser decide.
        }
        await route.continue();
      });
    }

    const page = await context.newPage();
    await page.emulateMedia({ colorScheme: theme });
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    // `extractInPageFromGlobals` is self-contained: its body re-declares the
    // property list and helpers it needs. See `extract-in-page.ts` module
    // docstring for why this matters.
    const records = await page.evaluate(extractInPageFromGlobals, theme);
    return records;
  })();

  const { result, cancel } = withTimeout(operation, timeoutMs);

  try {
    return await result;
  } catch (err) {
    throw asExtractionError(err);
  } finally {
    cancel();
    process.removeListener('SIGINT', onSigint);
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Swallow — we are already unwinding; surfacing a close-time error
        // would mask the original failure. The primary failure (if any) is
        // already being thrown via the catch above.
      }
    }
  }
};
