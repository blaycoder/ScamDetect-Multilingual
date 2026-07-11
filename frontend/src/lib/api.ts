import type {
  AdminCommunityReport,
  CommunityReportStatus,
  CommunityReportType,
  CommunitySignal,
  DetectionResult,
  PublicCommunityReport,
  ScamReport,
} from "@/types";
import { supabase } from "@/lib/supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiEnvelope<T> {
  status: string;
  data: T;
}

async function handleEnvelopeResponse<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => ({}))) as ApiEnvelope<T> & {
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    const message =
      (body.data as { message?: string } | undefined)?.message ??
      body.error ??
      body.message ??
      res.statusText;
    throw new Error(message || "API request failed");
  }

  if (body.status !== "ok") {
    throw new Error("API request failed");
  }

  return body.data;
}

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
  ocrImage: async (
    imageBase64: string,
    language = "en",
  ): Promise<DetectionResult> => {
    const headers = {
      "Content-Type": "application/json",
      ...(await authHeaders()),
    };

    const ocrRes = await fetch(`${API_URL}/api/ocr`, {
      method: "POST",
      headers,
      body: JSON.stringify({ imageBase64, language }),
    });

    if (ocrRes.status === 404) {
      return fetch(`${API_URL}/api/scan-screenshot`, {
        method: "POST",
        headers,
        body: JSON.stringify({ imageBase64, language }),
      }).then(handleResponse<DetectionResult>);
    }

    return handleResponse<DetectionResult>(ocrRes);
  },

  /** POST /api/scan-screenshot */
  scanScreenshot: async (
    imageBase64: string,
    language = "en",
  ): Promise<DetectionResult> => api.ocrImage(imageBase64, language),

  /** POST /api/report-scam — DEPRECATED: use createCommunityReport */
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

  /** POST /api/reports */
  createCommunityReport: async (body: {
    reportType: CommunityReportType;
    reportedValue: string;
    messageContent?: string;
    screenshotBase64?: string;
    description: string;
    language: string;
    anonId: string;
  }): Promise<{ id: string }> =>
    fetch(`${API_URL}/api/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify(body),
    }).then(handleEnvelopeResponse<{ id: string }>),

  /** GET /api/reports/check?value= */
  checkCommunityReports: async (value: string): Promise<CommunitySignal> =>
    fetch(
      `${API_URL}/api/reports/check?value=${encodeURIComponent(value)}`,
    ).then(handleEnvelopeResponse<CommunitySignal>),

  /** GET /api/reports/public */
  listPublicCommunityReports: async (
    page = 1,
    limit = 20,
  ): Promise<{
    items: PublicCommunityReport[];
    page: number;
    limit: number;
  }> => {
    const data = await fetch(
      `${API_URL}/api/reports/public?page=${page}&limit=${limit}`,
    ).then(
      handleEnvelopeResponse<{
        items: Array<{
          id: string;
          reported_value: string;
          report_type: CommunityReportType;
          created_at: string;
        }>;
        page: number;
        limit: number;
      }>,
    );
    return {
      page: data.page,
      limit: data.limit,
      items: data.items.map((item) => ({
        id: item.id,
        reportedValue: item.reported_value,
        reportType: item.report_type,
        createdAt: item.created_at,
      })),
    };
  },

  /** GET /api/admin/reports */
  listAdminReports: async (
    status: CommunityReportStatus = "pending",
    page = 1,
    limit = 20,
  ): Promise<{ items: AdminCommunityReport[]; page: number; limit: number }> => {
    const data = await fetch(
      `${API_URL}/api/admin/reports?status=${status}&page=${page}&limit=${limit}`,
      { headers: { ...(await authHeaders()) } },
    ).then(
      handleEnvelopeResponse<{
        items: Array<{
          id: string;
          reporter_user_id: string | null;
          reporter_anon_id: string | null;
          report_type: CommunityReportType;
          reported_value: string;
          message_content: string | null;
          screenshot_url: string | null;
          description: string;
          language: string;
          status: CommunityReportStatus;
          moderator_id: string | null;
          moderator_notes: string | null;
          created_at: string;
          reviewed_at: string | null;
        }>;
        page: number;
        limit: number;
      }>,
    );
    return {
      page: data.page,
      limit: data.limit,
      items: data.items.map((item) => ({
        id: item.id,
        reporterUserId: item.reporter_user_id,
        reporterAnonId: item.reporter_anon_id,
        reportType: item.report_type,
        reportedValue: item.reported_value,
        messageContent: item.message_content,
        screenshotUrl: item.screenshot_url,
        description: item.description,
        language: item.language,
        status: item.status,
        moderatorId: item.moderator_id,
        moderatorNotes: item.moderator_notes,
        createdAt: item.created_at,
        reviewedAt: item.reviewed_at,
      })),
    };
  },

  /** PATCH /api/admin/reports/:id */
  moderateCommunityReport: async (
    id: string,
    body: { status: "approved" | "rejected"; moderatorNotes?: string },
  ): Promise<AdminCommunityReport> => {
    const item = await fetch(`${API_URL}/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify(body),
    }).then(
      handleEnvelopeResponse<{
        id: string;
        reporter_user_id: string | null;
        reporter_anon_id: string | null;
        report_type: CommunityReportType;
        reported_value: string;
        message_content: string | null;
        screenshot_url: string | null;
        description: string;
        language: string;
        status: CommunityReportStatus;
        moderator_id: string | null;
        moderator_notes: string | null;
        created_at: string;
        reviewed_at: string | null;
      }>,
    );
    return {
      id: item.id,
      reporterUserId: item.reporter_user_id,
      reporterAnonId: item.reporter_anon_id,
      reportType: item.report_type,
      reportedValue: item.reported_value,
      messageContent: item.message_content,
      screenshotUrl: item.screenshot_url,
      description: item.description,
      language: item.language,
      status: item.status,
      moderatorId: item.moderator_id,
      moderatorNotes: item.moderator_notes,
      createdAt: item.created_at,
      reviewedAt: item.reviewed_at,
    };
  },

  /** GET /api/scam-database */
  getScamDatabase: (): Promise<ScamReport[]> =>
    fetch(`${API_URL}/api/scam-database`).then(handleResponse<ScamReport[]>),

  /** GET /api/user/scans — requires authentication */
  getUserScans: async (): Promise<ScamReport[]> =>
    fetch(`${API_URL}/api/user/scans`, {
      headers: { ...(await authHeaders()) },
    }).then(handleResponse<ScamReport[]>),

  /** POST /api/disclaimer/acknowledge */
  acknowledgeDisclaimer: async (body: {
    anonId: string;
    language: string;
    disclaimerVersion: string;
  }): Promise<{ id: string }> =>
    fetch(`${API_URL}/api/disclaimer/acknowledge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify(body),
    }).then(handleEnvelopeResponse<{ id: string }>),

  /** PATCH /api/disclaimer/acknowledge/merge */
  mergeDisclaimerAcknowledgment: async (
    anonId: string,
  ): Promise<{ merged: boolean }> =>
    fetch(`${API_URL}/api/disclaimer/acknowledge/merge`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify({ anonId }),
    }).then(handleEnvelopeResponse<{ merged: boolean }>),
};
