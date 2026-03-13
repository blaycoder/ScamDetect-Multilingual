"use client";

import { useMemo, useState } from "react";
import type { LanguageCode } from "@/types";

interface LanguageSelectorModalProps {
  open: boolean;
  defaultLanguage: LanguageCode;
  onConfirm: (language: LanguageCode) => void;
}

const MODAL_LANGUAGES: Array<{ code: LanguageCode; label: string }> = [
  { code: "en-US", label: "English" },
  { code: "yo-NG", label: "Yoruba" },
  { code: "ha-NG", label: "Hausa" },
  { code: "ig-NG", label: "Igbo" },
  { code: "fr-CA", label: "French" },
  { code: "es-ES", label: "Spanish" },
  { code: "ta-IN", label: "Tamil" },
  { code: "en-PT", label: "Portugal" },
];

export function LanguageSelectorModal({
  open,
  defaultLanguage,
  onConfirm,
}: LanguageSelectorModalProps) {
  const initial = useMemo(() => {
    return MODAL_LANGUAGES.some((lang) => lang.code === defaultLanguage)
      ? defaultLanguage
      : "en-US";
  }, [defaultLanguage]);

  const [selected, setSelected] = useState<LanguageCode>(initial);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[rgba(125,249,255,0.3)] bg-[#0f1320] p-6 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
        <h2
          id="language-modal-title"
          className="font-mono text-xl font-semibold text-[#e2e8ff]"
        >
          Select Your Preferred Language
        </h2>
        <p className="mt-2 text-sm text-[#94a3b8]">
          Choose once to personalize the entire ScamRadar interface.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-2">
          {MODAL_LANGUAGES.map((lang) => {
            const active = selected === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelected(lang.code)}
                className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? "border-[#7df9ff] bg-[rgba(125,249,255,0.12)] text-[#e2e8ff]"
                    : "border-[rgba(125,249,255,0.2)] bg-transparent text-[#cbd5e1] hover:border-[rgba(125,249,255,0.4)]"
                }`}
              >
                {lang.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onConfirm(selected)}
          className="mt-6 w-full rounded-md bg-[#7df9ff] px-4 py-2 font-semibold text-[#001017] transition-opacity hover:opacity-90"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
