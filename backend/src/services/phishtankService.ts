import axios from "axios";

// ── PhishTank service ─────────────────────────────────────────
// PhishTank provides a free JSON feed of known phishing URLs.
// We fetch it on demand and cache it in memory for 1 hour.

let cache: Set<string> = new Set();
let lastFetched = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const PHISHTANK_FEED = "https://data.phishtank.com/data/online-valid.json";

async function refreshCache(): Promise<void> {
  try {
    const res = await axios.get<{ url: string }[]>(PHISHTANK_FEED, {
      timeout: 15000,
      headers: { "User-Agent": "ScamDetect/1.0" },
    });
    const urls = (res.data ?? [])
      .map((e) => e.url?.toLowerCase().trim())
      .filter(Boolean);
    cache = new Set(urls);
    lastFetched = Date.now();
  } catch {
    // Keep stale cache if refresh fails
  }
}

/**
 * Check if a URL is listed in PhishTank's database.
 * Downloads and caches the dataset; refreshes every hour.
 */
export async function checkPhishTank(url: string): Promise<boolean> {
  if (Date.now() - lastFetched > CACHE_TTL_MS) {
    await refreshCache();
  }
  return cache.has(url.toLowerCase().trim());
}
