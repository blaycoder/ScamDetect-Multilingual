import type { LanguageCode } from "@/types";

export interface OnboardingLanguage {
  code: LanguageCode;
  nativeName: string;
  flag: string;
}

export const ONBOARDING_LANGUAGES: OnboardingLanguage[] = [
  { code: "en-US", nativeName: "English", flag: "🇺🇸" },
  { code: "yo-NG", nativeName: "Yorùbá", flag: "🇳🇬" },
  { code: "ha-NG", nativeName: "Hausa", flag: "🇳🇬" },
  { code: "ig-NG", nativeName: "Igbo", flag: "🇳🇬" },
  { code: "fr-CA", nativeName: "Français", flag: "🇨🇦" },
  { code: "es-ES", nativeName: "Español", flag: "🇪🇸" },
  { code: "ta-IN", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "en-PT", nativeName: "Português", flag: "🇵🇹" },
];
