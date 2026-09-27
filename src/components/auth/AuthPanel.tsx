"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star } from "lucide-react";
import { AuroraBackground } from "@/components/fx/AuroraBackground";
import { LiveDot } from "@/components/fx/LiveDot";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { Avatar } from "@/components/ui/Avatar";
import { PnL } from "@/components/ui/Misc";
import { brand } from "@/config/brand";
import { flag } from "@/data/countries";
import { TESTIMONIALS } from "@/data/testimonials";
import { useInterval } from "@/lib/hooks";
import { createRng } from "@/lib/rng";

const W = 460;
const H = 150;
const N = 42;
const seed = createRng("auth-chart");
const START: number[] = (() => {
  const pts = [206_420];
  for (let i = 1; i < N; i++) pts.push(pts[i - 1] + seed.normal(60, 260));
  return pts;
})();

function toPath(pts: number[]) {
  const min = Math.min(...pts) - 200;
  const max = Math.max(...pts) + 200;
  return pts
    .map((v, i) => `${i === 0 ? "M" : "L"}${((i / (N - 1)) * W).toFixed(1)} ${(8 + (1 - (v - min) / (max - min)) * (H - 16)).toFixed(1)}`)
    .join(" ");
}

export function AuthPanel() {
  const [pts, setPts] = useState(START);
  const [ti, setTi] = useState(0);

  useInterval(() => {
    const step = (Math.random() - 0.42) * 320;
    setPts((p) => [...p.slice(1), p[p.length - 1] + step]);
  }, 1200);
  useInterval(() => setTi((i) => (i + 1) % TESTIMONIALS.length), 5200);

  const line = toPath(pts);
  const equity = pts[pts.length - 1];
  const t = TESTIMONIALS[ti];

  return (
    <div className="relative hidden overflow-hidden border-l border-line bg-[#060911] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <AuroraBackground intensity={0.95} />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-1">{brand.name}</p>
        <h2 className="mt-4 max-w-md text-4xl font-semibold leading-[1.08] tracking-[-0.04em] xl:text-5xl">
          Your capital. <span className="text-gradient">Your edge.</span> Our risk engine.
        </h2>
      </div>

      <div className="relative mx-auto my-10 w-full max-w-[520px]">
        <div className="card rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[13px] font-semibold">
              <LiveDot /> $200K Funded · #8812199
            </span>
            <span className="font-mono text-[11px] text-muted">Match-Trader</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs text-muted">Equity</p>
              <NumberRoll value={equity} format="usd" flash className="text-[28px] font-semibold tracking-tight" />
            </div>
            <PnL value={equity - 200_000} className="text-sm font-semibold" />
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" aria-hidden>
            <defs>
              <linearGradient id="auth-stroke" x1="0" x2="1">
                <stop offset="0" stopColor="var(--accent-1)" />
                <stop offset="0.6" stopColor="var(--accent-2)" />
                <stop offset="1" stopColor="var(--accent-3)" />
              </linearGradient>
              <linearGradient id="auth-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="var(--accent-2)" stopOpacity="0.25" />
                <stop offset="1" stopColor="var(--accent-2)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${line} L${W} ${H} L0 ${H} Z`} fill="url(#auth-fill)" style={{ transition: "d 1s ease" }} />
            <path d={line} fill="none" stroke="url(#auth-stroke)" strokeWidth="2.2" strokeLinejoin="round" style={{ transition: "d 1s ease" }} />
          </svg>
        </div>
      </div>

      <div className="relative min-h-[170px]">
        <AnimatePresence mode="wait">
          <motion.figure
            key={ti}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.5 }}
          >
            <span className="flex text-warning" aria-label={`${t.rating} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={i < t.rating ? "size-4 fill-current" : "size-4 opacity-30"} />
              ))}
            </span>
            <blockquote className="mt-3 max-w-lg text-lg leading-relaxed text-fg/90">“{t.quote}”</blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <Avatar name={t.name} />
              <span>
                <span className="block text-sm font-semibold">
                  {t.name} {flag(t.country)}
                </span>
                <span className="block text-xs text-muted">{t.badge}</span>
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
    </div>
  );
}
