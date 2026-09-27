"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Columns3, LayoutGrid } from "lucide-react";
import { SpotlightCard } from "@/components/fx/SpotlightCard";
import { Reveal } from "@/components/fx/Reveal";
import { SizePicker } from "@/components/marketing/SizePicker";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { Switch } from "@/components/ui/Toggle";
import {
  ACCOUNT_SIZES,
  ADD_ONS,
  MODELS,
  MODEL_IDS,
  POPULAR_MODEL,
  POPULAR_SIZE,
  type AccountSize,
  type AddOnId,
  type ModelId,
  type RuleUnit,
} from "@/data/plans";
import { cn } from "@/lib/cn";
import { ComparisonTable, type Column } from "./ComparisonTable";

type View = "size" | "model";

export function ChallengesExplorer() {
  const [view, setView] = useState<View>("size");
  const [model, setModel] = useState<ModelId>(POPULAR_MODEL);
  const [size, setSize] = useState<AccountSize>(POPULAR_SIZE);
  const [addOns, setAddOns] = useState<AddOnId[]>([]);
  const [unit, setUnit] = useState<RuleUnit>("pct");
  const tableRef = useRef<HTMLDivElement>(null);

  const columns: Column[] =
    view === "size" ? ACCOUNT_SIZES.map((s) => ({ model, size: s })) : MODEL_IDS.map((m) => ({ model: m, size }));

  const toggleAddOn = (id: AddOnId, on: boolean) =>
    setAddOns((a) => (on ? [...a, id] : a.filter((x) => x !== id)));

  const showModel = (m: ModelId) => {
    setView("size");
    setModel(m);
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Controls */}
      <div ref={tableRef} className="scroll-mt-24">
        <div className="card flex flex-col gap-5 rounded-3xl p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                ariaLabel="Table view"
                options={[
                  { value: "size" as View, label: <span className="flex items-center gap-1.5"><LayoutGrid className="size-3.5" />By account size</span> },
                  { value: "model" as View, label: <span className="flex items-center gap-1.5"><Columns3 className="size-3.5" />Compare models</span> },
                ]}
                value={view}
                onChange={setView}
              />
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
            <AnimatePresence mode="wait" initial={false}>
              {view === "size" ? (
                <motion.div key="models" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                  <Segmented
                    pill="gradient"
                    ariaLabel="Challenge model"
                    options={MODEL_IDS.map((id) => ({
                      value: id,
                      label: (
                        <>
                          <span className="sm:hidden">{MODELS[id].shortName}</span>
                          <span className="hidden sm:inline">{MODELS[id].name}</span>
                        </>
                      ),
                    }))}
                    value={model}
                    onChange={setModel}
                  />
                </motion.div>
              ) : (
                <motion.div key="sizes" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="w-full max-w-2xl">
                  <SizePicker value={size} onChange={setSize} compact />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="rounded-2xl border border-line bg-white/[0.02] p-3.5 lg:w-[340px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Add-ons · prices update live</p>
            <div className="mt-2.5 space-y-2.5">
              {ADD_ONS.map((a) => {
                const on = addOns.includes(a.id);
                return (
                  <div key={a.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className={cn("text-[13px] font-medium", on ? "text-fg" : "text-fg/85")}>{a.label}</p>
                      <p className="truncate text-[11px] text-muted">{a.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <span className={cn("num text-xs", on ? "text-accent-1" : "text-muted")}>+{Math.round(a.pct * 100)}%</span>
                      <Switch checked={on} onChange={(v) => toggleAddOn(a.id, v)} label={a.label} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <ComparisonTable columns={columns} addOns={addOns} unit={unit} mode={view} />
        <p className="mt-3 text-center text-xs text-muted lg:hidden">Swipe the table sideways to see every plan →</p>
      </div>

      {/* Which model is right for you */}
      <section className="mt-24">
        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            1-Step vs 2-Step vs Instant: <span className="text-gradient">which is right for you?</span>
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {MODEL_IDS.map((id, i) => {
            const m = MODELS[id];
            return (
              <Reveal key={id} delay={i * 0.08}>
                <SpotlightCard className="flex h-full flex-col rounded-3xl p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{m.name}</span>
                    {id === POPULAR_MODEL && (
                      <span className="rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted">{m.tagline}</p>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-1">Best for</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg/90">{m.bestFor}</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {m.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-fg/85">
                        <Check className="size-4 text-accent-1" /> {h}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex gap-2 pt-6">
                    <Button variant="secondary" size="sm" onClick={() => showModel(id)} className="flex-1">
                      See prices
                    </Button>
                    <Button href={`/checkout?model=${id}&size=${POPULAR_SIZE}`} size="sm" className="flex-1" iconRight={<ArrowRight className="size-3.5" />}>
                      Start
                    </Button>
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
