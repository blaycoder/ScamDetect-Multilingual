"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LogIn, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/analyze-message", label: "Analyze" },
  { href: "/scan-url", label: "Scan URL" },
  { href: "/upload-screenshot", label: "Screenshot" },
  { href: "/scam-database", label: "Database" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgba(0,240,255,0.15)] bg-[rgba(10,10,15,0.85)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Shield
            className="h-6 w-6 text-[#00f0ff] group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-all"
            strokeWidth={1.5}
          />
          <span className="font-mono text-lg font-bold tracking-widest text-[#00f0ff] glow-text-cyan">
            SCAM<span className="text-[#ff00ff]">DETECT</span>
          </span>
        </Link>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded text-sm font-mono tracking-wide transition-all duration-200",
                  pathname === href
                    ? "text-[#00f0ff] bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)]"
                    : "text-[#6b7280] hover:text-[#00f0ff] hover:bg-[rgba(0,240,255,0.05)]",
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth controls */}
        <div className="hidden md:flex items-center gap-2">
          {!loading &&
            (user ? (
              <div className="flex items-center gap-2">
                {/* User email badge */}
                <div className="flex items-center gap-1.5 rounded border border-[rgba(0,240,255,0.2)] px-2.5 py-1 font-mono text-xs text-[#00f0ff]">
                  <User className="h-3 w-3" />
                  <span className="max-w-[120px] truncate">
                    {user.email?.split("@")[0]}
                  </span>
                </div>
                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 rounded border border-[rgba(255,0,60,0.25)] px-2.5 py-1 font-mono text-xs text-[#6b7280] hover:border-[rgba(255,0,60,0.5)] hover:text-[#ff003c] transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded border border-[rgba(0,240,255,0.3)] px-3 py-1.5 font-mono text-xs text-[#00f0ff] hover:bg-[rgba(0,240,255,0.08)] transition-colors"
              >
                <LogIn className="h-3 w-3" />
                Login
              </Link>
            ))}
        </div>

        {/* Mobile menu indicator */}
        <div className="flex md:hidden items-center gap-2 text-[#00f0ff] text-xs font-mono">
          <span className="pulse-glow">◈</span>
          <span>MENU</span>
        </div>
      </div>
    </nav>
  );
}
