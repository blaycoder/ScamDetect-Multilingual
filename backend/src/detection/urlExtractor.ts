// ── URL extractor ────────────────────────────────────────────

// Matches http/https URLs  (no path-traversal, no SSRF risk — we extract, not request)
const URL_REGEX = /https?:\/\/(?:[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;

/**
 * Extract all unique URLs from a block of text.
 * De-duplicates results before returning.
 */
export function extractUrls(text: string): string[] {
  const raw = text.match(URL_REGEX) ?? [];
  // Deduplicate and trim trailing punctuation that may have been captured
  const cleaned = raw.map((u) => u.replace(/[.,;:!?"')>\]]+$/, ""));
  return [...new Set(cleaned)];
}

/**
 * Extract the hostname from a URL string.
 * Returns null if the URL is invalid.
 */
export function extractHostname(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    return u.hostname.toLowerCase();
  } catch {
    return null;
  }
}
