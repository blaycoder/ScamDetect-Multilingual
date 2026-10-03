import type { Metadata } from "next";
import { Lock } from "lucide-react";
import {
  LegalPage,
  LEGAL_CONTACT_EMAIL,
  type LegalSection,
} from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — ScamDetect",
  description: "How ScamDetect collects, uses, and protects your data.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: (
      <>
        <p>We only collect what we need to run the service:</p>
        <ul>
          <li>
            <strong>Account details</strong> — your email address and login
            credentials (handled by our authentication provider, Supabase) if
            you create an account.
          </li>
          <li>
            <strong>Content you submit for analysis</strong> — messages, URLs,
            and screenshots you ask us to check. Analyzed message text (up to
            5,000 characters), scanned URLs, and their risk results may be
            saved.
          </li>
          <li>
            <strong>Scam reports</strong> — the type of scam, the reported
            value (e.g. a phone number, URL, or account), any message content
            or screenshot, your description, and your language.
          </li>
          <li>
            <strong>Disclaimer acknowledgment</strong> — when you accept our
            disclaimer we record your IP address, browser user agent, language,
            and the disclaimer version, linked to your account or an anonymous
            ID.
          </li>
          <li>
            <strong>Data stored on your device</strong> — your language
            preference, an anonymous ID, and whether you have accepted the
            disclaimer are kept in your browser&apos;s local storage.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    body: (
      <ul>
        <li>To analyze content and tell you whether it looks like a scam.</li>
        <li>To show your scan history on your dashboard.</li>
        <li>
          To review community reports and publish approved ones in the scam
          database.
        </li>
        <li>
          To improve our detection and to keep a record that you accepted the
          disclaimer.
        </li>
        <li>To prevent abuse and keep the service secure.</li>
      </ul>
    ),
  },
  {
    id: "third-parties",
    title: "Third-Party Services",
    body: (
      <>
        <p>
          To analyze your content, parts of it may be sent to these providers,
          each under its own privacy policy:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — database, file storage, and
            authentication.
          </li>
          <li>
            <strong>Groq</strong> and <strong>Ollama</strong> — AI models that
            classify messages.
          </li>
          <li>
            <strong>VirusTotal</strong> and <strong>PhishTank</strong> — check
            URLs against known threat databases.
          </li>
          <li>
            <strong>Lingo.dev</strong> — translates results into your chosen
            language.
          </li>
        </ul>
        <p>
          Note that URLs submitted to VirusTotal may become visible to its
          security community. Do not submit links containing personal tokens
          or passwords.
        </p>
      </>
    ),
  },
  {
    id: "public-database",
    title: "Community Scam Database",
    body: (
      <p>
        If an admin approves your scam report, the reported value (such as the
        scam URL or phone number) and its type are shown publicly. Your
        description and your identity as the reporter are never shown
        publicly.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Sharing Your Information",
    body: (
      <p>
        We do not sell your personal data. We only share it with the service
        providers listed above, or when required by law.
      </p>
    ),
  },
  {
    id: "retention",
    title: "Data Retention",
    body: (
      <p>
        We keep your data for as long as your account is active or as needed to
        provide the service. Approved scam reports may be kept to protect
        other users. You can ask us to delete your data at any time.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        We use reasonable technical measures to protect your data, including
        encrypted connections and access controls. No system is completely
        secure, so please avoid submitting sensitive information such as
        passwords, PINs, or bank card numbers.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    body: (
      <p>
        You may request access to, correction of, or deletion of your personal
        data, or object to how we process it. Email{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a> and
        we will respond within a reasonable time.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        ScamDetect is not intended for children under 13, and we do not
        knowingly collect their personal data.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: (
      <p>
        We may update this policy from time to time. The &quot;Last
        updated&quot; date at the top will show when it last changed.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      Icon={Lock}
      eyebrow="PRIVACY POLICY"
      title="Privacy Policy"
      intro={
        <p>
          ScamDetect helps you spot scams and phishing attempts. This policy
          explains what information we collect when you use the service, how
          we use it, and the choices you have.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
