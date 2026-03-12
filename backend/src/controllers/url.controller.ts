import { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validate";
import { runDetectionPipeline } from "../services/detectionService";
import {
  saveDetectionResult,
  saveUrlScan,
  updateUrlScanResult,
} from "../services/supabaseService";

export const checkUrlValidators = [
  body("url")
    .isString()
    .trim()
    .isURL({ require_protocol: true })
    .withMessage("url must be a valid URL with http/https protocol"),
  body("language").optional().isString().isLength({ min: 2, max: 5 }),
  validateRequest,
];

export async function checkUrl(req: Request, res: Response): Promise<void> {
  const { url, language } = req.body as { url: string; language?: string };
  try {
    const result = await runDetectionPipeline(url, language ?? "en");

    // Persist URL scan record with VT analysis ID (fire-and-forget)
    (async () => {
      try {
        const vtAnalysisId = result.virustotalResult?.vtAnalysisId ?? null;
        const scanId = await saveUrlScan(url, vtAnalysisId, req.userId);
        if (scanId && result.virustotalResult) {
          const status = vtAnalysisId ? "completed" : "failed";
          await updateUrlScanResult(scanId, result.virustotalResult, status);
        }
      } catch (dbErr) {
        console.error("[checkUrl] DB save error:", dbErr);
      }
    })();

    // Also persist in legacy scam_reports table for the dashboard
    saveDetectionResult(url, result, req.userId).catch(() => {});

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "URL check failed" });
  }
}
