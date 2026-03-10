import { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validate";
import { saveCommunityReport } from "../services/supabaseService";

export const reportScamValidators = [
  body("message")
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("message must be 1–5000 characters"),
  body("screenshotUrl")
    .optional()
    .isURL()
    .withMessage("screenshotUrl must be a valid URL"),
  validateRequest,
];

export async function reportScam(req: Request, res: Response): Promise<void> {
  const { message, screenshotUrl } = req.body as {
    message: string;
    screenshotUrl?: string;
  };
  try {
    const id = await saveCommunityReport(message, screenshotUrl);
    res.json({ id, success: true });
  } catch {
    res.status(500).json({ error: "Failed to save report" });
  }
}
