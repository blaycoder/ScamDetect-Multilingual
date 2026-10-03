import Link from "next/link";
import type { LucideIcon } from "lucide-react";

// Update these before going live.
export const LEGAL_CONTACT_EMAIL = "support@scamdetect.app";
export const LEGAL_LAST_UPDATED = "October 3, 2026";

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  Icon: LucideIcon;
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}

export function LegalPage({
  Icon,
  eyebrow,
  title,
  intro,
  sections,
}: LegalPageProps) {
  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest text-[#00f0ff]">
          <Icon className="h-3 w-3" />
          <span>{eyebrow}</span>
        </div>
        <h1 className="font-mono text-3xl font-bold text-[#e2e8ff]">{title}</h1>
        <p className="mt-2 font-mono text-xs text-[#6b7280]">
          Last updated: {LEGAL_LAST_UPDATED}
        </p>
        <div className="mt-6 text-sm leading-relaxed text-[#9ca3af]">
          {intro}
        </div>

        {/* Table of contents */}
        <nav
          aria-label="Contents"
          className="glass-panel mt-8 p-5"
        >
          <p className="mb-3 font-mono text-xs tracking-widest text-[#6b7280]">
            CONTENTS
          </p>
          <ol className="grid gap-1.5 sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="font-mono text-xs text-[#7df9ff] hover:text-[#00f0ff] hover:underline"
                >
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="mb-3 font-mono text-lg font-semibold text-[#e2e8ff]">
                <span className="text-[#00f0ff]">{i + 1}.</span> {s.title}
              </h2>
              <div className="legal-body space-y-3 text-sm leading-relaxed text-[#9ca3af]">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-[rgba(0,240,255,0.1)] pt-6 font-mono text-xs text-[#6b7280]">
          Questions? Email{" "}
          <a
            href={`mailto:${LEGAL_CONTACT_EMAIL}`}
            className="text-[#00f0ff] hover:underline"
          >
            {LEGAL_CONTACT_EMAIL}
          </a>
          {" · "}
          <Link href="/privacy" className="hover:text-[#e2e8ff]">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/terms" className="hover:text-[#e2e8ff]">
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </div>
  );
}
