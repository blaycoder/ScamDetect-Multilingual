"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * Shows a "Login to track scans" prompt for anonymous users
 * when a scan result is present. Hides itself for logged-in users.
 */
export function LoginPrompt({ visible }: { visible: boolean }) {
  const { user, loading } = useAuth();

  // Don't block render while auth is hydrating or if user is logged in
  if (loading || user) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ delay: 0.3 }}
          className="mt-4 rounded border border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.04)] px-5 py-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-sm font-semibold text-[#00f0ff]">
                ◈ Save &amp; Track Your Scans
              </p>
              <p className="mt-0.5 text-xs text-[#6b7280]">
                Create a free account to keep a history of all your scan
                results.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded border border-[rgba(0,240,255,0.3)] px-3 py-1.5 font-mono text-xs text-[#00f0ff] hover:bg-[rgba(0,240,255,0.08)] transition-colors"
              >
                <LogIn className="h-3 w-3" />
                Login
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 rounded bg-[rgba(0,240,255,0.12)] border border-[rgba(0,240,255,0.3)] px-3 py-1.5 font-mono text-xs text-[#00f0ff] hover:bg-[rgba(0,240,255,0.2)] transition-colors"
              >
                <UserPlus className="h-3 w-3" />
                Sign Up Free
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
