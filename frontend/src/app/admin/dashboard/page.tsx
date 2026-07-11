"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Database,
  Flag,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/lib/api";
import type { AdminStats } from "@/types";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`glass-panel flex items-center gap-4 p-5 ${
        highlight ? "ring-1 ring-[rgba(255,170,0,0.5)]" : ""
      }`}
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
        <p className="font-mono text-xs tracking-wide text-[#6b7280]">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.adminStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load stats");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest text-[#ff003c]">
          <ShieldAlert className="h-3 w-3" />
          <span>OVERVIEW</span>
        </div>
        <h1 className="font-mono text-3xl font-bold text-[#e2e8ff]">
          Admin <span className="text-[#ff003c]">Dashboard</span>
        </h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          Platform health and moderation queue snapshot.
        </p>
      </motion.div>

      {error && (
        <p className="mb-4 rounded border border-[rgba(255,0,60,0.4)] bg-[rgba(255,0,60,0.1)] px-3 py-2 font-mono text-sm text-[#ff003c]">
          {error}
        </p>
      )}

      {!stats ? (
        <p className="font-mono text-sm text-[#6b7280]">Loading stats...</p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Activity}
              label="TOTAL SCANS"
              value={stats.totalScans}
              color="#00f0ff"
            />
            <StatCard
              icon={Database}
              label="URL SCANS"
              value={stats.urlScans}
              color="#9d00ff"
            />
            <StatCard
              icon={AlertTriangle}
              label="PENDING REPORTS"
              value={stats.reportsByStatus.pending}
              color="#ffaa00"
              highlight={stats.reportsByStatus.pending > 0}
            />
            <StatCard
              icon={Flag}
              label="REPORTS (7 DAYS)"
              value={stats.reportsLast7Days}
              color="#ff003c"
            />
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="glass-panel p-5">
              <p className="mb-3 font-mono text-xs tracking-widest text-[#6b7280]">
                REPORTS BY STATUS
              </p>
              <ul className="space-y-2 font-mono text-sm text-[#e2e8ff]">
                <li>Pending: {stats.reportsByStatus.pending}</li>
                <li>Approved: {stats.reportsByStatus.approved}</li>
                <li>Rejected: {stats.reportsByStatus.rejected}</li>
              </ul>
              <Link
                href="/admin/reports"
                className="mt-4 inline-block font-mono text-xs text-[#ffaa00] hover:underline"
              >
                Open moderation queue →
              </Link>
            </div>

            <div className="glass-panel p-5">
              <p className="mb-3 font-mono text-xs tracking-widest text-[#6b7280]">
                TOP REPORTED VALUES (APPROVED)
              </p>
              {stats.topReportedValues.length === 0 ? (
                <p className="font-mono text-sm text-[#6b7280]">
                  No approved reports yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {stats.topReportedValues.map((row) => (
                    <li
                      key={row.reportedValue}
                      className="flex justify-between gap-3 font-mono text-sm"
                    >
                      <span className="truncate text-[#e2e8ff]">
                        {row.reportedValue}
                      </span>
                      <span className="shrink-0 text-[#ffaa00]">
                        {row.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
