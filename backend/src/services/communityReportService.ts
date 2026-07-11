import { randomUUID } from "crypto";
import { supabase } from "../utils/supabase";

export type CommunityReportType =
  | "phone"
  | "url"
  | "business_name"
  | "message";

export type CommunityReportStatus = "pending" | "approved" | "rejected";

export interface InsertCommunityReportInput {
  reporterUserId?: string;
  reporterAnonId?: string;
  reportType: CommunityReportType;
  reportedValue: string;
  messageContent?: string;
  screenshotUrl?: string;
  description: string;
  language: string;
}

export interface CommunityReportRow {
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
}

const BUCKET = "scam-report-screenshots";

/** Normalize reported values so check lookups match inserts. */
export function normalizeReportedValue(
  reportType: CommunityReportType | "lookup",
  value: string,
): string {
  const trimmed = value.trim();
  if (reportType === "phone") {
    return trimmed.replace(/\D/g, "");
  }
  if (reportType === "url" || reportType === "lookup") {
    try {
      const withScheme = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
      const url = new URL(withScheme);
      const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
      return `${url.hostname.toLowerCase()}${path.toLowerCase()}${url.search}`;
    } catch {
      return trimmed.toLowerCase();
    }
  }
  if (reportType === "message") {
    return trimmed.slice(0, 200).toLowerCase();
  }
  return trimmed.toLowerCase();
}

export function validateReportedValue(
  reportType: CommunityReportType,
  reportedValue: string,
  messageContent?: string,
): string | null {
  if (reportType === "phone") {
    const digits = reportedValue.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      return "phone must contain 7–15 digits";
    }
    return null;
  }
  if (reportType === "url") {
    try {
      const withScheme = /^https?:\/\//i.test(reportedValue.trim())
        ? reportedValue.trim()
        : `https://${reportedValue.trim()}`;
      const url = new URL(withScheme);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "url must be http or https";
      }
      return null;
    } catch {
      return "url is not a valid URL";
    }
  }
  if (reportType === "business_name") {
    if (reportedValue.trim().length < 2) {
      return "business name must be at least 2 characters";
    }
    return null;
  }
  // message
  const content = (messageContent ?? reportedValue).trim();
  if (content.length < 10) {
    return "message content must be at least 10 characters";
  }
  return null;
}

export async function uploadScreenshot(
  base64: string,
): Promise<string> {
  if (!supabase) {
    throw new Error("Database unavailable");
  }

  const clean = base64.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(clean, "base64");
  const path = `${randomUUID()}.png`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) {
    throw new Error("Failed to upload screenshot");
  }

  return path;
}

export async function insertCommunityReport(
  input: InsertCommunityReportInput,
): Promise<string> {
  if (!supabase) {
    throw new Error("Database unavailable");
  }

  const { data, error } = await supabase
    .from("community_scam_reports")
    .insert({
      reporter_user_id: input.reporterUserId ?? null,
      reporter_anon_id: input.reporterAnonId ?? null,
      report_type: input.reportType,
      reported_value: input.reportedValue,
      message_content: input.messageContent ?? null,
      screenshot_url: input.screenshotUrl ?? null,
      description: input.description,
      language: input.language,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Failed to save community report");
  }

  return data.id as string;
}

export async function checkApprovedReports(normalizedValue: string): Promise<{
  reportCount: number;
  reportTypes: CommunityReportType[];
}> {
  if (!supabase) {
    throw new Error("Database unavailable");
  }

  const { data, error } = await supabase
    .from("community_scam_reports")
    .select("report_type")
    .eq("reported_value", normalizedValue)
    .eq("status", "approved");

  if (error) {
    throw new Error("Failed to check community reports");
  }

  const rows = data ?? [];
  const types = Array.from(
    new Set(rows.map((r) => r.report_type as CommunityReportType)),
  );

  return { reportCount: rows.length, reportTypes: types };
}

export async function listPublicApprovedReports(
  page: number,
  limit: number,
): Promise<{
  items: Array<{
    id: string;
    reported_value: string;
    report_type: CommunityReportType;
    created_at: string;
  }>;
  page: number;
  limit: number;
}> {
  if (!supabase) {
    throw new Error("Database unavailable");
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("community_scam_reports")
    .select("id, reported_value, report_type, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error("Failed to list public reports");
  }

  return {
    items: (data ?? []) as Array<{
      id: string;
      reported_value: string;
      report_type: CommunityReportType;
      created_at: string;
    }>,
    page,
    limit,
  };
}

export async function listAdminReports(
  status: CommunityReportStatus,
  page: number,
  limit: number,
): Promise<{ items: CommunityReportRow[]; page: number; limit: number }> {
  if (!supabase) {
    throw new Error("Database unavailable");
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("community_scam_reports")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error("Failed to list admin reports");
  }

  return {
    items: (data ?? []) as CommunityReportRow[],
    page,
    limit,
  };
}

export async function updateReportStatus(
  id: string,
  status: "approved" | "rejected",
  moderatorId: string,
  moderatorNotes?: string,
): Promise<CommunityReportRow | null> {
  if (!supabase) {
    throw new Error("Database unavailable");
  }

  const { data, error } = await supabase
    .from("community_scam_reports")
    .update({
      status,
      moderator_id: moderatorId,
      moderator_notes: moderatorNotes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error("Failed to update report status");
  }

  return (data as CommunityReportRow | null) ?? null;
}
