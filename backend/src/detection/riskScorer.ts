// ── Risk Scoring Engine ──────────────────────────────────────

import type { DetectionFlag, RiskLevel, AIClassification } from "./types";

export { DetectionFlag, RiskLevel };

export interface ScoringInput {
  keywordMatchCount: number;
  suspiciousDomainCount: number;
  virustotalMalicious: number;
  phishtankMatch: boolean;
  aiClassification?: AIClassification;
}

const SCORES = {
  PER_KEYWORD: 20,
  PER_SUSPICIOUS_DOMAIN: 25,
  VIRUSTOTAL_MALICIOUS: 40,
  PHISHTANK_MATCH: 50,
  AI_PHISHING: 30,
  AI_SUSPICIOUS: 10,
};

/**
 * Calculate the final risk score (0–100) and level from collected signals.
 */
export function calculateRiskScore(input: ScoringInput): {
  score: number;
  level: RiskLevel;
} {
  let score = 0;

  // Keywords — capped at 2 matches contributing to score
  score += Math.min(input.keywordMatchCount, 2) * SCORES.PER_KEYWORD;

  // Suspicious domains — capped at 2 matches
  score +=
    Math.min(input.suspiciousDomainCount, 2) * SCORES.PER_SUSPICIOUS_DOMAIN;

  // VirusTotal — flat bonus if any malicious engine flagged
  if (input.virustotalMalicious > 0) score += SCORES.VIRUSTOTAL_MALICIOUS;

  // PhishTank — highest single indicator
  if (input.phishtankMatch) score += SCORES.PHISHTANK_MATCH;

  // AI classification
  if (input.aiClassification === "PHISHING") score += SCORES.AI_PHISHING;
  else if (input.aiClassification === "SUSPICIOUS")
    score += SCORES.AI_SUSPICIOUS;

  // Clamp to 0–100
  score = Math.min(100, Math.max(0, score));

  const level: RiskLevel =
    score <= 20 ? "SAFE" : score <= 60 ? "SUSPICIOUS" : "HIGH_RISK";

  return { score, level };
}
