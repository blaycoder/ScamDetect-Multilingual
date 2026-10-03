import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import {
  LegalPage,
  LEGAL_CONTACT_EMAIL,
  type LegalSection,
} from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions — ScamDetect",
  description: "The terms that govern your use of ScamDetect.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    body: (
      <p>
        By using ScamDetect you agree to these terms and to our{" "}
        <Link href="/privacy">Privacy Policy</Link>. If you do not agree, please
        do not use the service.
      </p>
    ),
  },
  {
    id: "service",
    title: "The Service",
    body: (
      <p>
        ScamDetect analyzes messages, URLs, and screenshots and gives an
        automated risk assessment (Safe, Suspicious, or Phishing). It also
        lets users report scams to a community database reviewed by admins.
      </p>
    ),
  },
  {
    id: "no-guarantee",
    title: "No Guarantee of Accuracy",
    body: (
      <>
        <p>
          Results come from AI models and third-party threat databases and{" "}
          <strong>can be wrong</strong>. A &quot;Safe&quot; result does not
          guarantee that something is safe, and a &quot;Phishing&quot; result
          does not prove that it is a scam.
        </p>
        <p>
          ScamDetect is an advisory tool only. Always verify directly with the
          organization involved before sending money, sharing personal details,
          or clicking links. ScamDetect does not give legal or financial advice.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts",
    body: (
      <p>
        You are responsible for keeping your login details secure and for all
        activity under your account. Please give accurate information when
        signing up.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Submit false, malicious, or defamatory scam reports.</li>
          <li>
            Submit content you have no right to share, or other people&apos;s
            sensitive personal data without need.
          </li>
          <li>
            Use the service to test or improve scams, or to evade scam
            detection.
          </li>
          <li>
            Overload, scrape, reverse-engineer, or interfere with the service
            or its API.
          </li>
          <li>Break any applicable law while using the service.</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-content",
    title: "Content You Submit",
    body: (
      <p>
        You keep ownership of what you submit. You give ScamDetect permission to
        store, process, and analyze it to provide the service, and, for
        approved scam reports, to publish the reported value in the public scam
        database. We may reject or remove any report at our discretion.
      </p>
    ),
  },
  {
    id: "third-parties",
    title: "Third-Party Services",
    body: (
      <p>
        ScamDetect relies on third-party services for hosting, AI analysis,
        threat intelligence, and translation. We are not responsible for their
        availability, accuracy, or practices.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    body: (
      <p>
        ScamDetect is provided &quot;as is&quot; and &quot;as available&quot;
        without warranties of any kind. To the fullest extent allowed by law,
        we are not liable for any loss or damage, including financial loss
        from a scam, resulting from your use of or reliance on the service.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Suspension and Termination",
    body: (
      <p>
        We may suspend or end your access if you break these terms. You may
        stop using ScamDetect at any time and ask us to delete your account.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to These Terms",
    body: (
      <p>
        We may update these terms from time to time. Continuing to use
        ScamDetect after changes means you accept the updated terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        For questions about these terms, email{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      Icon={FileText}
      eyebrow="TERMS & CONDITIONS"
      title="Terms & Conditions"
      intro={
        <p>
          Please read these terms carefully. They explain the rules for using
          ScamDetect and the limits of what the service can do for you.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
