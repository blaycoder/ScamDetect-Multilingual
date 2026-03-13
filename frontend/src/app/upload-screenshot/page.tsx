"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { api } from "@/lib/api";
import { stripDataUrl } from "@/lib/utils";
import type { DetectionResult } from "@/types";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { ScannerButton } from "@/components/ui/ScannerButton";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { LoginPrompt } from "@/components/ui/LoginPrompt";
import { useLanguage } from "@/context/LanguageContext";

export default function UploadScreenshotPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { language, setLanguage } = useLanguage();

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
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleScan() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.scanScreenshot(stripDataUrl(preview), language);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-2 font-mono text-xs text-[#7df9ff] tracking-widest">
            <ImageIcon className="h-3 w-3" />
            <span>OCR SCREENSHOT SCAN</span>
          </div>
          <h1 className="font-mono text-3xl font-bold text-[#e2e8ff]">
            Upload <span className="text-[#7df9ff]">Screenshot</span>
          </h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Upload a screenshot. OCR will extract the text for analysis.
          </p>
        </motion.div>

        {/* Drop Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 mb-6"
        >
          {preview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded border border-[rgba(125,249,255,0.2)]"
              />
              <button
                onClick={() => {
                  setPreview(null);
                  setResult(null);
                }}
                className="absolute top-2 right-2 rounded-full bg-[rgba(0,0,0,0.6)] p-1 text-[#e2e8ff] hover:text-[#ff003c] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 h-48 rounded border-2 border-dashed cursor-pointer transition-all ${
                dragging
                  ? "border-[#7df9ff] bg-[rgba(125,249,255,0.08)]"
                  : "border-[rgba(125,249,255,0.2)] hover:border-[rgba(125,249,255,0.4)] hover:bg-[rgba(125,249,255,0.03)]"
              }`}
            >
              <Upload className="h-10 w-10 text-[#7df9ff] opacity-60" />
              <p className="font-mono text-sm text-[#6b7280]">
                Drop image here or{" "}
                <span className="text-[#7df9ff]">click to browse</span>
              </p>
              <p className="font-mono text-xs text-[#3a3a5c]">
                PNG, JPG, WEBP · Max 5 MB
              </p>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {loading && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2, ease: "linear", repeat: Infinity }}
              className="mt-3 h-0.5 w-full origin-left rounded-full bg-gradient-to-r from-[#7df9ff] to-transparent"
            />
          )}

          <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
            <LanguageSelector value={language} onChange={setLanguage} />
            <ScannerButton
              onClick={handleScan}
              loading={loading}
              disabled={!preview}
              variant="cyan"
            >
              <ImageIcon className="h-4 w-4" />
              {loading ? "Scanning..." : "Scan Screenshot"}
            </ScannerButton>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 rounded border border-[rgba(255,0,60,0.4)] bg-[rgba(255,0,60,0.1)] px-4 py-3 font-mono text-sm text-[#ff003c]"
            >
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && <ResultPanel result={result} />}
        </AnimatePresence>

        {/* Prompt anonymous users to create an account */}
        <LoginPrompt visible={!!result} />
      </div>
    </div>
  );
}
