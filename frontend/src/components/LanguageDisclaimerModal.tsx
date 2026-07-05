"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LanguageCode } from "@/types";
import { ONBOARDING_LANGUAGES } from "@/lib/languages";
import {
  DISCLAIMER_VERSION,
  ensureAnonId,
  markDisclaimerAcknowledged,
} from "@/lib/onboarding";
import { api } from "@/lib/api";

interface LanguageDisclaimerModalProps {
  open: boolean;
  initialStep?: 1 | 2;
  defaultLanguage: LanguageCode;
  onComplete: (language: LanguageCode) => void;
}

const DISCLAIMER_BODY =
  "This tool analyzes messages, URLs, and screenshots to flag possible scams using automated detection. It is not 100% accurate and can produce false positives (flagging safe content) or false negatives (missing real scams). Results are for informational purposes only and should not replace your own judgment or verification with official sources.";

export function LanguageDisclaimerModal({
  open,
  initialStep = 1,
  defaultLanguage,
  onComplete,
}: LanguageDisclaimerModalProps) {
  const resolvedDefault = useMemo(() => {
    return ONBOARDING_LANGUAGES.some((lang) => lang.code === defaultLanguage)
      ? defaultLanguage
      : "en-US";
  }, [defaultLanguage]);

  const [step, setStep] = useState<1 | 2>(initialStep);
  const [selected, setSelected] = useState<LanguageCode>(resolvedDefault);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep(initialStep);
      setSelected(resolvedDefault);
      setChecked(false);
      setError(null);
    }
  }, [open, initialStep, resolvedDefault]);

  useEffect(() => {
    if (!open || step !== 2) return;

    function blockEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    document.addEventListener("keydown", blockEscape, true);
    return () => document.removeEventListener("keydown", blockEscape, true);
  }, [open, step]);

  function handleLanguageSelect(code: LanguageCode) {
    setSelected(code);
    setStep(2);
    setError(null);
  }

  async function handleContinue() {
    if (!checked || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const anonId = ensureAnonId();
      await api.acknowledgeDisclaimer({
        anonId,
        language: selected,
        disclaimerVersion: DISCLAIMER_VERSION,
      });
      markDisclaimerAcknowledged();
      onComplete(selected);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save acknowledgment. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={
        step === 1 ? "language-modal-title" : "disclaimer-modal-title"
      }
      onClick={(e) => {
        if (step === 2) e.stopPropagation();
      }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-[rgba(125,249,255,0.3)] bg-[#0f1320] p-6 shadow-[0_0_40px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
            >
              <h2
                id="language-modal-title"
                className="font-mono text-xl font-semibold text-[#e2e8ff]"
              >
                Select Your Preferred Language
              </h2>
              <p className="mt-2 text-sm text-[#94a3b8]">
                Choose once to personalize the entire ScamDetect interface.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ONBOARDING_LANGUAGES.map((lang) => {
                  const active = selected === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`flex flex-col items-center gap-1 rounded-md border px-2 py-3 text-center text-sm transition-colors ${
                        active
                          ? "border-[#7df9ff] bg-[rgba(125,249,255,0.12)] text-[#e2e8ff]"
                          : "border-[rgba(125,249,255,0.2)] bg-transparent text-[#cbd5e1] hover:border-[rgba(125,249,255,0.4)]"
                      }`}
                    >
                      <span className="text-xl" aria-hidden>
                        {lang.flag}
                      </span>
                      <span className="text-xs leading-tight">
                        {lang.nativeName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              <h2
                id="disclaimer-modal-title"
                className="font-mono text-xl font-semibold text-[#e2e8ff]"
                data-no-translate
              >
                Before you continue
              </h2>
              <p
                className="mt-3 text-sm leading-relaxed text-[#94a3b8]"
                data-no-translate
              >
                {DISCLAIMER_BODY}
              </p>

              <label
                className="mt-5 flex cursor-pointer items-start gap-3"
                data-no-translate
              >
                <input
                  id="disclaimer-ack-checkbox"
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#7df9ff]"
                />
                <span className="text-sm text-[#cbd5e1]">
                  I understand the results are an estimate, not a guarantee.
                </span>
              </label>

              {error && (
                <p
                  className="mt-3 text-sm text-[#ff003c]"
                  role="alert"
                  data-no-translate
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={() => void handleContinue()}
                disabled={!checked || submitting}
                aria-disabled={!checked || submitting}
                className={`mt-6 w-full rounded-md px-4 py-2 font-semibold transition-opacity ${
                  checked && !submitting
                    ? "bg-[#7df9ff] text-[#001017] hover:opacity-90"
                    : "cursor-not-allowed bg-[#7df9ff]/40 text-[#001017]/60"
                }`}
                data-no-translate
              >
                {submitting ? "Saving..." : "Continue"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
