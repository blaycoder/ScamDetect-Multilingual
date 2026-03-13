import type { DetectionResult, ScamReport } from "@/types";
import { supabase } from "@/lib/supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ error: res.statusText, details: undefined }));
    const message = [err.error, err.details].filter(Boolean).join(": ");
    throw new Error(message || "API request failed");
  }
  return res.json() as Promise<T>;
}

/** Returns Authorization header if a Supabase session is active */
async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

export const api = {
  /** POST /api/translate-ui */
  translateUiTexts: async (
    texts: string[],
    targetLanguage: string,
  ): Promise<string[]> => {
    const result = await fetch(`${API_URL}/api/translate-ui`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify({ texts, targetLanguage }),
    }).then(handleResponse<{ translations: string[] }>);

    return result.translations;
  },

  /** POST /api/analyze-message */
  analyzeMessage: async (
    message: string,
    language = "en",
  ): Promise<DetectionResult> =>
    fetch(`${API_URL}/api/analyze-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify({ message, language }),
    }).then(handleResponse<DetectionResult>),

  /** POST /api/check-url */
  checkUrl: async (url: string, language = "en"): Promise<DetectionResult> =>
    fetch(`${API_URL}/api/check-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify({ url, language }),
    }).then(handleResponse<DetectionResult>),

  /** POST /api/scan-screenshot */
  scanScreenshot: async (
    imageBase64: string,
    language = "en",
  ): Promise<DetectionResult> =>
    fetch(`${API_URL}/api/scan-screenshot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify({ imageBase64, language }),
    }).then(handleResponse<DetectionResult>),

  /** POST /api/report-scam */
  reportScam: async (
    message: string,
    screenshotUrl?: string,
  ): Promise<{ id: string }> =>
    fetch(`${API_URL}/api/report-scam`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify({ message, screenshotUrl }),
    }).then(handleResponse<{ id: string }>),

  /** GET /api/scam-database */
  getScamDatabase: (): Promise<ScamReport[]> =>
    fetch(`${API_URL}/api/scam-database`).then(handleResponse<ScamReport[]>),

  /** GET /api/user/scans — requires authentication */
  getUserScans: async (): Promise<ScamReport[]> =>
    fetch(`${API_URL}/api/user/scans`, {
      headers: { ...(await authHeaders()) },
    }).then(handleResponse<ScamReport[]>),
};
