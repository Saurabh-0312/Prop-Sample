"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Crown, TrendingUp } from "lucide-react";
import { BorderBeam } from "@/components/fx/BorderBeam";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Segmented } from "@/components/ui/Segmented";
import { flag } from "@/data/countries";
import { LEADERBOARD, type Leader } from "@/data/leaderboard";
import { MODELS, type ModelId } from "@/data/plans";
import { cn } from "@/lib/cn";
import { formatSize, formatUSD } from "@/lib/format";
import { useDemoStore } from "@/lib/store";

type Period = "month" | "all";
type ModelFilter = "all" | ModelId;

const MEDALS = [
  { ring: "ring-warning/70", text: "text-warning", pillar: "h-44 sm:h-52", glow: "shadow-[0_0_60px_-12px_var(--warning)]" },
  { ring: "ring-[#c8d3e6]/60", text: "text-[#c8d3e6]", pillar: "h-32 sm:h-40", glow: "" },
  { ring: "ring-[#e0a574]/60", text: "text-[#e0a574]", pillar: "h-24 sm:h-32", glow: "" },
];
// Visual order on the podium: 2nd, 1st, 3rd
const PODIUM_ORDER = [1, 0, 2];

function PodiumSpot({ t, place, delay }: { t: Leader; place: number; delay: number }) {
  const m = MEDALS[place];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 160, damping: 18 }}
      className="flex min-w-0 flex-col items-center"
    >
      <div className="relative mb-3">
        {place === 0 && (
          <motion.span
            initial={{ y: -8, opacity: 0, rotate: -12 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ delay: delay + 0.3, type: "spring", stiffness: 300, damping: 12 }}
            className="absolute -top-7 left-1/2 -translate-x-1/2"
          >
            <Crown className="size-6 fill-warning/30 text-warning drop-shadow-[0_0_10px_var(--warning)]" />
          </motion.span>
        )}
        <Avatar name={t.name} size="lg" className={cn("ring-2", m.ring)} />
      </div>
      <p className="max-w-full truncate text-sm font-semibold sm:text-base">
        {t.name} <span>{flag(t.country)}</span>
      </p>
      <p className="mb-3 text-[11px] text-muted">
        {formatSize(t.size)} {MODELS[t.model].shortName}
      </p>
      <div
        className={cn(
          "relative flex w-full flex-col items-center justify-start gap-1 rounded-t-2xl border border-b-0 border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))] pt-4",
          m.pillar,
          m.glow,
        )}
      >
        {place === 0 && <BorderBeam duration={6} />}
        <span className={cn("num text-3xl font-bold sm:text-4xl", m.text)}>{place + 1}</span>
        <span className="num inline-flex items-center gap-0.5 text-sm font-semibold text-profit">
          <ArrowUpRight className="size-3.5" />+{t.profitPct.toFixed(2)}%
        </span>
        <span className="num text-xs text-muted">+{formatUSD(t.gain, 0)}</span>
      </div>
    </motion.div>
  );
}

export function LeaderboardBoard({ showYou = false }: { showYou?: boolean }) {
  const [period, setPeriod] = useState<Period>("month");
  const [model, setModel] = useState<ModelFilter>("all");
  const session = useDemoStore((s) => s.session);

  const list = LEADERBOARD[period]
    .filter((t) => model === "all" || t.model === model)
    .map((t, i) => ({ ...t, rank: i + 1 }));
  const podium = list.slice(0, 3);
  const rest = list.slice(3);
  const key = `${period}-${model}`;

  const you = period === "month" ? { rank: 142, pct: 6.2, gain: 6_200 } : { rank: 318, pct: 14.84, gain: 14_840 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          pill="gradient"
          ariaLabel="Leaderboard period"
          options={[
            { value: "month" as Period, label: "This Month" },
            { value: "all" as Period, label: "All Time" },
          ]}
          value={period}
          onChange={setPeriod}
        />
        <div className="-mx-1 overflow-x-auto px-1 no-scrollbar">
          <Segmented
            size="sm"
            ariaLabel="Filter by model"
            options={[
              { value: "all" as ModelFilter, label: "All models" },
              { value: "two-step" as ModelFilter, label: "2-Step" },
              { value: "one-step" as ModelFilter, label: "1-Step" },
              { value: "instant" as ModelFilter, label: "Instant" },
            ]}
            value={model}
            onChange={setModel}
          />
        </div>
      </div>

      {showYou && session && (
        <div className="card flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={session.name} size="lg" className="ring-2 ring-accent-2/50" />
            <div>
              <p className="text-xs text-muted">Your position · {period === "month" ? "this month" : "all time"}</p>
              <p className="flex items-baseline gap-2 text-2xl font-semibold">
                <NumberRoll value={you.rank} format="int" prefix="#" />
                <span className="text-sm font-normal text-muted">of 27,400 traders</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted">Return</p>
              <p className="num inline-flex items-center gap-0.5 font-semibold text-profit">
                <ArrowUpRight className="size-4" />+{you.pct.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Gain</p>
              <p className="num font-semibold">+{formatUSD(you.gain, 0)}</p>
            </div>
            <Badge tone="info" dot={false}>
              <TrendingUp className="size-3" /> Top 1%
            </Badge>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
          {podium.length === 3 && (
            <div className="card relative overflow-hidden rounded-3xl px-4 pt-12 sm:px-10">
              <div aria-hidden className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_50%_80%_at_50%_0%,color-mix(in_oklab,var(--warning)_14%,transparent),transparent)]" />
              <div className="relative mx-auto grid max-w-3xl grid-cols-3 items-end gap-3 sm:gap-6">
                {PODIUM_ORDER.map((place, i) => (
                  <PodiumSpot key={podium[place].name} t={podium[place]} place={place} delay={0.1 + i * 0.12} />
                ))}
              </div>
            </div>
          )}

          <div className="card overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="px-5 py-3 font-medium">Rank</th>
                    <th className="px-3 py-3 font-medium">Trader</th>
                    <th className="px-3 py-3 font-medium">Account</th>
                    <th className="px-3 py-3 text-right font-medium">Trades</th>
                    <th className="px-3 py-3 text-right font-medium">Win rate</th>
                    <th className="px-3 py-3 text-right font-medium">Days</th>
                    <th className="px-3 py-3 text-right font-medium">Profit</th>
                    <th className="px-5 py-3 text-right font-medium">Gain</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((t, i) => (
                    <motion.tr
                      key={t.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.03, duration: 0.35 }}
                      className="border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.025]"
                    >
                      <td className="num px-5 py-3 text-muted">#{t.rank}</td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-3">
                          <Avatar name={t.name} size="sm" />
                          <span className="font-medium">
                            {t.name} <span>{flag(t.country)}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={t.model === "instant" ? "funded" : "neutral"} dot={false}>
                          {formatSize(t.size)} {MODELS[t.model].shortName}
                        </Badge>
                      </td>
                      <td className="num px-3 py-3 text-right text-muted">{t.trades}</td>
                      <td className="num px-3 py-3 text-right text-muted">{t.winRate}%</td>
                      <td className="num px-3 py-3 text-right text-muted">{t.days}</td>
                      <td className="px-3 py-3 text-right">
                        <span className="num inline-flex items-center gap-0.5 font-semibold text-profit">
                          <ArrowUpRight className="size-3.5" />+{t.profitPct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="num px-5 py-3 text-right">+{formatUSD(t.gain, 0)}</td>
                    </motion.tr>
                  ))}
                  {rest.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted">
                        Only the podium qualifies for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
