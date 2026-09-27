"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck } from "lucide-react";
import type { Arc } from "cobe";
import { LiveDot } from "@/components/fx/LiveDot";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { Reveal } from "@/components/fx/Reveal";
import { Container, SectionHeading } from "@/components/ui/Misc";
import { brand } from "@/config/brand";
import { flag } from "@/data/countries";
import { TOP_COUNTRIES, TRADER_CITIES } from "@/data/globe";
import { formatUSD } from "@/lib/format";
import { useInterval } from "@/lib/hooks";

const Globe = dynamic(() => import("@/components/fx/Globe"), {
  ssr: false,
  loading: () => <div className="aspect-square w-full animate-pulse rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.05),transparent)]" />,
});

const MARKERS = TRADER_CITIES.map((c) => ({ location: c.location, size: 0.018 + c.weight * 0.022 }));
const METHODS = ["USDT", "USDC", "Rise", "Bank"];

type FeedItem = { id: number; city: string; country: string; amount: number; method: string; location: [number, number] };

const SEED_FEED: FeedItem[] = [
  { id: 3, city: "Dubai", country: "AE", amount: 4210, method: "USDT", location: [25.2048, 55.2708] },
  { id: 2, city: "Lagos", country: "NG", amount: 2865.5, method: "Rise", location: [6.5244, 3.3792] },
  { id: 1, city: "Mumbai", country: "IN", amount: 6120.25, method: "USDT", location: [19.076, 72.8777] },
];

export function GlobalCommunity() {
  const [feed, setFeed] = useState<FeedItem[]>(SEED_FEED);

  useInterval(() => {
    const pool = TRADER_CITIES.filter((c) => c.city !== brand.hq.city);
    const c = pool[Math.floor(Math.random() * pool.length)];
    const amount = Math.round((900 + Math.random() * 11_500) * 100) / 100;
    const method = METHODS[Math.floor(Math.random() * METHODS.length)];
    setFeed((f) => [
      { id: (f[0]?.id ?? 0) + 1, city: c.city, country: c.country, amount, method, location: c.location },
      ...f,
    ].slice(0, 4));
  }, 2800);

  const arcs: Arc[] = feed.slice(0, 3).map((f) => ({ from: brand.hq.location, to: f.location }));

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,color-mix(in_oklab,var(--accent-2)_8%,transparent),transparent)]" />
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Global community"
              title={
                <>
                  Traders in <span className="text-gradient">{brand.stats.countries}+ countries</span>
                </>
              }
              subtitle="From Dubai to São Paulo, NovaEdge traders are funded and rewarded every day. Every reward below is streamed live in this demo."
            />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-wrap gap-2">
              {TOP_COUNTRIES.map((c) => (
                <span key={c.code} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-sm">
                  <span>{flag(c.code)}</span>
                  <span className="text-fg/90">{c.name}</span>
                  <span className="num text-xs text-muted">{Math.round(c.share * 100)}%</span>
                </span>
              ))}
            </div>
          </Reveal>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <LiveDot /> Live reward feed
              </p>
              <p className="text-xs text-muted">Simulated in real time</p>
            </div>
            <ul className="relative space-y-2" aria-live="polite">
              <AnimatePresence initial={false} mode="popLayout">
                {feed.map((f, i) => (
                  <motion.li
                    key={f.id}
                    layout
                    initial={{ opacity: 0, x: -24, scale: 0.97 }}
                    animate={{ opacity: i === 3 ? 0.35 : 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-[#0a0f19]/80 px-3.5 py-3"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-1/10 text-accent-1">
                      <BadgeCheck className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <span className="num font-semibold text-fg">{formatUSD(f.amount)}</span>
                        <span className="text-muted"> reward sent to </span>
                        <span>{flag(f.country)}</span> <span className="text-fg/90">{f.city}</span>
                      </p>
                      <p className="text-xs text-muted">
                        {i === 0 ? "just now" : `${i * 3 + 1}s ago`} · {f.method}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>

        <Reveal delay={0.05} className="relative mx-auto w-full max-w-[560px]">
          <div aria-hidden className="absolute inset-[8%] -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent-2)_20%,transparent),transparent)] blur-2xl" />
          <Globe markers={MARKERS} arcs={arcs} />
          <div className="glass-solid absolute bottom-[6%] left-0 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl sm:left-[4%]">
            <span className="text-2xl">🌍</span>
            <div>
              <p className="text-[11px] text-muted">Paid in the last 24h</p>
              <NumberRoll value={brand.stats.paidLast24h} format="usd0" className="text-lg font-semibold" countUp />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
