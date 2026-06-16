import { detectKeywords } from "../detection/keywords";
import { extractUrls, extractHostname } from "../detection/urlExtractor";
import { checkDomainSimilarity } from "../detection/domainSimilarity";
import { calculateRiskScore } from "../detection/riskScorer";
import type {
  DetectionResult,
  DetectionFlag,
  AIClassification,
} from "../detection/types";

// ── Detection Pipeline Service ────────────────────────────────
// Modules imported lazily to avoid crashing server if optional
// deps (VirusTotal, Ollama) are unavailable.

/**
 * Run the full phishing detection pipeline on a plain-text message.
 * VirusTotal and Ollama calls are optional — failures are swallowed
 * so the core keyword/domain scoring always returns a result.
 */
export async function runDetectionPipeline(
  text: string,
  language = "en",
): Promise<DetectionResult> {
  const flags: DetectionFlag[] = [];
  let aiClassification: AIClassification | undefined;
  let phishtankMatch = false;

  // ── 1. Keyword detection ──────────────────────────────────
  const keywordMatches = detectKeywords(text);
  for (const match of keywordMatches) {
    flags.push({
      type: "KEYWORD_MATCH",
      detail: `Phishing keyword detected: "${match.keyword}" [${match.category}]`,
      score: 20,
    });
  }

  // ── 2. URL extraction ─────────────────────────────────────
  const extractedUrls = extractUrls(text);

  // ── 3. Domain similarity detection ───────────────────────
  const suspiciousDomains: string[] = [];
  for (const url of extractedUrls) {
    const hostname = extractHostname(url);
    if (!hostname) continue;

    const similarity = checkDomainSimilarity(hostname);
    if (similarity) {
      suspiciousDomains.push(hostname);
      flags.push({
        type: "DOMAIN_IMPERSONATION",
        detail: `"${similarity.inputDomain}" looks like "${similarity.matchedTrusted}" (edit distance: ${similarity.distance})`,
        score: 25,
      });
    }
  }

  // ── 4. VirusTotal API check ────────────────────────────────
  let virustotalResult;
  if (extractedUrls.length > 0 && process.env.VIRUSTOTAL_API_KEY) {
    try {
      const { checkUrlVirusTotal } = await import("./virustotalService");
      virustotalResult = await checkUrlVirusTotal(extractedUrls[0]);
      if (virustotalResult && virustotalResult.malicious > 0) {
        flags.push({
          type: "VIRUSTOTAL_MALICIOUS",
          detail: `VirusTotal: ${virustotalResult.malicious} engines flagged this URL as malicious`,
          score: 40,
        });
      }
    } catch (err) {
      console.error("[VT] Error:", err);
    }
  }

  // ── 5. PhishTank check ────────────────────────────────────
  if (extractedUrls.length > 0) {
    try {
      const { checkPhishTank } = await import("./phishtankService");
      phishtankMatch = await checkPhishTank(extractedUrls[0]);
      if (phishtankMatch) {
        flags.push({
          type: "PHISHTANK_MATCH",
          detail: "URL found in PhishTank phishing database",
          score: 50,
        });
      }
    } catch {
      // PhishTank is optional
    }
  }

  // ── 6. AI classification (multi-level: Ollama + Groq) ──────
  // Both models run in parallel and each failure is isolated, so one
  // provider being down never blocks the other. The verdicts are
  // collapsed into the most-severe classification (PHISHING wins).
  try {
    const [{ classifyWithOllama }, { classifyWithGroq }] = await Promise.all([
      import("./ollamaService"),
      import("./groqService"),
    ]);

    const [ollamaVerdict, groqVerdict] = await Promise.all([
      classifyWithOllama(text).catch(() => null),
      classifyWithGroq(text).catch((err) => {
        console.error("[Groq] Error:", err);
        return null;
      }),
    ]);

    aiClassification = mostSevere(ollamaVerdict, groqVerdict) ?? undefined;

    const detail = `(Ollama: ${ollamaVerdict ?? "n/a"}, Groq: ${groqVerdict ?? "n/a"})`;
    if (aiClassification === "PHISHING") {
      flags.push({
        type: "AI_PHISHING",
        detail: `AI models classified this message as PHISHING ${detail}`,
        score: 30,
      });
    } else if (aiClassification === "SUSPICIOUS") {
      flags.push({
        type: "AI_PHISHING",
        detail: `AI models classified this message as SUSPICIOUS ${detail}`,
        score: 10,
      });
    }
  } catch (err) {
    console.error("[AI] Classification failed:", err);
    // Still returns result without AI classification
  }

  // ── 7. Risk scoring ───────────────────────────────────────
  const { score, level } = calculateRiskScore({
    keywordMatchCount: keywordMatches.length,
    suspiciousDomainCount: suspiciousDomains.length,
    virustotalMalicious: virustotalResult?.malicious ?? 0,
    phishtankMatch,
    aiClassification,
  });

  // ── 8. Optional translation ───────────────────────────────
  let translatedSummary: string | undefined;
  if (language !== "en" && process.env.LINGODOTDEV_API_KEY) {
    try {
      const { translateText } = await import("./translationService");
      const summary = buildSummary(score, level, flags.length);
      translatedSummary = await translateText(summary, language);
    } catch {
      // Translation is optional
    }
  }

  return {
    riskScore: score,
    riskLevel: level,
    flags,
    extractedUrls,
    aiClassification,
    virustotalResult: virustotalResult ?? undefined,
    phishtankMatch: phishtankMatch || undefined,
    translatedSummary,
    language,
  };
}

function buildSummary(score: number, level: string, flagCount: number): string {
  return `This message has been classified as ${level} with a risk score of ${score}/100. ${flagCount} threat indicator${flagCount !== 1 ? "s" : ""} were detected.`;
}

// Severity ranking used to merge multiple AI verdicts: the most
// cautious (highest-severity) non-null classification wins.
const AI_SEVERITY: Record<AIClassification, number> = {
  SAFE: 0,
  SUSPICIOUS: 1,
  PHISHING: 2,
};

function mostSevere(
  ...verdicts: (AIClassification | null)[]
): AIClassification | null {
  const present = verdicts.filter(
    (v): v is AIClassification => v !== null,
  );
  if (present.length === 0) return null;
  return present.reduce((a, b) => (AI_SEVERITY[b] > AI_SEVERITY[a] ? b : a));
}
