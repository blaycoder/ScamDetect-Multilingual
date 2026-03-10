import { Request, Response } from "express";
import { getRecentScamReports } from "../services/supabaseService";

export async function getScamDatabase(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const reports = await getRecentScamReports(50);
    res.json(reports);
  } catch {
    res.status(500).json({ error: "Failed to fetch scam database" });
  }
}
