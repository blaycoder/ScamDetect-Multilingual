import { Request, Response } from "express";
import { supabase } from "../utils/supabase";

/**
 * GET /api/user/scans
 * Returns the authenticated user's scan history (most recent first).
 * Requires requireAuth middleware — req.userId is guaranteed.
 */
export async function getUserScans(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;

  if (!supabase) {
    res.status(503).json({ error: "Database service unavailable" });
    return;
  }

  const { data, error } = await supabase
    .from("scam_reports")
    .select("id, message, risk_score, risk_level, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[getUserScans] Supabase error:", error.message);
    res.status(500).json({ error: "Failed to load scan history" });
    return;
  }

  res.json(
    (data ?? []).map((row) => ({
      id: row.id,
      message: row.message,
      riskScore: row.risk_score,
      riskLevel: row.risk_level,
      createdAt: row.created_at,
    })),
  );
}
