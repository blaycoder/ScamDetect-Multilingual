// ============================================================
// ScamDetect — Shared Types
// Used by both frontend and backend
// ============================================================

export type RiskLevel = "SAFE" | "SUSPICIOUS" | "HIGH_RISK";

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

export interface DetectionFlag {
  type: FlagType;
  detail: string;
  score: number;
}

export type FlagType =
  | "KEYWORD_MATCH"
  | "SUSPICIOUS_DOMAIN"
  | "VIRUSTOTAL_MALICIOUS"
  | "PHISHTANK_MATCH"
  | "AI_PHISHING"
  | "DOMAIN_IMPERSONATION";

export type AIClassification = "SAFE" | "SUSPICIOUS" | "PHISHING";

export interface VirusTotalResult {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
}

export interface AnalyzeMessageRequest {
  message: string;
  language?: string;
}

export interface CheckUrlRequest {
  url: string;
  language?: string;
}

export interface ScanScreenshotRequest {
  imageBase64: string;
  language?: string;
}

export interface ReportScamRequest {
  message: string;
  screenshotUrl?: string;
}

export interface ScamReport {
  id: string;
  message: string;
  riskScore: number;
  riskLevel: RiskLevel;
  createdAt: string;
}

export interface CommunityReport {
  id: string;
  message: string;
  screenshotUrl?: string;
  votes: number;
  createdAt: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "yo-NG", label: "Yoruba" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
