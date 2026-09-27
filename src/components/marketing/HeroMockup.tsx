"use client";

import { useState } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { TiltCard } from "@/components/fx/TiltCard";
import { LiveDot } from "@/components/fx/LiveDot";
import { Progress } from "@/components/ui/Progress";
import { PnL } from "@/components/ui/Misc";
import { cn } from "@/lib/cn";
import { useInterval } from "@/lib/hooks";
import { createRng } from "@/lib/rng";

/* Seeded equity curve: $100,000 → $104,960 (62% of an 8% target). */
const W = 520;
const H = 170;
const N = 46;
const START = 100_000;
const END = 104_960;
const TARGET = 108_000;
const Y_MIN = 98_800;
const Y_MAX = 108_900;

const series = (() => {
  const rng = createRng("hero-equity-v2");
  const raw = [START];
  for (let i = 1; i < N; i++) raw.push(raw[i - 1] + rng.normal(95, 430));
  const fix = END - raw[N - 1];
  return raw.map((v, i) => v + (fix * i) / (N - 1));
})();

const x = (i: number) => (i / (N - 1)) * W;
const y = (v: number) => 8 + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 16);
const LINE = series.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
const AREA = `${LINE} L${W} ${H} L0 ${H} Z`;
const LAST = { x: x(N - 1), y: y(series[N - 1]) };

const DAY_START = 105_020;
const DAILY_LIMIT = 5_000;

export function HeroMockup() {
  const [equity, setEquity] = useState(105_272.4);

  useInterval(() => {
    const d = (Math.random() - 0.46) * 190;
    setEquity((e) => Math.min(105_980, Math.max(104_560, Math.round((e + d) * 100) / 100)));
  }, 1400);

  const today = equity - DAY_START;
  const dailyLeft = Math.min(DAILY_LIMIT, equity - (DAY_START - DAILY_LIMIT));

  return (
    <div className="relative mx-auto w-full max-w-[580px] lg:mx-0 lg:justify-self-end">
      {/* soft glow behind the card */}
      <div aria-hidden className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent-2)_22%,transparent),transparent)] blur-2xl" />
      <TiltCard trackWindow max={7} className="w-full" innerClassName="rounded-[28px]">
        <div className="card rounded-[28px] p-4 sm:p-5">
          {/* header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <LiveDot />
              <span className="text-[13px] font-semibold">Phase 1 · $100K 2-Step</span>
            </div>
            <span className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-muted">
              MT5 · #8812301
            </span>
          </div>

          {/* equity */}
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted">Equity</p>
              <NumberRoll value={equity} format="usd" flash className="mt-1 text-[30px] font-semibold leading-none tracking-tight sm:text-[34px]" />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Today’s P/L</p>
              <PnL value={today} className="mt-1 text-sm font-semibold" />
            </div>
          </div>

          {/* chart */}
          <div className="relative mt-4 rounded-2xl border border-line bg-[#070a12]/60 p-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" role="img" aria-label="Equity curve rising towards the profit target">
              <defs>
                <linearGradient id="hero-stroke" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="var(--accent-1)" />
                  <stop offset="55%" stopColor="var(--accent-2)" />
                  <stop offset="100%" stopColor="var(--accent-3)" />
                </linearGradient>
                <linearGradient id="hero-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(255,255,255,0.045)" />
              ))}
              <line x1="0" x2={W} y1={y(TARGET)} y2={y(TARGET)} stroke="var(--accent-1)" strokeOpacity="0.55" strokeDasharray="5 6" />
              <text x={W - 4} y={y(TARGET) - 6} textAnchor="end" className="fill-accent-1 font-mono text-[10px]">
                TARGET $108,000
              </text>
              <line x1="0" x2={W} y1={y(START)} y2={y(START)} stroke="rgba(255,255,255,0.22)" strokeDasharray="3 6" />
              <text x={W - 4} y={y(START) + 14} textAnchor="end" className="fill-muted font-mono text-[10px]">
                START $100,000
              </text>
              <path d={AREA} fill="url(#hero-fill)" className="fade-in-late" />
              <path
                d={LINE}
                pathLength={1}
                fill="none"
                stroke="url(#hero-stroke)"
                strokeWidth="2.4"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="draw-line"
                style={{ filter: "drop-shadow(0 0 8px color-mix(in oklab, var(--accent-2) 60%, transparent))" }}
              />
              <g className="fade-in-late">
                <circle cx={LAST.x} cy={LAST.y} r="10" fill="var(--accent-3)" opacity="0.18" className="animate-ping [transform-box:fill-box] [transform-origin:center]" />
                <circle cx={LAST.x} cy={LAST.y} r="4.5" fill="var(--accent-3)" stroke="#05070d" strokeWidth="2" />
              </g>
            </svg>
          </div>

          {/* objective progress */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-fg/90">Phase 1 · 62% to target</span>
              <span className="num text-muted">$4,960 / $8,000</span>
            </div>
            <Progress value={0.62} height="md" label="Progress to profit target" />
          </div>

          {/* mini stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat label="Daily loss left">
              <NumberRoll value={dailyLeft} format="usd0" className="text-[15px] font-semibold" />
              <Progress value={1 - dailyLeft / DAILY_LIMIT} mode="usage" height="xs" className="mt-2" />
            </MiniStat>
            <MiniStat label="Max loss left">
              <NumberRoll value={equity - 90_000} format="usd0" className="text-[15px] font-semibold" />
              <span className="mt-1.5 block text-[10.5px] text-muted">Static · $90K floor</span>
            </MiniStat>
            <MiniStat label="Trading days">
              <span className="num text-[15px] font-semibold">3 / 4</span>
              <span className="mt-2 flex gap-1">
                {[0, 1, 2, 3].map((d) => (
                  <span
                    key={d}
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      d < 3 ? "bg-gradient-brand shadow-[0_0_8px_-1px_var(--accent-2)]" : "bg-white/10",
                    )}
                  />
                ))}
              </span>
            </MiniStat>
          </div>
        </div>

        {/* floating layers (parallax depth while tilting) */}
        <div className="absolute -right-3 -top-6 sm:-right-8 [transform:translateZ(70px)]">
          <div className="float-slow glass-solid flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-2xl">
            <span className="grid size-8 place-items-center rounded-xl bg-accent-1/15 text-accent-1">
              <BadgeCheck className="size-4" />
            </span>
            <div>
              <p className="text-[11px] text-muted">Reward approved · USDT</p>
              <p className="num text-sm font-semibold">$5,778.00</p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-5 -left-3 hidden sm:block sm:-left-10 [transform:translateZ(50px)]">
          <div className="float-slower glass-solid flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-2xl">
            <span className="grid size-8 place-items-center rounded-xl bg-accent-2/15 text-accent-2">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <p className="text-[11px] text-muted">Risk engine</p>
              <p className="text-sm font-semibold">6 / 6 rules passing</p>
            </div>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}

function MiniStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-2.5 sm:p-3">
      <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted">{label}</p>
      {children}
    </div>
  );
}
