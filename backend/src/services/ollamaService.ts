import { Ollama } from "ollama";
import type { AIClassification } from "../detection/types";

// ── Ollama AI Classification Service ─────────────────────────

const ollama = new Ollama({
  host: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
});

const MODEL = process.env.OLLAMA_MODEL || "llama3";

const SYSTEM_PROMPT = `You are a cybersecurity expert specializing in phishing and scam detection.
Analyze the following message and classify it as exactly one of these three categories:
SAFE - The message appears legitimate with no suspicious indicators.
SUSPICIOUS - The message has some concerning elements but may not be definitively phishing.
PHISHING - The message is clearly a phishing or scam attempt.

Respond with ONLY the single word: SAFE, SUSPICIOUS, or PHISHING.
Do not include any explanation or other text.`;

/**
 * Classify a message using the local Ollama LLM.
 * Returns null if Ollama is unavailable.
 * Implemented fully in Step 9.
 */
export async function classifyWithOllama(
  text: string,
): Promise<AIClassification | null> {
    // Truncate input to prevent prompt injection via very long texts
    const safeText = text.slice(0, 2000);

    const response = await ollama.chat({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: safeText },
      ],
      options: { temperature: 0 },
    });

    const raw = response.message?.content?.trim().toUpperCase();
    if (raw === "SAFE" || raw === "SUSPICIOUS" || raw === "PHISHING") {
      return raw as AIClassification;
    }
    return null;
  } 
