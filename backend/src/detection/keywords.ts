// ── Phishing keyword detection ────────────────────────────────

export interface KeywordMatch {
  keyword: string;
  category: string;
}

const PHISHING_KEYWORDS: { keyword: string; category: string }[] = [
  // Urgency / account threats
  { keyword: "verify your account", category: "urgency" },
  { keyword: "account suspended", category: "urgency" },
  { keyword: "account will be closed", category: "urgency" },
  { keyword: "urgent action required", category: "urgency" },
  { keyword: "immediate action", category: "urgency" },
  { keyword: "your account has been limited", category: "urgency" },
  { keyword: "your account was compromised", category: "urgency" },
  { keyword: "suspicious activity detected", category: "urgency" },
  { keyword: "account has been locked", category: "urgency" },
  { keyword: "account locked", category: "urgency" },
  { keyword: "reactivate", category: "urgency" },
  { keyword: "temporarily locked", category: "urgency" },
  { keyword: "verify here", category: "credential" },
  { keyword: "click here", category: "social" },

  // Identity / credential harvesting
  { keyword: "confirm your identity", category: "credential" },
  { keyword: "confirm identity", category: "credential" },
  { keyword: "confirm your email", category: "credential" },
  { keyword: "enter your password", category: "credential" },
  { keyword: "provide your details", category: "credential" },
  { keyword: "update your information", category: "credential" },
  { keyword: "verify your identity", category: "credential" },
  { keyword: "login to verify", category: "credential" },

  // Payment / financial
  { keyword: "update payment", category: "payment" },
  { keyword: "update your payment", category: "payment" },
  { keyword: "payment failed", category: "payment" },
  { keyword: "billing information required", category: "payment" },
  { keyword: "you have won", category: "payment" },
  { keyword: "claim your prize", category: "payment" },
  { keyword: "free gift", category: "payment" },
  { keyword: "wire transfer", category: "payment" },

  // Social engineering
  { keyword: "click here immediately", category: "social" },
  { keyword: "click the link below", category: "social" },
  { keyword: "do not ignore this", category: "social" },
  { keyword: "limited time offer", category: "social" },
  { keyword: "your package is waiting", category: "social" },
  { keyword: "delivery failed", category: "social" },
  { keyword: "we detected unusual", category: "social" },
  { keyword: "one-time password", category: "social" },
  { keyword: "otp", category: "social" },
];

/**
 * Detects phishing keyword matches in the given text.
 * Returns a deduplicated list of unique keyword matches.
 */
export function detectKeywords(text: string): KeywordMatch[] {
  const lower = text.toLowerCase();
  const seen = new Set<string>();
  const matches: KeywordMatch[] = [];

  for (const { keyword, category } of PHISHING_KEYWORDS) {
    if (lower.includes(keyword) && !seen.has(keyword)) {
      seen.add(keyword);
      matches.push({ keyword, category });
    }
  }

  return matches;
}
