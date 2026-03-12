import axios, { AxiosError } from "axios";
import type { VirusTotalResult } from "../detection/types";

const VT_API_URL = "https://www.virustotal.com/api/v3";

// ── VirusTotal Internal Types ─────────────────────────────────

interface VTEngineResult {
  category: string;
  engine_name: string;
  method: string;
  result: string;
}

interface VTAnalysisAttributes {
  status: "queued" | "in-progress" | "completed";
  results: Record<string, VTEngineResult>;
  stats: {
    malicious: number;
    suspicious: number;
    harmless: number;
    undetected: number;
    timeout?: number;
    confirmed_timeout?: number;
    failure?: number;
    type_unsupported?: number;
  };
  url?: string;
  date?: number;
}

interface VTAnalysisResponse {
  data: {
    id: string;
    type: string;
    attributes: VTAnalysisAttributes;
  };
}

/** Rich per-engine summary returned by getAnalysis(). */
export interface VTDetailedResult {
  vtAnalysisId: string;
  status: string;
  maliciousCount: number;
  phishingCount: number;
  harmlessCount: number;
  suspiciousCount: number;
  undetectedCount: number;
  engines: Array<{ name: string; category: string; result: string }>;
}

// ── Helpers ───────────────────────────────────────────────────

function apiKey(): string | null {
  return process.env.VIRUSTOTAL_API_KEY ?? null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Public API ────────────────────────────────────────────────

/**
 * Submit a URL to VirusTotal for scanning.
 * Returns the VirusTotal analysis ID (format: "u-{hash}-{timestamp}"),
 * or null if the API key is missing or the request fails.
 */
export async function submitUrl(url: string): Promise<string | null> {
  const key = apiKey();
  if (!key) return null;

  try {
    const body = new URLSearchParams();
    body.set("url", url);

    const res = await axios.post<{ data: { id: string } }>(
      `${VT_API_URL}/urls`,
      body,
      {
        headers: {
          "x-apikey": key,
          accept: "application/json",
          "content-type": "application/x-www-form-urlencoded",
        },
      },
    );

    const vtAnalysisId = res.data?.data?.id ?? null;
    if (vtAnalysisId) {
      console.log("[VT] Submitted URL — analysis ID:", vtAnalysisId);
    }
    return vtAnalysisId;
  } catch (err) {
    console.error("[VT] submitUrl error:", (err as AxiosError).message);
    return null;
  }
}

/**
 * Fetch analysis results from VirusTotal using the analysis ID.
 * Polls up to `maxAttempts` times with `delayMs` between retries
 * when the analysis status is not yet "completed".
 */
export async function getAnalysis(
  vtAnalysisId: string,
  maxAttempts = 3,
  delayMs = 2500,
): Promise<VTDetailedResult | null> {
  const key = apiKey();
  if (!key) return null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await axios.get<VTAnalysisResponse>(
        `${VT_API_URL}/analyses/${vtAnalysisId}`,
        { headers: { "x-apikey": key, accept: "application/json" } },
      );

      const attrs = res.data?.data?.attributes;
      if (!attrs) return null;

      // Not completed yet — wait and retry if attempts remain
      if (attrs.status !== "completed" && attempt < maxAttempts) {
        console.log(
          `[VT] Analysis ${vtAnalysisId} status: ${attrs.status} — retry ${attempt}/${maxAttempts}`,
        );
        await sleep(delayMs);
        continue;
      }

      // Build per-engine summary (only include flagged entries for brevity)
      const allEngines = Object.values(attrs.results ?? {});
      const engines = allEngines
        .filter((e) => e.category !== "undetected" && e.category !== "timeout")
        .map((e) => ({
          name: e.engine_name,
          category: e.category,
          result: e.result,
        }));

      const phishingCount = allEngines.filter(
        (e) => e.category === "malicious" && e.result === "phishing",
      ).length;

      return {
        vtAnalysisId,
        status: attrs.status,
        maliciousCount: attrs.stats?.malicious ?? 0,
        phishingCount,
        harmlessCount: attrs.stats?.harmless ?? 0,
        suspiciousCount: attrs.stats?.suspicious ?? 0,
        undetectedCount: attrs.stats?.undetected ?? 0,
        engines,
      };
    } catch (err) {
      console.error(
        `[VT] getAnalysis attempt ${attempt} error:`,
        (err as AxiosError).message,
      );
      if (attempt === maxAttempts) return null;
      await sleep(delayMs);
    }
  }

  return null;
}

/**
 * Convenience wrapper: submit a URL then immediately fetch its analysis.
 * Used by the detection pipeline for backward-compatible VirusTotalResult.
 */
export async function checkUrlVirusTotal(
  url: string,
): Promise<VirusTotalResult | null> {
  const vtAnalysisId = await submitUrl(url);
  if (!vtAnalysisId) return null;

  const detailed = await getAnalysis(vtAnalysisId);
  if (!detailed) return null;

  return {
    malicious: detailed.maliciousCount,
    suspicious: detailed.suspiciousCount,
    harmless: detailed.harmlessCount,
    undetected: detailed.undetectedCount,
    // Extended fields
    vtAnalysisId: detailed.vtAnalysisId,
    phishingCount: detailed.phishingCount,
    status: detailed.status,
    engines: detailed.engines,
  };
}
