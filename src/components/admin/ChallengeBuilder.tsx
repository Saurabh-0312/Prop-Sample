"use client";

import { useState } from "react";
import { Blocks, Check, Rocket } from "lucide-react";
import { BorderBeam } from "@/components/fx/BorderBeam";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { TEMPLATE_DEFAULTS } from "@/data/admin";
import { formatUSD } from "@/lib/format";
import { toast } from "@/lib/toast";

type Form = {
  name: string;
  profitTarget: string;
  phase2Target: string;
  dailyLoss: string;
  maxLoss: string;
  maxLossType: "static" | "trailing";
  minDays: string;
  split: string;
  prices: Record<number, string>;
};

const SIZES = [10000, 50000, 100000, 200000];

const toForm = (): Form => ({
  name: TEMPLATE_DEFAULTS.name,
  profitTarget: String(TEMPLATE_DEFAULTS.profitTarget),
  phase2Target: String(TEMPLATE_DEFAULTS.phase2Target),
  dailyLoss: String(TEMPLATE_DEFAULTS.dailyLoss),
  maxLoss: String(TEMPLATE_DEFAULTS.maxLoss),
  maxLossType: TEMPLATE_DEFAULTS.maxLossType,
  minDays: String(TEMPLATE_DEFAULTS.minDays),
  split: String(TEMPLATE_DEFAULTS.split),
  prices: Object.fromEntries(Object.entries(TEMPLATE_DEFAULTS.prices).map(([k, v]) => [k, String(v)])),
});

function validate(f: Form): Partial<Record<string, string>> {
  const e: Partial<Record<string, string>> = {};
  const n = (v: string) => Number(v);
  if (f.name.trim().length < 3) e.name = "At least 3 characters.";
  if (!(n(f.profitTarget) >= 1 && n(f.profitTarget) <= 20)) e.profitTarget = "1–20%";
  if (f.phase2Target && !(n(f.phase2Target) >= 0 && n(f.phase2Target) <= 15)) e.phase2Target = "0–15%";
  if (!(n(f.dailyLoss) >= 1 && n(f.dailyLoss) <= 10)) e.dailyLoss = "1–10%";
  if (!(n(f.maxLoss) >= 2 && n(f.maxLoss) <= 20)) e.maxLoss = "2–20%";
  else if (n(f.maxLoss) < n(f.dailyLoss)) e.maxLoss = "Must be ≥ daily loss";
  if (!(Number.isInteger(n(f.minDays)) && n(f.minDays) >= 0 && n(f.minDays) <= 30)) e.minDays = "0–30 days";
  if (!(n(f.split) >= 50 && n(f.split) <= 95)) e.split = "50–95%";
  for (const s of SIZES) if (!(n(f.prices[s]) > 0)) e[`p${s}`] = "Required";
  return e;
}

