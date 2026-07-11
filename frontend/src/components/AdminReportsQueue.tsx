"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { AdminCommunityReport, CommunityReportStatus } from "@/types";
import Link from "next/link";

const TABS: CommunityReportStatus[] = ["pending", "approved", "rejected"];

export function AdminReportsQueue() {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<CommunityReportStatus>("pending");
  const [items, setItems] = useState<AdminCommunityReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listAdminReports(status);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  async function moderate(
    id: string,
    nextStatus: "approved" | "rejected",
  ) {
    setActingId(id);
    setError(null);
    try {
      await api.moderateCommunityReport(id, {
        status: nextStatus,
        moderatorNotes: notesById[id]?.trim() || undefined,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Moderation failed");
    } finally {
      setActingId(null);
    }
  }

  if (authLoading) {
    return (
      <p className="font-mono text-sm text-[#6b7280]">Loading session...</p>
    );
  }

  if (!user) {
    return (
      <div className="glass-panel p-8 text-center">
        <p className="text-sm text-[#94a3b8]">
          Sign in required to view the moderation queue.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block font-mono text-sm text-[#7df9ff]"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded border border-[rgba(255,170,0,0.4)] bg-[rgba(255,170,0,0.08)] px-4 py-3 text-sm text-[#ffaa00]"
        data-no-translate
      >
        Admin auth TODO — endpoints return 403 until admin middleware is
        configured.
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatus(tab)}
            className={`rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-wide ${
              status === tab
                ? "border-[#7df9ff] bg-[rgba(125,249,255,0.12)] text-[#e2e8ff]"
                : "border-[rgba(255,255,255,0.1)] text-[#94a3b8]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded border border-[rgba(255,0,60,0.4)] bg-[rgba(255,0,60,0.1)] px-3 py-2 font-mono text-sm text-[#ff003c]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="font-mono text-sm text-[#6b7280]">Loading reports...</p>
      ) : items.length === 0 ? (
        <p className="font-mono text-sm text-[#6b7280]">No {status} reports.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel space-y-3 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-[#ffaa00]">
                  {item.reportType}
                </span>
                <span className="font-mono text-xs text-[#6b7280]">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="break-all font-mono text-sm text-[#7df9ff]">
                {item.reportedValue}
              </p>
              <p className="text-sm text-[#e2e8ff]">{item.description}</p>
              {item.messageContent && (
                <pre className="overflow-x-auto rounded bg-black/30 p-3 font-mono text-xs text-[#cbd5e1]">
                  {item.messageContent}
                </pre>
              )}
              {item.screenshotUrl && (
                <p className="font-mono text-xs text-[#6b7280]">
                  Screenshot path: {item.screenshotUrl}
                </p>
              )}

              {status === "pending" && (
                <div className="space-y-2 border-t border-[rgba(255,255,255,0.08)] pt-3">
                  <input
                    value={notesById[item.id] ?? ""}
                    onChange={(e) =>
                      setNotesById((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    placeholder="Optional moderator notes"
                    className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-transparent px-3 py-2 text-sm text-[#e2e8ff] focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={actingId === item.id}
                      onClick={() => void moderate(item.id, "approved")}
                      className="inline-flex items-center gap-1 rounded bg-[#00ff9f]/20 px-3 py-1.5 font-mono text-xs text-[#00ff9f] disabled:opacity-50"
                    >
                      <Check className="h-3 w-3" /> Approve
                    </button>
                    <button
                      type="button"
                      disabled={actingId === item.id}
                      onClick={() => void moderate(item.id, "rejected")}
                      className="inline-flex items-center gap-1 rounded bg-[#ff003c]/20 px-3 py-1.5 font-mono text-xs text-[#ff003c] disabled:opacity-50"
                    >
                      <X className="h-3 w-3" /> Reject
                    </button>
                  </div>
                </div>
              )}

              {item.moderatorNotes && (
                <p className="font-mono text-xs text-[#6b7280]">
                  Notes: {item.moderatorNotes}
                </p>
              )}
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
