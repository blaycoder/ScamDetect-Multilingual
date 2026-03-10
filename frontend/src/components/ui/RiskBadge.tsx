"use client";

import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  className?: string;
}

const CONFIG: Record<
  RiskLevel,
  { label: string; color: string; bg: string; border: string; glow: string }
> = {
  SAFE: {
    label: "SAFE",
    color: "text-[#00ff9f]",
    bg: "bg-[rgba(0,255,159,0.1)]",
    border: "border-[rgba(0,255,159,0.4)]",
    glow: "shadow-[0_0_12px_rgba(0,255,159,0.3)]",
  },
  SUSPICIOUS: {
    label: "SUSPICIOUS",
    color: "text-[#ffaa00]",
    bg: "bg-[rgba(255,170,0,0.1)]",
    border: "border-[rgba(255,170,0,0.4)]",
    glow: "shadow-[0_0_12px_rgba(255,170,0,0.3)]",
  },
  HIGH_RISK: {
    label: "HIGH RISK",
    color: "text-[#ff003c]",
    bg: "bg-[rgba(255,0,60,0.1)]",
    border: "border-[rgba(255,0,60,0.4)]",
    glow: "shadow-[0_0_12px_rgba(255,0,60,0.3)]",
  },
};

export function RiskBadge({ level, score, className }: RiskBadgeProps) {
  const c = CONFIG[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded border px-3 py-1 font-mono text-sm font-bold tracking-widest",
        c.color,
        c.bg,
        c.border,
        c.glow,
        className,
      )}
    >
      <span className="pulse-glow">◈</span>
      {c.label}
      {score !== undefined && <span className="opacity-70">({score}/100)</span>}
    </span>
  );
}
