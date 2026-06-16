import OpenAI from "openai";
import type { AIClassification } from "../detection/types";

// ── Groq AI Classification Service ───────────────────────────
// Second AI verification layer alongside Ollama. Groq exposes an
// OpenAI-compatible API, so we reuse the official `openai` SDK and
// only override the base URL. The classification contract is
// identical to ollamaService: text in → SAFE | SUSPICIOUS | PHISHING.

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const SYSTEM_PROMPT = `You are a cybersecurity expert specializing in phishing and scam detection.
Analyze the following message and classify it as exactly one of these three categories:
SAFE - The message appears legitimate with no suspicious indicators.
SUSPICIOUS - The message has some concerning elements but may not be definitively phishing.
PHISHING - The message is clearly a phishing or scam attempt.

Respond with ONLY the single word: SAFE, SUSPICIOUS, or PHISHING.
Do not include any explanation or other text.`;

/**
 * Classify a message using Groq (second AI verification layer).
 *
 * @param text - The message to classify.
 * @returns The classification, or null when Groq is not configured,
 *          unavailable, or returns an unparseable response.
 */
export async function classifyWithGroq(
  text: string,
): Promise<AIClassification | null> {
  // No key configured → silently skip this layer.
  if (!process.env.XAI_API_KEY) return null;

  // Truncate input to prevent prompt injection via very long texts.
  const safeText = text.slice(0, 2000);

  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: safeText },
    ],
  });
  console.log("GROQ Response:", response);

  const raw = response.choices[0]?.message?.content?.trim().toUpperCase();
  if (raw === "SAFE" || raw === "SUSPICIOUS" || raw === "PHISHING") {
    return raw as AIClassification;
  }
  return null;
}
