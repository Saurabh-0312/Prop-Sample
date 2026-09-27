"use client";

import { ArrowRight } from "lucide-react";
import { BorderBeam } from "@/components/fx/BorderBeam";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { SwapValue } from "@/components/marketing/ChallengeSelector";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/Tooltip";
import {
  MODELS,
  POPULAR_MODEL,
  POPULAR_SIZE,
  RULE_ROWS,
  getPlanPrice,
  type AccountSize,
  type AddOnId,
  type ModelId,
  type RuleUnit,
} from "@/data/plans";
import { cn } from "@/lib/cn";
import { formatSize, formatUSD } from "@/lib/format";

export type Column = { model: ModelId; size: AccountSize };

type Props = {
  columns: Column[];
  addOns: AddOnId[];
  unit: RuleUnit;
  mode: "size" | "model";
};

/**
 * Full rules × plans table. Header row (plan, price, CTA) sticks under the navbar on desktop;
 * on mobile the table scrolls horizontally inside its card with the rule names pinned left.
 */
export function ComparisonTable({ columns, addOns, unit, mode }: Props) {
  const isPopular = (c: Column) => (mode === "size" ? c.size === POPULAR_SIZE : c.model === POPULAR_MODEL);

  return (
    <div className="card rounded-3xl p-0">
      <div className="overflow-x-auto rounded-3xl lg:overflow-visible">
        <table className="cmp-table w-full min-w-[960px] table-fixed border-separate border-spacing-0 text-sm lg:min-w-0">
          <colgroup>
            <col style={{ width: 196 }} />
            {columns.map((c) => (
              <col key={`${c.model}-${c.size}`} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-30 rounded-tl-3xl border-b border-line bg-[#0b101a] px-5 py-5 text-left align-bottom lg:top-[var(--nav-h)] lg:z-40"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {mode === "size" ? "Account size" : "Model"}
                </span>
              </th>
              {columns.map((c, i) => {
                const price = getPlanPrice(c.model, c.size, addOns);
                const popular = isPopular(c);
                const last = i === columns.length - 1;
                return (
                  <th
                    key={`${c.model}-${c.size}`}
                    scope="col"
                    data-col={i + 1}
                    className={cn(
                      "relative border-b border-line bg-[#0b101a] px-2 py-5 text-center align-top font-normal transition-colors lg:sticky lg:top-[var(--nav-h)] lg:z-20",
                      last && "rounded-tr-3xl",
                      popular && "bg-[linear-gradient(180deg,color-mix(in_oklab,var(--accent-2)_12%,#0b101a),#0b101a)]",
                    )}
                  >
                    {popular && (
                      <span className="absolute inset-x-1.5 inset-y-1.5 rounded-2xl">
                        <BorderBeam duration={5} />
                      </span>
                    )}
                    <div className="relative flex flex-col items-center gap-1.5">
                      <span className="h-5">
                        {popular && (
                          <span className="rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink">
                            Most popular
                          </span>
                        )}
                      </span>
                      <span className="num text-lg font-semibold text-fg">
                        {mode === "size" ? formatSize(c.size) : MODELS[c.model].shortName}
                      </span>
                      <span className="flex items-baseline gap-1.5">
                        <NumberRoll value={price.price} format="usd0" className="text-[22px] font-semibold text-fg" />
                        {price.compareAt !== null && (
                          <span className="num text-xs text-muted line-through decoration-loss/70">
                            {formatUSD(price.compareAt, 0)}
                          </span>
                        )}
                      </span>
                      <Button
                        href={`/checkout?model=${c.model}&size=${c.size}${addOns.length ? `&addons=${addOns.join(",")}` : ""}`}
                        size="sm"
                        variant={popular ? "primary" : "secondary"}
                        className="mt-1 w-full max-w-[128px]"
                        iconRight={<ArrowRight className="size-3.5" />}
                      >
                        Start
                      </Button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {RULE_ROWS.map((row, ri) => {
              const lastRow = ri === RULE_ROWS.length - 1;
              return (
                <tr key={row.id}>
                  <th
                    scope="row"
                    className={cn(
                      "sticky left-0 z-10 whitespace-nowrap border-b border-line bg-[#0b101a] px-5 py-3.5 text-left font-normal",
                      lastRow && "rounded-bl-3xl border-b-0",
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-[13.5px] text-muted">
                      {row.label}
                      <InfoTip content={row.tooltip} label={`What is ${row.label}?`} />
                    </span>
                  </th>
                  {columns.map((c, i) => {
                    const sub = row.sub?.(c.model);
                    const popular = isPopular(c);
                    return (
                      <td
                        key={`${c.model}-${c.size}`}
                        data-col={i + 1}
                        className={cn(
                          "border-b border-line px-2 py-3.5 text-center transition-colors",
                          lastRow && "border-b-0",
                          lastRow && i === columns.length - 1 && "rounded-br-3xl",
                          popular && "bg-accent-2/[0.035]",
                        )}
                      >
                        <span className="flex flex-col items-center">
                          <SwapValue wrap value={row.value(c.model, c.size, addOns, unit)} className="num justify-center font-semibold text-fg" />
                          {sub && row.id !== "share" && row.id !== "target" && (
                            <span className="text-[11px] text-muted">{sub}</span>
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
