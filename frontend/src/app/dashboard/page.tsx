"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  XCircle,
  Activity,
  Database,
  Lock,
  LogIn,
  UserPlus,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { ScamReport } from "@/types";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { truncate } from "@/lib/utils";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  delay?: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-panel p-5 flex items-center gap-4"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded border"
        style={{ borderColor: `${color}30`, background: `${color}10` }}
      >
        <Icon className="h-5 w-5" style={{ color }} strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-mono text-2xl font-bold" style={{ color }}>
          {value}
        </p>
        <p className="font-mono text-xs text-[#6b7280] tracking-wide">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

/** Full-page lock screen for unauthenticated visitors */
function AccessWall() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.06)]">
            <Lock
              className="h-10 w-10 text-[#00f0ff] opacity-70"
              strokeWidth={1.5}
            />
          </div>
        </div>
        <h2 className="font-mono text-2xl font-bold text-[#e2e8ff]">
          Dashboard{" "}
          <span className="text-[#00f0ff] glow-text-cyan">Restricted</span>
        </h2>
        <p className="mt-3 text-sm text-[#6b7280]">
          Sign in or create a free account to access your personal scan history,
          threat statistics, and saved reports.
        </p>

        <div className="mt-8 glass-panel p-6">
          <p className="mb-4 font-mono text-xs text-[#6b7280] tracking-widest">
            CHOOSE AN OPTION
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="flex flex-1 items-center justify-center gap-2 rounded border border-[rgba(0,240,255,0.35)] bg-[rgba(0,240,255,0.08)] px-4 py-3 font-mono text-sm font-semibold text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex flex-1 items-center justify-center gap-2 rounded border border-[rgba(255,0,255,0.35)] bg-[rgba(255,0,255,0.08)] px-4 py-3 font-mono text-sm font-semibold text-[#ff00ff] hover:bg-[rgba(255,0,255,0.15)] transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Create Account
            </Link>
          </div>

          <div className="mt-4 border-t border-[rgba(255,255,255,0.05)] pt-4 text-center">
            <p className="text-xs text-[#6b7280]">
              Want to scan without an account?{" "}
              <Link
                href="/analyze-message"
                className="text-[#00f0ff] hover:underline"
              >
                Analyze a message
              </Link>{" "}
              or{" "}
              <Link href="/scan-url" className="text-[#00f0ff] hover:underline">
                Scan a URL
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return; // Render AccessWall instead

    setLoading(true);
    api
      .getUserScans()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  // Waiting for hydration
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm text-[#6b7280]">
        <span className="pulse-glow mr-2">â—ˆ</span> Authenticatingâ€¦
      </div>
    );
  }

  // Not logged in â€” show lock wall
  if (!user) {
    return <AccessWall />;
  }

  const safe = reports.filter((r) => r.riskLevel === "SAFE").length;
  const suspicious = reports.filter((r) => r.riskLevel === "SUSPICIOUS").length;
  const highRisk = reports.filter((r) => r.riskLevel === "HIGH_RISK").length;

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-2 font-mono text-xs text-[#e2e8ff] tracking-widest">
            <Activity className="h-3 w-3" />
            <span>THREAT DASHBOARD</span>
          </div>
          <h1 className="font-mono text-3xl font-bold text-[#e2e8ff]">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Your personal scan history and threat statistics.
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={Database}
            label="TOTAL SCANS"
            value={reports.length}
            color="#00f0ff"
            delay={0}
          />
          <StatCard
            icon={Shield}
            label="SAFE"
            value={safe}
            color="#00ff88"
            delay={0.05}
          />
          <StatCard
            icon={AlertTriangle}
            label="SUSPICIOUS"
            value={suspicious}
            color="#ffaa00"
            delay={0.1}
          />
          <StatCard
            icon={XCircle}
            label="HIGH RISK"
            value={highRisk}
            color="#ff003c"
            delay={0.15}
          />
        </div>

        {/* Scan history table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel overflow-hidden"
        >
          <div className="border-b border-[rgba(255,255,255,0.05)] px-6 py-4">
            <h2 className="font-mono text-sm font-semibold text-[#e2e8ff] tracking-widest">
              SCAN HISTORY
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 font-mono text-sm text-[#6b7280]">
              <span className="pulse-glow mr-2">â—ˆ</span> Loadingâ€¦
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-mono text-sm text-[#6b7280]">No scans yet.</p>
              <p className="mt-2 text-xs text-[#3a3a5c]">
                Scans you run while logged in will appear here.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link
                  href="/analyze-message"
                  className="rounded border border-[rgba(0,240,255,0.25)] px-4 py-1.5 font-mono text-xs text-[#00f0ff] hover:bg-[rgba(0,240,255,0.06)] transition-colors"
                >
                  Analyze Message
                </Link>
                <Link
                  href="/scan-url"
                  className="rounded border border-[rgba(255,0,255,0.25)] px-4 py-1.5 font-mono text-xs text-[#ff00ff] hover:bg-[rgba(255,0,255,0.06)] transition-colors"
                >
                  Scan URL
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.05)] text-left font-mono text-xs text-[#6b7280] tracking-widest">
                    <th className="px-6 py-3">MESSAGE</th>
                    <th className="px-6 py-3">RISK LEVEL</th>
                    <th className="px-6 py-3">SCORE</th>
                    <th className="px-6 py-3">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(0,240,255,0.03)] transition-colors"
                    >
                      <td className="px-6 py-3 font-mono text-xs text-[#e2e8ff]">
                        {truncate(r.message, 60)}
                      </td>
                      <td className="px-6 py-3">
                        <RiskBadge level={r.riskLevel} />
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-[#7df9ff]">
                        {r.riskScore}/100
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-[#6b7280]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
