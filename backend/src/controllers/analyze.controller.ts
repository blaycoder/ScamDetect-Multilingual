import { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validate";
import { runDetectionPipeline } from "../services/detectionService";
import { saveDetectionResult } from "../services/supabaseService";

export const analyzeMessageValidators = [
  body("message")
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("message must be 1–5000 characters"),
  body("language")
    .optional()
    .isString()
    .isLength({ min: 2, max: 5 })
    .withMessage("language code must be 2–5 characters"),
  validateRequest,
];

export async function analyzeMessage(
  req: Request,
  res: Response,
): Promise<void> {
  const { message, language } = req.body as {
    message: string;
    language?: string;
  };
  try {
    const result = await runDetectionPipeline(message, language ?? "en");
    // Persist asynchronously — don't block the response
    saveDetectionResult(message, result, req.userId).catch(() => {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Detection pipeline failed" });
  }
}
