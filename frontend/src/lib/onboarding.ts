import type { LanguageCode } from "@/types";

export const ANON_ID_KEY = "scamdetect_anon_id";
export const DISCLAIMER_ACK_KEY = "hasAcknowledgedDisclaimer";
export const PREFERRED_LANGUAGE_KEY = "preferred_language";
export const DISCLAIMER_VERSION = "v1.0";

export function ensureAnonId(): string {
  if (typeof window === "undefined") return "";

  const existing = localStorage.getItem(ANON_ID_KEY);
  if (existing) return existing;

  const anonId = crypto.randomUUID();
  localStorage.setItem(ANON_ID_KEY, anonId);
  return anonId;
}

export function getAnonId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ANON_ID_KEY);
}

export function hasAcknowledgedDisclaimer(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DISCLAIMER_ACK_KEY) === "true";
}

export function markDisclaimerAcknowledged(): void {
  localStorage.setItem(DISCLAIMER_ACK_KEY, "true");
}

export function hasStoredLanguage(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(PREFERRED_LANGUAGE_KEY);
  return stored !== null && stored.length > 0;
}

export function getStoredLanguage(): LanguageCode | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PREFERRED_LANGUAGE_KEY) as LanguageCode | null;
}
