import Image from "next/image";
import Link from "next/link";
import { Shield, Zap, Globe, Upload } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 px-4 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.05)] px-4 py-1.5 text-xs font-mono text-[#00f0ff] tracking-widest">
          <span className="pulse-glow">◈</span> THREAT INTELLIGENCE ACTIVE
        </div>

        <h1 className="max-w-3xl text-4xl md:text-6xl font-bold font-mono leading-tight tracking-tight text-[#e2e8ff] mb-6">
          Analyze messages.{" "}
          <span className="text-[#00f0ff] glow-text-cyan">Detect scams.</span>{" "}
          Stay safe.
        </h1>

        <p className="max-w-xl text-[#6b7280] text-lg mb-12 leading-relaxed">
          AI-powered phishing & scam detection for SMS, email, WhatsApp messages
          and URLs. Supports 6 languages with real-time threat intelligence.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-20">
          <Link
            href="/analyze-message"
            className="flex items-center gap-2 rounded border border-[#00f0ff] bg-[rgba(0,240,255,0.1)] px-6 py-3 font-mono text-sm text-[#00f0ff] tracking-wide transition-all hover:bg-[rgba(0,240,255,0.2)] glow-cyan"
          >
            <Zap className="h-4 w-4" />
            Analyze Message
          </Link>
          <Link
            href="/scan-url"
            className="flex items-center gap-2 rounded border border-[#ff00ff] bg-[rgba(255,0,255,0.1)] px-6 py-3 font-mono text-sm text-[#ff00ff] tracking-wide transition-all hover:bg-[rgba(255,0,255,0.2)] glow-magenta"
          >
            <Shield className="h-4 w-4" />
            Scan URL
          </Link>
          <Link
            href="/upload-screenshot"
            className="flex items-center gap-2 rounded border border-[rgba(125,249,255,0.4)] bg-[rgba(125,249,255,0.05)] px-6 py-3 font-mono text-sm text-[#7df9ff] tracking-wide transition-all hover:bg-[rgba(125,249,255,0.1)]"
          >
            <Upload className="h-4 w-4" />
            Upload Screenshot
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-panel p-6 text-left">
              <f.Icon
                className="h-8 w-8 mb-4 text-[#00f0ff]"
                strokeWidth={1.5}
              />
              <h3 className="font-mono text-[#e2e8ff] font-semibold mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-[rgba(0,240,255,0.1)] bg-[rgba(15,15,26,0.6)] py-6 px-4">
        <div className="mx-auto max-w-4xl flex flex-wrap justify-around gap-4 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-mono text-2xl font-bold text-[#00f0ff] glow-text-cyan">
                {s.value}
              </p>
              <p className="text-xs text-[#6b7280] tracking-wide font-mono mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const FEATURES = [
  {
    Icon: Zap,
    title: "AI Classification",
    desc: "Llama3-powered detection classifies messages as SAFE, SUSPICIOUS, or PHISHING in real time.",
  },
  {
    Icon: Globe,
    title: "Multilingual",
    desc: "Supports English, Yoruba, Hausa, Igbo, French, and Spanish for global coverage.",
  },
  {
    Icon: Shield,
    title: "Threat Intelligence",
    desc: "Cross-references VirusTotal & PhishTank databases for known malicious URLs and domains.",
  },
];

const STATS = [
  { value: "6", label: "LANGUAGES SUPPORTED" },
  { value: "99%+", label: "VIRUSTOTAL COVERAGE" },
  { value: "<2s", label: "AVG SCAN TIME" },
  { value: "24/7", label: "THREAT MONITORING" },
];
