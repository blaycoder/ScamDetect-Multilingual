import { distance } from "fastest-levenshtein";

// ── Domain similarity / impersonation detection ──────────────

const TRUSTED_DOMAINS = [
  "paypal.com",
  "amazon.com",
  "google.com",
  "apple.com",
  "facebook.com",
  "netflix.com",
  "microsoft.com",
  "instagram.com",
  "twitter.com",
  "linkedin.com",
  "ebay.com",
  "chase.com",
  "wellsfargo.com",
  "bankofamerica.com",
  "citibank.com",
  "irs.gov",
  "usps.com",
  "fedex.com",
  "dhl.com",
];

export interface DomainSimilarityResult {
  inputDomain: string;
  matchedTrusted: string;
  distance: number;
}

/**
 * Compare a domain against trusted domains using Levenshtein distance.
 * Returns impersonation matches where distance is 1–4 but not exact.
 */
export function checkDomainSimilarity(
  domain: string,
): DomainSimilarityResult | null {
  // Strip www AND any subdomains — compare only registrable domain
  const parts = domain
    .replace(/^www\./, "")
    .toLowerCase()
    .split(".");
    
  // Take last two parts: e.g. "reactivate.faceboook.com" → "faceboook.com"
  const normalized = parts.slice(-2).join(".");

  // Exact match → not an impersonation
  if (TRUSTED_DOMAINS.includes(normalized)) return null;

  let closestMatch: DomainSimilarityResult | null = null;
  let minDistance = Infinity;

  for (const trusted of TRUSTED_DOMAINS) {
    const d = distance(normalized, trusted);
    // Suspicious range: 1–4 characters different
    if (d > 0 && d <= 4 && d < minDistance) {
      minDistance = d;
      closestMatch = {
        inputDomain: domain,
        matchedTrusted: trusted,
        distance: d,
      };
    }
  }

  return closestMatch;
}
