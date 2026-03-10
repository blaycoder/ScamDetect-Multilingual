import Tesseract from "tesseract.js";

// ── OCR Service using Tesseract.js ───────────────────────────

/**
 * Extract text from a base64-encoded image using Tesseract.js OCR.
 * Supports PNG, JPEG, WebP.
 */
export async function extractTextFromImage(
  imageBase64: string,
): Promise<string> {
  // Convert base64 to a Buffer
  const buffer = Buffer.from(imageBase64, "base64");

  const result = await Tesseract.recognize(buffer, "eng", {
    logger: () => {}, // Suppress verbose output
  });

  return result.data.text.trim();
}
