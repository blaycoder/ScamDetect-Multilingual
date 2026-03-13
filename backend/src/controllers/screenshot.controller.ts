import { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validate";
import { extractTextFromImage } from "../services/ocrService";
import { runDetectionPipeline } from "../services/detectionService";
import { saveDetectionResult } from "../services/supabaseService";

export const scanScreenshotValidators = [
  body("imageBase64")
    .isString()
    .notEmpty()
    .withMessage("imageBase64 is required"),
  body("language").optional().isString().isLength({ min: 2, max: 5 }),
  validateRequest,
];

export async function scanScreenshot(
  req: Request,
  res: Response,
): Promise<void> {
  const { imageBase64, language } = req.body as {
    imageBase64: string;
    language?: string;
  };
  try {
    const { extractedText } = await extractTextFromImage(imageBase64);
    if (!extractedText) {
      res.status(422).json({ error: "Could not extract text from the image" });
      return;
    }
    const result = await runDetectionPipeline(extractedText, language ?? "en");
    saveDetectionResult(extractedText, result, req.userId).catch(() => {});
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[scanScreenshot] failed", {
      hasImage: Boolean(imageBase64),
      imageLength: imageBase64?.length ?? 0,
      language: language ?? "en",
      message,
      stack: err instanceof Error ? err.stack : undefined,
    });
    res.status(500).json({
      error: "Screenshot scan failed",
      details: message,
    });
  }
}