/** Edit a challenge template and see the public plan card update live. */
export function ChallengeBuilder() {
  const [f, setF] = useState<Form>(toForm);
  const [size, setSize] = useState(100000);
  const [version, setVersion] = useState(3);
  const errors = validate(f);
  const valid = Object.keys(errors).length === 0;
  const set = (patch: Partial<Form>) => setF((x) => ({ ...x, ...patch }));
  const price = Number(f.prices[size]) || 0;
  const pct = (v: string) => `${Number(v) || 0}%`;

  const rules: [string, string][] = [
    ["Profit target", Number(f.phase2Target) > 0 ? `${pct(f.profitTarget)} → ${pct(f.phase2Target)}` : pct(f.profitTarget)],
    ["Daily loss limit", `${pct(f.dailyLoss)} · ${formatUSD((size * (Number(f.dailyLoss) || 0)) / 100, 0)}`],
    ["Max loss", `${pct(f.maxLoss)} ${f.maxLossType}`],
    ["Min trading days", Number(f.minDays) ? `${f.minDays} days` : "None"],
    ["Reward share", pct(f.split)],
  ];

  return (
    <section id="builder" className="card scroll-mt-24 rounded-2xl p-5 sm:p-6" aria-label="Challenge builder">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Blocks className="size-4 text-accent-2" /> Challenge builder
          </h2>
          <p className="text-xs text-muted">Edit a template without a code deploy. Accounts already sold keep their rule snapshot.</p>
        </div>
        <span className="num rounded-full border border-line px-2.5 py-1 text-xs text-muted">Template v{version}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) {
              toast.error("Fix the highlighted fields", "The template can’t be published yet.");
              return;
            }
            setVersion((v) => v + 1);
            toast.success(`“${f.name}” v${version + 1} published`, "Live on the public site. Existing accounts keep their original rules.");
          }}
          className="space-y-4"
        >
          <Field label="Template name" htmlFor="cb-name" error={errors.name}>
            <Input id="cb-name" value={f.name} invalid={!!errors.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Phase 1 target %" htmlFor="cb-pt" error={errors.profitTarget}>
              <Input id="cb-pt" inputMode="decimal" value={f.profitTarget} invalid={!!errors.profitTarget} onChange={(e) => set({ profitTarget: e.target.value })} />
            </Field>
            <Field label="Phase 2 target %" htmlFor="cb-p2" error={errors.phase2Target}>
              <Input id="cb-p2" inputMode="decimal" value={f.phase2Target} invalid={!!errors.phase2Target} onChange={(e) => set({ phase2Target: e.target.value })} />
            </Field>
            <Field label="Daily loss %" htmlFor="cb-dl" error={errors.dailyLoss}>
              <Input id="cb-dl" inputMode="decimal" value={f.dailyLoss} invalid={!!errors.dailyLoss} onChange={(e) => set({ dailyLoss: e.target.value })} />
            </Field>
            <Field label="Max loss %" htmlFor="cb-ml" error={errors.maxLoss}>
              <Input id="cb-ml" inputMode="decimal" value={f.maxLoss} invalid={!!errors.maxLoss} onChange={(e) => set({ maxLoss: e.target.value })} />
            </Field>
            <Field label="Min days" htmlFor="cb-md" error={errors.minDays}>
              <Input id="cb-md" inputMode="numeric" value={f.minDays} invalid={!!errors.minDays} onChange={(e) => set({ minDays: e.target.value })} />
            </Field>
            <Field label="Reward share %" htmlFor="cb-sp" error={errors.split}>
              <Input id="cb-sp" inputMode="numeric" value={f.split} invalid={!!errors.split} onChange={(e) => set({ split: e.target.value })} />
            </Field>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-fg/90">Max loss type</p>
            <Segmented
              size="sm"
              ariaLabel="Max loss type"
              options={[
                { value: "static" as const, label: "Static" },
                { value: "trailing" as const, label: "Trailing" },
              ]}
              value={f.maxLossType}
              onChange={(v) => set({ maxLossType: v })}
            />
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-fg/90">Price per account size</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SIZES.map((s) => (
                <Field key={s} label={`$${s / 1000}K`} htmlFor={`cb-price-${s}`} error={errors[`p${s}`]}>
                  <Input
                    id={`cb-price-${s}`}
                    inputMode="decimal"
                    value={f.prices[s]}
                    invalid={!!errors[`p${s}`]}
                    icon={<span className="text-sm">$</span>}
                    onFocus={() => setSize(s)}
                    onChange={(e) => set({ prices: { ...f.prices, [s]: e.target.value } })}
                  />
                </Field>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" iconLeft={<Rocket className="size-4" />} disabled={!valid}>
              Publish template
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setF(toForm());
                toast.info("Template reset", "Values restored to the live version.");
              }}
            >
              Reset
            </Button>
          </div>
        </form>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Live preview · public site</p>
          <div className="relative rounded-3xl border border-transparent bg-[linear-gradient(160deg,color-mix(in_oklab,var(--accent-2)_12%,#0b111c),#090d16_65%)] p-5 sm:p-6">
            <BorderBeam duration={6} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">{f.name || "Untitled template"}</p>
                <p className="num mt-1 text-2xl font-semibold">${size.toLocaleString("en-US")} account</p>
              </div>
              <span className="rounded-full bg-gradient-brand px-2.5 py-1 text-[11px] font-semibold text-ink">Preview</span>
            </div>
            <div className="mt-4 flex gap-1.5">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`num flex-1 rounded-lg border px-2 py-1.5 text-xs transition-colors ${s === size ? "border-accent-2/50 bg-accent-2/10 text-fg" : "border-line text-muted hover:text-fg"}`}
                >
                  ${s / 1000}K
                </button>
              ))}
            </div>
            <div className="mt-5">
              <p className="text-xs text-muted">One-time fee</p>
              <NumberRoll value={price} format="usd0" className="text-[40px] font-semibold leading-none" />
            </div>
            <ul className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              {rules.map(([k, v]) => (
                <li key={k} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-muted">
                    <Check className="size-3.5 text-accent-1" /> {k}
                  </span>
                  <span className="num font-semibold capitalize">{v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl border border-line bg-white/[0.02] p-3 text-xs text-muted">
              {valid ? "Ready to publish — the public selector will show exactly this card." : "Some values are out of range — fix them to publish."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
