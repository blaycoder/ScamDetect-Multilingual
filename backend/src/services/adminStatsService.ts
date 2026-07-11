import { supabase } from "../utils/supabase";

export interface AdminStats {
  totalScans: number;
  urlScans: number;
  /** Finer message vs screenshot breakdown is TODO — no type column exists. */
  scansBySource: {
    detectionLogs: number;
    urlScans: number;
  };
  reportsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  reportsLast7Days: number;
  topReportedValues: Array<{ reportedValue: string; count: number }>;
}

async function countTable(
  table: string,
  filters?: { column: string; value: string },
): Promise<number> {
  if (!supabase) return 0;
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filters) {
    q = q.eq(filters.column, filters.value);
  }
  const { count, error } = await q;
  if (error) {
    throw new Error(`Failed to count ${table}`);
  }
  return count ?? 0;
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!supabase) {
    throw new Error("Database unavailable");
  }

  const [
    totalScans,
    urlScans,
    pending,
    approved,
    rejected,
  ] = await Promise.all([
    countTable("scam_reports"),
    countTable("url_scans"),
    countTable("community_scam_reports", {
      column: "status",
      value: "pending",
    }),
    countTable("community_scam_reports", {
      column: "status",
      value: "approved",
    }),
    countTable("community_scam_reports", {
      column: "status",
      value: "rejected",
    }),
  ]);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: reportsLast7Days, error: weekErr } = await supabase
    .from("community_scam_reports")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo.toISOString());

  if (weekErr) {
    throw new Error("Failed to count recent reports");
  }

  const { data: approvedRows, error: topErr } = await supabase
    .from("community_scam_reports")
    .select("reported_value")
    .eq("status", "approved");

  if (topErr) {
    throw new Error("Failed to load top reported values");
  }

  const tallies = new Map<string, number>();
  for (const row of approvedRows ?? []) {
    const key = row.reported_value as string;
    tallies.set(key, (tallies.get(key) ?? 0) + 1);
  }

  const topReportedValues = Array.from(tallies.entries())
    .map(([reportedValue, count]) => ({ reportedValue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalScans,
    urlScans,
    scansBySource: {
      detectionLogs: totalScans,
      urlScans,
    },
    reportsByStatus: {
      pending,
      approved,
      rejected,
    },
    reportsLast7Days: reportsLast7Days ?? 0,
    topReportedValues,
  };
}
