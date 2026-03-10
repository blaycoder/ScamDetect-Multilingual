// ── Shared backend types ──────────────────────────────────────
// These mirror the shared/src/index.ts types without ws package issues.

export type RiskLevel = "SAFE" | "SUSPICIOUS" | "HIGH_RISK";

export type FlagType =
  | "KEYWORD_MATCH"
  | "SUSPICIOUS_DOMAIN"
  | "VIRUSTOTAL_MALICIOUS"
  | "PHISHTANK_MATCH"
  | "AI_PHISHING"
  | "DOMAIN_IMPERSONATION";

export type AIClassification = "SAFE" | "SUSPICIOUS" | "PHISHING";

export interface DetectionFlag {
  type: FlagType;
  detail: string;
  score: number;
}

export interface VirusTotalResult {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
}

export interface DetectionResult {
  riskScore: number;
  riskLevel: RiskLevel;
  flags: DetectionFlag[];
  extractedUrls: string[];
  aiClassification?: AIClassification;
  virustotalResult?: VirusTotalResult;
  phishtankMatch?: boolean;
  translatedSummary?: string;
  language?: string;
}
