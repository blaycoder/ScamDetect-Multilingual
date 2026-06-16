import { createWorker } from "tesseract.js";
import sharp from "sharp";

export interface OCRResult {
  extractedText: string;
  /** Average word-level confidence (0–1) from Tesseract. */
  confidence?: number;
}

// Maps the subset of BCP-47 language prefixes most likely to appear in
// scam/phishing screenshots to Tesseract 3-letter data file names.
// Falls back to English ("eng") for unrecognised codes.
const LANG_MAP: Record<string, string> = {
  en: "eng",
  fr: "fra",
  de: "deu",
  es: "spa",
  it: "ita",
  pt: "por",
  zh: "chi_sim",
  ja: "jpn",
  ko: "kor",
  ar: "ara",
  ru: "rus",
  hi: "hin",
  yo: "yor", // Yoruba — common in West African scam messages
  ha: "hau", // Hausa
};

function toTesseractLang(lang?: string): string {
  if (!lang) return "eng";
  const base = lang.split("-")[0].toLowerCase();
  return LANG_MAP[base] ?? "eng";
}

// ── Image preprocessing ───────────────────────────────────────────────────────
//
// Raw screenshots fed directly to Tesseract often produce poor results because:
//   • Coloured chat bubbles (WhatsApp green, iMessage blue) create uneven
//     luminance that the classifier mistakes for ink.
//   • Low-contrast UI themes (dark mode) compress the tonal range.
//   • Mobile camera screenshots are slightly soft at the text edges.
//
// The three sharp operations below address each issue:
//   grayscale()  — collapses RGB to luma; eliminates colour interference
//   normalize()  — auto-stretches the histogram to [0, 255]; maximises contrast
//   sharpen()    — applies an unsharp mask; crisps glyph edges for the classifier
//
async function preprocessImage(base64: string): Promise<Buffer> {
  const raw = Buffer.from(base64, "base64");
  return sharp(raw).grayscale().normalize().sharpen().toBuffer();
}

/**
 * Extract text from a base64-encoded image using Tesseract.js.
 *
 * @param imageBase64 - Raw base64 string or data-URL
 *                      (the "data:image/...;base64," prefix is stripped).
 * @param language    - Optional BCP-47 language hint (e.g. "fr", "zh-CN").
 *                      Used to select the Tesseract language data file.
 *                      Defaults to English when omitted or unmapped.
 * @returns OCRResult with the extracted text and an optional confidence score.
 *
 * @throws If preprocessing or Tesseract recognition fails.
 */
export async function extractTextFromImage(
  imageBase64: string,
  language?: string,
): Promise<OCRResult> {
  // Strip the optional data-URL prefix so we always pass raw base64.
  const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");

  if (!cleanBase64) {
    throw new Error("Invalid base64 image data provided to OCR service.");
  }

  // ── Step 1: Preprocess ─────────────────────────────────────────────────────
  let imageBuffer: Buffer;
  try {
    imageBuffer = await preprocessImage(cleanBase64);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Image preprocessing failed: ${message}`);
  }

  // ── Step 2: OCR ────────────────────────────────────────────────────────────
  // A fresh worker is created per request. This is safe for concurrent requests
  // (each worker is an isolated WASM instance) at the cost of ~300–800 ms cold-
  // start overhead. For higher traffic, replace this with a worker pool.
  const tessLang = toTesseractLang(language);
  console.log(`[ocrService] Tesseract recognising — lang: ${tessLang}`);

  const worker = await createWorker(tessLang);

  try {
    const { data } = await worker.recognize(imageBuffer);
    const extractedText = data.text.trim();

    console.log(
      `[ocrService] Extracted ${extractedText.length} chars — ` +
        `confidence: ${data.confidence.toFixed(1)}%`,
    );
    console.log("OCR extracted text preview:", extractedText);

    if (!extractedText) {
      throw new Error(
        "Tesseract OCR returned no text. " +
          "The image may be too small, blurry, or contain no readable text.",
      );
    }

    // Tesseract reports confidence as 0–100; normalise to 0–1 to match the
    // shape that was previously returned by the Google Vision implementation.
    const confidence = data.confidence > 0 ? data.confidence / 100 : undefined;

    return { extractedText, confidence };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Tesseract OCR failed: ${message}`);
  } finally {
    // Always terminate so the WASM worker thread is released.
    await worker.terminate();
  }
}
