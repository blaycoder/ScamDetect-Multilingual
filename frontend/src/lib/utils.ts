import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskLevel } from "@/types";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Map a risk level to a neon color class */
export function riskColor(level: RiskLevel): string {
  switch (level) {
    case "SAFE":
      return "text-[#00ff9f]";
    case "SUSPICIOUS":
      return "text-[#ffaa00]";
    case "HIGH_RISK":
      return "text-[#ff003c]";
  }
}

/** Map a risk score (0–100) to a human label */
export function riskLabel(score: number): RiskLevel {
  if (score <= 30) return "SAFE";
  if (score <= 60) return "SUSPICIOUS";
  return "HIGH_RISK";
}

/** Convert a base64 data URL to a plain base64 string */
export function stripDataUrl(dataUrl: string): string {
  return dataUrl.replace(/^data:.+;base64,/, "");
}

/** Truncate a long string */
export function truncate(str: string, max = 80): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}
