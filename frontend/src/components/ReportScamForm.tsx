"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Flag, Upload, X } from "lucide-react";
import { api } from "@/lib/api";
import { ensureAnonId } from "@/lib/onboarding";
import { stripDataUrl } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import type { CommunityReportType } from "@/types";

const REPORT_TYPES: Array<{ value: CommunityReportType; label: string }> = [
  { value: "phone", label: "Phone number" },
  { value: "url", label: "URL" },
  { value: "business_name", label: "Business / person name" },
  { value: "message", label: "Message / email" },
];

function validateClient(
  reportType: CommunityReportType,
  reportedValue: string,
  messageContent: string,
  description: string,
): string | null {
  if (description.trim().length < 20) {
    return "Description must be at least 20 characters.";
  }
  if (reportType === "phone") {
    const digits = reportedValue.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      return "Phone number must contain 7–15 digits.";
    }
  } else if (reportType === "url") {
    try {
      const withScheme = /^https?:\/\//i.test(reportedValue.trim())
        ? reportedValue.trim()
        : `https://${reportedValue.trim()}`;
      // eslint-disable-next-line no-new
      new URL(withScheme);
    } catch {
      return "Enter a valid URL.";
    }
  } else if (reportType === "business_name") {
    if (reportedValue.trim().length < 2) {
      return "Business or person name must be at least 2 characters.";
    }
  } else if (messageContent.trim().length < 10) {
    return "Message content must be at least 10 characters.";
  }
  return null;
}

export function ReportScamForm() {
  const { language } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [reportType, setReportType] = useState<CommunityReportType>("url");
  const [reportedValue, setReportedValue] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [description, setDescription] = useState("");
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(
    null,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setScreenshotBase64(stripDataUrl(dataUrl));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateClient(
      reportType,
      reportedValue,
      messageContent,
      description,
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const valueForSubmit =
        reportType === "message"
          ? messageContent.trim().slice(0, 200) || reportedValue.trim()
          : reportedValue.trim();

      await api.createCommunityReport({
        reportType,
        reportedValue: valueForSubmit,
        messageContent:
          reportType === "message" ? messageContent.trim() : undefined,
        screenshotBase64: screenshotBase64 ?? undefined,
        description: description.trim(),
        language: language.slice(0, 5),
        anonId: ensureAnonId(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 text-center"
        data-no-translate
      >
        <Flag className="mx-auto mb-4 h-10 w-10 text-[#7df9ff]" />
        <h2 className="font-mono text-xl font-semibold text-[#e2e8ff]">
          Report received
        </h2>
        <p className="mt-3 text-sm text-[#94a3b8]">
          Thanks — your report is being reviewed and will appear once verified.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setReportedValue("");
            setMessageContent("");
            setDescription("");
            setScreenshotBase64(null);
            setPreview(null);
          }}
          className="mt-6 rounded-md border border-[rgba(125,249,255,0.3)] px-4 py-2 font-mono text-sm text-[#7df9ff] hover:bg-[rgba(125,249,255,0.08)]"
        >
          Submit another report
        </button>
      </motion.div>
    );
  }

  const valueLabel =
    reportType === "phone"
      ? "Phone number"
      : reportType === "url"
        ? "URL"
        : reportType === "business_name"
          ? "Business or person name"
          : "Short label (optional)";

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="glass-panel p-6 space-y-5">
      <div>
        <label className="mb-2 block font-mono text-xs tracking-widest text-[#6b7280]">
          REPORT TYPE
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {REPORT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setReportType(t.value)}
              className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                reportType === t.value
                  ? "border-[#7df9ff] bg-[rgba(125,249,255,0.12)] text-[#e2e8ff]"
                  : "border-[rgba(125,249,255,0.2)] text-[#cbd5e1] hover:border-[rgba(125,249,255,0.4)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {reportType !== "message" && (
        <div>
          <label className="mb-2 block font-mono text-xs tracking-widest text-[#6b7280]">
            {valueLabel.toUpperCase()}
          </label>
          <input
            value={reportedValue}
            onChange={(e) => setReportedValue(e.target.value)}
            required
            className="w-full rounded border border-[rgba(0,240,255,0.15)] bg-[rgba(0,240,255,0.03)] px-3 py-2 font-mono text-sm text-[#e2e8ff] focus:border-[rgba(0,240,255,0.4)] focus:outline-none"
            placeholder={
              reportType === "url"
                ? "https://example.com/phish"
                : reportType === "phone"
                  ? "+234 801 234 5678"
                  : "Acme Support / John Doe"
            }
          />
        </div>
      )}

      {reportType === "message" && (
        <div>
          <label className="mb-2 block font-mono text-xs tracking-widest text-[#6b7280]">
            MESSAGE CONTENT
          </label>
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            required
            rows={5}
            className="w-full resize-none rounded border border-[rgba(0,240,255,0.15)] bg-[rgba(0,240,255,0.03)] p-3 font-mono text-sm text-[#e2e8ff] focus:border-[rgba(0,240,255,0.4)] focus:outline-none"
            placeholder="Paste the scam message or email body..."
          />
        </div>
      )}

      <div>
        <label className="mb-2 block font-mono text-xs tracking-widest text-[#6b7280]">
          WHAT HAPPENED (REQUIRED)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={20}
          rows={4}
          className="w-full resize-none rounded border border-[rgba(0,240,255,0.15)] bg-[rgba(0,240,255,0.03)] p-3 font-mono text-sm text-[#e2e8ff] focus:border-[rgba(0,240,255,0.4)] focus:outline-none"
          placeholder="Describe how you encountered this scam (min 20 characters)..."
        />
        <p className="mt-1 text-xs text-[#6b7280]">
          {description.trim().length}/20 minimum
        </p>
      </div>

      <div>
        <label className="mb-2 block font-mono text-xs tracking-widest text-[#6b7280]">
          SCREENSHOT (OPTIONAL)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {preview ? (
          <div className="relative overflow-hidden rounded border border-[rgba(125,249,255,0.2)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Screenshot preview" className="max-h-48 w-full object-contain" />
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setScreenshotBase64(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="absolute right-2 top-2 rounded bg-black/60 p-1 text-white"
              aria-label="Remove screenshot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-[rgba(125,249,255,0.3)] px-4 py-6 text-sm text-[#94a3b8] hover:border-[rgba(125,249,255,0.5)]"
          >
            <Upload className="h-4 w-4" />
            Upload screenshot
          </button>
        )}
      </div>

      <p
        className="text-xs leading-relaxed text-[#6b7280]"
        data-no-translate
      >
        Reports are reviewed before appearing publicly. False or malicious
        reports may be rejected.
      </p>

      {error && (
        <p className="rounded border border-[rgba(255,0,60,0.4)] bg-[rgba(255,0,60,0.1)] px-3 py-2 font-mono text-sm text-[#ff003c]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[#7df9ff] px-4 py-2.5 font-semibold text-[#001017] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit report"}
      </button>
    </form>
  );
}
