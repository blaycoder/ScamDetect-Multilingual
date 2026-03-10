"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Link2 } from "lucide-react";
import { api } from "@/lib/api";
import type { DetectionResult, LanguageCode } from "@/types";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { ScannerButton } from "@/components/ui/ScannerButton";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { LoginPrompt } from "@/components/ui/LoginPrompt";

export default function ScanUrlPage() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScan() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.checkUrl(url, language);
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
          <div className="mb-3 flex items-center gap-2 font-mono text-xs text-[#ff00ff] tracking-widest">
            <Shield className="h-3 w-3" />
            <span>URL SCANNER</span>
          </div>
          <h1 className="font-mono text-3xl font-bold text-[#e2e8ff]">
            Scan <span className="text-[#ff00ff] glow-text-magenta">URL</span>
          </h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Enter any URL to check against VirusTotal and PhishTank databases.
          </p>
        </motion.div>

        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 mb-6"
        >
          <div className="relative flex items-center">
            <Link2 className="absolute left-3 h-4 w-4 text-[#ff00ff]" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="https://suspicious-site.com/verify"
              className="w-full rounded border border-[rgba(255,0,255,0.15)] bg-[rgba(255,0,255,0.03)] py-3 pl-10 pr-4 font-mono text-sm text-[#e2e8ff] placeholder-[#3a3a5c] focus:border-[rgba(255,0,255,0.4)] focus:outline-none focus:ring-1 focus:ring-[rgba(255,0,255,0.2)] transition-colors"
            />
          </div>

          {/* Scanning animation bar */}
          {loading && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
              className="mt-2 h-0.5 w-full origin-left rounded-full bg-gradient-to-r from-[#ff00ff] to-transparent"
            />
          )}

          <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
            <LanguageSelector value={language} onChange={setLanguage} />
            <ScannerButton
              onClick={handleScan}
              loading={loading}
              disabled={!url.trim()}
              variant="magenta"
            >
              <Shield className="h-4 w-4" />
              {loading ? "Scanning..." : "Scan URL"}
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
