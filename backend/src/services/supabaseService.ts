import { supabase } from "../utils/supabase";
import type { DetectionResult } from "../detection/types";

// ── Supabase Storage Service ──────────────────────────────────

/**
 * Save a detection result to the scam_reports table.
 * Silently fails if Supabase is not configured.
 * @param userId  Optional Supabase user id — NULL for anonymous scans.
 */
export async function saveDetectionResult(
  message: string,
  result: DetectionResult,
  userId?: string,
): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("scam_reports")
    .insert({
      message: message.slice(0, 5000), // cap stored text length
      risk_score: result.riskScore,
      risk_level: result.riskLevel,
      user_id: userId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[Supabase] saveDetectionResult error:", error.message);
    return null;
  }

  return data?.id ?? null;
}

/**
 * Retrieve the most recent scam reports.
 */
export async function getRecentScamReports(limit = 50) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("scam_reports")
    .select("id, message, risk_score, risk_level, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Supabase] getRecentScamReports error:", error.message);
    return [];
  }

  // Map snake_case DB columns → camelCase API response
  return (data ?? []).map((row) => ({
    id: row.id,
    message: row.message,
    riskScore: row.risk_score,
    riskLevel: row.risk_level,
    createdAt: row.created_at,
  }));
}

/**
 * Save a community scam report.
 */
export async function saveCommunityReport(
  message: string,
  screenshotUrl?: string,
): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("community_reports")
    .insert({
      message: message.slice(0, 5000),
      screenshot_url: screenshotUrl ?? null,
      votes: 0,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[Supabase] saveCommunityReport error:", error.message);
    return null;
  }

  return data?.id ?? null;
}

// ── URL Scan Records ──────────────────────────────────────────

/**
 * Create a new url_scans row.
 * vt_analysis_id is stored so results can be fetched later.
 * @returns the new row UUID or null on failure.
 */
export async function saveUrlScan(
  url: string,
  vtAnalysisId: string | null,
  userId?: string,
): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("url_scans")
    .insert({
      url: url.slice(0, 2048),
      vt_analysis_id: vtAnalysisId ?? null,
      status: vtAnalysisId ? "pending" : "failed",
      user_id: userId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[Supabase] saveUrlScan error:", error.message);
    return null;
  }

  return data?.id ?? null;
}

/**
 * Update an existing url_scans row with the completed VT result.
 */
export async function updateUrlScanResult(
  scanId: string,
  vtResult: object,
  status: "completed" | "failed",
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from("url_scans")
    .update({
      vt_result: vtResult,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", scanId);

  if (error) {
    console.error("[Supabase] updateUrlScanResult error:", error.message);
  }
}
