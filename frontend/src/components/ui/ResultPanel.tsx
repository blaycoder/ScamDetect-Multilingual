"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Cpu,
  Database,
  ShieldAlert,
} from "lucide-react";
import type { DetectionResult, DetectionFlag, VTEngine } from "@/types";
import { RiskBadge } from "./RiskBadge";

interface ResultPanelProps {
  result: DetectionResult;
}

const FLAG_ICONS: Record<string, React.ElementType> = {
  KEYWORD_MATCH: AlertTriangle,
  SUSPICIOUS_DOMAIN: Globe,
  VIRUSTOTAL_MALICIOUS: XCircle,
  PHISHTANK_MATCH: Database,
  AI_PHISHING: Cpu,
  DOMAIN_IMPERSONATION: Globe,
};

const CATEGORY_COLORS: Record<string, string> = {
  malicious:
    "text-[#ff003c] border-[rgba(255,0,60,0.3)] bg-[rgba(255,0,60,0.06)]",
  suspicious:
    "text-[#ffaa00] border-[rgba(255,170,0,0.3)] bg-[rgba(255,170,0,0.06)]",
  harmless:
    "text-[#00ff9f] border-[rgba(0,255,159,0.3)] bg-[rgba(0,255,159,0.06)]",
};

function VTEngineTable({ engines }: { engines: VTEngine[] }) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs text-[#6b7280] tracking-widest">
        FLAGGING ENGINES ({engines.length})
      </p>
      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
        {engines.map((e) => {
          const colors =
            CATEGORY_COLORS[e.category] ??
            "text-[#6b7280] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]";
          return (
            <div
              key={e.name}
              className={`flex items-center justify-between rounded border px-3 py-1.5 ${colors}`}
            >
              <span className="font-mono text-xs truncate">{e.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-wide shrink-0 ml-2 opacity-80">
                {e.result}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FlagRow({ flag }: { flag: DetectionFlag }) {
  const Icon = FLAG_ICONS[flag.type] ?? AlertTriangle;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 rounded border border-[rgba(255,170,0,0.2)] bg-[rgba(255,170,0,0.05)] px-4 py-3"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#ffaa00]" />
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-[#ffaa00] tracking-wide">
          {flag.type.replace(/_/g, " ")}
        </p>
        <p className="mt-0.5 text-sm text-[#e2e8ff]">{flag.detail}</p>
      </div>
      <span className="shrink-0 font-mono text-xs text-[#ffaa00]">
        +{flag.score}
      </span>
    </motion.div>
  );
}

export function ResultPanel({ result }: ResultPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <RiskBadge level={result.riskLevel} score={result.riskScore} />
        {result.aiClassification && (
          <span className="flex items-center gap-2 font-mono text-xs text-[#7df9ff]">
            <Cpu className="h-3 w-3" /> AI: {result.aiClassification}
          </span>
        )}
      </div>

      {/* Risk Score Bar */}
      <div>
        <div className="mb-1 flex justify-between font-mono text-xs text-[#6b7280]">
          <span>RISK SCORE</span>
          <span>{result.riskScore}/100</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.1)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${result.riskScore}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={
              result.riskLevel === "SAFE"
                ? "h-full rounded-full bg-[#00ff9f] shadow-[0_0_8px_rgba(0,255,159,0.6)]"
                : result.riskLevel === "SUSPICIOUS"
                  ? "h-full rounded-full bg-[#ffaa00] shadow-[0_0_8px_rgba(255,170,0,0.6)]"
                  : "h-full rounded-full bg-[#ff003c] shadow-[0_0_8px_rgba(255,0,60,0.6)]"
            }
          />
        </div>
      </div>

      {/* Flags */}
      {result.flags.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-xs text-[#6b7280] tracking-widest">
            THREAT INDICATORS ({result.flags.length})
          </p>
          {result.flags.map((flag, i) => (
            <FlagRow key={i} flag={flag} />
          ))}
        </div>
      )}

      {/* Extracted URLs */}
      {result.extractedUrls.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-xs text-[#6b7280] tracking-widest">
            EXTRACTED URLS
          </p>
          <div className="space-y-1">
            {result.extractedUrls.map((url, i) => (
              <p
                key={i}
                className="truncate rounded bg-[rgba(0,240,255,0.05)] px-3 py-1.5 font-mono text-xs text-[#7df9ff]"
              >
                {url}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* VirusTotal result */}
      {result.virustotalResult && (
        <div className="space-y-3">
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              {
                label: "MALICIOUS",
                value: result.virustotalResult.malicious,
                color: "text-[#ff003c]",
              },
              {
                label: "PHISHING",
                value: result.virustotalResult.phishingCount ?? 0,
                color: "text-[#ff6600]",
              },
              {
                label: "HARMLESS",
                value: result.virustotalResult.harmless,
                color: "text-[#00ff9f]",
              },
              {
                label: "UNDETECTED",
                value: result.virustotalResult.undetected,
                color: "text-[#6b7280]",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-2"
              >
                <p className={`font-mono text-lg font-bold ${item.color}`}>
                  {item.value}
                </p>
                <p className="font-mono text-[10px] text-[#6b7280]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Per-engine flagged results */}
          {result.virustotalResult.engines &&
            result.virustotalResult.engines.filter(
              (e) => e.category === "malicious" || e.category === "suspicious",
            ).length > 0 && (
              <VTEngineTable
                engines={result.virustotalResult.engines.filter(
                  (e) =>
                    e.category === "malicious" || e.category === "suspicious",
                )}
              />
            )}
        </div>
      )}

      {/* Translated summary */}
      {result.translatedSummary && (
        <div className="rounded border border-[rgba(157,0,255,0.3)] bg-[rgba(157,0,255,0.05)] p-4">
          <p className="mb-1 font-mono text-xs text-[#9d00ff] tracking-widest">
            TRANSLATED SUMMARY
          </p>
          <p className="text-sm text-[#e2e8ff]">{result.translatedSummary}</p>
        </div>
      )}

      {/* PhishTank match */}
      {result.phishtankMatch && (
        <div className="flex items-center gap-2 rounded border border-[rgba(255,0,60,0.4)] bg-[rgba(255,0,60,0.1)] px-4 py-2">
          <XCircle className="h-4 w-4 text-[#ff003c]" />
          <span className="font-mono text-xs text-[#ff003c] tracking-wide">
            FOUND IN PHISHTANK DATABASE
          </span>
        </div>
      )}
    </motion.div>
  );
}
