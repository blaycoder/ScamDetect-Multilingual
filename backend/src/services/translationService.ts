import { LingoDotDevEngine } from "lingo.dev/sdk";

const engine = new LingoDotDevEngine({
  apiKey: process.env.LINGODOTDEV_API_KEY,
});

export async function translateText(
  text: string,
  targetLanguage: string,
): Promise<string> {
  if (!process.env.LINGODOTDEV_API_KEY || targetLanguage === "en") return text;

  const result = await engine.localizeText(text, {
    sourceLocale: "en",
    targetLocale: targetLanguage,
  });

  return result ?? text;
}