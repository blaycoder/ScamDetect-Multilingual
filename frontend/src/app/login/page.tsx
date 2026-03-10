"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, LogIn, Chrome } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleGoogleLogin() {
    setOauthLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setOauthLoading(false);
    }
    // OAuth redirects the page — no need to setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.08)]">
              <Shield className="h-7 w-7 text-[#00f0ff]" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-mono text-2xl font-bold text-[#e2e8ff]">
            Access{" "}
            <span className="text-[#00f0ff] glow-text-cyan">Terminal</span>
          </h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Sign in to view your scan history and dashboard.
          </p>
        </div>

        <div className="glass-panel p-8">
          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={oauthLoading || loading}
            className="mb-6 flex w-full items-center justify-center gap-2.5 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] py-2.5 font-mono text-sm text-[#e2e8ff] transition-all hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-50"
          >
            <Chrome className="h-4 w-4" />
            {oauthLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.07)]" />
            <span className="font-mono text-xs text-[#3a3a5c] tracking-widest">
              OR
            </span>
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.07)]" />
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-xs text-[#6b7280] tracking-widest">
                EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3a3a5c]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded border border-[rgba(0,240,255,0.15)] bg-[rgba(0,240,255,0.03)] py-2.5 pl-9 pr-3 font-mono text-sm text-[#e2e8ff] placeholder-[#3a3a5c] focus:border-[rgba(0,240,255,0.4)] focus:outline-none focus:ring-1 focus:ring-[rgba(0,240,255,0.15)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs text-[#6b7280] tracking-widest">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3a3a5c]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded border border-[rgba(0,240,255,0.15)] bg-[rgba(0,240,255,0.03)] py-2.5 pl-9 pr-3 font-mono text-sm text-[#e2e8ff] placeholder-[#3a3a5c] focus:border-[rgba(0,240,255,0.4)] focus:outline-none focus:ring-1 focus:ring-[rgba(0,240,255,0.15)] transition-colors"
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded border border-[rgba(255,0,60,0.4)] bg-[rgba(255,0,60,0.08)] px-3 py-2 font-mono text-xs text-[#ff003c]"
              >
                ⚠ {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || oauthLoading}
              className="flex w-full items-center justify-center gap-2 rounded border border-[rgba(0,240,255,0.4)] bg-[rgba(0,240,255,0.1)] py-2.5 font-mono text-sm font-semibold text-[#00f0ff] transition-all hover:bg-[rgba(0,240,255,0.18)] active:scale-[0.98] disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Connecting…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <p className="mt-6 text-center font-mono text-xs text-[#6b7280]">
          No account?{" "}
          <Link href="/signup" className="text-[#00f0ff] hover:underline">
            Create one
          </Link>
          {" · "}
          <Link href="/" className="text-[#6b7280] hover:text-[#e2e8ff]">
            Back to Home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
