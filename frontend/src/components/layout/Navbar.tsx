"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2, Shield, LogIn, LogOut, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/types";

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
  const { language, setLanguage } = useLanguage();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!isMobileOpen) return;
      const target = event.target as Node;
      const clickedMenu = mobileMenuRef.current?.contains(target);
      const clickedButton = mobileButtonRef.current?.contains(target);
      if (!clickedMenu && !clickedButton) {
        setIsMobileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMobileOpen]);

  async function handleSignOut() {
    await signOut();
    setIsMobileOpen(false);
    router.push("/");
  }

  function closeMobileMenu() {
    setIsMobileOpen(false);
  }

  return (
    <nav className="sticky top-0 z-[70] border-b border-[rgba(0,240,255,0.15)] bg-[rgba(10,10,15,0.88)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={closeMobileMenu}
        >
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

        {/* Language + Auth controls */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded border border-[rgba(0,240,255,0.25)] px-2 py-1">
            <Globe2 className="h-3.5 w-3.5 text-[#00f0ff]" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              aria-label="Select language"
              className="bg-transparent font-mono text-xs text-[#00f0ff] outline-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className="bg-[#0f0f1a] text-[#e2e8ff]"
                >
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

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

        {/* Mobile menu toggle */}
        <button
          ref={mobileButtonRef}
          type="button"
          aria-label={
            isMobileOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-controls="mobile-nav-panel"
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center gap-2 rounded border border-[rgba(0,240,255,0.35)] bg-[rgba(0,240,255,0.08)] px-3 py-1.5 font-mono text-xs tracking-wider text-[#00f0ff] hover:bg-[rgba(0,240,255,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff]"
        >
          {isMobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
          <span>{isMobileOpen ? "CLOSE" : "MENU"}</span>
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            id="mobile-nav-panel"
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden border-t border-[rgba(0,240,255,0.2)] bg-[rgba(7,10,20,0.98)] px-4 pb-4 pt-3 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
          >
            <ul className="flex flex-col gap-1.5">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "block rounded border px-3 py-2 font-mono text-sm tracking-wide transition-all duration-200",
                      pathname === href
                        ? "border-[rgba(0,240,255,0.45)] bg-[rgba(0,240,255,0.12)] text-[#00f0ff]"
                        : "border-transparent text-[#6b7280] hover:border-[rgba(0,240,255,0.2)] hover:bg-[rgba(0,240,255,0.06)] hover:text-[#00f0ff]",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center gap-2 rounded border border-[rgba(0,240,255,0.25)] px-2.5 py-2">
              <Globe2 className="h-3.5 w-3.5 text-[#00f0ff]" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                aria-label="Select language"
                className="w-full bg-transparent font-mono text-xs text-[#00f0ff] outline-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className="bg-[#0f0f1a] text-[#e2e8ff]"
                  >
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {!loading &&
              (user ? (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 rounded border border-[rgba(0,240,255,0.2)] px-2.5 py-2 font-mono text-xs text-[#00f0ff]">
                    <User className="h-3 w-3" />
                    <span className="truncate">
                      {user.email?.split("@")[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-center gap-1.5 rounded border border-[rgba(255,0,60,0.25)] px-3 py-2 font-mono text-xs text-[#6b7280] hover:border-[rgba(255,0,60,0.5)] hover:text-[#ff003c] transition-colors"
                  >
                    <LogOut className="h-3 w-3" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="mt-3 flex items-center justify-center gap-1.5 rounded border border-[rgba(0,240,255,0.3)] px-3 py-2 font-mono text-xs text-[#00f0ff] hover:bg-[rgba(0,240,255,0.08)] transition-colors"
                >
                  <LogIn className="h-3 w-3" />
                  Login
                </Link>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
