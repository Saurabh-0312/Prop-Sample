"use client";

import { Modal } from "@/components/ui/Modal";
import { brand } from "@/config/brand";

export type LegalDoc = "terms" | "privacy" | "risk" | "refund" | "restricted";

export const LEGAL_DOCS: { id: LegalDoc; label: string }[] = [
  { id: "terms", label: "Terms & Conditions" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "risk", label: "Risk Disclosure" },
  { id: "refund", label: "Refund Policy" },
  { id: "restricted", label: "Restricted Countries" },
];

const CONTENT: Record<LegalDoc, { title: string; updated: string; body: { h: string; p: string }[] }> = {
  terms: {
    title: "Terms & Conditions",
    updated: "Version 3.2",
    body: [
      { h: "1. The service", p: `${brand.name} provides evaluation programs ("challenges") on simulated trading accounts. Passing an evaluation grants access to a funded account on simulated capital with a performance-based reward.` },
      { h: "2. Trading objectives", p: "Each account must respect its daily loss limit, maximum loss limit and minimum trading days. Rules are snapshotted at purchase and never change for accounts already sold." },
      { h: "3. Prohibited practices", p: "High-frequency trading, latency arbitrage, tick scalping, copy trading between accounts, cross-account hedging and third-party account management are not permitted and may lead to account closure." },
      { h: "4. Rewards", p: "Rewards are calculated as the funded account’s closed profit multiplied by the applicable reward share, and are paid after identity verification." },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "GDPR-ready",
    body: [
      { h: "What we collect", p: "Account details (name, email, country), identity documents for KYC, trading activity, and device and IP information used for fraud prevention." },
      { h: "How we use it", p: "To operate your accounts, verify your identity, process rewards, prevent abuse and meet legal obligations. We never sell personal data." },
      { h: "Your rights", p: `You can request a copy, correction or deletion of your data at any time by writing to ${brand.supportEmail}.` },
    ],
  },
  risk: {
    title: "Risk Disclosure",
    updated: "Please read carefully",
    body: [
      { h: "Simulated accounts", p: "All evaluation and funded accounts are simulated. No real capital is traded on your behalf and no client funds are held. Rewards are paid from the firm’s revenue." },
      { h: "Not investment advice", p: "Nothing on this website is financial advice. Past performance on simulated accounts does not guarantee future results." },
      { h: "Leveraged products", p: "Trading leveraged instruments such as forex and CFDs carries a high level of risk and may not be suitable for everyone." },
    ],
  },
  refund: {
    title: "Refund Policy",
    updated: "Clear and simple",
    body: [
      { h: "Unused challenges", p: "You can request a full refund within 14 days of purchase if no trade has been placed on the account." },
      { h: "Fee refund with first reward", p: "On 2-Step and 1-Step models your challenge fee is refunded together with your first reward on the funded account." },
      { h: "Instant Funding", p: "Instant Funding fees are non-refundable once the account has been issued." },
    ],
  },
  restricted: {
    title: "Restricted Countries",
    updated: "Updated quarterly",
    body: [
      { h: "Where we can’t serve you", p: "We do not offer our services to residents of sanctioned jurisdictions, including North Korea, Iran, Syria, Cuba, Myanmar and the occupied regions of Ukraine." },
      { h: "Enforcement", p: "Restrictions are enforced at sign-up, checkout, KYC and payout, and apply to affiliate traffic as well." },
    ],
  },
};

export function LegalModal({ doc, onClose }: { doc: LegalDoc | null; onClose: () => void }) {
  const c = doc ? CONTENT[doc] : null;
  return (
    <Modal open={!!doc} onClose={onClose} title={c?.title} description={c ? `${brand.name} · ${c.updated}` : undefined} size="lg">
      {c && (
        <div className="space-y-5">
          {c.body.map((b) => (
            <div key={b.h}>
              <h3 className="text-sm font-semibold text-fg">{b.h}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{b.p}</p>
            </div>
          ))}
          <p className="rounded-xl border border-line bg-white/[0.02] p-3 text-xs text-muted">
            Demo preview: this is sample copy for a fictional firm. Final legal texts should be written by counsel and match
            the rules engine exactly.
          </p>
        </div>
      )}
    </Modal>
  );
}
