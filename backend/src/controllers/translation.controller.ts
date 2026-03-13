import { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validate";
import { translateText } from "../services/translationService";

export const translateUiValidators = [
  body("texts")
    .isArray({ min: 1, max: 250 })
    .withMessage("texts must be an array with 1-250 items"),
  body("texts.*")
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage("each text must be a non-empty string up to 500 chars"),
  body("targetLanguage")
    .isString()
    .isLength({ min: 2, max: 10 })
    .withMessage("targetLanguage is required"),
  validateRequest,
];

export async function translateUi(req: Request, res: Response): Promise<void> {
  const { texts, targetLanguage } = req.body as {
    texts: string[];
    targetLanguage: string;
  };

  try {
    if (targetLanguage === "en") {
      res.json({ translations: texts });
      return;
    }

    const uniqueTexts = Array.from(new Set(texts));
    const translatedUnique = await Promise.all(
      uniqueTexts.map((text) => translateText(text, targetLanguage)),
    );

    const lookup = new Map<string, string>();
    for (let i = 0; i < uniqueTexts.length; i += 1) {
      lookup.set(uniqueTexts[i], translatedUnique[i]);
    }

    const translations = texts.map((text) => lookup.get(text) ?? text);
    res.json({ translations });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown translation error";
    res.status(500).json({
      error: "UI translation failed",
      details: message,
    });
  }
}
