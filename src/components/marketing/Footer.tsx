"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Container, DemoPill } from "@/components/ui/Misc";
import { brand } from "@/config/brand";
import { toast } from "@/lib/toast";
import { LEGAL_DOCS, LegalModal, type LegalDoc } from "./LegalModal";

const COLUMNS = [
  {
    title: "Programs",
    links: [
      { label: "2-Step Evaluation", href: "/checkout?model=two-step&size=100000" },
      { label: "1-Step Evaluation", href: "/checkout?model=one-step&size=100000" },
      { label: "Instant Funding", href: "/checkout?model=instant&size=50000" },
      { label: "Compare all plans", href: "/challenges" },
    ],
  },
  {
    title: "Traders",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Payout proof", href: "/#payouts" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Trader dashboard", href: "/dashboard" },
      { label: "Admin preview", href: "/admin" },
      { label: "Log in", href: "/login" },
      { label: "Create account", href: "/signup" },
    ],
  },
];

export function Footer() {
  const [doc, setDoc] = useState<LegalDoc | null>(null);
  return (
    <footer className="relative border-t border-line bg-[#04060b]">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{brand.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {brand.social.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => toast.info(`${brand.shortName} on ${s.label}`, `${s.handle} — social links are set in brand.ts`)}
                  className="rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-white/15 hover:text-fg"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <DemoPill className="mt-6" />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg/80">{col.title}</p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-muted transition-colors hover:text-fg">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_DOCS.map((d) => (
              <button key={d.id} type="button" onClick={() => setDoc(d.id)} className="text-xs text-muted transition-colors hover:text-fg">
                {d.label}
              </button>
            ))}
          </nav>
          <p className="text-xs text-muted">© 2026 {brand.name}. All rights reserved.</p>
        </div>

        <p className="mt-6 max-w-5xl text-[11.5px] leading-relaxed text-muted/80">
          <span className="font-semibold text-muted">Risk disclaimer:</span> All accounts provided by {brand.name} are
          simulated and use virtual funds. No real capital is traded or held on behalf of traders, and rewards are paid
          from the firm’s own revenue based on simulated performance. Nothing on this site is investment advice. Trading
          leveraged products carries a high level of risk. This website is a demo preview with simulated data for a
          fictional company — {brand.legalEntity}.
        </p>
      </Container>
      <LegalModal doc={doc} onClose={() => setDoc(null)} />
    </footer>
  );
}
