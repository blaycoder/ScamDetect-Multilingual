import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[rgba(0,240,255,0.1)] bg-[rgba(10,10,15,0.88)] px-4 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 font-mono text-xs text-[#6b7280] sm:flex-row">
        <p>© {new Date().getFullYear()} ScamDetect. Results are advisory only.</p>
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:text-[#00f0ff]">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[#00f0ff]">
            Terms &amp; Conditions
          </Link>
        </nav>
      </div>
    </footer>
  );
}
