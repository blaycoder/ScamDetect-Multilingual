"use client";

import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/types";

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-[#6b7280] tracking-widest">
        TRANSLATE TO:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LanguageCode)}
        className="rounded border border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.05)] px-3 py-1.5 font-mono text-xs text-[#00f0ff] focus:border-[rgba(0,240,255,0.5)] focus:outline-none"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-[#0f0f1a]">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
