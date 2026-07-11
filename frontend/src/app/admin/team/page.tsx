"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserMinus, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/components/admin/AdminGate";
import type { AdminRole, AdminUser } from "@/types";

export default function AdminTeamPage() {
  const { role } = useAdmin();
  const { user } = useAuth();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("moderator");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await api.listAdmins());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admins");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "superadmin") void load();
  }, [role, load]);

  if (role !== "superadmin") {
    return (
      <div className="glass-panel p-8 text-center">
        <p className="font-mono text-sm text-[#ff003c]">Forbidden</p>
        <p className="mt-2 text-sm text-[#6b7280]">
          Only superadmins can manage the admin team.
        </p>
      </div>
    );
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.addAdmin({
        role: newRole,
        email: email.trim() || undefined,
      });
      setEmail("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(targetUserId: string) {
    setError(null);
    try {
      await api.removeAdmin(targetUserId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove admin");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-mono text-3xl font-bold text-[#e2e8ff]">
          Admin <span className="text-[#ff003c]">Team</span>
        </h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          Manage moderators and superadmins. 
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded border border-[rgba(255,0,60,0.4)] bg-[rgba(255,0,60,0.1)] px-3 py-2 font-mono text-sm text-[#ff003c]">
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => void handleAdd(e)}
        className="glass-panel mb-6 space-y-3 p-5"
      >
        <p className="font-mono text-xs tracking-widest text-[#6b7280]">
          ADD ADMIN
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="User email"
            className="rounded border border-[rgba(255,255,255,0.1)] bg-transparent px-3 py-2 text-sm text-[#e2e8ff] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as AdminRole)}
            className="rounded border border-[rgba(255,255,255,0.1)] bg-[#0f1320] px-3 py-2 font-mono text-sm text-[#e2e8ff]"
          >
            <option value="moderator">moderator</option>
            <option value="superadmin">superadmin</option>
          </select>
          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="inline-flex items-center gap-2 rounded bg-[#ff003c]/20 px-4 py-2 font-mono text-xs text-[#ff003c] disabled:opacity-50"
          >
            <UserPlus className="h-3 w-3" />
            {submitting ? "Adding..." : "Add admin"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="font-mono text-sm text-[#6b7280]">Loading...</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-mono text-sm text-[#e2e8ff]">
                    {item.email}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#6b7280]">
                    {item.role} · added by {item.addedByEmail ?? "bootstrap"} ·{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={item.role === "superadmin"}
                  onClick={() => void handleRemove(item.id)}
                  className="inline-flex items-center gap-1 rounded border border-[rgba(255,0,60,0.3)] px-3 py-1.5 font-mono text-xs text-[#ff003c] disabled:cursor-not-allowed disabled:opacity-40"
                  title={item.role === "superadmin" ? "Cannot remove superadmin" : "Remove moderator"}
                >
                  <UserMinus className="h-3 w-3" />
                  Remove
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
