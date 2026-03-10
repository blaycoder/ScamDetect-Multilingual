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
    const encodedParams = new URLSearchParams();
    // const encodedUrl = Buffer.from(url).toString("base64url");
    encodedParams.set("url", url);

    const options = {
      method: "POST",
      url: `${VT_API_URL}/urls`,
      headers: {
        "x-apikey": apiKey,
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      data: encodedParams,
    };

    const res = await axios.request(options);
    console.log("VirusTotal response:", res.data);

    // const stats = res.data?.data?.attributes?.last_analysis_stats;
    // if (!stats) return null;

    return res.data;
    ;
  } catch {
    return null;
  }
}
