import { ImageAnnotatorClient, protos } from "@google-cloud/vision";

type DocumentTextDetectionResponse = Awaited<
  ReturnType<ImageAnnotatorClient["documentTextDetection"]>
>;
type VisionPage = protos.google.cloud.vision.v1.IPage;
type VisionBlock = protos.google.cloud.vision.v1.IBlock;

// ── OCR Service using Google Cloud Vision API ─────────────────
//
// Uses documentTextDetection, which is optimised for dense text in
// screenshots (messages, documents, mixed layouts). It returns a
// fullTextAnnotation with per-block confidence scores.
//
// Authentication (pick one):
//
//   Local dev  — set GOOGLE_APPLICATION_CREDENTIALS to the path of
//                your service-account JSON key file.
//
//   Deployment — set GOOGLE_CLOUD_CREDENTIALS to the entire JSON key
//                as a single-line string in your Render environment
//                variables (no file needed on the server).
//
// Docs: https://cloud.google.com/vision/docs/ocr

export interface OCRResult {
  extractedText: string;
  /** Average block-level confidence (0–1) from the Vision API response. */
  confidence?: number;
}

/** Build an authenticated Vision client from env vars. */
function createClient(): ImageAnnotatorClient {
  const credentialsJson = process.env.GOOGLE_CLOUD_CREDENTIALS;
  console.log(
    "Creating Vision client. Credentials provided:",
    Boolean(credentialsJson),
  );
  if (credentialsJson) {
    try {
      // Render / cloud: credentials stored as a JSON string in an env var.
      const parsed = JSON.parse(credentialsJson) as {
        client_email?: string;
        private_key?: string;
        project_id?: string;
      };

      if (!parsed.client_email || !parsed.private_key) {
        throw new Error(
          "GOOGLE_CLOUD_CREDENTIALS is missing required keys: client_email/private_key.",
        );
      }

      // Some platforms keep escaped newlines in env vars; normalize for PEM parsing.
      const credentials = {
        ...parsed,
        private_key: parsed.private_key.replace(/\\n/g, "\n"),
      };

      return new ImageAnnotatorClient({ credentials });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(
        "Invalid GOOGLE_CLOUD_CREDENTIALS value. " +
          "Provide a valid service-account JSON string. " +
          `Details: ${message}`,
      );
    }
  }
  // Local dev: GOOGLE_APPLICATION_CREDENTIALS points to the key file path.
  return new ImageAnnotatorClient();
}

/**
 * Extract text from a base64-encoded image using Google Cloud Vision.
 *
 * @param imageBase64 - Raw base64 string or a data-URL
 *                      (the "data:image/...;base64," prefix is stripped automatically).
 * @returns OCRResult  with the extracted text and an optional average confidence score.
 *
 * @throws If the Vision API call fails or returns no text.
 */
export async function extractTextFromImage(
  imageBase64: string,
): Promise<OCRResult> {
  // Strip the optional data-URL prefix so we always pass raw base64.
  const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");

  if (!cleanBase64 || !/^[A-Za-z0-9+/]+=*$/.test(cleanBase64)) {
    throw new Error("Invalid base64 image data provided to OCR service.");
  }

  const client = createClient();

  let annotateResponse: DocumentTextDetectionResponse;

  try {
    // documentTextDetection is more accurate than textDetection for
    // dense layouts like chat screenshots and forwarded messages.
    annotateResponse = await client.documentTextDetection({
      image: { content: cleanBase64 },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Google Cloud Vision OCR failed: ${message}`);
  }

  const [response] = annotateResponse;
  const fullText = response.fullTextAnnotation?.text?.trim() ?? "";
  console.log("full text: ", fullText);

  if (!fullText) {
    // Graceful fallback to the simpler textAnnotations array.
    const basic = response.textAnnotations?.[0]?.description?.trim() ?? "";
    console.log("Vision API returned no text. Full response:", basic);

    if (!basic) {
      throw new Error(
        "Google Cloud Vision returned no text for this image. " +
          "The image may be empty, too small, or unsupported.",
      );
    }
    return { extractedText: basic };
  }

  // Compute average block-level confidence across all pages.
  const blocks = (response.fullTextAnnotation?.pages ?? []).flatMap(
    (p: VisionPage) => p.blocks ?? [],
  );
  const confidenceValues = blocks
    .map((b: VisionBlock) => b.confidence ?? 0)
    .filter((c: number) => c > 0);
  const confidence =
    confidenceValues.length > 0
      ? confidenceValues.reduce((sum: number, c: number) => sum + c, 0) /
        confidenceValues.length
      : undefined;

  return { extractedText: fullText, confidence };
}
