import axios from "axios";
import type { VirusTotalResult } from "../detection/types";

const VT_API_URL = "https://www.virustotal.com/api/v3";

/**
 * Submit a URL to VirusTotal and return scan stats.
 * Implemented fully in Step 6.
 */
export async function checkUrlVirusTotal(
  url: string,
): Promise<VirusTotalResult | null> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  try {
    // Base64url-encode the URL (VirusTotal v3 requirement)
    const encodedUrl = Buffer.from(url).toString("base64url");
    const res = await axios.get(`${VT_API_URL}/urls/${encodedUrl}`, {
      headers: { "x-apikey": apiKey },
      timeout: 8000,
    });

    const stats = res.data?.data?.attributes?.last_analysis_stats;
    if (!stats) return null;

    return {
      malicious: stats.malicious ?? 0,
      suspicious: stats.suspicious ?? 0,
      harmless: stats.harmless ?? 0,
      undetected: stats.undetected ?? 0,
    };
  } catch {
    return null;
  }
}
