/** Stand-in origin for parsing relative URLs; never fetched. */
const RELATIVE_BASE = 'https://relative.invalid/';

/**
 * Returns `url` if it is safe to load as media (Image, Avatar, Video, AudioPlayer), else
 * `undefined` so the component renders nothing. A2UI v0.9.1 and v1.0 require this of renderers;
 * it applies to every version here.
 *
 * Allowed: `http:` / `https:` URLs with a host, `data:` URLs, and relative paths. Rejected:
 * every other scheme (`javascript:`, `file:`, `blob:`, ...) and protocol-relative URLs
 * (`//host/x`, and `/\host/x`, which browsers read the same way), since those leave the page's
 * origin without saying so.
 *
 * Parsing goes through `URL`, as the browser will, so whitespace and control characters inside a
 * scheme (`java\tscript:`) cannot slip past a string check.
 */
export function safeMediaUrl(url: unknown): string | undefined {
  if (typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(trimmed, RELATIVE_BASE);
  } catch {
    return undefined;
  }

  if (parsed.protocol === 'data:') return trimmed;
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;

  // Resolved onto the stand-in origin: a relative path. Anything else that came out as http(s)
  // must have said so explicitly; `//host` and `/\host` take the base's scheme and a new host.
  if (parsed.origin === new URL(RELATIVE_BASE).origin) return trimmed;
  if (!/^https?:\/\//i.test(trimmed) || !parsed.hostname) return undefined;
  return parsed.href;
}
