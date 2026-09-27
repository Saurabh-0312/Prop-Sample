"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Lock } from "lucide-react";
import { BorderBeam } from "@/components/fx/BorderBeam";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { Reveal } from "@/components/fx/Reveal";
import { Button } from "@/components/ui/Button";
import { Container, SectionHeading } from "@/components/ui/Misc";
import { Segmented } from "@/components/ui/Segmented";
import { InfoTip } from "@/components/ui/Tooltip";
import { brand } from "@/config/brand";
import {
  AVG_REWARD,
  MODELS,
  MODEL_IDS,
  POPULAR_MODEL,
  POPULAR_SIZE,
  RULE_ROWS,
  SELECTOR_ROW_IDS,
  getPlanPrice,
  hasPromo,
  type AccountSize,
  type ModelId,
  type RuleUnit,
} from "@/data/plans";
import { cn } from "@/lib/cn";
import { formatUSD } from "@/lib/format";
import { SizePicker } from "./SizePicker";

const ROWS = RULE_ROWS.filter((r) => SELECTOR_ROW_IDS.includes(r.id));

/** Value that cross-fades (blur + slide) whenever it changes. */
export function SwapValue({ value, className, wrap }: { value: string; className?: string; wrap?: boolean }) {
  return (
    <span className={cn("relative inline-flex justify-end overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className={wrap ? "text-center" : "whitespace-nowrap"}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function ChallengeSelector() {
  const [model, setModel] = useState<ModelId>(POPULAR_MODEL);
  const [size, setSize] = useState<AccountSize>(POPULAR_SIZE);
  const [unit, setUnit] = useState<RuleUnit>("pct");
  const m = MODELS[model];
  const price = getPlanPrice(model, size);
  const popular = model === POPULAR_MODEL && size === POPULAR_SIZE;

  return (
    <section id="challenges" className="relative py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 h-[520px] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,color-mix(in_oklab,var(--accent-3)_10%,transparent),transparent)]" />
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Challenges"
            title={
              <>
                Choose your <span className="text-gradient">challenge</span>
              </>
            }
            subtitle="Pick a model and an account size. Rules and price update instantly — exactly what you see is what you trade."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="card mt-12 rounded-[28px] p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Segmented
                pill="gradient"
                ariaLabel="Challenge model"
                options={MODEL_IDS.map((id) => ({ value: id, label: MODELS[id].shortName }))}
                value={model}
                onChange={setModel}
                className="w-full sm:w-fit"
                fullWidth
              />
              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <span className="text-xs text-muted">Show rules in</span>
                <Segmented
                  size="sm"
                  ariaLabel="Rule units"
                  options={[
                    { value: "pct" as RuleUnit, label: "%" },
                    { value: "usd" as RuleUnit, label: "$" },
                  ]}
                  value={unit}
                  onChange={setUnit}
                />
              </div>
            </div>

            <div className="mt-4 min-h-6 text-sm text-muted">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p key={model} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.25 }}>
                  <span className="font-medium text-fg">{m.name}.</span> {m.tagline}
                </motion.p>
              </AnimatePresence>
            </div>

            <SizePicker value={size} onChange={setSize} className="mt-5" />

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
              {/* rules */}
              <div className="overflow-hidden rounded-2xl border border-line bg-[#070a12]/50">
                <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
                  <p className="text-sm font-semibold">Trading rules</p>
                  <p className="text-xs text-muted">{m.phases === 2 ? "Phase 1 → Phase 2" : m.phases === 1 ? "Single phase" : "Funded from day one"}</p>
                </div>
                <dl className="divide-y divide-line">
                  {ROWS.map((row) => {
                    const sub = row.sub?.(model);
                    return (
                      <div key={row.id} className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.02] sm:px-5">
                        <dt className="flex items-center gap-1.5 text-sm text-muted">
                          {row.label}
                          <InfoTip content={row.tooltip} label={`What is ${row.label}?`} />
                        </dt>
                        <dd className="flex flex-col items-end text-right">
                          <SwapValue value={row.value(model, size, [], unit)} className="num text-[15px] font-semibold text-fg" />
                          {sub && row.id !== "share" && <SwapValue value={sub} className="text-[11px] text-muted" />}
                          {row.id === "share" && <span className="text-[11px] text-accent-1">Up to 90% with add-on</span>}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>

              {/* price */}
              <div
                className={cn(
                  "relative flex flex-col rounded-2xl border p-5 transition-colors duration-500 sm:p-6",
                  popular ? "border-transparent bg-[linear-gradient(160deg,color-mix(in_oklab,var(--accent-2)_10%,transparent),transparent_55%)]" : "border-line bg-white/[0.02]",
                )}
              >
                {popular && <BorderBeam duration={5} />}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted">{m.name}</p>
                    <p className="num mt-1 text-2xl font-semibold">${size.toLocaleString("en-US")} account</p>
                  </div>
                  <AnimatePresence>
                    {popular && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="whitespace-nowrap rounded-full bg-gradient-brand px-2.5 py-1 text-[11px] font-semibold text-ink shadow-[0_0_20px_-4px_var(--accent-1)]"
                      >
                        Most popular
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-6">
                  <p className="text-xs text-muted">One-time fee</p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <NumberRoll value={price.price} format="usd0" className="text-[46px] font-semibold leading-none tracking-tight" />
                    {price.compareAt !== null && (
                      <span className="num text-lg text-muted line-through decoration-loss/70">{formatUSD(price.compareAt, 0)}</span>
                    )}
                  </div>
                  <div className="mt-3 flex min-h-6 flex-wrap items-center gap-2">
                    {hasPromo(model) && (
                      <span className="rounded-full border border-accent-1/30 bg-accent-1/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent-1">
                        −{brand.promo.pct}% {brand.promo.label}
                      </span>
                    )}
                    <span className="text-xs text-muted">{m.feeRefund === "Not refundable" ? "Fee not refundable" : "Refunded with your 1st reward"}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-xl border border-line bg-white/[0.02] px-3.5 py-3">
                  <span className="text-xs text-muted">Avg. reward on this tier</span>
                  <NumberRoll value={AVG_REWARD[size]} format="usd0" className="text-sm font-semibold text-fg" />
                </div>

                <ul className="mt-5 space-y-2.5 text-sm">
                  {[
                    `${Math.round(m.rewardShare * 100)}% reward share, up to 90%`,
                    m.minTradingDays ? `${m.minTradingDays} min trading days · ${m.timeLimit.toLowerCase()} time` : "No minimum trading days",
                    "MT5 · cTrader · Match-Trader · TradeLocker",
                    `${m.payoutFrequency} rewards · USDT, bank or Rise`,
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-fg/85">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent-1" />
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <Button
                    href={`/checkout?model=${model}&size=${size}`}
                    size="lg"
                    fullWidth
                    iconRight={<ArrowRight className="size-4" />}
                  >
                    Start Challenge
                  </Button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
                    <Lock className="size-3" /> Secure checkout · Card &amp; crypto
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex justify-center">
          <Link
            href="/challenges"
            className="group inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-4 py-2 text-sm font-medium text-fg/90 transition-colors hover:border-accent-2/40 hover:text-fg"
          >
            Compare all plans
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
