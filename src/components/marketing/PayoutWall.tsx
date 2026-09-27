"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Marquee } from "@/components/fx/Marquee";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { Reveal } from "@/components/fx/Reveal";
import { LiveDot } from "@/components/fx/LiveDot";
import { Avatar } from "@/components/ui/Avatar";
import { Container, SectionHeading } from "@/components/ui/Misc";
import { brand } from "@/config/brand";
import { flag } from "@/data/countries";
import { PAYOUT_METHODS, PAYOUT_WALL, type WallPayout } from "@/data/payouts";
import { formatUSD } from "@/lib/format";
import { useInterval } from "@/lib/hooks";

function PayoutCard({ p }: { p: WallPayout }) {
  return (
    <div className="w-[260px] shrink-0 rounded-2xl border border-line bg-[linear-gradient(180deg,#0e1420,#0a0e17)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center gap-3">
        <Avatar name={p.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {p.name} <span>{flag(p.country)}</span>
          </p>
          <p className="text-[11px] text-muted">
            {p.size} account · {p.ago}
          </p>
        </div>
        <BadgeCheck className="size-4 shrink-0 text-accent-1" aria-label="Verified payout" />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] text-muted">Reward paid</p>
          <p className="num text-xl font-semibold tracking-tight">{formatUSD(p.amount)}</p>
        </div>
        <span className="rounded-md border border-line bg-white/[0.04] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-fg/85">
          {PAYOUT_METHODS[p.method].short}
        </span>
      </div>
    </div>
  );
}

const ROW_A = PAYOUT_WALL.slice(0, 9);
const ROW_B = PAYOUT_WALL.slice(9);

export function PayoutWall() {
  const [paid, setPaid] = useState<number>(brand.stats.paidLast24h);
  useInterval(() => {
    const add = Math.round(900 + Math.random() * 5200);
    setPaid((v) => v + add);
  }, 4200);

  return (
    <section id="payouts" className="relative py-20 sm:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Payout proof"
              title={
                <>
                  Real rewards. <span className="text-gradient">Paid fast.</span>
                </>
              }
              subtitle="Every funded trader can request rewards in USDT, USDC, bank transfer or Rise. Names are masked for privacy."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card flex items-center gap-4 rounded-2xl px-5 py-4">
              <LiveDot />
              <div>
                <p className="text-xs text-muted">Paid in the last 24h</p>
                <NumberRoll value={paid} format="usd0" className="text-2xl font-semibold" flash />
              </div>
            </div>
          </Reveal>
        </div>
      </Container>

      <div className="mt-12 space-y-4">
        <Marquee duration={70}>
          {ROW_A.map((p) => (
            <PayoutCard key={p.name} p={p} />
          ))}
        </Marquee>
        <Marquee duration={80} reverse>
          {ROW_B.map((p) => (
            <PayoutCard key={p.name} p={p} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
