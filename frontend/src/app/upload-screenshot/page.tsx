"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, X, ScanSearch } from "lucide-react";
import { api } from "@/lib/api";
import { stripDataUrl } from "@/lib/utils";
import type { DetectionResult } from "@/types";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { LoginPrompt } from "@/components/ui/LoginPrompt";
import { ImageCropper } from "@/components/ImageCropper";
import { useLanguage } from "@/context/LanguageContext";

export default function UploadScreenshotPage() {
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { language, setLanguage } = useLanguage();

  function resetImageState() {
    setSourcePreview(null);
    setCroppedPreview(null);
    setCroppedFile(null);
    setResult(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read image."));
      reader.readAsDataURL(file);
    });
  }

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
    setResult(null);
    setCroppedPreview(null);
    setCroppedFile(null);

    const reader = new FileReader();
    reader.onload = (e) => setSourcePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleScanFromFile(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const base64 = stripDataUrl(await fileToDataUrl(file));
      const data = await api.ocrImage(base64, language);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmCrop(file: File) {
    setCroppedFile(file);
    setCroppedPreview(await fileToDataUrl(file));
  }

  async function handleCropAndScan(file: File) {
    await handleConfirmCrop(file);
    await handleScanFromFile(file);
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
            Upload a screenshot, crop only the scam text, then run OCR analysis.
          </p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 mb-6"
        >
          {sourcePreview ? (
            <div className="space-y-4">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sourcePreview}
                  alt="Uploaded screenshot preview"
                  className="w-full max-h-64 object-contain rounded border border-[rgba(125,249,255,0.2)]"
                />
                <button
                  onClick={resetImageState}
                  className="absolute top-2 right-2 rounded-full bg-[rgba(0,0,0,0.6)] p-1 text-[#e2e8ff] hover:text-[#ff003c] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <LanguageSelector value={language} onChange={setLanguage} />
                <p className="font-mono text-xs text-[#6b7280]">
                  Drag to move. Use zoom and crop-box controls to isolate scam
                  text.
                </p>
              </div>

              <ImageCropper
                imageSrc={sourcePreview}
                onConfirm={handleConfirmCrop}
                onCropAndScan={handleCropAndScan}
                loading={loading}
              />

              {croppedPreview && (
                <div className="rounded border border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.04)] p-3">
                  <div className="mb-2 flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-[#7df9ff]">
                    <ScanSearch className="h-3.5 w-3.5" />
                    <span>CROPPED PREVIEW</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={croppedPreview}
                    alt="Cropped screenshot preview"
                    className="w-full max-h-56 rounded border border-[rgba(125,249,255,0.2)] object-contain"
                  />
                  <p className="mt-2 font-mono text-xs text-[#6b7280]">
                    Cropped output is ready for OCR.
                  </p>
                </div>
              )}

              {croppedFile && !loading && (
                <p className="font-mono text-xs text-[#6b7280]">
                  Crop confirmed: {croppedFile.name} (
                  {Math.ceil(croppedFile.size / 1024)} KB)
                </p>
              )}
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
              className="mt-4 h-0.5 w-full origin-left rounded-full bg-gradient-to-r from-[#7df9ff] to-transparent"
            />
          )}
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
