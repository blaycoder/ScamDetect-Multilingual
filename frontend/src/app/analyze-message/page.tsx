"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { api } from "@/lib/api";
import type { DetectionResult, LanguageCode } from "@/types";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { ScannerButton } from "@/components/ui/ScannerButton";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { LoginPrompt } from "@/components/ui/LoginPrompt";

export default function AnalyzeMessagePage() {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.analyzeMessage(message, language);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
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
          <div className="mb-3 flex items-center gap-2 font-mono text-xs text-[#00f0ff] tracking-widest">
            <Zap className="h-3 w-3" />
            <span>MESSAGE ANALYSIS</span>
          </div>
          <h1 className="font-mono text-3xl font-bold text-[#e2e8ff]">
            Analyze{" "}
            <span className="text-[#00f0ff] glow-text-cyan">Message</span>
          </h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Paste an SMS, email, or WhatsApp message to detect phishing
            attempts.
          </p>
        </motion.div>

        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 mb-6"
        >
          <div className="relative">
            {/* Scanning effect overlay */}
            {loading && (
              <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded">
                <div
                  className="absolute left-0 right-0 h-0.5 bg-[#00f0ff] opacity-80 scan-animation"
                  style={{ boxShadow: "0 0 8px rgba(0,240,255,0.8)" }}
                />
              </div>
            )}

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste suspicious message here...&#10;&#10;e.g. 'Your account has been suspended. Click here to verify: http://...' "
              rows={8}
              className="w-full resize-none rounded border border-[rgba(0,240,255,0.15)] bg-[rgba(0,240,255,0.03)] p-4 font-mono text-sm text-[#e2e8ff] placeholder-[#3a3a5c] focus:border-[rgba(0,240,255,0.4)] focus:outline-none focus:ring-1 focus:ring-[rgba(0,240,255,0.2)] transition-colors"
            />
          </div>

          <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
            <LanguageSelector value={language} onChange={setLanguage} />
            <ScannerButton
              onClick={handleAnalyze}
              loading={loading}
              disabled={!message.trim()}
              variant="cyan"
            >
              <Zap className="h-4 w-4" />
              {loading ? "Scanning..." : "Analyze Message"}
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
