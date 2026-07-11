// ============================================================
// Frontend shared types — mirrors shared/src/index.ts
// ============================================================

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
  /** VirusTotal analysis ID — links to the url_scans DB record. */
  vtAnalysisId?: string;
  /** Engines that flagged the URL specifically as phishing. */
  phishingCount?: number;
  /** VT analysis status: "queued" | "in-progress" | "completed". */
  status?: string;
  /** Per-engine results (non-undetected engines). */
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
  /** Aggregate of approved community reports matching scanned values. */
  communitySignal?: CommunitySignal;
}

export interface CommunitySignal {
  reportCount: number;
  reportTypes: string[];
}

export type CommunityReportType =
  | "phone"
  | "url"
  | "business_name"
  | "message";

export type CommunityReportStatus = "pending" | "approved" | "rejected";

export interface PublicCommunityReport {
  id: string;
  reportedValue: string;
  reportType: CommunityReportType;
  createdAt: string;
}

export interface AdminCommunityReport {
  id: string;
  reporterUserId: string | null;
  reporterAnonId: string | null;
  reportType: CommunityReportType;
  reportedValue: string;
  messageContent: string | null;
  screenshotUrl: string | null;
  description: string;
  language: string;
  status: CommunityReportStatus;
  moderatorId: string | null;
  moderatorNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
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
  { code: "en-US", label: "English" },
  { code: "yo-NG", label: "Yoruba" },
  { code: "ha-NG", label: "Hausa" },
  { code: "ig-NG", label: "Igbo" },
  { code: "fr-CA", label: "French" },
  { code: "es-ES", label: "Spanish" },
  { code: "ta-IN", label: "Tamil" },
  { code: "en-PT", label: "Portugal" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
