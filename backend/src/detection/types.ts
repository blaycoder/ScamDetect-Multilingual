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

export interface VTEngine {
  name: string;
  category: string;
  result: string;
}

export interface VirusTotalResult {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  /** Analysis ID returned by VT — used to link scan records in the DB. */
  vtAnalysisId?: string;
  /** Number of engines that specifically flagged the URL as phishing. */
  phishingCount?: number;
  /** VT analysis status: "queued" | "in-progress" | "completed". */
  status?: string;
  /** Per-engine results (non-undetected engines only). */
  engines?: VTEngine[];
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
