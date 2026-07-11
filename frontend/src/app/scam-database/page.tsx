"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Database } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { PublicCommunityReport } from "@/types";

export default function ScamDatabasePage() {
  const [items, setItems] = useState<PublicCommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.listPublicCommunityReports(1, 50);
        if (!cancelled) setItems(data.items);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load reports",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest text-[#9d00ff]">
              <Database className="h-3 w-3" />
              <span>COMMUNITY DATABASE</span>
            </div>
            <h1 className="font-mono text-3xl font-bold text-[#e2e8ff]">
              Scam{" "}
              <span className="text-[#9d00ff]">Database</span>
            </h1>
            <p className="mt-2 text-sm text-[#6b7280]">
              Approved community-reported scams. Descriptions and reporter
              details are never shown publicly.
            </p>
          </div>
          <Link
            href="/report-scam"
            className="rounded-md border border-[rgba(157,0,255,0.4)] px-4 py-2 font-mono text-xs text-[#9d00ff] hover:bg-[rgba(157,0,255,0.1)]"
          >
            Report a scam
          </Link>
        </div>

        {loading && (
          <p className="font-mono text-sm text-[#6b7280]">Loading...</p>
        )}
        {error && (
          <p className="rounded border border-[rgba(255,0,60,0.4)] bg-[rgba(255,0,60,0.1)] px-4 py-3 font-mono text-sm text-[#ff003c]">
            {error}
          </p>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="glass-panel p-8 text-center font-mono text-sm text-[#6b7280]">
            No approved community reports yet.
          </div>
        )}
        {!loading && items.length > 0 && (
          <div className="overflow-x-auto rounded border border-[rgba(255,255,255,0.08)]">
            <table className="w-full min-w-[480px] text-left">
              <thead className="bg-[rgba(255,255,255,0.03)] font-mono text-xs tracking-widest text-[#6b7280]">
                <tr>
                  <th className="px-4 py-3">TYPE</th>
                  <th className="px-4 py-3">VALUE</th>
                  <th className="px-4 py-3">DATE</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-[rgba(255,255,255,0.06)]"
                  >
                    <td className="px-4 py-3 font-mono text-xs uppercase text-[#ffaa00]">
                      {item.reportType}
                    </td>
                    <td className="max-w-md truncate px-4 py-3 font-mono text-sm text-[#e2e8ff]">
                      {item.reportedValue}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#6b7280]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
