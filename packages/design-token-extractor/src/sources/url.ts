/**
 * URL source validator.
 *
 * Enforces the scheme allowlist from SDD §"System-Wide Patterns → Security":
 * only `http:` and `https:` are accepted. All other schemes (`file:`, `data:`,
 * `javascript:`, `ftp:`, ...) are rejected with `UserError` to mitigate SSRF
 * and local-file disclosure via the CLI.
 *
 * Behavior:
 *   1. Trim surrounding whitespace.
 *   2. Empty input → `UserError('URL is required')`.
 *   3. `new URL(trimmed)` — on throw, wrap in `UserError('Invalid URL: <input>')`
 *      preserving the original parse error as `cause`.
 *   4. Protocol not in { 'http:', 'https:' } → `UserError` naming the rejected protocol.
 *   5. Return the parsed `URL` instance.
 */
import { UserError } from '../errors';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export function parseUrl(input: string): URL {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    throw new UserError('URL is required');
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch (cause) {
    // Redact userinfo so embedded credentials do not leak into CI logs or
    // error reporters when an otherwise-valid URL fails to parse.
    throw new UserError(`Invalid URL: ${redactUserinfo(trimmed)}`, { cause });
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new UserError(
      `Only http:// or https:// URLs are supported, got: ${parsed.protocol}`,
    );
  }

  return parsed;
}

function redactUserinfo(raw: string): string {
  // Match `scheme://userinfo@rest` where userinfo contains any non-`/@` chars.
  // Preserves the rest of the string for context.
  return raw.replace(/^(\w+:\/\/)[^/@]+@/, '$1[REDACTED]@');
}
